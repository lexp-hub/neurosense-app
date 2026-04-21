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
- **Cloudflare Workers AI**

## Architettura

L'app non richiede più un server esterno separato.

- il frontend gira su Cloudflare Pages
- l'API gira sotto `functions/api/ai/*`
- le route esposte al client sono:
  - `GET /api/ai/v1/models`
  - `POST /api/ai/v1/chat/completions`
- il modello viene eseguito tramite Workers AI

## Configurazione Locale

Esempio `.env`:

```bash
VITE_PUBLIC_BASE_PATH=/
VITE_AI_PROXY_TARGET=http://127.0.0.1:8000
VITE_AI_MODEL=@cf/meta/llama-3-8b-instruct
# In alternativa:
# VITE_AI_API_BASE_URL=https://your-ai-endpoint.example.com
```

Per sviluppo locale:

```bash
npm run dev
```

Per preview Cloudflare locale:

```bash
npm run build
npm run cf:preview
```

## Deploy su Cloudflare Pages

1. Collega il repository a Cloudflare Pages.
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Mantieni il file `wrangler.toml` nel repo.
5. Aggiungi il binding AI chiamato `AI`.

Il progetto è già predisposto con:

- [wrangler.toml](/home/lex/Desktop/neurosense-app/wrangler.toml:1)
- endpoint AI in [functions/api/ai/v1/chat/completions.js](/home/lex/Desktop/neurosense-app/functions/api/ai/v1/chat/completions.js:1) e [functions/api/ai/v1/models.js](/home/lex/Desktop/neurosense-app/functions/api/ai/v1/models.js:1)
- client frontend in [src/lib/neuroSenseApi.js](/home/lex/Desktop/neurosense-app/src/lib/neuroSenseApi.js:1)
