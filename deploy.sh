#!/bin/bash
tar -czf app.tar.gz app
ftp -n ftp://karlerbd:$PORTFOLIO_PASSWORD@server144.web-hosting.com <<End-Of-Session
lcd /Users/khiner/web/bootstrap/portfolio
cd /public_html
prompt n
put app.tar.gz app.tar.gz
exit
End-Of-Session
rm app.tar.gz
