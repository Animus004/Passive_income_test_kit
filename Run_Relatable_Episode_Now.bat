@echo off
title Phase 2 Autonomous 3D Comedy - Live Cook & Publish
echo =======================================================
echo 🎬 Phase 2 Autonomous Engine: Live Episode Generation
echo Channel 1: YouTube Shorts (Global English)
echo Channel 2: Instagram & Facebook Reels (India Hinglish)
echo =======================================================
echo.
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
cd /d "%~dp0"
node scripts/run_relatable_autonomous.js --lang all --publish
echo.
echo =======================================================
echo ✅ Episode finished and published!
echo =======================================================
pause
