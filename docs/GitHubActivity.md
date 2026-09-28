# GitHub activity

The home page shows my commits on repos' default branches.
The overview combines included repos' daily commit counts in a single heatmap lane.
Set `--activity-row-height` in `src/style/GitHubActivity.scss` to scale the view's typography, icons, and spacing together.
Fork rows show upstream commits above fork-only commits.
Fork icons distinguish upstream contributions from fork-only commits.
Private repos appear as `Private` and are hidden until the lock filter is enabled.
The public JSON still includes their daily commit counts.

`./deploy.sh` installs the updater, daily job, and Apache mapping.
The server token must already exist at `/etc/blog-activity/github-token`.
The daily job runs `/opt/blog-activity/update_github_activity.py`.
Apache serves `/srv/blog-activity/activity.json` at `/github-activity/activity.json`.

To rerun the update on the server:

```sh
sudo python3 /opt/blog-activity/update_github_activity.py \
  --token-file /etc/blog-activity/github-token \
  --output /srv/blog-activity/activity.json
```
