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

- Frontend: deploy the repository root to Vercel with build command `npm run build` and output directory `dist`. Set `VITE_API_URL` to the deployed backend base URL (no trailing slash).
- Backend: deploy this repository as a Node web service on Render. Build command: `npm install`; start command: `npm run server`. Set `FRONTEND_URL` to your Vercel URL. Render supplies `PORT` automatically.

The backend endpoint is `/api/news`. RSS freshness and availability depend on the publishers.
