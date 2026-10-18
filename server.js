import express from 'express';
import { getNews, hasStories } from './lib/news.js';

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
const PORT = process.env.PORT || 8000;

app.get('/api/news', async (req, res) => {
  try {
    const wire = await getNews(req.query.fresh === '1');
    if (!hasStories(wire)) {
      return res.status(502).json({ error: 'News feeds are temporarily unavailable.' });
    }
    res.set('Cache-Control', 'no-store').json(wire);
  } catch (error) {
    console.error(error);
    res.status(502).json({ error: 'Could not retrieve news feeds.' });
  }
});

app.listen(PORT, () => console.log(`News API running at http://localhost:${PORT}`));
