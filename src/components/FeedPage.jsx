import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp,
  updateDoc, doc, arrayUnion, arrayRemove
} from 'firebase/firestore';

const ImagePlaceholder = () => (
  <div style={{
    width: '100%', height: 110, borderRadius: 8,
    background: '#1c1c1c', border: '1px solid #222',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  }}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  </div>
);

export default function FeedPage({ t, userProfile }) {
  const [posts, setPosts] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  console.log('userProfile nel feed:', userProfile);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handlePost = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'posts'), {
        text: text.trim(),
       authorName: userProfile?.name || 'Utente',
       authorRole: userProfile?.role || 'cliente',
       authorInitials: userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
        likes: [],
        createdAt: serverTimestamp(),
      });
      setText('');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleLike = async (post) => {
    if (!userProfile) return;
    const ref = doc(db, 'posts', post.id);
    const liked = post.likes?.includes(userProfile.name);
    await updateDoc(ref, {
      likes: liked ? arrayRemove(userProfile.name) : arrayUnion(userProfile.name)
    });
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate();
    return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Compose */}
      <div style={{ background: '#161616', border: '1px solid #222', borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <textarea
          placeholder={t('compose-ph')}
          value={text}
          onChange={e => setText(e.target.value)}
          style={{
            width: '100%', background: '#1c1c1c', border: '1px solid #2a2a2a',
            borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#f0ece4',
            resize: 'none', height: 68, outline: 'none', lineHeight: 1.6,
            fontFamily: 'Syne, sans-serif',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#555' }}>
            {userProfile?.name} · {userProfile?.role}
          </span>
          <button
  onClick={() => {
    alert('testo: ' + text + ' | profilo: ' + JSON.stringify(userProfile));
    handlePost();
  }}
  style={{
    background: '#c8523a', color: '#fff', border: 'none',
    borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 600,
    fontFamily: 'Syne, sans-serif', cursor: 'pointer',
  }}
>{t('publish')}</button>
        </div>
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#555', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>
            Nessun post ancora. Sii il primo!
          </div>
        )}
        {posts.map(post => (
          <div key={post.id} style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: '#c8523a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>{post.authorInitials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ece4' }}>
                  {post.authorName}
                  {post.authorRole === 'artista' && (
                    <span style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 999,
                      background: '#c8523a', color: '#fff', marginLeft: 6, fontWeight: 500,
                    }}>{t('badge-artist')}</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace' }}>
                  {formatDate(post.createdAt)}
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#aaa', marginBottom: 12 }}>{post.text}</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <button
                onClick={() => handleLike(post)}
                style={{
                  background: 'none', border: 'none', fontSize: 12,
                  color: post.likes?.includes(userProfile?.name) ? '#c8523a' : '#555',
                  fontFamily: 'Syne, sans-serif', cursor: 'pointer',
                }}
              >♥ {post.likes?.length || 0}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
