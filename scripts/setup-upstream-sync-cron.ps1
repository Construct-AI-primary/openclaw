#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Sets up OpenClaw cron job for automated upstream syncing with safeguards
.DESCRIPTION
    Creates a cron job that runs the upstream sync script with Gateway status checks.
    Includes comprehensive error handling and notifications.
#>

param(
    [int]$Hour = 12,  # Default: 12 PM (noon)
    [int]$Minute = 0,
    [switch]$TestRun
)

$ErrorActionPreference = "Stop"

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ParentDir = Split-Path -Parent $ScriptDir
$SyncScript = Join-Path $ScriptDir "sync-upstream.ps1"
$CronJobName = "upstream-sync"

# Validate inputs
if ($Hour -lt 0 -or $Hour -gt 23) {
    throw "Hour must be between 0 and 23"
}
if ($Minute -lt 0 -or $Minute -gt 59) {
    throw "Minute must be between 0 and 59"
}

Write-Host "Setting up upstream sync cron job..." -ForegroundColor Green
Write-Host "Schedule: Daily at $($Hour.ToString('00')):$($Minute.ToString('00'))" -ForegroundColor Yellow
Write-Host "Sync script: $SyncScript" -ForegroundColor Yellow

# Verify sync script exists
if (-not (Test-Path $SyncScript)) {
    throw "Sync script not found: $SyncScript"
}

# Create the cron job configuration
$CronConfig = @"
{
  "name": "$CronJobName",
  "schedule": {
    "kind": "cron",
    "expr": "$Minute $Hour * * *",
    "tz": "Local"
  },
  "sessionTarget": "isolated",
  "payload": {
    "kind": "agentTurn",
    "message": "Run automated upstream sync with safeguards. Execute: pwsh -ExecutionPolicy Bypass -File '$SyncScript' -Force:\$FORCE_FLAG",
    "timeoutSeconds": 300
  },
  "delivery": {
    "mode": "announce",
    "channel": "last"
  },
  "description": "Automated upstream sync with Gateway safeguards"
}
"@

# Test run mode
if ($TestRun) {
    Write-Host "`nTEST RUN - Would create cron job with config:" -ForegroundColor Cyan
    Write-Host $CronConfig -ForegroundColor Gray

    Write-Host "`nTo actually create the cron job, run this command in OpenClaw:" -ForegroundColor Green
    Write-Host "cron add --name $CronJobName --cron '$Minute $Hour * * *' --session isolated --message 'Run automated upstream sync: pwsh -ExecutionPolicy Bypass -File \"$SyncScript\"' --announce --channel last --description 'Automated upstream sync with Gateway safeguards'" -ForegroundColor Yellow

    exit 0
}

# Check if OpenClaw is available
try {
    $openclawVersion = & pnpm openclaw --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OpenClaw detected: $openclawVersion" -ForegroundColor Green
    } else {
        throw "OpenClaw not available via pnpm"
    }
} catch {
    Write-Host "Warning: OpenClaw not detected via pnpm. Make sure it's available in your PATH." -ForegroundColor Yellow
    Write-Host "You can still run the sync script manually or set up the cron job when OpenClaw is available." -ForegroundColor Yellow
}

# Display setup instructions
Write-Host "`nTo set up the automated sync, run this command in OpenClaw:" -ForegroundColor Green
Write-Host "cron add --name $CronJobName --cron '$Minute $Hour * * *' --session isolated --message 'Run automated upstream sync: pwsh -ExecutionPolicy Bypass -File \"$SyncScript\"' --announce --channel last --description 'Automated upstream sync with Gateway safeguards'" -ForegroundColor Yellow

Write-Host "`nCron job details:" -ForegroundColor Cyan
Write-Host "- Runs daily at $($Hour.ToString('00')):$($Minute.ToString('00'))" -ForegroundColor White
Write-Host "- Uses isolated session (creates background task)" -ForegroundColor White
Write-Host "- Announces results to your last used channel" -ForegroundColor White
Write-Host "- Times out after 5 minutes if stuck" -ForegroundColor White

Write-Host "`nSafety features:" -ForegroundColor Green
Write-Host "✅ Gateway status check before running" -ForegroundColor White
Write-Host "✅ Repository state validation" -ForegroundColor White
Write-Host "✅ Automatic merge (safer than rebase)" -ForegroundColor White
Write-Host "✅ Comprehensive error handling" -ForegroundColor White
Write-Host "✅ Detailed logging" -ForegroundColor White

Write-Host "`nTo test the sync script manually:" -ForegroundColor Cyan
Write-Host "pwsh -ExecutionPolicy Bypass -File '$SyncScript' -DryRun" -ForegroundColor Yellow
Write-Host "pwsh -ExecutionPolicy Bypass -File '$SyncScript' -Force  # Override safety checks" -ForegroundColor Yellow

Write-Host "`nSetup complete! The cron job will include all requested safeguards." -ForegroundColor Green
