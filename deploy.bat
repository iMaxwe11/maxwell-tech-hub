@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "feat: space page overhaul + full weather dashboard at /weather"
git push origin main
del "%~f0"
