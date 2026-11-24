@echo off
title Generate & Preview 1 YouTube Short (GPU NVENC Limitless Engine)
echo =======================================================
echo 🎬 Rendering 1 Video Locally with NVIDIA GPU NVENC
echo Topic -> Gemini Cluster -> Syllable Sync -> GPU Mux
echo =======================================================
echo.
node scripts/autonomous_phase1_engine.js
echo.
echo ✅ Video rendered to out\final_phase1_limitless.mp4!
pause
