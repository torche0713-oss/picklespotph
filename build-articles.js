var fs = require('fs');
var path = require('path');

var blogJs = fs.readFileSync('js/blog.js', 'utf8');
eval(blogJs.substring(0, blogJs.indexOf('function renderBlog')));

function catColor(cat) {
  var colors = { News: '#e53935', Features: '#1e88e5', Guides: '#43a047', Gear: '#8e24aa' };
  return colors[cat] || '#757575';
}

function generateArticle(post) {
  var articleUrl = 'https://picklespotph.site/blog/' + post.id + '.html';
  var title = post.title + ' - PickleSpotPH News & Guides';
  var desc = post.excerpt;
  var image = post.image;

  var shareIcons = '<div class="share-section">' +
    '<p class="share-label">Share this article:</p>' +
    '<div class="share-buttons">' +
    '<button class="share-btn" data-share="whatsapp" title="Share on WhatsApp"><svg style="width:16px;height:16px;flex-shrink:0;" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp</button>' +
    '<button class="share-btn" data-share="facebook" title="Share on Facebook"><svg style="width:16px;height:16px;flex-shrink:0;" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> Facebook</button>' +
    '<button class="share-btn" data-share="linkedin" title="Share on LinkedIn"><svg style="width:16px;height:16px;flex-shrink:0;" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> LinkedIn</button>' +
    '<button class="share-btn" data-share="twitter" title="Share on X"><svg style="width:16px;height:16px;flex-shrink:0;" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> X</button>' +
    '<button class="share-btn" data-share="copy" title="Copy link"><svg style="width:16px;height:16px;flex-shrink:0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> Copy Link</button>' +
    '</div></div>';

  var catBg = catColor(post.category);

  function esc(s) {
    if (!s) return '';
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var h = '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '  <meta charset="UTF-8" />\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>\n' +
    '  <title>' + esc(title) + '</title>\n' +
    '  <meta name="description" content="' + esc(desc) + '"/>\n' +
    '  <meta property="og:title" content="' + esc(post.title) + ' - PickleSpotPH"/>\n' +
    '  <meta property="og:description" content="' + esc(desc) + '"/>\n' +
    '  <meta property="og:url" content="' + articleUrl + '"/>\n' +
    '  <meta property="og:type" content="article"/>\n' +
    '  <meta property="og:site_name" content="PickleSpotPH"/>\n' +
    '  <meta property="og:image" content="' + image + '"/>\n' +
    '  <meta name="twitter:card" content="summary_large_image"/>\n' +
    '  <meta name="google-site-verification" content="mLVVSeBUGWWNqiD_LwNbWgDR7_D8OyLzviWek_wEeT8"/>\n' +
    '  <link rel="canonical" href="' + articleUrl + '" />\n' +
    '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>\n' +
    '  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700;900&display=swap" rel="stylesheet"/>\n' +
    '  <link href="https://unpkg.com/aos@2.3.4/dist/aos.css" rel="stylesheet"/>\n' +
    '  <link rel="stylesheet" href="https://picklespotph.site/css/style.css"/>\n' +
    '  <style>\n' +
    '    .blog-article-page { display:flex; flex-direction:column; min-height:100vh; }\n' +
    '    .blog-article-page main { flex:1; padding-top:80px; }\n' +
    '    .blog-article-page .blog-wrap { max-width:800px; margin:0 auto; padding:40px 20px 60px; }\n' +
    '    .blog-article-page .blog-article { background:var(--white); border-radius:var(--radius); box-shadow:var(--card-shadow); padding:32px; }\n' +
    '    .blog-article-page .blog-article-img { width:100%; height:300px; object-fit:cover; border-radius:var(--radius); margin:16px 0 0; display:block; }\n' +
    '    .blog-article-page .blog-back { display:inline-flex; align-items:center; gap:6px; font-size:13px; color:var(--text-muted); text-decoration:none; margin-bottom:16px; }\n' +
    '    .blog-article-page .blog-back:hover { color:var(--primary); }\n' +
    '    .blog-article-page .blog-article-title { font-family:\'Playfair Display\',serif; font-size:26px; line-height:1.3; margin-bottom:8px; }\n' +
    '    .blog-article-page .blog-content { font-size:15px; line-height:1.8; color:var(--text); margin-top:20px; }\n' +
    '    .blog-article-page .blog-content h2 { font-size:20px; margin-top:28px; margin-bottom:10px; color:var(--primary-dark); font-family:\'Playfair Display\',serif; }\n' +
    '    .blog-article-page .blog-content h3 { font-size:16px; margin-top:20px; margin-bottom:8px; color:var(--primary-dark); }\n' +
    '    .blog-article-page .blog-content p { margin-bottom:14px; }\n' +
    '    .blog-article-page .blog-content ul { padding-left:20px; margin-bottom:14px; }\n' +
    '    .blog-article-page .blog-content ul li { margin-bottom:6px; list-style:disc; }\n' +
    '    .blog-article-page .blog-content em { color:var(--text-muted); font-size:13px; }\n' +
    '    .blog-article-page .blog-content strong { font-weight:600; }\n' +
    '    .blog-article-page .blog-category { display:inline-block; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; color:#fff; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:8px; }\n' +
    '    .blog-article-page .blog-meta { font-size:12px; color:var(--text-muted); margin-bottom:10px; }\n' +
    '    .blog-article-page .blog-related { margin-top:30px; padding-top:16px; border-top:1px solid var(--border-color); font-size:14px; }\n' +
    '    .blog-article-page .blog-related strong { display:block; margin-bottom:6px; font-size:13px; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.5px; }\n' +
    '    .blog-article-page .blog-related a { color:var(--primary); text-decoration:none; display:inline-block; margin-right:12px; margin-bottom:4px; }\n' +
    '    .blog-article-page .blog-related a:hover { text-decoration:underline; }\n' +
    '    .blog-article-page .blog-related a i { font-size:11px; margin-right:4px; }\n' +
    '    .blog-article-page .share-section { text-align:center; margin:40px 0; padding-top:32px; border-top:1px solid var(--border-color); }\n' +
    '    .blog-article-page .share-label { font-size:0.9rem; font-weight:600; color:var(--text-muted); margin-bottom:12px; text-transform:uppercase; letter-spacing:0.06em; }\n' +
    '    .blog-article-page .share-buttons { display:flex; flex-wrap:wrap; gap:10px; justify-content:center; }\n' +
    '    .blog-article-page .share-btn { display:inline-flex; align-items:center; gap:6px; background:var(--white); border:1px solid var(--border-color); border-radius:10px; padding:10px 18px; font-size:0.9rem; font-weight:500; cursor:pointer; transition:all 0.15s; color:var(--text); font-family:inherit; }\n' +
    '    .blog-article-page .share-btn:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,0.08); border-color:var(--primary); background:var(--bg); }\n' +
    '    .blog-article-page .share-btn svg { width:16px; height:16px; flex-shrink:0; }\n' +
    '    @media (max-width:600px) { .blog-article-page .blog-wrap { padding:24px 16px 40px; } .blog-article-page .blog-article-title { font-size:20px; } .blog-article-page .blog-article { padding:20px; } .blog-article-page .blog-article-img { height:200px; } .blog-article-page .share-btn { font-size:0.8rem; padding:8px 14px; } }\n' +
    '  </style>\n</head>\n<body class="blog-article-page">\n' +
    '  <nav class="navbar">\n' +
    '    <div class="nav-brand">\n' +
    '      <a href="https://picklespotph.site/index.html" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:white">\n' +
    '        <span style="font-size:18px">\u{1F4CD}</span>\n' +
    '        <img class="logo-img" src="https://picklespotph.site/logo.png" alt="PickleSpotPH" width="130" height="36">\n' +
    '      </a>\n' +
    '    </div>\n' +
    '    <div class="nav-links">\n' +
    '      <a href="https://picklespotph.site/index.html" class="nav-link"><i class="fas fa-map-marked-alt"></i> Home</a>\n' +
    '      <a href="https://picklespotph.site/blog.html" class="nav-link active"><i class="fas fa-newspaper"></i> News</a>\n' +
    '      <a href="https://picklespotph.site/about.html" class="nav-link"><i class="fas fa-info-circle"></i> About</a>\n' +
    '      <a href="https://picklespotph.site/contact.html" class="nav-link"><i class="fas fa-envelope"></i> Contact</a>\n' +
    '    </div>\n' +
    '    <button class="btn-dark-mode" id="darkModeToggle" title="Toggle Dark Mode"><i class="fas fa-moon"></i></button>\n' +
    '  </nav>\n' +
    '  <main>\n' +
    '    <div class="blog-wrap">\n' +
    '      <article class="blog-article" data-aos="fade-up">\n' +
    '        <a href="https://picklespotph.site/blog.html" class="blog-back"><i class="fas fa-arrow-left"></i> Back to articles</a>\n' +
    '        <span class="blog-category" style="background:' + catBg + '">' + esc(post.category) + '</span>\n' +
    '        <h1 class="blog-article-title">' + esc(post.title) + '</h1>\n' +
    '        <div class="blog-meta">' + esc(post.date) + ' &middot; ' + esc(post.author) + '</div>\n' +
    '        <img class="blog-article-img" src="' + image + '" alt="' + esc(post.title) + '" loading="lazy" width="800" height="400">\n' +
    '        <div class="blog-content">' + post.content + '</div>\n' +
    '        ' + shareIcons + '\n' +
    '      </article>\n' +
    '    </div>\n' +
    '  </main>\n' +
    '  <footer class="site-footer">\n' +
    '    <div class="footer-content">\n' +
    '      <div class="footer-brand">\n' +
    '        <span>\u{1F4CD}</span>\n' +
    '        <span><img class="logo-img" src="https://picklespotph.site/logo.png" alt="PickleSpotPH" width="130" height="36"></span>\n' +
    '      </div>\n' +
    '      <p class="footer-tagline">Finding pickleball courts made easy \u{1F1F5}\u{1F1ED}</p>\n' +
    '      <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;margin-bottom:10px;font-size:13px">\n' +
    '        <a href="https://picklespotph.site/about.html" style="color:rgba(255,255,255,0.8);text-decoration:none">About</a>\n' +
    '        <a href="https://picklespotph.site/blog.html" style="color:rgba(255,255,255,0.8);text-decoration:none">News</a>\n' +
    '        <a href="https://picklespotph.site/terms.html" style="color:rgba(255,255,255,0.8);text-decoration:none">Terms</a>\n' +
    '        <a href="https://picklespotph.site/privacy.html" style="color:rgba(255,255,255,0.8);text-decoration:none">Privacy</a>\n' +
    '        <a href="https://picklespotph.site/disclaimer.html" style="color:rgba(255,255,255,0.8);text-decoration:none">Disclaimer</a>\n' +
    '        <a href="https://picklespotph.site/contact.html" style="color:rgba(255,255,255,0.8);text-decoration:none">Contact</a>\n' +
    '      </div>\n' +
    '      <p class="footer-copy">&copy; 2026 PickleSpotPH &middot; All rights reserved</p>\n' +
    '    </div>\n' +
    '  </footer>\n' +
    '  <script src="https://unpkg.com/aos@2.3.4/dist/aos.js"></script>\n' +
    '  <script>AOS.init({duration:800,once:true,offset:80});</script>\n' +
    '  <script>\n' +
    '    (function(){var t=document.getElementById("darkModeToggle");var s=localStorage.getItem("psp_darkMode");if(s==="true"){document.documentElement.setAttribute("data-theme","dark");if(t)t.innerHTML=\'<i class="fas fa-sun"></i>\'}if(t)t.addEventListener("click",function(){var d=document.documentElement.getAttribute("data-theme")==="dark";if(d){document.documentElement.removeAttribute("data-theme");t.innerHTML=\'<i class="fas fa-moon"></i>\';localStorage.setItem("psp_darkMode","false")}else{document.documentElement.setAttribute("data-theme","dark");t.innerHTML=\'<i class="fas fa-sun"></i>\';localStorage.setItem("psp_darkMode","true")}});})();\n' +
    '  </script>\n' +
    '  <script>\n' +
    '    (function(){var b=document.querySelectorAll(".share-btn");var u=encodeURIComponent(window.location.href);var t=encodeURIComponent(document.title);b.forEach(function(btn){btn.addEventListener("click",function(e){var type=btn.getAttribute("data-share");var url;switch(type){case"whatsapp":url="https://wa.me/?text="+u;break;case"facebook":url="https://www.facebook.com/sharer/sharer.php?u="+u;break;case"linkedin":url="https://www.linkedin.com/sharing/share-offsite/?url="+u;break;case"twitter":url="https://twitter.com/intent/tweet?url="+u+"&text="+t;break;case"copy":navigator.clipboard.writeText(decodeURIComponent(u)).then(function(){var o=btn.innerHTML;btn.innerHTML="Copied!";setTimeout(function(){btn.innerHTML=o},2000)});return;}if(url)window.open(url,"_blank","width=600,height=400");});});})();\n' +
    '  </script>\n</body>\n</html>';

  return h;
}

function buildAll() {
  for (var i = 0; i < BLOG_POSTS.length; i++) {
    var post = BLOG_POSTS[i];
    var filePath = path.join(__dirname, 'blog', post.id + '.html');
    fs.writeFileSync(filePath, generateArticle(post), 'utf8');
    console.log('Generated: blog/' + post.id + '.html');
  }
}

if (require.main === module) {
  buildAll();
} else {
  module.exports = buildAll;
}
