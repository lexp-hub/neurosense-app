import React, { useEffect, useState, lazy, Suspense } from 'react';
import { RotateCcw, X, Loader2 } from 'lucide-react';
import {
  fetchAvailableModels,
  getOllamaFreeConfig,
  getStoredBaseUrlOverride,
  getStoredModelOverride,
  requestNextTurn,
  setStoredBaseUrlOverride,
  setStoredModelOverride,
} from './lib/ollamaFreeApi';
import { getDemoNextTurn, isDemoModeEnabled } from './lib/demoMode';

const TechnoSphere = lazy(() => import('./components/TechnoSphere'));
const Header = lazy(() => import('./components/Header'));

const App = () => {
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(false);

  const [radioOn, setRadioOn] = useState(false);
  const [ytUrl, setYtUrl] = useState('https://www.youtube.com/watch?v=jfKfPfyJRdk');
  const [showSettings, setShowSettings] = useState(false);

  const [steps, setSteps] = useState(0);
  const [result, setResult] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [gameError, setGameError] = useState('');
  const [apiModel, setApiModel] = useState(() => getStoredModelOverride() || getOllamaFreeConfig().defaultModel);
  const [apiBaseUrl, setApiBaseUrl] = useState(() => getStoredBaseUrlOverride() || getOllamaFreeConfig().configuredBaseUrl);

  const ollamaFreeConfig = getOllamaFreeConfig();
  const modelOptions = Array.from(
    new Set([apiModel, ollamaFreeConfig.defaultModel, ...availableModels].filter(Boolean)),
  );
  const runningOnGithubPages =
    typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  const needsRemoteEndpointHint = runningOnGithubPages && ollamaFreeConfig.isUsingLocalProxy;
  const isDemoMode = needsRemoteEndpointHint && isDemoModeEnabled();

  useEffect(() => {
    if (!showSettings) {
      return;
    }

    let cancelled = false;

    const loadModels = async () => {
      setModelsLoading(true);
      setSettingsError('');

      try {
        const models = await fetchAvailableModels();

        if (cancelled) {
          return;
        }

        setAvailableModels(models);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setSettingsError(error.message || 'Connessione al server OllamaFreeAPI non riuscita.');
      } finally {
        if (!cancelled) {
          setModelsLoading(false);
        }
      }
    };

    loadModels();

    return () => {
      cancelled = true;
    };
  }, [showSettings]);

  const startGame = async () => {
    setView('game');
    setHistory([]);
    setSteps(1);
    setResult(null);
    setGameError('');

    // prima chiamata mi commuovo 
    await nextStep("Ok partiamo, fai la prima domanda.");
  };

  const nextStep = async (input) => {
    setLoading(true);

    const updatedHistory = [...history, { role: "user", content: input }];

    try {
      let text;

      if (isDemoMode) {
        text = JSON.stringify(getDemoNextTurn(updatedHistory));
      } else {
        text = await requestNextTurn(updatedHistory, apiModel);
      }

      // in un grande fieno di aghi di pino, trova il cuore della mia sanità mentale
      const match = text.match(/\{.*\}/s);
      if (match) text = match[0];

      const data = JSON.parse(text);

      setCurrent(data);
      setHistory([...updatedHistory, { role: "assistant", content: text }]);

      if (!data.isGuess) {
        setSteps(prev => prev + 1);
      }

    } catch (err) {
      console.error("errore ollamafreeapi:", err);
      const message = err instanceof Error ? err.message : 'Errore sconosciuto.';
      setGameError(message);

      setCurrent({
        question: "Connessione persa con NeuroSense",
        isGuess: false,
        guess: "",
        reaction: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (ans) => {
    if (loading) return;

    // Porca puttana che poeta, attenzione best programmatore ever twin.
    nextStep(ans);
  };

  const handleGuess = (correct) => {
    if (correct) {
      setResult({ success: true, name: current.guess });
      setView('result');
    } else {
      nextStep(`No, non era ${current.guess}`);
    }
  };

  const handleModelChange = (event) => {
    const nextModel = event.target.value;
    setApiModel(nextModel);
    setStoredModelOverride(nextModel);
  };

  const handleBaseUrlChange = (event) => {
    setApiBaseUrl(event.target.value);
  };

  const applyApiSettings = () => {
    setStoredBaseUrlOverride(apiBaseUrl);
    setStoredModelOverride(apiModel);
    setShowSettings(false);
  };

  const resetApiSettings = () => {
    setApiBaseUrl(ollamaFreeConfig.configuredBaseUrl);
    setApiModel(ollamaFreeConfig.defaultModel);
    setStoredBaseUrlOverride('');
    setStoredModelOverride('');
    setShowSettings(false);
  };

  const getEmbedUrl = (url) => {
    try {
      const id = url.includes('v=')
        ? url.split('v=')[1].split('&')[0]
        : url.split('/').pop();

      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&loop=1&playlist=${id}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] flex flex-col items-center p-4 font-sans select-none overflow-hidden">

      {/* sfondo */}
      <div className="fixed inset-0 opacity-[0.1] pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            backgroundImage:
              'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <Suspense fallback={<div className="h-16" />}>
        <Header
          radioOn={radioOn}
          setRadioOn={setRadioOn}
          setShowSettings={setShowSettings}
        />
      </Suspense>

      <main className="w-full max-w-md relative z-10 flex-1 flex flex-col justify-center">

        {view === 'menu' && (
          <div className="flex flex-col items-center gap-8 py-4">
            <Suspense fallback={<div className="w-56 h-56" />}>
              <TechnoSphere className="w-56 h-56" animating />
            </Suspense>

            {needsRemoteEndpointHint && (
              <div className="w-full rounded-[28px] border border-amber-400/30 bg-amber-500/10 px-5 py-4 text-left shadow-[0_0_30px_rgba(245,158,11,0.08)]">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-300">
                  GitHub Pages
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Questa build usa la modalita demo locale. Se vuoi la lettura completa con AI vera,
                  apri le impostazioni e inserisci un endpoint remoto OllamaFreeAPI con CORS attivo.
                </p>
              </div>
            )}

            <button
              onClick={startGame}
              className="w-full rounded-[24px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 px-6 py-5 text-base font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_50px_rgba(99,102,241,0.35)] transition-transform duration-200 hover:scale-[1.01]"
            >
              INIZIA
            </button>
          </div>
        )}

        {view === 'game' && (
          <div className="flex flex-col gap-5">
            <div className="rounded-[34px] border border-slate-700/80 bg-slate-800/95 p-6 text-center min-h-[520px] shadow-2xl backdrop-blur-md">
              <div className="mb-6 flex items-center justify-between gap-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  {isDemoMode ? 'Mode: Demo Locale' : `Model: ${apiModel}`}
                </p>
                <p className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
                  Step {steps}
                </p>
              </div>

              <div className="mx-auto mb-6 w-full max-w-[290px]">
                <Suspense fallback={<div className="h-[280px]" />}>
                  <TechnoSphere className="w-full" animating={loading} />
                </Suspense>
              </div>

              <div className="mx-auto w-full max-w-sm">
                {loading ? (
                  <div className="flex flex-col items-center gap-4 pt-4">
                    <Loader2 className="animate-spin" size={30} />
                    <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
                      Calibrazione in corso
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mb-3 text-xl font-medium leading-8 text-slate-50">
                      {current?.isGuess
                        ? `E ${current.guess}?`
                        : current?.question}
                    </p>

                    {current?.reaction && (
                      <p className="mb-6 text-sm leading-6 text-slate-400">
                        {current.reaction}
                      </p>
                    )}

                    {gameError && (
                      <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-left text-sm leading-6 text-rose-200">
                        {gameError}
                      </div>
                    )}

                    {current?.isGuess ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleGuess(true)}
                          className="rounded-2xl bg-emerald-500 px-4 py-4 font-black uppercase tracking-[0.18em] text-white transition-transform duration-200 hover:scale-[1.02]"
                        >
                          Si
                        </button>
                        <button
                          onClick={() => handleGuess(false)}
                          className="rounded-2xl border border-slate-600 bg-slate-900/90 px-4 py-4 font-black uppercase tracking-[0.18em] text-slate-200 transition-transform duration-200 hover:scale-[1.02]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleAnswer("Sì")}
                          className="rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-4 font-black uppercase tracking-[0.18em] text-white transition-transform duration-200 hover:scale-[1.02]"
                        >
                          Si
                        </button>
                        <button
                          onClick={() => handleAnswer("No")}
                          className="rounded-2xl border border-indigo-400/30 bg-slate-900/90 px-4 py-4 font-black uppercase tracking-[0.18em] text-indigo-200 transition-transform duration-200 hover:scale-[1.02]"
                        >
                          No
                        </button>
                        <button
                          onClick={() => handleAnswer("Non lo so")}
                          className="col-span-2 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4 font-black uppercase tracking-[0.18em] text-slate-300 transition-transform duration-200 hover:scale-[1.01]"
                        >
                          Non lo so
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setView('menu')}
              className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-rose-200 transition-colors duration-200 hover:bg-rose-500/20"
            >
              Torna al menu
            </button>
          </div>
        )}

        {view === 'result' && (
          <div className="rounded-[34px] border border-slate-700/80 bg-slate-800/95 p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="mx-auto mb-4 w-full max-w-[220px]">
              <Suspense fallback={<div className="h-[220px]" />}>
                <TechnoSphere className="w-full" />
              </Suspense>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-300">
              Identita trovata
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase tracking-tight text-white">
              {result?.name}
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              NeuroSense ti ha letto in pochi step. Abbastanza prevedibile, in fondo.
            </p>

            <button
              onClick={startGame}
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-[24px] bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 px-6 py-5 text-base font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_50px_rgba(99,102,241,0.35)] transition-transform duration-200 hover:scale-[1.01]"
            >
              <RotateCcw size={18} /> Riprova
            </button>
          </div>
        )}
      </main>

      {showSettings && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-20 p-4">
          <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-700 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-black uppercase tracking-wide">OllamaFreeAPI</h2>
                <p className="text-sm text-slate-400">
                  Endpoint attivo: {ollamaFreeConfig.baseUrl}
                </p>
              </div>
              <button onClick={() => setShowSettings(false)}>
                <X />
              </button>
            </div>

            <label className="block text-sm font-bold text-slate-200 mb-2">
              Endpoint API
            </label>

            <input
              value={apiBaseUrl}
              onChange={handleBaseUrlChange}
              placeholder="https://your-ollamafree-instance.example.com"
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100 mb-2"
            />

            <p className="text-xs text-slate-400 mb-4 leading-5">
              In locale puoi lasciare vuoto e usare il proxy Vite. Su GitHub Pages serve un endpoint remoto con CORS abilitato.
            </p>

            <label className="block text-sm font-bold text-slate-200 mb-2">
              Modello
            </label>

            <select
              value={apiModel}
              onChange={handleModelChange}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100 mb-3"
            >
              {modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                  {model === ollamaFreeConfig.defaultModel ? ' (default)' : ''}
                </option>
              ))}
            </select>

            <p className="text-xs text-slate-400 mb-4">
              Il modello selezionato viene salvato solo in questo browser.
            </p>

            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 mb-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-2">
                Stato connessione
              </p>
              {modelsLoading && (
                <p className="text-sm text-slate-300">Recupero modelli disponibili...</p>
              )}

              {!modelsLoading && settingsError && (
                <p className="text-sm text-rose-300">{settingsError}</p>
              )}

              {!modelsLoading && !settingsError && (
                <p className="text-sm text-emerald-300">
                  Server raggiungibile. Modelli trovati: {availableModels.length || 1}
                </p>
              )}
            </div>

            <label className="block text-sm font-bold text-slate-200 mb-2">
              Radio URL
            </label>

            <input
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100 mb-5"
            />

            <div className="flex gap-3">
              <button
                onClick={resetApiSettings}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-bold uppercase tracking-[0.15em] text-slate-300"
              >
                Reset
              </button>
              <button
                onClick={applyApiSettings}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-black uppercase tracking-[0.15em] text-white"
              >
                Applica
              </button>
            </div>
          </div>
        </div>
      )}

      {radioOn && (
        <iframe
          className="hidden"
          src={getEmbedUrl(ytUrl)}
          allow="autoplay"
        />
      )}
    </div>
  );
};

export default App;
