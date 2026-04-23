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
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col items-center p-6 overflow-x-hidden font-sans">
      <Suspense fallback={<Loader2 className="animate-spin text-indigo-500 mt-20" />}>
        
        <header className="w-full max-w-md bg-[#161f32]/40 backdrop-blur-xl border border-white/5 p-4 rounded-3xl flex justify-between items-center mb-12 shadow-2xl">
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

        <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center relative">
          
          <div className="w-72 h-72 mb-16 flex items-center justify-center relative">
             <TechnoSphere animating={loading} />
          </div>
          
          {!gameStarted ? (
            <div className="text-center animate-in fade-in zoom-in duration-1000">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em] mb-10 opacity-70">
                Pronto per l'estrazione dati
              </p>
              <button 
                onClick={startGame} 
                className="bg-[#4f46e5] px-14 py-5 rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(79,70,229,0.3)] active:scale-95 transition-all hover:bg-indigo-500 uppercase tracking-widest"
              >
                Inizia Scansione
              </button>
            </div>
          ) : (
            current && !loading && (
              <div className="w-full bg-[#161f32]/80 backdrop-blur-2xl border border-white/5 p-7 rounded-[2.5rem] shadow-3xl animate-in slide-in-from-bottom-12">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    Neural Stage {steps}
                  </span>
                  <button onClick={() => setGameStarted(false)} className="text-slate-600 hover:text-white transition-colors">
                    <RotateCcw size={18} />
                  </button>
                </div>

                {current.gameOver ? (
                  <div className="text-center animate-in zoom-in duration-500">
                    <h2 className="text-2xl font-black mb-2 text-indigo-400 uppercase">Partita Conclusa</h2>
                    <p className="text-slate-400 mb-8 text-sm italic">"{current.reaction}"</p>
                    
                    <button 
                      onClick={() => setGameStarted(false)}
                      className="w-full bg-indigo-600 p-5 rounded-3xl font-bold text-lg shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-all uppercase tracking-widest"
                    >
                      Nuova Scansione
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-slate-400 italic mb-3 text-sm font-medium opacity-80">
                      "{current.reaction || 'Analisi flussi...'}"
                    </p>
                    <h2 className="text-2xl font-bold mb-10 leading-tight tracking-tight text-white">
                      {current.isGuess ? `L'entità rilevata è ${current.guess}?` : current.question}
                    </h2>

                    {current.isGuess && current.imageUrl && (
                      <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-black/20">
                        <img src={current.imageUrl} alt={current.guess} className="w-full h-48 object-cover opacity-80" />
                        {current.description && (
                          <p className="p-4 text-[10px] leading-relaxed text-slate-400 uppercase tracking-tight">{current.description}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => nextStep("Sì")} className="bg-[#4f46e5] p-5 rounded-3xl font-bold text-xl active:scale-95 shadow-lg shadow-indigo-900/40 hover:bg-indigo-500 transition-all">Sì</button>
                        <button onClick={() => nextStep("No")} className="bg-slate-800/80 p-5 rounded-3xl font-bold text-xl border border-white/5 active:scale-95 hover:bg-slate-700 transition-all">No</button>
                      </div>
                      <button onClick={() => nextStep("Non lo so")} className="w-full bg-slate-800/80 p-5 rounded-3xl font-bold text-xl border border-white/5 active:scale-95 text-[11px] tracking-[0.2em] hover:text-slate-300 transition-all">
                        Non so
                      </button>
                    </div>
                  </>
                )}
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