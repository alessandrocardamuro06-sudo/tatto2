import React, { useState } from 'react';

const BUSY_DAYS = [1, 3, 8, 10, 15, 17, 22];
const ALL_SLOTS = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const BOOKED_MAP = { 30: ['11:00', '15:00'], 5: ['10:00', '14:00'] };
const DAY_NAMES = ['Lu', 'Ma', 'Me', 'Gi', 'Ve', 'Sa', 'Do'];

export default function BookingPage({ t, preselectedArtist }) {
  const [selectedDay, setSelectedDay] = useState(30);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const bookedSlots = BOOKED_MAP[selectedDay] || [];

  const inputStyle = {
    width: '100%', background: '#1c1c1c', border: '1px solid #2a2a2a',
    borderRadius: 7, padding: '8px 10px', fontFamily: 'Syne, sans-serif',
    fontSize: 13, color: '#f0ece4', outline: 'none',
  };

  const labelStyle = {
    display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace',
    color: '#555', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5,
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#f0ece4', marginBottom: 4 }}>
        {t('booking-title')}
      </div>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 18, fontFamily: 'DM Mono, monospace' }}>
        {t('booking-sub')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Form */}
        <div style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 16 }}>
          <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: '#f0ece4', marginBottom: 14 }}>
            {t('your-data')}
          </h3>
          {[
            { label: t('name-label'), type: 'text', ph: t('name-ph') },
            { label: t('email-label'), type: 'email', ph: 'email@esempio.com' },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <label style={labelStyle}>{f.label}</label>
              <input type={f.type} placeholder={f.ph} style={inputStyle} />
            </div>
          ))}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>{t('artist-label')}</label>
            <select style={inputStyle} defaultValue={preselectedArtist || ''}>
              <option value="">{t('no-pref')}</option>
              <option>Marco Ferretti</option>
              <option>Sofia Ricci</option>
              <option>Luca D'Angelo</option>
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>{t('notes-label')}</label>
            <textarea style={{ ...inputStyle, resize: 'none', height: 60, lineHeight: 1.5 }} placeholder={t('notes-ph')} />
          </div>
          <button style={{
            width: '100%', marginTop: 4, padding: 13,
            background: '#c8523a', color: '#fff', border: 'none',
            borderRadius: 10, fontSize: 13, fontWeight: 700,
            letterSpacing: '.04em', fontFamily: 'Syne, sans-serif',
          }}>{t('confirm-btn')}</button>
        </div>

        {/* Calendar */}
        <div style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <button style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 5, padding: '3px 9px', color: '#888', fontSize: 13 }}>‹</button>
            <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: '#f0ece4' }}>{t('cal-month')}</h3>
            <button style={{ background: 'none', border: '1px solid #2a2a2a', borderRadius: 5, padding: '3px 9px', color: '#888', fontSize: 13 }}>›</button>
          </div>

          {/* Day names */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 4 }}>
            {DAY_NAMES.map(d => (
              <div key={d} style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#444', padding: '3px 0', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          {/* Days */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center', marginBottom: 12 }}>
            {/* offset */}
            {Array(3).fill(null).map((_, i) => <div key={'e' + i} />)}
            {Array(31).fill(null).map((_, i) => {
              const d = i + 1;
              const isBusy = BUSY_DAYS.includes(d);
              const isSelected = selectedDay === d;
              const isToday = d === 30;
              return (
                <div
                  key={d}
                  onClick={() => !isBusy && setSelectedDay(d)}
                  style={{
                    fontSize: 11, padding: '5px 3px', borderRadius: 5, cursor: isBusy ? 'default' : 'pointer',
                    background: isSelected ? '#c8523a' : 'transparent',
                    color: isBusy ? '#2a2a2a' : isSelected ? '#fff' : isToday ? '#c8523a' : '#888',
                    fontWeight: isSelected || isToday ? 700 : 400,
                    transition: 'all .15s',
                  }}
                >{d}</div>
              );
            })}
          </div>

          {/* Slots */}
          <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 7 }}>
            {t('slots-label')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
            {ALL_SLOTS.map(slot => {
              const isBooked = bookedSlots.includes(slot);
              const isSel = selectedSlot === slot;
              return (
                <div
                  key={slot}
                  onClick={() => !isBooked && setSelectedSlot(slot)}
                  style={{
                    padding: 6, borderRadius: 6, textAlign: 'center',
                    fontSize: 11, fontFamily: 'DM Mono, monospace',
                    cursor: isBooked ? 'default' : 'pointer',
                    border: `1px solid ${isBooked ? '#1e1e1e' : isSel ? '#c8523a' : '#2a2a2a'}`,
                    background: isSel ? '#c8523a' : '#1c1c1c',
                    color: isBooked ? '#2a2a2a' : isSel ? '#fff' : '#888',
                    transition: 'all .15s',
                  }}
                >{slot}</div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
