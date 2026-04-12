@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "Round 4: Fix PeopleInSpace proxy, weather radar overlays, playable arcade cabinet, game overhauls, news page with videos"
git push origin main
del "%~f0"
