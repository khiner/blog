#!/bin/bash
set -e
npm run build

# Activity data stays outside the site's rsync --delete destination.
ssh -p 7822 root@karlhiner.com 'mkdir -p /opt/blog-activity /srv/blog-activity'
scp -P 7822 scripts/update_github_activity.py root@karlhiner.com:/opt/blog-activity/
scp -P 7822 scripts/github-activity-apache.conf root@karlhiner.com:/etc/apache2/conf-available/blog-activity.conf
scp -P 7822 scripts/github-activity.cron root@karlhiner.com:/etc/cron.d/blog-activity
ssh -p 7822 root@karlhiner.com 'set -e
  test -s /etc/blog-activity/github-token
  chmod 644 /etc/cron.d/blog-activity
  a2enconf blog-activity
  apache2ctl configtest
  systemctl reload apache2
  if ! test -s /srv/blog-activity/activity.json; then
    /usr/bin/flock /run/blog-activity.lock python3 /opt/blog-activity/update_github_activity.py \
      --token-file /etc/blog-activity/github-token --output /srv/blog-activity/activity.json
  fi'

# MeshEditor/ holds render data published by scripts/deploy_render_data.sh.
rsync -az --partial --delete --exclude 'MeshEditor/' -e 'ssh -p 7822' \
  build/ root@karlhiner.com:/var/www/html/
