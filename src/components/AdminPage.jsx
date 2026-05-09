import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, orderBy, query, updateDoc, doc } from 'firebase/firestore';

const statusColor = (s) => s === 'confermata' ? 'rgba(255,255,255,0.5)' : s === 'rifiutata' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)';

export default function AdminPage({ t }) {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')), s => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, 'users'), s => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')), s => setPosts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); };
  }, []);

  const updateStatus = async (id, status) => updateDoc(doc(db, 'bookings', id), { status });
  const formatDate = (ts) => {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const pending = bookings.filter(b => b.status === 'in attesa').length;
  const artistCount = users.filter(u => u.role === 'artista').length;
  const clientCount = users.filter(u => u.role === 'cliente').length;

  return (
    <div style={{ padding: '20px 18px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', letterSpacing: '.02em', fontStyle: 'italic', marginBottom: 6 }}>
          Admin
        </h1>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
        {[['In attesa', pending], ['Clienti', clientCount], ['Artisti', artistCount]].map(([label, val]) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12, padding: '14px 10px', textAlign: 'center',
          }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: '#e8e4dc', marginBottom: 4 }}>{val}</div>
            <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.12em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
        {[['bookings', 'Prenotazioni'], ['users', 'Utenti'], ['posts', 'Post']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '8px 0 10px', border: 'none', background: 'none',
            fontFamily: 'DM Mono, monospace', fontSize: 9, fontWeight: 600,
            color: tab === key ? '#fff' : '#2a2a2a', cursor: 'pointer',
            letterSpacing: '.1em', textTransform: 'uppercase',
            borderBottom: `1px solid ${tab === key ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
            marginBottom: -1, transition: 'color .2s',
          }}>{label}</button>
        ))}
      </div>

      {/* Bookings */}
      {tab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#2a2a2a', fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '.1em' }}>— nessuna prenotazione —</div>
          ) : bookings.map(b => (
            <div key={b.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: '#e8e4dc', marginBottom: 3 }}>{b.clientName}</div>
                  <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.06em' }}>
                    {b.day} Mag · {b.slot} · {b.artist}
                  </div>
                </div>
                <span style={{
                  fontSize: 8, fontFamily: 'DM Mono, monospace', color: statusColor(b.status),
                  textTransform: 'uppercase', letterSpacing: '.1em',
                  padding: '3px 8px', border: `1px solid ${statusColor(b.status)}`, borderRadius: 4,
                }}>{b.status}</span>
              </div>
              {b.notes ? <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: 10, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>{b.notes}</p> : null}
              <div style={{ fontSize: 9, color: '#222', fontFamily: 'DM Mono, monospace', marginBottom: b.status === 'in attesa' ? 12 : 0 }}>{formatDate(b.createdAt)}</div>
              {b.status === 'in attesa' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => updateStatus(b.id, 'confermata')} style={{
                    flex: 1, padding: '8px 0', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7,
                    color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'DM Mono, monospace',
                    cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase', transition: 'all .2s',
                  }}>Conferma</button>
                  <button onClick={() => updateStatus(b.id, 'rifiutata')} style={{
                    flex: 1, padding: '8px 0', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7,
                    color: '#333', fontSize: 10, fontFamily: 'DM Mono, monospace',
                    cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase', transition: 'all .2s',
                  }}>Rifiuta</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: 'rgba(255,255,255,0.4)',
              }}>{u.name?.slice(0,2).toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#e8e4dc', marginBottom: 2 }}>{u.name}</div>
                <div style={{ fontSize: 10, color: '#2a2a2a', fontFamily: 'DM Mono, monospace', letterSpacing: '.04em' }}>{u.email}</div>
              </div>
              <span style={{
                fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#444',
                textTransform: 'uppercase', letterSpacing: '.1em',
                padding: '3px 8px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4,
              }}>{u.role}</span>
            </div>
          ))}
        </div>
      )}

      {/* Posts */}
      {tab === 'posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {posts.map(p => (
            <div key={p.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#888' }}>{p.authorName}</span>
                <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#2a2a2a' }}>{formatDate(p.createdAt)}</span>
              </div>
              {p.imageUrl && <img src={p.imageUrl} alt="" style={{ width: '100%', borderRadius: 6, marginBottom: 8, maxHeight: 100, objectFit: 'cover', opacity: 0.6 }} />}
              <p style={{ fontSize: 12, color: '#444', lineHeight: 1.5, marginBottom: 6 }}>{p.text}</p>
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', letterSpacing: '.06em' }}>♥ {p.likes?.length || 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

