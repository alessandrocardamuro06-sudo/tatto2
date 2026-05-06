import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase';
import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp,
  updateDoc, doc, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

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
    setImage(null);
    setImagePreview(null);
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
            (snapshot) => {
              setProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
            },
            reject,
            async () => {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            }
          );
        });
      }

      await addDoc(collection(db, 'posts'), {
        text: text.trim(),
        imageUrl: imageUrl || null,
        authorName: userProfile?.name || 'Utente',
        authorRole: userProfile?.role || 'cliente',
        authorInitials: userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U',
        likes: [],
        createdAt: serverTimestamp(),
      });

      setText('');
      removeImage();
      setProgress(0);
    } catch (e) {
      alert('Errore: ' + e.message);
    }
    setUploading(false);
  };

  const handleLike = async (post) => {
    if (!userProfile) return;
    const ref2 = doc(db, 'posts', post.id);
    const liked = post.likes?.includes(userProfile.name);
    await updateDoc(ref2, {
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

        {/* Preview immagine */}
        {imagePreview && (
          <div style={{ position: 'relative', marginTop: 10 }}>
            <img
              src={imagePreview}
              alt="preview"
              style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8 }}
            />
            <button
              onClick={removeImage}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(0,0,0,.7)', border: 'none', borderRadius: '50%',
                width: 28, height: 28, color: '#fff', fontSize: 14,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
        )}

        {/* Progress bar upload */}
        {uploading && progress > 0 && (
          <div style={{ marginTop: 10, background: '#1c1c1c', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: 3, background: '#c8523a',
              width: `${progress}%`, transition: 'width .2s',
            }} />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
              id="photo-input"
            />
            <label htmlFor="photo-input" style={{
              background: 'none', border: '1px solid #2a2a2a',
              borderRadius: 6, padding: '6px 12px', color: '#888', fontSize: 12,
              cursor: 'pointer', fontFamily: 'Syne, sans-serif',
            }}>
              {t('attach')}
            </label>
            <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#555' }}>
              {userProfile?.name} · {userProfile?.role}
            </span>
          </div>
          <button
            onClick={handlePost}
            disabled={uploading || !text.trim()}
            style={{
              background: '#c8523a', color: '#fff', border: 'none',
              borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 600,
              fontFamily: 'Syne, sans-serif',
              opacity: uploading || !text.trim() ? 0.5 : 1,
              cursor: uploading || !text.trim() ? 'not-allowed' : 'pointer',
            }}
          >{uploading ? `${progress}%` : t('publish')}</button>
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

            {/* Immagine post */}
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt="post"
                style={{ width: '100%', borderRadius: 8, marginBottom: 10, maxHeight: 300, objectFit: 'cover' }}
              />
            )}

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
