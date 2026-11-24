@echo off
title Phase 2 Autonomous 3D Comedy Scheduler Setup
echo =======================================================
echo 🎬 Registering Phase 2 Autonomous 3D Shorts Scheduler
echo Daily Cadence: 08:00 AM IST (Morning) & 07:00 PM IST (Evening)
echo =======================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup_phase2_scheduler.ps1"
echo.
echo Setup finished! The autonomous engine is now registered in Windows Task Scheduler.
pause
