# DarkNeedle Studio — App

App web per studio di tatuaggi. Costruita con React, pronta per il deploy su Vercel.

## Struttura

```
src/
  data/
    translations.js   ← Tutti i testi in IT / EN / DE
    artists.js        ← Dati degli artisti (nome, bio, stile…)
  components/
    FeedPage.jsx      ← Home / aggiornamenti
    ArtistsPage.jsx   ← Lista artisti + profilo singolo
    CustomizePage.jsx ← Personalizzazione + suggeritore AI
    BookingPage.jsx   ← Prenotazione consulenza + calendario
  App.jsx             ← Navigazione principale, language switcher
  index.css           ← Stili globali, font, variabili CSS
```

## Avvio locale

```bash
npm install
npm start
```

Apri http://localhost:3000

## Deploy su Vercel

1. Carica questa cartella su GitHub (nuovo repository)
2. Vai su https://vercel.com → "Add New Project"
3. Collega il repository GitHub
4. Lascia tutte le impostazioni di default (Vercel riconosce React automaticamente)
5. Clicca "Deploy" → in 2 minuti l'app è live

## Come aggiungere un artista

Apri `src/data/artists.js` e aggiungi un oggetto al array seguendo lo stesso formato degli altri.

## Come modificare i testi

Apri `src/data/translations.js` — ogni chiave ha la versione in IT, EN e DE.

## Variabile API (AI suggestion)

Il suggeritore AI chiama l'API di Anthropic direttamente dal browser.
Per sicurezza in produzione, è consigliabile creare un piccolo backend proxy
(es. una Vercel Edge Function) che gestisca la chiave API lato server.

File da creare: `api/suggest.js` (Vercel serverless function)
