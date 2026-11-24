@echo off
chcp 65001 >nul
title Run Phase 1 Oddly Told Episode Now
echo ======================================================================
echo 🚀 Generating & Publishing Phase 1 2D Vector Explainer Short Now...
echo ======================================================================
cd /d "%~dp0"
node scripts/run_oddly_autonomous.js
echo.
pause
