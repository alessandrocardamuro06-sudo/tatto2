import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';

const STYLE_OPTIONS = ['Traditional','Blackwork','Realism','Watercolor','Geometric','Dotwork','Neo-trad','Tribal','Fine Line','Minimal','Chicano','Japanese'];

export default function ArtistProfileEdit({ onBack }) {
  const { currentUser } = useAuth();
  const [artist, setArtist] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const photoRef = useRef();

  // Form state
  const [bio, setBio] = useState('');
  const [style, setStyle] = useState('');
  const [specs, setSpecs] = useState([]);
  const [newSpec, setNewSpec] = useState('');
  const [exp, setExp] = useState('');
  const [works, setWorks] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'artists', currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setArtist({ id: snap.id, ...data });
        setBio(data.bio || '');
        setStyle(data.style || '');
        setSpecs(Array.isArray(data.specs) ? data.specs : []);
        setExp(data.exp || '');
        setWorks(data.works?.toString() || '');
      }
    });
    return unsub;
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'artists', currentUser.uid), {
        bio, style, specs,
        exp: exp || '—',
        works: parseInt(works) || 0,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) { alert('Errore: ' + e.message); }
    setSaving(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const storageRef = ref(storage, `artists/${currentUser.uid}_${Date.now()}`);
      const task = uploadBytesResumable(storageRef, file);
      const url = await new Promise((resolve, reject) => {
        task.on('state_changed',
          s => setUploadProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
          reject,
          async () => resolve(await getDownloadURL(task.snapshot.ref))
        );
      });
      await updateDoc(doc(db, 'artists', currentUser.uid), { photoUrl: url });
      setUploadProgress(0);
    } catch (e) { alert('Errore upload: ' + e.message); }
    setUploadingPhoto(false);
  };

  const addSpec = () => {
    const s = newSpec.trim();
    if (s && !specs.includes(s)) { setSpecs(prev => [...prev, s]); setNewSpec(''); }
  };

  const removeSpec = (s) => setSpecs(prev => prev.filter(x => x !== s));

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8,
    padding: '10px 12px', fontFamily: 'Syne, sans-serif', fontSize: 13,
    color: '#f0ece4', outline: 'none',
  };

  const labelStyle = {
    fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#444',
    textTransform: 'uppercase', letterSpacing: '.15em', display: 'block', marginBottom: 7,
  };

  if (!artist) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#555', letterSpacing: '.1em' }}>caricamento</div>
    </div>
  );

  return (
    <div style={{ padding: '20px 18px' }}>
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
        color: '#888', fontSize: 11, marginBottom: 24, padding: 0,
        fontFamily: 'DM Mono, monospace', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Indietro
      </button>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', fontStyle: 'italic', marginBottom: 6 }}>
          Il tuo profilo
        </h1>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      {success && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Mono, monospace', letterSpacing: '.06em', textAlign: 'center' }}>
          ✓ profilo aggiornato
        </div>
      )}

      {/* Foto profilo */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
        <label style={labelStyle}>Foto copertina</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
            background: artist.bg || '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {artist.photoUrl ? (
              <img src={artist.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: artist.color || '#888', fontStyle: 'italic' }}>
                {artist.initials}
              </span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            <button
              onClick={() => photoRef.current.click()}
              disabled={uploadingPhoto}
              style={{
                width: '100%', padding: '9px 0', background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Syne, sans-serif',
                fontWeight: 600, cursor: 'pointer', letterSpacing: '.06em', textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >{uploadingPhoto ? `Caricamento ${uploadProgress}%` : 'Carica foto'}</button>
            <div style={{ fontSize: 10, color: '#333', fontFamily: 'DM Mono, monospace', letterSpacing: '.04em' }}>
              jpg · png · max 5mb
            </div>
            {uploadingPhoto && (
              <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, marginTop: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'rgba(255,255,255,0.3)', transition: 'width .2s', borderRadius: 1 }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stile */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
        <label style={labelStyle}>Stile principale</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {STYLE_OPTIONS.map(s => {
            const selected = style.includes(s);
            return (
              <button key={s} onClick={() => {
                if (selected) setStyle(style.split(' · ').filter(x => x !== s).join(' · '));
                else setStyle(prev => prev ? `${prev} · ${s}` : s);
              }} style={{
                padding: '5px 12px', borderRadius: 999, fontSize: 11, cursor: 'pointer',
                border: `1px solid ${selected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
                background: selected ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: selected ? 'rgba(255,255,255,0.7)' : '#555',
                fontFamily: 'Syne, sans-serif', letterSpacing: '.04em', transition: 'all .2s',
              }}>{s}</button>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: '#333', fontFamily: 'DM Mono, monospace', letterSpacing: '.04em' }}>
          Selezionato: <span style={{ color: '#666' }}>{style || '—'}</span>
        </div>
      </div>

      {/* Bio */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
        <label style={labelStyle}>Bio</label>
        <textarea
          value={bio}
          onChange={e => setBio(e.target.value)}
          placeholder="Descrivi il tuo percorso, la tua filosofia, cosa ti distingue…"
          style={{ ...inputStyle, resize: 'none', height: 100, lineHeight: 1.7 }}
        />
        <div style={{ fontSize: 10, color: '#2a2a2a', fontFamily: 'DM Mono, monospace', marginTop: 6, textAlign: 'right', letterSpacing: '.04em' }}>
          {bio.length} caratteri
        </div>
      </div>

      {/* Specialità */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
        <label style={labelStyle}>Specialità</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {specs.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: 11, color: '#888', fontFamily: 'Syne, sans-serif' }}>{s}</span>
              <button onClick={() => removeSpec(s)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>
            </div>
          ))}
          {specs.length === 0 && <div style={{ fontSize: 11, color: '#2a2a2a', fontFamily: 'DM Mono, monospace', letterSpacing: '.06em' }}>nessuna specialità</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={newSpec}
            onChange={e => setNewSpec(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSpec()}
            placeholder="Es. Mandala, Ritratti…"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={addSpec} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0 16px', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', fontFamily: 'Syne, sans-serif', flexShrink: 0 }}>+</button>
        </div>
      </div>

      {/* Statistiche */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, marginBottom: 24 }}>
        <label style={labelStyle}>Statistiche</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Lavori completati</div>
            <input type="number" min="0" value={works} onChange={e => setWorks(e.target.value)} placeholder="0" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Anni esperienza</div>
            <input value={exp} onChange={e => setExp(e.target.value)} placeholder="es. 3y" style={inputStyle} />
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving} style={{
        width: '100%', padding: 15, background: 'rgba(255,255,255,0.9)', color: '#0a0a0a',
        border: 'none', borderRadius: 12, fontSize: 12, fontWeight: 700,
        letterSpacing: '.1em', fontFamily: 'Syne, sans-serif', cursor: saving ? 'not-allowed' : 'pointer',
        textTransform: 'uppercase', opacity: saving ? 0.6 : 1, transition: 'opacity .2s',
      }}>{saving ? '· · ·' : 'Salva profilo'}</button>
    </div>
  );
}
