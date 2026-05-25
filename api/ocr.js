export default async function handler(req, res) {
  // 璁剧疆 CORS 澶?  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 鎺ユ敹鍓嶇浼犳潵鐨?base64 鍥剧墖鏁版嵁
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image field' });
    }

    // 鍘绘帀 data:xxx;base64, 鍓嶇紑锛屾嬁鍒扮函 base64
    const pureBase64 = image.includes(',') ? image.split(',')[1] : image;
    const buffer = Buffer.from(pureBase64, 'base64');

    // 杞彂鍒?EasyOCR API锛堜娇鐢?node-fetch 鍜?form-data锛?    const FormData = require('form-data');
    const fetch = require('node-fetch');
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'screenshot.png',
      contentType: 'image/png',
    });

    const response = await fetch('https://cn-api.easyocr.org/ocr', {
      method: 'POST',
      body: form,
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}