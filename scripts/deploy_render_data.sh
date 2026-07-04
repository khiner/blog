#!/bin/bash
# Publishes MeshEditor render media, grid thumbnails, and a generated manifest to the
# server, where the /MeshEditor/render page reads them from /MeshEditor/render-data/.
# This is the publish step MeshEditor CI will eventually run. Requires ffmpeg.
#
# Usage: scripts/deploy_render_data.sh [render-dir]  (default: ../MeshEditor/render)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOURCE_DIR="${1:-$SCRIPT_DIR/../../MeshEditor/render}"
STAGING_DIR="$SCRIPT_DIR/../node_modules/.cache/render-thumbs"
REMOTE="root@karlhiner.com"
PORT=7822
REMOTE_DIR="/var/www/html/MeshEditor/render-data"

node "$SCRIPT_DIR/generate_render_thumbs.mjs" "$SOURCE_DIR" "$STAGING_DIR"

MANIFEST="$(mktemp -d)/manifest.json"
node "$SCRIPT_DIR/render_manifest.mjs" "$SOURCE_DIR" "$STAGING_DIR/dims.json" > "$MANIFEST"

ssh -p "$PORT" "$REMOTE" "mkdir -p $REMOTE_DIR"

# The server drops long transfers occasionally. rsync resumes, so retry.
sync_with_retries() {
  local attempts=0
  until rsync -r --partial --delete -e "ssh -p $PORT" "$@"; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 30 ]; then
      echo "rsync failed after $attempts resumes, giving up" >&2
      exit 1
    fi
    echo "rsync interrupted, resuming (attempt $attempts)" >&2
    sleep 3
  done
}

# Full-size media. The thumb exclude keeps --delete from pruning deployed thumbnails.
sync_with_retries \
  --include='*/' --exclude='*.thumb.jpg' --include='*.webp' --include='*.mp4' --exclude='*' \
  "$SOURCE_DIR/" "$REMOTE:$REMOTE_DIR/"

# Thumbnails from staging.
sync_with_retries \
  --include='*/' --include='*.thumb.jpg' --exclude='*' \
  "$STAGING_DIR/" "$REMOTE:$REMOTE_DIR/"

scp -P "$PORT" "$MANIFEST" "$REMOTE:$REMOTE_DIR/manifest.json"

# Renders only change on publish, so let browsers cache them for a week. The manifest
# must revalidate so a publish shows up immediately.
ssh -p "$PORT" "$REMOTE" "cat > $REMOTE_DIR/.htaccess" <<'EOF'
<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=604800"
  <Files "manifest.json">
    Header set Cache-Control "no-cache"
  </Files>
</IfModule>
EOF
