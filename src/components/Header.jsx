import React from 'react';
import { Volume2, VolumeX, Settings, Cpu, Zap } from 'lucide-react';

const Header = ({ radioOn, setRadioOn, setShowSettings }) => (
  <header className="w-full max-w-md bg-[#1e293b]/80 backdrop-blur-md border border-slate-700 p-4 rounded-[28px] shadow-2xl relative z-10 flex justify-between items-center mb-6 mt-2">
    <div className="flex items-center gap-3">
      <div className="bg-[#6366f1] p-2 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
        <Cpu className="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 className="text-md font-black tracking-tight uppercase">NeuroSense</h1>
        <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
          <Zap size={8} className="text-amber-400" /> OllamaFreeAPI linked
        </p>
      </div>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={() => setRadioOn(!radioOn)}
        className={`p-2.5 rounded-xl transition-all ${radioOn ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500'}`}
      >
        {radioOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
      <button 
        onClick={() => setShowSettings(true)} 
        className="p-2.5 bg-slate-800 text-slate-500 rounded-xl"
      >
        <Settings size={18} />
      </button>
    </div>
  </header>
);

export default Header;
