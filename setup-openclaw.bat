@echo off
echo === OpenClaw + Paperclip Setup ===
echo.
echo Step 1: Installing OpenClaw...
npm install -g openclaw@latest
echo.
echo Step 2: Setting API Key...
set OPENROUTER_API_KEY=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
echo.
echo Step 3: Configuring OpenClaw...
openclaw config set gateway.mode local
openclaw config set agents.defaults.model.primary "openrouter/xai/grok-code-fast-1"
echo.
echo Step 4: Starting OpenClaw Gateway...
echo Run this command in a new terminal:
echo openclaw gateway run --port 3001
echo.
echo Setup complete! Now run the gateway command above.
pause
