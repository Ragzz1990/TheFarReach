# The Far Reach — Cloudflare Workers Static Assets build

Deploy command:
`npx wrangler deploy`

Build command:
leave blank.

Cloudflare serves the `public/` directory as a true multi-page website.

Routes:
- `/` biometric access
- `/home/`
- `/play/`
- `/rules/`
- `/characters/`
- `/careers/`
- `/galaxy/`
- `/shipyard/`
- `/stores/`
- `/underworld/`
- `/law/`
- `/gm/`

`wrangler.jsonc` uses a Worker entrypoint with an `ASSETS` binding to serve `./public` and handle private server-side API routes.

## GM NPC AI

The GM console remains usable in deterministic local simulation mode without an API key. To enable AI dialogue, configure the Worker secret (never a public environment variable):

`npx wrangler secret put OPENAI_API_KEY`

The server defaults to `gpt-5.4-mini`. Set the optional server-side `OPENAI_MODEL` Worker variable to change the model without editing the frontend. The browser never receives either the secret or direct OpenAI access.
