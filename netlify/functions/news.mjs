import { getNews, hasStories } from '../../lib/news.js';

export default async (req) => {
  try {
    const fresh = new URL(req.url).searchParams.get('fresh') === '1';
    const wire = await getNews(fresh);
    if (!hasStories(wire)) {
      return Response.json({ error: 'News feeds are temporarily unavailable.' }, { status: 502 });
    }
    return Response.json(wire, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Could not retrieve news feeds.' }, { status: 502 });
  }
};

export const config = { path: '/api/news' };
