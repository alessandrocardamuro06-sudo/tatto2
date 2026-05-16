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

// Tile artista — usa foto se disponibile, altrimenti iniziali
function ArtistTile({ artist, index, onClick }) {
  const hasPhoto = !!artist.photoUrl;

  return (
    <div
      onClick={() => onClick(artist.id)}
      style={{
        gridColumn: index === 0 ? '1 / -1' : undefined,
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        aspectRatio: index === 0 ? '16/7' : '1/1.1',
        borderRadius: 4, background: artist.bg || '#0e0e0e',
        transition: 'opacity .2s',
      }}
    >
      {/* Foto o iniziali come sfondo */}
      {hasPhoto ? (
        <img
          src={artist.photoUrl}
           onError={(e) => { console.error('IMG ERROR:', artist.name, artist.photoUrl); e.target.style.display='none'; }}
          alt={artist.name}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            transition: 'transform .4s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: index === 0 ? 100 : 70,
            fontWeight: 300, fontStyle: 'italic',
            color: 'rgba(255,255,255,0.04)',
            userSelect: 'none', letterSpacing: '-.02em',
          }}>{artist.initials || artist.name?.slice(0, 2)}</div>
        </div>
      )}

      {/* Gradient overlay — più forte se c'è la foto */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hasPhoto
          ? 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.1) 100%)'
          : 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.1) 100%)',
      }} />

      {/* Info in basso */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: index === 0 ? '20px' : '14px' }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: index === 0 ? 30 : 22,
          fontWeight: 400, color: '#f0ece4',
          letterSpacing: '.01em', marginBottom: 4, lineHeight: 1,
          textShadow: hasPhoto ? '0 1px 8px rgba(0,0,0,0.8)' : 'none',
        }}>{artist.name}</div>
        <div style={{
          fontSize: 9, fontFamily: 'DM Mono, monospace',
          color: hasPhoto ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.3)',
          textTransform: 'uppercase', letterSpacing: '.12em',
        }}>{artist.style}</div>
      </div>

      {/* Badge lavori sul primo tile */}
      {index === 0 && artist.works && (
        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: 'rgba(255,255,255,0.6)', fontSize: 9,
          fontFamily: 'DM Mono, monospace', padding: '4px 10px',
          borderRadius: 4, letterSpacing: '.1em', textTransform: 'uppercase',
        }}>{artist.works} lavori</div>
      )}
    </div>
  );
}

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
      <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#555', letterSpacing: '.1em' }}>caricamento</div>
    </div>
  );

  if (artists.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#444', letterSpacing: '.1em' }}>nessun artista</div>
    </div>
  );

  return (
    <div>
      <div style={{ padding: '20px 18px 16px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', letterSpacing: '.02em', fontStyle: 'italic', marginBottom: 6 }}>
          {t('nav-artists')}
        </h1>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, padding: '0 2px 2px' }}>
        {artists.map((a, i) => (
          <ArtistTile key={a.id} artist={a} index={i} onClick={onSelectArtist} />
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
      <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#555', letterSpacing: '.1em' }}>caricamento</div>
    </div>
  );

  const bio = typeof artist.bio === 'object' ? (artist.bio[lang] || artist.bio.it || '') : (artist.bio || '');
  const specs = Array.isArray(artist.specs) ? artist.specs : typeof artist.specs === 'string' ? artist.specs.split(',').map(s => s.trim()) : [];
  const hasPhoto = !!artist.photoUrl;

  return (
    <div>
      {/* Hero con foto fullwidth */}
      <div style={{ position: 'relative', height: 260, overflow: 'hidden' }}>
        {hasPhoto ? (
          <img src={artist.photoUrl} alt={artist.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', background: artist.bg || '#0e0e0e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 120, fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.04)' }}>
              {artist.initials}
            </div>
          </div>
        )}
        {/* Gradient bottom */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #070707 0%, rgba(7,7,7,0.5) 50%, rgba(7,7,7,0.15) 100%)' }} />
        {/* Back button */}
        <button onClick={onBack} style={{
          position: 'absolute', top: 16, left: 16,
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20,
          padding: '6px 12px', color: 'rgba(255,255,255,0.7)',
          fontSize: 11, fontFamily: 'DM Mono, monospace', cursor: 'pointer',
          letterSpacing: '.08em', textTransform: 'uppercase',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {t('back-artists')}
        </button>
        {/* Nome sovrapposto */}
        <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 400, color: '#f0ece4', letterSpacing: '.01em', marginBottom: 4, lineHeight: 1, textShadow: hasPhoto ? '0 2px 12px rgba(0,0,0,0.9)' : 'none' }}>
            {artist.name}
          </h2>
          {editing ? (
            <input value={editStyle} onChange={e => setEditStyle(e.target.value)} style={{
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 5, padding: '4px 8px', color: '#f0ece4',
              fontFamily: 'DM Mono, monospace', fontSize: 10, outline: 'none',
              letterSpacing: '.06em', width: '60%',
            }} />
          ) : (
            <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '.12em' }}>
              {artist.style}
            </div>
          )}
        </div>
      </div>

      {/* Contenuto */}
      <div style={{ padding: '20px 18px' }}>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
          {[[artist.works, t('works-label')], [artist.rating, t('rating-label')], [artist.exp, t('exp-label')]].filter(([n]) => n).map(([n, l], i, arr) => (
            <div key={i} style={{
              flex: 1, padding: '14px 8px', textAlign: 'center',
              borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontWeight: 400, color: '#e8e4dc', marginBottom: 3 }}>{n}</div>
              <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.1em' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#444', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 10 }}>Bio</div>
          {editing ? (
            <textarea value={editBio} onChange={e => setEditBio(e.target.value)} style={{
              width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, padding: '12px', fontFamily: 'Syne, sans-serif',
              fontSize: 14, color: '#f0ece4', resize: 'none', height: 100, outline: 'none', lineHeight: 1.7,
            }} />
          ) : (
            <p style={{ fontSize: 14, lineHeight: 1.8, color: '#888', letterSpacing: '.01em', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
              {bio || 'Nessuna bio ancora.'}
            </p>
          )}
        </div>

        {/* Pulsante modifica artista */}
        {isOwner && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.9)', color: '#0a0a0a', border: 'none', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '.06em', textTransform: 'uppercase' }}>
                  {saving ? '...' : 'Salva'}
                </button>
                <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '10px 0', background: 'none', color: '#888', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontSize: 12, cursor: 'pointer' }}>
                  Annulla
                </button>
              </>
            ) : (
              <button onClick={() => { setEditBio(bio); setEditStyle(artist.style || ''); setEditing(true); }} style={{ width: '100%', padding: '10px 0', background: 'none', color: '#666', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, fontFamily: 'DM Mono, monospace', fontSize: 10, cursor: 'pointer', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                Modifica profilo
              </button>
            )}
          </div>
        )}

        {/* Specialità */}
        {specs.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#444', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 10 }}>
              {t('specialties')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {specs.map((s, i) => (
                <span key={i} style={{ padding: '5px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.09)', fontSize: 11, color: '#888', letterSpacing: '.04em', background: 'rgba(255,255,255,0.02)' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Lavori */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#444', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 10 }}>
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
          textTransform: 'uppercase',
        }}>{t('book-with-artist')}</button>
      </div>
    </div>
  );
}

