// ============================================================
// PICKLESPOT PH — Batch Import Master Courts to Firestore
// ============================================================
// Usage: node import-master-courts.js
// Requires: service-account.json in project root (see below)
// ============================================================
// HOW TO GET service-account.json:
//   1. Go to https://console.firebase.google.com/project/picklespotph-8553a/settings/serviceaccounts/adminsdk
//   2. Click "Generate new private key"
//   3. Save the downloaded file as "service-account.json" in this folder
//   4. Run: node import-master-courts.js
// ============================================================

const fs = require('fs');
const path = require('path');
const { cert, initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Load master courts data
const MASTER = require('./js/master-courts-compiled.js');

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('='.repeat(60));
  console.error('  MISSING: service-account.json');
  console.error('='.repeat(60));
  console.error('');
  console.error('  Please download your Firebase service account key:');
  console.error('  1. Go to: https://console.firebase.google.com/project/picklespotph-8553a/settings/serviceaccounts/adminsdk');
  console.error('  2. Click "Generate new private key"');
  console.error('  3. Save it as "service-account.json" in the project root');
  console.error('  4. Run this script again: node import-master-courts.js');
  console.error('');
  process.exit(1);
}

const serviceAccount = require(SERVICE_ACCOUNT_PATH);

initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = getFirestore();
const COURTS_COLLECTION = 'courts';

// ============================================================
// Helpers
// ============================================================

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toFirestoreDoc(court, index) {
  return {
    name: court.name || '',
    address: court.address || '',
    city: court.city || '',
    province: court.province || '',
    region: court.region || '',
    type: court.type || 'Outdoor',
    courts: Number(court.courts) || 1,
    access: court.access || 'Paid',
    contact: court.contact || '',
    hours: court.hours || '',
    lat: Number(court.lat) || 0,
    lng: Number(court.lng) || 0,
    amenities: court.amenities || [],
    notes: court.notes || '',
    verified: false,
    featured: false,
    ownerId: null,
    source: court.source || 'Master Compilation',
    createdAt: FieldValue.serverTimestamp()
  };
}

function courtMatches(a, b) {
  const an = a.name.toLowerCase().trim();
  const bn = b.name.toLowerCase().trim();
  if (an === bn) return true;
  if (an.includes(bn) || bn.includes(an)) return true;
  if (a.lat && a.lng && b.lat && b.lng) {
    const d = Math.abs(a.lat - b.lat) + Math.abs(a.lng - b.lng);
    if (d < 0.01) return true;
  }
  return false;
}

// ============================================================
// Flatten MASTER_COURTS into a single array
// ============================================================

function flattenCourts(data) {
  const list = [];
  for (const regionKey of Object.keys(data)) {
    if (regionKey === 'ppfNotables') continue;
    const region = data[regionKey];
    if (Array.isArray(region)) {
      list.push(...region);
    } else if (typeof region === 'object') {
      for (const cityKey of Object.keys(region)) {
        if (Array.isArray(region[cityKey])) {
          list.push(...region[cityKey]);
        }
      }
    }
  }
  return list;
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('='.repeat(60));
  console.log('  PICKLESPOT PH — Batch Import Master Courts');
  console.log('='.repeat(60));
  console.log('');

  const newCourts = flattenCourts(MASTER);
  console.log(`  Total courts in master file: ${newCourts.length}`);
  console.log('');

  // Fetch existing courts from Firestore
  console.log('  Fetching existing courts from Firestore...');
  const snapshot = await db.collection(COURTS_COLLECTION).get();
  const existing = [];
  snapshot.forEach(doc => existing.push({ id: doc.id, data: doc.data() }));
  console.log(`  Existing courts in Firestore: ${existing.length}`);
  console.log('');

  // Check for duplicates
  const toAdd = [];
  const skipped = [];

  for (let i = 0; i < newCourts.length; i++) {
    const court = newCourts[i];
    let isDuplicate = false;

    for (const ex of existing) {
      if (courtMatches(court, ex.data)) {
        isDuplicate = true;
        skipped.push({ court: court.name, match: ex.data.name });
        break;
      }
    }

    if (!isDuplicate) {
      toAdd.push(court);
    }
  }

  console.log(`  Courts to add (new):      ${toAdd.length}`);
  console.log(`  Courts skipped (dupes):   ${skipped.length}`);

  if (skipped.length > 0) {
    console.log('');
    console.log('  Skipped duplicates:');
    skipped.forEach(s => console.log(`    - "${s.court}" → matched existing "${s.match}"`));
  }

  if (toAdd.length === 0) {
    console.log('');
    console.log('  Nothing to import. All courts already exist in Firestore.');
    process.exit(0);
  }

  console.log('');
  console.log('  Starting import...');

  let added = 0;
  let errors = 0;

  for (let i = 0; i < toAdd.length; i++) {
    const court = toAdd[i];
    const docData = toFirestoreDoc(court, i);
    const docId = slugify(court.name) + '-' + Date.now() + '-' + i;

    try {
      await db.collection(COURTS_COLLECTION).doc(docId).set(docData);
      added++;
      process.stdout.write(`\r  Progress: ${added}/${toAdd.length} added (${errors} errors)`);
    } catch (err) {
      errors++;
      console.error(`\n  ERROR adding "${court.name}": ${err.message}`);
    }
  }

  console.log('');
  console.log('');
  console.log('='.repeat(60));
  console.log('  IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log(`  Added:   ${added}`);
  console.log(`  Errors:  ${errors}`);
  console.log(`  Skipped: ${skipped.length}`);
  console.log(`  Total Firestore courts now: ${existing.length + added}`);
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
