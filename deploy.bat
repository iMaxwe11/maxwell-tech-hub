@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "feat: overhaul status page with premium NOC dashboard"
git push origin main
del "%~f0"
