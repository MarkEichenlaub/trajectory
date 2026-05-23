const OWNER = 'MarkEichenlaub'
const REPO = 'trajectory'
const BRANCH = 'main'

function rawUrl(path) {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`
}

function apiUrl(path) {
  return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`
}

export function getPAT() {
  return localStorage.getItem('trajectory_pat') || ''
}

export function setPAT(token) {
  localStorage.setItem('trajectory_pat', token)
}

export async function fetchJSON(path) {
  const res = await fetch(rawUrl(path) + '?t=' + Date.now())
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`)
  return res.json()
}

export async function writeJSON(path, data) {
  const pat = getPAT()
  if (!pat) throw new Error('No GitHub PAT configured. Go to Settings to add one.')

  // Get current SHA
  const metaRes = await fetch(apiUrl(path), {
    headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github+json' },
  })
  let sha = null
  if (metaRes.ok) {
    const meta = await metaRes.json()
    sha = meta.sha
  }

  const body = {
    message: `Update ${path}`,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))),
    branch: BRANCH,
  }
  if (sha) body.sha = sha

  const res = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: {
      Authorization: `token ${pat}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || `GitHub write failed: ${res.status}`)
  }
  return res.json()
}
