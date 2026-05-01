# SitePing Integration Notes

## Current Status

SitePing is installed and integrated, but it is currently hidden from the frontend interface.

The frontend-only kill switch lives in `src/siteping.js`:

```js
const sitepingFrontendVisible = false;
```

With that value set to `false`, `initSitepingFeedbackWidget()` returns before loading `@siteping/widget`, so the floating SitePing FAB does not appear in the UI.

No SitePing code has been removed. The widget initializer, Vite dev middleware, Vercel API route, npm dependencies, and shared-storage code remain in the project.

## GOSITE Command

When the user says `GOSITE`, turn SitePing back on by changing this line in `src/siteping.js`:

```js
const sitepingFrontendVisible = true;
```

Then run:

```bash
npm run build
git add src/siteping.js siteping.md
git commit -m "Enable SitePing frontend"
git push
```

Vercel should redeploy from `main` after the push.

## How It Is Wired

- `src/main.jsx` calls `initSitepingFeedbackWidget()`.
- `src/siteping.js` owns the frontend visibility switch and lazy-loads SitePing only when enabled.
- `server/sitepingMiddleware.js` provides the shared SitePing CRUD handler and the Vite dev/preview `/api/siteping` middleware.
- `api/siteping.js` exposes `/api/siteping` as a Vercel serverless function.
- `package.json` includes `@siteping/widget` and `@siteping/adapter-localstorage`.

## Storage Modes

For local development, the Vite middleware stores feedback in:

```text
.siteping/feedbacks.json
```

That directory is ignored by Git.

For Vercel production shared feedback, the serverless function expects Redis/KV environment variables:

```bash
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

It also supports the Upstash names:

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Optional custom Redis key:

```bash
SITEPING_REDIS_KEY=siteping:lims-v3:feedbacks
```

## How To Hide It Again

Set the frontend switch back to:

```js
const sitepingFrontendVisible = false;
```

This hides the SitePing UI without deleting the integration.
