export default function Toast({ msg, type = 'success', onUndo }) {
  return (
    <div className={`toast ${type}`}>
      {msg}
      {onUndo && <button className="toast-undo" onClick={onUndo}>Undo</button>}
    </div>
  )
}
