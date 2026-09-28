#!/usr/bin/env python3
"""Publish authored default-branch commits for the blog's GitHub heatmap."""

import argparse
import json
import os
import re
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlparse
from urllib.request import Request, urlopen

API_ROOT = "https://api.github.com"
API_VERSION = "2026-03-10"
NEXT_LINK = re.compile(r'<([^>]+)>; rel="next"')
USERNAME = "khiner"
AUTHOR_NAME = "Karl Hiner"


def utc_date(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(timezone.utc).date().isoformat()


class GitHubAPI:
    def __init__(self, token, delay=0.2):
        self.token = token
        self.delay = delay
        self.requests = 0
        self.anonymous_requests = 0
        self.commit_cache = {}

    def headers(self, anonymous=False):
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": API_VERSION,
            "User-Agent": "khiner-blog-activity",
        }
        if not anonymous:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def request(self, url, empty_on_conflict=False, public_upstream=False, anonymous=False):
        while True:
            if urlparse(url).netloc != "api.github.com":
                raise RuntimeError("Unexpected GitHub pagination host")
            request = Request(url, headers=self.headers(anonymous))
            try:
                self.requests += 1
                if anonymous:
                    self.anonymous_requests += 1
                with urlopen(request, timeout=40) as response:
                    return json.load(response), response.headers.get("Link", ""), anonymous
            except HTTPError as error:
                if empty_on_conflict and error.code == 409:
                    return [], "", anonymous
                detail = error.read().decode("utf-8", errors="replace")
                if (
                    public_upstream
                    and not anonymous
                    and error.code == 403
                    and "forbids access via a fine-grained personal access token" in detail
                ):
                    anonymous = True
                    continue
                retry_after = error.headers.get("Retry-After")
                message = f"GitHub API returned {error.code}"
                if retry_after:
                    message += f"; retry after {retry_after}s"
                raise RuntimeError(message) from error
            except URLError as error:
                raise RuntimeError(f"GitHub API request failed: {error.reason}") from error

    def pages(self, path, params=None, empty_on_conflict=False, public_upstream=False):
        url = f"{API_ROOT}{path}"
        if params:
            url += "?" + urlencode(params)
        anonymous = False
        while url:
            items, link, anonymous = self.request(url, empty_on_conflict, public_upstream, anonymous)
            if not isinstance(items, list):
                raise RuntimeError("Expected a list from GitHub API")
            yield from items
            match = NEXT_LINK.search(link)
            url = match.group(1) if match else None
            if url:
                time.sleep(self.delay)

    def object(self, path):
        item, _, _ = self.request(f"{API_ROOT}{path}")
        time.sleep(self.delay)
        return item

    def commits(self, full_name, branch, author=None, public_upstream=False):
        key = (full_name, branch, author)
        if key not in self.commit_cache:
            params = {"sha": branch, "per_page": 100}
            if author:
                params["author"] = author
            self.commit_cache[key] = list(
                self.pages(
                    f"/repos/{full_name}/commits",
                    params,
                    empty_on_conflict=True,
                    public_upstream=public_upstream,
                )
            )
            time.sleep(self.delay)
        return self.commit_cache[key]


def day_target(commits):
    origins = sorted({urlparse(commit["html_url"]).path.rsplit("/commit/", 1)[0].lstrip("/") for commit in commits})
    if len(commits) == 1:
        return [origins[0], commits[0]["sha"]]
    if len(origins) == 1:
        # GitHub returns default-branch commits newest first, even when their dates run out of order.
        oldest, newest = commits[-1], commits[0]
        parents = oldest["parents"]
        if parents:
            return [origins[0], parents[0]["sha"], newest["sha"]]
        return [origins[0], newest["sha"]]
    return [origins]


def commits_by_day(commits):
    unique = {}
    for commit in commits:
        unique.setdefault(commit["sha"], commit)
    by_date = {}
    for commit in unique.values():
        date = utc_date(commit["commit"]["author"]["date"])
        by_date.setdefault(date, []).append(commit)
    return by_date


def commit_lane(commits, private):
    return [len(commits)] if private or not commits else [len(commits), day_target(commits)]


def authored_days(commits, private=False):
    return [[date, *commit_lane(day_commits, private)] for date, day_commits in sorted(commits_by_day(commits).items())]


def fork_days(fork_commits, upstream_commits, private=False):
    upstream = commits_by_day(upstream_commits)
    upstream_shas = {commit["sha"] for commits in upstream.values() for commit in commits}
    fork_only = commits_by_day(commit for commit in fork_commits if commit["sha"] not in upstream_shas)

    days = []
    for date in sorted(upstream.keys() | fork_only.keys()):
        lanes = [commit_lane(commits.get(date, []), private) for commits in (upstream, fork_only)]
        days.append([date, sum(lane[0] for lane in lanes), None, lanes])
    return days


def existing_publications(output):
    if not output.exists():
        return {}
    with output.open(encoding="utf-8") as stream:
        old = json.load(stream)
    return {repo["id"]: repo.get("publications", []) for repo in old.get("repositories", [])}


def public_events(api, username, existing):
    publications = {repo_id: {event["id"]: event for event in events} for repo_id, events in existing.items()}
    for event in api.pages(f"/users/{username}/events/public", {"per_page": 100}):
        if event["type"] != "PublicEvent":
            continue
        repo_id = event["repo"]["id"]
        publications.setdefault(repo_id, {})[str(event["id"])] = {
            "id": str(event["id"]),
            "date": utc_date(event["created_at"]),
        }
    return {
        repo_id: sorted(events.values(), key=lambda event: event["date"]) for repo_id, events in publications.items()
    }


def build_activity(api, username, output):
    old_publications = existing_publications(output)
    publications = public_events(api, username, old_publications)
    repositories = []
    private_count = 0
    owned = list(api.pages("/user/repos", {"per_page": 100, "affiliation": "owner"}))
    historical_emails = set()
    # GitHub's author=username filter misses commits made with unlinked old email addresses.
    for repo in owned:
        if repo["fork"]:
            continue
        commits = api.commits(repo["full_name"], repo["default_branch"])
        for commit in commits:
            author = commit["commit"]["author"]
            if not commit["author"] and author["name"].casefold() == AUTHOR_NAME.casefold():
                historical_emails.add(author["email"])

    print(f"Found {len(historical_emails)} unlinked author emails", file=sys.stderr)
    author_filters = [username, *sorted(historical_emails)]

    def authored_commits(repo, public_upstream=False):
        return [
            commit
            for author in author_filters
            for commit in api.commits(
                repo["full_name"], repo["default_branch"], author, public_upstream=public_upstream
            )
        ]

    for index, repo in enumerate(owned, start=1):
        full_name = repo["full_name"]
        source = None
        if repo["fork"]:
            fork_commits = authored_commits(repo)
            details = api.object(f"/repos/{full_name}")
            source = details.get("source") or details.get("parent")
            upstream_commits = authored_commits(source, public_upstream=True) if source else []
        else:
            commits = [
                commit
                for commit in api.commits(full_name, repo["default_branch"])
                if (commit["author"] and commit["author"]["login"].casefold() == username.casefold())
                or commit["commit"]["author"]["email"] in historical_emails
            ]
        private = repo["private"]
        days = fork_days(fork_commits, upstream_commits, private) if repo["fork"] else authored_days(commits, private)
        if repo["fork"] and not days:
            continue
        if private:
            private_count += 1
        repositories.append(
            {
                "id": f"private-{private_count}" if private else repo["id"],
                "name": "Private" if private else repo["name"],
                "url": None if private else repo["html_url"],
                "private": private,
                "fork": repo["fork"],
                "sourceName": source["full_name"] if source and not private else None,
                "createdAt": utc_date(repo["created_at"]),
                "publications": [] if private else publications.get(repo["id"], []),
                "days": days,
            }
        )
        print(
            f"[{index}/{len(owned)}] {'Private' if private else full_name}: {sum(day[1] for day in days)} commits",
            file=sys.stderr,
        )
    return {
        "version": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "username": username,
        "repositories": repositories,
    }


def publish(output, activity):
    output.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary = tempfile.mkstemp(prefix=".activity-", suffix=".json", dir=output.parent)
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            json.dump(activity, stream, separators=(",", ":"))
            stream.write("\n")
        os.chmod(temporary, 0o644)
        os.replace(temporary, output)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--token-file", type=Path)
    args = parser.parse_args()
    token = (
        args.token_file.read_text(encoding="utf-8").strip() if args.token_file else os.environ.get("GITHUB_TOKEN", "")
    )
    if not token:
        parser.error("Set GITHUB_TOKEN or provide --token-file")
    api = GitHubAPI(token)
    activity = build_activity(api, USERNAME, args.output)
    publish(args.output, activity)
    print(
        f"Published {len(activity['repositories'])} repositories using {api.requests} GitHub requests "
        f"({api.anonymous_requests} anonymous) to {args.output}"
    )


if __name__ == "__main__":
    main()
