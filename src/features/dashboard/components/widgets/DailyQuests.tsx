import { Target, CheckCircle2, Circle } from 'lucide-react';

const mockQuests = [
  { id: 1, title: 'Learn 10 new words', xp: 50, progress: 10, target: 10, isCompleted: true },
  { id: 2, title: 'Complete a speaking practice', xp: 100, progress: 0, target: 1, isCompleted: false },
  { id: 3, title: 'Score 80%+ on any quiz', xp: 150, progress: 0, target: 1, isCompleted: false },
];

export function DailyQuests() {
  return (
    <div className="double-bezel">
      <div className="double-bezel-inner bg-surface p-6 hover:shadow-lg transition-fluid">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-foreground flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 ring-1 ring-orange-500/20">
              <Target size={18} strokeWidth={2} />
            </div>
            Daily Quests
          </h3>
          <span className="text-[11px] font-bold text-muted-foreground bg-surface-hover px-2.5 py-1 rounded-full uppercase tracking-wide">Resets in 12h</span>
        </div>
        
        <div className="space-y-4">
          {mockQuests.map((quest, index) => (
            <div key={quest.id} className="group relative" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4 p-3.5 rounded-2xl border border-border/50 bg-surface-hover/50 hover:bg-surface hover:border-orange-500/30 transition-all hover:shadow-md cursor-pointer">
                <div className="shrink-0 transition-transform group-hover:scale-110">
                  {quest.isCompleted ? (
                    <CheckCircle2 className="text-emerald-500" size={24} strokeWidth={2.5} />
                  ) : (
                    <Circle className="text-muted-foreground/30" size={24} strokeWidth={2} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm truncate transition-colors ${quest.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400'}`}>
                    {quest.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden ring-1 ring-inset ring-black/5 dark:ring-white/5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${quest.isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-400 to-orange-500'}`} 
                        style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground w-8 text-right tabular-nums">
                      {quest.progress}/{quest.target}
                    </span>
                  </div>
                </div>
                <div className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${quest.isCompleted ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
                  +{quest.xp} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
