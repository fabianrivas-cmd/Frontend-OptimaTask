import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function getDisplayName(user) {
  if (!user) return 'Usuario';
  if (user.name && String(user.name).trim()) return String(user.name).trim();
  if (user.username && String(user.username).trim()) return String(user.username).trim();
  if (user.email) return user.email.split('@')[0];
  return 'Usuario';
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  if (!local) return `******@${domain}`;
  const visible = local.slice(0, 4);
  const hiddenCount = Math.max(local.length - 4, 6);
  return `${visible}${'*'.repeat(hiddenCount)}@${domain}`;
}

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  const linkStyle = ({ isActive }) => ({
    fontWeight: isActive ? 600 : 500,
    color: isActive ? 'var(--text)' : 'var(--muted)',
    textDecoration: 'none',
  });

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'rgba(12, 15, 20, 0.72)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: '0 auto',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <img
            src="/logo.svg"
            alt=""
            width={40}
            height={40}
            style={{
              display: 'block',
              flexShrink: 0,
              borderRadius: 10,
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.35)',
            }}
          />
          <span style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', lineHeight: 1.2 }}>
            <strong style={{ letterSpacing: '-0.02em', fontSize: '1.05rem' }}>
              <span style={{ color: 'var(--text)' }}>Optima</span>
              <span style={{ color: '#007BFF' }}>Task</span>
            </strong>
            <span className="muted" style={{ fontSize: '0.82rem' }}>
              priorización asistida
            </span>
          </span>
        </Link>

        <div className="grow" />

        {isAuthenticated ? (
          <>
            <span className="muted" style={{ fontSize: '0.9rem', textAlign: 'right', lineHeight: 1.15 }}>
              <strong style={{ color: 'var(--text)', fontSize: '0.9rem' }}>{getDisplayName(user)}</strong>
              <br />
              {maskEmail(user?.email)}
            </span>
            <NavLink to="/" style={linkStyle} end>
              Inicio
            </NavLink>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={linkStyle}>
              Entrar
            </NavLink>
            <NavLink to="/register" style={linkStyle}>
              Registro
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
