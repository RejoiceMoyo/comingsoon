const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code, state } = req.query;
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  if (!code) {
    // Redirect user to GitHub for authorization
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=repo,user&state=${Math.random().toString(36).substring(7)}`;
    res.writeHead(302, { Location: authUrl });
    res.end();
    return;
  }

  try {
    // Exchange the code for an access token
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });

    const data = await response.json();
    const accessToken = data.access_token;

    if (!accessToken) {
      res.status(400).send('Error: Could not retrieve access token.');
      return;
    }

    // Respond with a script that completes the authentication process
    const script = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authenticating...</title>
      </head>
      <body>
        <script>
          (function() {
            const opener = window.opener;
            if (opener) {
              opener.postMessage(
                'authorization:github:success:${JSON.stringify({
                  token: accessToken,
                  provider: 'github'
                })}',
                window.location.origin
              );
              window.close();
            }
          })();
        </script>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(script);

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};
