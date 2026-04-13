@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "fix: swap ISS live streams from YouTube to NASA IBM Video (persistent channel IDs)"
git push origin main
del "%~f0"
