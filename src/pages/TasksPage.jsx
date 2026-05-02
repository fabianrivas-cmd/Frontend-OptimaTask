import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  apiCreateTask,
  apiDeleteTask,
  apiListTasks,
  apiUpdateTask,
} from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import TaskForm from '../components/TaskForm.jsx';
import TaskCard from '../components/TaskCard.jsx';

function formatName(owner) {
  if (!owner) return 'usuario';
  if (owner.name) return owner.name;
  if (!owner.email) return 'usuario';
  return owner.email.split('@')[0];
}

function flashClass(level) {
  switch (level) {
    case 'warning':
      return 'flash-warning';
    case 'notice':
      return 'flash-notice';
    case 'success':
      return 'flash-success';
    default:
      return 'flash-info';
  }
}

export default function TasksPage() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const data = await apiListTasks(token);
      setTasks(data.tasks || []);
      setRecommendation(data.recommendation || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const sorted = useMemo(() => {
    const priorityRank = { high: 0, medium: 1, low: 2 };
    return [...tasks].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pa = priorityRank[a.suggestedPriority] ?? 9;
      const pb = priorityRank[b.suggestedPriority] ?? 9;
      if (pa !== pb) return pa - pb;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return String(a.dueDate).localeCompare(String(b.dueDate));
    });
  }, [tasks]);

  const groupedByOwner = useMemo(() => {
    const byUser = new Map();
    for (const task of sorted) {
      const uid = task.userId ?? task.owner?.id;
      if (uid == null) continue;
      if (!byUser.has(uid)) byUser.set(uid, []);
      byUser.get(uid).push(task);
    }
    const currentId = user?.id;
    const sections = [...byUser.entries()].map(([userId, list]) => ({
      userId,
      owner: list[0]?.owner,
      tasks: list,
    }));
    sections.sort((a, b) => {
      if (a.userId === currentId) return -1;
      if (b.userId === currentId) return 1;
      return formatName(a.owner).localeCompare(formatName(b.owner), 'es');
    });
    return sections.filter((s) => s.tasks.length > 0);
  }, [sorted, user?.id]);

  async function handleCreate(payload) {
    const created = await apiCreateTask(token, payload);
    setTasks((prev) => [created, ...prev]);
    const full = await apiListTasks(token);
    setRecommendation(full.recommendation || null);
  }

  async function handleUpdate(id, patch) {
    const updated = await apiUpdateTask(token, id, patch);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    const full = await apiListTasks(token);
    setRecommendation(full.recommendation || null);
  }

  async function handleDelete(id) {
    await apiDeleteTask(token, id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const full = await apiListTasks(token);
    setRecommendation(full.recommendation || null);
    if (editing?.id === id) setEditing(null);
  }

  return (
    <div className="stack" style={{ gap: '1.25rem' }}>
      <div className="card stack">
        <div className="row" style={{ justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.55rem' }}>Tu tablero</h1>
            <p className="muted" style={{ margin: 0 }}>
              Prioridad sugerida según fechas y tu carga de pendientes — motor de reglas OptimaTask.
            </p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={load} disabled={loading}>
            Actualizar
          </button>
        </div>

        {recommendation?.message ? (
          <div className={`flash ${flashClass(recommendation.level)}`}>{recommendation.message}</div>
        ) : null}

        {error ? (
          <div className="flash flash-warning" role="alert">
            {error}
          </div>
        ) : null}

        <TaskForm
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={async (payload) => {
            if (editing) {
              await handleUpdate(editing.id, payload);
              setEditing(null);
            } else {
              await handleCreate(payload);
            }
          }}
        />
      </div>

      {loading ? (
        <p className="muted">Cargando tareas…</p>
      ) : groupedByOwner.length === 0 ? (
        <div className="card muted">No hay tareas todavía. Creá la primera arriba.</div>
      ) : (
        <div className="stack" style={{ gap: '1.25rem' }}>
          {groupedByOwner.map((section) => (
            <div key={section.userId} className="stack" style={{ gap: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>
                {section.userId === user?.id
                  ? 'Mis tareas'
                  : `Tareas de ${formatName(section.owner)}`}
              </h2>
              <div className="stack">
                {section.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canManage={task.userId === user?.id}
                    onEdit={() => setEditing(task)}
                    onToggle={async () => handleUpdate(task.id, { completed: !task.completed })}
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
