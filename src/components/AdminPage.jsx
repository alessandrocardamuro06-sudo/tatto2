import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, onSnapshot, orderBy, query,
  updateDoc, doc, addDoc, serverTimestamp, increment, where
} from 'firebase/firestore';

const statusColor = (s) => s === 'confermata' ? 'rgba(255,255,255,0.5)' : s === 'rifiutata' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)';

export default function AdminPage({ t }) {
  const [tab, setTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [creditAmount, setCreditAmount] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [addingCredits, setAddingCredits] = useState(false);

  useEffect(() => {
    const u1 = onSnapshot(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')), s => setBookings(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u2 = onSnapshot(collection(db, 'users'), s => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u3 = onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')), s => setPosts(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const u4 = onSnapshot(query(collection(db, 'credits_history'), where('type', '==', 'spent'), orderBy('createdAt', 'desc')), s => setRedemptions(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const updateStatus = async (id, status) => updateDoc(doc(db, 'bookings', id), { status });

  const handleAddCredits = async () => {
    if (!selectedUser || !creditAmount) return;
    const user = users.find(u => u.id === selectedUser);
    if (!user) return;
    setAddingCredits(true);
    try {
      await updateDoc(doc(db, 'users', selectedUser), {
        credits: increment(parseInt(creditAmount))
      });
      await addDoc(collection(db, 'credits_history'), {
        userId: selectedUser,
        userName: user.name,
        type: 'earned',
        label: creditNote || 'Crediti aggiunti da admin',
        amount: parseInt(creditAmount),
        createdAt: serverTimestamp(),
      });
      setCreditAmount('');
      setCreditNote('');
      setSelectedUser('');
    } catch (e) { alert('Errore: ' + e.message); }
    setAddingCredits(false);
  };

  const handleRedemptionStatus = async (id, status) => {
    await updateDoc(doc(db, 'credits_history', id), { status });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const pending = bookings.filter(b => b.status === 'in attesa').length;
  const artistCount = users.filter(u => u.role === 'artista').length;
  const clientCount = users.filter(u => u.role === 'cliente').length;
  const pendingRedemptions = redemptions.filter(r => r.status === 'in attesa').length;

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
    padding: '9px 12px', fontFamily: 'Syne, sans-serif', fontSize: 13,
    color: '#f0ece4', outline: 'none',
  };

  return (
    <div style={{ padding: '20px 18px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', fontStyle: 'italic', marginBottom: 6 }}>
          Admin
        </h1>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
        {[['Prenotazioni', pending], ['Riscatti', pendingRedemptions], ['Clienti', clientCount], ['Artisti', artistCount]].map(([label, val]) => (
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
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20, overflowX: 'auto' }}>
        {[['bookings', 'Prenotazioni'], ['credits-mgmt', 'Crediti'], ['redemptions', 'Riscatti'], ['users', 'Utenti'], ['posts', 'Post']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flexShrink: 0, padding: '8px 12px 10px', border: 'none', background: 'none',
            fontFamily: 'DM Mono, monospace', fontSize: 9, fontWeight: 600,
            color: tab === key ? '#fff' : '#2a2a2a', cursor: 'pointer',
            letterSpacing: '.08em', textTransform: 'uppercase',
            borderBottom: `1px solid ${tab === key ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
            marginBottom: -1, transition: 'color .2s',
          }}>{label}</button>
        ))}
      </div>

      {/* PRENOTAZIONI */}
      {tab === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#2a2a2a', fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '.1em' }}>— nessuna —</div>
          ) : bookings.map(b => (
            <div key={b.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: '#e8e4dc', marginBottom: 3 }}>{b.clientName}</div>
                  <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.06em' }}>
                    {b.day} Mag · {b.slot} · {b.artist}
                  </div>
                </div>
                <span style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: statusColor(b.status), textTransform: 'uppercase', letterSpacing: '.1em', padding: '3px 8px', border: `1px solid ${statusColor(b.status)}`, borderRadius: 4 }}>{b.status}</span>
              </div>
              {b.notes ? <p style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: 10, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>{b.notes}</p> : null}
              {b.status === 'in attesa' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => updateStatus(b.id, 'confermata')} style={{ flex: 1, padding: '8px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'DM Mono, monospace', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase' }}>Conferma</button>
                  <button onClick={() => updateStatus(b.id, 'rifiutata')} style={{ flex: 1, padding: '8px 0', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, color: '#333', fontSize: 10, fontFamily: 'DM Mono, monospace', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase' }}>Rifiuta</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* GESTIONE CREDITI */}
      {tab === 'credits-mgmt' && (
        <div>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 14 }}>
              Aggiungi crediti a un utente
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Utente</div>
              <select style={inputStyle} value={selectedUser} onChange={e => setSelectedUser(e.target.value)}>
                <option value="">Seleziona utente</option>
                {users.filter(u => u.role !== 'admin').map(u => (
                  <option key={u.id} value={u.id}>{u.name} — {u.credits || 0} crediti</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Crediti da aggiungere</div>
              <input type="number" min="1" placeholder="es. 50" style={inputStyle} value={creditAmount} onChange={e => setCreditAmount(e.target.value)} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Motivazione</div>
              <input type="text" placeholder="es. Tatuaggio completato" style={inputStyle} value={creditNote} onChange={e => setCreditNote(e.target.value)} />
            </div>
            <button
              onClick={handleAddCredits}
              disabled={addingCredits || !selectedUser || !creditAmount}
              style={{
                width: '100%', padding: 12,
                background: selectedUser && creditAmount ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.04)',
                color: selectedUser && creditAmount ? '#0a0a0a' : '#2a2a2a',
                border: 'none', borderRadius: 10, fontSize: 11, fontWeight: 700,
                fontFamily: 'Syne, sans-serif', letterSpacing: '.1em', textTransform: 'uppercase',
                cursor: selectedUser && creditAmount ? 'pointer' : 'not-allowed',
              }}
            >{addingCredits ? '...' : 'Aggiungi crediti'}</button>
          </div>

          {/* Lista utenti con saldo */}
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 12 }}>
            Saldo utenti
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {users.filter(u => u.role !== 'admin').map(u => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#888', marginBottom: 1 }}>{u.name}</div>
                  <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', letterSpacing: '.06em', textTransform: 'uppercase' }}>{u.role}</div>
                </div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                  {u.credits || 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RISCATTI */}
      {tab === 'redemptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {redemptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#2a2a2a', fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '.1em' }}>— nessun riscatto —</div>
          ) : redemptions.map(r => (
            <div key={r.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#e8e4dc', marginBottom: 3 }}>{r.userName}</div>
                  <div style={{ fontSize: 12, color: '#666', marginBottom: 3 }}>{r.label}</div>
                  <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#2a2a2a' }}>{formatDate(r.createdAt)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', marginBottom: 6 }}>−{r.amount}</div>
                  <span style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: statusColor(r.status), padding: '2px 7px', border: `1px solid ${statusColor(r.status)}`, borderRadius: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                    {r.status}
                  </span>
                </div>
              </div>
              {r.status === 'in attesa' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={() => handleRedemptionStatus(r.id, 'confermata')} style={{ flex: 1, padding: '7px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, color: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'DM Mono, monospace', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase' }}>Conferma</button>
                  <button onClick={() => handleRedemptionStatus(r.id, 'rifiutata')} style={{ flex: 1, padding: '7px 0', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 7, color: '#333', fontSize: 10, fontFamily: 'DM Mono, monospace', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase' }}>Rifiuta</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* UTENTI */}
      {tab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
                {u.name?.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#e8e4dc', marginBottom: 2 }}>{u.name}</div>
                <div style={{ fontSize: 10, color: '#2a2a2a', fontFamily: 'DM Mono, monospace', letterSpacing: '.04em' }}>{u.email}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{u.credits || 0}</div>
                <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.08em' }}>{u.role}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POST */}
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
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#2a2a2a' }}>♥ {p.likes?.length || 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

