# Aki Dev Hybrid Setup

Render serves the original Aki Dev interface and OAuth. Windows Local Agent runs Discord Gateway, prefix commands, moderation, Anti-Nuke monitoring, ticket actions and JSON backups. Agent uses outbound HTTPS only; no PC port is exposed.

In hybrid mode, leave DATABASE_URL and DISCORD_TOKEN unset on Render. Without PostgreSQL, web sessions are memory-only and may require re-login after a restart.

Render environment: NODE_ENV=production, APP_NAME=Aki Dev, SITE_URL, DISCORD_CLIENT_ID, a newly rotated DISCORD_CLIENT_SECRET, SESSION_ENCRYPTION_KEY, AKI_AGENT_TOKEN, TRUST_PROXY=1. OAuth callback: SITE_URL/auth/discord/callback.

Windows: use the existing aki-control-hybrid-v3 folder that already runs on your PC. Change AKI_CONTROL_URL to the new Render URL and keep AKI_AGENT_TOKEN identical to Render. Keep DISCORD_TOKEN only in agent/.env. Enable Message Content Intent and Server Members Intent as required.

Current remote actions: ping, scan server, JSON backup/list, Anti-Nuke monitor config/status, additive server setup preview/apply and ticket panel creation. Anti-Nuke is alert-only; full restore, emergency lockdown and staff analytics are not yet implemented.