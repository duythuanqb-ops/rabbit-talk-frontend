import { useState } from 'react';
import { Swords, Timer, Zap, Trash2, Plus, Play } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { WordItem } from '../types/battle.types';
import { defaultWords, mockPlayers } from '../constants/battle.constants';

export function SetupPhase({ groupName, members = [], onStart }: { groupName: string; members?: any[]; onStart: (words: WordItem[], timeLimit: number) => void }) {
  const [words, setWords] = useState<WordItem[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newHint, setNewHint] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);

  const addWord = () => {
    if (!newWord.trim()) return;
    setWords([...words, { id: Date.now(), word: newWord.toUpperCase().trim(), hint: newHint.trim() }]);
    setNewWord('');
    setNewHint('');
  };

  const removeWord = (id: number) => {
    setWords(words.filter(w => w.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 mb-6 shadow-inner">
          <Swords size={40} className="drop-shadow-sm" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configure Battle for {groupName}</h2>
        <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto leading-relaxed">
          Set up the vocabulary list and rules before inviting your students to the arena.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="text-amber-500" /> Word List
              </h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-semibold">
                {words.length} words
              </span>
            </div>

            <div className="space-y-4 mb-6">
              {words.map((w, idx) => (
                <div key={w.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-colors group">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-sm shadow-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{w.word}</p>
                      <p className="text-sm text-slate-500">{w.hint || 'No hint provided'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeWord(w.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <div className="flex-1 space-y-3">
                <input 
                  type="text" 
                  placeholder="New Word (e.g. EXTRAORDINARY)" 
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addWord()}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <input 
                  type="text" 
                  placeholder="Hint (optional)" 
                  value={newHint}
                  onChange={e => setNewHint(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addWord()}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <button 
                onClick={addWord}
                disabled={!newWord.trim()}
                className="px-6 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-sm"
              >
                <Plus size={20} /> Add
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Timer className="text-blue-500" /> Game Rules
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Time per word (seconds)</label>
                <div className="flex gap-2">
                  {[10, 15, 30, 60].map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeLimit(t)}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg border font-semibold transition-all",
                        timeLimit === t 
                          ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {t}s
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-900 text-sm">Waiting Room</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Students in the group will receive an invitation to join the battle once you start.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {members.slice(0, 5).map((p, i) => (
                      <div key={p.uuid || i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm overflow-hidden">
                        {p.avatar_url ? (
                          <img src={p.avatar_url} alt={p.first_name} className="w-full h-full object-cover" />
                        ) : (
                          (p.first_name?.[0] || p.username?.[0] || 'U').toUpperCase()
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs font-medium text-blue-800">{members.length} student{members.length !== 1 ? 's' : ''} in group</span>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onStart(words, timeLimit)}
            disabled={words.length === 0}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0"
          >
            <Play fill="currentColor" size={20} />
            Launch Battle Room
          </button>
        </div>
      </div>
    </div>
  );
}