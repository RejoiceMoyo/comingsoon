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
<head>
  <title>Auth Debug</title>
  <style>
    body { font-family: sans-serif; padding: 20px; text-align: center; }
    .success { color: green; font-weight: bold; }
    .error { color: red; }
    .log { margin-top: 20px; font-family: monospace; text-align: left; background: #f0f0f0; padding: 10px; border-radius: 5px; }
  </style>
</head>
<body>
<h1>Authentication Status</h1>
<div id="status">Initializing...</div>
<div id="logs" class="log"></div>
<button onclick="window.close()" style="margin-top:20px; padding: 10px 20px; cursor: pointer;">Close Window</button>

<script>
(function() {
  function log(msg) {
    var el = document.getElementById("logs");
    var p = document.createElement("div");
    p.textContent = "> " + msg;
    el.appendChild(p);
    console.log(msg);
  }

  var token = "${token}";
  
  if (token) {
    document.getElementById("status").innerHTML = "<p class='success'>✓ TOKEN RECEIVED!</p><p>Token starts with: " + token.substring(0, 5) + "...</p>";
    log("Token acquired.");
  } else {
    document.getElementById("status").innerHTML = "<p class='error'>✗ NO TOKEN</p>";
    log("Error: Token variable is empty.");
  }

  var payload = JSON.stringify({ token: token, provider: "github" });
  
  try {
    localStorage.setItem("decap-cms-auth", payload);
    localStorage.setItem("netlify-cms-auth", payload);
    log("Token stored in localStorage.");
  } catch (e) {
    log("Failed to store in localStorage: " + e.message);
  }

  var target = window.opener || window.parent;
  if (target) {
    log("Parent/Opener window found.");
    try {
      target.postMessage("authorizing:github", "*");
      target.postMessage("authorization:github:success:" + payload, "*");
      log("SENT POSTMESSAGE to parent.");
      document.getElementById("status").innerHTML += "<p>Message sent to main window.</p>";
    } catch (e) {
      log("PostMessage Failed: " + e.message);
    }
  } else {
    log("WARNING: No parent/opener window found. Cannot pass token back.");
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
