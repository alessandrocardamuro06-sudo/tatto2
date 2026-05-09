import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase';
import {
  collection, addDoc, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc, doc,
  arrayUnion, arrayRemove, getDocs
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const Divider = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
    <div style={{ width: 3, height: 3, border: '1px solid rgba(255,255,255,0.1)', transform: 'rotate(45deg)' }} />
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
  </div>
);

function CommentsSection({ postId, userProfile, t }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [postId]);

  const handleComment = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        text: text.trim(),
        authorName: userProfile?.name || 'Utente',
        authorRole: userProfile?.role || 'cliente',
        authorInitials: userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
        createdAt: serverTimestamp(),
      });
      setText('');
    } catch (e) {
      alert('Errore: ' + e.message);
    }
    setLoading(false);
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      {/* Comments list */}
      {comments.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                background: c.authorRole === 'artista' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)',
                fontFamily: 'Syne, sans-serif',
              }}>{c.authorInitials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa', letterSpacing: '.01em' }}>{c.authorName}</span>
                  {c.authorRole === 'artista' && (
                    <span style={{
                      fontSize: 7, padding: '1px 5px', borderRadius: 999,
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: 'rgba(255,255,255,0.3)', fontFamily: 'DM Mono, monospace',
                      letterSpacing: '.08em', textTransform: 'uppercase',
                    }}>artista</span>
                  )}
                  <span style={{ fontSize: 9, color: '#2a2a2a', fontFamily: 'DM Mono, monospace', marginLeft: 'auto' }}>
                    {formatDate(c.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, letterSpacing: '.01em' }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)',
          fontFamily: 'Syne, sans-serif',
        }}>{userProfile?.name?.slice(0, 1) || '?'}</div>
        <div style={{ flex: 1, display: 'flex', gap: 6 }}>
          <input
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleComment(); }}
            placeholder="Scrivi un commento…"
            style={{
              flex: 1, background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '6px 12px',
              fontSize: 12, color: '#f0ece4', outline: 'none',
              fontFamily: 'Syne, sans-serif', letterSpacing: '.01em',
            }}
          />
          <button
            onClick={handleComment}
            disabled={loading || !text.trim()}
            style={{
              background: text.trim() ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.04)',
              border: 'none', borderRadius: '50%', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: text.trim() ? 'pointer' : 'not-allowed', transition: 'all .2s', flexShrink: 0,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={text.trim() ? '#0a0a0a' : '#333'} strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage({ t, userProfile }) {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openComments, setOpenComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const fileRef = useRef();

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, async (snap) => {
      const postsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPosts(postsData);
      // Carica conteggio commenti per ogni post
      const counts = {};
      await Promise.all(postsData.map(async (p) => {
        const commSnap = await getDocs(collection(db, 'posts', p.id, 'comments'));
        counts[p.id] = commSnap.size;
      }));
      setCommentCounts(counts);
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
        authorInitials: userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
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

  const toggleComments = (postId) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    return ts.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: '20px 18px' }}>
      {/* Header */}
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
            {userProfile?.name?.slice(0, 1) || '?'}
          </div>
          <textarea
            placeholder={t('compose-ph')}
            value={text}
            onChange={e => setText(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none',
              fontSize: 14, color: '#f0ece4', resize: 'none', height: 60,
              outline: 'none', lineHeight: 1.6, fontFamily: 'Syne, sans-serif', letterSpacing: '.01em',
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
          <div key={post.id} style={{ animation: `fadeUp .3s ease ${idx * 0.05}s both` }}>
            {/* Post header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: post.authorRole === 'artista' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${post.authorRole === 'artista' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: post.authorRole === 'artista' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)',
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

            {/* Image */}
            {post.imageUrl && (
              <img src={post.imageUrl} alt="post" style={{
                width: '100%', borderRadius: 10, marginBottom: 12,
                maxHeight: 280, objectFit: 'cover',
                border: '1px solid rgba(255,255,255,0.05)',
              }} />
            )}

            {/* Text */}
            <p style={{ fontSize: 14, lineHeight: 1.75, color: '#888', marginBottom: 14, letterSpacing: '.01em' }}>
              {post.text}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button
                onClick={() => handleLike(post)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', fontSize: 11,
                  fontFamily: 'DM Mono, monospace', letterSpacing: '.06em',
                  color: post.likes?.includes(userProfile?.name) ? 'rgba(255,255,255,0.6)' : '#2e2e2e',
                  cursor: 'pointer', padding: '4px 0', transition: 'color .2s',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24"
                  fill={post.likes?.includes(userProfile?.name) ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                {post.likes?.length || 0}
              </button>

              <button
                onClick={() => toggleComments(post.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', fontSize: 11,
                  fontFamily: 'DM Mono, monospace', letterSpacing: '.06em',
                  color: openComments[post.id] ? 'rgba(255,255,255,0.5)' : '#2e2e2e',
                  cursor: 'pointer', padding: '4px 0', transition: 'color .2s',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                {commentCounts[post.id] || 0}
              </button>
            </div>

            {/* Comments section — espandibile */}
            {openComments[post.id] && (
              <CommentsSection postId={post.id} userProfile={userProfile} t={t} />
            )}

            {idx < posts.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </div>
  );
}
