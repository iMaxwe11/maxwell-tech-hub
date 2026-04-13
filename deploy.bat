@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "Round 5: Page transitions, blog with AI shorts, live space view, Easter eggs, 404 page, credits page"
git push origin main
del "%~f0"
