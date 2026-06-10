// The engine host: runs in Mark's browser (headless app iframe), polls the
// board-native calculator widgets for visitor input, evaluates, writes back.
// Students never load any iframe — their side is 100% miro.com board content.
/* global miro */
import { createCalcEngine, createEstimateProblem } from '../engine/index.js'
import { htmlToText, textToHtml, lastLine } from './normalize.js'
import {
  COLORS,
  PLACEHOLDERS,
  loadWidgets,
  onRegistryChange,
  getWidgetMeta,
  setWidgetMeta,
  appendHistory,
  getHistory,
  applyEstimateMode,
  repairWidget,
} from './widget.js'
import { createLease, createBus } from './lease.js'

const TICK_MS = 750
const IDLE_TICKS = 2 // ~1.5 s of no typing triggers evaluation (besides "=")
const REPAIR_EVERY = 7 // ~5 s
const HEARTBEAT_MS = 50000 // wall-clock, not ticks — headless ticks are throttled

function runtimeFor(desc) {
  return {
    desc,
    engine: createCalcEngine({ angleMode: 'deg' }),
    meta: null,
    problem: null,
    input: { lastSeen: null, stable: 0, handled: null, clearAt: 0 },
    estimate: { lastSeen: null, stable: 0, handled: null, clearAt: 0 },
    lastWritten: {},
  }
}

// priority 2 = panel (visible iframe, real 750 ms ticks). priority 1 =
// headless sdkUri iframe — Chrome throttles its timers to ~1/minute, so it
// only serves as a slow safety net while the panel is closed.
export async function startHost({ log = console.log, priority = 1 } = {}) {
  const lease = createLease(priority)
  const bus = await createBus()
  let widgets = []
  let tickN = 0
  let running = false
  let lastBeat = 0

  async function reloadWidgets() {
    const { widgets: list, pruned } = await loadWidgets()
    const known = new Map(widgets.map((w) => [w.desc.calcId, w]))
    widgets = list.map((desc) => known.get(desc.calcId) ?? runtimeFor(desc))
    for (const w of widgets) {
      if (!w.meta) await refreshMeta(w)
    }
    if (pruned.length) log(`miro-calc: pruned ${pruned.length} deleted widget(s)`)
  }

  async function refreshMeta(w) {
    w.meta = (await getWidgetMeta(w.desc)) || { estimateMode: false, phase: 'idle', expr: '', attempts: 0 }
    // Recover a half-finished estimate problem after a reload.
    if (w.meta.phase === 'awaiting' && w.meta.expr && !w.problem) {
      const p = createEstimateProblem(w.engine, w.meta.expr, { attempts: w.meta.attempts || 0 })
      if (p.ok) w.problem = p
      else w.meta = await setWidgetMeta(w.desc, { phase: 'idle', expr: '', attempts: 0 })
    }
  }

  async function writeText(w, role, text, style) {
    let item
    try {
      item = await miro.board.getById(w.desc.ids[role])
    } catch {
      return
    }
    item.content = textToHtml(text)
    if (style) Object.assign(item.style, style)
    try {
      await item.sync()
      w.lastWritten[role] = text
    } catch (err) {
      log(`miro-calc: write to ${role} failed: ${err.message}`)
    }
  }

  async function renderHistory(w) {
    const entries = await getHistory(w.desc.calcId)
    const lines = entries
      .slice(-12)
      .reverse()
      .map((e) => {
        const tag = e.revealed ? ' (revealed)' : e.mode === 'estimate' ? ' ✓est' : ''
        return `${e.expr}  =  ${e.ascii ?? e.display}${tag}`.slice(0, 90)
      })
    await writeText(w, 'history', lines.join('\n') || ' ')
  }

  async function recordResult(w, expr, res, extra = {}) {
    await appendHistory(w.desc.calcId, {
      expr: String(expr).slice(0, 120),
      display: res.display,
      ascii: res.ascii,
      ts: Date.now(),
      ...extra,
    })
    await renderHistory(w)
    bus.send({ type: 'history-changed', calcId: w.desc.calcId })
  }

  async function handleExpression(w, expr, rawText, eager) {
    // a new expression abandons a pending estimate
    if (w.meta.phase === 'awaiting') {
      w.problem = null
      w.meta = await setWidgetMeta(w.desc, { phase: 'idle', expr: '', attempts: 0 })
    }

    if (!w.meta.estimateMode) {
      const res = w.engine.evaluate(expr)
      if (res.ok) {
        await writeText(w, 'answer', `= ${res.ascii}`)
        await recordResult(w, expr, res)
        w.input.handled = rawText
        if (eager) w.input.clearAt = tickN + 1
      } else if (eager) {
        await writeText(w, 'answer', `⚠ ${res.error}`)
        w.input.handled = rawText
      }
      return
    }

    const p = createEstimateProblem(w.engine, expr)
    if (!p.ok) {
      if (eager) {
        await writeText(w, 'answer', `⚠ ${p.error}`)
        w.input.handled = rawText
      }
      return
    }
    w.problem = p
    w.meta = await setWidgetMeta(w.desc, { phase: 'awaiting', expr, attempts: 0 })
    await writeText(w, 'answer', `🤔 ${p.prompt()} → use the estimate box below`)
    w.input.handled = rawText
    bus.send({ type: 'state', calcId: w.desc.calcId, phase: 'awaiting', attempts: 0 })
  }

  async function handleEstimate(w, estText) {
    const r = w.problem.check(estText)
    if (r.accepted) {
      await writeText(w, 'answer', `= ${r.display} ✓ (your estimate: ${estText})`)
      await recordResult(w, w.meta.expr, { display: r.display, ascii: r.display }, { mode: 'estimate', estimate: estText })
      w.problem = null
      w.meta = await setWidgetMeta(w.desc, { phase: 'idle', expr: '', attempts: 0 })
      w.input.clearAt = tickN + 1
      w.estimate.clearAt = tickN + 1
    } else if (r.revealed) {
      await writeText(w, 'answer', `= ${r.display} (revealed after 5 tries)`)
      await recordResult(w, w.meta.expr, { display: r.display, ascii: r.display }, { mode: 'estimate', revealed: true })
      w.problem = null
      w.meta = await setWidgetMeta(w.desc, { phase: 'idle', expr: '', attempts: 0 })
      w.input.clearAt = tickN + 1
      w.estimate.clearAt = tickN + 1
    } else {
      const attempt = 5 - r.attemptsLeft
      await writeText(w, 'answer', `✗ ${r.hint} (attempt ${attempt}/5)`)
      w.meta = await setWidgetMeta(w.desc, { attempts: attempt })
      w.estimate.clearAt = tickN + 2
      bus.send({ type: 'state', calcId: w.desc.calcId, phase: 'awaiting', attempts: attempt })
    }
  }

  // Returns the text if a fresh, user-entered, trigger-ready entry exists.
  async function pollBox(w, role, ignore) {
    const box = w[role === 'input' ? 'input' : 'estimate']
    let item
    try {
      item = await miro.board.getById(w.desc.ids[role])
    } catch {
      return null
    }

    if (box.clearAt && tickN >= box.clearAt) {
      box.clearAt = 0
      const blank = role === 'estimate' && w.meta.estimateMode ? PLACEHOLDERS.estimateOn : ' '
      await writeText(w, role, blank)
      box.lastSeen = blank
      box.handled = null
      return null
    }

    const text = htmlToText(item.content)
    if (!text || ignore.includes(text) || text === w.lastWritten[role]) return null

    if (text !== box.lastSeen) {
      box.lastSeen = text
      box.stable = 0
      // eager trigger: entry ends with "="
      if (text.endsWith('=') && text !== box.handled) return { text, eager: true }
      return null
    }
    box.stable++
    if (box.stable === IDLE_TICKS && text !== box.handled) return { text, eager: false }
    return null
  }

  async function pollWidget(w) {
    const hit = await pollBox(w, 'input', [PLACEHOLDERS.input])
    if (hit) {
      const expr = lastLine(hit.text)
      if (expr && expr !== '=') {
        // idle-triggered evaluation stays quiet about parse errors (the
        // student may just be pausing mid-thought); "=" always answers
        await handleExpression(w, expr, hit.text, hit.eager)
      }
    }

    if (w.meta.phase === 'awaiting' && w.problem) {
      const est = await pollBox(w, 'estimate', [PLACEHOLDERS.estimateOn, PLACEHOLDERS.estimateOff])
      if (est) {
        const text = lastLine(est.text)
        if (text && text !== '=') {
          w.estimate.handled = est.text
          await handleEstimate(w, text.replace(/=+$/, '').trim())
        }
      }
    }
  }

  async function heartbeat(online) {
    if (lease.isLeader()) {
      for (const w of widgets) {
        try {
          const dot = await miro.board.getById(w.desc.ids.status)
          dot.style.fillColor = online ? COLORS.statusOnline : COLORS.statusOffline
          await dot.sync()
        } catch {
          /* status dot deleted */
        }
      }
    }
    bus.send({
      type: 'host-state',
      sessionId: lease.sessionId,
      priority,
      online,
      leader: lease.isLeader(),
      widgets: widgets.map((w) => ({ calcId: w.desc.calcId, phase: w.meta?.phase, attempts: w.meta?.attempts })),
    })
  }

  async function tick() {
    if (running) return
    running = true
    tickN++
    try {
      if (Date.now() - lastBeat > HEARTBEAT_MS) {
        lastBeat = Date.now()
        await heartbeat(true)
      }
      if (!lease.isLeader()) return
      for (const w of widgets) await pollWidget(w)
      if (tickN % REPAIR_EVERY === 0) {
        for (const w of widgets) {
          await repairWidget(w.desc)
          await refreshMetaIfStale(w)
        }
      }
    } catch (err) {
      log(`miro-calc tick error: ${err.message}`)
    } finally {
      running = false
    }
  }

  async function refreshMetaIfStale(w) {
    const fresh = await getWidgetMeta(w.desc)
    if (!fresh) return
    const modeChanged = !!fresh.estimateMode !== !!w.meta?.estimateMode
    w.meta = { ...fresh, phase: w.meta?.phase ?? fresh.phase, attempts: w.meta?.attempts ?? fresh.attempts }
    if (modeChanged) {
      w.problem = null
      w.meta.phase = 'idle'
    }
  }

  bus.on(async (msg) => {
    if (!msg || typeof msg !== 'object') return
    // a higher-priority host (the panel) is alive — yield the lease right away
    if (msg.type === 'host-state' && msg.sessionId !== lease.sessionId && (msg.priority ?? 1) > priority) {
      lease.demote()
    }
    if (msg.type === 'widgets-changed') await reloadWidgets()
    if (msg.type === 'history-changed' && msg.source === 'panel') {
      const w = widgets.find((x) => x.desc.calcId === msg.calcId)
      if (w) await renderHistory(w)
    }
    if (msg.type === 'mode-changed') {
      const w = widgets.find((x) => x.desc.calcId === msg.calcId)
      if (w) {
        w.problem = null
        await refreshMeta(w)
      }
    }
    if (msg.type === 'skip' && msg.calcId) {
      const w = widgets.find((x) => x.desc.calcId === msg.calcId)
      if (w && w.problem) {
        const r = w.problem.skip()
        await writeText(w, 'answer', `= ${r.display} (skipped)`)
        await recordResult(w, w.meta.expr, { display: r.display, ascii: r.display }, { mode: 'estimate', revealed: true })
        w.problem = null
        w.meta = await setWidgetMeta(w.desc, { phase: 'idle', expr: '', attempts: 0 })
        w.estimate.clearAt = tickN + 1
        w.input.clearAt = tickN + 1
      }
    }
  })

  onRegistryChange(() => reloadWidgets().catch(() => {}))
  window.addEventListener('pagehide', () => {
    heartbeat(false).catch(() => {})
    lease.release()
  })

  await lease.start()
  await reloadWidgets()
  await heartbeat(true)
  setInterval(tick, TICK_MS)
  log(`miro-calc host started (session ${lease.sessionId}, ${widgets.length} widget(s))`)

  return { reloadWidgets, isLeader: () => lease.isLeader() }
}
