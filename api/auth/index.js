export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    // Initial auth request - redirect to GitHub
    const clientId = process.env.GITHUB_CLIENT_ID;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=repo,user`;
    
    return res.redirect(githubAuthUrl);
  }

  // GitHub callback with code - exchange for token
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

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
      // Return the token in the format the CMS expects
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorization Complete</title>
</head>
<body>
  <script>
    (function() {
      window.opener.postMessage(
        'authorization:github:success:{"token":"${data.access_token}","provider":"github"}',
        window.location.origin
      );
      window.close();
    })();
  </script>
  <p>Authorization complete. This window should close automatically.</p>
</body>
</html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } else {
      res.status(400).json({ error: 'Failed to get access token', details: data });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed', message: error.message });
  }
}
