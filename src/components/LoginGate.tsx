'use client';
import { useState } from 'react';
import { useAuth, signIn, signOut } from '@/lib/auth';
import { Logo } from './Logo';
import { C, F } from '@/lib/theme';
import { LogOut, Lock } from 'lucide-react';

export function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) setError('Correo o contraseña incorrectos.');
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        color: C.inkMuted,
      }}>Cargando...</div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh', background: C.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: C.bgCard, border: `1px solid ${C.border}`,
          padding: 40, borderRadius: 4, maxWidth: 420, width: '100%',
        }}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <Logo size="md" />
          </div>
          <div style={{
            fontSize: 11, color: C.accent, letterSpacing: '0.15em',
            textTransform: 'uppercase', marginBottom: 8, fontWeight: 600,
            textAlign: 'center',
          }}>
            <Lock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
            Acceso restringido
          </div>
          <h1 style={{
            fontFamily: F.display, fontSize: 28, fontWeight: 500,
            margin: '0 0 24px', textAlign: 'center',
          }}>Iniciar sesión</h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Correo</label>
              <input
                type="email" required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={inputStyle}
                autoComplete="email"
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password" required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div style={{
                padding: '10px 12px', marginBottom: 16, fontSize: 13,
                background: '#fde8e8', color: '#a33',
                border: '1px solid #f5c6c6', borderRadius: 4,
              }}>{error}</div>
            )}
            <button
              type="submit" disabled={submitting}
              style={{
                width: '100%', padding: '12px 16px',
                background: C.ink, color: C.bg, border: 'none',
                borderRadius: 4, fontSize: 14, fontWeight: 500,
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p style={{
            fontSize: 11, color: C.inkSubtle, textAlign: 'center',
            marginTop: 24, marginBottom: 0,
          }}>
            Solo administradores autorizados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 40,
      }}>
        <button onClick={signOut} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', background: C.ink, color: C.bg,
          border: 'none', borderRadius: 999, fontSize: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <LogOut size={12} /> Cerrar sesión
        </button>
      </div>
      {children}
    </>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, color: C.inkSubtle,
  marginBottom: 6, fontWeight: 500,
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px',
  border: `1px solid ${C.borderDark}`, borderRadius: 4,
  fontSize: 14, background: C.bgWhite, color: C.ink,
};
