import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { RotateCcw, Loader2, X, Settings as SettingsIcon, Radio, RadioOff, Cpu } from 'lucide-react';
import { 
  requestNextTurn, 
  getStoredModelOverride, 
  fetchAvailableModels,
  getStoredBaseUrlOverride,
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
      const turn = typeof raw === 'string' ? JSON.parse(raw) : raw;
      setCurrent(turn);
      setHistory([{ role: 'assistant', content: JSON.stringify(turn) }]);
      setSteps(1);
    } catch (err) {
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
      const turn = typeof raw === 'string' ? JSON.parse(raw) : raw;
      setCurrent(turn);
      setHistory([...updatedHistory, { role: 'assistant', content: JSON.stringify(turn) }]);
      setSteps(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0b1120] text-slate-100 flex flex-col items-center overflow-hidden font-sans p-6">
      <Suspense fallback={<Loader2 className="animate-spin text-indigo-500 mt-20" />}>
        
        {/* Contenitore Centrale */}
        <div className="w-full max-w-xl flex flex-col items-center justify-center h-full gap-8">
          
          {/* Header compatto come da screenshot */}
          <header className="bg-[#161f3266] rounded-[2rem] backdrop-blur-xl border border-[#ffffff1a] py-2 px-6 flex justify-between items-center shrink-0 shadow-2xl min-w-[320px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center border border-indigo-500">
                <Cpu size={16} className="text-indigo-400" />
              </div>
              <div className="text-left">
                <h1 className="text-[10px] font-bold tracking-widest uppercase text-slate-200 leading-none">Neurosense</h1>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[7px] font-bold text-indigo-400 uppercase tracking-tighter">Network Active</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-8">
              <button onClick={toggleRadio} className="p-2 text-slate-400 hover:text-indigo-400 transition-colors">
                {radioOn ? <Radio size={16} /> : <RadioOff size={16} />}
              </button>
              <button onClick={() => setShowSettings(true)} className="p-2 text-slate-400 hover:text-white transition-colors">
                <SettingsIcon size={16} />
              </button>
            </div>
          </header>

          {/* Sfera TechnoSphere - Dimensioni originali */}
          <div className="shrink-0 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center relative transition-all">
             <TechnoSphere animating={loading} />
          </div>
          
          {!gameStarted ? (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <button 
                onClick={startGame} 
                className="bg-[#4f46e5] px-12 py-4 rounded-2xl font-bold text-base shadow-[0_0_40px_rgba(79,70,229,0.4)] active:scale-95 transition-all hover:bg-indigo-500 uppercase tracking-widest"
              >
                Inizia Scansione
              </button>
            </div>
          ) : (
            /* Game Box - Bordi arrotondati e padding generoso */
            <div className={`w-full flex flex-col bg-[#161f32]/80 backdrop-blur-2xl border border-[#ffffff1a] p-10 rounded-[3rem] shadow-3xl animate-in slide-in-from-bottom-8 ${loading ? 'opacity-50' : ''}`}>
              <div className="shrink-0 flex justify-between items-center mb-8">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                  Neural Stage {steps}
                </span>
                <button onClick={() => setGameStarted(false)} className="text-slate-600 hover:text-white transition-colors">
                  <RotateCcw size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center mb-10">
                <p className="text-slate-500 italic mb-4 text-xs font-medium">
                  "{current?.reaction || 'Analisi flussi...'}"
                </p>
                <h2 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white text-center">
                  {current?.isGuess ? `L'entità rilevata è ${current?.guess}?` : current?.question}
                </h2>
              </div>

              <div className="w-full space-y-4">
                {current?.gameOver ? (
                  <button onClick={() => setGameStarted(false)} className="w-full bg-indigo-600 p-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all">
                    Nuova Scansione
                  </button>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => nextStep("Sì")} className="bg-[#4f46e5] p-5 rounded-2xl font-bold text-xl active:scale-95 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40">Sì</button>
                      <button onClick={() => nextStep("No")} className="bg-[#1e293b] p-5 rounded-2xl font-bold text-xl border border-[#ffffff1a] active:scale-95 hover:bg-slate-700 transition-all">No</button>
                    </div>
                    <button onClick={() => nextStep("Non lo so")} className="w-full bg-transparent p-3 rounded-xl font-bold text-[10px] border border-[#ffffff0d] active:scale-95 tracking-[0.2em] text-slate-500 hover:text-white transition-all uppercase">
                      Non lo so
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          
          <div className={`h-4 transition-opacity duration-300 ${loading ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-indigo-400 animate-pulse">Syncing Network...</span>
          </div>
        </div>

        {/* Modal Settings */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in">
            <div className="bg-[#111827] border border-[#ffffff1a] w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white"><X size={20}/></button>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-200 mb-8">Configurazione</h2>
              <div className="space-y-4">
                <div className="bg-black/20 rounded-xl p-4 border border-[#ffffff0a]">
                  <label className="text-[8px] text-slate-500 uppercase mb-2 block">Base URL</label>
                  <p className="text-[10px] font-mono truncate">{config.baseUrl}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-4 border border-[#ffffff0a]">
                  <label className="text-[8px] text-slate-500 uppercase mb-2 block">Neural Model</label>
                  <p className="text-[10px] font-mono break-all">{config.model}</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="w-full bg-[#4f46e5] p-4 rounded-xl font-bold text-xs uppercase tracking-widest mt-4">Chiudi</button>
              </div>
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default App;