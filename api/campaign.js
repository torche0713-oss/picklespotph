const https = require('https');

const PROJECT_ID = 'picklespotph-8553a';
const API_KEY = 'AIzaSyC33FcO7YxNVpJE7pt8QrNfBVaQ0R6XOps';

function firestoreGetAll(collectionId) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      structuredQuery: {
        from: [{ collectionId }]
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

function brevoSend(batch) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(batch);
    const opts = {
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, htmlBody, senderName, senderEmail } = req.body || {};
  if (!subject || !htmlBody || !senderEmail) {
    return res.status(400).json({ error: 'Missing required fields: subject, htmlBody, senderEmail' });
  }

  try {
    const result = await firestoreGetAll('subscribers');
    const docs = Array.isArray(result) ? result.filter(r => r.document) : [];
    const emails = docs.map(d => d.document?.fields?.email?.stringValue || '').filter(Boolean);

    if (emails.length === 0) {
      return res.status(200).json({ sent: 0, total: 0, message: 'No subscribers found.' });
    }

    const brevoKey = process.env.BREVO_API_KEY;
    if (!brevoKey) {
      return res.status(200).json({
        sent: 0,
        total: emails.length,
        message: 'Brevo API key not configured. Set BREVO_API_KEY in Vercel environment variables.',
        emails
      });
    }

    const batch = {
      sender: { name: senderName || 'PickleSpotPH', email: senderEmail },
      to: emails.map(e => ({ email: e })),
      subject,
      htmlContent: htmlBody
    };

    const brevoRes = await brevoSend(batch);
    const messageId = brevoRes?.messageId || '';

    res.status(200).json({
      sent: emails.length,
      total: emails.length,
      messageId,
      message: `Campaign sent to ${emails.length} subscriber(s) via Brevo.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
