// MaterialFlow AI — GitHub Integration Engine
// Handles repo creation, file sync, and commit management via GitHub API

const GITHUB_API = 'https://api.github.com';

/**
 * Create a new GitHub repository
 */
export async function createRepo(token, name, description = '', isPrivate = false) {
  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: false,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Failed to create repository');
  }

  return res.json();
}

/**
 * Push all project files to a GitHub repo
 */
export async function pushFiles(token, owner, repo, files, message = 'Update from MaterialFlow AI') {
  // Get the default branch ref
  const refRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/main`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  });

  let parentSha = null;
  let treeSha = null;

  if (refRes.ok) {
    const ref = await refRes.json();
    parentSha = ref.object.sha;
    const commitRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits/${parentSha}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    });
    const commit = await commitRes.json();
    treeSha = commit.tree.sha;
  }

  // Create blobs for each file
  const treeItems = [];
  for (const [path, content] of Object.entries(files)) {
    const blobRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, encoding: 'utf-8' }),
    });
    const blob = await blobRes.json();
    treeItems.push({ path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  // Create tree
  const treeBody = { tree: treeItems };
  if (treeSha) treeBody.base_tree = treeSha;
  const treeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(treeBody),
  });
  const tree = await treeRes.json();

  // Create commit
  const commitBody = { message, tree: tree.sha };
  if (parentSha) commitBody.parents = [parentSha];
  const commitRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commitBody),
  });
  const newCommit = await commitRes.json();

  // Update ref (or create it)
  if (parentSha) {
    await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/main`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha: newCommit.sha }),
    });
  } else {
    await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: 'refs/heads/main', sha: newCommit.sha }),
    });
  }

  return { commitSha: newCommit.sha, message };
}

/**
 * Pull files from a GitHub repo
 */
export async function pullFiles(token, owner, repo, branch = 'main') {
  // Get the tree
  const treeRes = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  });

  if (!treeRes.ok) throw new Error('Failed to fetch repository tree');
  const tree = await treeRes.json();

  const files = {};
  for (const item of tree.tree) {
    if (item.type !== 'blob') continue;
    // Skip binary files and large files
    if (item.size > 500000) continue;

    const blobRes = await fetch(item.url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
    });
    const blob = await blobRes.json();

    if (blob.encoding === 'base64') {
      try {
        files[item.path] = atob(blob.content.replace(/\n/g, ''));
      } catch (e) {
        // Skip binary files that can't be decoded
      }
    } else {
      files[item.path] = blob.content;
    }
  }

  return files;
}

/**
 * List user repos
 */
export async function listRepos(token) {
  const res = await fetch(`${GITHUB_API}/user/repos?sort=updated&per_page=20`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error('Failed to list repositories');
  return res.json();
}

/**
 * Get authenticated user info
 */
export async function getUser(token) {
  const res = await fetch(`${GITHUB_API}/user`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error('Invalid GitHub token');
  return res.json();
}

/**
 * Get commit history for a repo
 */
export async function getCommits(token, owner, repo, perPage = 10) {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=${perPage}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) return [];
  return res.json();
}
