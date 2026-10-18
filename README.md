# Edition — Personalized News

A simplified version of the original `whats_in_the_news_` project. It keeps the main user-facing features while removing the authentication, database, generated scaffolding, and deployment-specific infrastructure.

## Features

- General headlines separated from the personalized feed
- Ten selectable topics
- RSS feeds from BBC News, BBC Sport, and The Guardian
- Topic preferences saved in the browser
- Automatic refresh every minute, with a server-side 60-second cache
- Optional browser notifications for newly detected stories in selected topics
- Responsive editorial-style interface
- No API key or database required

## Requirements

Install Node.js 20.19+ or 22.12+ from https://nodejs.org/ . See the official [Vite guide](https://vite.dev/guide/) for runtime requirements.

## Run locally

1. Extract this folder and open it in VS Code.
2. Open a terminal in the project folder.
3. Install packages:

   ```bash
   npm install
   ```

4. Start frontend and backend together:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:5173**.

The API runs at **http://localhost:8000/api/news**. Both processes run in the same terminal; press `Ctrl+C` to stop them.

## Useful commands

```bash
npm run dev      # Start frontend and API
npm run build    # Build the frontend for production
npm run preview  # Preview the production frontend
```

## Notes

- News is fetched from public RSS feeds; this version does not require a news API key.
- RSS feeds can be unavailable or change their formats. If all sources fail, try again later.
- Refreshing the browser more frequently than once per minute won't force the upstream feeds to update unless you use the Refresh button. The server cache is shared across visitors.
- Browser notifications work only when permission is granted and the site is served from localhost or HTTPS. The browser must be open; these are not background mobile push notifications.
- RSS availability, freshness, attribution, and reuse permissions are controlled by the source publishers. Review their terms before public/commercial deployment.
- User preferences live in that browser's local storage. There are no accounts or cloud sync.
