import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const WorkPlaceholder = () => (
  <div style={{
    aspectRatio: '1/1', borderRadius: 8, background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  </div>
);

export function ArtistsPage({ onSelectArtist, t }) {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'artists'), (snap) => {
      setArtists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', letterSpacing: '.1em' }}>caricamento</div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ padding: '20px 18px 16px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', letterSpacing: '.02em', fontStyle: 'italic', marginBottom: 6 }}>
          {t('nav-artists')}
        </h1>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: '0 2px 2px' }}>
        {artists.map((a, i) => (
          <div
            key={a.id}
            onClick={() => onSelectArtist(a.id)}
            style={{
              gridColumn: i === 0 ? '1 / -1' : undefined,
              position: 'relative', overflow: 'hidden', cursor: 'pointer',
              aspectRatio: i === 0 ? '16/7' : '1/1.1',
              background: a.bg || '#0e0e0e',
              transition: 'opacity .2s',
            }}
          >
            {/* Initials bg */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: i === 0 ? 100 : 70,
                fontWeight: 300, fontStyle: 'italic',
                color: 'rgba(255,255,255,0.04)',
                userSelect: 'none', letterSpacing: '-.02em',
              }}>{a.initials || a.name?.slice(0,2)}</div>
            </div>

            {/* Gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
            }} />

            {/* Info */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: i === 0 ? '20px 20px' : '14px' }}>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: i === 0 ? 30 : 22,
                fontWeight: 400, color: '#f0ece4',
                letterSpacing: '.01em', marginBottom: 4, lineHeight: 1,
              }}>{a.name}</div>
              <div style={{
                fontSize: 9, fontFamily: 'DM Mono, monospace',
                color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '.12em',
              }}>{a.style}</div>
            </div>

            {/* Works badge */}
            {i === 0 && a.works && (
              <div style={{
                position: 'absolute', top: 16, right: 16,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(8px)',
                color: 'rgba(255,255,255,0.5)', fontSize: 9,
                fontFamily: 'DM Mono, monospace', padding: '4px 10px', borderRadius: 4,
                letterSpacing: '.1em', textTransform: 'uppercase',
              }}>{a.works} {t('works-label')}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArtistProfile({ artistId, onBack, onBook, t, lang }) {
  const [artist, setArtist] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editStyle, setEditStyle] = useState('');
  const [saving, setSaving] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (!artistId) return;
    const unsub = onSnapshot(doc(db, 'artists', artistId), (snap) => {
      if (snap.exists()) setArtist({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [artistId]);

  const isOwner = userProfile?.role === 'artista' &&
    artist?.name?.toLowerCase().includes(userProfile?.name?.toLowerCase().split(' ')[0]);

  const handleSave = async () => {
    if (!artist) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'artists', artist.id), { bio: editBio, style: editStyle });
      setEditing(false);
    } catch (e) { alert('Errore: ' + e.message); }
    setSaving(false);
  };

  if (!artist) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', letterSpacing: '.1em' }}>caricamento</div>
    </div>
  );

  const bio = typeof artist.bio === 'object' ? (artist.bio[lang] || artist.bio.it || '') : (artist.bio || '');
  const specs = Array.isArray(artist.specs) ? artist.specs : typeof artist.specs === 'string' ? artist.specs.split(',').map(s => s.trim()) : [];

  return (
    <div style={{ padding: '20px 18px' }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: '#333', fontSize: 11, marginBottom: 24, padding: 0,
        fontFamily: 'DM Mono, monospace', cursor: 'pointer', letterSpacing: '.08em',
        textTransform: 'uppercase', transition: 'color .2s',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {t('back-artists')}
      </button>

      {/* Hero */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontStyle: 'italic',
            color: 'rgba(255,255,255,0.4)', flexShrink: 0,
          }}>{artist.initials}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 400, color: '#f0ece4', letterSpacing: '.01em', marginBottom: 4, lineHeight: 1 }}>
              {artist.name}
            </h2>
            {editing ? (
              <input value={editStyle} onChange={e => setEditStyle(e.target.value)} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 5, padding: '4px 8px', color: '#f0ece4',
                fontFamily: 'DM Mono, monospace', fontSize: 10, width: '100%', outline: 'none',
                letterSpacing: '.06em',
              }} />
            ) : (
              <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#444', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                {artist.style}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
          {[[artist.works, t('works-label')], [artist.rating, t('rating-label')], [artist.exp, t('exp-label')]].filter(([n]) => n).map(([n, l], i, arr) => (
            <div key={i} style={{
              flex: 1, padding: '12px 8px', textAlign: 'center',
              borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 400, color: '#e8e4dc', marginBottom: 2 }}>{n}</div>
              <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#333', textTransform: 'uppercase', letterSpacing: '.1em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 10 }}>
          Bio
        </div>
        {editing ? (
          <textarea value={editBio} onChange={e => setEditBio(e.target.value)} style={{
            width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8, padding: '12px', fontFamily: 'Syne, sans-serif',
            fontSize: 14, color: '#f0ece4', resize: 'none', height: 100, outline: 'none', lineHeight: 1.7,
          }} />
        ) : (
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#666', letterSpacing: '.01em', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
            {bio || 'Nessuna bio ancora.'}
          </p>
        )}
      </div>

      {/* Edit button */}
      {isOwner && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.9)', color: '#0a0a0a',
                border: 'none', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontSize: 12,
                fontWeight: 700, cursor: 'pointer', letterSpacing: '.06em', textTransform: 'uppercase',
              }}>{saving ? '...' : 'Salva'}</button>
              <button onClick={() => setEditing(false)} style={{
                flex: 1, padding: '10px 0', background: 'none', color: '#444',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
                fontFamily: 'Syne, sans-serif', fontSize: 12, cursor: 'pointer',
              }}>Annulla</button>
            </>
          ) : (
            <button onClick={() => { setEditBio(bio); setEditStyle(artist.style || ''); setEditing(true); }} style={{
              width: '100%', padding: '10px 0', background: 'none', color: '#333',
              border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
              fontFamily: 'DM Mono, monospace', fontSize: 10, cursor: 'pointer',
              letterSpacing: '.1em', textTransform: 'uppercase',
            }}>Modifica profilo</button>
          )}
        </div>
      )}

      {/* Specs */}
      {specs.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 10 }}>
            {t('specialties')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {specs.map((s, i) => (
              <span key={i} style={{
                padding: '5px 12px', borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.07)',
                fontSize: 11, color: '#555', letterSpacing: '.04em',
                background: 'rgba(255,255,255,0.02)',
              }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Works */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 10 }}>
          {t('recent-works')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {Array(6).fill(null).map((_, i) => <WorkPlaceholder key={i} />)}
        </div>
      </div>

      <button onClick={() => onBook(artist.name)} style={{
        width: '100%', padding: 15, background: 'rgba(255,255,255,0.9)', color: '#0a0a0a',
        border: 'none', borderRadius: 12, fontSize: 12, fontWeight: 700,
        letterSpacing: '.1em', fontFamily: 'Syne, sans-serif', cursor: 'pointer',
        textTransform: 'uppercase', transition: 'opacity .2s',
      }}>{t('book-with-artist')}</button>
    </div>
  );
}
