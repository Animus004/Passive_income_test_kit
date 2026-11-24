# PowerShell script to register daily autonomous 3x/day cadence for Phase 1 2D Vector Explainer Shorts in Windows Task Scheduler
# Staggered to ensure AT LEAST 1-2 hours separation from Phase 2 (08:00 AM & 07:00 PM IST):
# 1. Slot 1: 10:00 AM IST - Morning (2 hours after Phase 2 08:00 AM)
# 2. Slot 2: 02:00 PM IST - Afternoon (6 hrs after Phase 2 08:00 AM, 5 hrs before Phase 2 07:00 PM)
# 3. Slot 3: 09:00 PM IST - Night (2 hours after Phase 2 07:00 PM)

$ProjectDir = "D:\New folder (2)"
$LogPath = "$ProjectDir\automation_phase1_oddly.log"
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c chcp 65001 >nul && set PYTHONIOENCODING=utf-8 && cd /d `"$ProjectDir`" && node scripts/run_oddly_autonomous.js >> `"$LogPath`" 2>&1" -WorkingDirectory $ProjectDir

# Clean up all legacy / old Phase 1 tasks
Unregister-ScheduledTask -TaskName "Phase1_OddlyTold_0600AM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase1_OddlyTold_1200PM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase1_OddlyTold_0600PM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase1_OddlyTold_0730PM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase1_OddlyTold_1200AM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase1_3x_1000AM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase1_3x_0200PM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase1_3x_0900PM" -Confirm:$false -ErrorAction SilentlyContinue

$Trigger1000AM = New-ScheduledTaskTrigger -Daily -At "10:00AM"
$Trigger0200PM = New-ScheduledTaskTrigger -Daily -At "02:00PM"
$Trigger0900PM = New-ScheduledTaskTrigger -Daily -At "09:00PM"

Register-ScheduledTask -TaskName "Phase1_3x_1000AM" -Action $Action -Trigger $Trigger1000AM -Description "Phase 1 2D Vector Explainer (Morning 10:00 AM Slot - 2hrs after Phase 2 8AM)" -Force
Register-ScheduledTask -TaskName "Phase1_3x_0200PM" -Action $Action -Trigger $Trigger0200PM -Description "Phase 1 2D Vector Explainer (Afternoon 02:00 PM Slot - 5hrs before Phase 2 7PM)" -Force
Register-ScheduledTask -TaskName "Phase1_3x_0900PM" -Action $Action -Trigger $Trigger0900PM -Description "Phase 1 2D Vector Explainer (Night 09:00 PM Slot - 2hrs after Phase 2 7PM)" -Force

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "✅ PHASE 1 AUTONOMOUS 3x/DAY SCHEDULE REGISTERED:" -ForegroundColor Green
Write-Host "   Slot 1: 10:00 AM IST (+2.0 hrs after Phase 2 08:00 AM)" -ForegroundColor Cyan
Write-Host "   Slot 2: 02:00 PM IST (+6.0 hrs after 8 AM, -5.0 hrs before 7 PM)" -ForegroundColor Cyan
Write-Host "   Slot 3: 09:00 PM IST (+2.0 hrs after Phase 2 07:00 PM)" -ForegroundColor Cyan
Write-Host "   Channels: YouTube (Right Turn Wrong Moves), Instagram (@right_turnworngmoves), Facebook (Right Turn Wrong Moves)" -ForegroundColor Magenta
Write-Host "   Log: $LogPath" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Green
