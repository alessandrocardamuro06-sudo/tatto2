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
    width: '100%', background: '#1c1c1c', border: '1px solid #2a2a2a',
    borderRadius: 8, padding: '11px 14px', fontFamily: 'Syne, sans-serif',
    fontSize: 14, color: '#f0ece4', outline: 'none', marginBottom: 12,
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
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, background: '#0e0e0e', minHeight: '100vh',
    }}>
      {/* Logo */}
      <img
        src="/Logo_Inklovers-2.png"
        alt="Ink Lovers"
        style={{ width: 160, objectFit: 'contain', marginBottom: 32 }}
      />

      <div style={{
        width: '100%', maxWidth: 340,
        background: '#161616', border: '1px solid #1e1e1e',
        borderRadius: 14, padding: 24,
      }}>
        {/* Tab login/registrati */}
        <div style={{ display: 'flex', marginBottom: 20, background: '#1c1c1c', borderRadius: 8, padding: 3 }}>
          {['Accedi', 'Registrati'].map((label, i) => (
            <button key={i} onClick={() => setIsLogin(i === 0)} style={{
              flex: 1, padding: '8px 0', border: 'none', borderRadius: 6,
              fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 600,
              background: isLogin === (i === 0) ? '#c8523a' : 'none',
              color: isLogin === (i === 0) ? '#fff' : '#555',
              transition: 'all .2s', cursor: 'pointer',
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
                  flex: 1, padding: '9px 0',
                  border: `1px solid ${role === r ? '#c8523a' : '#2a2a2a'}`,
                  borderRadius: 8,
                  background: role === r ? '#c8523a' : '#1c1c1c',
                  color: role === r ? '#fff' : '#666',
                  fontSize: 13, fontFamily: 'Syne, sans-serif',
                  fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer',
                }}>{r}</button>
              ))}
            </div>
          </>
        )}

        <input
          type="email" placeholder="Email"
          value={email} onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type="password" placeholder="Password"
          value={password} onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <div style={{ fontSize: 12, color: '#c8523a', marginBottom: 12, textAlign: 'center' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: 13, background: '#c8523a',
            color: '#fff', border: 'none', borderRadius: 10,
            fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
            opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >{loading ? '...' : isLogin ? 'Entra' : 'Crea account'}</button>
      </div>
    </div>
  );
}
