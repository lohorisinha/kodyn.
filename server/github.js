const fetch = require('node-fetch');
const GITHUB_API = 'https://api.github.com';
async function getGitHubData(accessToken, username) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/vnd.github+json'
  };
  const reposRes = await fetch(
    `${GITHUB_API}/user/repos?per_page=100&sort=updated`,
    { headers }
  );
  const repos = await reposRes.json();
  const repoData = await Promise.all(
    repos.map(async (repo) => {
      const langRes = await fetch(repo.languages_url, { headers });
      const languages = await langRes.json();
      return {
        name: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        languages,
        updated_at: repo.updated_at,
        created_at: repo.created_at,
        has_readme: repo.has_pages,
        is_fork: repo.fork,
        topics: repo.topics
      };
    })
  );
  const profileRes = await fetch(`${GITHUB_API}/user`, { headers });
  const profile = await profileRes.json();
  const eventsRes = await fetch(
    `${GITHUB_API}/users/${username}/events?per_page=100`,
    { headers }
  );
  const events = await eventsRes.json();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCommits = events.filter(e =>
    e.type === 'PushEvent' &&
    new Date(e.created_at) > thirtyDaysAgo
  ).length;
  return {
    profile: {
      username: profile.login,
      name: profile.name,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
      public_repos: profile.public_repos,
      account_created: profile.created_at
    },
    repos: repoData,
    recentCommits,
    totalRepos: repos.length,
    forkedRepos: repos.filter(r => r.fork).length,
    originalRepos: repos.filter(r => !r.fork).length
  };
}
module.exports = { getGitHubData };