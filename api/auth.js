const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // If no code, redirect to GitHub for authorization
  if (!code) {
    const redirectUri = 'https://www.theshearchive.com/api/auth';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
    return res.redirect(githubAuthUrl);
  }

  // If code exists, exchange it for a token
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
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Success!</title>
</head>
<body>
  <p>Logging you in...</p>
  <script>
    (function() {
      function receiveMessage(e) {
        console.log("receiveMessage", e);
        window.opener.postMessage(
          'authorization:github:success:{"token":"${token}","provider":"github"}',
          e.origin
        );
      }
      window.addEventListener("message", receiveMessage, false);
      
      window.opener.postMessage("authorizing:github", "*");
    })();
  </script>
</body>
</html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } else {
      return res.status(400).send('Failed to get token: ' + JSON.stringify(data));
    }
  } catch (error) {
    return res.status(500).send('Error: ' + error.message);
  }
};
