import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

const styles = document.createElement('style');
styles.textContent = String.raw`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap');
:root{font-family:'DM Sans',Arial,sans-serif;color:#211e1a;background:#f3eee6;font-synthesis:none;text-rendering:optimizeLegibility;-webkit-font-smoothing:antialiased;font-optical-sizing:auto;font-weight:400}*{box-sizing:border-box}body{margin:0}button,a{font:inherit}button{cursor:pointer}.page{max-width:1100px;margin:auto;padding:0 26px}.masthead{text-align:center;padding:38px 0 30px;border-bottom:2px solid #211e1a}.eyebrow{display:flex;align-items:center;justify-content:center;gap:10px;font-size:11px;font-weight:700;letter-spacing:.16em;color:#a92b22}.eyebrow span:last-child{color:#716a60;letter-spacing:0}.live-dot{width:7px;height:7px;background:#b52c23;border-radius:50%;box-shadow:0 0 0 5px #b52c2318}h1{font:600 clamp(54px,8vw,82px)/.98 Newsreader,Georgia,serif;letter-spacing:-.06em;margin:18px 0 8px}h1 span{color:#b52c23}.date{font-size:12px;color:#716a60}.intro{font-size:15px;max-width:490px;margin:18px auto 0;line-height:1.6}.controls{position:sticky;top:0;z-index:5;background:#f3eee6f5;backdrop-filter:blur(12px);padding:17px 0;border-bottom:1px solid #d8d0c3}.topic-list{display:flex;flex-wrap:wrap;gap:7px}.topic,.action{border:1px solid #d8d0c3;background:#faf7f2;border-radius:30px;padding:9px 13px;font-size:12px;color:#29251f}.topic.active,.action.active{background:#211e1a;color:#fffaf3;border-color:#211e1a}.actions{display:flex;gap:8px;margin-top:12px}.action{font-weight:600}.action:disabled{opacity:.5;cursor:wait}.hint{font-size:11px;color:#716a60;margin:10px 0 0}.layout{display:grid;grid-template-columns:1.05fr .95fr;gap:42px;padding:35px 0 55px}.section-heading{border-bottom:1px solid #cfc5b7;padding-bottom:14px;margin-bottom:17px}.section-heading span{font-size:10px;letter-spacing:.15em;color:#a92b22;font-weight:700}.section-heading h2{font:600 29px/1.1 Newsreader,Georgia,serif;margin:9px 0 0}.story{display:block;text-decoration:none;color:inherit;border-bottom:1px solid #d8d0c3;padding:16px 0}.story:hover h3{color:#a92b22}.featured{padding-top:0}.story-image{width:100%;max-height:230px;object-fit:cover;margin:0 0 13px;background:#e3dacf}.story-content .meta{font-size:10px;color:#716a60;margin:0 0 8px}.story h3{font:600 22px/1.18 Newsreader,Georgia,serif;letter-spacing:-.015em;margin:0 0 8px;transition:color .15s}.featured h3{font-size:31px}.summary{font-size:12px;line-height:1.6;color:#5f584f;margin:0 0 9px}.read{font-size:10px;font-weight:700;letter-spacing:.05em;color:#a92b22}.story-list .story h3{font-size:19px}.empty,.error{font-size:13px;color:#716a60;line-height:1.6}.error{padding:12px;background:#fff0ed;color:#a92b22}footer{border-top:1px solid #d8d0c3;padding:19px 0 28px;font-size:11px;color:#716a60;display:flex;justify-content:space-between;gap:10px}footer span{ text-align:right}@media(max-width:720px){.page{padding:0 17px}.masthead{padding-top:28px}.layout{grid-template-columns:1fr;gap:38px;padding-top:27px}.controls{position:relative}.section-heading h2{font-size:27px}.featured h3{font-size:28px}footer{flex-direction:column}footer span{text-align:left}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
`;
document.head.appendChild(styles);

const TOPICS = [
  ['technology', 'Technology'], ['science', 'Science'], ['business', 'Business'],
  ['sport', 'Sport'], ['health', 'Health'], ['culture', 'Culture'],
  ['climate', 'Climate'], ['politics', 'Politics'], ['food', 'Food'], ['travel', 'Travel'],
];
const KEY = 'edition.preferences';
const DEFAULTS = ['technology', 'science'];
const POLL_MS = 60_000;

function getPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return {
      topics: Array.isArray(saved?.topics) ? saved.topics.filter(t => TOPICS.some(([id]) => id === t)) : DEFAULTS,
      alerts: Boolean(saved?.alerts && 'Notification' in window && Notification.permission === 'granted'),
    };
  } catch { return { topics: DEFAULTS, alerts: false }; }
}
function ago(date) {
  if (!date) return '';
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (!Number.isFinite(mins) || mins < 0) return '';
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
  return `${Math.floor(mins / 1440)}d ago`;
}
function StoryCard({ story, featured = false }) {
  return <a className={`story ${featured ? 'featured' : ''}`} href={story.url} target="_blank" rel="noreferrer">
    {story.image && <img className="story-image" src={story.image} alt="" loading="lazy" onError={e => { e.currentTarget.style.display = 'none'; }} />}
    <div className="story-content"><p className="meta">{story.source}{story.publishedAt ? ` · ${ago(story.publishedAt)}` : ''}</p>
      <h3>{story.title}</h3>{story.summary && <p className="summary">{story.summary}</p>}
      <span className="read">Read article ↗</span></div>
  </a>;
}

function App() {
  const [prefs, setPrefs] = useState({ topics: DEFAULTS, alerts: false });
  const [wire, setWire] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [clock, setClock] = useState(new Date());
  const seen = useRef(new Set());
  const firstLoad = useRef(true);

  useEffect(() => { setPrefs(getPrefs()); }, []);
  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const savePrefs = next => {
    setPrefs(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const load = useCallback(async (fresh = false) => {
    setBusy(true);
    try {
      const api = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${api}/api/news${fresh ? '?fresh=1' : ''}`);
      if (!response.ok) throw new Error('News feed unavailable');
      const data = await response.json();
      if (!Array.isArray(data.headlines) || !data.desk) throw new Error('Invalid news response');
      if (!firstLoad.current && data.updatedAt !== wire?.updatedAt) {
        const newStories = Object.entries(data.desk)
          .filter(([topic]) => prefs.topics.includes(topic))
          .flatMap(([, stories]) => stories)
          .filter(story => !seen.current.has(story.id) && Date.now() - new Date(story.publishedAt || 0).getTime() < 45 * 60_000);
        if (prefs.alerts && newStories.length && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(newStories[0].title, { body: `${newStories[0].source} · ${newStories.length} new story/stories`, tag: 'edition-news' });
        }
      }
      setWire(data); setError('');
      seen.current = new Set(Object.values(data.desk).flat().map(story => story.id));
      firstLoad.current = false;
    } catch { setError('Could not load news. Check your connection and try again.'); }
    finally { setBusy(false); }
  }, [prefs, wire?.updatedAt]);

  useEffect(() => { void load(); const timer = setInterval(() => void load(), POLL_MS); return () => clearInterval(timer); }, [load]);

  const personalized = useMemo(() => {
    if (!wire) return [];
    const seenIds = new Set(wire.headlines.map(story => story.id));
    return prefs.topics.flatMap(topic => wire.desk[topic] || []).filter(story => {
      if (seenIds.has(story.id)) return false;
      seenIds.add(story.id); return true;
    }).sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  }, [wire, prefs.topics]);

  const toggleTopic = topic => savePrefs({ ...prefs, topics: prefs.topics.includes(topic) ? prefs.topics.filter(t => t !== topic) : [...prefs.topics, topic] });
  async function toggleAlerts() {
    if (prefs.alerts) return savePrefs({ ...prefs, alerts: false });
    if (!('Notification' in window)) return setError('This browser does not support notifications.');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') savePrefs({ ...prefs, alerts: true });
    else setError('Allow notifications in your browser settings to enable alerts.');
  }

  const headline = wire?.headlines[0];
  return <div className="page">
    <header className="masthead"><p className="eyebrow"><span className="live-dot" /> YOUR PERSONAL NEWS DESK <span>{clock.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span></p>
      <h1>Edition<span>.</span></h1><p className="date">{clock.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      <p className="intro">The headlines everyone should know. Everything else, chosen by you.</p></header>
    <nav className="controls" aria-label="News preferences"><div className="topic-list">{TOPICS.map(([id, label]) => <button key={id} className={prefs.topics.includes(id) ? 'topic active' : 'topic'} aria-pressed={prefs.topics.includes(id)} onClick={() => toggleTopic(id)}>{label}</button>)}</div>
      <div className="actions"><button className={prefs.alerts ? 'action active' : 'action'} onClick={toggleAlerts}>{prefs.alerts ? '🔔 Alerts on' : '♧ Enable alerts'}</button><button className="action" disabled={busy} onClick={() => load(true)}>{busy ? 'Updating…' : '↻ Refresh'}</button></div>
      <p className="hint">Choose topics to personalize your feed. Preferences are saved on this device.</p></nav>
    {error && <p className="error">{error}</p>}
    <main className="layout"><section><div className="section-heading"><span>01 / THE FRONT PAGE</span><h2>Everyone should know</h2></div>
      {!wire && !error && <p>Loading headlines…</p>}{headline && <StoryCard story={headline} featured />}
      <div className="story-list">{wire?.headlines.slice(1).map(story => <StoryCard key={story.id} story={story} />)}</div>
      {wire && !wire.headlines.length && <p>No headlines available right now.</p>}</section>
      <section><div className="section-heading"><span>02 / YOUR SELECTION</span><h2>Picked for you</h2></div>
        {!prefs.topics.length && <p className="empty">Choose at least one topic above to build your personal news desk.</p>}
        {prefs.topics.length > 0 && wire && !personalized.length && <p className="empty">No stories found for these topics right now. Try another topic or refresh.</p>}
        <div className="story-list">{personalized.map(story => <StoryCard key={story.id} story={story} />)}</div>
      </section></main>
    <footer>Edition · Less noise, more of what matters. <span>News from public RSS feeds · Auto-refreshes every minute</span></footer>
  </div>;
}


createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
