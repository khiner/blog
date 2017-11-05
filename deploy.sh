#!/bin/bash
tar -czf app.tar.gz app
scp -P 21098 app.tar.gz karlerbd@server144.web-hosting.com:public_html/
ssh -p 21098 karlerbd@server144.web-hosting.com "cd public_html && tar -xvzf app.tar.gz && rsync -a app/ ./ && rm -r app/ app.tar.gz"
rm app.tar.gz
