# PowerShell script to register 5 daily tasks in Windows Task Scheduler for Phase 1 What-If Series
# Optimized 5x Daily Cadence (~4.0 - 4.5 hrs apart):
# Slot 1: 08:30 AM IST (Morning Commute & Europe Wakeup) -> YouTube + Instagram + Facebook
# Slot 2: 01:00 PM IST (Lunchtime Break & Europe Morning) -> YouTube Exclusive
# Slot 3: 05:30 PM IST (Evening Commute & US East Wakeup) -> YouTube + Instagram + Facebook
# Slot 4: 09:30 PM IST (Prime Peak Leisure & US Midday)  -> YouTube + Instagram + Facebook
# Slot 5: 01:30 AM IST (Late Night & US Prime Afternoon) -> YouTube Exclusive

$ProjectDir = "D:\New folder (2)"
$LogPath = "$ProjectDir\whatif_automation.log"
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c cd /d `"$ProjectDir`" && node scripts/autonomous_whatif_runner.js >> `"$LogPath`" 2>&1" -WorkingDirectory $ProjectDir

# Clean up any legacy Phase 1 tasks
Unregister-ScheduledTask -TaskName "Phase1_Shorts_Slot1_0700AM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase1_Shorts_Slot2_0630PM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "WhatIf_Phase1_Slot1_0830AM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "WhatIf_Phase1_Slot2_0100PM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "WhatIf_Phase1_Slot3_0530PM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "WhatIf_Phase1_Slot4_0930PM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "WhatIf_Phase1_Slot5_0130AM" -Confirm:$false -ErrorAction SilentlyContinue

$T1 = New-ScheduledTaskTrigger -Daily -At "08:15AM"
$T2 = New-ScheduledTaskTrigger -Daily -At "12:45PM"
$T3 = New-ScheduledTaskTrigger -Daily -At "05:15PM"
$T4 = New-ScheduledTaskTrigger -Daily -At "09:15PM"
$T5 = New-ScheduledTaskTrigger -Daily -At "01:15AM"

Register-ScheduledTask -TaskName "WhatIf_Phase1_Slot1_0830AM" -Action $Action -Trigger $T1 -Description "Phase 1 What-If Series - Slot 1 (Generates 08:15 AM, Posts 08:30 AM IST: YT, FB, IG)" -Force
Register-ScheduledTask -TaskName "WhatIf_Phase1_Slot2_0100PM" -Action $Action -Trigger $T2 -Description "Phase 1 What-If Series - Slot 2 (Generates 12:45 PM, Posts 01:00 PM IST: YT Exclusive)" -Force
Register-ScheduledTask -TaskName "WhatIf_Phase1_Slot3_0530PM" -Action $Action -Trigger $T3 -Description "Phase 1 What-If Series - Slot 3 (Generates 05:15 PM, Posts 05:30 PM IST: YT, FB, IG)" -Force
Register-ScheduledTask -TaskName "WhatIf_Phase1_Slot4_0930PM" -Action $Action -Trigger $T4 -Description "Phase 1 What-If Series - Slot 4 (Generates 09:15 PM, Posts 09:30 PM IST: YT, FB, IG)" -Force
Register-ScheduledTask -TaskName "WhatIf_Phase1_Slot5_0130AM" -Action $Action -Trigger $T5 -Description "Phase 1 What-If Series - Slot 5 (Generates 01:15 AM, Posts 01:30 AM IST: YT Exclusive)" -Force

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "✅ 5x DAILY WHAT-IF SCHEDULE REGISTERED IN WINDOWS TASK SCHEDULER:" -ForegroundColor Green
Write-Host "   Slot 1: 08:15 AM generation -> 08:30 AM IST (YouTube + Instagram + Facebook)" -ForegroundColor Cyan
Write-Host "   Slot 2: 12:45 PM generation -> 01:00 PM IST (YouTube Exclusive)" -ForegroundColor Cyan
Write-Host "   Slot 3: 05:15 PM generation -> 05:30 PM IST (YouTube + Instagram + Facebook)" -ForegroundColor Cyan
Write-Host "   Slot 4: 09:15 PM generation -> 09:30 PM IST (YouTube + Instagram + Facebook)" -ForegroundColor Cyan
Write-Host "   Slot 5: 01:15 AM generation -> 01:30 AM IST (YouTube Exclusive)" -ForegroundColor Cyan
Write-Host "   Cadence: ~4.0 - 4.5 hours spacing between slots" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Green
