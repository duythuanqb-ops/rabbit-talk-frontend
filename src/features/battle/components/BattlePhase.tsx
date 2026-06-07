import { useState, useRef, useEffect } from 'react';
import { StopCircle, SkipForward, Volume2, Trophy, Medal, Users } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { WordItem, Player } from '../types/battle.types';
import { mockPlayers } from '../constants/battle.constants';

export function BattlePhase({
  words, timeLimit, groupName, members = [], onEnd
}: {
  words: WordItem[]; timeLimit: number; groupName: string; members?: any[]; onEnd: (players: Player[]) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [players, setPlayers] = useState<Player[]>(() => {
    if (members.length === 0) return [];
    return members.map(m => ({
      name: `${m.first_name} ${m.last_name}`.trim() || m.username,
      initials: (m.first_name?.[0] || m.username?.[0] || 'U').toUpperCase(),
      score: 0,
      answered: false,
      correct: false,
    }));
  });
  
  const currentWord = words[currentIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      handleNextWord();
    }
    return () => clearInterval(timerRef.current!);
  }, [isPlaying, timeLeft]);

  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartRound = () => {
    setIsPlaying(true);
    speakWord();
    // Simulate real-time responses
    setTimeout(() => simulateResponse(0, true), 2000);
    setTimeout(() => simulateResponse(1, false), 3500);
    setTimeout(() => simulateResponse(2, true), 5000);
  };

  const simulateResponse = (playerIndex: number, isCorrect: boolean) => {
    setPlayers(prev => {
      const next = [...prev];
      next[playerIndex] = { 
        ...next[playerIndex], 
        answered: true, 
        correct: isCorrect,
        score: next[playerIndex].score + (isCorrect ? Math.max(10, timeLeft * 2) : 0)
      };
      return next.sort((a, b) => b.score - a.score);
    });
  };

  const handleNextWord = () => {
    setIsPlaying(false);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(c => c + 1);
      setTimeLeft(timeLimit);
      setPlayers(prev => prev.map(p => ({ ...p, answered: false, correct: false })));
    } else {
      onEnd(players);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-t-2xl border border-b-0 border-slate-200">
        <div>
          <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
            Live Battle: {groupName}
          </h2>
          <p className="text-sm text-slate-500">Round {currentIndex + 1} of {words.length}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-slate-700 bg-slate-100 px-4 py-2 rounded-xl font-bold">
            <Users size={18} className="text-slate-500" />
            {players.length} Players
          </div>
          <button 
            onClick={() => onEnd(players)}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors font-semibold flex items-center gap-2"
          >
            <StopCircle size={20} /> End Early
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 bg-slate-50 border border-slate-200 p-6 rounded-b-2xl overflow-hidden">
        {/* Main Stage */}
        <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className={cn(
            "absolute inset-0 bg-indigo-50/50 transition-opacity duration-1000",
            isPlaying ? "opacity-100" : "opacity-0"
          )} />
          
          <div className="z-10 text-center w-full max-w-2xl px-8">
            {isPlaying ? (
              <div className="space-y-8 animate-in zoom-in-95 duration-300">
                <div className="text-[5rem] md:text-[7rem] font-black text-indigo-900 tracking-tighter uppercase drop-shadow-sm leading-none">
                  {currentWord.word}
                </div>
                {currentWord.hint && (
                  <p className="text-xl text-indigo-600/80 font-medium bg-white/80 backdrop-blur-sm py-3 px-6 rounded-2xl inline-block border border-indigo-100">
                    Hint: {currentWord.hint}
                  </p>
                )}
                
                <div className="flex items-center justify-center gap-8 pt-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="60" className="stroke-slate-200" strokeWidth="8" fill="none" />
                      <circle 
                        cx="64" cy="64" r="60" 
                        className={cn("stroke-indigo-500 transition-all duration-1000 ease-linear", timeLeft < 10 && "stroke-rose-500")}
                        strokeWidth="8" fill="none" 
                        strokeDasharray="377" 
                        strokeDashoffset={377 - (377 * timeLeft) / timeLimit} 
                        strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn("text-4xl font-black tabular-nums", timeLeft < 10 ? "text-rose-500" : "text-indigo-900")}>
                        {timeLeft}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={speakWord}
                    className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-200 hover:scale-105 transition-all shadow-sm"
                  >
                    <Volume2 size={32} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Volume2 size={40} />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-slate-900">Ready for Round {currentIndex + 1}?</h3>
                  <p className="text-slate-500 mt-2 text-lg">Make sure all students are attentive.</p>
                </div>
                <button 
                  onClick={handleStartRound}
                  className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-500/25"
                >
                  Broadcast Word
                </button>
              </div>
            )}
          </div>
          
          {isPlaying && (
            <button 
              onClick={handleNextWord}
              className="absolute bottom-6 right-6 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg z-20"
            >
              Skip <SkipForward size={18} />
            </button>
          )}
        </div>

        {/* Live Leaderboard Sidebar */}
        <div className="w-80 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              Live Standings
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {players.map((p, idx) => (
              <div key={p.initials} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-white shadow-sm relative overflow-hidden transition-all">
                {p.answered && (
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    p.correct ? "bg-emerald-500" : "bg-rose-500"
                  )} />
                )}
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 shrink-0 relative">
                  {p.initials}
                  {idx === 0 && p.score > 0 && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                      <Medal size={12} className="text-amber-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-slate-500">
                    {p.answered ? (p.correct ? <span className="text-emerald-600 font-medium">Correct!</span> : <span className="text-rose-500">Missed</span>) : 'Thinking...'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-indigo-600 tabular-nums">{p.score}</span>
                  <span className="text-[10px] text-slate-400 block -mt-1">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}