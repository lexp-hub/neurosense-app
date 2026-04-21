# 🔮 NeuroSense - Techno-Sphere

**NeuroSense** è una web-app interattiva che reinterpreta l'esperienza classica di Akinator in una chiave futuristica e cyberpunk. Grazie all'integrazione con un endpoint OpenAI-compatible basato su **OllamaFreeAPI**, il sistema guida l'utente con domande mirate per indovinare personaggi, oggetti o animali, il tutto dentro un'interfaccia costruita con **React** e **Tailwind CSS**.

![NeuroSense Preview](https://via.placeholder.com/800x400/0f172a/6366f1?text=NeuroSense+Techno-Sphere)

## 🚀 Caratteristiche

- **Techno-Sphere AI**: Un'interfaccia futuristica che reagisce alle tue risposte.
- **Integrazione OllamaFreeAPI**: Usa un endpoint OpenAI-compatible basato su `ollamafreeapi` al posto di `puter.js`.
- **Design Cyberpunk**: Interfaccia utente scura con accenti neon, animazioni fluide e stile moderno.
- **Logica Avanzata**: Sistema di domande dinamico basato sulla cronologia della conversazione.

## 🛠️ Tecnologie Utilizzate

- **React 19** - Frontend framework
- **Vite** - Build tool ultra-veloce
- **Tailwind CSS** - Styling utility-first
- **Cloudflare Pages Functions** - Backend serverless nello stesso progetto
- **Cloudflare Workers AI** - Modelli AI gratuiti nel piano free
- **Lucide React** - Set di icone eleganti e moderne

## Crediti

L'integrazione AI usata in questa app si basa su **OllamaFreeAPI**, progetto creato da **mfoud444**.

- Repository originale: `https://github.com/mfoud444/ollamafreeapi`
- Grazie all'autore per aver reso disponibile il progetto open source.

## Hosting Consigliato

Questa app ora e pensata per essere pubblicata su **Cloudflare Pages** invece che su GitHub Pages.

Motivo:

- il frontend resta statico
- l'endpoint `/api/ollama-free/*` viene servito da **Pages Functions**
- il backend usa **Workers AI**, quindi non devi mantenere un server tuo
- per un uso personale il piano free di Cloudflare e in genere sufficiente

## Endpoint AI Integrato

Nel repository sono gia inclusi:

- `functions/api/ollama-free/v1/chat/completions.js`
- `functions/api/ollama-free/v1/models.js`
- `wrangler.toml`

Queste Functions espongono un layer OpenAI-compatible sopra Workers AI, cosi il frontend puo continuare a chiamare:

- `GET /api/ollama-free/v1/models`
- `POST /api/ollama-free/v1/chat/completions`

## Deploy su Cloudflare Pages

1. Crea un progetto su Cloudflare Pages collegando questo repository.
2. Imposta come build command:

```bash
npm run build
```

3. Imposta come build output directory:

```bash
dist
```

4. Verifica che il progetto usi il file `wrangler.toml` presente nel repo.
5. Nel progetto Cloudflare aggiungi il binding AI chiamato `AI`.

Il repository e gia configurato con:

- `pages_build_output_dir = "dist"`
- binding Workers AI `AI`
- modello di default `@cf/meta/llama-3-8b-instruct`

## Configurazione Locale

Per sviluppo locale puoi continuare a usare Vite con proxy:

```bash
VITE_PUBLIC_BASE_PATH=/
VITE_OLLAMAFREE_PROXY_TARGET=http://127.0.0.1:8000
VITE_OLLAMAFREE_MODEL=@cf/meta/llama-3-8b-instruct
```

Se vuoi provare la build Cloudflare localmente:

```bash
npm run build
npm run cf:preview
```
