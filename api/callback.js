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
      const html = `<!DOCTYPE html>
<html>
<head><title>Authorizing...</title></head>
<body>
<script>
(function() {
  var message = "authorization:github:success:" + JSON.stringify({ token: "${token}", provider: "github" });
  if (window.opener) {
    window.opener.postMessage(message, "*");
    window.close();
  } else {
    localStorage.setItem("decap-cms-auth", JSON.stringify({ token: "${token}", provider: "github" }));
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
