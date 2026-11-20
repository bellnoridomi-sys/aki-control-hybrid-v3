# Aki Dev — Original UI + Windows Local Agent

This repository preserves the original Aki Dev website, dashboard pages, styles, utility modules and migrations. It adds a Windows Local Agent so Discord Gateway and bot operations run on the owner's PC while Render hosts the remote-control dashboard.

## Architecture
- Render: original Aki Dev interface, Discord OAuth and authenticated control queue.
- Windows: Discord Gateway, prefix commands, moderation, Anti-Nuke monitoring, ticket actions and JSON backups.
- Discord Bot Token remains in `agent/.env`; it is never sent to Render.
- In hybrid mode leave `DATABASE_URL` and `DISCORD_TOKEN` unset on Render. Sessions are memory-only and may require a new Discord login after a web restart.
- Agent uses outbound HTTPS polling only; no inbound PC port is exposed.

## Render
Build: `npm install --no-audit --no-fund`
Start: `npm start`
Health: `/health`

Configure `NODE_ENV=production`, `APP_NAME=Aki Dev`, `SITE_URL`, `DISCORD_CLIENT_ID`, a newly rotated `DISCORD_CLIENT_SECRET`, `SESSION_ENCRYPTION_KEY`, `AKI_AGENT_TOKEN`, and `TRUST_PROXY=1`.

Discord OAuth callback: `SITE_URL/auth/discord/callback`.

## Windows
1. Install Node.js 22.12+ (Node 24 is supported).
2. Run `npm install` at repository root.
3. Copy `agent/.env.example` to `agent/.env`.
4. Set `AKI_CONTROL_URL` to the Render website URL.
5. Set `AKI_AGENT_TOKEN` to the same random token configured in Render (at least 32 characters).
6. Put a newly rotated Discord Bot Token in `agent/.env` only.
7. Enable Message Content Intent in Discord Developer Portal.
8. Run `npm run agent` or `start-agent.bat`.

Remote actions currently implemented: Agent ping, guild scan, local JSON backup/list, Anti-Nuke monitor config/status, additive server builder preview/apply and ticket panel creation. Anti-Nuke detects and alerts; it does not automatically punish actors. Full restore, emergency lockdown and staff statistics remain future tasks.
