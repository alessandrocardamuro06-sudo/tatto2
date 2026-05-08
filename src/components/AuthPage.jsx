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
    width: '100%',
    background: '#1a1a1a',
    border: '1px solid #252525',
    borderRadius: 8,
    padding: '12px 14px',
    fontFamily: 'Syne, sans-serif',
    fontSize: 14,
    color: '#f5f5f5',
    outline: 'none',
    marginBottom: 12,
    transition: 'border-color .2s',
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name, role);
      }
    } catch (e) {
      setError(
        e.message.includes('wrong-password') || e.message.includes('user-not-found')
          ? 'Email o password errati.'
          : e.message.includes('email-already-in-use')
          ? 'Email già registrata.'
          : 'Errore. Riprova.'
      );
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 65%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ marginBottom: 8, textAlign: 'center' }}>
        <img
          src="/Logo_Inklovers-2.png"
          alt="Ink Lovers"
          style={{ width: 200, objectFit: 'contain' }}
        />
      </div>

      <div style={{
        width: 1,
        height: 40,
        background: 'linear-gradient(to bottom, #333, transparent)',
        marginBottom: 32,
      }} />

      <div style={{
        width: '100%',
        maxWidth: 340,
        background: '#111',
        border: '1px solid #222',
        borderRadius: 16,
        padding: 24,
        boxShadow: '0 0 60px rgba(0,0,0,.6)',
      }}>
        <div style={{ display: 'flex', marginBottom: 24, background: '#1a1a1a', borderRadius: 10, padding: 3 }}>
          {['Accedi', 'Registrati'].map((label, i) => (
            <button key={i} onClick={() => setIsLogin(i === 0)} style={{
              flex: 1, padding: '9px 0', border: 'none', borderRadius: 8,
              fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600,
              background: isLogin === (i === 0) ? '#fff' : 'none',
              color: isLogin === (i === 0) ? '#000' : '#555',
              transition: 'all .2s', cursor: 'pointer',
              letterSpacing: '.03em',
            }}>{label}</button>
          ))}
        </div>

        {!isLogin && (
          <>
            <input
              placeholder="Nome completo"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['cliente', 'artista'].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  flex: 1, padding: '10px 0',
                  border: `1px solid ${role === r ? '#fff' : '#252525'}`,
                  borderRadius: 8,
                  background: role === r ? '#fff' : '#1a1a1a',
                  color: role === r ? '#000' : '#555',
                  fontSize: 13, fontFamily: 'Syne, sans-serif',
                  fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer',
                  transition: 'all .2s',
                }}>{r}</button>
              ))}
            </div>
          </>
        )}

        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />

        {error && (
          <div style={{ fontSize: 12, color: '#aaa', marginBottom: 12, textAlign: 'center', fontFamily: 'DM Mono, monospace' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: 14, background: '#fff',
            color: '#000', border: 'none', borderRadius: 10,
            fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
            opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '.05em', transition: 'opacity .2s',
          }}
        >{loading ? '...' : isLogin ? 'Entra' : 'Crea account'}</button>
      </div>

      <div style={{ marginTop: 32, fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', letterSpacing: '.15em' }}>
        INK LOVERS STUDIO
      </div>
    </div>
  );
}
