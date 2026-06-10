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
} from '../board/widget.js'
import { createBus } from '../board/lease.js'

const inMiro = typeof miro !== 'undefined'

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
  const busRef = useRef(null)
  const inputRef = useRef(null)

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
          try {
            const frame = await miro.board.getById(desc.frameId)
            const m = await frame.getMetadata('calcwidget')
            if (m) meta[desc.calcId] = { estimateMode: !!m.estimateMode, phase: m.phase, attempts: m.attempts }
          } catch {
            /* deleted */
          }
        }
        setWidgetMeta((old) => {
          const next = { ...old }
          for (const [k, v] of Object.entries(meta)) next[k] = { ...next[k], ...v }
          return next
        })
      }
      await refresh()
      onRegistryChange(() => refresh())
    })()
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
    const desc = await createWidget()
    busRef.current?.send({ type: 'widgets-changed' })
    setSelected(desc.calcId)
  }

  async function toggleMode(desc) {
    const on = !widgetMeta[desc.calcId]?.estimateMode
    await applyEstimateMode(desc, on)
    setWidgetMeta((old) => ({ ...old, [desc.calcId]: { ...old[desc.calcId], estimateMode: on, phase: 'idle', attempts: 0 } }))
    busRef.current?.send({ type: 'mode-changed', calcId: desc.calcId })
  }

  const catalogHits = useMemo(() => (query.trim() ? searchCatalog(query).slice(0, 25) : []), [query])
  const hostOnline = inMiro && Date.now() - hostSeen < 90000

  return (
    <div style={S.wrap}>
      {!inMiro && <div style={S.error}>Not running inside Miro — calculator works, board features disabled.</div>}

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
