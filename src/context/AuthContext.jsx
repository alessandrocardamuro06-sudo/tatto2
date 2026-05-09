import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDots(d => (d + 1) % 3), 500);
    return () => clearInterval(interval);
  }, []);

  async function register(email, password, name, role) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), { name, email, role, createdAt: new Date() });
    return result;
  }
  async function login(email, password) { return signInWithEmailAndPassword(auth, email, password); }
  async function logout() { return signOut(auth); }

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);
    const unsub = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) setUserProfile(snap.data());
        } catch(e) { console.error(e); }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => { clearTimeout(timeout); unsub(); };
  }, []);

  if (loading) {
    return (
      <div style={{
        height: '100vh', background: '#070707',
        backgroundImage: 'radial-gradient(ellipse 100% 50% at 50% -10%, rgba(255,255,255,0.05) 0%, transparent 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 32,
      }}>
        <img src="/Logo_Inklovers-2.png" alt="Ink Lovers" style={{ width: 200, objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: i === dots ? 20 : 4,
              height: 1,
              background: i === dots ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
              borderRadius: 1,
              transition: 'all .4s ease',
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
