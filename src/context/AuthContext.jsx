import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function register(email, password, name, role) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      name, email, role, createdAt: new Date()
    });
    return result;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);

    const unsub = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timeout);
      setCurrentUser(user);
      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) setUserProfile(snap.data());
        } catch(e) {
          console.error('Errore caricamento profilo:', e);
        }
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
        height: '100vh', background: '#0e0e0e',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 24,
      }}>
        <img
          src="/Logo_Inklovers-2.png"
          alt="Ink Lovers"
          style={{ width: 180, objectFit: 'contain', opacity: 0.9 }}
        />
        <div style={{
          width: 40, height: 2, background: '#c8523a',
          animation: 'none', borderRadius: 2,
        }} />
        <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.1em' }}>
          LOADING
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
