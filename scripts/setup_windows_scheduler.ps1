# PowerShell script to register 3 daily tasks in Windows Task Scheduler
# Times: 08:30 AM (Morning), 02:00 PM (Afternoon), 07:30 PM (Evening)

$ProjectDir = "D:\New folder (2)"
$LogPath = "$ProjectDir\automation.log"
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c cd /d `"$ProjectDir`" && npm run auto-publish >> `"$LogPath`" 2>&1" -WorkingDirectory $ProjectDir

$TriggerMorning   = New-ScheduledTaskTrigger -Daily -At "08:30AM"
$TriggerAfternoon = New-ScheduledTaskTrigger -Daily -At "02:00PM"
$TriggerEvening   = New-ScheduledTaskTrigger -Daily -At "07:30PM"

Register-ScheduledTask -TaskName "YouTubeShorts_Morning"   -Action $Action -Trigger $TriggerMorning   -Description "Daily Morning YouTube Short Publisher" -Force
Register-ScheduledTask -TaskName "YouTubeShorts_Afternoon" -Action $Action -Trigger $TriggerAfternoon -Description "Daily Afternoon YouTube Short Publisher" -Force
Register-ScheduledTask -TaskName "YouTubeShorts_Evening"   -Action $Action -Trigger $TriggerEvening   -Description "Daily Evening YouTube Short Publisher" -Force

Write-Host "✅ 3 Daily Scheduled Tasks registered successfully!" -ForegroundColor Green
Write-Host "Morning:   08:30 AM" -ForegroundColor Cyan
Write-Host "Afternoon: 02:00 PM" -ForegroundColor Cyan
Write-Host "Evening:   07:30 PM" -ForegroundColor Cyan

