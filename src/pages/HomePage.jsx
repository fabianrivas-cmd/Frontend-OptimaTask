import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiListTasks } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

function formatName(user) {
  if (!user) return 'usuario';
  if (user.name) return user.name;
  if (!user.email) return 'usuario';
  return user.email.split('@')[0];
}

export default function HomePage() {
  const { token, user, shouldShowWelcome, clearWelcome } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!shouldShowWelcome()) return;
    setShowWelcome(true);
    const timer = window.setTimeout(() => {
      setShowWelcome(false);
      clearWelcome();
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [shouldShowWelcome, clearWelcome]);

  useEffect(() => {
    let mounted = true;
    async function loadPreview() {
      setLoading(true);
      setError('');
      try {
        const data = await apiListTasks(token);
        if (!mounted) return;
        setTasks(data.tasks || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPreview();
    return () => {
      mounted = false;
    };
  }, [token]);

  const previewByOwner = useMemo(() => {
    const priorityRank = { high: 0, medium: 1, low: 2 };
    const sortTasks = (a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pa = priorityRank[a.suggestedPriority] ?? 9;
      const pb = priorityRank[b.suggestedPriority] ?? 9;
      return pa - pb;
    };
    const byUser = new Map();
    for (const task of tasks) {
      const uid = task.userId ?? task.owner?.id;
      if (uid == null) continue;
      if (!byUser.has(uid)) byUser.set(uid, []);
      byUser.get(uid).push(task);
    }
    const currentId = user?.id;
    const sections = [...byUser.entries()].map(([userId, list]) => ({
      userId,
      owner: list[0]?.owner,
      tasks: [...list].sort(sortTasks).slice(0, 5),
    }));
    sections.sort((a, b) => {
      if (a.userId === currentId) return -1;
      if (b.userId === currentId) return 1;
      return formatName(a.owner).localeCompare(formatName(b.owner), 'es');
    });
    return sections.filter((s) => s.tasks.length > 0);
  }, [tasks, user?.id]);

  return (
    <div className="stack" style={{ gap: '1.25rem' }}>
      {showWelcome ? (
        <div className="welcome-overlay" role="status" aria-live="polite">
          <section className="welcome-modal">
            <button
              type="button"
              className="welcome-close"
              onClick={() => {
                setShowWelcome(false);
                clearWelcome();
              }}
              aria-label="Cerrar bienvenida"
            >
              x
            </button>
            <p className="welcome-title">Bienvenido</p>
            <p className="welcome-main">
              Hola <strong>{formatName(user)}</strong>, ya puedes organizar tu dia.
            </p>
            <p className="welcome-subtitle">Este mensaje desaparece en 3 segundos.</p>
          </section>
        </div>
      ) : null}

      <section className="card stack">
        <h1 style={{ margin: 0, fontSize: '1.65rem' }}>Inicio</h1>
        <p className="muted" style={{ margin: 0 }}>
          OptimaTask te ayuda a organizar tareas, priorizarlas y mantener foco en lo importante.
        </p>
        <div className="row">
          <Link to="/tasks" className="btn btn-primary">
            Ingresar a tu tablero
          </Link>
        </div>
      </section>

      <section className="card stack">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Vista previa de tareas</h2>
          <Link to="/tasks" className="muted">
            Ver todas
          </Link>
        </div>

        {loading ? <p className="muted" style={{ margin: 0 }}>Cargando vista previa...</p> : null}

        {!loading && error ? (
          <div className="flash flash-warning" role="alert">
            {error}
          </div>
        ) : null}

        {!loading && !error && previewByOwner.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Aun no hay tareas. Entra al tablero para agregar la primera.
          </p>
        ) : null}

        {!loading && !error && previewByOwner.length > 0 ? (
          <div className="stack" style={{ gap: '1rem' }}>
            {previewByOwner.map((section) => (
              <div key={section.userId} className="stack" style={{ gap: '0.5rem' }}>
                <h3 className="muted" style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                  {section.userId === user?.id
                    ? 'Tus tareas'
                    : `Tareas de ${formatName(section.owner)}`}
                </h3>
                <div className="stack" style={{ gap: '0.5rem' }}>
                  {section.tasks.map((task) => (
                    <article key={task.id} className="card" style={{ padding: '0.85rem' }}>
                      <div className="row" style={{ justifyContent: 'space-between' }}>
                        <strong>{task.title}</strong>
                        <span className="badge">{task.completed ? 'Completada' : 'Pendiente'}</span>
                      </div>
                      {task.description ? (
                        <p className="muted" style={{ margin: '0.35rem 0 0' }}>
                          {task.description}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
