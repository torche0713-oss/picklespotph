// ============================================================
// Scraper: Find booking URLs for PH pickleball courts
// ============================================================
// Usage: node scripts/scrape-booking-links.js [--fetch]
//   --fetch: actually fetch Courtogo pages (slow, 130+ requests)
//   Without --fetch: uses cached data
// ============================================================

const fs = require('fs');
const https = require('https');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(ROOT, '.cache');
const COURT_FILE = path.join(ROOT, 'all-courts-full.json');
const DASHBOARD_FILE = path.join(ROOT, 'js', 'dashboard.js');
const OUTPUT_FILE = path.join(ROOT, 'js', 'booking-links-enriched.json');

// Ensure cache dir
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// ============================================================
// Utility: HTTPS fetch with retry
// ============================================================
function fetch(url, retries = 2) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      const proto = url.startsWith('https') ? https : http;
      proto.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' } }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) resolve(data);
          else if (n > 0) { console.log(`  Retry ${url} (${res.statusCode})`); setTimeout(() => attempt(n-1), 1000); }
          else reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        });
      }).on('error', (e) => {
        if (n > 0) { console.log(`  Retry ${url} (${e.message})`); setTimeout(() => attempt(n-1), 1000); }
        else reject(e);
      });
    };
    attempt(retries);
  });
}

// ============================================================
// Utility: Normalize a venue name for comparison
// ============================================================
function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Simple name similarity
function nameSimilarity(a, b) {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.9;
  const aWords = na.split(' ');
  const bWords = nb.split(' ');
  const common = aWords.filter(w => bWords.includes(w)).length;
  return common / Math.max(aWords.length, bWords.length);
}

// ============================================================
// STEP 1: Load our court data
// ============================================================
function loadOurCourts() {
  console.log('\n=== STEP 1: Loading court data ===');
  
  const courts = [];
  
  // From all-courts-full.json
  if (fs.existsSync(COURT_FILE)) {
    let raw = fs.readFileSync(COURT_FILE, 'utf8');
    // Strip BOM if present
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const json = JSON.parse(raw);
    json.forEach(c => {
      courts.push({
        id: c.id,
        name: c.name,
        city: c.city || '',
        province: c.province || '',
        region: c.region || '',
        source: 'all-courts-full.json'
      });
    });
    console.log(`  Loaded ${json.length} courts from all-courts-full.json`);
  }
  
  // From dashboard.js IMPORT_COURTS (extract names from array)
  if (fs.existsSync(DASHBOARD_FILE)) {
    const raw = fs.readFileSync(DASHBOARD_FILE, 'utf8');
    const start = raw.indexOf('const IMPORT_COURTS = [');
    const end = raw.indexOf('];', start);
    if (start > -1 && end > -1) {
      const arrStr = raw.substring(start + 'const IMPORT_COURTS = '.length, end + 1);
      try {
        const importCourts = eval('(' + arrStr + ')');
        importCourts.forEach(c => {
          if (!courts.find(x => x.name === c.name)) {
            courts.push({
              id: makeSlug(c.name),
              name: c.name,
              city: c.city || '',
              province: c.province || '',
              region: c.region || '',
              source: 'dashboard.js IMPORT_COURTS'
            });
          }
        });
        console.log(`  Added ${importCourts.length} from IMPORT_COURTS (${importCourts.filter(c => !courts.find(x => x.name === c.name)).length} new)`);
      } catch (e) {
        console.log('  Could not parse IMPORT_COURTS array');
      }
    }
  }
  
  console.log(`  Total unique courts: ${courts.length}`);
  return courts;
}

// ============================================================
// STEP 2: Fetch Courtogo venue pages and extract names
// ============================================================
async function scrapeCourtogoVenues(doFetch) {
  console.log('\n=== STEP 2: Scraping Courtogo venues ===');
  
  const cacheFile = path.join(CACHE_DIR, 'courtogo-venues.json');
  
  // Try cache first
  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    console.log(`  Loaded ${cached.length} venues from cache`);
    return cached;
  }
  
  if (!doFetch) {
    console.log('  Skipping fetch (use --fetch to actually scrape)');
    return [];
  }
  
  // Fetch sitemap
  console.log('  Fetching Courtogo sitemap...');
  let sitemapXml;
  try {
    sitemapXml = await fetch('https://www.courtogo.com/sitemap.xml');
  } catch (e) {
    console.log('  Failed to fetch sitemap:', e.message);
    return [];
  }
  
  // Extract venue slugs from sitemap
  const slugRegex = /<loc>https:\/\/www\.courtogo\.com\/venues\/([^<]+)<\/loc>/g;
  const slugs = [];
  let m;
  while ((m = slugRegex.exec(sitemapXml)) !== null) {
    slugs.push(m[1]);
  }
  console.log(`  Found ${slugs.length} venue slugs in sitemap`);
  
  // Fetch each venue page in sequence (with delay to be polite)
  const venues = [];
  let done = 0;
  
  for (const slug of slugs) {
    const url = `https://www.courtogo.com/venues/${slug}`;
    try {
      const html = await fetch(url);
      
      // Extract venue name from <title> tag
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(' | Courtogo', '').trim() : '';
      
      // Extract address/location
      const addressMatch = html.match(/class="[^"]*address[^"]*"[^>]*>([^<]+)</i);
      const address = addressMatch ? addressMatch[1].trim() : '';
      
      // Extract city
      const cityMatch = html.match(/(?:city|City|Municipality)[:\s]*([^<.,]+)/i);
      const city = cityMatch ? cityMatch[1].trim() : '';
      
      // Extract number of courts
      const courtsMatch = html.match(/(\d+)\s*Court/i);
      const numCourts = courtsMatch ? parseInt(courtsMatch[1]) : null;
      
      venues.push({
        slug,
        name: title,
        url: `https://www.courtogo.com/venues/${slug}`,
        address,
        city,
        numCourts
      });
      
      done++;
      if (done % 20 === 0) console.log(`  Fetched ${done}/${slugs.length} venues...`);
      
      // Polite delay
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      console.log(`  Failed to fetch ${slug}: ${e.message}`);
    }
  }
  
  console.log(`  Fetched ${venues.length} venue pages`);
  
  // Cache
  fs.writeFileSync(cacheFile, JSON.stringify(venues, null, 2));
  console.log('  Cached to', cacheFile);
  
  return venues;
}

// ============================================================
// STEP 3: Cross-reference and match
// ============================================================
function matchCourts(courts, courtogoVenues) {
  console.log('\n=== STEP 3: Matching courts ===');
  
  const matches = [];
  const unmatched = [];
  
  // Build a lookup of Courtogo venue names
  for (const court of courts) {
    const cn = normalizeName(court.name);
    let bestMatch = null;
    let bestScore = 0;
    
    for (const v of courtogoVenues) {
      if (!v.name) continue;
      const vn = normalizeName(v.name);
      let score = nameSimilarity(cn, vn);
      
      // Also try matching by slug
      const slugName = v.slug.replace(/-/g, ' ');
      const slugScore = nameSimilarity(cn, slugName);
      if (slugScore > score) score = slugScore;
      
      // Bonus for same city
      if (score > 0.5 && court.city && v.city && normalizeName(court.city).includes(normalizeName(v.city))) {
        score += 0.1;
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = v;
      }
    }
    
    if (bestMatch && bestScore >= 0.6) {
      matches.push({
        courtId: court.id,
        courtName: court.name,
        courtCity: court.city,
        platform: 'Courtogo',
        url: bestMatch.url,
        venueName: bestMatch.name,
        score: Math.round(bestScore * 100) / 100
      });
    } else {
      unmatched.push(court);
    }
  }
  
  console.log(`  Matched: ${matches.length} courts to Courtogo`);
  console.log(`  Unmatched: ${unmatched.length} courts`);
  
  return { matches, unmatched };
}

// ============================================================
// STEP 4: Search Facebook pages
// ============================================================
async function searchFacebookPages(courts) {
  console.log('\n=== STEP 4: Searching Facebook pages ===');
  
  const results = [];
  
  for (const court of courts) {
    const searchQuery = encodeURIComponent(`${court.name} pickleball ${court.city} Philippines Facebook`);
    const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
    
    try {
      const html = await fetch(searchUrl);
      
      // Look for Facebook URLs in search results
      const fbRegex = /https:\/\/(?:www\.)?facebook\.com\/[a-zA-Z0-9.]+/g;
      const fbMatches = html.match(fbRegex);
      
      if (fbMatches) {
        // Deduplicate
        const unique = [...new Set(fbMatches)];
        results.push({
          courtId: court.id,
          courtName: court.name,
          platform: 'Facebook',
          url: unique[0]
        });
        console.log(`  Found Facebook: ${court.name} → ${unique[0]}`);
      }
      
      // Polite delay
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      // Skip on error
    }
  }
  
  console.log(`  Found ${results.length} Facebook pages`);
  return results;
}

// ============================================================
// STEP 5: Search Onda Fit venues
// ============================================================
async function searchOndaFit(courts) {
  console.log('\n=== STEP 5: Searching Onda Fit venues ===');
  
  // Try to fetch Onda Fit venue listing
  const results = [];
  
  // Known Onda Fit venues from research
  const knownOnda = [
    { name: 'The Courts of Cebu', slug: 'the-courts-of-cebu' },
    { name: 'Thirsty Pickle', slug: 'thirsty-pickle' },
  ];
  
  for (const court of courts) {
    const found = knownOnda.find(o => normalizeName(o.name) === normalizeName(court.name));
    if (found) {
      results.push({
        courtId: court.id,
        courtName: court.name,
        platform: 'Onda Fit',
        url: `https://app.onda.fit/book/${found.slug}`
      });
    }
  }
  
  console.log(`  Found ${results.length} Onda Fit matches`);
  return results;
}

// ============================================================
// STEP 6: Search Sport360 venues
// ============================================================
async function searchSport360(courts) {
  console.log('\n=== STEP 6: Searching Sport360 venues ===');
  
  const results = [];
  
  // Known Sport360 venues
  const known360 = [
    { name: 'SMASH Sports Facilities', slug: 'smash' },
    { name: 'Qusina PIQLE QLUB', slug: 'qusina-piqle-qlub' },
    { name: 'Orosia Pickleball Courts', slug: 'orosia-pickleball-courts' },
    { name: 'The Pickle Den', slug: 'the-pickle-den' },
    { name: 'CB Mall Sports Centre', slug: 'cb-mall-sports-centre' },
    { name: 'South Pickle Hub', slug: 'south-pickle-hub' },
    { name: "Athlete's Zone Sports Center", slug: 'athletes-zone-sports-center' },
    { name: 'The Pickler Pod', slug: 'the-pickler-pod' },
  ];
  
  for (const court of courts) {
    const found = known360.find(o => normalizeName(o.name) === normalizeName(court.name));
    if (found) {
      results.push({
        courtId: court.id,
        courtName: court.name,
        platform: 'Sport360',
        url: `https://app.sports360.ph/sportshub/${found.slug}`
      });
    }
  }
  
  console.log(`  Found ${results.length} Sport360 matches`);
  return results;
}

// ============================================================
// STEP 7: Check for venue websites in notes/contact
// ============================================================
function extractWebsites(courts) {
  console.log('\n=== STEP 7: Extracting website URLs from data ===');
  
  const results = [];
  
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9][-a-zA-Z0-9]*\.[a-z]{2,}(?:\.[a-z]{2})?(?:\/[^\s,]*)?)/gi;
  
  for (const court of courts) {
    // Check if the court has a website in database
    if (court.contact) {
      const urls = court.contact.match(urlRegex);
      if (urls) {
        urls.forEach(url => {
          if (!url.match(/facebook|instagram|fb\.me/i) && !url.match(/^\d+$/)) {
            const fullUrl = url.startsWith('http') ? url : 'https://' + url;
            results.push({
              courtId: court.id,
              courtName: court.name,
              platform: 'Website',
              url: fullUrl
            });
          }
        });
      }
    }
  }
  
  console.log(`  Found ${results.length} website URLs`);
  return results;
}

// ============================================================
// STEP 8: Generate enriched output
// ============================================================
function generateOutput(courts, courtogoMatches, facebookResults, ondaResults, sport360Results, websiteResults) {
  console.log('\n=== STEP 8: Generating enriched output ===');
  
  const bookingMap = {};
  
  // Build a lookup by court ID
  for (const court of courts) {
    bookingMap[court.id] = {
      name: court.name,
      booking: null
    };
  }
  
  // Apply Courtogo matches
  for (const m of courtogoMatches) {
    if (bookingMap[m.courtId]) {
      bookingMap[m.courtId].booking = {
        platform: 'Courtogo',
        url: m.url,
        label: 'Book via Courtogo'
      };
    }
  }
  
  // Apply Onda Fit matches
  for (const m of ondaResults) {
    if (bookingMap[m.courtId] && !bookingMap[m.courtId].booking) {
      bookingMap[m.courtId].booking = {
        platform: 'Onda Fit',
        url: m.url,
        label: 'Book via Onda Fit'
      };
    }
  }
  
  // Apply Sport360 matches
  for (const m of sport360Results) {
    if (bookingMap[m.courtId] && !bookingMap[m.courtId].booking) {
      bookingMap[m.courtId].booking = {
        platform: 'Sport360',
        url: m.url,
        label: 'Book via Sport360'
      };
    }
  }
  
  // Apply website results
  for (const m of websiteResults) {
    if (bookingMap[m.courtId] && !bookingMap[m.courtId].booking) {
      bookingMap[m.courtId].booking = {
        platform: m.platform,
        url: m.url,
        label: 'Visit Website'
      };
    }
  }
  
  // Apply Facebook results
  for (const m of facebookResults) {
    if (bookingMap[m.courtId] && !bookingMap[m.courtId].booking) {
      bookingMap[m.courtId].booking = {
        platform: 'Facebook',
        url: m.url,
        label: 'Message on Facebook'
      };
    }
  }
  
  const enriched = Object.entries(bookingMap)
    .filter(([_, v]) => v.booking)
    .map(([id, v]) => ({ id, ...v }));
  
  console.log(`  ${enriched.length} courts have booking links`);
  console.log(`  ${Object.keys(bookingMap).length - enriched.length} courts still need booking links`);
  
  // Count by platform
  const byPlatform = {};
  enriched.forEach(e => {
    const p = e.booking.platform;
    byPlatform[p] = (byPlatform[p] || 0) + 1;
  });
  console.log('  By platform:', byPlatform);
  
  // Write output
  const output = {
    generated: new Date().toISOString(),
    totalCourts: courts.length,
    enrichedCount: enriched.length,
    byPlatform,
    bookings: bookingMap
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`  Written to ${OUTPUT_FILE}`);
  
  // Also generate the JS lookup table update
  return output;
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  const args = process.argv.slice(2);
  const doFetch = args.includes('--fetch');
  
  console.log('=== PickleSpotPH Booking Links Scraper ===');
  console.log('Mode: ' + (doFetch ? 'FETCH (live scraping)' : 'CACHE (use existing data)'));
  
  // Step 1: Load courts
  const courts = loadOurCourts();
  
  // Step 2: Scrape Courtogo
  const courtogoVenues = await scrapeCourtogoVenues(doFetch);
  
  // Step 3: Match
  const { matches: courtogoMatches, unmatched } = matchCourts(courts, courtogoVenues);
  
  // Step 4: Facebook search (skip if not fetching)
  let facebookResults = [];
  if (doFetch) {
    const fbCourts = courts.filter(c => !courtogoMatches.find(m => m.courtId === c.id));
    facebookResults = await searchFacebookPages(fbCourts.slice(0, 20)); // limit to 20
  }
  
  // Step 5: Onda Fit
  const ondaResults = await searchOndaFit(courts);
  
  // Step 6: Sport360
  const sport360Results = await searchSport360(courts);
  
  // Step 7: Websites from data
  const websiteResults = extractWebsites(courts);
  
  // Step 8: Generate output
  generateOutput(courts, courtogoMatches, facebookResults, ondaResults, sport360Results, websiteResults);
  
  console.log('\nDone!');
}

main().catch(e => console.error('Error:', e));
