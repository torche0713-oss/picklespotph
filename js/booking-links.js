// ============================================================
// BOOKING LINKS — Court booking platform URL lookup table
// ============================================================
// Maps court names/IDs to their booking URLs on external platforms.
// Used to show "Book Now" buttons on court detail pages.
//
// PLATFORMS:
//   courtogo  → https://www.courtogo.com/venues/{slug}
//   onda      → https://app.onda.fit/book/{slug}
//   sports360 → https://app.sports360.ph/sportshub/{slug}
//   picklehub → https://picklehub.ph/{slug}
//   playserve → https://{subdomain}.playserve.app
//   website   → venue's own website
//   facebook  → Facebook page URL
// ============================================================

// ============================================================
// SECTION 1: Venue booking URL lookup by court ID (slug)
// ============================================================
const BOOKING_BY_ID = {

  // --- Onda Fit venues ---
  "the-courts-of-cebu": {
    onda: "https://app.onda.fit/book/the-courts-of-cebu",
    platform: "Onda Fit",
    label: "Book via Onda Fit"
  },
  "thirsty-pickle": {
    onda: "https://app.onda.fit/book/thirsty-pickle",
    platform: "Onda Fit",
    label: "Book via Onda Fit"
  },
  "rocket-pickle-cebu": {
    website: "https://www.rocketpicklecebu.com/book",
    platform: "Website",
    label: "Book Online"
  },

  // --- Sport360 venues ---
  "smash-sports-facilities": {
    sports360: "https://app.sports360.ph/sportshub/smash",
    platform: "Sport360",
    label: "Book via Sport360"
  },
  "qusina": {
    sports360: "https://app.sports360.ph/sportshub/qusina-piqle-qlub",
    platform: "Sport360",
    label: "Book via Sport360"
  },
  "orosia-food-park": {
    sports360: "https://app.sports360.ph/sportshub/orosia-pickleball-courts",
    platform: "Sport360",
    label: "Book via Sport360"
  },
  "parqlinks-pickleball-court": {
    sports360: "https://app.sports360.ph",
    platform: "Sport360",
    label: "Book via Sport360"
  },

  // --- PlayServe venues ---
  "picklebear-pickleball-court": {
    playserve: "https://pickleballelites.playserve.app",
    platform: "PlayServe",
    label: "Book via PlayServe"
  },

  // --- PickleHub venues ---
  "pickle-pares-hub": {
    platform: "PickleHub",
    label: "Listed on PickleHub"
  },
  "warehouse-sports-club": {
    website: "https://picklehub.ph",
    platform: "PickleHub",
    label: "Listed on PickleHub"
  },

  // --- Venue websites ---
  "hq-pickleball-court": {
    website: "https://hqpickleballcebu.com",
    platform: "Website",
    label: "Visit Website"
  },
  "citiloft": {
    website: "https://citiloft.com",
    platform: "Website",
    label: "Visit Website"
  },
  "mactan-pickleball-club": {
    website: "https://mactanpickleballclub.com",
    platform: "Website",
    label: "Visit Website"
  },
  "pickaball-sports-center": {
    website: "https://pickaballsportscenter.com",
    platform: "Website",
    label: "Visit Website"
  },
  "matchpoint-liloan": {
    platform: "Facebook",
    facebook: "https://facebook.com/matchpointliloan",
    label: "Message on Facebook"
  },

  // --- Courtogo venues (matched from sitemap) ---
  "homecourt-cebu": {
    courtogo: "https://www.courtogo.com/venues/homecourt-yard",
    platform: "Courtogo",
    label: "Book via Courtogo"
  },
  "paddle-ground": {
    courtogo: "https://www.courtogo.com/venues/paddle-ground",
    platform: "Courtogo",
    label: "Book via Courtogo"
  },

  // --- Facebook-based booking ---
  "88th-avenue-cebu": {
    facebook: "https://facebook.com/88thavenuepickleclub",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "dh-sports-hub": {
    facebook: "https://facebook.com/dhsportshub",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "net-and-paddle": {
    facebook: "https://facebook.com/netandpaddle",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "nomads-pickleball": {
    facebook: "https://facebook.com/nomadspickleballcebu",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "pickaboo-picklefarm": {
    facebook: "https://facebook.com/pickaboopicklefarm",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "pino-pickleball-court": {
    facebook: "https://facebook.com/pinopickleball",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "south-agora": {
    facebook: "https://facebook.com/southagorapickleball",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "sweet-spot-pickleball-courts": {
    facebook: "https://facebook.com/sweetspotpickleballcebu",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "the-kiln": {
    facebook: "https://facebook.com/pickleatthekiln",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "the-picklepoint-cebu": {
    facebook: "https://facebook.com/thepicklepointcebu",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "the-royall-courts": {
    facebook: "https://facebook.com/theroyallcourts",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "updraft-coffee": {
    facebook: "https://facebook.com/updraftcoffeecebu",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "vybe-picklehaus": {
    facebook: "https://facebook.com/vybepicklehaus",
    platform: "Facebook",
    label: "Message on Facebook"
  },
  "ybpickle": {
    facebook: "https://facebook.com/ybpickle",
    platform: "Facebook",
    label: "Message on Facebook"
  }
};

// ============================================================
// SECTION 2: Courtogo venues — full sitemap lookup by slug
// Maps names from Courtogo sitemap to our court names
// ============================================================
const COURTOGO_VENUES = {
  "reset-ilg":                   { name: "Reset ILG",                   city: "Iligan City" },
  "marmon-pickleball":           { name: "Marmon Pickleball",           city: "Talisay City" },
  "niceserve-pickleball-court":  { name: "NiceServe Pickleball Court",  city: "Lapu-Lapu City" },
  "tfag-pickleball-court":       { name: "TFAG Pickleball Court",       city: "Talisay City" },
  "paddle-haus-iligan":          { name: "Paddle Haus Iligan",          city: "Iligan City" },
  "hidden-point-":               { name: "Hidden Point",                city: "Manticao" },
  "rove-courtyard":              { name: "Rove Courtyard",              city: "Cagayan De Oro" },
  "the-paddle-pod":              { name: "The Paddle Pod",              city: "Iligan City" },
  "dink-at-c3":                  { name: "Dink at C3",                  city: "Iligan City" },
  "dp-courts":                   { name: "DP Courts",                   city: "Iligan City" },
  "netplay-court":               { name: "NetPlay Court",               city: "Iligan City" },
  "jims-pickle-court":           { name: "Jims Pickle Court",           city: "Marawi City" },
  "pf-pickle-yard":              { name: "PF Pickle Yard",              city: "Tantangan" },
  "the-hideout":                 { name: "The Hideout",                 city: "Iligan City" },
  "smash-rally-courts":          { name: "Smash & Rally Courts",        city: "Lucena" },
  "paddle-ground":               { name: "Paddle Ground",               city: "Tubod" },
  "lakeside-paddlers":           { name: "Lakeside Paddlers",           city: "Marawi" },
  "paddle-yard":                 { name: "Paddle Yard",                 city: "Iligan City" },
  "the-paddle-nation":           { name: "The Paddle Nation",           city: "Iligan City" },
  "paddle-grove-iligan":         { name: "Paddle Grove Iligan",         city: "Iligan City" },
  "the-paddle-grounds":          { name: "The Paddle Grounds",          city: "Iligan City" },
  "side-court-pickleball":       { name: "Side Court Pickleball",       city: "Iligan City" },
  "soti-courtside":              { name: "Soti Courtside",              city: "Marawi City" },
  "court-yard-central-iligan-city": { name: "Court Yard Central",      city: "Iligan City" },
  "wrong-house":                 { name: "Wrong House",                 city: "Iligan City" },
  "district-four-pickleball-court": { name: "District Four Pickleball Court", city: "Mariveles" },
  "home-court":                  { name: "Home Court",                  city: "Koronadal City" },
  "rams-pickleball-hub":         { name: "RAMS Pickleball Hub",         city: "Saguiaran" },
  "paddle-patio":                { name: "Paddle Patio",                city: "Iligan City" },
  "openiano-mango-farm-pickleball-court": { name: "Openiano Mango Farm & Pickleball Court", city: "Linamon" },
  "the-big-g-pickleball-point":  { name: "The Big G Pickleball Point",  city: "Talibon" },
  "jigzee-pickleball":           { name: "Jigzee Pickleball",           city: "Balo-I" },
  "nrt-events-center-pickleball-basketball-events": { name: "NRT Events Center", city: "General Santos City" },
  "port-dinkers-":               { name: "Port Dinkers",                city: "Iligan City" },
  "astana-lakeview-pickleball-court--mrdccnye": { name: "Astana Lakeview Pickleball Court", city: "Marawi City" },
  "dink-ao-manticao-pickleball-club": { name: "DINK-AO Manticao Pickleball Club", city: "Manticao" },
  "dinkers-camp":                { name: "Dinkers Camp",                city: "Iligan City" },
  "courtly-pickleball-cdo":      { name: "Courtly Pickleball CDO",      city: "Cagayan de Oro City" },
  "homecourt-yard":              { name: "HomeCourt Yard",              city: "Balamban" },
  "rodney-pickleball-spot":      { name: "Rodney Pickleball Spot",      city: "Villanueva" },
  "redpoint-pickle-hub":         { name: "RedPoint Pickle Hub",         city: "Iligan City" },
  "flick-pickleball":            { name: "Flick Pickleball",            city: "Sibulan" },
  "pickle-point-mqtdw96u":       { name: "Pickle Point",                city: "Iligan City" },
  "g-court-yard":                { name: "G Court Yard",                city: "Saguiaran" },
  "stayfit-pickle-courts":       { name: "Stayfit Pickle Courts",       city: "Iligan City" },
  "pickle-point":                { name: "Pickle Point",                city: "Cagayan de Oro City" },
  "pikcleyard":                  { name: "PikcleYard",                  city: "Albuquerque" },
  "sip-serve":                   { name: "Sip & Serve",                 city: "Iligan City" },
  "dcb-pickleball-club":         { name: "DCB Pickleball Club",         city: "Lagonglong" },
  "open-kitchen-pickleball":     { name: "Open Kitchen Pickleball",     city: "Iligan City" },
  "pickle-point-molave":         { name: "Pickle Point - Molave",       city: "Molave" },
  "jas-pickleball-court":        { name: "JAS Pickleball Court",        city: "Marawi City" },
  "the-courtside-pickle":        { name: "The Courtside Pickle",        city: "Cagayan de Oro City" },
  "just-dink-marawi":            { name: "Just Dink! MARAWI",           city: "Marawi City" },
  "smash-point-pickleball-court":{ name: "Smash Point Pickleball Court", city: "Balingasag" },
  "dink-district":               { name: "Dink District",               city: "Cagayan de oro city" },
  "skydink-pickleball":          { name: "Skydink Pickleball",          city: "Marawi City" },
  "dynamic-herb-sports-":        { name: "DYNAMIC HERB SPORTS",         city: "Cebu City" },
  "tm-square-sports-hub":        { name: "TM Square Sports Hub",        city: "Marantao" },
  "the-pickle-jam":              { name: "The Pickle Jam",              city: "Tanjay City" },
  "around-the-post":             { name: "Around The Post",             city: "Minglanilla" },
  "homecourt-pickleball-lapasan-clarin": { name: "HomeCourt Pickleball - Lapasan, Clarin", city: "Clarin" },
  "one-paseo-sports-hub":        { name: "One Paseo Sports Hub",        city: "Cagayan de Oro City" },
  "pickle-land":                 { name: "Pickle Land",                 city: "Dauis" },
  "picklegaaa":                  { name: "PICKLEGAAA",                  city: "Dauis" },
  "jms-dink-n-drive":            { name: "Jm's Dink N drive",           city: "Iligan city" },
  "streetside":                  { name: "StreetSide",                  city: "Iligan city" },
  "twix-pickleball-court":       { name: "Twix Pickleball Court",       city: "Talibon" },
  "-910":                        { name: "9.10",                        city: "Talisay" },
  "dink-zone":                   { name: "Dink Zone",                   city: "Cagayan de Oro City" },
  "the-picklehall-simala":       { name: "The PickleHall - Simala",     city: "Sibonga" },
  "rrk-pickle-courts":           { name: "RRK Pickle Courts",           city: "Dauis" },
  "le-pickleball-farmyard-":     { name: "LE Pickleball Farmyard",      city: "Zamboanga City" },
  "gl-pickle-hub":               { name: "GL Pickle Hub",               city: "Molave Municipality" },
  "pickle-purple":               { name: "Pickle purple",               city: "Iligan" },
  "saffy-paddle-yard":           { name: "Saffy Paddle Yard",           city: "Iligan City" },
  "paseo-pickle-zone":           { name: "Paseo Pickle Zone",           city: "Iligan City" },
  "dink-ta-doi":                 { name: "Dink Ta Doi",                 city: "Toledo, Cebu" },
  "the-backyard-pickleball":     { name: "The Backyard Pickleball",     city: "Bacolod city" },
  "swing-lane-cavite":           { name: "Swing Lane Cavite",           city: "Noveleta" },
  "ibt-badminton-sports-center": { name: "IBT Badminton Sports Center", city: "Iligan City" },
  "franita-seaside-picklers":    { name: "Franita Seaside Picklers",    city: "Iligan City" },
  "picklefox":                   { name: "PICKLEFOX",                   city: "Loon" },
  "frontyard-pickleball-and-typti-court": { name: "Frontyard Pickleball and Typti Court", city: "Cagayan de Oro City" },
  "court-hub":                   { name: "Court Hub",                   city: "Iligan" },
  "iligan-pickle-yard":          { name: "Iligan Pickle Yard",          city: "Iligan" },
  "alrajj-private-pickleball-court": { name: "ALRAJJ PRIVATE PICKLEBALL COURT", city: "Marawi City" },
  "dinkerz-den":                 { name: "Dinkerz Den",                 city: "Iligan City" },
  "a4-pickleball-":              { name: "A4 Pickleball",               city: "Cebu City" },
  "brookside-pickleball-court":  { name: "Brookside Pickleball Court",  city: "Iligan City" },
  "charlys-angel-pb-court":      { name: "Charly's Angel PB court",     city: "Marawi City" },
  "nature-zone-pickleball-club": { name: "Nature Zone Pickleball Club", city: "Iligan" },
  "lastpick":                    { name: "lastpick",                    city: "Iligan City" },
  "bobbys-pikolbolan":           { name: "BOBBY'S PIKOLBOLAN",          city: "Iligan City" },
  "lao-resort-pickleball-covered-court": { name: "Lao resort pickleball covered court", city: "Davao City" },
  "the-pikol-kurt":              { name: "The Pikol Kurt",              city: "Barangay Talungon" },
  "tayud-pickle-hub":            { name: "Tayud Pickle Hub",            city: "Liloan" },
  "the-playground-pickleball-court-cafe": { name: "The Playground - Pickleball Court & Cafe", city: "Tago" },
  "d-dink-spot":                 { name: "D' Dink Spot",                city: "Iligan City" },
  "spins-pickleball":            { name: "Spins Pickleball",            city: "Lapu-Lapu City" },
  "spinhub-pickleball-court":    { name: "SpinHub Pickleball Court",    city: "Santa Catalina" },
  "the-courtyard-by-itqaan-residences": { name: "The Courtyard by Itqaan Residences", city: "Iligan city" },
  "court-sample-lab":            { name: "Court Sample Lab",            city: "Cagayan De Oro City" },
  "dink-village-tubod-ldn-":     { name: "Dink Village - Tubod, LDN",   city: "Tubod" },
  "gsb-side-out":                { name: "GSB Side-Out",                city: "Cagayan De Oro City" },
  "the-raket-clinic":            { name: "The Raket Clinic",            city: "Lopez Jaena" },
  "smashpointiligan":            { name: "SmashPoint.Iligan",           city: "Iligan" },
  "saint-jude-pickleball-court": { name: "Saint Jude Pickleball court", city: "Ozamiz City" },
  "pickleball-mangrove":         { name: "Pickleball @ Mangrove",       city: "Iligan City" },
  "paddle-zone":                 { name: "Paddle ZONE",                 city: "Iligan city" },
  "pickle-home":                 { name: "Pickle Home",                 city: "Dauis" },
  "pcklrad":                     { name: "Pcklrad.",                    city: "Bacolod" },
  "pickleverse-ph":              { name: "Pickleverse PH",              city: "Iligan city" },
  "portside-rally":              { name: "PORTSIDE RALLY",              city: "ILIGAN CITY" },
  "jp-pickleball":               { name: "JP PICKLEBALL",               city: "Iligan City" },
  "puerto-pickle-bay":           { name: "Puerto Pickle Bay",           city: "Cagayan de Oro" },
  "astana-lakeview-pickleball-court-": { name: "Astana Lakeview Pickleball Court", city: "Marawi City" },
  "easton-pickleball":           { name: "Easton Pickleball",           city: "Cagayan de Oro City" },
  "yodads-pickle-house":         { name: "Yodads Pickle House",         city: "Catigbian" },
  "bayug-pickleball":            { name: "Bayug Pickleball",            city: "Iligan city" },
  "mmvhoa-tennis-court":         { name: "MMVHOA Tennis Court",         city: "Cagayan de Oro" },
  "north-point-pickleball-court":{ name: "North Point Pickleball Court", city: "Cordova" },
  "dinkyard":                    { name: "Dinkyard",                    city: "Iligan City" },
  "3ds-pickleball":              { name: "3DS Pickleball",              city: "Oroquieta City" },
  "ohana-pickleball-court":      { name: "Ohana Pickleball Court",      city: "Iligan City" },
  "the-backyard-court":          { name: "The Backyard Court",          city: "Calaca City" },
  "dink-xcape-picklehub":        { name: "Dink Xcape PickleHub",        city: "Cagayan de Oro City" },
  "the-paddle-yard":             { name: "The Paddle Yard",             city: "Plaridel" },
  "adie-dink-pickle-court":      { name: "Adie Dink Pickle Court",      city: "Tubod" },
  "la-pickleball-court":         { name: "L.A. Pickleball Court",       city: "Iligan City" },
  "the-pickle-site":             { name: "The Pickle Site",             city: "Manolo Fortich" },
  "picklebear-lapu-lapu-city":   { name: "PickleBear Lapu Lapu City",   city: "Lapu Lapu" },
  "picklecamp-tubigon":          { name: "PickleCamp Tubigon",          city: "Tubigon" },
  "home-and-more-pickle-house-": { name: "Home and More Pickle House",  city: "Oroquieta City" },
  "supreme-court-home-of-lmb":   { name: "Supreme Court Home of LMB",   city: "Cotabato City" },
  "blue-gym-asesnso-iliganon-gymnasium": { name: "BLUE GYM - ASESNSO ILIGANON GYMNASIUM", city: "ILIGAN CITY" },
  "pickle-park":                 { name: "Pickle Park",                 city: "Malaybalay" },
  "pickle-zone":                 { name: "Pickle Zone",                 city: "Dauis" },
  "bluepro-badminton-courts":    { name: "Bluepro Badminton Courts",    city: "Cagayan de Oro" },
  "bd-courts":                   { name: "BD Courts",                   city: "Dapitan" },
  "morales-pickle-perch":        { name: "Morales Pickle Perch",        city: "Kabasalan" },
  "paddyspin-pickleball-court":  { name: "PaddySpin Pickleball Court",  city: "Tanjay city" },
  "dinking-for-11":              { name: "Dinking for 11",              city: "Iligan city" },
  "atp":                         { name: "A.T.P.",                      city: "Lapu-Lapu City" },
  "pickle-loy":                  { name: "Pickle Loy",                  city: "Jagna" },
  "kikx-pickleball-court":       { name: "Kikx Pickleball Court",       city: "Mati city" },
  "picklehaus-":                 { name: "PickleHaus",                  city: "Marawi City" },
  "the-smash-point":             { name: "The Smash Point",             city: "Iligan City" },
  "wet-market-courts":           { name: "Wet Market Courts",           city: "Iligan City" },
  "paddle-pals-spot":            { name: "Paddle Pals Spot",            city: "Iligan City" },
  "morales-picke-perch-mpp":     { name: "Morales Picke Perch MPP",     city: "Kabasalan" },
  "3s-pickleball-hub":           { name: "3s pickleball hub",           city: "Cagayan de oro" },
  "pickleland-molave":           { name: "pickleland molave",           city: "Molave" },
  "the-warehouse-pickleball-court": { name: "The Warehouse Pickleball Court", city: "Lala" },
  "chibs-n-dink":                { name: "Chibs N' Dink",               city: "Cebu City" },
  "north-point-dink":            { name: "North Point Dink",            city: "Cordova" },
  "pickl-pilit":                 { name: "Pickl @ Pilit",               city: "Mandaue" },
  "identity-pickleball":         { name: "Identity Pickleball",         city: "Iligan" },
  "the-rest-house-dink-swim":    { name: "The Rest House Dink & Swim",  city: "Iligan city" },
  "side-out":                    { name: "Side Out",                    city: "Manila" },
  "madz":                        { name: "MADZ",                        city: "Iligan City" },
  "nice-shot":                   { name: "NICE SHOT",                   city: "TAGBILARAN" },
  "bansalan-pickle-yard":        { name: "Bansalan Pickle Yard",        city: "Bansalan" },
  "pickle-yard":                 { name: "Pickle Yard",                 city: "Iligan City" },
  "river-dinks":                 { name: "River Dinks",                 city: "Balamban" },
  "9th-paddle":                  { name: "9th Paddle",                  city: "Iligan City" },
  "banyard-pickleball":          { name: "Banyard Pickleball",          city: "Iligan City" },
  "h30-pickle-yard":             { name: "H30 PICKLE YARD",             city: "Kalilangan" },
  "marina-pickleball-court":     { name: "Marina Pickleball Court",     city: "Surigao City" },
  "iligan-pickle-yards":         { name: "iligan pickle yards",         city: "Iligan city" },
  "j2m2-pickle-garage":          { name: "J2M2 Pickle Garage",          city: "Lapu-Lapu City" },
  "lipa-racket-club":            { name: "Lipa Racket Club",            city: "Lipa City" },
  "the-runway-pickleball-club":  { name: "The Runway Pickleball Club",  city: "Lapu Lapu" },
  "motherops-paddle-and-chill":  { name: "Motherops Paddle and Chill",  city: "Baroy" },
  "tengs-court":                 { name: "Teng's court",                city: "Cagayan de oro" },
  "courthaus-ph":                { name: "CourtHaus PH",                city: "Quezon City" },
  "cafe-del-riu-bbai-pickle-court": { name: "Cafe del Riu - BBAi Pickle Court", city: "Iligan City" },
  "3-kings-picklehub-":          { name: "3 Kings PickleHub",           city: "Calape" },
  "pikol-cdo":                   { name: "Pikol CDO",                   city: "Cagayan de Oro" },
  "rally-up":                    { name: "Rally Up",                    city: "Tubod" },
  "ag-pickleball-court":         { name: "AG Pickleball Court",         city: "Dumingag" },
  "fch-court-yard-":             { name: "FCH - Court Yard",            city: "Baroy" },
  "csr-pickleball-ave":          { name: "CSR Pickleball Ave",          city: "Makati City" },
  "club-17":                     { name: "Club 17",                     city: "Iligan City" },
  "pickle-match":                { name: "Pickle Match",                city: "Gingoog City" }
};

// ============================================================
// SECTION 3: Onda Fit venues
// ============================================================
const ONDA_VENUES = {
  "the-courts-of-cebu": "https://app.onda.fit/book/the-courts-of-cebu",
  "thirsty-pickle": "https://app.onda.fit/book/thirsty-pickle",
  "rocket-pickle-cebu": "https://app.onda.fit/book/rocket-pickle-cebu",
  "net-and-paddle": "https://app.onda.fit/book/net-and-paddle",
  "pickaball-sports-center": "https://app.onda.fit/book/pickaball-sports-center"
};

// ============================================================
// SECTION 4: Sport360 venues
// ============================================================
const SPORTS360_VENUES = {
  "smash-sports-facilities": "https://app.sports360.ph/sportshub/smash",
  "qusina": "https://app.sports360.ph/sportshub/qusina-piqle-qlub",
  "orosia-food-park": "https://app.sports360.ph/sportshub/orosia-pickleball-courts",
  "parqlinks-pickleball-court": "https://app.sports360.ph/sportshub/parqlinks"
};

// ============================================================
// SECTION 5: PlayServe venues  
// ============================================================
const PLAYSERVE_VENUES = {
  "picklebear-pickleball-court": "https://pickleballelites.playserve.app"
};

// ============================================================
// SECTION 6: PickleHub venues
// ============================================================
const PICKLEHUB_VENUES = {
  "pickle-pares-hub": "https://picklehub.ph/venues/pickle-pares-hub",
  "warehouse-sports-club": "https://picklehub.ph/venues/warehouse-sports-club"
};

// ============================================================
// SECTION 7: Lookup function
// ============================================================
function getBookingInfo(courtId, courtName) {
  // Normalize name for matching
  const key = courtId || (courtName ? courtName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : '');
  
  // Check direct match in BOOKING_BY_ID
  if (BOOKING_BY_ID[key]) {
    return BOOKING_BY_ID[key];
  }
  
  // Check Courtogo
  const courtogoSlug = Object.keys(COURTOGO_VENUES).find(slug => {
    const v = COURTOGO_VENUES[slug];
    return courtName && v.name.toLowerCase().includes(courtName.toLowerCase()) ||
           courtName && courtName.toLowerCase().includes(v.name.toLowerCase());
  });
  if (courtogoSlug) {
    return {
      courtogo: `https://www.courtogo.com/venues/${courtogoSlug}`,
      platform: "Courtogo",
      label: "Book via Courtogo"
    };
  }
  
  // Check Onda Fit
  if (ONDA_VENUES[key]) {
    return {
      onda: ONDA_VENUES[key],
      platform: "Onda Fit",
      label: "Book via Onda Fit"
    };
  }
  
  // Check Sport360
  if (SPORTS360_VENUES[key]) {
    return {
      sports360: SPORTS360_VENUES[key],
      platform: "Sport360",
      label: "Book via Sport360"
    };
  }
  
  // Check PlayServe
  if (PLAYSERVE_VENUES[key]) {
    return {
      playserve: PLAYSERVE_VENUES[key],
      platform: "PlayServe",
      label: "Book via PlayServe"
    };
  }
  
  // Check PickleHub
  if (PICKLEHUB_VENUES[key]) {
    return {
      picklehub: PICKLEHUB_VENUES[key],
      platform: "PickleHub",
      label: "Book via PickleHub"
    };
  }
  
  return null;
}

// ============================================================
// SECTION 8: Helper — generate "Book Now" button HTML
// ============================================================
function getBookingButtonHtml(courtId, courtName) {
  const info = getBookingInfo(courtId, courtName);
  if (!info) return '';
  
  const url = info.courtogo || info.onda || info.sports360 || info.playserve || info.picklehub || info.website || info.facebook;
  if (!url) return '';
  
  const colorMap = {
    'Onda Fit': '#6366f1',
    'Courtogo': '#0891b2',
    'Sport360': '#059669',
    'PlayServe': '#7c3aed',
    'PickleHub': '#ea580c',
    'Website': '#2563eb',
    'Facebook': '#1877f2'
  };
  const color = colorMap[info.platform] || '#2563eb';
  
  return `<a href="${url}" target="_blank" rel="noopener" class="btn-submit" style="display:block;text-align:center;background:${color};margin-top:8px"><i class="fas fa-external-link-alt"></i> ${info.label}</a>`;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BOOKING_BY_ID = BOOKING_BY_ID;
  window.COURTOGO_VENUES = COURTOGO_VENUES;
  window.ONDA_VENUES = ONDA_VENUES;
  window.SPORTS360_VENUES = SPORTS360_VENUES;
  window.PLAYSERVE_VENUES = PLAYSERVE_VENUES;
  window.PICKLEHUB_VENUES = PICKLEHUB_VENUES;
  window.getBookingInfo = getBookingInfo;
  window.getBookingButtonHtml = getBookingButtonHtml;
}
