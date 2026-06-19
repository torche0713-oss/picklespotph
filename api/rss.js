const https = require('https');

const PROJECT_ID = 'picklespotph-8553a';
const API_KEY = 'AIzaSyC33FcO7YxNVpJE7pt8QrNfBVaQ0R6XOps';

function firestoreQuery() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'tournaments' }]
      }
    });
    const opts = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error('Parse failed')); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function docToTournament(doc) {
  const f = doc.document?.fields || {};
  const t = (v) => v?.stringValue || '';
  return {
    name: t(f.name),
    date: t(f.date),
    location: t(f.location),
    link: t(f.link),
    details: t(f.details)
  };
}

function escapeXml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

module.exports = async (req, res) => {
  try {
    const result = await firestoreQuery();
    const tournaments = Array.isArray(result) ? result.filter(r => r.document).map(docToTournament) : [];

    const now = new Date();
    const upcoming = tournaments.filter(t => {
      const d = new Date(t.date);
      return !isNaN(d.getTime()) && d >= new Date(now.toISOString().split('T')[0]);
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    const items = upcoming.map(t => {
      const pubDate = new Date(t.date);
      const guid = `tournament-${t.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${t.date}`;
      const desc = [t.details, t.location ? `Location: ${t.location}` : '', t.link ? `More info: ${t.link}` : ''].filter(Boolean).join('\n');
      return `
    <item>
      <title>${escapeXml(t.name)} - ${t.date}</title>
      <link>${escapeXml(t.link || 'https://picklespotph.site')}</link>
      <description>${escapeXml(desc)}</description>
      <pubDate>${pubDate.toUTCString()}</pubDate>
      <guid>${guid}</guid>
    </item>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PickleSpotPH - Tournaments &amp; Events</title>
    <link>https://picklespotph.site</link>
    <description>Upcoming pickleball tournaments and events across the Philippines.</description>
    <language>en-ph</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="https://picklespotph.site/api/rss" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, public');
    res.status(200).send(xml);
  } catch (err) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(500).send('Error generating feed: ' + err.message);
  }
};
