import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';

const STYLE_OPTIONS = ['Traditional','Blackwork','Realism','Watercolor','Geometric','Dotwork','Neo-trad','Tribal','Fine Line','Minimal','Chicano','Japanese'];

export default function ArtistProfileEdit({ onBack }) {
  const { currentUser } = useAuth();
  const [artist, setArtist] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingWork, setUploadingWork] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [workProgress, setWorkProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [tab, setTab] = useState('info');
  const [deletingWork, setDeletingWork] = useState(null);
  const photoRef = useRef();
  const workRef = useRef();

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
      const storageRef = ref(storage, `artists/${currentUser.uid}_cover_${Date.now()}`);
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

  const handleWorkUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingWork(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(storage, `artists/${currentUser.uid}_work_${Date.now()}_${i}`);
        const task = uploadBytesResumable(storageRef, file);
        const url = await new Promise((resolve, reject) => {
          task.on('state_changed',
            s => setWorkProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
            reject,
            async () => resolve(await getDownloadURL(task.snapshot.ref))
          );
        });
        await updateDoc(doc(db, 'artists', currentUser.uid), {
          workPhotos: arrayUnion({ url, uploadedAt: new Date().toISOString() })
        });
      }
      setWorkProgress(0);
      if (workRef.current) workRef.current.value = '';
    } catch (e) { alert('Errore upload lavoro: ' + e.message); }
    setUploadingWork(false);
  };

  const handleDeleteWork = async (work) => {
    if (!window.confirm('Rimuovere questo lavoro?')) return;
    setDeletingWork(work.url);
    try {
      await updateDoc(doc(db, 'artists', currentUser.uid), {
        workPhotos: arrayRemove(work)
      });
    } catch (e) { alert('Errore: ' + e.message); }
    setDeletingWork(null);
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

  const workPhotos = Array.isArray(artist.workPhotos) ? artist.workPhotos : [];

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

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', fontStyle: 'italic', marginBottom: 6 }}>
          Profilo Artista
        </h1>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      {success && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Mono, monospace', letterSpacing: '.06em', textAlign: 'center' }}>
          ✓ profilo aggiornato
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
        {[['info', 'Informazioni'], ['works', `Lavori (${workPhotos.length})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '9px 0 11px', border: 'none', background: 'none',
            fontFamily: 'DM Mono, monospace', fontSize: 10, fontWeight: 600,
            color: tab === key ? '#fff' : '#333', cursor: 'pointer',
            letterSpacing: '.1em', textTransform: 'uppercase',
            borderBottom: `1px solid ${tab === key ? 'rgba(255,255,255,0.4)' : 'transparent'}`,
            marginBottom: -1, transition: 'color .2s',
          }}>{label}</button>
        ))}
      </div>

      {/* TAB INFO */}
      {tab === 'info' && (
        <>
          {/* Foto copertina */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <label style={labelStyle}>Foto copertina</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0, background: artist.bg || '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {artist.photoUrl ? (
                  <img src={artist.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: artist.color || '#888', fontStyle: 'italic' }}>{artist.initials}</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                <button onClick={() => photoRef.current.click()} disabled={uploadingPhoto} style={{ width: '100%', padding: '9px 0', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: 'pointer', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 6 }}>
                  {uploadingPhoto ? `${uploadProgress}%` : 'Carica foto'}
                </button>
                <div style={{ fontSize: 10, color: '#333', fontFamily: 'DM Mono, monospace', letterSpacing: '.04em' }}>jpg · png · max 5mb</div>
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
                  }} style={{ padding: '5px 12px', borderRadius: 999, fontSize: 11, cursor: 'pointer', border: `1px solid ${selected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}`, background: selected ? 'rgba(255,255,255,0.08)' : 'transparent', color: selected ? 'rgba(255,255,255,0.7)' : '#555', fontFamily: 'Syne, sans-serif', letterSpacing: '.04em', transition: 'all .2s' }}>{s}</button>
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
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Descrivi il tuo percorso, la tua filosofia, cosa ti distingue…" style={{ ...inputStyle, resize: 'none', height: 100, lineHeight: 1.7 }} />
            <div style={{ fontSize: 10, color: '#2a2a2a', fontFamily: 'DM Mono, monospace', marginTop: 6, textAlign: 'right', letterSpacing: '.04em' }}>{bio.length} caratteri</div>
          </div>

          {/* Specialità */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, marginBottom: 14 }}>
            <label style={labelStyle}>Specialità</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {specs.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ fontSize: 11, color: '#888', fontFamily: 'Syne, sans-serif' }}>{s}</span>
                  <button onClick={() => removeSpec(s)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                </div>
              ))}
              {specs.length === 0 && <div style={{ fontSize: 11, color: '#2a2a2a', fontFamily: 'DM Mono, monospace' }}>nessuna specialità</div>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newSpec} onChange={e => setNewSpec(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSpec()} placeholder="Es. Mandala, Ritratti…" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={addSpec} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0 16px', color: 'rgba(255,255,255,0.5)', fontSize: 16, cursor: 'pointer', flexShrink: 0 }}>+</button>
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

          <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: 15, background: 'rgba(255,255,255,0.9)', color: '#0a0a0a', border: 'none', borderRadius: 12, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', fontFamily: 'Syne, sans-serif', cursor: saving ? 'not-allowed' : 'pointer', textTransform: 'uppercase', opacity: saving ? 0.6 : 1 }}>
            {saving ? '· · ·' : 'Salva profilo'}
          </button>
        </>
      )}

      {/* TAB LAVORI */}
      {tab === 'works' && (
        <div>
          {/* Upload lavori */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
            <label style={labelStyle}>Aggiungi lavori</label>
            <input ref={workRef} type="file" accept="image/*" multiple onChange={handleWorkUpload} style={{ display: 'none' }} />
            <button onClick={() => workRef.current.click()} disabled={uploadingWork} style={{ width: '100%', padding: 12, background: 'transparent', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 10, color: uploadingWork ? '#555' : 'rgba(255,255,255,0.4)', fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: uploadingWork ? 'not-allowed' : 'pointer', letterSpacing: '.06em', textTransform: 'uppercase', transition: 'all .2s' }}>
              {uploadingWork ? `Caricamento ${workProgress}%` : '+ Aggiungi foto lavori'}
            </button>
            {uploadingWork && (
              <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 1, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${workProgress}%`, background: 'rgba(255,255,255,0.3)', transition: 'width .2s', borderRadius: 1 }} />
              </div>
            )}
            <div style={{ fontSize: 10, color: '#2a2a2a', fontFamily: 'DM Mono, monospace', marginTop: 8, letterSpacing: '.04em' }}>
              Puoi selezionare più foto contemporaneamente
            </div>
          </div>

          {/* Griglia lavori */}
          {workPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#2a2a2a', fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '.1em' }}>
              — nessun lavoro caricato —
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {workPhotos.map((work, i) => (
                <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 8, overflow: 'hidden', background: '#1a1a1a' }}>
                  <img
                    src={work.url}
                    alt={`Lavoro ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {/* Overlay delete */}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}
                  >
                    <button
                      onClick={() => handleDeleteWork(work)}
                      disabled={deletingWork === work.url}
                      style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: 30, height: 30, color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

