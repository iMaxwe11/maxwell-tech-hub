@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "feat: real-time service status monitor with 24+ services, response time tracking, auto-refresh dashboard"
git push origin main
del "%~f0"
