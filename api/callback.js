const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  
  if (!code) {
    return res.status(400).send('Missing code parameter');
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      const token = data.access_token;
      
      const html = '<!DOCTYPE html><html><head><title>Auth</title></head><body><script>' +
        'const token = "' + token + '";' +
        'const provider = "github";' +
        'function receiveMessage(e) {' +
        '  window.opener.postMessage(' +
        '    "authorization:" + provider + ":success:" + JSON.stringify({token: token, provider: provider}),' +
        '    e.origin' +
        '  );' +
        '}' +
        'window.addEventListener("message", receiveMessage, false);' +
        'window.opener.postMessage("authorizing:" + provider, "*");' +
        '</script></body></html>';
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } else {
      return res.status(400).send('Failed to get token: ' + JSON.stringify(data));
    }
  } catch (error) {
    return res.status(500).send('Error: ' + error.message);
  }
};
