@echo off
echo Waiting for 3 seconds...
timeout /t 3 /nobreak > nul
echo Continuing...
cd "C:\Users\Ant\Documents\unfoundimgbot"
echo Starting status message...
node statusMessage.js
pause
