# PowerShell script to register 2 daily tasks in Windows Task Scheduler for Phase 1
# Optimized 2x Daily Cadence (8–12 hrs apart):
# Slot 1: 07:00 AM IST (Morning Breakout)
# Slot 2: 06:30 PM IST (Evening Prime Peak - 11.5 hours apart)

$ProjectDir = "D:\New folder (2)"
$LogPath = "$ProjectDir\automation.log"
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c cd /d `"$ProjectDir`" && npm run auto-publish >> `"$LogPath`" 2>&1" -WorkingDirectory $ProjectDir

# Clean up all old scheduled tasks
Unregister-ScheduledTask -TaskName "YouTubeShorts_Morning" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "YouTubeShorts_Midday" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "YouTubeShorts_Afternoon" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "YouTubeShorts_Evening" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase1_Shorts_Slot1_0700AM" -Confirm:$false -ErrorAction SilentlyContinue
Unregister-ScheduledTask -TaskName "Phase1_Shorts_Slot2_0630PM" -Confirm:$false -ErrorAction SilentlyContinue

$TriggerSlot1 = New-ScheduledTaskTrigger -Daily -At "07:00AM"
$TriggerSlot2 = New-ScheduledTaskTrigger -Daily -At "06:30PM"

Register-ScheduledTask -TaskName "Phase1_Shorts_Slot1_0700AM" -Action $Action -Trigger $TriggerSlot1 -Description "Phase 1 Limitless Ink Explainer - Morning Slot (07:00 AM IST)" -Force
Register-ScheduledTask -TaskName "Phase1_Shorts_Slot2_0630PM" -Action $Action -Trigger $TriggerSlot2 -Description "Phase 1 Limitless Ink Explainer - Evening Slot (06:30 PM IST)" -Force

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "✅ 2x DAILY SCHEDULE REGISTERED (Phase 1 Sweet Spot):" -ForegroundColor Green
Write-Host "   Slot 1: 07:00 AM IST (Morning Commute & Europe Wake)" -ForegroundColor Cyan
Write-Host "   Slot 2: 06:30 PM IST (Evening Peak & US Morning)" -ForegroundColor Cyan
Write-Host "   Spacing: 11.5 hours apart" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Green
