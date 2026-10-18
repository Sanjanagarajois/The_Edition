import Parser from 'rss-parser';

const parser = new Parser({ timeout: 8000 });
const topics = {
  technology: ['BBC Technology', 'https://feeds.bbci.co.uk/news/technology/rss.xml'],
  science: ['BBC Science', 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml'],
  business: ['BBC Business', 'https://feeds.bbci.co.uk/news/business/rss.xml'],
  sport: ['BBC Sport', 'https://feeds.bbci.co.uk/sport/rss.xml'],
  culture: ['BBC Culture', 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml'],
  politics: ['BBC Politics', 'https://feeds.bbci.co.uk/news/politics/rss.xml'],
  health: ['The Guardian', 'https://www.theguardian.com/society/health/rss'],
  climate: ['The Guardian', 'https://www.theguardian.com/environment/rss'],
  food: ['The Guardian', 'https://www.theguardian.com/food/rss'],
  travel: ['The Guardian', 'https://www.theguardian.com/travel/rss'],
};
const headlineFeed = ['BBC News', 'https://feeds.bbci.co.uk/news/rss.xml'];
let cache = null;
let cachedAt = 0;
const CACHE_MS = 60_000;

function clean(item, source, topic) {
  const url = item.link || item.guid || '';
  if (!item.title || !/^https?:\/\//i.test(url)) return null;
  return {
    id: url.split('#')[0], title: item.title.trim(), url,
    source, topic,
    summary: (item.contentSnippet || item.summary || '').replace(/\s+/g, ' ').slice(0, 280),
    publishedAt: item.isoDate || item.pubDate || null,
    image: item.enclosure?.url || item['media:content']?.url || null,
  };
}

async function readFeed([source, url], topic, limit = 8) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.slice(0, limit).map(item => clean(item, source, topic)).filter(Boolean);
  } catch (error) {
    console.error(`Feed unavailable (${source}): ${error.message}`);
    return [];
  }
}

export async function getNews(force = false) {
  if (!force && cache && Date.now() - cachedAt < CACHE_MS) return cache;
  const [headlines, ...feeds] = await Promise.all([
    readFeed(headlineFeed, 'headlines', 8),
    ...Object.entries(topics).map(([topic, feed]) => readFeed(feed, topic, 8)),
  ]);
  const unique = stories => {
    const seen = new Set();
    return stories.filter(story => {
      const key = story.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      if (seen.has(key) || seen.has(story.id)) return false;
      seen.add(key); seen.add(story.id); return true;
    });
  };
  const front = unique(headlines);
  const frontIds = new Set(front.map(story => story.id));
  const desk = Object.fromEntries(Object.keys(topics).map((topic, i) => [
    topic, unique(feeds[i]).filter(story => !frontIds.has(story.id)),
  ]));
  cache = { updatedAt: new Date().toISOString(), headlines: front, desk };
  cachedAt = Date.now();
  return cache;
}

export const hasStories = wire =>
  wire.headlines.length > 0 || Object.values(wire.desk).some(list => list.length);
