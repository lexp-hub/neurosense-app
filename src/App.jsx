import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { RotateCcw, Loader2, X, Settings as SettingsIcon, Radio, RadioOff, Cpu } from 'lucide-react';
import { 
  requestNextTurn, 
  getStoredModelOverride, 
  setStoredModelOverride, 
  fetchAvailableModels,
  getStoredBaseUrlOverride,
  setStoredBaseUrlOverride
} from './lib/neuroSenseApi';

const TechnoSphere = lazy(() => import('./components/TechnoSphere'));

const App = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [current, setCurrent] = useState(null);
  const [steps, setSteps] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [radioOn, setRadioOn] = useState(false);
  const [models, setModels] = useState([]);
  const [config, setConfig] = useState({
    model: getStoredModelOverride() || '@cf/meta/llama-3.1-70b-instruct',
    baseUrl: getStoredBaseUrlOverride() || '/api/ai'
  });

  const audioRef = useRef(null);

  useEffect(() => {
    fetchAvailableModels().then(setModels);
  }, []);

  const toggleRadio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://stream.zeno.fm/0r0xa792kwzuv');
      audioRef.current.loop = true;
    }
    radioOn ? audioRef.current.pause() : audioRef.current.play().catch(() => {});
    setRadioOn(!radioOn);
  };

  const startGame = async () => {
    setLoading(true);
    setGameStarted(true);
    setHistory([]);
    try {
      const raw = await requestNextTurn([], config.model);
      const turn = JSON.parse(raw);
      setCurrent(turn);
      setHistory([{ role: 'assistant', content: raw }]);
      setSteps(1);
    } catch (err) {
      console.error("Inizializzazione fallita:", err);
      setGameStarted(false);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async (answer) => {
    setLoading(true);
    const updatedHistory = [...history, { role: 'user', content: answer }];
    try {
      const raw = await requestNextTurn(updatedHistory, config.model);
      const turn = JSON.parse(raw);
      setCurrent(turn);
      setHistory([...updatedHistory, { role: 'assistant', content: raw }]);
      setSteps(prev => prev + 1);
    } catch (err) {
      console.error("Errore di scansione:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-dvh w-full bg-[#0b1120] text-slate-100 flex flex-col items-center overflow-hidden font-sans">
      <Suspense fallback={<Loader2 className="animate-spin text-indigo-500 mt-20" />}>
        
        <header className="w-full max-w-4xl bg-[#161f32]/40 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center shrink-0 shadow-2xl z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
              <Cpu size={20} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest uppercase text-slate-200">Neurosense</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-bold text-indigo-400/70 uppercase tracking-tighter">Cloudflare AI Linked</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={toggleRadio} className="p-2.5 bg-slate-800/50 text-slate-400 rounded-xl hover:bg-slate-700 transition-all">
              {radioOn ? <Radio size={18} className="text-indigo-400" /> : <RadioOff size={18} />}
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2.5 bg-slate-800/50 text-slate-400 rounded-xl hover:bg-slate-700 transition-all">
              <SettingsIcon size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center p-4 md:p-8 min-h-0 relative">
          
          <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center relative mb-4 md:mb-8 transition-all duration-500">
             <TechnoSphere animating={loading} />
          </div>
          
          {!gameStarted ? (
            <div className="text-center animate-in fade-in zoom-in duration-1000 flex flex-col items-center">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em] mb-10 opacity-70">
                Pronto per l'estrazione dati
              </p>
              <button 
                onClick={startGame} 
                className="bg-[#4f46e5] px-10 md:px-14 py-4 md:py-5 rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(79,70,229,0.3)] active:scale-95 transition-all hover:bg-indigo-500 uppercase tracking-widest"
              >
                Inizia Scansione
              </button>
            </div>
          ) : (
            current && !loading && (
              <div className="w-full flex-1 flex flex-col bg-[#161f32]/80 backdrop-blur-2xl border border-white/5 p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-3xl animate-in slide-in-from-bottom-12 min-h-0">
                <div className="shrink-0 flex justify-between items-center mb-4 md:mb-6">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    Neural Stage {steps}
                  </span>
                  <button onClick={() => setGameStarted(false)} className="text-slate-600 hover:text-white transition-colors">
                    <RotateCcw size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 md:pr-3">
                {current.gameOver ? (
                  <div className="text-center animate-in zoom-in duration-500">
                    <h2 className="text-xl md:text-3xl font-black mb-2 text-indigo-400 uppercase">Identità Rilevata</h2>
                    <p className="text-lg md:text-2xl font-bold text-white mb-4 md:mb-6">{current.guess}</p>

                    {current.imageUrl && (
                      <div className="mb-4 md:mb-6 overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-black/20">
                        <img src={current.imageUrl} alt={current.guess} className="w-full max-h-48 md:max-h-64 object-cover opacity-80" />
                        {current.description && (
                          <p className="p-4 text-[10px] md:text-xs leading-relaxed text-slate-400 uppercase tracking-tight">
                            {current.description}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-slate-400 mb-6 md:mb-8 text-sm italic text-center">"{current.reaction}"</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="text-slate-400 italic mb-2 md:mb-4 text-sm font-medium opacity-80 text-center">
                      "{current.reaction || 'Analisi flussi...'}"
                    </p>
                    <h2 className="text-xl md:text-3xl font-bold mb-6 md:mb-10 leading-tight tracking-tight text-white text-center">
                      {current.isGuess ? `L'entità rilevata è ${current.guess}?` : current.question}
                    </h2>

                    {current.isGuess && current.imageUrl && (
                      <div className="mb-6 md:mb-8 overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-black/20 w-full">
                        <img src={current.imageUrl} alt={current.guess} className="w-full max-h-48 md:max-h-64 object-cover opacity-80" />
                        {current.description && <p className="p-4 text-[10px] md:text-xs leading-relaxed text-slate-400 uppercase tracking-tight">{current.description}</p>}
                      </div>
                    )}
                  </div>
                )}
                </div>

                <div className="shrink-0 pt-4 md:pt-6 border-t border-white/5">
                  {current.gameOver ? (
                    <button 
                      onClick={() => setGameStarted(false)}
                      className="w-full bg-indigo-600 p-4 md:p-5 rounded-2xl md:rounded-3xl font-bold text-lg shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-all uppercase tracking-widest"
                    >
                      Nuova Scansione
                    </button>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <button onClick={() => nextStep("Sì")} className="bg-[#4f46e5] p-4 md:p-5 rounded-2xl md:rounded-3xl font-bold text-lg md:text-xl active:scale-95 shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition-all">Sì</button>
                        <button onClick={() => nextStep("No")} className="bg-slate-800/80 p-4 md:p-5 rounded-2xl md:rounded-3xl font-bold text-lg md:text-xl border border-white/5 active:scale-95 hover:bg-slate-700 transition-all">No</button>
                      </div>
                      <button onClick={() => nextStep("Non lo so")} className="w-full bg-slate-800/80 p-4 md:p-5 rounded-2xl md:rounded-3xl font-bold text-xs md:text-sm border border-white/5 active:scale-95 tracking-[0.2em] hover:text-slate-300 transition-all uppercase">
                        Non so
                      </button>
                    </div>
              </div>
            )
          )}
          
          {loading && (
            <div className="absolute bottom-[-4rem] flex flex-col items-center gap-4 animate-pulse">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-indigo-400/60">Interrogando il network...</span>
            </div>
          )}
        </main>

        {showSettings && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in">
            <div className="bg-[#111827] border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <SettingsIcon size={20} className="text-indigo-400" />
                  <h2 className="text-lg font-bold uppercase tracking-widest text-slate-200">Core Config</h2>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 ml-1">AI Engine Endpoint</label>
                  <div className="bg-[#1f2937]/50 rounded-2xl p-4 border border-white/5 text-slate-300 text-sm">
                    {config.baseUrl}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-3 ml-1">Neural Model</label>
                  <div className="bg-[#1f2937]/50 rounded-2xl p-4 border border-indigo-500/30 text-slate-200 text-sm font-mono break-all">
                    {config.model}
                  </div>
                </div>
                <button 
                  onClick={() => setShowSettings(false)} 
                  className="w-full bg-[#4f46e5] p-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
                >
                  Aggiorna Matrice
                </button>
              </div>
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default App;