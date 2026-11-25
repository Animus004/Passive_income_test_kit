# PowerShell script to register daily autonomous 1,000+ Video Factory tasks for Phase 1
# Workspace, temp Chromium caches, SQLite DB, and 7-day buffer live safely on D:\factory_workspace
# Option A Safest Cadence (Single Flagship Channel, max 3 spaced Shorts/day):
#   - 03:30 AM IST : Overnight NVENC buffer producer (tops up D:\factory_workspace\ready to 6 videos)
#   - 06:00 AM IST : Daily Analytics Sync & >7d workspace cleanup
#   - 10:00 AM IST : Slot 1 Publish (YouTube Scheduled + IG/FB Reels)
#   - 02:00 PM IST : Slot 2 Publish (YouTube Scheduled + IG/FB Reels)
#   - 09:00 PM IST : Slot 3 Publish (YouTube Scheduled + IG/FB Reels)

$ProjectDir = "D:\New folder (2)"
$WorkspaceDir = "D:\factory_workspace"
$TmpDir = "$WorkspaceDir\tmp"
$LogDir = "$WorkspaceDir\logs"
New-Item -ItemType Directory -Force -Path $TmpDir, $LogDir | Out-Null
$LogPath = "$LogDir\phase1_factory.log"

$EnvSetup = "chcp 65001 >nul && set PYTHONIOENCODING=utf-8 && set TMP=$TmpDir && set TEMP=$TmpDir && set TMPDIR=$TmpDir && cd /d `"$ProjectDir`""

$ActionProduce   = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c $EnvSetup && node --no-warnings scripts/factory_orchestrator.mjs --mode produce >> `"$LogPath`" 2>&1" -WorkingDirectory $ProjectDir
$ActionPublish   = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c $EnvSetup && node --no-warnings scripts/factory_orchestrator.mjs --mode publish --social >> `"$LogPath`" 2>&1" -WorkingDirectory $ProjectDir
$ActionAnalytics = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c $EnvSetup && node --no-warnings scripts/factory_orchestrator.mjs --mode analytics >> `"$LogPath`" 2>&1" -WorkingDirectory $ProjectDir

# Clean up all legacy Phase 1 tasks
$LegacyTasks = @(
  "Phase1_OddlyTold_0600AM", "Phase1_OddlyTold_1200PM", "Phase1_OddlyTold_0600PM",
  "Phase1_OddlyTold_0730PM", "Phase1_OddlyTold_1200AM",
  "Phase1_3x_1000AM", "Phase1_3x_0200PM", "Phase1_3x_0900PM",
  "Phase1_Factory_Buffer_0330AM", "Phase1_Factory_Analytics_0600AM",
  "Phase1_Factory_Publish_1000AM", "Phase1_Factory_Publish_0200PM", "Phase1_Factory_Publish_0900PM"
)
foreach ($t in $LegacyTasks) {
  Unregister-ScheduledTask -TaskName $t -Confirm:$false -ErrorAction SilentlyContinue
}

$TaskSettings = New-ScheduledTaskSettingsSet `
  -StartWhenAvailable `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
  -RestartCount 2 `
  -RestartInterval (New-TimeSpan -Minutes 5)

Register-ScheduledTask -TaskName "Phase1_Factory_Buffer_0330AM" -Action $ActionProduce -Trigger (New-ScheduledTaskTrigger -Daily -At "03:30AM") -Settings $TaskSettings -Description "Phase 1 Autonomous Legends & Pop-Vector Factory Buffer Producer (NVENC -> D:\factory_workspace\ready)" -Force
Register-ScheduledTask -TaskName "Phase1_Factory_Analytics_0600AM" -Action $ActionAnalytics -Trigger (New-ScheduledTaskTrigger -Daily -At "06:00AM") -Settings $TaskSettings -Description "Phase 1 Factory YouTube Analytics Feedback Sync & 7d Archive Pruner" -Force
Register-ScheduledTask -TaskName "Phase1_Factory_Publish_1000AM" -Action $ActionPublish -Trigger (New-ScheduledTaskTrigger -Daily -At "10:00AM") -Settings $TaskSettings -Description "Phase 1 Factory Publish Slot 1 (10:00 AM IST: YT + IG + FB)" -Force
Register-ScheduledTask -TaskName "Phase1_Factory_Publish_0200PM" -Action $ActionPublish -Trigger (New-ScheduledTaskTrigger -Daily -At "02:00PM") -Settings $TaskSettings -Description "Phase 1 Factory Publish Slot 2 (02:00 PM IST: YT + IG + FB)" -Force
Register-ScheduledTask -TaskName "Phase1_Factory_Publish_0900PM" -Action $ActionPublish -Trigger (New-ScheduledTaskTrigger -Daily -At "09:00PM") -Settings $TaskSettings -Description "Phase 1 Factory Publish Slot 3 (09:00 PM IST: YT + IG + FB)" -Force

Write-Host "=======================================================" -ForegroundColor Green
Write-Host "✅ PHASE 1 HANDS-OFF 1,000+ VIDEO FACTORY SCHEDULED:" -ForegroundColor Green
Write-Host "   03:30 AM IST -> Overnight NVENC Buffer Producer (D:\factory_workspace\ready)" -ForegroundColor Cyan
Write-Host "   06:00 AM IST -> Analytics Feedback Sync & 7d Cleanup" -ForegroundColor Cyan
Write-Host "   10:00 AM / 02:00 PM / 09:00 PM IST -> Spaced Option-A Publish Dispatch" -ForegroundColor Cyan
Write-Host "   Log: $LogPath" -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Green
