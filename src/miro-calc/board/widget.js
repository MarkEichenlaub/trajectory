// The board-native calculator widget: a frame of text fields + shapes that a
// visitor (no Miro account, no app) can use by typing into the input box.
// All items are tagged with metadata and tracked in board storage.
/* global miro */
import { textToHtml } from './normalize.js'

export const STORAGE_COLLECTION = 'miro-calc'
export const WIDGETS_KEY = 'widgets'
export const META_KEY = 'calcwidget'

export const COLORS = {
  frameFill: '#ffffff',
  headerFill: '#1f2937',
  headerText: '#ffffff',
  inputFill: '#fef9c3',
  inputText: '#111827',
  answerText: '#1d4ed8',
  estimateFillOff: '#f3f4f6',
  estimateFillOn: '#fde68a',
  estimateText: '#92400e',
  historyText: '#374151',
  helpText: '#9ca3af',
  statusOnline: '#22c55e',
  statusOffline: '#9ca3af',
  badgeOn: '#f59e0b',
  badgeOff: '#9ca3af',
}

export const PLACEHOLDERS = {
  input: 'type math here, end with =',
  estimateOff: '(estimate box — used when Estimate mode is on)',
  estimateOn: 'type your estimate here, end with =',
  answer: ' ',
  history: ' ',
}

const FRAME_W = 660
const FRAME_H = 660

function storage() {
  return miro.board.storage.collection(STORAGE_COLLECTION)
}

export async function getRegistry() {
  const list = await storage().get(WIDGETS_KEY)
  return Array.isArray(list) ? list : []
}

export async function setRegistry(list) {
  await storage().set(WIDGETS_KEY, list)
}

export function onRegistryChange(cb) {
  storage().onValue(WIDGETS_KEY, (value) => cb(Array.isArray(value) ? value : []))
}

export async function getHistory(calcId) {
  const list = await storage().get(`history:${calcId}`)
  return Array.isArray(list) ? list : []
}

export async function appendHistory(calcId, entry) {
  const list = await getHistory(calcId)
  list.push(entry)
  while (list.length > 60) list.shift()
  await storage().set(`history:${calcId}`, list)
  return list
}

export function onHistoryChange(calcId, cb) {
  storage().onValue(`history:${calcId}`, (value) => cb(Array.isArray(value) ? value : []))
}

// ---------------------------------------------------------------------------

export async function createWidget() {
  const calcId = Math.random().toString(36).slice(2, 12)
  const vp = await miro.board.viewport.get()
  const fx = vp.x + vp.width / 2
  const fy = vp.y + vp.height / 2

  const frame = await miro.board.createFrame({
    title: 'Physics Calculator',
    x: fx,
    y: fy,
    width: FRAME_W,
    height: FRAME_H,
    style: { fillColor: COLORS.frameFill },
  })

  const mk = {
    header: () =>
      miro.board.createShape({
        shape: 'rectangle',
        content: '<p><strong>Physics Calculator</strong> — type in the yellow box, end with =</p>',
        x: fx,
        y: fy - 300,
        width: FRAME_W,
        height: 56,
        style: { fillColor: COLORS.headerFill, color: COLORS.headerText, fontSize: 18, textAlign: 'center' },
      }),
    status: () =>
      miro.board.createShape({
        shape: 'circle',
        content: '',
        x: fx + 300,
        y: fy - 300,
        width: 22,
        height: 22,
        style: { fillColor: COLORS.statusOffline, borderColor: '#ffffff' },
      }),
    badge: () =>
      miro.board.createShape({
        shape: 'round_rectangle',
        content: '<p>EST OFF</p>',
        x: fx + 215,
        y: fy - 300,
        width: 110,
        height: 34,
        style: { fillColor: COLORS.badgeOff, color: '#ffffff', fontSize: 12 },
      }),
    input: () =>
      miro.board.createText({
        content: textToHtml(PLACEHOLDERS.input),
        x: fx,
        y: fy - 210,
        width: 580,
        style: { fontSize: 24, color: COLORS.inputText, fillColor: COLORS.inputFill, textAlign: 'left' },
      }),
    answer: () =>
      miro.board.createText({
        content: textToHtml(PLACEHOLDERS.answer),
        x: fx,
        y: fy - 135,
        width: 580,
        style: { fontSize: 24, color: COLORS.answerText, textAlign: 'left' },
      }),
    estimate: () =>
      miro.board.createText({
        content: textToHtml(PLACEHOLDERS.estimateOff),
        x: fx,
        y: fy - 65,
        width: 580,
        style: { fontSize: 18, color: COLORS.estimateText, fillColor: COLORS.estimateFillOff, textAlign: 'left' },
      }),
    history: () =>
      miro.board.createText({
        content: textToHtml(PLACEHOLDERS.history),
        x: fx,
        y: fy + 115,
        width: 580,
        style: { fontSize: 14, color: COLORS.historyText, textAlign: 'left' },
      }),
    help: () =>
      miro.board.createText({
        content:
          '<p>units &amp; constants work: 60 mph in m/s · G*earth.mass/earth.radius^2 · kB*300K in eV · angles in degrees (use "1.2 rad" for radians)</p>',
        x: fx,
        y: fy + 295,
        width: 620,
        style: { fontSize: 11, color: COLORS.helpText, textAlign: 'center' },
      }),
  }

  const items = {}
  for (const [role, make] of Object.entries(mk)) {
    items[role] = await make()
  }

  for (const item of Object.values(items)) {
    try {
      await frame.add(item)
    } catch {
      /* frame.add can be picky right after creation; item is still on the board */
    }
  }

  await frame.setMetadata(META_KEY, {
    role: 'calc-root',
    calcId,
    estimateMode: false,
    phase: 'idle',
    expr: '',
    attempts: 0,
  })
  for (const [role, item] of Object.entries(items)) {
    await item.setMetadata(META_KEY, { role, calcId })
  }

  // Reference snapshot for the repair routine. Re-read coordinates after
  // frame.add() so we record whatever coordinate model Miro actually uses.
  const refs = { frameX: frame.x, frameY: frame.y, children: {} }
  for (const [role, item] of Object.entries(items)) {
    let fresh = item
    try {
      fresh = await miro.board.getById(item.id)
    } catch {
      /* keep creation-time coords */
    }
    refs.children[role] = { x: fresh.x, y: fresh.y, width: fresh.width }
  }

  const descriptor = {
    calcId,
    frameId: frame.id,
    ids: Object.fromEntries(Object.entries(items).map(([role, item]) => [role, item.id])),
    refs,
    createdAt: Date.now(),
  }

  const registry = await getRegistry()
  registry.push(descriptor)
  await setRegistry(registry)

  try {
    await miro.board.viewport.zoomTo(frame)
  } catch {
    /* non-fatal */
  }
  return descriptor
}

// Validate registry entries against the board; prune widgets whose frame or
// input box was deleted. Returns { widgets, pruned }.
export async function loadWidgets() {
  const registry = await getRegistry()
  const widgets = []
  const pruned = []
  for (const desc of registry) {
    try {
      await miro.board.getById(desc.frameId)
      await miro.board.getById(desc.ids.input)
      widgets.push(desc)
    } catch {
      pruned.push(desc)
    }
  }
  if (pruned.length) await setRegistry(widgets)
  return { widgets, pruned }
}

export async function getWidgetMeta(desc) {
  try {
    const frame = await miro.board.getById(desc.frameId)
    const meta = await frame.getMetadata(META_KEY)
    return meta && meta.role === 'calc-root' ? meta : null
  } catch {
    return null
  }
}

export async function setWidgetMeta(desc, patch) {
  const frame = await miro.board.getById(desc.frameId)
  const meta = (await frame.getMetadata(META_KEY)) || { role: 'calc-root', calcId: desc.calcId }
  const next = { ...meta, ...patch }
  await frame.setMetadata(META_KEY, next)
  return next
}

// Toggle Estimate (QAMA) mode: frame metadata + badge + estimate-box styling.
// Shared by the panel (user toggles) and the host (state transitions).
export async function applyEstimateMode(desc, on) {
  await setWidgetMeta(desc, { estimateMode: on, phase: 'idle', expr: '', attempts: 0 })
  try {
    const badge = await miro.board.getById(desc.ids.badge)
    badge.content = `<p>EST ${on ? 'ON' : 'OFF'}</p>`
    badge.style.fillColor = on ? COLORS.badgeOn : COLORS.badgeOff
    await badge.sync()
  } catch {
    /* badge deleted — mode still works */
  }
  try {
    const est = await miro.board.getById(desc.ids.estimate)
    est.content = textToHtml(on ? PLACEHOLDERS.estimateOn : PLACEHOLDERS.estimateOff)
    est.style.fillColor = on ? COLORS.estimateFillOn : COLORS.estimateFillOff
    await est.sync()
  } catch {
    /* estimate box deleted */
  }
}

// Snap dragged/resized children back to their reference geometry. The SDK has
// no item locking, so this is the substitute. Tolerant of either absolute or
// frame-relative child coordinates: expected = saved + (frame drift).
export async function repairWidget(desc) {
  let frame
  try {
    frame = await miro.board.getById(desc.frameId)
  } catch {
    return false
  }
  const dx = frame.x - desc.refs.frameX
  const dy = frame.y - desc.refs.frameY

  const children = []
  for (const [role, ref] of Object.entries(desc.refs.children)) {
    const id = desc.ids[role]
    if (!id) continue
    let item
    try {
      item = await miro.board.getById(id)
    } catch {
      continue // deleted child; the widget still mostly works
    }
    const matchesAbs = Math.abs(item.x - (ref.x + dx)) < 1 && Math.abs(item.y - (ref.y + dy)) < 1
    const matchesRel = Math.abs(item.x - ref.x) < 1 && Math.abs(item.y - ref.y) < 1
    children.push({ item, ref, matchesAbs, matchesRel })
  }

  // If the frame was moved, the children that the student did NOT touch tell
  // us whether Miro reports child coordinates absolutely or frame-relative.
  const driftNonzero = Math.abs(dx) > 1 || Math.abs(dy) > 1
  const relVotes = children.filter((c) => c.matchesRel).length
  const absVotes = children.filter((c) => c.matchesAbs).length
  const model = driftNonzero && relVotes > absVotes ? 'rel' : 'abs'

  for (const { item, ref, matchesAbs, matchesRel } of children) {
    const ok = model === 'rel' ? matchesRel : matchesAbs
    if (ok) continue
    item.x = model === 'rel' ? ref.x : ref.x + dx
    item.y = model === 'rel' ? ref.y : ref.y + dy
    if (typeof ref.width === 'number' && Math.abs(item.width - ref.width) > 1) {
      try {
        item.width = ref.width
      } catch {
        /* some item widths are read-only */
      }
    }
    try {
      await item.sync()
    } catch {
      /* non-fatal */
    }
  }
  return true
}
