@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "feat: launch schedule, news feed, crypto fix, people in space widget"
git push origin main
del "%~f0"
