import { useRef, useState } from 'react'
import { uploadFmaScratchPages, deleteFmaScratchPage } from '../../utils/supabase'
import ScratchWorkLink from './ScratchWorkLink'

// One upload of the work for the whole test, taking as many photos as it took
// sheets of paper.
//
// It used to sit under every question, which read as "attach your work for THIS
// question" -- Akshatha said exactly that, and not one student ever finished an
// upload. So it lives in one place now, at the end, and says out loud that it
// is the whole test and that pages get sorted out afterwards.
export default function WorkUpload({ studentId, attemptId, pages, onPagesChange, disabled }) {
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [err, setErr] = useState(null)
  const inputRef = useRef(null)

  async function addFiles(fileList) {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setUploading(true)
    setErr(null)
    try {
      const added = await uploadFmaScratchPages(studentId, attemptId, files)
      onPagesChange([...pages, ...added])
    } catch (e) {
      setErr(`Upload failed: ${e.message}`)
    } finally {
      setUploading(false)
    }
  }

  async function removePage(page) {
    setBusyId(page.id)
    setErr(null)
    try {
      await deleteFmaScratchPage(page)
      onPagesChange(pages.filter(p => p.id !== page.id))
    } catch (e) {
      setErr(`Couldn't remove that page: ${e.message}`)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="fma-work-upload">
      <input
        ref={inputRef} type="file" accept="image/*,application/pdf" multiple
        style={{ display: 'none' }}
        onChange={e => { const f = e.target.files; e.target.value = ''; addFiles(f) }}
      />

      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
        Your work for the whole test
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>
        One upload, not one per question. Photograph every sheet of scratch paper and add them
        all here — Mark's copy gets split up by question automatically, so you don't have to
        sort anything. Write the question number next to each piece of work and that split comes
        out right.
      </div>

      {err && <div className="fma-err">{err}</div>}

      {pages.length > 0 && (
        <div className="fma-page-list">
          {pages.map((p, i) => (
            <div key={p.id} className="fma-page-row">
              <span className="fma-page-num">Page {i + 1}</span>
              <span className="fma-page-name">{p.file_name || p.storage_path.split('/').pop()}</span>
              <ScratchWorkLink path={p.storage_path} label="View ↗" />
              <button className="sm" disabled={disabled || busyId === p.id} onClick={() => removePage(p)}>
                {busyId === p.id ? '…' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`fma-scratch${dragging ? ' dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
      >
        <button className={pages.length ? 'sm' : 'primary'} disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}>
          {uploading ? 'Uploading…' : pages.length ? 'Add more pages' : 'Upload my work'}
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          {dragging ? 'Drop to upload'
            : pages.length
              ? `${pages.length} page${pages.length === 1 ? '' : 's'} attached`
              : 'or drag your photos here · pick several at once'}
        </span>
      </div>
    </div>
  )
}
