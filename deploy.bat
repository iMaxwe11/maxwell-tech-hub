@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "feat: projects live demos, 5 fun tools, arcade cabinet overhaul"
git push origin main
del "%~f0"
