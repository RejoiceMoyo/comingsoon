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
      const token = data.access_token;
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorizing...</title>
</head>
<body>
  <p>Authorization successful! You can close this window if it doesn't close automatically.</p>
  <script>
    (function() {
      const token = "${token}";
      const message = "authorization:github:success:" + JSON.stringify({token: token, provider: "github"});
      
      if (window.opener) {
        window.opener.postMessage(message, "*");
        console.log("Message sent to opener:", message);
      }
      
      // Give the message time to be received before closing
      setTimeout(function() {
        window.close();
      }, 2000);
    })();
  </script>
</body>
</html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } else {
      const html = `
<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>
  <p>Failed to get access token. Error: ${JSON.stringify(data)}</p>
</body>
</html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(400).send(html);
    }
  } catch (error) {
    return res.status(500).send('Authentication failed: ' + error.message);
  }
};
