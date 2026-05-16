import { Target, CheckCircle2, Circle } from 'lucide-react';

const mockQuests = [
  { id: 1, title: 'Learn 10 new words', xp: 50, progress: 10, target: 10, isCompleted: true },
  { id: 2, title: 'Complete a speaking practice', xp: 100, progress: 0, target: 1, isCompleted: false },
  { id: 3, title: 'Score 80%+ on any quiz', xp: 150, progress: 0, target: 1, isCompleted: false },
];

export function DailyQuests() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
          <Target className="text-orange-500" size={20} />
          Daily Quests
        </h3>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Resets in 12h</span>
      </div>
      
      <div className="space-y-3">
        {mockQuests.map((quest) => (
          <div key={quest.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <div>
              {quest.isCompleted ? (
                <CheckCircle2 className="text-emerald-500" size={24} />
              ) : (
                <Circle className="text-slate-300" size={24} />
              )}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold text-sm ${quest.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                {quest.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${quest.isCompleted ? 'bg-slate-300' : 'bg-orange-500'}`} 
                    style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-500 w-8 text-right">
                  {quest.progress}/{quest.target}
                </span>
              </div>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded-md ${quest.isCompleted ? 'bg-slate-100 text-slate-400' : 'bg-orange-100 text-orange-600'}`}>
              +{quest.xp} XP
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
