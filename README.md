# 🔮 NeuroSense - Techno-Sphere

**NeuroSense** è una web-app interattiva ispirata ad Akinator, con interfaccia cyberpunk e backend AI integrato nello stack Cloudflare.

## 🚀 Caratteristiche

- **Techno-Sphere AI**: interfaccia futuristica che reagisce alle risposte dell'utente.
- **Cloudflare AI**: endpoint OpenAI-compatible servito da Pages Functions e Workers AI.
- **Design Cyberpunk**: UI scura con accenti neon e animazioni fluide.

## 🛠️ Stack

- **React 19**
- **Vite**
- **Tailwind CSS**
- **Cloudflare Pages**
- **Cloudflare Pages Functions**
- **Cloudflare Workers AI** (Modello: **Llama 3.1 70B Instruct**)

## Architettura

L'app utilizza un'architettura serverless basata su Cloudflare:

- **Frontend:** React + Vite ospitato su Cloudflare Pages.
- **Backend (API):** Cloudflare Pages Functions (`functions/api/ai/*`).
- **Intelligenza Artificiale:** Cloudflare Workers AI con il modello `@cf/meta/llama-3.1-70b-instruct`.


```
