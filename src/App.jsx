import React, { useState, useCallback } from 'react';
import LANGS from './data/translations';
import FeedPage from './components/FeedPage';
import { ArtistsPage, ArtistProfile } from './components/ArtistsPage';
import CustomizePage from './components/CustomizePage';
import BookingPage from './components/BookingPage';
import AdminPage from './components/AdminPage';
import AuthPage from './components/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const NAV_ITEMS = [
  {
    id: 'feed', labelKey: 'nav-home',
    icon: (active) => (
      <svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}>
        <path d="M6 13L16 4L26 13V27C26 27.6 25.6 28 25 28H20V20H12V28H7C6.4 28 6 27.6 6 27V13Z"
          stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" fill={active ? 'rgba(255,255,255,0.08)' : 'none'} strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 'artists', labelKey: 'nav-artists',
    icon: (active) => (
      <svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}>
        <circle cx="12" cy="10" r="4.5" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2"/>
        <path d="M4 26C4 21.6 7.6 18 12 18C14.2 18 16.2 18.9 17.6 20.4" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" strokeLinecap="round"/>
        <circle cx="22" cy="20" r="5.5" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" fill={active ? 'rgba(255,255,255,0.08)' : 'none'}/>
        <path d="M22 17V20L24 22" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  {
    id: 'custom', labelKey: 'nav-create',
    icon: (active) => (
      <svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}>
        <path d="M22 5L27 10L12 25L5 27L7 20L22 5Z" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" strokeLinejoin="round" fill={active ? 'rgba(255,255,255,0.08)' : 'none'}/>
        <path d="M19 8L24 13" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2"/>
        <path d="M5 27L7 20" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'booking', labelKey: 'nav-booking',
    icon: (active) => (
      <svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}>
        <rect x="5" y="7" width="22" height="20" rx="2" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" fill={active ? 'rgba(255,255,255,0.08)' : 'none'}/>
        <path d="M5 13H27" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2"/>
        <path d="M11 5V9M21 5V9" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M10 19H16M10 23H13" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    )
  },
];

const ADMIN_ITEM = {
  id: 'admin', labelKey: 'nav-admin',
  icon: (active) => (
    <svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}>
      <path d="M16 4L26 9V16C26 21.5 21.6 26.6 16 28C10.4 26.6 6 21.5 6 16V9L16 4Z"
        stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" strokeLinejoin="round" fill={active ? 'rgba(255,255,255,0.08)' : 'none'}/>
      <path d="M12 16L15 19L21 13" stroke={active ? '#fff' : '#3a3a3a'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
};

function AppInner() {
  const { currentUser, userProfile, logout } = useAuth();
  const [lang, setLang] = useState('it');
  const [page, setPage] = useState('feed');
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [preselectedArtist, setPreselectedArtist] = useState('');

  const t = useCallback((key) => LANGS[lang]?.[key] ?? LANGS['it']?.[key] ?? key, [lang]);

  if (!currentUser) return <AuthPage t={t} />;

  const isAdmin = userProfile?.role === 'admin';
  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const handleSelectArtist = (id) => { setSelectedArtistId(id); setPage('profile'); };
  const handleBookArtist = (name) => { setPreselectedArtist(name); setPage('booking'); };
  const handleNavClick = (id) => { if (id !== 'artists') setSelectedArtistId(null); setPage(id); };
  const activeNavId = page === 'profile' ? 'artists' : page;

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: '#070707',
      backgroundImage: 'radial-gradient(ellipse 100% 40% at 50% -5%, rgba(255,255,255,0.04) 0%, transparent 100%)',
    }}>

      {/* Topbar */}
      <div style={{
        padding: '8px 20px 8px',
        background: 'rgba(7,7,7,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <img src="/Logo_Inklovers-2.png" alt="Ink Lovers" style={{ height: 44, objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {['it','en','de'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              background: lang === l ? 'rgba(255,255,255,0.1)' : 'none',
              border: `1px solid ${lang === l ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 4, padding: '3px 7px',
              fontFamily: 'DM Mono, monospace', fontSize: 9,
              color: lang === l ? '#fff' : '#444', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '.1em', transition: 'all .2s',
            }}>{l}</button>
          ))}
          <div style={{ width: 1, height: 14, background: '#222', margin: '0 4px' }} />
          <button onClick={logout} style={{
            background: 'none', border: 'none', padding: '3px 0',
            fontFamily: 'DM Mono, monospace', fontSize: 9,
            color: '#333', cursor: 'pointer', letterSpacing: '.1em',
            textTransform: 'uppercase', transition: 'color .2s',
          }}>Esci</button>
        </div>
      </div>

      {/* User ribbon */}
      {userProfile && (
        <div style={{
          padding: '4px 20px',
          background: 'rgba(255,255,255,0.015)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            {userProfile.name}
          </span>
          <div style={{ width: 1, height: 8, background: '#222' }} />
          <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#444', letterSpacing: '.1em', textTransform: 'uppercase' }}>
            {userProfile.role}
          </span>
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {page === 'feed' && <FeedPage t={t} userProfile={userProfile} />}
        {page === 'artists' && <ArtistsPage onSelectArtist={handleSelectArtist} t={t} />}
        {page === 'profile' && selectedArtistId !== null && (
          <ArtistProfile artistId={selectedArtistId} onBack={() => setPage('artists')} onBook={handleBookArtist} t={t} lang={lang} />
        )}
        {page === 'custom' && <CustomizePage t={t} />}
        {page === 'booking' && <BookingPage t={t} preselectedArtist={preselectedArtist} userProfile={userProfile} />}
        {page === 'admin' && isAdmin && <AdminPage t={t} />}
      </div>

      {/* Bottom nav — sophisticated */}
      <div style={{
        background: 'rgba(7,7,7,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexShrink: 0,
        padding: '2px 0 0',
      }}>
        {navItems.map(item => {
          const isActive = activeNavId === item.id;
          return (
            <button key={item.id} onClick={() => handleNavClick(item.id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, background: 'none', border: 'none',
              padding: '10px 0 10px',
              cursor: 'pointer', position: 'relative', transition: 'opacity .2s',
            }}>
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24, height: 1,
                  background: 'linear-gradient(to right, transparent, #fff, transparent)',
                }} />
              )}
              {item.icon(isActive)}
              <span style={{
                fontSize: 8, fontFamily: 'DM Mono, monospace',
                letterSpacing: '.12em', textTransform: 'uppercase',
                color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
                transition: 'color .2s',
              }}>
                {item.id === 'admin' ? 'Admin' : t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}


