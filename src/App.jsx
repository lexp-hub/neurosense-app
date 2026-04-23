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
    <div className="h-screen w-full bg-[#0b1120] text-slate-100 flex flex-col items-center overflow-hidden font-sans">
      <Suspense fallback={<Loader2 className="animate-spin text-indigo-500 mt-20" />}>
        
        <header className="w-full max-w-4xl bg-[#161f3266] md:rounded-b-[2rem] backdrop-blur-xl border-b border-[#ffffff1a] p-3 flex justify-between items-center shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center border border-indigo-500 shadow-[0_0_10px_#4f46e533]">
              <Cpu size={16} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-widest uppercase text-slate-200">Neurosense</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter">Network Active</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleRadio} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-all">
              {radioOn ? <Radio size={16} className="text-indigo-400" /> : <RadioOff size={16} />}
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-all">
              <SettingsIcon size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-3xl flex flex-col items-center justify-center p-4 relative">
          
          <div className="shrink-0 w-24 h-24 md:w-36 md:h-36 flex items-center justify-center relative mb-6 transition-all">
             <TechnoSphere animating={loading} />
          </div>
          
          {!gameStarted ? (
            <div className="text-center animate-in fade-in zoom-in duration-700">
              <button 
                onClick={startGame} 
                className="bg-[#4f46e5] px-12 py-4 rounded-xl font-bold text-base shadow-[0_0_30px_rgba(79,70,229,0.3)] active:scale-95 transition-all hover:bg-indigo-500 uppercase tracking-widest"
              >
                Inizia Scansione
              </button>
            </div>
          ) : (
            <div className={`w-full max-w-xl flex flex-col bg-[#161f32]/80 backdrop-blur-2xl border border-[#ffffff1a] p-6 rounded-[2rem] shadow-3xl animate-in slide-in-from-bottom-8 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="shrink-0 flex justify-between items-center mb-4">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
                  Neural Stage {steps}
                </span>
                <button onClick={() => setGameStarted(false)} className="text-slate-600 hover:text-white transition-colors">
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="flex flex-col items-center py-4">
                <p className="text-slate-500 italic mb-2 text-[10px] md:text-xs font-medium">
                  "{current?.reaction || 'Analisi flussi...'}"
                </p>
                <h2 className="text-lg md:text-2xl font-bold mb-8 leading-tight tracking-tight text-white text-center">
                  {current?.isGuess ? `L'entità rilevata è ${current?.guess}?` : current?.question}
                </h2>

                <div className="w-full space-y-3">
                  {current?.gameOver ? (
                    <button onClick={() => setGameStarted(false)} className="w-full bg-indigo-600 p-4 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
                      Nuova Scansione
                    </button>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => nextStep("Sì")} className="bg-[#4f46e5] p-4 rounded-xl font-bold text-lg active:scale-95 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-900/40">Sì</button>
                        <button onClick={() => nextStep("No")} className="bg-slate-800 p-4 rounded-xl font-bold text-lg border border-[#ffffff1a] active:scale-95 hover:bg-slate-700 transition-all">No</button>
                      </div>
                      <button onClick={() => nextStep("Non lo so")} className="w-full bg-slate-800/40 p-2.5 rounded-lg font-bold text-[9px] border border-[#ffffff1a] active:scale-95 tracking-[0.2em] hover:text-white transition-all uppercase">
                        Non lo so
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {loading && (
            <div className="absolute bottom-10 flex flex-col items-center animate-pulse">
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-indigo-400">Interrogando il network...</span>
            </div>
          )}
        </main>
      </Suspense>
    </div>
  );
};

export default App;