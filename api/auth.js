module.exports = async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const baseUrl = process.env.BASE_URL || 'https://www.theshearchive.com';

  // If no code, redirect to GitHub for authorization
  if (!code) {
    const redirectUri = `${baseUrl}/admin/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_repo,user`;
    return res.redirect(githubAuthUrl);
  }
};
