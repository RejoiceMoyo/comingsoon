const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;
  
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
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      // Send HTML that posts message back to parent window
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorizing...</title>
</head>
<body>
  <p>Authorization successful. Completing login...</p>
  <script>
    (function() {
      window.opener.postMessage(
        'authorization:github:success:{"token":"${data.access_token}","provider":"github"}',
        window.location.origin
      );
      
      setTimeout(function() {
        window.close();
      }, 1000);
    })();
  </script>
</body>
</html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } else {
      return res.status(400).json({ error: 'Failed to get access token', details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Authentication failed', message: error.message });
  }
};
