import React, { useState, lazy, Suspense } from 'react';
import { RotateCcw, X, Loader2 } from 'lucide-react';
import { SYSTEM_PROMPT } from './constants/prompts';

const TechnoSphere = lazy(() => import('./components/TechnoSphere'));
const Header = lazy(() => import('./components/Header'));

//questa parte riguarda solo la parte del 
//player YouTube
const App = () => {
  const [view, setView] = useState('menu'); 
  const [history, setHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [radioOn, setRadioOn] = useState(false);
  const [ytUrl, setYtUrl] = useState('https://www.youtube.com/watch?v=jfKfPfyJRdk');
  const [showSettings, setShowSettings] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [finalResult, setFinalResult] = useState(null);

  const startGame = async () => {
    setView('game');
    setHistory([]);
    setQuestionCount(1);
    setFinalResult(null);
    await fetchNextStep("Iniziamo questa danza mentale. Ti avverto: i miei algoritmi sono in ottima forma oggi. Fai pure la prima mossa.");
  };

  const fetchNextStep = async (userResponse) => {
    setLoading(true);
    const newHistory = [...history, { role: "user", content: userResponse }];
    
    try {
      // Costruisci il prompt completo con un tono più naturale
      const fullPrompt = `${SYSTEM_PROMPT}\n\nSequenza sinaptica attuale:\n${newHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser Input: ${userResponse}\n\nProduci JSON.`;

      const response = await puter.ai.chat(fullPrompt);

      let textResponse = response.toString();
      const jsonMatch = textResponse.match(/\{.*\}/s);
      if (jsonMatch) textResponse = jsonMatch[0];

      const result = JSON.parse(textResponse);
      setCurrentQuestion(result);
      setHistory([...newHistory, { role: "assistant", content: textResponse }]);
      if (!result.isGuess) setQuestionCount(prev => prev + 1);
    } catch (error) {
      console.error("Errore Puter:", error);
      setCurrentQuestion({ 
        question: "Interferenza fatale. La mia logica vacilla... ripeti il segnale?", 
        reaction: "Sento il vuoto cosmico nei miei circuiti.",
        isGuess: false, 
        guess: "" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => { 
    if (!loading) {
      const responses = {
        "Sì": "Confermo la tua intuizione: Sì.",
        "No": "Negativo. Proseguiamo.",
        "Non lo so": "La tua indecisione alimenta la mia curiosità... o la mia noia."
      };
      fetchNextStep(responses[answer] || answer); 
    }
  };

  const handleGuessResult = (correct) => {
    if (correct) {
      setFinalResult({ success: true, name: currentQuestion.guess });
      setView('result');
    } else {
      fetchNextStep(`Interferenza! Non era ${currentQuestion.guess}. Ricalibra.`);
    }
  };

  const getEmbedUrl = (url) => {
    try {
      const id = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&loop=1&playlist=${id}`;
    } catch { return ''; }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] flex flex-col items-center p-4 font-sans select-none overflow-hidden">
      <div className="fixed inset-0 opacity-[0.1] pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <Suspense fallback={<div className="h-16" />}>
        <Header radioOn={radioOn} setRadioOn={setRadioOn} setShowSettings={setShowSettings} />
      </Suspense>

      <main className="w-full max-w-md relative z-10 flex-1 flex flex-col justify-center">
        {view === 'menu' && (
          <div className="flex flex-col items-center gap-8 py-4 animate-in fade-in zoom-in duration-700">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full"></div>
                <Suspense fallback={<div className="w-56 h-56" />}>
                  <TechnoSphere className="w-56 h-56 relative z-10" animating={true} />
                </Suspense>
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black text-white leading-none tracking-tighter uppercase">Techno-Sphere</h2>
              <p className="text-slate-400 font-medium px-10 text-sm leading-relaxed">Pensa a un soggetto. La sfera analizzerà i tuoi impulsi per rivelare la verità.</p>
            </div>
            <button onClick={startGame} className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg shadow-xl hover:bg-indigo-500 active:scale-95 transition-all mt-4 border-t border-white/20">INIZIA RITUALE</button>
          </div>
        )}

        {view === 'game' && (
          <div className="flex flex-col gap-5 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-[#1e293b]/90 backdrop-blur-lg rounded-[32px] p-8 shadow-2xl border border-slate-700 flex flex-col items-center text-center gap-6 relative min-h-[460px]">
              <div className="w-24 h-24 -mt-4">
                <Suspense fallback={<div className="w-full h-full" />}>
                  <TechnoSphere className="w-full h-full" animating={loading} />
                </Suspense>
              </div>
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                  <p className="font-black text-indigo-400 tracking-tighter text-xs uppercase animate-pulse">Analisi neurale in corso...</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    {currentQuestion?.reaction && (
                      <div className="bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-indigo-500/20 mb-2 animate-in fade-in slide-in-from-top-2">
                        "{currentQuestion.reaction}"
                      </div>
                    )}
                    <h3 className="text-2xl font-black text-white leading-tight px-2">
                      {currentQuestion?.isGuess ? `Ho visualizzato il segnale: è ${currentQuestion.guess}?` : currentQuestion?.question}
                    </h3>
                  </div>
                  {currentQuestion?.isGuess ? (
                    <div className="grid grid-cols-1 gap-3 w-full">
                      <button onClick={() => handleGuessResult(true)} className="bg-green-600 text-white p-5 rounded-2xl font-black active:scale-95">SÌ!</button>
                      <button onClick={() => handleGuessResult(false)} className="bg-slate-800 text-slate-400 p-4 rounded-2xl font-black active:scale-95">NO, RICALIBRA</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button onClick={() => handleAnswer("Sì")} className="bg-indigo-600 text-white p-5 rounded-2xl font-black text-lg active:scale-95">SÌ</button>
                      <button onClick={() => handleAnswer("No")} className="bg-slate-800 text-indigo-400 border border-indigo-900/50 p-5 rounded-2xl font-black text-lg active:scale-95">NO</button>
                      <button onClick={() => handleAnswer("Non lo so")} className="col-span-2 bg-slate-900/50 text-slate-500 p-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">Dato Incerto</button>
                    </div>
                  )}
                </>
              )}
            </div>
            <button onClick={() => setView('menu')} className="w-full bg-red-600/20 text-red-400 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600/30 transition-all">ANNULLA PARTITA</button>
          </div>
        )}

        {view === 'result' && (
          <div className="flex flex-col items-center gap-6 py-6 animate-in zoom-in duration-500">
            <div className="bg-[#1e293b] rounded-[40px] p-10 shadow-2xl text-center w-full relative border border-slate-700">
              <Suspense fallback={<div className="w-28 h-28 mx-auto -mt-20 mb-4" />}>
                <TechnoSphere className="w-28 h-28 mx-auto -mt-20 mb-4" />
              </Suspense>
              <h2 className="text-3xl font-black text-white mb-2">Identità Trovata</h2>
              <div className="bg-slate-900/80 p-8 rounded-[32px] mb-8 border border-indigo-500/20">
                <p className="text-4xl font-black text-white">{finalResult?.name}</p>
              </div>
              <button onClick={startGame} className="w-full bg-indigo-600 text-white py-5 rounded-full font-black text-lg flex items-center justify-center gap-2 active:scale-95">
                <RotateCcw size={20} /> RIAVVIA
              </button>
            </div>
          </div>
        )}
      </main>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-[32px] p-8 shadow-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">CONSOLE</h3>
              <button onClick={() => setShowSettings(false)} className="text-slate-500"><X /></button>
            </div>
            <input type="text" value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-xl mb-4" />
            <button onClick={() => setShowSettings(false)} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold uppercase">Applica</button>
          </div>
        </div>
      )}

      {radioOn && <div className="hidden"><iframe src={getEmbedUrl(ytUrl)} allow="autoplay"></iframe></div>}
      <footer className="mt-auto mb-2 opacity-20"><p className="text-white text-[8px] font-black uppercase tracking-[0.8em]">NeuroSense AI</p></footer>
    </div>
  );
};

export default App;