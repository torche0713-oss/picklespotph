var BLOG_POSTS = [
  {
    id: 'sm-pickleball-boom',
    category: 'News',
    title: 'Pickleball Booms Across the Philippines \u2014 86 SM Courts and Counting',
    excerpt: 'SM Supermalls now hosts 86 pickleball courts across 29 malls nationwide, making it the largest mall-based pickleball network in the country.',
    image: 'https://images.unsplash.com/photo-1761644518970-2ed0ab543e1b?w=800&q=75'
  },
  {
    id: 'manny-pacquiao-mppt',
    category: 'News',
    title: 'Manny Pacquiao Launches Maharlika Pilipinas Pickleball Tour',
    excerpt: 'Boxing legend Manny Pacquiao launches the Maharlika Pilipinas Pickleball Tour (MPPT), a professional league with a P5M prize pool.',
    image: 'https://images.unsplash.com/photo-1693142519354-c72652e97e24?w=800&q=75'
  },
  {
    id: 'ppf-dupr-partnership',
    category: 'News',
    title: 'PPF Partners with DUPR for Global Player Ratings',
    excerpt: 'The Philippine Pickleball Federation partners with DUPR, giving Filipino players access to the global standard rating system used by top professionals.',
    image: 'https://images.unsplash.com/photo-1761644518970-2ed0ab543e1b?w=800&q=75'
  },
  {
    id: 'pickleball-world-cup-2026',
    category: 'News',
    title: 'Philippines Prepares for Inaugural Pickleball World Cup in Vietnam',
    excerpt: 'The Philippines is assembling its national delegation for the first-ever Pickleball World Cup in Da Nang, Vietnam, with over 80 countries expected.',
    image: 'https://images.unsplash.com/photo-1761644518970-2ed0ab543e1b?w=800&q=75'
  },
  {
    id: 'cdopickleball-boom',
    category: 'News',
    title: 'Cagayan de Oro Emerges as Mindanao Pickleball Hub',
    excerpt: 'CDO now hosts over 30 dedicated pickleball courts, with new public facilities opening to make the sport more accessible to residents.',
    image: 'https://images.unsplash.com/photo-1779862753112-418ae8909c8c?w=800&q=75'
  },
  {
    id: 'ppf-pickleball-rise',
    category: 'Features',
    title: 'The Meteoric Rise of Pickleball in the Philippines',
    excerpt: 'From a single clinic in Cebu in 2016 to 13,000 registered members and a national federation \u2014 pickleball\'s journey in the PH has been remarkable.',
    image: 'https://images.unsplash.com/photo-1693142519354-c72652e97e24?w=800&q=75'
  },
  {
    id: 'pickleball-for-beginners',
    category: 'Guides',
    title: 'Pickleball for Beginners: Rules, Equipment, and Where to Start in the PH',
    excerpt: 'New to pickleball? Here\'s everything you need to know to start playing in the Philippines \u2014 from rules and scoring to equipment and finding courts.',
    image: 'https://images.unsplash.com/photo-1779862753112-418ae8909c8c?w=800&q=75'
  },
  {
    id: 'choose-first-paddle',
    category: 'Guides',
    title: 'How to Choose Your First Pickleball Paddle in the Philippines',
    excerpt: 'Confused by all the paddle options? Here\'s a straightforward guide to picking your first paddle that won\'t break the bank.',
    image: 'https://images.unsplash.com/photo-1693142519378-46a8f52ced88?w=800&q=75'
  },
  {
    id: 'best-paddles-compared',
    category: 'Gear',
    title: 'Best Pickleball Paddle Brands in the PH \u2014 Compared',
    excerpt: 'We compare the top paddle brands available in the Philippines: Gearbox, Luzz, Head, Franklin, and Selkirk \u2014 specs, pricing, and where to buy.',
    image: 'https://images.unsplash.com/photo-1753901821774-22a88913130f?w=800&q=75'
  },
  {
    id: 'pickleball-shoes-guide',
    category: 'Gear',
    title: 'Best Court Shoes for Pickleball in the Philippines \u2014 2026 Guide',
    excerpt: 'The right shoes make a huge difference. We review the best court shoes for pickleball available in PH \u2014 from budget to premium.',
    image: 'https://images.unsplash.com/photo-1769911111880-b9cc416dc03a?w=800&q=75'
  },
  {
    id: 'pickleball-balls-compared',
    category: 'Gear',
    title: 'Outdoor vs Indoor Pickleball Balls \u2014 Which to Buy in the PH?',
    excerpt: 'Not all pickleball balls are the same. We break down the differences between outdoor and indoor balls, plus the best brands available locally.',
    image: 'https://images.unsplash.com/photo-1693142519378-46a8f52ced88?w=800&q=75'
  }
];

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = function (req, res) {
  var id = (req.query.id || '').trim();
  var article = null;
  for (var i = 0; i < BLOG_POSTS.length; i++) {
    if (BLOG_POSTS[i].id === id) { article = BLOG_POSTS[i]; break; }
  }

  if (!article) {
    res.writeHead(302, { Location: '/blog.html' });
    res.end();
    return;
  }

  var title = escHtml(article.title + ' - PickleSpotPH');
  var desc = escHtml(article.excerpt);
  var image = escHtml(article.image || 'https://picklespotph.site/logo.png');
  var url = 'https://picklespotph.site/blog/' + encodeURIComponent(id) + '.html';

  var ua = (req.headers['user-agent'] || '').toLowerCase();
  var isCrawler = ua.includes('facebook') || ua.includes('twitter') || ua.includes('whatsapp') || ua.includes('telegram') || ua.includes('slack') || ua.includes('discord') || ua.includes('linkedin') || ua.includes('googlebot') || ua.includes('bingbot') || ua.includes('slurp') || ua.includes('duckduckbot') || ua.includes('baiduspider') || ua.includes('yandexbot');

  if (isCrawler) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, public');
    res.status(200).send(
      '<!DOCTYPE html><html><head>' +
      '<title>' + title + '</title>' +
      '<meta property="og:title" content="' + title + '"/>' +
      '<meta property="og:description" content="' + desc + '"/>' +
      '<meta property="og:image" content="' + image + '"/>' +
      '<meta property="og:url" content="' + url + '"/>' +
      '<meta property="og:type" content="article"/>' +
      '<meta property="og:site_name" content="PickleSpotPH"/>' +
      '<meta name="twitter:card" content="summary_large_image"/>' +
      '</head><body>' +
      '<p>' + desc + '</p>' +
      '</body></html>'
    );
  } else {
    res.writeHead(302, { Location: url });
    res.end();
  }
};
