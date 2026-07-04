#!/bin/bash
npm run build
tar -czf build.tar.gz build
# Wipe the old build, but keep dotfiles (.htaccess) and MeshEditor/, which holds
# render data published separately by scripts/deploy_render_data.sh.
ssh -p 7822 root@karlhiner.com "cd /var/www/html && find . -maxdepth 1 ! -name '.*' ! -name MeshEditor -exec rm -rf {} +"
scp -P 7822 build.tar.gz root@karlhiner.com:/var/www/html/
ssh -p 7822 root@karlhiner.com "cd /var/www/html && tar -xvzf build.tar.gz && rsync -a build/ ./ && rm -r build/ build.tar.gz"
rm build.tar.gz
