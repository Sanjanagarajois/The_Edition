# The Edition

A personalized news desk: general headlines plus news selected by topic. The frontend is kept in a single `main.jsx` file; `server.js` serves RSS news from BBC and The Guardian.

## Run locally

Requires Node.js 20+ (Node.js 22 recommended).

```bash
npm install
npm run dev
```

Open http://localhost:5173. The Vite development server proxies `/api` to `http://localhost:8000`.

## Deployment

The site deploys to Netlify. `npm run build` outputs the frontend to `dist`, and the news API runs as a Netlify Function (`netlify/functions/news.mjs`) served at `/api/news`. The feed logic lives in `lib/news.js` and is shared with `server.js`, which is only used for local development.

RSS freshness and availability depend on the publishers.
