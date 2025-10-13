pushd %~dp0
call npm install
node app.js %*
pause
popd
