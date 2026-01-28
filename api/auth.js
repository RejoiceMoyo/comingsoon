const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const origin = 'https://www.theshearchive.com';

  // If no code, redirect to GitHub for authorization
  if (!code) {
    const redirectUri = 'https://www.theshearchive.com/api/callback';
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user`;
    return res.redirect(githubAuthUrl);
  }
};
