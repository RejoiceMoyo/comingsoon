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
<p>Authorization complete. Token received. Redirecting to the dashboard…</p>
<script>
(function() {
  var payload = JSON.stringify({ token: "${token}", provider: "github" });

  try {
    localStorage.setItem("decap-cms-auth", payload);
    localStorage.setItem("netlify-cms-auth", payload);
    console.log("Token stored in localStorage");
  } catch (e) {
    console.error("Failed to store token:", e);
  }

  var target = window.opener || window.parent;
  if (target) {
    try {
      // Send auth message to parent
      target.postMessage("authorizing:github", "*");
      target.postMessage("authorization:github:success:" + payload, "*");
      console.log("PostMessage sent to parent window");
      
      document.body.innerHTML += "<p style='color:green'>✓ Authentication successful!</p>";
      document.body.innerHTML += "<p>Notifying main window... This popup will close in 1 second.</p>";
      
      // Close popup after brief delay
      setTimeout(function () { 
        window.close(); 
      }, 1000);
      return;
    } catch (e) {
      console.error("PostMessage failed:", e);
      document.body.innerHTML += "<p style='color:red'>Error: " + e.message + "</p>";
    }
  }

  // If no parent window, we're in a direct navigation - redirect to admin
  console.log("No parent window detected, redirecting to /admin/");
  document.body.innerHTML += "<p>Redirecting to admin panel...</p>";
  setTimeout(function() { window.location.href = "/admin/"; }, 1000);
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
