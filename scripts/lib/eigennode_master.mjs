// Shared reader for EigenNode's master.json, used by the two scripts that pull
// solutions out of it: seed_problem_solutions.mjs (the prose) and
// render_solution_figures.mjs (the Asymptote diagrams inside it). They have to
// agree on which node belongs to which portal problem, so the lookup lives here
// rather than in both.

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

// Mirrors _resolve_drive_base() in eigennode/scripts/lib/pdf/master_loader.py.
export function eigennodeDir() {
  if (process.env.EIGENNODE_SYNC_DIR && existsSync(process.env.EIGENNODE_SYNC_DIR)) {
    return process.env.EIGENNODE_SYNC_DIR
  }
  for (const letter of 'DEFGHIJKLMNOPQRSTUVWXYZ') {
    const p = `${letter}:/My Drive/EigenNode`
    if (existsSync(join(p, 'master.json'))) return p
  }
  const home = join(homedir(), 'My Drive', 'EigenNode')
  if (existsSync(join(home, 'master.json'))) return home
  throw new Error('Could not find EigenNode/master.json — set EIGENNODE_SYNC_DIR')
}

export function loadMaster() {
  const dir = eigennodeDir()
  const nodes = JSON.parse(readFileSync(join(dir, 'master.json'), 'utf8')).nodes
  // Asymptote figures are referenced by a bare "#asymptote [name]" node whose
  // source lives in a side file, keyed by that node's id.
  const asyStore = existsSync(join(dir, 'asy_code_store.json'))
    ? JSON.parse(readFileSync(join(dir, 'asy_code_store.json'), 'utf8'))
    : {}

  // Sibling order lives in the parent's `children` array. The node map's own key
  // order is arbitrary, and walking by parentId shuffles a solution's paragraphs
  // into nonsense -- answer first, source in the middle, opening line last.
  const childrenOf = n => (n?.children || []).map(id => nodes[id]).filter(Boolean)
  const childNamed = (n, name) =>
    childrenOf(n).find(c => String(c.content ?? '').trim().toLowerCase() === name)

  // Problem nodes are titled "Problem 6 [32628]" -- the bracketed number is the
  // AoPS problem id the export keeps as `aops_id`, and unlike the EigenNode node
  // id it survives a course re-import.
  const byAopsId = new Map()
  const byStatement = new Map()
  for (const n of Object.values(nodes)) {
    const content = String(n.content ?? '').trim()
    const m = /\[(\d+)\]\s*$/.exec(content)
    if (m) byAopsId.set(m[1], n)
    if (content.length > 40) byStatement.set(content.slice(0, 80), n)
  }

  // The master.json node for a portal bank problem, or null.
  function nodeFor(p) {
    if (p.aops_id && byAopsId.has(String(p.aops_id))) return byAopsId.get(String(p.aops_id))
    // Fall back to the statement text: the AoPS script problems carry no aops_id,
    // and a re-imported course changes the node ids the export used.
    const stmt = byStatement.get((p.statement || '').trim().slice(0, 80))
    if (!stmt) return null
    return nodes[nodes[stmt.parentId]?.parentId] || null
  }

  // Multi-part problems ("Problem 6 (Parts A–B)") keep a Problem/Answer/Solution
  // under each part container instead of directly under the problem.
  function partNodes(problemNode) {
    const kids = childrenOf(problemNode)
    if (!kids.length || String(kids[0].content ?? '').trim().toLowerCase() === 'problem') return []
    return kids.filter(c => childNamed(c, 'problem'))
  }

  return { dir, nodes, asyStore, childrenOf, childNamed, nodeFor, partNodes }
}

// Every problem the portal's bank knows about, in one array.
export function loadBankProblems(root) {
  const index = JSON.parse(readFileSync(join(root, 'data', 'aops-index.json'), 'utf8'))
  return index.files.flatMap(f => JSON.parse(readFileSync(join(root, 'data', f), 'utf8')))
}

// The service key the local admin scripts write with.
export function serviceKey(root) {
  const key = process.env.SUPABASE_SERVICE_KEY ||
    readFileSync(join(root, '.env'), 'utf8')
      .split('\n')
      .find(l => l.startsWith('VITE_SUPABASE_SERVICE_KEY='))
      ?.split('=').slice(1).join('=').trim()
  if (!key) throw new Error('Could not read VITE_SUPABASE_SERVICE_KEY from .env')
  return key
}

export const SUPABASE_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co'

// Rendered solution diagrams live beside the F=ma exam figures, which are
// already public storage URLs referenced from fma_questions.solution_figure_urls.
export const FIGURE_BUCKET = 'handout-pdfs'
export const FIGURE_PREFIX = 'solution-figures'
export const figurePath = nodeId => `${FIGURE_PREFIX}/${nodeId}.png`
export const figureUrl = nodeId =>
  `${SUPABASE_URL}/storage/v1/object/public/${FIGURE_BUCKET}/${figurePath(nodeId)}`
