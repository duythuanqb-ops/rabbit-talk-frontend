import { Target, CheckCircle2, Circle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';

import { motion } from 'framer-motion';

export function DailyQuests() {
  const [quests, setQuests] = useState<any[]>([]);

  const fetchQuests = () => {
    dashboardService.getStudentQuests().then(res => setQuests(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchQuests();
    const handleQuestUpdate = () => fetchQuests();
    window.addEventListener('questUpdate', handleQuestUpdate);
    return () => window.removeEventListener('questUpdate', handleQuestUpdate);
  }, []);

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
          {quests.map((quest, index) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              key={quest.id} 
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-4 p-3.5 rounded-2xl border border-border/50 bg-surface-hover/50 hover:bg-surface hover:border-orange-500/30 transition-all shadow-sm hover:shadow-md cursor-pointer">
                <div className="shrink-0 transition-transform group-hover:scale-110">
                  {quest.isCompleted ? (
                    <CheckCircle2 className="text-emerald-500 drop-shadow-sm" size={24} strokeWidth={2.5} />
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
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(quest.currentValue / quest.targetValue) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${quest.isCompleted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'}`} 
                      />
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground w-8 text-right tabular-nums">
                      {quest.currentValue}/{quest.targetValue}
                    </span>
                  </div>
                </div>
                <div className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${quest.isCompleted ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'}`}>
                  +{quest.xpReward} XP
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
