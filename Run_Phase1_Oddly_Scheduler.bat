@echo off
chcp 65001 >nul
title Phase 1 Oddly Told Windows Task Scheduler Setup
echo ======================================================================
echo 📅 Registering Phase 1 2D Vector Explainer Scheduler (4x/Day, 6h Apart)
echo ======================================================================
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup_phase1_scheduler.ps1"
echo.
pause
