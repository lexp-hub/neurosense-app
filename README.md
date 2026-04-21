# 🔮 NeuroSense - Techno-Sphere

**NeuroSense** è una web-app interattiva ispirata ad Akinator, con interfaccia cyberpunk e backend AI integrato nello stack Cloudflare.

## 🚀 Caratteristiche

- **Techno-Sphere AI**: interfaccia futuristica che reagisce alle risposte dell'utente.
- **Cloudflare AI**: endpoint OpenAI-compatible servito da Pages Functions e Workers AI.
- **Design Cyberpunk**: UI scura con accenti neon e animazioni fluide.
- **Demo Mode**: fallback locale per mantenere l'app usabile anche senza endpoint AI remoto.

## 🛠️ Stack

- **React 19**
- **Vite**
- **Tailwind CSS**
- **Cloudflare Pages**
- **Cloudflare Pages Functions**
- **Cloudflare Workers AI** (Modello: **Moonshot Kimi k2.6**)

## Architettura

L'app utilizza un'architettura serverless basata su Cloudflare:

- **Frontend:** React + Vite ospitato su Cloudflare Pages.
- **Backend (API):** Cloudflare Pages Functions (`functions/api/ai/*`).
- **Intelligenza Artificiale:** Cloudflare Workers AI con il modello `@cf/moonshot/kimi-k2.6`.

## Configurazione

Il modello predefinito è configurato in `src/lib/neuroSenseApi.js`. È possibile sovrascrivere il modello e l'endpoint tramite:
1. Variabili d'ambiente (`VITE_AI_MODEL`).
2. Pannello **Console** (Impostazioni) direttamente nell'interfaccia dell'app.

Esempio `.env`:
```bash
VITE_AI_MODEL=@cf/moonshot/kimi-k2.6
```

