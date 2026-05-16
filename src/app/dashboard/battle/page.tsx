'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { Mic, MicOff, Trophy, Volume2, Users } from 'lucide-react';

// For TypeScript to recognize webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function LiveBattlePage() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  
  const currentWord = "RESTAURANT";
  const targetLanguage = "en-US"; // Change based on language learned

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = targetLanguage;

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptResult = event.results[current][0].transcript;
          setTranscript(transcriptResult.toLowerCase());
          
          if (transcriptResult.toLowerCase().includes(currentWord.toLowerCase())) {
            setStatus('success');
            setScore(prev => prev + 50);
          } else {
            setStatus('fail');
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Your browser does not support Speech Recognition. Please use Google Chrome.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setStatus('idle');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
     <DashboardLayout>
       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
         <div>
           <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
             <Trophy className="text-emerald-500" />
             Live Vocab Battle
           </h1>
           <p className="text-sm md:text-base text-slate-500 mt-1">Speak fast and clear to earn points!</p>
         </div>
         <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200">
           <button onClick={() => setRole('student')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${role === 'student' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Student View</button>
           <button onClick={() => setRole('teacher')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${role === 'teacher' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Teacher View</button>
         </div>
       </div>

       {role === 'teacher' ? (
         // TEACHER VIEW
         <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
               <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
               <div className="p-8 text-center text-white">
                 <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-bold text-emerald-400 mb-8">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   LIVE BATTLE IS ON
                 </div>
                 
                 <p className="text-slate-400 uppercase tracking-widest text-sm mb-4">Current Word to Pronounce</p>
                 <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400 mb-8 tracking-tight break-all">
                   {currentWord}
                 </h1>
                 
                 <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                    <button className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-colors">
                      <Volume2 size={20} /> Play Audio
                    </button>
                    <button className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl font-bold text-white transition-colors">
                      Next Word
                    </button>
                 </div>
               </div>
               
               <div className="bg-slate-800 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                 <div className="flex items-center gap-2 text-slate-300 font-bold">
                   <Users size={20} /> 24 Students connected
                 </div>
                 <div className="text-emerald-400 font-mono text-2xl font-bold">
                   00:45
                 </div>
               </div>
            </div>

            <div className="mt-8">
               <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Trophy className="text-yellow-500" /> Live Leaderboard
               </h3>
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                 {[
                   { name: 'Sarah K.', points: 450, time: '0.8s', color: 'bg-emerald-100 text-emerald-700' },
                   { name: 'Leo Chen', points: 320, time: '1.2s', color: 'bg-slate-100 text-slate-700' },
                   { name: 'Ben W.', points: 280, time: '1.5s', color: 'bg-slate-100 text-slate-700' },
                 ].map((u, i) => (
                   <div key={i} className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-8 font-bold text-slate-400 text-center">{i+1}</div>
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${u.color}`}>
                         {u.name.substring(0,2).toUpperCase()}
                       </div>
                       <div className="font-bold text-slate-800">{u.name}</div>
                     </div>
                     <div className="flex items-center gap-4 md:gap-6">
                       <div className="text-sm font-medium text-slate-500">{u.time}</div>
                       <div className="font-bold text-emerald-600 w-16 text-right">{u.points} XP</div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
         </div>
       ) : (
         // STUDENT VIEW
         <div className="max-w-md mx-auto">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[500px] md:h-[600px] relative">
              <div className="bg-slate-900 p-6 text-white text-center rounded-b-3xl shadow-lg relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="bg-white/10 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5">
                    <Trophy size={16} className="text-yellow-400" /> {score} XP
                  </div>
                  <div className="bg-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg text-sm font-bold font-mono">
                    00:45
                  </div>
                </div>
                <p className="text-slate-400 uppercase tracking-widest text-[10px] md:text-xs mb-2">Speak this word</p>
                <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-cyan-400 tracking-tight break-all">
                  {currentWord}
                </h2>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                {/* Visual Feedback */}
                {status === 'success' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 z-0">
                    <div className="text-emerald-500 font-bold text-2xl animate-bounce">Perfect! +50 XP</div>
                  </div>
                )}
                {status === 'fail' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-500/10 z-0">
                    <div className="text-rose-500 font-bold text-xl mb-2">Try again!</div>
                    <div className="text-slate-500 text-sm">We heard: "{transcript}"</div>
                  </div>
                )}
                
                {status === 'idle' && isListening && (
                  <div className="text-slate-500 text-sm animate-pulse z-10 absolute top-4">Listening...</div>
                )}

                <div className="mt-auto relative z-10">
                  <button 
                    onClick={toggleListening}
                    className={`w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                      isListening 
                        ? 'bg-rose-500 scale-110 shadow-rose-500/50' 
                        : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/40 hover:scale-105'
                    }`}
                  >
                    {isListening ? (
                      <MicOff size={40} className="text-white" />
                    ) : (
                      <Mic size={40} className="text-white" />
                    )}
                  </button>
                  {/* Ripple effect when listening */}
                  {isListening && (
                    <>
                      <div className="absolute top-0 left-0 w-28 h-28 md:w-32 md:h-32 bg-rose-500 rounded-full animate-ping opacity-75 -z-10"></div>
                      <div className="absolute top-0 left-0 w-28 h-28 md:w-32 md:h-32 bg-rose-500 rounded-full animate-pulse opacity-50 -z-10" style={{ animationDelay: '0.2s' }}></div>
                    </>
                  )}
                </div>
                <p className="text-slate-400 text-sm mt-8 font-medium">Tap to speak</p>
              </div>
            </div>
         </div>
       )}
     </DashboardLayout>
  );
}
