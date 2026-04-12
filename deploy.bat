@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "Site upgrade: visual polish, SEO, Space page, 404, loading skeleton"
git push origin main
del "%~f0"
