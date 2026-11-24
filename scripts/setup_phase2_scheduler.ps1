# PowerShell script to register daily autonomous 2x/day cadence for Phase 2 3D Comedy Shorts in Windows Task Scheduler
# Optimized Cadence:
# 1. Morning Slot: Daily at 08:00 AM IST ("The Commute & The Grind" on Mon-Fri / "Wild Weekend Adventure" on Sat-Sun)
# 2. Evening Slot: Daily at 07:00 PM IST ("Late Night Sanctuary" on Mon-Fri / "Wild Weekend Adventure" on Sat-Sun)

$ProjectDir = "D:\New folder (2)"
$LogPath = "$ProjectDir\automation_phase2.log"
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c chcp 65001 >nul && set PYTHONIOENCODING=utf-8 && cd /d `"$ProjectDir`" && node scripts/run_relatable_autonomous.js --lang en --publish >> `"$LogPath`" 2>&1" -WorkingDirectory $ProjectDir

# Clean up any old Phase 2 scheduled tasks
Unregister-ScheduledTask -TaskName "Phase2_RelatableComedy_0200PM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase2_RelatableComedy_Morning_0800AM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase2_RelatableComedy_Evening_0700PM" -Confirm:$false -ErrorAction SilentlyContinue

$TriggerMorning = New-ScheduledTaskTrigger -Daily -At "08:00AM"
$TriggerEvening = New-ScheduledTaskTrigger -Daily -At "07:00PM"

Register-ScheduledTask -TaskName "Phase2_RelatableComedy_Morning_0800AM" -Action $Action -Trigger $TriggerMorning -Description "Phase 2 3D Relatable Comedy Short Generator (Morning Slot)" -Force
Register-ScheduledTask -TaskName "Phase2_RelatableComedy_Evening_0700PM" -Action $Action -Trigger $TriggerEvening -Description "Phase 2 3D Relatable Comedy Short Generator (Evening Slot)" -Force

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "✅ PHASE 2 AUTONOMOUS 2x/DAY SCHEDULE REGISTERED:" -ForegroundColor Green
Write-Host "   Slot 1: Morning 08:00 AM IST (Commute & Grind / Weekend Adventure)" -ForegroundColor Cyan
Write-Host "   Slot 2: Evening 07:00 PM IST (Late Night Sanctuary / Weekend Adventure)" -ForegroundColor Cyan
Write-Host "   Action: node scripts/run_relatable_autonomous.js --lang en --publish" -ForegroundColor Yellow
Write-Host "   Log: $LogPath" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Green
