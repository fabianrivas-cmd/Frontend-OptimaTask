function badgeClass(suggested) {
  if (suggested === 'high') return 'badge badge-high';
  if (suggested === 'medium') return 'badge badge-medium';
  return 'badge badge-low';
}

function labelSuggested(p) {
  if (p === 'high') return 'Alta (sugerida)';
  if (p === 'medium') return 'Media (sugerida)';
  return 'Baja (sugerida)';
}

function labelManual(p) {
  if (p === 'high') return 'Alta';
  if (p === 'medium') return 'Media';
  return 'Baja';
}

export default function TaskCard({ task, onEdit, onToggle, onDelete }) {
  return (
    <article className="card stack" style={{ opacity: task.completed ? 0.72 : 1 }}>
      <div className="row" style={{ justifyContent: 'space-between', gap: '0.75rem' }}>
        <div className="stack" style={{ gap: '0.35rem', flex: 1, minWidth: 220 }}>
          <div className="row" style={{ gap: '0.6rem', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={task.completed}
              onChange={onToggle}
              aria-label="Marcar como completada"
            />
            <h2 style={{ margin: 0, fontSize: '1.05rem', textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.title}
            </h2>
          </div>

          <div className="row" style={{ gap: '0.45rem', flexWrap: 'wrap' }}>
            <span className={badgeClass(task.suggestedPriority)}>{labelSuggested(task.suggestedPriority)}</span>
            <span className="badge">
              Manual: {labelManual(task.priority)}
            </span>
            {task.dueDate ? (
              <span className="badge">
                Vence: {task.dueDate}
              </span>
            ) : (
              <span className="badge">Sin fecha</span>
            )}
          </div>

          {task.description ? <p className="muted" style={{ margin: 0 }}>{task.description}</p> : null}

          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--muted)' }}>
            <strong style={{ color: 'var(--text)' }}>Insight:</strong> {task.insight}
          </p>
        </div>

        <div className="stack" style={{ alignItems: 'stretch', minWidth: 140 }}>
          <button type="button" className="btn btn-ghost" onClick={onEdit}>
            Editar
          </button>
          <button type="button" className="btn btn-danger" onClick={onDelete}>
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
