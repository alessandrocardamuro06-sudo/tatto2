import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  doc, onSnapshot, collection, query,
  orderBy, where, updateDoc, addDoc, serverTimestamp, increment
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const REWARDS = [
  { id: 'discount10', label: '10% di sconto', description: 'Sul prossimo tatuaggio', cost: 100, icon: '✦' },
  { id: 'discount20', label: '20% di sconto', description: 'Sul prossimo tatuaggio', cost: 200, icon: '✦✦' },
  { id: 'freeConsult', label: 'Consulenza gratuita', description: 'Con l\'artista che preferisci', cost: 50, icon: '◈' },
  { id: 'touchup', label: 'Touch-up gratuito', description: 'Ritocco su tatuaggio esistente', cost: 150, icon: '◇' },
  { id: 'merch', label: 'Gadget studio', description: 'Merchandise Ink Lovers', cost: 80, icon: '○' },
];

const HOW_TO_EARN = [
  { label: 'Prima prenotazione consulenza', credits: 20 },
  { label: 'Pubblicare un post nel feed', credits: 5 },
  { label: 'Completare un tatuaggio', credits: 50 },
  { label: 'Portare un nuovo cliente', credits: 30 },
  { label: 'Recensione lasciata', credits: 15 },
  { label: 'Compleanno', credits: 25 },
];

function HistoryItem({ item }) {
  const isEarned = item.type === 'earned';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: isEarned ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${isEarned ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: isEarned ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
        }}>
          {isEarned ? '+' : '−'}
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 2 }}>{item.label}</div>
          <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', letterSpacing: '.06em' }}>
            {item.createdAt?.toDate().toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) || '—'}
          </div>
        </div>
      </div>
      <div style={{
        fontFamily: 'Cormorant Garamond, serif', fontSize: 18,
        color: isEarned ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
        fontStyle: 'italic',
      }}>
        {isEarned ? '+' : '−'}{item.amount}
      </div>
    </div>
  );
}

export default function CreditsPage({ t }) {
  const { currentUser, userProfile } = useAuth();
  const [credits, setCredits] = useState(0);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('overview');
  const [redeeming, setRedeeming] = useState(null);
  const [success, setSuccess] = useState(null);

  // Carica crediti utente in tempo reale
  useEffect(() => {
    if (!currentUser) return;
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      if (snap.exists()) setCredits(snap.data().credits || 0);
    });
    return unsub;
  }, [currentUser]);

  // Carica storico transazioni
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'credits_history'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [currentUser]);

  const handleRedeem = async (reward) => {
    if (credits < reward.cost) return;
    setRedeeming(reward.id);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        credits: increment(-reward.cost)
      });
      await addDoc(collection(db, 'credits_history'), {
        userId: currentUser.uid,
        userName: userProfile?.name || 'Utente',
        type: 'spent',
        label: reward.label,
        amount: reward.cost,
        rewardId: reward.id,
        status: 'in attesa',
        createdAt: serverTimestamp(),
      });
      setSuccess(reward.label);
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      alert('Errore: ' + e.message);
    }
    setRedeeming(null);
  };

  const totalEarned = history.filter(h => h.type === 'earned').reduce((s, h) => s + h.amount, 0);
  const totalSpent = history.filter(h => h.type === 'spent').reduce((s, h) => s + h.amount, 0);

  return (
    <div style={{ padding: '20px 18px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', fontStyle: 'italic', marginBottom: 6 }}>
          Crediti
        </h1>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      {/* Balance card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '24px 20px',
        marginBottom: 20, textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative bg */}
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 10 }}>
          Saldo disponibile
        </div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 58, fontWeight: 300, color: '#f0ece4', lineHeight: 1, marginBottom: 6 }}>
          {credits}
        </div>
        <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#333', letterSpacing: '.15em', textTransform: 'uppercase' }}>
          crediti
        </div>

        {/* Mini stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>{totalEarned}</div>
            <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', letterSpacing: '.1em', textTransform: 'uppercase' }}>guadagnati</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(255,255,255,0.3)' }}>{totalSpent}</div>
            <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', letterSpacing: '.1em', textTransform: 'uppercase' }}>spesi</div>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '12px 16px', marginBottom: 16,
          fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Mono, monospace',
          letterSpacing: '.06em', textAlign: 'center',
        }}>
          ✓ {success} riscattato — ti contatteremo presto
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
        {[['overview', 'Premi'], ['how', 'Come guadagnare'], ['history', 'Storico']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            flex: 1, padding: '8px 0 10px', border: 'none', background: 'none',
            fontFamily: 'DM Mono, monospace', fontSize: 9, fontWeight: 600,
            color: tab === key ? '#fff' : '#2a2a2a', cursor: 'pointer',
            letterSpacing: '.1em', textTransform: 'uppercase',
            borderBottom: `1px solid ${tab === key ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
            marginBottom: -1, transition: 'color .2s',
          }}>{label}</button>
        ))}
      </div>

      {/* TAB — PREMI */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REWARDS.map(reward => {
            const canAfford = credits >= reward.cost;
            const isLoading = redeeming === reward.id;
            return (
              <div key={reward.id} style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${canAfford ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'}`,
                borderRadius: 14, padding: '16px',
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: canAfford ? 1 : 0.5, transition: 'opacity .2s',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: 'rgba(255,255,255,0.2)',
                }}>
                  {reward.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: '#e8e4dc', marginBottom: 2, fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                    {reward.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#444', fontFamily: 'Syne, sans-serif' }}>
                    {reward.description}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                    {reward.cost}
                  </div>
                  <button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || isLoading}
                    style={{
                      padding: '5px 12px',
                      background: canAfford ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.04)',
                      border: 'none', borderRadius: 7,
                      fontSize: 10, fontWeight: 700, fontFamily: 'Syne, sans-serif',
                      color: canAfford ? '#0a0a0a' : '#2a2a2a',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      letterSpacing: '.06em', textTransform: 'uppercase',
                      transition: 'all .2s',
                    }}
                  >{isLoading ? '...' : 'Riscatta'}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB — COME GUADAGNARE */}
      {tab === 'how' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 13, color: '#444', lineHeight: 1.7, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', marginBottom: 12 }}>
            Accumula crediti interagendo con lo studio. Puoi spenderli per ottenere sconti, servizi gratuiti e molto altro.
          </p>
          {HOW_TO_EARN.map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0,
                }} />
                <div style={{ fontSize: 13, color: '#777', fontFamily: 'Syne, sans-serif' }}>{item.label}</div>
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', flexShrink: 0 }}>
                +{item.credits}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB — STORICO */}
      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#2a2a2a', fontSize: 11, fontFamily: 'DM Mono, monospace', letterSpacing: '.1em' }}>
              — nessuna transazione —
            </div>
          ) : (
            history.map(item => <HistoryItem key={item.id} item={item} />)
          )}
        </div>
      )}
    </div>
  );
}
