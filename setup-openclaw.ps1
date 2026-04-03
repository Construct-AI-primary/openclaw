Write-Host "=== OpenClaw + Paperclip Setup ===" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Installing OpenClaw..." -ForegroundColor Yellow
npm install -g openclaw@latest

Write-Host ""
Write-Host "Step 2: Setting API Key..." -ForegroundColor Yellow
$env:OPENROUTER_API_KEY = "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"
Write-Host "API Key set successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Configuring OpenClaw..." -ForegroundColor Yellow
openclaw config set gateway.mode local
openclaw config set agents.defaults.model.primary "openrouter/xai/grok-code-fast-1"

Write-Host ""
Write-Host "Step 4: Setup Complete!" -ForegroundColor Green
Write-Host "Now run this command in a NEW terminal window:" -ForegroundColor Cyan
Write-Host "openclaw gateway run --port 3001" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host
