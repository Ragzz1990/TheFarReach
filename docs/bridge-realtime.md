# Live Bridge sessions

The Bridge uses one Cloudflare Durable Object per live tabletop session. Each session owns its public bridge state, viewer presence and hibernatable WebSocket connections.

## Public routes

- `/bridge/` — public session-code join screen and full-screen player display.
- `/bridge/?session=FR-7K2Q&name=TV%20Display` — direct player join link.
- `/api/bridge/sessions/{code}/ws` — read-only viewer WebSocket.
- `/api/bridge/sessions/{code}/status` — player-safe session metadata and current state.

## Locked route

- `/gm/` — existing password gate, session creation, host controls, private notes and player-safe live preview.

## Security model

Creating a session returns a random 256-bit host token to the DM browser. Only its SHA-256 digest is stored in the Durable Object. Every state mutation and end-session request must carry the host token in an `Authorization: Bearer` header. The short public session code grants view access only. Viewer WebSockets accept ping messages and reject every mutation message with `READ_ONLY_CLIENT`.

Only the allowlisted player-display schema is accepted: display mode, hologram presentation, alert, ship status, NAVCOM, planetary approach, event and warning fields. Text is length-limited and stripped of angle brackets; numeric systems are clamped to 0–100; images must be local paths under `/images/holograms/` or `/images/planets/`. GM passwords, private notes, AI prompts and NPC secrets never enter session state.

## Lifetime and reconnects

Sessions expire six hours after the last authenticated DM state update. The Durable Object alarm broadcasts `session-ended`, closes viewers and deletes stored session data. Players reconnect with exponential backoff capped at 30 seconds. A joining or reconnecting client receives the complete current state immediately.

## Cloudflare deployment

`wrangler.jsonc` adds the `BRIDGE_SESSIONS` Durable Object binding and declares `BridgeSession` as a SQLite-backed Durable Object using Cloudflare's current `exports` lifecycle configuration.

After merge, deploy normally:

```bash
npx wrangler deploy
```

The first deployment provisions the SQLite Durable Object namespace. No API key or additional secret is required. Do not remove the `exports.BridgeSession` entry on later deployments; it is the Durable Object lifecycle source of truth.
