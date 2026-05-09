import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';

const BUSY_DAYS = [1, 3, 8, 10, 15, 17, 22];
const ALL_SLOTS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const DAY_NAMES = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

export default function BookingPage({ t, preselectedArtist, userProfile }) {
  const [selectedDay, setSelectedDay] = useState(30);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [artist, setArtist] = useState(preselectedArtist || '');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState('prenota');

  useEffect(() => {
    const q = query(collection(db, 'bookings'), where('day', '==', selectedDay));
    const unsub = onSnapshot(q, (snap) => { setBookedSlots(snap.docs.map(d => d.data().slot)); });
    return unsub;
  }, [selectedDay]);

  useEffect(() => {
    if (!userProfile?.email) return;
    const q = query(collection(db, 'bookings'), where('clientEmail', '==', userProfile.email), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => { setMyBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))); });
    return unsub;
  }, [userProfile]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        clientName: userProfile?.name || 'Utente', clientEmail: userProfile?.email || '',
        artist: artist || 'Nessuna preferenza', day: selectedDay,
        slot: selectedSlot, notes: notes.trim(), status: 'in attesa', createdAt: serverTimestamp(),
      });
      setSuccess(true); setSelectedSlot(null); setNotes('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) { alert('Errore: ' + e.message); }
    setLoading(false);
  };

  const statusColor = (s) => s === 'confermata' ? 'rgba(255,255,255,0.5)' : s === 'rifiutata' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.25)';

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
    padding: '10px 12px', fontFamily: 'Syne, sans-serif', fontSize: 13,
    color: '#f0ece4', outline: 'none', transition: 'border-color .2s',
  };

  return (
    <div style={{ padding: '20px 18px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', letterSpacing: '.02em', fontStyle: 'italic', marginBottom: 6 }}>
          {t('booking-title')}
        </h1>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)', marginBottom: 6 }} />
        <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.08em' }}>{t('booking-sub')}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 24 }}>
        {[['prenota', 'Prenota'], ['mie', 'Le mie']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '10px 0 12px', border: 'none', background: 'none',
            fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 600,
            color: tab === key ? '#fff' : '#333', cursor: 'pointer', letterSpacing: '.06em',
            borderBottom: `1px solid ${tab === key ? 'rgba(255,255,255,0.4)' : 'transparent'}`,
            marginBottom: -1, transition: 'color .2s', textTransform: 'uppercase',
          }}>{label}</button>
        ))}
      </div>

      {tab === 'prenota' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {success && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: 14, textAlign: 'center',
              fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Mono, monospace', letterSpacing: '.08em',
            }}>
              ✓ consulenza prenotata
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 14 }}>
              {t('your-data')}
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>{t('name-label')}</div>
              <input type="text" value={userProfile?.name || ''} readOnly style={{ ...inputStyle, color: '#444' }} />
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>{t('artist-label')}</div>
              <select style={inputStyle} value={artist} onChange={e => setArtist(e.target.value)}>
                <option value="">{t('no-pref')}</option>
                <option>Marco Ferretti</option>
                <option>Sofia Ricci</option>
                <option>Luca D'Angelo</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>{t('notes-label')}</div>
              <textarea style={{ ...inputStyle, resize: 'none', height: 60, lineHeight: 1.5 }} placeholder={t('notes-ph')} value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {/* Calendar */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <button style={{ background: 'none', border: 'none', color: '#333', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}>‹</button>
              <div style={{ fontSize: 12, fontFamily: 'Cormorant Garamond, serif', color: '#888', letterSpacing: '.06em' }}>{t('cal-month')}</div>
              <button style={{ background: 'none', border: 'none', color: '#333', fontSize: 16, cursor: 'pointer', padding: '0 4px' }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 6 }}>
              {DAY_NAMES.map(d => (
                <div key={d} style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', padding: '3px 0', textTransform: 'uppercase', letterSpacing: '.08em' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 16 }}>
              {Array(3).fill(null).map((_, i) => <div key={'e'+i} />)}
              {Array(31).fill(null).map((_, i) => {
                const d = i + 1;
                const isBusy = BUSY_DAYS.includes(d);
                const isSel = selectedDay === d;
                const isToday = d === 30;
                return (
                  <div key={d} onClick={() => { if (!isBusy) { setSelectedDay(d); setSelectedSlot(null); } }} style={{
                    fontSize: 11, padding: '6px 2px', borderRadius: 6, cursor: isBusy ? 'default' : 'pointer',
                    background: isSel ? 'rgba(255,255,255,0.9)' : 'transparent',
                    color: isBusy ? '#1e1e1e' : isSel ? '#0a0a0a' : isToday ? 'rgba(255,255,255,0.5)' : '#555',
                    fontWeight: isSel ? 700 : 400, transition: 'all .15s',
                    fontFamily: isToday ? 'DM Mono, monospace' : 'inherit',
                  }}>{d}</div>
                );
              })}
            </div>
            <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 10 }}>
              {t('slots-label')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
              {ALL_SLOTS.map(slot => {
                const isBooked = bookedSlots.includes(slot);
                const isSel = selectedSlot === slot;
                return (
                  <div key={slot} onClick={() => !isBooked && setSelectedSlot(slot)} style={{
                    padding: '7px 4px', borderRadius: 7, textAlign: 'center',
                    fontSize: 11, fontFamily: 'DM Mono, monospace', cursor: isBooked ? 'default' : 'pointer',
                    border: `1px solid ${isBooked ? 'rgba(255,255,255,0.03)' : isSel ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                    background: isBooked ? 'transparent' : isSel ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.02)',
                    color: isBooked ? '#1e1e1e' : isSel ? '#0a0a0a' : '#555',
                    transition: 'all .15s', letterSpacing: '.04em',
                  }}>{isBooked ? '—' : slot}</div>
                );
              })}
            </div>
          </div>

          <button onClick={handleBook} disabled={loading || !selectedSlot} style={{
            width: '100%', padding: 15,
            background: selectedSlot ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.04)',
            color: selectedSlot ? '#0a0a0a' : '#2a2a2a',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12,
            fontSize: 12, fontWeight: 700, letterSpacing: '.1em', fontFamily: 'Syne, sans-serif',
            cursor: !selectedSlot ? 'not-allowed' : 'pointer', transition: 'all .25s', textTransform: 'uppercase',
          }}>{loading ? '· · ·' : t('confirm-btn')}</button>
        </div>
      )}

      {tab === 'mie' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#2a2a2a', fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '.1em' }}>
              — nessuna prenotazione —
            </div>
          ) : myBookings.map(b => (
            <div key={b.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: '#e8e4dc', marginBottom: 3 }}>
                    {b.day} Maggio · {b.slot}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.08em' }}>
                    {b.artist}
                  </div>
                </div>
                <span style={{
                  fontSize: 8, fontFamily: 'DM Mono, monospace',
                  color: statusColor(b.status), textTransform: 'uppercase', letterSpacing: '.1em',
                  padding: '3px 8px', border: `1px solid ${statusColor(b.status)}`,
                  borderRadius: 4,
                }}>{b.status}</span>
              </div>
              {b.notes ? <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>{b.notes}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

