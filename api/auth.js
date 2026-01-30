module.exports = async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;

  // Use configured BASE_URL or fallback to request headers for dynamic environments (like Vercel previews)
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

  // If no code, redirect to GitHub for authorization
  if (!code) {
    // Redirect to the server-side callback handler, NOT the admin/callback.html file
    const redirectUri = `${baseUrl}/api/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
    return res.redirect(githubAuthUrl);
  }
};
