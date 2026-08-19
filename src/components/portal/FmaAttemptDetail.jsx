import { useMemo } from 'react'
import { renderStatementHtml } from '../../utils/renderStatement'

const CHOICES = ['A', 'B', 'C', 'D', 'E']

export default function FmaAttemptDetail({ detail, onBack }) {
  const { attempt, questions, answerByQuestion } = detail

  const date = new Date(attempt.submitted_at || attempt.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div style={{ maxWidth: 720 }}>
      <button className="sm" onClick={onBack} style={{ marginBottom: 16 }}>← Back</button>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>{attempt.score != null ? `${attempt.score}/25` : '—'}</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{attempt.handouts?.name || attempt.exam_id}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{date} · {attempt.mode.replace('_', ' ')}</div>
        </div>
        {attempt.scratch_work_url && (
          <a href={attempt.scratch_work_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, marginLeft: 'auto' }}>Scratch work ↗</a>
        )}
      </div>

      {attempt.mode === 'score_only' ? (
        <div className="empty-state">Score-only attempt — no per-question answers recorded.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.map(q => {
            const ans = answerByQuestion.get(q.id)
            const html = renderStatementHtml(q.statement)
            return (
              <div key={q.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Question {q.question_num}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ans?.is_correct ? 'var(--green)' : ans ? 'var(--red)' : 'var(--text-dim)' }}>
                    {ans?.selected_choice ? `Your answer: ${ans.selected_choice}` : 'Not answered'}
                    {' · Correct: '}{q.correct_choice}
                  </div>
                </div>
                <div dangerouslySetInnerHTML={{ __html: html }} />
                {(q.figure_urls || []).map(url => (
                  <img key={url} src={url} alt="" style={{ maxWidth: '100%', border: '1px solid var(--border)', borderRadius: 4, margin: '8px 0' }} />
                ))}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                  {CHOICES.map(c => (
                    <div key={c} style={{
                      fontSize: 12, padding: '2px 8px', borderRadius: 4,
                      background: c === q.correct_choice ? 'var(--green-bg, rgba(34,197,94,0.12))' : c === ans?.selected_choice ? 'var(--red-bg, rgba(239,68,68,0.12))' : 'transparent',
                    }}>
                      <strong>{c}</strong>{' '}
                      <span dangerouslySetInnerHTML={{ __html: renderStatementHtml(q.choices?.[c] || '') }} />
                    </div>
                  ))}
                </div>
                {ans?.scratch_work_url && (
                  <a href={ans.scratch_work_url} target="_blank" rel="noreferrer" style={{ fontSize: 11, marginTop: 8, display: 'inline-block' }}>Scratch work for this question ↗</a>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
