const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const origin = 'https://www.theshearchive.com';
  
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
    let message, content;

    if (data.access_token) {
      message = 'success';
      content = { token: data.access_token, provider: 'github' };
    } else {
      message = 'error';
      content = data;
    }

    const script = `
<!DOCTYPE html>
<html>
<head><title>Authorizing...</title></head>
<body>
<script>
(function() {
  function recieveMessage(e) {
    console.log("recieveMessage %o", e);
    if (e.origin !== "${origin}") {
      console.log('Invalid origin: %s', e.origin);
      return;
    }
    window.opener.postMessage(
      'authorization:github:${message}:${JSON.stringify(content)}',
      e.origin
    );
  }
  window.addEventListener("message", recieveMessage, false);
  console.log("Sending message: github");
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(script);

  } catch (error) {
    return res.status(500).send('Error: ' + error.message);
  }
};
