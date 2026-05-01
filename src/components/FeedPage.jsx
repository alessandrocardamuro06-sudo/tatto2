import React from 'react';

const ImagePlaceholder = () => (
  <div style={{
    width: '100%', height: 110, borderRadius: 8,
    background: '#1c1c1c', border: '1px solid #222',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  }}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  </div>
);

const Avatar = ({ initials, bg, color }) => (
  <div style={{
    width: 32, height: 32, borderRadius: '50%',
    background: bg, color, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0,
  }}>{initials}</div>
);

export default function FeedPage({ t }) {
  const posts = [
    {
      av: 'SF', avBg: '#c8523a', avColor: '#fff',
      author: 'Sofia Ricci', isArtist: true,
      date: t('today-time'), hasImg: true,
      body: t('post1'), likes: 47, comments: 12,
    },
    {
      av: 'GR', avBg: '#333', avColor: '#aaa',
      author: 'Giulia Romano', isArtist: false,
      date: t('yesterday'), hasImg: false,
      body: t('post2'), likes: 91, comments: 28,
    },
    {
      av: 'LD', avBg: '#1a3a2a', avColor: '#5DCAA5',
      author: "Luca D'Angelo", isArtist: true,
      date: t('two-days'), hasImg: true,
      body: t('post3'), likes: 134, comments: 41,
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* Compose */}
      <div style={{
        background: '#161616', border: '1px solid #222',
        borderRadius: 12, padding: 14, marginBottom: 16,
      }}>
        <textarea
          placeholder={t('compose-ph')}
          style={{
            width: '100%', background: '#1c1c1c',
            border: '1px solid #2a2a2a', borderRadius: 8,
            padding: '10px 12px', fontSize: 13, color: '#f0ece4',
            resize: 'none', height: 68, outline: 'none',
            lineHeight: 1.6, fontFamily: 'Syne, sans-serif',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <button style={{
            background: 'none', border: '1px solid #2a2a2a',
            borderRadius: 6, padding: '6px 12px', color: '#888', fontSize: 12,
            transition: 'all .2s',
          }}>{t('attach')}</button>
          <button style={{
            background: '#c8523a', color: '#fff', border: 'none',
            borderRadius: 6, padding: '7px 16px', fontSize: 12, fontWeight: 600,
          }}>{t('publish')}</button>
        </div>
      </div>

      {/* Posts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {posts.map((p, i) => (
          <div key={i} style={{
            background: '#161616', border: '1px solid #1e1e1e',
            borderRadius: 12, padding: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar initials={p.av} bg={p.avBg} color={p.avColor} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ece4' }}>
                  {p.author}
                  {p.isArtist && (
                    <span style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 999,
                      background: '#c8523a', color: '#fff', marginLeft: 6, fontWeight: 500,
                    }}>{t('badge-artist')}</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: '#555', fontFamily: 'DM Mono, monospace' }}>{p.date}</div>
              </div>
            </div>
            {p.hasImg && <ImagePlaceholder />}
            <p style={{ fontSize: 13, lineHeight: 1.7, color: '#aaa', marginBottom: 12 }}>{p.body}</p>
            <div style={{ display: 'flex', gap: 16 }}>
              {['♥ ' + p.likes, '💬 ' + p.comments, '↗'].map((label, j) => (
                <button key={j} style={{
                  background: 'none', border: 'none', fontSize: 12,
                  color: '#555', fontFamily: 'Syne, sans-serif', transition: 'color .2s',
                }}>{label}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
