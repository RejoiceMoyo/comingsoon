module.exports = async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;

  // Default to the Production URL that is registered in GitHub
  let baseUrl = 'https://www.theshearchive.com';

  // If running locally, use localhost
  if (req.headers.host && (req.headers.host.includes('localhost') || req.headers.host.includes('127.0.0.1'))) {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    baseUrl = `${protocol}://${req.headers.host}`;
  }

  // Allow explicit override via environment variable
  if (process.env.BASE_URL) {
    baseUrl = process.env.BASE_URL;
  }

  // If no code, redirect to GitHub for authorization
  if (!code) {
    // Redirect to the server-side callback handler
    const redirectUri = `${baseUrl}/api/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;

    console.log(`[Auth] Redirecting to GitHub`);
    console.log(`[Auth] Base URL detected: ${baseUrl}`);
    console.log(`[Auth] Redirect URI sent: ${redirectUri}`);

    return res.redirect(githubAuthUrl);
  }
};
