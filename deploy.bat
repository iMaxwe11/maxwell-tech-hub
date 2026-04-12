@echo off
cd /d C:\Projects\maxwell-tech-hub
git add -A
git commit -m "Arcade expansion: hub page, Neon Pong, Memory Matrix, Reaction Time, Type Racer"
git push origin main
del "%~f0"
