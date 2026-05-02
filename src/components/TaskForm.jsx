import { useEffect, useState } from 'react';

const empty = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
};

export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!initial) {
      setValues(empty);
      return;
    }
    setValues({
      title: initial.title || '',
      description: initial.description || '',
      dueDate: initial.dueDate || '',
      priority: initial.priority || 'medium',
    });
  }, [initial]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      await onSubmit({
        title: values.title,
        description: values.description || null,
        dueDate: values.dueDate || null,
        priority: values.priority,
      });
      if (!initial) setValues(empty);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  const editing = Boolean(initial);

  return (
    <form onSubmit={handleSubmit} className="stack">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <strong>{editing ? 'Editar tarea' : 'Nueva tarea'}</strong>
        {editing ? (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancelar edición
          </button>
        ) : null}
      </div>

      {err ? (
        <div className="flash flash-warning" role="alert">
          {err}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          value={values.title}
          onChange={(ev) => setValues((v) => ({ ...v, title: ev.target.value }))}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="description">Descripción</label>
        <textarea
          id="description"
          value={values.description}
          onChange={(ev) => setValues((v) => ({ ...v, description: ev.target.value }))}
        />
      </div>

      <div className="row">
        <div className="field grow">
          <label htmlFor="dueDate">Vencimiento</label>
          <input
            id="dueDate"
            type="date"
            value={values.dueDate || ''}
            onChange={(ev) => setValues((v) => ({ ...v, dueDate: ev.target.value }))}
          />
        </div>
        <div className="field grow">
          <label htmlFor="priority">Prioridad manual</label>
          <select
            id="priority"
            value={values.priority}
            onChange={(ev) => setValues((v) => ({ ...v, priority: ev.target.value }))}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Agregar tarea'}
      </button>
    </form>
  );
}
