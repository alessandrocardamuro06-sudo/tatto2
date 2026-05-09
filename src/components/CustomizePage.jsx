import React, { useState } from 'react';

const STYLES = ['Traditional', 'Blackwork', 'Realism', 'Watercolor', 'Geometric', 'Dotwork', 'Neo-trad', 'Tribal'];

export default function CustomizePage({ t }) {
  const [selectedStyles, setSelectedStyles] = useState(['Blackwork']);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [zone, setZone] = useState('');
  const [size, setSize] = useState('');
  const [idea, setIdea] = useState('');

  const zoneOptions = t('zone-options') || [];
  const sizeOptions = t('size-options') || [];

  const toggleStyle = (s) => setSelectedStyles(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const generateSuggestion = async () => {
    const stylesStr = selectedStyles.join(', ') || 'non specificato';
    setLoading(true); setAiResult(null);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514', max_tokens: 1000,
          system: t('ai-system'),
          messages: [{ role: 'user', content: `Stile: ${stylesStr}. Zona: ${zone || 'non specificata'}. Dimensione: ${size || 'non specificata'}. Idea: ${idea || 'libera'}.` }],
        }),
      });
      const data = await res.json();
      setAiResult(data.content?.map(c => c.text || '').join('') || t('ai-error'));
    } catch { setAiResult(t('ai-error')); }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8,
    padding: '10px 12px', fontFamily: 'Syne, sans-serif', fontSize: 13,
    color: '#f0ece4', outline: 'none',
  };

  return (
    <div style={{ padding: '20px 18px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#f0ece4', letterSpacing: '.02em', fontStyle: 'italic', marginBottom: 6 }}>
          {t('nav-create')}
        </h1>
        <div style={{ width: 30, height: 1, background: 'linear-gradient(to right, rgba(255,255,255,0.3), transparent)' }} />
      </div>

      {/* AI Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 18, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: loading ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)', transition: 'background .3s' }} />
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#333', textTransform: 'uppercase', letterSpacing: '.15em' }}>
            {t('ai-label')}
          </div>
        </div>
        <div style={{
          minHeight: 64, fontSize: 14, lineHeight: 1.8,
          color: loading ? '#2a2a2a' : aiResult ? '#888' : '#222',
          fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', letterSpacing: '.01em',
          transition: 'color .3s',
        }}>
          {loading ? t('ai-loading') : (aiResult || t('ai-placeholder'))}
        </div>
      </div>

      {/* Upload */}
      <div style={{
        border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12, padding: 24,
        textAlign: 'center', cursor: 'pointer', marginBottom: 20, transition: 'border-color .2s',
      }}>
        <div style={{ fontSize: 12, color: '#333', marginBottom: 4, fontFamily: 'Syne, sans-serif', letterSpacing: '.04em' }}>{t('upload-text')}</div>
        <div style={{ fontSize: 9, fontFamily: 'DM Mono, monospace', color: '#1e1e1e', letterSpacing: '.08em' }}>jpg · png · pdf · max 10mb</div>
      </div>

      {/* Style */}
      <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: 10 }}>
        {t('style-label')}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {STYLES.map(s => (
          <button key={s} onClick={() => toggleStyle(s)} style={{
            padding: '6px 13px', borderRadius: 999,
            border: `1px solid ${selectedStyles.includes(s) ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.07)'}`,
            fontSize: 11, cursor: 'pointer', transition: 'all .2s',
            background: selectedStyles.includes(s) ? 'rgba(255,255,255,0.08)' : 'transparent',
            color: selectedStyles.includes(s) ? 'rgba(255,255,255,0.7)' : '#333',
            fontFamily: 'Syne, sans-serif', letterSpacing: '.04em',
          }}>{s}</button>
        ))}
      </div>

      {/* Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>{t('zone-label')}</div>
          <select style={inputStyle} value={zone} onChange={e => setZone(e.target.value)}>
            {zoneOptions.map((o, i) => <option key={i}>{o}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>{t('size-label')}</div>
          <select style={inputStyle} value={size} onChange={e => setSize(e.target.value)}>
            {sizeOptions.map((o, i) => <option key={i}>{o}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 8, fontFamily: 'DM Mono, monospace', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 6 }}>{t('idea-label')}</div>
          <textarea
            style={{ ...inputStyle, resize: 'none', height: 72, lineHeight: 1.6 }}
            placeholder={t('idea-placeholder')} value={idea} onChange={e => setIdea(e.target.value)}
          />
        </div>
      </div>

      <button onClick={generateSuggestion} disabled={loading} style={{
        width: '100%', padding: 13, marginBottom: 10,
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10, fontSize: 11, fontWeight: 600,
        color: loading ? '#2a2a2a' : 'rgba(255,255,255,0.4)',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'DM Mono, monospace', letterSpacing: '.12em',
        textTransform: 'uppercase', transition: 'all .25s',
      }}>{loading ? '· · ·' : t('gen-btn')}</button>

      <button style={{
        width: '100%', padding: 14,
        background: 'rgba(255,255,255,0.9)', color: '#0a0a0a',
        border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700,
        letterSpacing: '.1em', fontFamily: 'Syne, sans-serif', cursor: 'pointer',
        textTransform: 'uppercase', transition: 'opacity .2s',
      }}>{t('send-artists')}</button>
    </div>
  );
}

