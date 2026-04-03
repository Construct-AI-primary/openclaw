# OpenClaw Windows Setup Procedure

Replicable procedure for setting up OpenClaw on a Windows machine with VS Code port forwarding for external access.

## Prerequisites

- Windows 10/11
- Node.js 22+ installed
- VS Code installed
- pnpm installed (`npm install -g pnpm`)

## Step 1: Install OpenClaw

```powershell
pnpm install -g openclaw
```

Verify installation:
```powershell
openclaw --version
```

## Step 2: Configure the Gateway

### 2.1 Set the Control UI Origin Fallback

This is required to prevent the gateway from failing to start with an origin check error:

```powershell
openclaw config set gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback true
```

> **Why this is needed:** The gateway enforces origin checks for the Control UI WebSocket connections. Without this setting (or explicit `allowedOrigins`), the gateway refuses to start with:
> ```
> non-loopback Control UI requires gateway.controlUi.allowedOrigins (set explicit origins),
> or set gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback=true
> ```
>
> This is safe for local-only use since the gateway binds to loopback (`127.0.0.1`).

### 2.2 Verify Configuration

The config file is located at `%USERPROFILE%\.openclaw\openclaw.json`. It should contain:

```json
{
  "gateway": {
    "mode": "local",
    "controlUi": {
      "dangerouslyAllowHostHeaderOriginFallback": true
    },
    "auth": {
      "mode": "token",
      "token": "<your-token-here>"
    }
  }
}
```

To view the current config:
```powershell
openclaw config get gateway
```

## Step 3: Start the Gateway

```powershell
openclaw gateway run
```

Expected output:
```
[gateway] listening on ws://127.0.0.1:18789, ws://[::1]:18789
```

> **Note:** This command runs in the foreground. To run in the background, use:
> ```powershell
> Start-Process -NoNewWindow openclaw -ArgumentList "gateway", "run"
> ```

## Step 4: Verify Gateway is Running

In a separate terminal:
```powershell
openclaw status
```

Confirm the gateway shows as **reachable** (not "unreachable"):
```
Gateway: local · ws://127.0.0.1:18789 (local loopback) · reachable XXms
```

## Step 5: Set Up External Access via VS Code Port Forwarding

### 5.1 Forward the Port

1. Open VS Code
2. Open the **PORTS** tab at the bottom panel (next to Terminal/Problems)
3. Click **Forward a Port** (or the `+` icon)
4. Enter `18789` and press Enter
5. Right-click the forwarded port → **Port Visibility** → **Public**

### 5.2 Get the Forwarded URL

The forwarded URL appears in the PORTS tab under "Forwarded Address". It will look like:
```
https://<random-id>-18789.inc1.devtunnels.ms
```

### 5.3 Verify External Access

```powershell
# Without token (should return 401 Unauthorized)
curl.exe -s -o NUL -w "%{http_code}" https://<your-forwarded-url>/

# With token (should return 302 Redirect to dashboard)
curl.exe -s -o NUL -w "%{http_code}" -H "Authorization: Bearer <your-token>" https://<your-forwarded-url>/
```

## Step 6: Access the Dashboard

Open the forwarded URL in a browser:
```
https://<your-forwarded-url>/
```

When prompted for authentication, use your gateway token.

## Configuration Reference

| Setting | Value | Purpose |
|---------|-------|---------|
| `gateway.mode` | `local` | Run gateway locally |
| `gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback` | `true` | Allow Host-header origin fallback for WebSocket connections |
| `gateway.auth.mode` | `token` | Token-based authentication |
| `gateway.auth.token` | `<your-token>` | Authentication token |

## Troubleshooting

### Gateway fails to start with origin check error
**Fix:** Ensure `gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback` is set to `true`:
```powershell
openclaw config set gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback true
openclaw gateway run
```

### Gateway shows as "unreachable" in status
**Fix:** The gateway process may have stopped. Restart it:
```powershell
openclaw gateway run
```

### VS Code port forwarding URL returns 401
**Expected behavior.** Pass the token in the Authorization header or enter it in the browser when prompted.

### Config file not found
The config file is at `%USERPROFILE%\.openclaw\openclaw.json`. In PowerShell, use:
```powershell
Get-Content $env:USERPROFILE\.openclaw\openclaw.json
```

## Security Notes

- The `dangerouslyAllowHostHeaderOriginFallback` flag weakens origin checks. It's safe for local-only use but should NOT be used on publicly exposed servers without additional protections.
- The gateway token should be long and random for production use. Generate one with:
  ```powershell
  [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
  ```
- VS Code dev tunnels use HTTPS by default, providing encryption for external access.
