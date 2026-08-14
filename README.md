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

`wrangler.jsonc` uses Workers Static Assets with `assets.directory: ./public`.
