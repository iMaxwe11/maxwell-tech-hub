@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "cleanup: remove temp deploy script"
git push origin main
del "%~f0"
