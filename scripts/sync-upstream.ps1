#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Automated upstream sync script with safeguards
.DESCRIPTION
    Safely syncs with upstream OpenClaw repository while preserving local changes.
    Includes Gateway status checks and comprehensive error handling.
#>

param(
    [switch]$Force,
    [switch]$DryRun
)

# Configuration
$ErrorActionPreference = "Stop"
$ScriptName = "Upstream Sync"
$LogFile = "$env:TEMP\openclaw-upstream-sync.log"

# Logging function
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

# Check if Gateway is running
function Test-GatewayRunning {
    try {
        # Try to use pnpm openclaw status if available
        $status = & pnpm openclaw status 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Gateway status check passed"
            return $true
        }
    } catch {
        Write-Log "pnpm openclaw not available, trying direct check" "WARN"
    }

    # Fallback: check for running OpenClaw processes
    $openclawProcesses = Get-Process -Name "*openclaw*" -ErrorAction SilentlyContinue
    if ($openclawProcesses) {
        Write-Log "Found running OpenClaw processes: $($openclawProcesses.Count)"
        return $true
    }

    # Check for Gateway-specific indicators
    $gatewayPort = 18789  # Default Gateway port
    $connections = Get-NetTCPConnection -LocalPort $gatewayPort -State Listen -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Log "Gateway port $gatewayPort is listening"
        return $true
    }

    Write-Log "Gateway does not appear to be running" "WARN"
    return $false
}

# Check repository state
function Test-RepositoryState {
    # Check if we're in a git repository
    if (-not (Test-Path ".git")) {
        throw "Not in a git repository"
    }

    # Check for uncommitted changes
    $status = & git status --porcelain
    if ($status) {
        Write-Log "Repository has uncommitted changes: $status" "WARN"
        if (-not $Force) {
            throw "Repository has uncommitted changes. Use -Force to override."
        }
    }

    # Check current branch
    $branch = & git branch --show-current
    if ($branch -ne "main") {
        Write-Log "Not on main branch: $branch" "WARN"
        if (-not $Force) {
            throw "Not on main branch. Use -Force to override."
        }
    }

    Write-Log "Repository state check passed"
}

# Perform the sync
function Invoke-UpstreamSync {
    Write-Log "Starting upstream sync process"

    # Fetch upstream changes
    Write-Log "Fetching upstream changes..."
    if (-not $DryRun) {
        & git fetch upstream
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to fetch upstream changes"
        }
    }

    # Check if upstream has new commits
    $upstreamCommits = & git rev-list HEAD..upstream/main --count
    if ($upstreamCommits -eq 0) {
        Write-Log "No new commits from upstream"
        return
    }

    Write-Log "Found $upstreamCommits new commits from upstream"

    # Attempt merge (safer than rebase for automation)
    Write-Log "Merging upstream changes..."
    if (-not $DryRun) {
        & git merge upstream/main --no-edit --no-ff
        if ($LASTEXITCODE -ne 0) {
            # If merge fails, abort and report
            & git merge --abort 2>$null
            throw "Merge failed - manual intervention required"
        }
    }

    # Push to origin
    Write-Log "Pushing merged changes to origin..."
    if (-not $DryRun) {
        & git push origin main
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to push to origin"
        }
    }

    Write-Log "Upstream sync completed successfully"
}

# Main execution
try {
    Write-Log "=== $ScriptName Started ==="

    # Dry run notice
    if ($DryRun) {
        Write-Log "DRY RUN MODE - No actual changes will be made" "WARN"
    }

    # Check Gateway status
    if (-not (Test-GatewayRunning)) {
        if (-not $Force) {
            Write-Log "Gateway not running - skipping sync for safety" "WARN"
            Write-Log "Use -Force to override this check"
            exit 0
        } else {
            Write-Log "Gateway check overridden with -Force" "WARN"
        }
    }

    # Check repository state
    Test-RepositoryState

    # Perform sync
    Invoke-UpstreamSync

    Write-Log "=== $ScriptName Completed Successfully ==="
    exit 0

} catch {
    Write-Log "ERROR: $($_.Exception.Message)" "ERROR"
    Write-Log "=== $ScriptName Failed ===" "ERROR"
    exit 1
}
