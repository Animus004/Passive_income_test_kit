@echo off
setlocal enabledelayedexpansion

echo ===============================================================================
echo   ANTIGRAVITY POPAPUS 3D AUTONOMOUS SHORT ENGINE (PHASE 2)
echo   Starring: Popapus AI Hero Agent (DeepMind / Aniimo Silhouette)
echo   Renderer: Portable Blender 4.3.0 EEVEE Next (GTX 1660 SUPER GPU Accelerated)
echo ===============================================================================

set BLENDER_BIN=D:\Programs\blender\blender-4.3.0-windows-x64\blender.exe

if not exist "%BLENDER_BIN%" (
    echo [ERROR] Blender binary not found at %BLENDER_BIN%
    pause
    exit /b 1
)

echo.
echo [1/4] Generating 3D Cinematic Story Directives via Gemini 2.5 Flash...
node scripts\generate_3d_script.js
if %ERRORLEVEL% neq 0 (
    echo [ERROR] 3D Story script generation failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Synthesizing Neural Voiceover and Aligning 3D Timeline Timings...
node scripts\generate_audio.js --3d
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Audio synthesis failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Directing and Rendering 3D Scene in Blender EEVEE Next (Headless GPU)...
"%BLENDER_BIN%" -b -P blender_engine\scripts\render_3d_episode.py
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Blender 3D render failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [4/4] Compositing Kinetic ASS Subtitles and Sci-Fi Ambient Mix...
node scripts\composite_3d_short.js
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Video compositing failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===============================================================================
echo   SUCCESS! 3D POPAPUS EPISODE READY FOR REVIEW:
echo   File: out\popapus_3d_final.mp4
echo ===============================================================================
echo.
pause

