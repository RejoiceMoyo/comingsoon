export default function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    // Initial auth request - redirect to GitHub
    const clientId = process.env.GITHUB_CLIENT_ID;
    const redirectUri = `${process.env.VERCEL_URL || 'https://www.theshearchive.com'}/api/auth`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;
    
    return res.redirect(githubAuthUrl);
  }

  // GitHub callback with code - exchange for token
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  fetch('https://github.com/login/oauth/access_token', {
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
  })
    .then(response => response.json())
    .then(data => {
      if (data.access_token) {
        // Send token back to CMS
        const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorization Complete</title>
</head>
<body>
  <script>
    (function() {
      function receiveMessage(e) {
        console.log("receiveMessage %o", e);
        window.opener.postMessage(
          'authorization:github:success:${JSON.stringify({ token: data.access_token, provider: 'github' })}',
          e.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      console.log("Posting message:", { token: "${data.access_token}", provider: "github" });
      window.opener.postMessage(
        'authorization:github:success:${JSON.stringify({ token: data.access_token, provider: 'github' })}',
        '*'
      );
    })();
  </script>
</body>
</html>
        `;
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(html);
      } else {
        res.status(400).json({ error: 'Failed to get access token', details: data });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Authentication failed', message: error.message });
    });
}
