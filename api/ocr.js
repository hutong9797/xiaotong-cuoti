export default async function handler(req, res) {
  // 设置 CORS 头
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
    // 接收前端传来的 base64 图片数据
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image field' });
    }

    // 使用 OCR.space 免费 API（无需安装额外 npm 包）
    const formData = new URLSearchParams();
    formData.append('base64Image', image);
    formData.append('language', 'chs');  // 简体中文
    formData.append('isOverlayRequired', 'false');

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': 'K83546863988957',  // OCR.space 免费 API Key
      },
      body: formData,
    });

    const data = await response.json();

    // 将 OCR.space 的返回格式转换为前端期望的格式
    if (data && data.ParsedResults && data.ParsedResults.length > 0) {
      const parsedText = data.ParsedResults[0].ParsedText || '';
      return res.status(200).json({ text: parsedText });
    } else if (data && data.ErrorMessage) {
      return res.status(500).json({ error: data.ErrorMessage });
    } else {
      return res.status(200).json({ text: '' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
