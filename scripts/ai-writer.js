var https = require('https');

var PROVIDERS = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama3-70b-8192',
    headers: function(apiKey) {
      return {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      };
    }
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'meta-llama/llama-3.1-70b-instruct:free',
    headers: function(apiKey) {
      return {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      };
    }
  }
};

function getConfig() {
  var provider = process.env.AI_PROVIDER || 'groq';
  var apiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY || '';
  return { provider: provider, apiKey: apiKey, config: PROVIDERS[provider] || PROVIDERS.groq };
}

function generatePrompt(category, title, sourceName, sourceLink, description) {
  var styleGuide = {
    News: 'Write an engaging news article. Start with a hook question that the article answers. Include key facts, quotes if known, and context about why this matters for PH pickleball. End with source attribution.',
    Features: 'Write an in-depth feature article. Start with a compelling question. Cover background context, current developments, challenges, and future outlook. Use quotes and data where available.',
    Guides: 'Write a practical how-to guide. Start with a question addressing the reader\'s pain point. Break down steps or options clearly. Include specific PH prices, local recommendations, and pro tips. End with a call to action.',
    Gear: 'Write a product-focused review/guide. Start with a question about what to buy. Compare options with specific PH prices, pros/cons, and where to buy locally. Include recommendations for different budgets.'
  };

  return 'You are a Filipino sports journalist writing for PickleSpotPH, a Philippine pickleball website. Write a well-researched article in HTML format (use <p>, <h2>, <h3>, <ul>/<li>, <strong>, <em> tags). Use the EXACT style of the existing articles:\n\n'
    + '- First sentence: a short question that hooks the reader, immediately answered\n'
    + '- Conversational but authoritative tone (Filipino English)\n'
    + '- Short paragraphs (2-4 sentences)\n'
    + '- Em dashes (\u2014) for emphasis\n'
    + '- Bold for key numbers, prices, names\n'
    + '- Use <h2> for sections, <h3> for subsections\n'
    + '- Bullet points for lists\n'
    + '- Include specific PH prices in pesos where relevant\n'
    + '- Add source attribution at the end: <p><em>Source: [source name]</em></p>\n'
    + '- DO NOT add related article links (those are added separately)\n'
    + '- Target 300-500 words total\n\n'
    + styleGuide[category] + '\n\n'
    + 'Article title: "' + title + '"\n'
    + 'Category: ' + category + '\n'
    + 'Source: ' + sourceName + '\n'
    + 'Source URL: ' + sourceLink + '\n'
    + 'Additional context: ' + (description || 'Not available') + '\n\n'
    + 'Write ONLY the HTML content (no markdown, no code fences, no extra text before/after). Start directly with the <p> tag.';
}

function callLLM(prompt) {
  return new Promise(function(resolve, reject) {
    var cfg = getConfig();
    if (!cfg.apiKey) {
      resolve(null);
      return;
    }

    var payload = JSON.stringify({
      model: cfg.config.model,
      messages: [
        { role: 'system', content: 'You are a Philippine pickleball journalist writing for PickleSpotPH. Write in HTML format. Output ONLY the HTML content, no markdown or code fences.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    var options = {
      method: 'POST',
      headers: cfg.config.headers(cfg.apiKey)
    };
    options.headers['Content-Length'] = Buffer.byteLength(payload);

    var req = https.request(cfg.config.url, options, function(res) {
      var data = '';
      res.on('data', function(c) { data += c; });
      res.on('end', function() {
        try {
          var parsed = JSON.parse(data);
          if (parsed.choices && parsed.choices[0] && parsed.choices[0].message) {
            resolve(parsed.choices[0].message.content.trim());
          } else if (parsed.error) {
            console.error('AI API error: ' + (parsed.error.message || JSON.stringify(parsed.error)));
            resolve(null);
          } else {
            console.error('Unexpected AI response: ' + data.substring(0, 300));
            resolve(null);
          }
        } catch (e) {
          console.error('Failed to parse AI response: ' + e.message);
          resolve(null);
        }
      });
    });

    req.on('error', function(e) {
      console.error('AI API request failed: ' + e.message);
      resolve(null);
    });

    req.write(payload);
    req.end();
  });
}

function cleanContent(raw) {
  if (!raw) return null;
  var cleaned = raw
    .replace(/```html/gi, '')
    .replace(/```/g, '')
    .trim();
  if (!cleaned.startsWith('<')) {
    cleaned = '<p>' + cleaned + '</p>';
  }
  return cleaned;
}

async function writeArticle(category, title, sourceName, sourceLink, description) {
  var prompt = generatePrompt(category, title, sourceName, sourceLink, description);
  var raw = await callLLM(prompt);

  if (!raw) return null;

  return cleanContent(raw);
}

module.exports = { writeArticle: writeArticle, getConfig: getConfig };

if (require.main === module) {
  var samplePrompt = generatePrompt('News', 'Test article title', 'Test Source', 'https://example.com', 'Test description');
  console.log('Prompt length: ' + samplePrompt.length + ' chars');
  console.log('API key configured: ' + (getConfig().apiKey ? 'YES' : 'NO'));
}
