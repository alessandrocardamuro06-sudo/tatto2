import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, onSnapshot, orderBy,
  query, updateDoc, doc, getDocs
} from 'firebase/firestore';

const statusColor = (s) =>
  s === 'confermata' ? '#5DCAA5' : s === 'rifiutata' ? '#c8523a' : '#888';

const StatCard = ({ label, value, color }) => (
  <div style={{
    background: '#161616', border: '1px solid #1e1e1e',
    borderRadius: 12, padding: 16, textAlign: 'center', flex: 1,
  }}>
    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: color || '#f0ece4', marginBottom: 4 }}>
      {value}
    </div>
    <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.08em' }}>
      {label}
    </div>
  </div>
);

export default function AdminPage({ t }) {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubBookings = onSnapshot(
      query(collection(db, 'bookings'), orderBy('createdAt', 'desc')),
      (snap) => {
        setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }
    );
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubPosts = onSnapshot(
      query(collection(db, 'posts'), orderBy('createdAt', 'desc')),
      (snap) => { setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }
    );
    return () => { unsubBookings(); unsubUsers(); unsubPosts(); };
  }, []);

  const updateBookingStatus = async (id, status) => {
    await updateDoc(doc(db, 'bookings', id), { status });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate();
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const pendingCount = bookings.filter(b => b.status === 'in attesa').length;
  const artistCount = users.filter(u => u.role === 'artista').length;
  const clientCount = users.filter(u => u.role === 'cliente').length;

  const tabs = [
    { key: 'bookings', label: 'Prenotazioni' },
    { key: 'users', label: 'Utenti' },
    { key: 'posts', label: 'Post' },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#f0ece4', marginBottom: 4 }}>
        Pannello Admin
      </div>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 20, fontFamily: 'DM Mono, monospace' }}>
        Gestione studio Ink Lovers
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <StatCard label="In attesa" value={pendingCount} color="#c8523a" />
        <StatCard label="Clienti" value={clientCount} color="#85B7EB" />
        <StatCard label="Artisti" value={artistCount} color="#5DCAA5" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: '#1c1c1c', borderRadius: 8, padding: 3, marginBottom: 20 }}>
        {tabs.map(item => (
          <button key={item.key} onClick={() => setTab(item.key)} style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: 6,
            fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 600,
            background: tab === item.key ? '#c8523a' : 'none',
            color: tab === item.key ? '#fff' : '#555',
            cursor: 'pointer', transition: 'all .2s',
          }}>{item.label}</button>
        ))}
      </div>

      {/* PRENOTAZIONI */}
      {tab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>
              Caricamento...
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>
              Nessuna prenotazione.
            </div>
          ) : bookings.map(b => (
            <div key={b.id} style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#f0ece4' }}>
                  {b.clientName}
                </div>
                <span style={{
                  fontSize: 10, fontFamily: 'DM Mono, monospace',
                  color: statusColor(b.status), textTransform: 'uppercase', letterSpacing: '.06em',
                }}>{b.status}</span>
              </div>
              <div style={{ fontSize: 12, color: '#555', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>
                {b.day} Maggio · {b.slot} · {b.artist}
              </div>
              {b.notes ? (
                <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6, marginBottom: 10 }}>{b.notes}</div>
              ) : null}
              <div style={{ fontSize: 11, color: '#444', fontFamily: 'DM Mono, monospace', marginBottom: 10 }}>
                {formatDate(b.createdAt)}
              </div>
              {b.status === 'in attesa' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'confermata')}
                    style={{
                      flex: 1, padding: '8px 0', background: '#1e2a24',
                      border: '1px solid #5DCAA5', borderRadius: 8,
                      color: '#5DCAA5', fontSize: 12, fontFamily: 'Syne, sans-serif',
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >✓ Conferma</button>
                  <button
                    onClick={() => updateBookingStatus(b.id, 'rifiutata')}
                    style={{
                      flex: 1, padding: '8px 0', background: '#2a1a18',
                      border: '1px solid #c8523a', borderRadius: 8,
                      color: '#c8523a', fontSize: 12, fontFamily: 'Syne, sans-serif',
                      fontWeight: 600, cursor: 'pointer',
                    }}
                  >✕ Rifiuta</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* UTENTI */}
      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>
              Nessun utente.
            </div>
          ) : users.map(u => (
            <div key={u.id} style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: u.role === 'artista' ? '#1e2a24' : u.role === 'admin' ? '#2a1a18' : '#1c1c1c',
                  color: u.role === 'artista' ? '#5DCAA5' : u.role === 'admin' ? '#c8523a' : '#888',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'DM Serif Display, serif', fontSize: 14, fontWeight: 700,
                }}>
                  {u.name?.slice(0,2).toUpperCase() || '??'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ece4', marginBottom: 2 }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace' }}>{u.email}</div>
                </div>
                <span style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 999,
                  background: u.role === 'artista' ? '#1e2a24' : u.role === 'admin' ? '#2a1a18' : '#1c1c1c',
                  color: u.role === 'artista' ? '#5DCAA5' : u.role === 'admin' ? '#c8523a' : '#888',
                  border: `1px solid ${u.role === 'artista' ? '#5DCAA5' : u.role === 'admin' ? '#c8523a' : '#2a2a2a'}`,
                  fontFamily: 'DM Mono, monospace', textTransform: 'uppercase', letterSpacing: '.06em',
                }}>{u.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POST */}
      {tab === 'posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>
              Nessun post.
            </div>
          ) : posts.map(p => (
            <div key={p.id} style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ece4' }}>
                  {p.authorName}
                  {p.authorRole === 'artista' && (
                    <span style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 999,
                      background: '#c8523a', color: '#fff', marginLeft: 6,
                    }}>Artista</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#444', fontFamily: 'DM Mono, monospace' }}>
                  {formatDate(p.createdAt)}
                </div>
              </div>
              {p.imageUrl && (
                <img src={p.imageUrl} alt="post" style={{ width: '100%', borderRadius: 6, marginBottom: 8, maxHeight: 120, objectFit: 'cover' }} />
              )}
              <p style={{ fontSize: 12, color: '#aaa', lineHeight: 1.6, marginBottom: 6 }}>{p.text}</p>
              <div style={{ fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace' }}>
                ♥ {p.likes?.length || 0} like
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
