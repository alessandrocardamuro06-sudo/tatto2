import React from 'react';
import ARTISTS from '../data/artists';

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
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, padding: 3 }}>
      {ARTISTS.map((a, i) => (
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
          {/* Background pattern */}
          <div style={{
            position: 'absolute', inset: 0,
            background: a.patternBg,
            backgroundImage: i === 0
              ? 'repeating-linear-gradient(45deg, #222 0, #222 1px, transparent 0, transparent 50%)'
              : 'none',
            backgroundSize: '12px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'transform .35s',
          }}>
            <div style={{
              width: i === 0 ? 100 : 70,
              height: i === 0 ? 100 : 70,
              borderRadius: '50%',
              background: a.bg,
              border: `2px solid ${a.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'DM Serif Display, serif',
              fontSize: i === 0 ? 36 : 24,
              color: a.color,
              fontWeight: 700,
            }}>{a.initials}</div>
          </div>

          {/* Overlay gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.05) 60%)',
          }} />

          {/* Info */}
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

          {/* Works badge on first */}
          {i === 0 && (
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
  const a = ARTISTS.find(x => x.id === artistId);
  if (!a) return null;
  const bio = a.bio[lang] || a.bio.it;

  return (
    <div style={{ padding: 20 }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: '#888',
          fontSize: 13, marginBottom: 16, padding: 0,
          fontFamily: 'Syne, sans-serif', transition: 'color .2s',
        }}
      >
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
          background: a.bg, color: a.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'DM Serif Display, serif', fontSize: 26, fontWeight: 700, flexShrink: 0,
        }}>{a.initials}</div>
        <div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: '#f0ece4', marginBottom: 2 }}>{a.name}</div>
          <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#c8523a', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>{a.style}</div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              [a.works, t('works-label')],
              [a.rating, t('rating-label')],
              [a.exp, t('exp-label')],
            ].map(([n, l], i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Serif Display, serif', color: '#f0ece4' }}>{n}</div>
                <div style={{ fontSize: 10, color: '#555', fontFamily: 'DM Mono, monospace' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div style={{ background: '#161616', border: '1px solid #1e1e1e', borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: '#aaa' }}>{bio}</p>
      </div>

      {/* Specialties */}
      <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
        {t('specialties')}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {a.specs.map((s, i) => (
          <span key={i} style={{ padding: '6px 12px', borderRadius: 999, border: '1px solid #2a2a2a', fontSize: 12, color: '#aaa', background: '#161616' }}>{s}</span>
        ))}
      </div>

      {/* Works */}
      <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
        {t('recent-works')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {Array(6).fill(null).map((_, i) => <WorkPlaceholder key={i} />)}
      </div>

      {/* Book CTA */}
      <button
        onClick={() => onBook(a.name)}
        style={{
          width: '100%', marginTop: 16, padding: 13,
          background: '#c8523a', color: '#fff', border: 'none',
          borderRadius: 10, fontSize: 13, fontWeight: 700,
          letterSpacing: '.04em', fontFamily: 'Syne, sans-serif',
        }}
      >{t('book-with-artist')}</button>
    </div>
  );
}
