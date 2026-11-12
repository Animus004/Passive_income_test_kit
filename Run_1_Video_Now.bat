@echo off
title Produce & Publish 1 YouTube Short Now
echo =======================================================
echo 🚀 Running Master Pipeline (Phase 1 Engine)
echo Topic -> Script -> Audio -> Remotion -> YouTube Upload
echo =======================================================
echo.
npm run auto-publish
echo.
echo Completed! Press any key to exit.
pause >nul
