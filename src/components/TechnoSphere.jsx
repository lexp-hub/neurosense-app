import React from 'react';

const TechnoSphere = ({ animating }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Glow esterno */}
      <div className={`absolute inset-0 bg-indigo-500/20 rounded-full blur-[60px] transition-all duration-1000 ${animating ? 'scale-125 opacity-100' : 'scale-100 opacity-50'}`} />
      
      {/* Sfera centrale */}
      <div className={`relative w-full h-full aspect-square max-w-[250px] max-h-[250px] rounded-full bg-gradient-to-tr from-indigo-900 via-slate-900 to-indigo-600 border border-white/10 shadow-2xl flex items-center justify-center overflow-hidden`}>
        
        {/* Cerchi rotanti interni */}
        <div className={`absolute w-full h-full border-2 border-indigo-500/30 rounded-full border-t-transparent animate-[spin_3s_linear_infinite] ${animating ? 'opacity-100' : 'opacity-40'}`} />
        <div className={`absolute w-[80%] h-[80%] border-2 border-cyan-400/20 rounded-full border-b-transparent animate-[spin_2s_linear_infinite_reverse]`} />
        
        {/* Core luminoso */}
        <div className={`w-12 h-12 bg-white rounded-full blur-md shadow-[0_0_30px_rgba(255,255,255,0.8)] transition-all duration-300 ${animating ? 'scale-150' : 'scale-100'}`} />
        
        {/* Scanner line */}
        {animating && (
          <div className="absolute w-full h-1 bg-indigo-400/50 blur-sm shadow-[0_0_15px_indigo] animate-[bounce_2s_infinite]" />
        )}
      </div>
    </div>
  );
};

export default TechnoSphere;