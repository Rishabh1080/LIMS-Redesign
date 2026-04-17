# Figma Desktop Bridge — MCP Setup Log

## What We Did

### 1. Diagnosed why Figma MCP was broken
- `~/.claude/settings.json` had no MCP config at all — it was wiped at some point
- The package `figma-desktop-bridge` doesn't exist on npm; the real package is `figma-console-mcp`
- A local clone of the repo was already on disk at `~/Desktop/figma-console-mcp-main`, but it had never been built (no `dist/` folder)

### 2. Identified the correct port
- Figma Desktop Bridge runs a WebSocket server inside the Figma desktop app
- Found it by running: `lsof -iTCP -sTCP:LISTEN -P | grep figma`
- Confirmed the correct port (**9223**) by testing the WebSocket handshake:
  ```
  curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" ... http://localhost:9223
  ```
  Response: `{"type":"SERVER_HELLO","data":{"port":9223,"serverVersion":"1.22.3",...}}`

### 3. Figured out where MCP config goes
- `mcpServers` does NOT belong in `~/.claude/settings.json` (schema rejects it)
- Correct location: `~/.mcp.json` (global, picked up by Claude Code on startup)

### 4. Created `~/.mcp.json`
```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["/Users/rishabhbs/Desktop/figma-console-mcp-main/dist/local.js"],
      "env": {
        "FIGMA_BRIDGE_PORT": "9223"
      }
    }
  }
}
```

### 5. Built the package
```bash
cd ~/Desktop/figma-console-mcp-main
npm install
npm run build
```
- `build:local` (tsc → `dist/local.js`) succeeded ✓
- `build:cloudflare` failed with TS errors — irrelevant, only local build is needed

### 6. Confirmed connection
After restarting Claude Code, the `mcp__figma__*` tools appeared — 50+ tools including `figma_execute`, `figma_get_selection`, `figma_take_screenshot`, etc.

---

## How to Reconnect in Future Sessions

1. Open your Figma file
2. Plugins → **Figma Desktop Bridge** → Run
3. Start Claude Code — it connects automatically

**If the port changes** (Figma reassigns it):
```bash
lsof -iTCP -sTCP:LISTEN -P | grep figma
```
Update `FIGMA_BRIDGE_PORT` in `~/.mcp.json`, restart Claude Code.

---

## Key Files

| File | Purpose |
|------|---------|
| `~/.mcp.json` | Global MCP server config for Claude Code |
| `~/Desktop/figma-console-mcp-main/` | Local source of the MCP server |
| `~/Desktop/figma-console-mcp-main/dist/local.js` | Built entrypoint (run by node) |
