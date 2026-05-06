import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp, where
} from 'firebase/firestore';

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
    const q = query(
      collection(db, 'bookings'),
      where('day', '==', selectedDay)
    );
    const unsub = onSnapshot(q, (snap) => {
      setBookedSlots(snap.docs.map(d => d.data().slot));
    });
    return unsub;
  }, [selectedDay]);

  useEffect(() => {
    if (!userProfile?.email) return;
    const q = query(
      collection(db, 'bookings'),
      where('clientEmail', '==', userProfile.email),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMyBookings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [userProfile]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        clientName: userProfile?.name || 'Utente',
        clientEmail: userProfile?.email || '',
        artist: artist || 'Nessuna preferenza',
        day: selectedDay,
        slot: selectedSlot,
        notes: notes.trim(),
        status: 'in attesa',
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setSelectedSlot(null);
      setNotes('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert('Errore: ' + e.message);
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', background: '#1c1c1c', border: '1px solid #2a2a2a',
    borderRadius: 7, padding: '8px 10px', fontFamily: 'Syne, sans-serif',
    fontSize: 13, color: '#f0ece4', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace',
    color: '#555', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5,
  };

  const statusColor = (s) =>
    s === 'confermata' ? '#5DCAA5' : s === 'rifiutata' ? '#c8523a' : '#888';

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#f0ece4', marginBottom: 4 }}>
        {t('booking-title')}
      </div>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 18, fontFamily: 'DM Mono, monospace' }}>
        {t('booking-sub')}
      </div>

      <div style={{ display: 'flex', background: '#1c1c1c', borderRadius: 8, padding: 3, marginBottom: 20 }}>
        {[{ label: 'Prenota', key: 'prenota' }, { label: 'Le mie prenotazioni', key: 'mie' }].map((item) => (
          <button key={item.key} onClick={() => setTab(item.key)} style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: 6,
            fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 600,
            background: tab === item.key ? '#c8523a' : 'none',
            color: tab === item.key ? '#fff' : '#555',
            cursor: 'pointer', transition: 'all .2s',
          }}>{item.label}</button>
        ))}
      </div>

      {tab === 'prenota' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {success && (
            <div style={{
              background: '#1e2a24', border: '1px solid #5DCAA5',
              borderRadius: 10, padding: 14, textAlign: 'center',
              fontSize: 13, color: '#5DCAA5', fontFamily: 'Syne, sans-serif',
            }}>
              Consulenza prenotata con successo!
            </div>
          )}

          <div style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 16 }}>
            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#f0ece4', marginBottom: 14 }}>
              {t('your-data')}
            </h3>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{t('name-label')}</label>
              <input type="text" value={userProfile?.name || ''} readOnly style={{ ...inputStyle, color: '#555' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{t('artist-label')}</label>
              <select style={inputStyle} value={artist} onChange={e => setArtist(e.target.value)}>
                <option value="">{t('no-pref')}</option>
                <option>Marco Ferretti</option>
                <option>Sofia Ricci</option>
                <option>Luca D'Angelo</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{t('notes-label')}</label>
              <textarea
                style={{ ...inputStyle, resize: 'none', height: 60, lineHeight: 1.5 }}
                placeholder={t('notes-ph')}
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <button style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 5, padding: '3px 9px', color: '#888', fontSize: 13 }}>‹</button>
              <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#f0ece4' }}>{t('cal-month')}</h3>
              <button style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 5, padding: '3px 9px', color: '#888', fontSize: 13 }}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 4 }}>
              {DAY_NAMES.map(d => (
                <div key={d} style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#444', padding: '3px 0', textTransform: 'uppercase' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 14 }}>
              {Array(3).fill(null).map((_, i) => <div key={'e' + i} />)}
              {Array(31).fill(null).map((_, i) => {
                const d = i + 1;
                const isBusy = BUSY_DAYS.includes(d);
                const isSelected = selectedDay === d;
                const isToday = d === 30;
                return (
                  <div key={d} onClick={() => { if (!isBusy) { setSelectedDay(d); setSelectedSlot(null); } }} style={{
                    fontSize: 11, padding: '5px 3px', borderRadius: 5,
                    cursor: isBusy ? 'default' : 'pointer',
                    background: isSelected ? '#c8523a' : 'transparent',
                    color: isBusy ? '#2a2a2a' : isSelected ? '#fff' : isToday ? '#c8523a' : '#888',
                    fontWeight: isSelected || isToday ? 700 : 400,
                  }}>{d}</div>
                );
              })}
            </div>
            <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 7 }}>
              {t('slots-label')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
              {ALL_SLOTS.map(slot => {
                const isBooked = bookedSlots.includes(slot);
                const isSel = selectedSlot === slot;
                return (
                  <div key={slot} onClick={() => !isBooked && setSelectedSlot(slot)} style={{
                    padding: 6, borderRadius: 6, textAlign: 'center',
                    fontSize: 11, fontFamily: 'DM Mono, monospace',
                    cursor: isBooked ? 'default' : 'pointer',
                    border: `1px solid ${isBooked ? '#1e1e1e' : isSel ? '#c8523a' : '#2a2a2a'}`,
                    background: isBooked ? '#111' : isSel ? '#c8523a' : '#1c1c1c',
                    color: isBooked ? '#2a2a2a' : isSel ? '#fff' : '#888',
                  }}>{isBooked ? '✕' : slot}</div>
                );
              })}
            </div>
          </div>

          <button onClick={handleBook} disabled={loading || !selectedSlot} style={{
            width: '100%', padding: 13, background: '#c8523a',
            color: '#fff', border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 700, letterSpacing: '.04em',
            fontFamily: 'Syne, sans-serif',
            opacity: loading || !selectedSlot ? 0.5 : 1,
            cursor: loading || !selectedSlot ? 'not-allowed' : 'pointer',
          }}>{loading ? '...' : t('confirm-btn')}</button>
        </div>
      )}

      {tab === 'mie' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {myBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>
              Nessuna prenotazione ancora.
            </div>
          ) : myBookings.map(b => (
            <div key={b.id} style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#f0ece4' }}>
                  {b.day} Maggio · {b.slot}
                </div>
                <span style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: statusColor(b.status), textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {b.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#555', fontFamily: 'DM Mono, monospace', marginBottom: 4 }}>
                Artista: {b.artist}
              </div>
              {b.notes ? (
                <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>{b.notes}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

