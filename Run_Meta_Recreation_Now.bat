@echo off
title 🎬 Run Meta Master Plan 3D Reference Recreation
cd /d "d:\New folder (2)"

echo ========================================================
echo 🎬 3D REFERENCE RECREATION: META MASTER PLAN (0 to 10)
echo ========================================================
echo.

echo [1/3] Synthesizing Voiceover and Exact Timeline Beats...
python scripts\generate_meta_voiceover.py
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Voiceover generation failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Rendering 982-frame 3D Drone Flight in Blender EEVEE Next...
"D:\Programs\blender\blender-4.3.0-windows-x64\blender.exe" -b -P blender_engine\scripts\render_meta_reference_episode.py
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Blender 3D rendering failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Compositing Kinetic ASS Subtitles and Sci-Fi Ambient Mix...
node scripts\composite_meta_short.js
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Compositing failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ========================================================
echo 🎉 3D REFERENCE VIDEO 100%% COMPLETE!
echo Deliverable: d:\New folder (2)\out\meta_master_plan_final.mp4
echo ========================================================
pause

