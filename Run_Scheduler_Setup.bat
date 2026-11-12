@echo off
title YouTube Shorts Scheduler Setup
echo =======================================================
echo 🤖 Registering 3 Daily YouTube Shorts Tasks
echo Schedule: 08:30 AM, 02:00 PM, 07:30 PM
echo =======================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\setup_windows_scheduler.ps1"
echo.
echo Setup finished! Press any key to exit.
pause >nul
