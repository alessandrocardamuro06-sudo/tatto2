import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ t }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('cliente');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8, padding: '13px 16px',
    fontFamily: 'Syne, sans-serif', fontSize: 14,
    color: '#f0ece4', outline: 'none', marginBottom: 10,
    transition: 'border-color .2s', letterSpacing: '.01em',
  };

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (isLogin) await login(email, password);
      else await register(email, password, name, role);
    } catch (e) {
      setError(
        e.message.includes('wrong-password') || e.message.includes('user-not-found') ? 'Email o password errati.' :
        e.message.includes('email-already-in-use') ? 'Email già registrata.' : 'Errore. Riprova.'
      );
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#070707',
      backgroundImage: 'radial-gradient(ellipse 100% 50% at 50% -20%, rgba(255,255,255,0.05) 0%, transparent 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 28,
    }}>
      {/* Logo area */}
      <div style={{ marginBottom: 12, textAlign: 'center', position: 'relative' }}>
        <img src="/Logo_Inklovers-2.png" alt="Ink Lovers" style={{ width: 210, objectFit: 'contain' }} />
      </div>

      {/* Decorative divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, transparent, #333)' }} />
        <div style={{ width: 3, height: 3, borderRadius: '50%', border: '1px solid #444', transform: 'rotate(45deg)' }} />
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to left, transparent, #333)' }} />
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 340,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, padding: 28,
        backdropFilter: 'blur(20px)',
      }}>
        {/* Tab switcher */}
        <div style={{
          display: 'flex', marginBottom: 24,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          {[['Accedi', true], ['Registrati', false]].map(([label, isL]) => (
            <button key={label} onClick={() => setIsLogin(isL)} style={{
              flex: 1, padding: '10px 0 12px', border: 'none', background: 'none',
              fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600,
              color: isLogin === isL ? '#fff' : '#333',
              cursor: 'pointer', transition: 'color .2s', letterSpacing: '.04em',
              borderBottom: `2px solid ${isLogin === isL ? '#fff' : 'transparent'}`,
              marginBottom: -1, position: 'relative',
            }}>{label}</button>
          ))}
        </div>

        {!isLogin && (
          <>
            <input placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              {['cliente', 'artista'].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  flex: 1, padding: '11px 0',
                  border: `1px solid ${role === r ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 8,
                  background: role === r ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: role === r ? '#fff' : '#444',
                  fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 600,
                  textTransform: 'capitalize', cursor: 'pointer', letterSpacing: '.06em',
                  transition: 'all .2s',
                }}>{r}</button>
              ))}
            </div>
          </>
        )}

        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, marginBottom: error ? 10 : 20 }} />

        {error && (
          <div style={{ fontSize: 11, color: '#666', marginBottom: 16, textAlign: 'center', fontFamily: 'DM Mono, monospace', letterSpacing: '.04em' }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: '14px 0',
          background: loading ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.95)',
          color: loading ? '#555' : '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, fontFamily: 'Syne, sans-serif',
          fontSize: 13, fontWeight: 700, letterSpacing: '.08em',
          cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .3s',
          textTransform: 'uppercase',
        }}>{loading ? '· · ·' : isLogin ? 'Entra' : 'Crea account'}</button>
      </div>

      {/* Footer label */}
      <div style={{ marginTop: 36, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 16, height: 1, background: '#1e1e1e' }} />
        <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#222', letterSpacing: '.2em', textTransform: 'uppercase' }}>
          Tattoo Studio
        </span>
        <div style={{ width: 16, height: 1, background: '#1e1e1e' }} />
      </div>
    </div>
  );
}
