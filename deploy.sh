#!/bin/bash
set -e
npm run build
# MeshEditor/ holds render data published by scripts/deploy_render_data.sh.
rsync -az --partial --delete --exclude 'MeshEditor/' -e 'ssh -p 7822' \
  build/ root@karlhiner.com:/var/www/html/
