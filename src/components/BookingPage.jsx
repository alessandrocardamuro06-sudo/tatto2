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

  // Carica slot già prenotati per il giorno selezionato
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

  // Carica le prenotazioni dell'utente corrente
  useEffect(() => {
    if (!userProfile) return;
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
        clientEmail: userProfile?.email || 'nessuna@email.com',
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

  const statusColor = (s) => s === 'confermata' ? '#5DCAA5' : s === 'rifiutata' ? '#c8523a' : '#888';

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#f0ece4', marginBottom: 4 }}>
        {t('booking-title')}
      </div>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 18, fontFamily: 'DM Mono, monospace' }}>
        {t('booking-sub')}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: '#1c1c1c', borderRadius: 8, padding: 3, marginBottom: 20 }}>
        {['prenota', 'le mie prenotazioni'].map((label, i) => (
          <button key={i} onClick={() => setTab(i === 0 ? 'prenota' : 'mie')} style={{
            flex: 1, padding: '8px 0', border: 'none', borderRadius: 6,
            fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 600,
            background: tab === (i === 0 ? 'prenota' : 'mie') ? '#c8523a' : 'none',
            color: tab === (i === 0 ? 'prenota' : 'mie') ? '#fff' : '#555',
            cursor: 'pointer', transition: 'all .2s', textTransform: 'capitalize',
          }}>{label}</button>
        ))}
      </div>

      {/* PRENOTA */}
      {tab === 'prenota' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {success && (
            <div
