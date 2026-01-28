const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).send('Missing GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET');
  }

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

    if (!data.access_token) {
      return res.status(400).send('Failed to get token: ' + JSON.stringify(data));
    }

    const token = data.access_token;
    const html = `<!DOCTYPE html>
<html>
<head><title>Authorizing...</title></head>
<body>
<script>
(function() {
  var payload = JSON.stringify({ token: "${token}", provider: "github" });

  if (window.opener) {
    function receiveMessage(e) {
      window.opener.postMessage(
        "authorization:github:success:" + payload,
        e.origin
      );
      window.removeEventListener("message", receiveMessage, false);
      setTimeout(function () { window.close(); }, 300);
    }

    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  } else {
    localStorage.setItem("decap-cms-auth", payload);
    window.location.href = "/admin/";
  }
})();
</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (error) {
    return res.status(500).send('Error: ' + error.message);
  }
};
