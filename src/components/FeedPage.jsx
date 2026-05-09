import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
    <div style={{ width: 3, height: 3, border: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }} />
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
  </div>
);

export default function FeedPage({ t, userProfile }) {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null); setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handlePost = async () => {
    if (!text.trim()) return;
    setUploading(true);
    try {
      let imageUrl = null;
      if (image) {
        const storageRef = ref(storage, `posts/${Date.now()}_${image.name}`);
        const uploadTask = uploadBytesResumable(storageRef, image);
        imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (s) => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
            reject,
            async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
          );
        });
      }
      await addDoc(collection(db, 'posts'), {
        text: text.trim(), imageUrl: imageUrl || null,
        authorName: userProfile?.name || 'Utente',
        authorRole: userProfile?.role || 'cliente',
        authorInitials: userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U',
        likes: [], createdAt: serverTimestamp(),
      });
      setText(''); removeImage(); setProgress(0);
    } catch (e) { alert('Errore: ' + e.message); }
    setUploading(false);
  };

  const handleLike = async (post) => {
    if (!userProfile) return;
    const r = doc(db, 'posts', post.id);
    const liked = post.likes?.includes(userProfile.name);
    await updateDoc(r, { likes: liked ? arrayRemove(userProfile.name) : arrayUnion(userProfile.name) });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: '20px 18px' }}>
      {/* Section header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', letterSpacing: '.02em', fontStyle: 'italic' }}>
            Feed
          </h1>
          <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.15em', textTransform: 'uppercase', paddingBottom: 4 }}>
            {posts.length} post
          </div>
        </div>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      {/* Compose */}
      <div style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: 16, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', fontFamily: 'Syne, sans-serif',
          }}>
            {userProfile?.name?.slice(0,1) || '?'}
          </div>
          <textarea
            placeholder={t('compose-ph')}
            value={text}
            onChange={e => setText(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none',
              fontSize: 14, color: '#f0ece4', resize: 'none', height: 60,
              outline: 'none', lineHeight: 1.6, fontFamily: 'Syne, sans-serif',
              letterSpacing: '.01em',
            }}
          />
        </div>

        {imagePreview && (
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <img src={imagePreview} alt="preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, opacity: 0.85 }} />
            <button onClick={removeImage} style={{
              position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%',
              width: 26, height: 26, color: '#fff', fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
        )}

        {uploading && (
          <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 1, marginBottom: 12, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'rgba(255,255,255,0.4)', transition: 'width .2s', borderRadius: 1 }} />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} id="photo-input" />
            <label htmlFor="photo-input" style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 6, padding: '5px 10px', color: 'rgba(255,255,255,0.35)',
              fontSize: 11, cursor: 'pointer', fontFamily: 'DM Mono, monospace', letterSpacing: '.06em',
              transition: 'all .2s',
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              {t('attach')}
            </label>
          </div>
          <button
            onClick={handlePost}
            disabled={uploading || !text.trim()}
            style={{
              background: text.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.05)',
              color: text.trim() ? '#0a0a0a' : '#333',
              border: 'none', borderRadius: 7, padding: '7px 16px',
              fontSize: 11, fontWeight: 700, fontFamily: 'Syne, sans-serif',
              letterSpacing: '.08em', textTransform: 'uppercase',
              cursor: !text.trim() ? 'not-allowed' : 'pointer', transition: 'all .25s',
            }}
          >{uploading ? `${progress}%` : t('publish')}</button>
        </div>
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#2a2a2a', fontSize: 12, fontFamily: 'DM Mono, monospace', letterSpacing: '.1em' }}>
            — nessun post ancora —
          </div>
        )}
        {posts.map((post, idx) => (
          <div key={post.id} style={{
            animation: `fadeUp .3s ease ${idx * 0.05}s both`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: post.authorRole === 'artista' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${post.authorRole === 'artista' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: post.authorRole === 'artista' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
                fontFamily: 'Syne, sans-serif',
              }}>{post.authorInitials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e8e4dc', letterSpacing: '.01em' }}>{post.authorName}</span>
                  {post.authorRole === 'artista' && (
                    <span style={{
                      fontSize: 8, padding: '2px 7px', borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono, monospace',
                      letterSpacing: '.1em', textTransform: 'uppercase',
                    }}>{t('badge-artist')}</span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: '#333', fontFamily: 'DM Mono, monospace', letterSpacing: '.04em', marginTop: 1 }}>
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>

            {post.imageUrl && (
              <img src={post.imageUrl} alt="post" style={{
                width: '100%', borderRadius: 10, marginBottom: 12,
                maxHeight: 280, objectFit: 'cover',
                border: '1px solid rgba(255,255,255,0.05)',
              }} />
            )}

            <p style={{ fontSize: 14, lineHeight: 1.75, color: '#888', marginBottom: 12, letterSpacing: '.01em' }}>{post.text}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => handleLike(post)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none',
                  fontSize: 11, fontFamily: 'DM Mono, monospace',
                  color: post.likes?.includes(userProfile?.name) ? 'rgba(255,255,255,0.6)' : '#2e2e2e',
                  cursor: 'pointer', letterSpacing: '.06em', padding: '4px 0',
                  transition: 'color .2s',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill={post.likes?.includes(userProfile?.name) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                {post.likes?.length || 0}
              </button>
            </div>

            {idx < posts.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </div>
  );
}
