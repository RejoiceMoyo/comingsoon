const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!code) {
    return res.status(400).json({ error: 'Missing code parameter' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      // Return token as JSON for the CMS
      return res.status(200).json({ token: data.access_token });
    } else {
      return res.status(400).json({ error: 'Failed to get access token', details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Authentication failed', message: error.message });
  }
};
