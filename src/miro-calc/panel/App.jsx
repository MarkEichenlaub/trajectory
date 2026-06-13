// Mark's panel: his own calculator, the constants/data browser, widget
// management (insert, estimate-mode toggles), shared history, engine status.
/* global miro */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createCalcEngine, searchCatalog } from '../engine/index.js'
import {
  getRegistry,
  onRegistryChange,
  getHistory,
  onHistoryChange,
  appendHistory,
  createWidget,
  applyEstimateMode,
  getWidgetMeta,
} from '../board/widget.js'
import { createBus } from '../board/lease.js'
import { startHost } from '../board/host.js'

const inMiro = typeof miro !== 'undefined'

// Where panel snapshots go. The Miro panel is served over HTTPS, so it can't
// POST to the local ai-server (http://localhost is blocked by the browser's
// Private Network Access rules). This edge function stores the image in the
// cloud instead; the local ai-server then pulls it and writes the summary.
const SNAPSHOT_URL = 'https://nxvtaxbntqhcfqtazbnt.supabase.co/functions/v1/save-board-snapshot'
// How often, while the panel is open, to auto-capture the board if it changed.
const AUTO_SNAPSHOT_MS = 3 * 60 * 1000

const S = {
  wrap: { padding: 12, fontSize: 14 },
  section: { marginBottom: 16 },
  h: { fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#6b7280', margin: '12px 0 6px' },
  input: { width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: 15, border: '1px solid #d1d5db', borderRadius: 6, fontFamily: 'inherit' },
  result: { padding: '8px 10px', background: '#eff6ff', color: '#1d4ed8', borderRadius: 6, marginTop: 6, fontSize: 15, minHeight: 20, wordBreak: 'break-word' },
  error: { padding: '8px 10px', background: '#fef2f2', color: '#b91c1c', borderRadius: 6, marginTop: 6, fontSize: 13 },
  btn: { padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 13 },
  btnPrimary: { padding: '8px 12px', border: 'none', borderRadius: 6, background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  histLine: { padding: '4px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13, wordBreak: 'break-word' },
  catRow: { padding: '5px 6px', borderRadius: 4, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 8 },
  widgetRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #f3f4f6' },
  pill: (on) => ({ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: on ? '#f59e0b' : '#e5e7eb', color: on ? '#fff' : '#6b7280' }),
}

export default function App() {
  const engine = useMemo(() => createCalcEngine({ angleMode: 'deg' }), [])
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [localHistory, setLocalHistory] = useState([])
  const [angleMode, setAngle] = useState('deg')
  const [query, setQuery] = useState('')
  const [widgets, setWidgets] = useState([])
  const [widgetMeta, setWidgetMeta] = useState({}) // calcId -> {estimateMode, phase, attempts}
  const [selected, setSelected] = useState(null)
  const [boardHistory, setBoardHistory] = useState([])
  const [hostSeen, setHostSeen] = useState(0)
  const [selfHosting, setSelfHosting] = useState(false)
  const [lastError, setLastError] = useState(null)
  const hostRef = useRef(null)
  const busRef = useRef(null)
  const inputRef = useRef(null)
  const refreshRef = useRef(() => {})

  useEffect(() => {
    const onErr = (e) => setLastError(String(e.reason ?? e.error ?? e.message ?? e))
    window.addEventListener('error', onErr)
    window.addEventListener('unhandledrejection', onErr)
    return () => {
      window.removeEventListener('error', onErr)
      window.removeEventListener('unhandledrejection', onErr)
    }
  }, [])

  useEffect(() => {
    if (!inMiro) return
    let unsub = () => {}
    ;(async () => {
      const bus = await createBus()
      busRef.current = bus
      unsub = bus.on((msg) => {
        if (!msg || typeof msg !== 'object') return
        if (msg.type === 'host-state') {
          setHostSeen(Date.now())
          const meta = {}
          for (const w of msg.widgets ?? []) meta[w.calcId] = { phase: w.phase, attempts: w.attempts }
          setWidgetMeta((old) => {
            const next = { ...old }
            for (const [k, v] of Object.entries(meta)) next[k] = { ...next[k], ...v }
            return next
          })
        }
        if (msg.type === 'state') {
          setHostSeen(Date.now())
          setWidgetMeta((old) => ({ ...old, [msg.calcId]: { ...old[msg.calcId], phase: msg.phase, attempts: msg.attempts } }))
        }
      })
      const refresh = async () => {
        const reg = await getRegistry()
        setWidgets(reg)
        setSelected((s) => s ?? reg[0]?.calcId ?? null)
        const meta = {}
        for (const desc of reg) {
          const m = await getWidgetMeta(desc)
          if (m) meta[desc.calcId] = { estimateMode: !!m.estimateMode, phase: m.phase, attempts: m.attempts }
        }
        setWidgetMeta((old) => {
          const next = { ...old }
          for (const [k, v] of Object.entries(meta)) next[k] = { ...next[k], ...v }
          return next
        })
      }
      refreshRef.current = refresh
      await refresh()
      onRegistryChange(() => refresh())
      // The panel is a visible iframe, so its timers run at full speed — it
      // hosts the (preferred) engine. The headless iframe is throttled by
      // Chrome to ~1 tick/minute and only covers panel-closed periods.
      hostRef.current = await startHost({ priority: 2 })
      setSelfHosting(true)
      setHostSeen(Date.now())
    })().catch((err) => setLastError(`panel init: ${err.message ?? err}`))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!inMiro || !selected) return
    getHistory(selected).then(setBoardHistory)
    onHistoryChange(selected, setBoardHistory)
  }, [selected])

  function run() {
    const text = input.trim()
    if (!text) return
    const res = engine.evaluate(text)
    setResult(res)
    if (res.ok) {
      setLocalHistory((h) => [{ expr: text, display: res.display, ascii: res.ascii }, ...h].slice(0, 50))
      setInput('')
      if (inMiro && selected) {
        appendHistory(selected, { expr: text.slice(0, 120), display: res.display, ascii: res.ascii, ts: Date.now(), source: 'panel' })
          .then(() => busRef.current?.send({ type: 'history-changed', calcId: selected, source: 'panel' }))
          .catch(() => {})
      }
    }
  }

  function insertSymbol(text) {
    setInput((s) => (s ? `${s} ${text}` : text))
    inputRef.current?.focus()
  }

  async function onInsertWidget() {
    try {
      const desc = await createWidget()
      busRef.current?.send({ type: 'widgets-changed' })
      await hostRef.current?.reloadWidgets() // own host picks it up immediately
      setSelected(desc.calcId)
      await refreshRef.current()
      setLastError(null)
    } catch (err) {
      setLastError(`insert: ${err.message ?? err}`)
    }
  }

  async function toggleMode(desc) {
    const on = !widgetMeta[desc.calcId]?.estimateMode
    await applyEstimateMode(desc, on)
    setWidgetMeta((old) => ({ ...old, [desc.calcId]: { ...old[desc.calcId], estimateMode: on, phase: 'idle', attempts: 0 } }))
    busRef.current?.send({ type: 'mode-changed', calcId: desc.calcId })
  }

  const [snapshotStatus, setSnapshotStatus] = useState(null) // null | 'working' | string
  const lastSnapSigRef = useRef(null)

  // Exports the whole board to an image and uploads it for summarization. To keep
  // the periodic auto-capture from disturbing tutoring, it saves Mark's current
  // selection and restores it afterward (selection is per-user in Miro, so the
  // student never sees it). Returns false if the board is empty.
  async function captureSnapshot() {
    const items = await miro.board.get()
    if (!items.length) return false
    const prevSelection = await miro.board.getSelection().catch(() => [])
    try {
      await miro.board.select({ id: items.map(i => i.id) })
      const { base64, imageType } = await miro.board.exportSelectionToImage()
      const { id: boardId } = await miro.board.getInfo()
      const res = await fetch(SNAPSHOT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardId, imageBase64: base64, imageType: imageType || 'image/png' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      return true
    } finally {
      const ids = (prevSelection || []).map(i => i.id)
      if (ids.length) await miro.board.select({ id: ids }).catch(() => {})
      else await miro.board.deselect?.().catch(() => {})
    }
  }

  // Manual "capture now" override (the automatic timer below normally handles it).
  async function snapshotForAI() {
    setSnapshotStatus('working')
    try {
      const ok = await captureSnapshot()
      setSnapshotStatus(ok ? '✓ Snapshot sent — a summary fills in automatically after the session.' : 'Board is empty')
    } catch (err) {
      setSnapshotStatus(`Failed: ${err.message}`)
    }
  }

  // Automatic capture: while the panel is open, snapshot the board whenever it has
  // changed (new items), at most once per AUTO_SNAPSHOT_MS, and only when Mark
  // isn't actively selecting something — so a summary is filled in with no clicks.
  useEffect(() => {
    if (!inMiro) return
    let cancelled = false
    const tick = async () => {
      try {
        const items = await miro.board.get()
        const sig = items.length
        if (!sig || sig === lastSnapSigRef.current) return
        const sel = await miro.board.getSelection().catch(() => [])
        if (sel && sel.length) return // busy — try again next tick
        const ok = await captureSnapshot()
        if (ok && !cancelled) lastSnapSigRef.current = sig
      } catch { /* transient (offline, no session for this board, export busy) */ }
    }
    const id = setInterval(tick, AUTO_SNAPSHOT_MS)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const catalogHits = useMemo(() => (query.trim() ? searchCatalog(query).slice(0, 25) : []), [query])
  const hostOnline = inMiro && (selfHosting || Date.now() - hostSeen < 90000)

  return (
    <div style={S.wrap}>
      {!inMiro && <div style={S.error}>Not running inside Miro — calculator works, board features disabled.</div>}
      {lastError && <div style={S.error}>⚠ {lastError}</div>}

      <div style={S.section}>
        <div style={S.h}>Calculator ({angleMode})</div>
        <input
          ref={inputRef}
          style={S.input}
          value={input}
          placeholder="0.5 * 70 kg * (3 m/s)^2 in J"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && run()}
        />
        {result && (result.ok ? <div style={S.result}>= {result.display}</div> : <div style={S.error}>{result.error}</div>)}
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <button style={S.btnPrimary} onClick={run}>
            =
          </button>
          <button
            style={S.btn}
            onClick={() => {
              const m = angleMode === 'deg' ? 'rad' : 'deg'
              engine.setAngleMode(m)
              setAngle(m)
            }}
          >
            {angleMode === 'deg' ? 'switch to rad' : 'switch to deg'}
          </button>
          <button style={S.btn} onClick={() => engine.clearVariables()}>
            clear vars
          </button>
        </div>
        {localHistory.length > 0 && (
          <div style={{ marginTop: 6 }}>
            {localHistory.slice(0, 6).map((h, i) => (
              <div key={i} style={S.histLine} onClick={() => setInput(h.expr)} title="click to reuse">
                {h.expr} = <b>{h.display}</b>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={S.section}>
        <div style={S.h}>Constants &amp; data</div>
        <input style={S.input} value={query} placeholder="search: earth, water, planck, boltzmann…" onChange={(e) => setQuery(e.target.value)} />
        <div style={{ maxHeight: 180, overflowY: 'auto', marginTop: 4 }}>
          {catalogHits.map((c) => (
            <div
              key={c.id}
              style={S.catRow}
              onClick={() => insertSymbol(c.insert)}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span>
                <b>{c.insert}</b> <span style={{ color: '#6b7280' }}>{c.label}</span>
              </span>
              <span style={{ color: '#9ca3af', whiteSpace: 'nowrap' }}>{c.display}</span>
            </div>
          ))}
          {query.trim() && catalogHits.length === 0 && <div style={{ color: '#9ca3af', padding: 6 }}>no matches</div>}
        </div>
      </div>

      {inMiro && (
        <div style={S.section}>
          <div style={S.h}>AI Summary</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>
            Auto-saves the board every few minutes. A summary &amp; tags fill in by
            themselves after the session — no need to click.
          </div>
          <button style={S.btn} onClick={snapshotForAI} disabled={snapshotStatus === 'working'}>
            {snapshotStatus === 'working' ? 'Capturing…' : '📸 Capture now'}
          </button>
          {snapshotStatus && snapshotStatus !== 'working' && (
            <div style={{ marginTop: 6, fontSize: 12, color: snapshotStatus.startsWith('✓') ? '#16a34a' : '#b91c1c' }}>
              {snapshotStatus}
            </div>
          )}
        </div>
      )}

      {inMiro && (
        <div style={S.section}>
          <div style={S.h}>
            Board calculators{' '}
            <span style={{ color: hostOnline ? '#16a34a' : '#dc2626', textTransform: 'none', fontWeight: 600 }}>
              {hostOnline ? '● engine online' : '○ engine offline (reload the board tab)'}
            </span>
          </div>
          <button style={S.btnPrimary} onClick={onInsertWidget}>
            + Insert calculator on board
          </button>
          {widgets.map((desc) => {
            const m = widgetMeta[desc.calcId] ?? {}
            return (
              <div key={desc.calcId} style={S.widgetRow}>
                <input type="radio" checked={selected === desc.calcId} onChange={() => setSelected(desc.calcId)} title="show history" />
                <span style={{ flex: 1 }}>calc {desc.calcId.slice(0, 4)}</span>
                {m.phase === 'awaiting' && <span style={{ fontSize: 11, color: '#b45309' }}>estimating… {m.attempts ?? 0}/5</span>}
                {m.phase === 'awaiting' && (
                  <button style={S.btn} onClick={() => busRef.current?.send({ type: 'skip', calcId: desc.calcId })}>
                    skip
                  </button>
                )}
                <button style={{ ...S.btn, ...(m.estimateMode ? {} : {}) }} onClick={() => toggleMode(desc)}>
                  <span style={S.pill(!!m.estimateMode)}>EST {m.estimateMode ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            )
          })}
          {widgets.length === 0 && <div style={{ color: '#9ca3af', marginTop: 6 }}>No calculators on this board yet.</div>}
        </div>
      )}

      {inMiro && selected && boardHistory.length > 0 && (
        <div style={S.section}>
          <div style={S.h}>History (calc {String(selected).slice(0, 4)})</div>
          {boardHistory
            .slice(-15)
            .reverse()
            .map((e, i) => (
              <div key={i} style={S.histLine} onClick={() => setInput(e.expr)} title="click to reuse">
                {e.expr} = <b>{e.ascii ?? e.display}</b>
                {e.revealed ? ' (revealed)' : e.mode === 'estimate' ? ' ✓est' : ''}
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
