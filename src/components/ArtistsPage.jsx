import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const WorkPlaceholder = () => (
  <div style={{
    height: 80, borderRadius: 8, background: '#1c1c1c',
    border: '1px solid #222', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div style={{ fontSize: 13, fontFamily: 'DM Mono, monospace', color: '#555' }}>Caricamento...</div>
      </div>
    );
  }

  if (artists.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div style={{ fontSize: 13, fontFamily: 'DM Mono, monospace', color: '#555' }}>Nessun artista trovato.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, padding: 3 }}>
      {artists.map((a, i) => (
        <div
          key={a.id}
          onClick={() => onSelectArtist(a.id)}
          style={{
            gridColumn: i === 0 ? '1 / -1' : undefined,
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            aspectRatio: i === 0 ? '2/1' : '1/1.1',
            borderRadius: 4,
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: a.bg || '#1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: i === 0 ? 100 : 70,
              height: i === 0 ? 100 : 70,
              borderRadius: '50%',
              background: a.bg || '#1a1a1a',
              border: `2px solid ${a.color || '#c8523a'}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'DM Serif Display, serif',
              fontSize: i === 0 ? 36 : 24,
              color: a.color || '#c8523a',
              fontWeight: 700,
            }}>{a.initials || a.name?.slice(0,2).toUpperCase()}</div>
          </div>

          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.05) 60%)',
          }} />

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
            <div style={{
              fontFamily: 'DM Serif Display, serif',
              fontSize: i === 0 ? 26 : 20,
              color: '#fff', lineHeight: 1.1, marginBottom: 4,
            }}>{a.name}</div>
            <div style={{
              fontSize: 10, fontFamily: 'DM Mono, monospace',
              color: '#c8523a', textTransform: 'uppercase', letterSpacing: '.1em',
            }}>{a.style}</div>
          </div>

          {i === 0 && a.works && (
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: 'rgba(200,82,58,.9)', color: '#fff',
              fontSize: 10, fontFamily: 'DM Mono, monospace',
              padding: '3px 8px', borderRadius: 4,
            }}>{t('works-label')} {a.works}</div>
          )}
        </div>
      ))}
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
      if (snap.exists()) {
        setArtist({ id: snap.id, ...snap.data() });
      }
    });
    return unsub;
  }, [artistId]);

  const isOwner = userProfile?.role === 'artista' &&
    artist?.name?.toLowerCase().includes(userProfile?.name?.toLowerCase().split(' ')[0]?.toLowerCase());

  const handleSave = async () => {
    if (!artist) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'artists', artist.id), {
        bio: editBio,
        style: editStyle,
      });
      setEditing(false);
    } catch (e) {
      alert('Errore: ' + e.message);
    }
    setSaving(false);
  };

  if (!artist) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <div style={{ fontSize: 13, fontFamily: 'DM Mono, monospace', color: '#555' }}>Caricamento...</div>
      </div>
    );
  }

  const bio = typeof artist.bio === 'object'
    ? (artist.bio[lang] || artist.bio.it || '')
    : (artist.bio || '');

  const specs = Array.isArray(artist.specs)
    ? artist.specs
    : typeof artist.specs === 'string'
    ? artist.specs.split(',').map(s => s.trim())
    : [];

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', color: '#888',
        fontSize: 13, marginBottom: 16, padding: 0,
        fontFamily: 'Syne, sans-serif', cursor: 'pointer',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {t('back-artists')}
      </button>

      {/* Hero */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: '#161616', border: '1px solid #1e1e1e',
        borderRadius: 12, padding: 16, marginBottom: 16,
      }}>
        <div style={{
          width: 70, height: 70, borderRadius: '50%',
          background: artist.bg || '#1a1a1a',
          color: artist.color || '#c8523a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'DM Serif Display, serif', fontSize: 26, fontWeight: 700, flexShrink: 0,
        }}>{artist.initials || artist.name?.slice(0,2).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#f0ece4', marginBottom: 2 }}>
            {artist.name}
          </div>
          {editing ? (
            <input
              value={editStyle}
              onChange={e => setEditStyle(e.target.value)}
              style={{
                background: '#1c1c1c', border: '1px solid #c8523a',
                borderRadius: 5, padding: '4px 8px', color: '#f0ece4',
                fontFamily: 'DM Mono, monospace', fontSize: 11,
                width: '100%', outline: 'none', marginBottom: 8,
              }}
            />
          ) : (
            <div style={{
              fontSize: 11, fontFamily: 'DM Mono, monospace',
              color: '#c8523a', textTransform: 'uppercase',
              letterSpacing: '.08em', marginBottom: 8,
            }}>{artist.style}</div>
          )}
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              [artist.works, t('works-label')],
              [artist.rating, t('rating-label')],
              [artist.exp, t('exp-label')],
            ].filter(([n]) => n).map(([n, l], i) => (
              <div key={i}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Serif Display, serif', color: '#f0ece4' }}>{n}</div>
                <div style={{ fontSize: 10, color: '#555', fontFamily: 'DM Mono, monospace' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 14, marginBottom: 16 }}>
        {editing ? (
          <textarea
            value={editBio}
            onChange={e => setEditBio(e.target.value)}
            style={{
              width: '100%', background: '#1c1c1c', border: '1px solid #c8523a',
              borderRadius: 7, padding: '8px 10px', fontFamily: 'Syne, sans-serif',
              fontSize: 13, color: '#f0ece4', resize: 'none', height: 100,
              outline: 'none', lineHeight: 1.6,
            }}
          />
        ) : (
          <p style={{ fontSize: 13, lineHeight: 1.7, color: '#aaa' }}>{bio || 'Nessuna bio ancora.'}</p>
        )}
      </div>

      {/* Pulsante modifica per artisti */}
      {isOwner && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {editing ? (
            <>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: '10px 0', background: '#c8523a', color: '#fff',
                border: 'none', borderRadius: 8, fontFamily: 'Syne, sans-serif',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}>{saving ? '...' : 'Salva'}</button>
              <button onClick={() => setEditing(false)} style={{
                flex: 1, padding: '10px 0', background: 'none', color: '#888',
                border: '1px solid #2a2a2a', borderRadius: 8,
                fontFamily: 'Syne, sans-serif', fontSize: 13, cursor: 'pointer',
              }}>Annulla</button>
            </>
          ) : (
            <button onClick={() => { setEditBio(bio); setEditStyle(artist.style || ''); setEditing(true); }} style={{
              width: '100%', padding: '10px 0', background: 'none', color: '#888',
              border: '1px solid #2a2a2a', borderRadius: 8,
              fontFamily: 'Syne, sans-serif', fontSize: 13, cursor: 'pointer',
            }}>✏️ Modifica profilo</button>
          )}
        </div>
      )}

      {/* Specialità */}
      {specs.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
            {t('specialties')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {specs.map((s, i) => (
              <span key={i} style={{
                padding: '6px 12px', borderRadius: 999,
                border: '1px solid #2a2a2a', fontSize: 12, color: '#aaa', background: '#161616',
              }}>{s}</span>
            ))}
          </div>
        </>
      )}

      {/* Lavori */}
      <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
        {t('recent-works')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {Array(6).fill(null).map((_, i) => <WorkPlaceholder key={i} />)}
      </div>

      <button onClick={() => onBook(artist.name)} style={{
        width: '100%', marginTop: 16, padding: 13,
        background: '#c8523a', color: '#fff', border: 'none',
        borderRadius: 10, fontSize: 13, fontWeight: 700,
        letterSpacing: '.04em', fontFamily: 'Syne, sans-serif', cursor: 'pointer',
      }}>{t('book-with-artist')}</button>
    </div>
  );
}
