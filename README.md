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
- **OllamaFreeAPI** - Proxy / gateway OpenAI-compatible per modelli Ollama
- **Lucide React** - Set di icone eleganti e moderne

## Crediti

L'integrazione AI usata in questa app si basa su **OllamaFreeAPI**, progetto creato da **mfoud444**.

- Repository originale: `https://github.com/mfoud444/ollamafreeapi`
- Grazie all'autore per aver reso disponibile il progetto open source.

## Configurazione OllamaFreeAPI

L'app ora invia le richieste a un endpoint compatibile con `POST /v1/chat/completions`.

In sviluppo, Vite fa proxy automatico da:

- `/api/ollama-free` -> `http://127.0.0.1:8000`

Puoi personalizzare il target creando un file `.env`:

```bash
VITE_OLLAMAFREE_PROXY_TARGET=http://127.0.0.1:8000
VITE_OLLAMAFREE_MODEL=llama3.2:3b
```

Se vuoi saltare il proxy Vite e chiamare direttamente un endpoint remoto, imposta:

```bash
VITE_OLLAMAFREE_API_BASE_URL=https://tuo-endpoint.example.com
VITE_OLLAMAFREE_MODEL=llama3.2:3b
```

Nota: per l'uso diretto dal browser, il server remoto deve consentire CORS. Se usi il proxy Python del repository `mfoud444/ollamafreeapi`, la strada piu semplice in locale e avviarlo sulla porta `8000` e lasciare che Vite faccia da proxy.

## Avvio rapido con il repository originale

Se vuoi usare esattamente il progetto che hai linkato:

```bash
git clone https://github.com/mfoud444/ollamafreeapi
cd ollamafreeapi
pip install .
pip install fastapi uvicorn
python server.py
```

Per default il proxy OpenAI-compatible gira su `http://127.0.0.1:8000`, che e il target gia previsto da questa app.

## Cosa fa ora il frontend

- Chiama `POST /v1/chat/completions` tramite `src/lib/ollamaFreeApi.js`
- Usa il proxy Vite `/api/ollama-free` in sviluppo
- Legge davvero `VITE_OLLAMAFREE_PROXY_TARGET` dal file `.env` dentro `vite.config.js`
- Mostra nelle impostazioni endpoint attivo e modelli disponibili da `GET /v1/models`
- Permette di scegliere il modello direttamente dal browser, salvando l'override in `localStorage`
