@echo off
cd /d C:\Projects\maxwell-tech-hub
git rm -f deploy.bat 2>nul
git rm -f fix.bat 2>nul
git commit -m "cleanup: remove temp scripts"
git push origin main
