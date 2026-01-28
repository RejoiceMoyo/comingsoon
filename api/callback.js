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
      const provider = 'github';
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(`
        <script>
          const receiveMessage = (e) => {
            window.opener.postMessage(
              'authorization:${provider}:success:{"token":"${token}","provider":"${provider}"}',
              e.origin
            );
          };
          window.addEventListener('message', receiveMessage, false);
          window.opener.postMessage('authorizing:${provider}', '*');
        </script>
      `);
    } else {
      res.setHeader('Content-Type', 'text/html');
      return res.send(`
        <script>
          window.opener.postMessage('authorization:github:error:${JSON.stringify(data)}', '*');
          window.close();
        </script>
      `);
    }
  } catch (error) {
    return res.status(500).send('Error: ' + error.message);
  }
};
