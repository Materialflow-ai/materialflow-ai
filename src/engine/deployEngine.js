// MaterialFlow AI — Deploy Engine
// Real deployment to Vercel and Netlify via their APIs

/**
 * Deploy to Vercel
 * Uses the Vercel API v13 deployments endpoint
 */
export async function deployToVercel(token, projectName, files) {
  const deployFiles = [];

  for (const [path, content] of Object.entries(files)) {
    deployFiles.push({
      file: path,
      data: content,
    });
  }

  // Add a basic vercel.json if not present
  if (!files['vercel.json']) {
    deployFiles.push({
      file: 'vercel.json',
      data: JSON.stringify({
        buildCommand: null,
        outputDirectory: '.',
        framework: null,
      }, null, 2),
    });
  }

  const res = await fetch('https://api.vercel.com/v13/deployments', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      files: deployFiles.map(f => ({
        file: f.file,
        data: btoa(unescape(encodeURIComponent(f.data))),
        encoding: 'base64',
      })),
      projectSettings: {
        framework: null,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Vercel deployment failed');
  }

  const deployment = await res.json();
  return {
    url: `https://${deployment.url}`,
    id: deployment.id,
    readyState: deployment.readyState,
    provider: 'vercel',
  };
}

/**
 * Deploy to Netlify
 * Uses the Netlify API to create a site and deploy files
 */
export async function deployToNetlify(token, projectName, files) {
  // Create a deploy with file digest
  const fileDigests = {};
  const fileContents = {};

  for (const [path, content] of Object.entries(files)) {
    // Create SHA1 hash (simplified — in production use SubtleCrypto)
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const deployPath = path.startsWith('/') ? path : `/${path}`;
    fileDigests[deployPath] = hash;
    fileContents[hash] = { path: deployPath, content };
  }

  // Ensure index.html exists at root
  if (!fileDigests['/index.html'] && files['index.html']) {
    const content = files['index.html'];
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    fileDigests['/index.html'] = hash;
    fileContents[hash] = { path: '/index.html', content };
  }

  // Step 1: Create deploy with file hashes
  const deployRes = await fetch('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    }),
  });

  if (!deployRes.ok) {
    const err = await deployRes.json();
    throw new Error(err.message || 'Failed to create Netlify site');
  }

  const site = await deployRes.json();

  // Step 2: Deploy files
  const fileDeployRes = await fetch(`https://api.netlify.com/api/v1/sites/${site.id}/deploys`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: fileDigests,
    }),
  });

  if (!fileDeployRes.ok) {
    throw new Error('Failed to create Netlify deploy');
  }

  const deploy = await fileDeployRes.json();

  // Step 3: Upload required files
  if (deploy.required?.length > 0) {
    for (const hash of deploy.required) {
      const fileInfo = fileContents[hash];
      if (!fileInfo) continue;

      await fetch(`https://api.netlify.com/api/v1/deploys/${deploy.id}/files${fileInfo.path}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/octet-stream',
        },
        body: fileInfo.content,
      });
    }
  }

  return {
    url: `https://${site.subdomain || site.name}.netlify.app`,
    id: deploy.id,
    siteId: site.id,
    provider: 'netlify',
  };
}

/**
 * Check deployment status
 */
export async function checkDeployStatus(provider, token, deployId) {
  if (provider === 'vercel') {
    const res = await fetch(`https://api.vercel.com/v13/deployments/${deployId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return { ready: data.readyState === 'READY', state: data.readyState, url: data.url };
  }

  if (provider === 'netlify') {
    const res = await fetch(`https://api.netlify.com/api/v1/deploys/${deployId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return { ready: data.state === 'ready', state: data.state, url: data.ssl_url || data.deploy_url };
  }

  return { ready: false, state: 'unknown' };
}
