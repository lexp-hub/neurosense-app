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
    <div className="h-screen w-full bg-[#050505] text-[#e5e5e5] flex flex-col font-sans overflow-hidden border-4 border-[#1a1a1a]">
      <Suspense fallback={<Loader2 className="animate-spin text-yellow-400 m-auto" />}>
        
        <header className="w-full border-b border-[#1a1a1a] flex justify-between items-center p-6 bg-black">
          <div className="flex items-center gap-6">
            <span className="text-yellow-400 font-black text-2xl tracking-tighter italic">NS</span>
            <div className="h-4 w-px bg-[#333]" />
            <nav className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#666]">
              <span className="text-white">Neural</span>
              <span>Process</span>
              <span>Network</span>
            </nav>
          </div>
          <div className="flex gap-4">
            <button onClick={toggleRadio} className={`px-4 py-2 border border-[#333] rounded-sm transition-all ${radioOn ? 'bg-yellow-400 text-black' : 'hover:bg-white/5'}`}>
              <Radio size={14} />
            </button>
            <button onClick={() => setShowSettings(true)} className="px-4 py-2 border border-[#333] rounded-sm hover:bg-white/5 transition-all uppercase text-[10px] font-bold tracking-widest">
              Settings
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col md:flex-row min-h-0">
          
          <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#1a1a1a] p-12 flex flex-col justify-between">
            <div>
              <span className="text-yellow-400 text-xs font-bold font-mono uppercase mb-4 block">0{steps}</span>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.8] mb-8 text-white">
                NEURO<br/>SENSE
              </h2>
            </div>
            <p className="text-[#666] text-[10px] leading-relaxed uppercase tracking-widest max-w-[200px]">
              Advanced neural identification system. Largest selection of entities in the database.
            </p>
          </div>

          <div className="flex-1 flex flex-col relative bg-[#080808]">
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none opacity-20">
               <div className="w-[80%] h-[80%] border border-[#1a1a1a] rounded-full flex items-center justify-center">
                 <div className="w-[60%] h-[60%] border border-[#1a1a1a] rounded-full" />
               </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 z-10">
              {!gameStarted ? (
                <div className="text-center group">
                  <div className="mb-12 transition-transform duration-700 group-hover:scale-110">
                    <TechnoSphere animating={loading} />
                  </div>
                  <button onClick={startGame} className="bg-yellow-400 text-black px-16 py-6 font-black text-sm uppercase tracking-[0.3em] hover:bg-white transition-all">
                    Start Scan
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-2xl bg-black border border-[#1a1a1a] p-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
                  
                  <div className="mb-12">
                    <p className="text-[#666] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 font-mono">
                      {current?.reaction || 'Processing...'}
                    </p>
                    <h3 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tighter uppercase">
                      {current?.isGuess ? `ENTITY: ${current?.guess}?` : current?.question}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={() => nextStep("Sì")} className="bg-yellow-400 text-black p-6 font-black uppercase text-xs tracking-widest hover:bg-white transition-all">Sì</button>
                    <button onClick={() => nextStep("No")} className="border border-[#333] text-white p-6 font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all">No</button>
                    <button onClick={() => nextStep("Non lo so")} className="md:col-span-2 border border-[#1a1a1a] text-[#666] p-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-white transition-all">Unknown</button>
                  </div>
                </div>
              )}
            </div>

            {loading && (
              <div className="absolute bottom-12 left-12 flex items-center gap-4">
                <div className="w-12 h-[1px] bg-yellow-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-yellow-400">Syncing...</span>
              </div>
            )}
          </div>
        </main>

        <footer className="w-full border-t border-[#1a1a1a] p-4 bg-black flex justify-between items-center px-8">
           <span className="text-[8px] text-[#333] font-mono tracking-widest uppercase">System version 2.0.24 // Build 085466</span>
           <div className="flex gap-4">
             <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
             <div className="w-2 h-2 bg-[#1a1a1a] rounded-full" />
             <div className="w-2 h-2 bg-[#1a1a1a] rounded-full" />
           </div>
        </footer>

        {showSettings && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6">
            <div className="w-full max-w-lg border border-[#1a1a1a] p-12 relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-[#666] hover:text-white"><X size={32}/></button>
              <h2 className="text-4xl font-black tracking-tighter text-white mb-12 uppercase">Config</h2>
              <div className="space-y-8">
                <div className="border-b border-[#1a1a1a] pb-4">
                  <label className="text-[10px] font-bold text-[#666] uppercase block mb-2">Engine</label>
                  <p className="font-mono text-xs">{config.baseUrl}</p>
                </div>
                <div className="border-b border-[#1a1a1a] pb-4">
                  <label className="text-[10px] font-bold text-[#666] uppercase block mb-2">Model</label>
                  <p className="font-mono text-xs break-all">{config.model}</p>
                </div>
                <button onClick={() => setShowSettings(false)} className="w-full bg-yellow-400 text-black py-4 font-black uppercase text-xs">Close</button>
              </div>
            </div>
          </div>
        )}
      </Suspense>
    </div>
  );
};

export default App;