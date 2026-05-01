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

  const toggleStyle = (s) => {
    setSelectedStyles(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const generateSuggestion = async () => {
    const stylesStr = selectedStyles.join(', ') || 'non specificato';
    setLoading(true);
    setAiResult(null);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: t('ai-system'),
          messages: [{
            role: 'user',
            content: `Stile: ${stylesStr}. Zona: ${zone || 'non specificata'}. Dimensione: ${size || 'non specificata'}. Idea: ${idea || 'libera'}.`,
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(c => c.text || '').join('') || t('ai-error');
      setAiResult(text);
    } catch {
      setAiResult(t('ai-error'));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: '#161616', border: '1px solid #2a2a2a',
    borderRadius: 7, padding: '8px 10px', fontFamily: 'Syne, sans-serif',
    fontSize: 13, color: '#f0ece4', outline: 'none',
  };

  return (
    <div style={{ padding: 20 }}>
      {/* AI Box */}
      <div style={{
        background: '#161616', border: '1px solid #2a2a2a',
        borderRadius: 12, padding: 16, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#c8523a', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c8523a' }} />
          {t('ai-label')}
        </div>
        <div style={{
          background: '#1c1c1c', border: '1px solid #222', borderRadius: 8,
          padding: 12, fontSize: 13, lineHeight: 1.7, minHeight: 60,
          color: loading ? '#555' : (aiResult ? '#f0ece4' : '#666'),
          fontStyle: aiResult && !loading ? 'italic' : 'normal',
        }}>
          {loading ? t('ai-loading') : (aiResult || t('ai-placeholder'))}
        </div>
      </div>

      {/* Upload zone */}
      <div style={{
        border: '1px dashed #2a2a2a', borderRadius: 10, padding: 22,
        textAlign: 'center', background: '#161616', cursor: 'pointer', marginBottom: 14,
      }}>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>{t('upload-text')}</p>
        <small style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: '#444' }}>jpg · png · pdf — max 10mb</small>
      </div>

      {/* Style label */}
      <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
        {t('style-label')}
      </div>

      {/* Style tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {STYLES.map(s => (
          <button
            key={s}
            onClick={() => toggleStyle(s)}
            style={{
              padding: '6px 12px', borderRadius: 999,
              border: `1px solid ${selectedStyles.includes(s) ? '#c8523a' : '#2a2a2a'}`,
              fontSize: 12, cursor: 'pointer', transition: 'all .2s',
              background: selectedStyles.includes(s) ? '#c8523a' : '#161616',
              color: selectedStyles.includes(s) ? '#fff' : '#888',
              fontFamily: 'Syne, sans-serif',
            }}
          >{s}</button>
        ))}
      </div>

      {/* Form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>{t('zone-label')}</label>
          <select style={inputStyle} value={zone} onChange={e => setZone(e.target.value)}>
            {zoneOptions.map((o, i) => <option key={i}>{o}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>{t('size-label')}</label>
          <select style={inputStyle} value={size} onChange={e => setSize(e.target.value)}>
            {sizeOptions.map((o, i) => <option key={i}>{o}</option>)}
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'block', fontSize: 10, fontFamily: 'DM Mono, monospace', color: '#555', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>{t('idea-label')}</label>
          <textarea
            style={{ ...inputStyle, resize: 'none', height: 68, lineHeight: 1.5 }}
            placeholder={t('idea-placeholder')}
            value={idea}
            onChange={e => setIdea(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={generateSuggestion}
        disabled={loading}
        style={{
          width: '100%', padding: 12, background: '#1c1c1c',
          border: '1px solid #c8523a', color: '#c8523a', borderRadius: 8,
          fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: 10, opacity: loading ? 0.6 : 1,
          fontFamily: 'Syne, sans-serif',
        }}
      >{t('gen-btn')}</button>

      <button style={{
        width: '100%', padding: 13, background: '#c8523a', color: '#fff',
        border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700,
        letterSpacing: '.04em', fontFamily: 'Syne, sans-serif',
      }}>{t('send-artists')}</button>
    </div>
  );
}
