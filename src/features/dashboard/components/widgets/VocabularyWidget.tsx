import { BookOpen, ChevronRight, Plus } from 'lucide-react';

const mockVocab = [
  { word: 'La ciudad', translation: 'The city', status: 'Learning' },
  { word: 'Viajar', translation: 'To travel', status: 'Mastered' },
  { word: 'El edificio', translation: 'The building', status: 'New' },
];

export function VocabularyWidget() {
  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-surface p-6 h-full flex flex-col hover:shadow-lg transition-fluid">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
          <BookOpen className="text-emerald-500" size={20} />
          My Vocabulary
        </h3>
        <button className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {mockVocab.map((item) => (
          <div key={item.word} className="group flex items-center justify-between p-3 rounded-xl border border-slate-50 dark:border-slate-700/50 hover:border-emerald-100 dark:hover:border-emerald-900/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-700 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 group-hover:bg-white dark:group-hover:bg-slate-600">
                {item.word[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.word}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{item.translation}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                {item.status}
              </span>
              <ChevronRight size={16} className="text-slate-300 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-2.5 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-100 dark:border-slate-700 rounded-xl hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all">
        Practice Session
      </button>
      </div>
    </div>
  );
}
