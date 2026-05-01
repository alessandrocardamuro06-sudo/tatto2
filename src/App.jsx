import React, { useState, useCallback } from 'react';
import LANGS from './data/translations';
import FeedPage from './components/FeedPage';
import { ArtistsPage, ArtistProfile } from './components/ArtistsPage';
import CustomizePage from './components/CustomizePage';
import BookingPage from './components/BookingPage';

const NAV_ITEMS = [
  {
    id: 'feed',
    labelKey: 'nav-home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'artists',
    labelKey: 'nav-artists',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    id: 'custom',
    labelKey: 'nav-create',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    id: 'booking',
    labelKey: 'nav-booking',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
];

export default function App() {
  const [lang, setLang] = useState('it');
  const [page, setPage] = useState('feed');
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [preselectedArtist, setPreselectedArtist] = useState('');

  const t = useCallback((key) => {
    return LANGS[lang]?.[key] ?? LANGS['it']?.[key] ?? key;
  }, [lang]);

  const handleSelectArtist = (id) => {
    setSelectedArtistId(id);
    setPage('profile');
  };

  const handleBookArtist = (artistName) => {
    setPreselectedArtist(artistName);
    setPage('booking');
  };

  const handleNavClick = (id) => {
    if (id !== 'artists') setSelectedArtistId(null);
    setPage(id);
  };

  const activeNavId = page === 'profile' ? 'artists' : page;

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#0e0e0e',
      position: 'relative',
    }}>
      {/* Top bar */}
      <div style={{
        background: '#0e0e0e',
        padding: '14px 20px 10px',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: 'DM Serif Display, serif',
          fontSize: 19,
          color: '#f0ece4',
          letterSpacing: '.02em',
        }}>
          DARK<span style={{ color: '#c8523a', fontStyle: 'italic' }}>Needle</span>
        </div>

        {/* Language switcher */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['it', 'en', 'de'].map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                background: lang === l ? '#c8523a' : 'none',
                border: `1px solid ${lang === l ? '#c8523a' : '#2a2a2a'}`,
                borderRadius: 6,
                padding: '4px 10px',
                fontFamily: 'DM Mono, monospace',
                fontSize: 11,
                color: lang === l ? '#fff' : '#555',
                cursor: 'pointer',
                transition: 'all .2s',
                textTransform: 'uppercase',
              }}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {page === 'feed' && <FeedPage t={t} />}
        {page === 'artists' && (
          <ArtistsPage onSelectArtist={handleSelectArtist} t={t} />
        )}
        {page === 'profile' && selectedArtistId !== null && (
          <ArtistProfile
            artistId={selectedArtistId}
            onBack={() => setPage('artists')}
            onBook={handleBookArtist}
            t={t}
            lang={lang}
          />
        )}
        {page === 'custom' && <CustomizePage t={t} />}
        {page === 'booking' && (
          <BookingPage t={t} preselectedArtist={preselectedArtist} />
        )}
      </div>

      {/* Bottom nav */}
      <div style={{
        background: '#111',
        borderTop: '1px solid #1e1e1e',
        display: 'flex',
        flexShrink: 0,
      }}>
        {NAV_ITEMS.map(item => {
          const isActive = activeNavId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                padding: '10px 0 8px',
                cursor: 'pointer',
                color: isActive ? '#c8523a' : '#555',
                transition: 'color .2s',
              }}
            >
              <div style={{ width: 22, height: 22 }}>
                {React.cloneElement(item.icon, { style: { width: 22, height: 22 } })}
              </div>
              <span style={{
                fontSize: 10,
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '.04em',
              }}>{t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
