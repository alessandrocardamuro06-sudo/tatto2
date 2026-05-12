import React, { useState, useCallback, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import LANGS from './data/translations';
import FeedPage from './components/FeedPage';
import { ArtistsPage, ArtistProfile } from './components/ArtistsPage';
import CustomizePage from './components/CustomizePage';
import BookingPage from './components/BookingPage';
import AdminPage from './components/AdminPage';
import CreditsPage from './components/CreditsPage';
import AuthPage from './components/AuthPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const NAV_ITEMS = [
  { id: 'feed', labelKey: 'nav-home', icon: (active) => (<svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}><path d="M6 13L16 4L26 13V27C26 27.6 25.6 28 25 28H20V20H12V28H7C6.4 28 6 27.6 6 27V13Z" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" fill={active?'rgba(255,255,255,0.08)':'none'} strokeLinejoin="round"/></svg>) },
  { id: 'artists', labelKey: 'nav-artists', icon: (active) => (<svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}><circle cx="12" cy="10" r="4.5" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2"/><path d="M4 26C4 21.6 7.6 18 12 18C14.2 18 16.2 18.9 17.6 20.4" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" strokeLinecap="round"/><circle cx="22" cy="20" r="5.5" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" fill={active?'rgba(255,255,255,0.08)':'none'}/><path d="M22 17V20L24 22" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>) },
  { id: 'custom', labelKey: 'nav-create', icon: (active) => (<svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}><path d="M22 5L27 10L12 25L5 27L7 20L22 5Z" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" strokeLinejoin="round" fill={active?'rgba(255,255,255,0.08)':'none'}/><path d="M19 8L24 13" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2"/></svg>) },
  { id: 'booking', labelKey: 'nav-booking', icon: (active) => (<svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}><rect x="5" y="7" width="22" height="20" rx="2" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" fill={active?'rgba(255,255,255,0.08)':'none'}/><path d="M5 13H27" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2"/><path d="M11 5V9M21 5V9" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" strokeLinecap="round"/><path d="M10 19H16M10 23H13" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" strokeLinecap="round"/></svg>) },
  { id: 'credits', labelKey: 'nav-credits', icon: (active) => (<svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}><circle cx="16" cy="16" r="11" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" fill={active?'rgba(255,255,255,0.08)':'none'}/><path d="M16 10V22M13 12.5C13 11.1 14.3 10 16 10C17.7 10 19 11.1 19 12.5C19 15 13 15 13 17.5C13 18.9 14.3 20 16 20C17.7 20 19 18.9 19 17.5" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" strokeLinecap="round"/></svg>) },
];

const ADMIN_ITEM = {
  id: 'admin', labelKey: 'nav-admin',
  icon: (active) => (<svg viewBox="0 0 32 32" fill="none" style={{width:26,height:26}}><path d="M16 4L26 9V16C26 21.5 21.6 26.6 16 28C10.4 26.6 6 21.5 6 16V9L16 4Z" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" strokeLinejoin="round" fill={active?'rgba(255,255,255,0.08)':'none'}/><path d="M12 16L15 19L21 13" stroke={active?'#fff':'#3a3a3a'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>)
};

function Sidebar({ open, onClose, onNavigate, onLogout, userProfile, t, isAdmin, currentPage, credits }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const navItems = [
    { id: 'feed', label: t('nav-home'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{width:18,height:18}}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: 'artists', label: t('nav-artists'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{width:18,height:18}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> },
    { id: 'custom', label: t('nav-create'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{width:18,height:18}}><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg> },
    { id: 'booking', label: t('nav-booking'), icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{width:18,height:18}}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
    { id: 'credits', label: 'Premi', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{width:18,height:18}}><circle cx="12" cy="12" r="9"/><path d="M12 7V17M9.5 9.5C9.5 8.4 10.6 7.5 12 7.5C13.4 7.5 14.5 8.4 14.5 9.5C14.5 11.5 9.5 11.5 9.5 13.5C9.5 14.6 10.6 15.5 12 15.5C13.4 15.5 14.5 14.6 14.5 13.5" strokeLinecap="round"/></svg> },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{width:18,height:18}}><path d="M12 2L22 7v6c0 5.25-4.5 10.14-10 11.5C6.5 23.14 2 18.25 2 13V7l10-5z"/><path d="M9 12l2 2 4-4"/></svg> }] : []),
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity .3s ease' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 101, width: 280, background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.06)', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .32s cubic-bezier(.4,0,.2,1)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '52px 24px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(255,255,255,0.5)', marginBottom: 12, fontStyle: 'italic' }}>
            {userProfile?.name?.slice(0, 2).toUpperCase() || '?'}
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, color: '#e8e4dc', fontWeight: 600, marginBottom: 3 }}>{userProfile?.name || ''}</div>
          <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10 }}>{userProfile?.email || ''}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#444', letterSpacing: '.1em', textTransform: 'uppercase' }}>{userProfile?.role || ''}</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
              <span style={{ fontSize: 9, fontFamily: 'Cormorant Garamond, serif', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{credits}</span>
              <span style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', letterSpacing: '.1em', textTransform: 'uppercase' }}>cr</span>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#222', letterSpacing: '.2em', textTransform: 'uppercase', padding: '0 12px', marginBottom: 8 }}>Navigazione</div>
          {navItems.map(item => {
            const isActive = currentPage === item.id || (currentPage === 'profile' && item.id === 'artists');
            return (
              <button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, border: 'none', background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent', color: isActive ? '#f0ece4' : '#444', cursor: 'pointer', marginBottom: 2, fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: isActive ? 600 : 400, letterSpacing: '.02em', transition: 'all .2s', textAlign: 'left', borderLeft: isActive ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent' }}>
                <span style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#2a2a2a' }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '16px 12px' }} />
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#222', letterSpacing: '.2em', textTransform: 'uppercase', padding: '0 12px', marginBottom: 8 }}>Account</div>

          <button onClick={() => { onNavigate('profile-user'); onClose(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#444', cursor: 'pointer', marginBottom: 2, fontFamily: 'Syne, sans-serif', fontSize: 13, letterSpacing: '.02em', textAlign: 'left', borderLeft: '2px solid transparent' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{width:18,height:18,color:'#2a2a2a'}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            Il mio profilo
          </button>
          <button onClick={() => { onLogout(); onClose(); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10, border: 'none', background: 'transparent', color: '#333', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontSize: 13, letterSpacing: '.02em', textAlign: 'left', borderLeft: '2px solid transparent' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{width:18,height:18,color:'#2a2a2a'}}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Esci
          </button>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#1e1e1e', letterSpacing: '.18em', textTransform: 'uppercase' }}>Ink Lovers Studio</div>
        </div>
      </div>
    </>
  );
}

function UserProfilePage({ onBack, userProfile, credits }) {
  return (
    <div style={{ padding: '20px 18px' }}>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#333', fontSize: 11, marginBottom: 24, padding: 0, fontFamily: 'DM Mono, monospace', cursor: 'pointer', letterSpacing: '.08em', textTransform: 'uppercase' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="15 18 9 12 15 6"/></svg>
        Indietro
      </button>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', fontStyle: 'italic', marginBottom: 6 }}>Il mio profilo</h1>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <div style={{ width: 70, height: 70, borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>
          {userProfile?.name?.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#f0ece4', marginBottom: 4 }}>{userProfile?.name}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#444', letterSpacing: '.1em', textTransform: 'uppercase' }}>{userProfile?.role}</span>
          </div>
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '20px', marginBottom: 12, textAlign: 'center' }}>
        <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.2em', marginBottom: 8 }}>I tuoi crediti</div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, fontWeight: 300, color: '#f0ece4', lineHeight: 1 }}>{credits}</div>
      </div>
      {[['Email', userProfile?.email], ['Ruolo', userProfile?.role], ['Membro dal', userProfile?.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }) : '—']].map(([label, value]) => (
        <div key={label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.12em' }}>{label}</div>
          <div style={{ fontSize: 13, color: '#888', fontFamily: 'Syne, sans-serif' }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function AppInner() {
  const { currentUser, userProfile, logout } = useAuth();
  const [lang, setLang] = useState('it');
  const [page, setPage] = useState('feed');
  const [selectedArtistId, setSelectedArtistId] = useState(null);
  const [preselectedArtist, setPreselectedArtist] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  const t = useCallback((key) => LANGS[lang]?.[key] ?? LANGS['it']?.[key] ?? key, [lang]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) setUserCredits(snap.data().credits || 0);
    });
    return unsub;
  }, [currentUser]);

  if (!currentUser) return <AuthPage t={t} />;

  const isAdmin = userProfile?.role === 'admin';
  const navItems = isAdmin ? [...NAV_ITEMS, ADMIN_ITEM] : NAV_ITEMS;

  const handleSelectArtist = (id) => { setSelectedArtistId(id); setPage('profile'); };
  const handleBookArtist = (name) => { setPreselectedArtist(name); setPage('booking'); };
  const handleNavClick = (id) => { if (id !== 'artists') setSelectedArtistId(null); setPage(id); };
  const activeNavId = page === 'profile' ? 'artists' : page;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', height: '100vh', display: 'flex', flexDirection: 'column', background: '#070707', backgroundImage: 'radial-gradient(ellipse 100% 40% at 50% -5%, rgba(255,255,255,0.04) 0%, transparent 100%)', overflow: 'hidden' }}>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={handleNavClick} onLogout={logout} userProfile={userProfile} t={t} isAdmin={isAdmin} currentPage={page} credits={userCredits} />

      {/* Topbar */}
      <div style={{ padding: '10px 16px', background: 'rgba(7,7,7,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', flexShrink: 0 }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', padding: '6px 4px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 5, justifySelf: 'start' }}>
          <div style={{ width: 22, height: 1, background: 'rgba(255,255,255,0.3)', borderRadius: 1 }} />
          <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.2)', borderRadius: 1 }} />
          <div style={{ width: 19, height: 1, background: 'rgba(255,255,255,0.15)', borderRadius: 1 }} />
        </button>
        {/* Logo + credits badge centrati insieme */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifySelf: 'center' }}>
          <button
            onClick={() => handleNavClick('credits')}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: '5px 10px',
              cursor: 'pointer', transition: 'all .2s',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" style={{width:13,height:13}}>
              <circle cx="12" cy="12" r="9"/>
              <path d="M12 7V17M9.5 9.5C9.5 8.4 10.6 7.5 12 7.5C13.4 7.5 14.5 8.4 14.5 9.5C14.5 11.5 9.5 11.5 9.5 13.5C9.5 14.6 10.6 15.5 12 15.5C13.4 15.5 14.5 14.6 14.5 13.5" strokeLinecap="round"/>
            </svg>
            <span style={{
              fontFamily: 'Cormorant Garamond, serif', fontSize: 15,
              color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1,
            }}>{userCredits}</span>
          </button>
          <img src="/Logo_Inklovers-2.png" alt="Ink Lovers" style={{ height: 44, objectFit: 'contain' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifySelf: 'end' }}>
          {['it','en','de'].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{ background: lang===l ? 'rgba(255,255,255,0.1)' : 'none', border: `1px solid ${lang===l ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 4, padding: '3px 7px', fontFamily: 'DM Mono, monospace', fontSize: 9, color: lang===l ? '#fff' : '#333', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '.1em', transition: 'all .2s' }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {page === 'feed' && <FeedPage t={t} userProfile={userProfile} />}
        {page === 'artists' && <ArtistsPage onSelectArtist={handleSelectArtist} t={t} />}
        {page === 'profile' && selectedArtistId !== null && <ArtistProfile artistId={selectedArtistId} onBack={() => setPage('artists')} onBook={handleBookArtist} t={t} lang={lang} />}
        {page === 'custom' && <CustomizePage t={t} />}
        {page === 'booking' && <BookingPage t={t} preselectedArtist={preselectedArtist} userProfile={userProfile} />}
        {page === 'credits' && <CreditsPage t={t} />}
        {page === 'admin' && isAdmin && <AdminPage t={t} />}
        {page === 'profile-user' && <UserProfilePage onBack={() => setPage('feed')} userProfile={userProfile} credits={userCredits} />}
      </div>

      {/* Bottom nav */}
      <div style={{ background: 'rgba(7,7,7,0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexShrink: 0, padding: '2px 0 0' }}>
        {navItems.map(item => {
          const isActive = activeNavId === item.id;
          return (
            <button key={item.id} onClick={() => handleNavClick(item.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', padding: '10px 0 10px', cursor: 'pointer', position: 'relative', transition: 'opacity .2s' }}>
              {isActive && <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 24, height: 1, background: 'linear-gradient(to right, transparent, #fff, transparent)' }} />}
              {item.icon(isActive)}
              <span style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', letterSpacing: '.12em', textTransform: 'uppercase', color: isActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)', transition: 'color .2s' }}>
                {item.id === 'admin' ? 'Admin' : item.id === 'credits' ? 'Premi' : t(item.labelKey)}
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

