var https = require('https');
var http = require('http');

function fetchURL(url) {
  return new Promise(function(resolve, reject) {
    var mod = url.startsWith('https') ? https : http;
    mod.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PickleSpotPH/1.0' } }, function(res) {
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() { resolve(data); });
    }).on('error', reject);
  });
}

function parseRSS(xml) {
  var items = [];
  var itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  var match;
  while ((match = itemRegex.exec(xml)) !== null) {
    var itemXml = match[1];
    var get = function(tag) {
      var m = itemXml.match(new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'i'));
      return m ? m[1].trim().replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') : '';
    };
    var link = get('link');
    var guid = get('guid') || link;
    var title = get('title').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
    var desc = get('description').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
    var pubDate = get('pubDate');
    var source = get('source') || '';
    items.push({ title: title, description: desc, link: link, guid: guid, pubDate: pubDate, source: source });
  }
  return items;
}

function isRelevant(item) {
  var text = (item.title + ' ' + item.description).toLowerCase();
  var keywords = ['pickleball', 'philippines', 'filipino', 'manila', 'cebu', 'davao', 'ppf', 'sm active', 'toby\'s sports', 'mppt', 'pacquiao', 'dupr', 'paddle', 'court', 'tournament', 'pickle', 'ncr', 'luzon', 'visayas', 'mindanao'];
  var matches = 0;
  for (var i = 0; i < keywords.length; i++) {
    if (text.indexOf(keywords[i]) !== -1) matches++;
  }
  return matches >= 2;
}

function extractSourceName(link, title) {
  var m = title && title.match(/ - ([^-]+)$/);
  if (m) return m[1].trim();
  var m2 = link.match(/https?:\/\/(?:www\.)?([^\/]+)/);
  if (m2) return m2[1].replace(/^www\./, '');
  return 'News Source';
}

var NEWS_SOURCES = [
  'https://news.google.com/rss/search?q=pickleball+Philippines&hl=en-PH&gl=PH&ceid=PH:en',
  'https://news.google.com/rss/search?q=pickleball+Manila&hl=en-PH&gl=PH&ceid=PH:en',
  'https://news.google.com/rss/search?q=PH+pickleball+news&hl=en-PH&gl=PH&ceid=PH:en'
];

module.exports = async function fetchNews() {
  var seen = {};
  var allItems = [];

  for (var s = 0; s < NEWS_SOURCES.length; s++) {
    try {
      var xml = await fetchURL(NEWS_SOURCES[s]);
      var items = parseRSS(xml);
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!seen[item.guid]) {
          seen[item.guid] = true;
          if (isRelevant(item)) {
            item.sourceName = extractSourceName(item.link, item.title);
            allItems.push(item);
          }
        }
      }
    } catch (e) {
      console.error('Error fetching ' + NEWS_SOURCES[s] + ': ' + e.message);
    }
  }

  allItems.sort(function(a, b) { return new Date(b.pubDate) - new Date(a.pubDate); });

  return allItems;
};

if (require.main === module) {
  fetchNews().then(function(items) {
    console.log(JSON.stringify(items, null, 2));
  }).catch(function(e) {
    console.error(e);
    process.exit(1);
  });
}
