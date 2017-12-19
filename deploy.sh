#!/bin/bash
tar -czf build.tar.gz build
scp -P 21098 build.tar.gz karlerbd@server144.web-hosting.com:public_html/
ssh -p 21098 karlerbd@server144.web-hosting.com "cd public_html && tar -xvzf build.tar.gz && rsync -a build/ ./ && rm -r build/ build.tar.gz"
rm build.tar.gz
