const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image field' });
    }

    const params = new URLSearchParams();
    params.append('base64Image', image);
    params.append('language', 'chs');
    params.append('isOverlayRequired', 'false');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': 'K83546863988957',
      },
      body: params,
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'OCR.space failed: ' + response.status });
    }

    const data = await response.json();

    if (data && data.ParsedResults && data.ParsedResults.length > 0) {
      const parsedText = data.ParsedResults[0].ParsedText || '';
      return res.status(200).json({ text: parsedText });
    } else if (data && data.IsErroredOnProcessing) {
      return res.status(500).json({ error: data.ErrorMessage || 'OCR error' });
    } else {
      return res.status(200).json({ text: '' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
};
