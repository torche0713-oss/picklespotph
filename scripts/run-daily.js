var fs = require('fs');
var path = require('path');
var fetchNews = require('./fetch-news.js');
var aiWriter = require('./ai-writer.js');

var BLOG_JS_PATH = path.join(__dirname, '..', 'js', 'blog.js');
var SITEMAP_PATH = path.join(__dirname, '..', 'sitemap.xml');
var BLOG_DIR = path.join(__dirname, '..', 'blog');
var BUILD_SCRIPT = path.join(__dirname, '..', 'build-articles.js');

var UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1761644518970-2ed0ab543e1b?w=800&q=75',
  'https://images.unsplash.com/photo-1693142519354-c72652e97e24?w=800&q=75',
  'https://images.unsplash.com/photo-1779862753112-418ae8909c8c?w=800&q=75',
  'https://images.unsplash.com/photo-1693142519378-46a8f52ced88?w=800&q=75',
  'https://images.unsplash.com/photo-1753901821774-22a88913130f?w=800&q=75',
  'https://images.unsplash.com/photo-1769911111880-b9cc416dc03a?w=800&q=75'
];

function readBlogJS() {
  var src = fs.readFileSync(BLOG_JS_PATH, 'utf8');
  var match = src.match(/var BLOG_POSTS\s*=\s*(\[[\s\S]*?\]);/);
  if (!match) throw new Error('Could not find BLOG_POSTS in blog.js');
  var posts = eval(match[1]);
  return { src: src, posts: posts, arrayMatch: match[0] };
}

function writeBlogJS(fullSrc) {
  fs.writeFileSync(BLOG_JS_PATH, fullSrc, 'utf8');
}

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-]+|[-]+$/g, '')
    .substring(0, 80);
}

function getPHDate() {
  var now = new Date();
  var utc = now.getTime() + now.getTimezoneOffset() * 60000;
  var ph = new Date(utc + 8 * 3600000);
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return months[ph.getMonth()] + ' ' + ph.getDate() + ', ' + ph.getFullYear();
}

function getPHDateISO() {
  var now = new Date();
  var utc = now.getTime() + now.getTimezoneOffset() * 60000;
  var ph = new Date(utc + 8 * 3600000);
  return ph.getFullYear() + '-' + String(ph.getMonth() + 1).padStart(2,'0') + '-' + String(ph.getDate()).padStart(2,'0');
}

function pickImage() {
  return UNSPLASH_IMAGES[Math.floor(Math.random() * UNSPLASH_IMAGES.length)];
}

function stripHtml(s) {
  return s.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function generateRoundupContent(items) {
  var html = '<p>Here are the top pickleball stories making headlines in the Philippines today.</p>\n';
  html += '<h2>Today\'s Headlines</h2>\n<ul>\n';
  for (var i = 0; i < items.length; i++) {
    var snippet = stripHtml(items[i].description).substring(0, 150);
    if (!snippet) snippet = 'Read the full article for details.';
    html += '  <li><strong>' + escHtml(items[i].title) + '</strong> \u2014 ' + escHtml(snippet) + ' <a href="' + escHtml(items[i].link) + '" target="_blank" rel="noopener">[' + escHtml(items[i].sourceName) + ']</a></li>\n';
  }
  html += '</ul>\n';
  html += '<p>Stay updated with the latest pickleball developments across the Philippines. Bookmark PickleSpotPH for daily news, court openings, and tournament updates.</p>\n';
  return html;
}

function generateStandaloneContent(item) {
  var snippet = stripHtml(item.description).substring(0, 200);
  if (!snippet) snippet = 'Read the full article on ' + escHtml(item.sourceName) + ' for complete details.';

  var html = '<p>' + escHtml(snippet) + '</p>\n';
  html += '<p>This story is developing. For the full article, visit the original source: <a href="' + escHtml(item.link) + '" target="_blank" rel="noopener">' + escHtml(item.sourceName) + ' \u2192</a></p>\n';
  return html;
}

function makeRoundupPrompt(items) {
  var headlines = '';
  for (var i = 0; i < items.length; i++) {
    headlines += (i + 1) + '. "' + items[i].title + '" - ' + items[i].sourceName + ' (' + items[i].link + ')\n';
  }
  return 'Write a daily pickleball news roundup for the Philippines. Cover these ' + items.length + ' stories:\n\n' + headlines
    + '\n\nWrite a cohesive roundup article that introduces each story with context and explains why it matters for Philippine pickleball. Start with a hook about the state of PH pickleball today. End with "Stay updated with the latest pickleball developments across the Philippines. Bookmark PickleSpotPH for daily news, court openings, and tournament updates."';
}

async function generateContent(item, category, isRoundup, allItems) {
  var hasAI = aiWriter.getConfig().apiKey;

  if (hasAI) {
    var description = stripHtml(item.description);
    var result;

    if (isRoundup && allItems && allItems.length > 1) {
      var prompt = makeRoundupPrompt(allItems);
      result = await aiWriter.writeArticle(category, item.title, item.sourceName, item.link, prompt);
    } else {
      result = await aiWriter.writeArticle(category, item.title, item.sourceName, item.link, description);
    }

    if (result) {
      var sourceLine = '<p><em>Source: <a href="' + escHtml(item.link) + '" target="_blank" rel="noopener">' + escHtml(item.sourceName) + '</a></em></p>';
      return result + '\n' + sourceLine;
    }

    console.log('  AI generation failed, falling back to template...');
  }

  if (isRoundup && allItems && allItems.length > 1) {
    return generateRoundupContent(allItems);
  }
  return generateStandaloneContent(item);
}

function guessCategory(title) {
  var t = title.toLowerCase();
  if (t.indexOf('tournament') !== -1 || t.indexOf('championship') !== -1 || t.indexOf('cup') !== -1 || t.indexOf('league') !== -1) return 'Events';
  if (t.indexOf('business') !== -1 || t.indexOf('economy') !== -1 || t.indexOf('market') !== -1 || t.indexOf('investment') !== -1) return 'Features';
  if (t.indexOf('guide') !== -1 || t.indexOf('tips') !== -1 || t.indexOf('how to') !== -1 || t.indexOf('beginner') !== -1) return 'Guides';
  if (t.indexOf('paddle') !== -1 || t.indexOf('gear') !== -1 || t.indexOf('shoe') !== -1 || t.indexOf('equipment') !== -1) return 'Gear';
  return 'News';
}

function generateExcerpt(item) {
  var stripped = stripHtml(item.description).substring(0, 160);
  if (stripped && stripped.length > 10) {
    if (stripped.length >= 160) stripped = stripped.substring(0, 157) + '...';
    return stripped;
  }
  var t = item.title.replace(/ - [^-]+$/, '');
  return t.substring(0, 160);
}

function cleanTitle(title) {
  return title.replace(/ - [^-]+$/, '').trim();
}

function escHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function insertedBefore(s, search, insert) {
  var idx = s.indexOf(search);
  if (idx === -1) return s;
  return s.substring(0, idx) + insert + s.substring(idx);
}

function updateSitemap(newIds) {
  var sitemap = fs.readFileSync(SITEMAP_PATH, 'utf8');
  var phDate = getPHDateISO();
  var insertBeforeStr = '  <url>\n    <loc>https://picklespotph.site/contact.html</loc>';

  var toInsert = '';
  for (var i = 0; i < newIds.length; i++) {
    toInsert += '  <url>\n' +
      '    <loc>https://picklespotph.site/blog/' + newIds[i] + '.html</loc>\n' +
      '    <lastmod>' + phDate + '</lastmod>\n' +
      '    <changefreq>monthly</changefreq>\n' +
      '    <priority>0.7</priority>\n' +
      '  </url>\n';
  }

  sitemap = insertedBefore(sitemap, insertBeforeStr, toInsert);

  sitemap = sitemap.replace(
    /(<loc>https:\/\/picklespotph\.site\/blog\.html<\/loc>\s*<lastmod>)[^<]+(<\/lastmod>)/,
    '$1' + phDate + '$2'
  );

  fs.writeFileSync(SITEMAP_PATH, sitemap, 'utf8');
}

function hasRelatedTo(posts, targetId) {
  for (var i = 0; i < posts.length; i++) {
    if (posts[i].content.indexOf('href="../blog/' + targetId + '.html"') !== -1) return true;
  }
  return false;
}

function addRelatedToOtherPosts(posts, newId, newTitle) {
  var linkHtml = '<a href="../blog/' + newId + '.html"><i class="fas fa-arrow-right"></i> ' + escHtml(newTitle) + '</a>';
  var updated = [];
  for (var i = 0; i < posts.length; i++) {
    var p = posts[i];
    if (p.id === newId) continue;
    if (p.content.indexOf('href="../blog/' + newId + '.html"') !== -1) continue;
    var relatedTag = '<div class="blog-related">';
    var idx = p.content.indexOf(relatedTag);
    if (idx !== -1) {
      var closeIdx = p.content.indexOf('</div>', idx);
      if (closeIdx !== -1) {
        var before = p.content.substring(0, closeIdx);
        var after = p.content.substring(closeIdx);
        p.content = before + linkHtml + after;
        updated.push(p.id);
      }
    }
  }
  return updated;
}

async function run() {
  console.log('=== PickleSpotPH Daily News Pipeline ===');
  console.log('Date: ' + getPHDate());
  console.log('');

  var blogData = readBlogJS();
  var posts = blogData.posts;
  var existingIds = {};
  var existingGuids = {};
  for (var i = 0; i < posts.length; i++) {
    existingIds[posts[i].id] = true;
  }

  console.log('Existing articles: ' + posts.length);
  console.log('');

  console.log('Fetching news...');
  var newsItems = await fetchNews();
  console.log('Found ' + newsItems.length + ' relevant news items');
  console.log('');

  if (newsItems.length === 0) {
    console.log('No new news found. Exiting.');
    return { added: 0 };
  }

  var newPosts = [];
  var newIds = [];
  var dayStr = getPHDateISO();

  var topItems = newsItems.slice(0, Math.min(newsItems.length, 5));

  for (var i = 0; i < topItems.length; i++) {
    var item = topItems[i];
    var idBase = slugify(item.title.substring(0, 50));
    if (idBase.length < 5) idBase = 'pickleball-news-' + dayStr + '-' + i;
    var id = idBase;

    var dedupCount = 0;
    while (existingIds[id] || newIds.indexOf(id) !== -1) {
      dedupCount++;
      id = idBase + '-' + dedupCount;
    }

    var title = cleanTitle(item.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'"));
    if (title.length > 100) title = title.substring(0, 97) + '...';

    var excerpt = generateExcerpt(item);
    var cat = guessCategory(title);

    var isRoundup = (i === 0 && topItems.length > 2);
    console.log('  Generating ' + cat + ' article' + (isRoundup ? ' (roundup)' : '') + ': ' + title.substring(0, 50) + '...');
    var content = await generateContent(item, cat, isRoundup, topItems);

    var newPost = {
      id: id,
      category: cat,
      title: title,
      date: getPHDate(),
      author: 'PickleSpotPH Newsbot',
      excerpt: excerpt,
      image: pickImage(),
      content: content
    };

    newPosts.push(newPost);
    newIds.push(id);
  }

  if (newIds.length === 0) {
    console.log('No new articles to add. All news items already covered.');
    return { added: 0 };
  }

  for (var i = 0; i < newPosts.length; i++) {
    console.log('  New article: ' + newPosts[i].id + ' - ' + newPosts[i].title.substring(0, 60) + '...');
  }

  var allPosts = posts.concat(newPosts);

  for (var i = 0; i < newPosts.length; i++) {
    addRelatedToOtherPosts(allPosts, newPosts[i].id, newPosts[i].title);
  }

  var arrayStr = JSON.stringify(allPosts, null, 2)
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'")
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
    .replace(/\u2013/g, '\u2014')
    .replace(/\n\s{10}/g, '\n');

  var newSrc = blogData.src.replace(blogData.arrayMatch, 'var BLOG_POSTS = ' + arrayStr + ';');
  writeBlogJS(newSrc);
  console.log('');
  console.log('Updated js/blog.js');

  console.log('Generating HTML files...');
  try {
    var buildAll = require(BUILD_SCRIPT);
    console.log('Generated blog/ HTML files');
  } catch (e) {
    console.error('Error running build script: ' + e.message);
  }

  updateSitemap(newIds);
  console.log('Updated sitemap.xml');

  console.log('');
  console.log('=== Pipeline Complete ===');
  console.log('Articles added: ' + newIds.length);
  for (var i = 0; i < newIds.length; i++) {
    console.log('  - blog/' + newIds[i] + '.html');
  }
  console.log('');

  return { added: newIds.length, ids: newIds };
}

if (require.main === module) {
  run().catch(function(e) {
    console.error('Pipeline failed: ' + e.message);
    console.error(e.stack);
    process.exit(1);
  });
}

module.exports = run;
