import { Trophy, RotateCcw, ChevronRight } from 'lucide-react';
import { Player } from '../types/battle.types';

export function ResultsPhase({ players, groupName, onRestart }: { players: Player[]; groupName: string; onRestart: () => void; }) {
  const top3 = players.slice(0, 3);
  
  return (
    <div className="max-w-3xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-amber-100 text-amber-500 mb-6 shadow-inner relative">
          <Trophy size={48} className="drop-shadow-md" />
          <div className="absolute inset-0 bg-amber-400/20 rounded-full animate-ping"></div>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Battle Finished!</h2>
        <p className="text-slate-500 mt-3 text-lg">{groupName} has completed the challenge.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-50 to-white z-0"></div>
        
        <div className="relative z-10 p-8 sm:p-12">
          {}
          <div className="flex items-end justify-center gap-2 sm:gap-6 mb-12 h-64">
            {}
            {top3[1] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-500 delay-150">
                <div className="w-16 h-16 rounded-full border-4 border-slate-200 bg-white flex items-center justify-center font-bold text-xl text-slate-700 shadow-md relative z-10 bg-gradient-to-b from-slate-50 to-slate-200">
                  {top3[1].initials}
                </div>
                <div className="w-20 sm:w-24 h-32 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg border-x border-t border-slate-300 flex flex-col items-center justify-start pt-4 -mt-4">
                  <span className="text-3xl font-black text-slate-400">2</span>
                  <span className="text-sm font-bold text-slate-600 mt-2">{top3[1].score} pts</span>
                </div>
                <p className="font-bold text-slate-900 mt-3 text-center">{top3[1].name}</p>
              </div>
            )}
            
            {}
            {top3[0] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-12 duration-700 delay-300">
                <div className="w-20 h-20 rounded-full border-4 border-amber-300 bg-white flex items-center justify-center font-bold text-2xl text-amber-600 shadow-lg relative z-10 bg-gradient-to-b from-amber-50 to-amber-100">
                  <Trophy size={20} className="absolute -top-6 text-amber-500" />
                  {top3[0].initials}
                </div>
                <div className="w-24 sm:w-28 h-44 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-lg border-x border-t border-amber-300 flex flex-col items-center justify-start pt-6 -mt-6 shadow-inner">
                  <span className="text-5xl font-black text-amber-500">1</span>
                  <span className="text-md font-bold text-amber-700 mt-2">{top3[0].score} pts</span>
                </div>
                <p className="font-bold text-amber-600 mt-3 text-center text-lg">{top3[0].name}</p>
              </div>
            )}

            {}
            {top3[2] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500">
                <div className="w-16 h-16 rounded-full border-4 border-amber-800/30 bg-white flex items-center justify-center font-bold text-xl text-amber-900/60 shadow-md relative z-10 bg-gradient-to-b from-amber-50/50 to-amber-100/50">
                  {top3[2].initials}
                </div>
                <div className="w-20 sm:w-24 h-24 bg-gradient-to-t from-amber-900/10 to-amber-900/5 rounded-t-lg border-x border-t border-amber-900/20 flex flex-col items-center justify-start pt-3 -mt-4">
                  <span className="text-3xl font-black text-amber-900/40">3</span>
                  <span className="text-sm font-bold text-amber-900/60 mt-1">{top3[2].score} pts</span>
                </div>
                <p className="font-bold text-slate-900 mt-3 text-center">{top3[2].name}</p>
              </div>
            )}
          </div>

          <div className="space-y-3 mb-8">
            <h4 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-4 pl-2">Other Ranks</h4>
            {players.slice(3).map((p, i) => (
              <div key={p.initials} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-4">
                  <span className="font-bold text-slate-400 w-4">{i + 4}</span>
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-sm text-slate-600">
                    {p.initials}
                  </div>
                  <span className="font-semibold text-slate-900">{p.name}</span>
                </div>
                <span className="font-bold text-indigo-600">{p.score} pts</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
            <button 
              onClick={onRestart}
              className="flex-1 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> New Battle
            </button>
            <button 
              className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Back to Dashboard <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}