# Bridge display transport

The first Bridge implementation deliberately keeps player-visible state separate from GM-only form data.

`public/js/bridge-state.js` defines and validates the public display contract. The locked GM page publishes only hologram presentation, alerts, ship status, NAVCOM and planetary-approach fields. It never publishes the password, GM notes, secrets or hidden campaign state.

## Current transport

- `BroadcastChannel` provides immediate updates between `/gm/` and `/bridge/` tabs in the same browser profile.
- `localStorage` supplies the latest snapshot and a 750 ms polling fallback.
- The bridge does not need a password and contains no GM controls.
- The state model is intentionally non-persistent campaign data for tabletop display use.

This transport does not cross devices or separate browser profiles.

## Cloudflare production upgrade

For shared screens on separate devices, add a Cloudflare Durable Object keyed by a DM-created bridge session ID. The Durable Object should own the validated public bridge state and broadcast updates over WebSockets (or Server-Sent Events for player displays). The locked GM client would authenticate before writing; the public bridge would receive a read-only, short-lived display token. The existing `normalise`, `publish` and `subscribe` boundary can then be backed by that remote transport without changing the renderer or exposing GM state.
