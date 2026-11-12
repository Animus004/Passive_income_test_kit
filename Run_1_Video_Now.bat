@echo off
title Generate & Preview 1 YouTube Short (Local Render Only)
echo =======================================================
echo 🎬 Rendering 1 Video Locally (NO Auto-Upload)
echo Topic -> Dynamic Script -> Audio -> Remotion Render
echo =======================================================
echo.
npm run build:daily
echo.
echo Video rendered to out\ folder!
pause
