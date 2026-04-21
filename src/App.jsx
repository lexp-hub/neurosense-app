import React, { useEffect, useState, lazy, Suspense } from 'react';
import { RotateCcw, X, Loader2 } from 'lucide-react';
import {
  fetchAvailableModels,
  getOllamaFreeConfig,
  getStoredModelOverride,
  requestNextTurn,
  setStoredModelOverride,
} from './lib/ollamaFreeApi';

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
  const [apiModel, setApiModel] = useState(() => getStoredModelOverride() || getOllamaFreeConfig().defaultModel);

  const ollamaFreeConfig = getOllamaFreeConfig();
  const modelOptions = Array.from(
    new Set([apiModel, ollamaFreeConfig.defaultModel, ...availableModels].filter(Boolean)),
  );

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

    // prima chiamata mi commuovo 
    await nextStep("Ok partiamo, fai la prima domanda.");
  };

  const nextStep = async (input) => {
    setLoading(true);

    const updatedHistory = [...history, { role: "user", content: input }];

    try {
      let text = await requestNextTurn(updatedHistory, apiModel);

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

      setCurrent({
        question: "Ok qualcosa è andato storto... riprova",
        isGuess: false,
        guess: ""
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

            <button
              onClick={startGame}
              className="w-full bg-indigo-600 text-white py-5 rounded-xl font-bold"
            >
              INIZIA
            </button>
          </div>
        )}

        {view === 'game' && (
          <div className="flex flex-col gap-5">
            <div className="bg-[#1e293b] rounded-2xl p-6 text-center min-h-[400px]">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                Model: {apiModel}
              </p>

              <Suspense fallback={<div />}>
                <TechnoSphere animating={loading} />
              </Suspense>

              {loading ? (
                <Loader2 className="animate-spin mx-auto mt-6" />
              ) : (
                <>
                  <h3 className="text-xl mt-4">
                    {current?.isGuess
                      ? `È ${current.guess}?`
                      : current?.question}
                  </h3>

                  {current?.isGuess ? (
                    <>
                      <button onClick={() => handleGuess(true)}>Sì</button>
                      <button onClick={() => handleGuess(false)}>No</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleAnswer("Sì")}>Sì</button>
                      <button onClick={() => handleAnswer("No")}>No</button>
                      <button onClick={() => handleAnswer("Non lo so")}>
                        Boh
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            <button onClick={() => setView('menu')}>
              TORNA DA DOVE SEI VENUTO!!!
            </button>
          </div>
        )}

        {view === 'result' && (
          <div className="text-center">
            <h2>Era:</h2>
            <h1>{result?.name}</h1>

            <button onClick={startGame}>
              <RotateCcw /> Riprova
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
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-slate-100"
            />
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
