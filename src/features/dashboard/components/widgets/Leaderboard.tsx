import { Trophy, Medal, Award } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/shared/utils/cn';
interface LeaderboardItem {
  id: string;
  name: string;
  points: number;
  avatar?: string;
  rank: number;
}

interface LeaderboardProps {
  title: string;
  items: LeaderboardItem[];
}

export function Leaderboard({ title, items }: LeaderboardProps) {
  return (
    <div className="double-bezel">
      <div className="double-bezel-inner bg-surface overflow-hidden hover:shadow-lg transition-fluid">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 ring-1 ring-amber-500/20">
              <Trophy size={16} strokeWidth={2} />
            </div>
            {title}
          </h3>
          <button className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:underline decoration-emerald-500/30 underline-offset-4">View All</button>
        </div>
        <div className="divide-y divide-border/40">
          {items.map((item, index) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-surface-hover transition-colors group cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center gap-4">
                <div className="w-10 text-center font-bold text-muted-foreground flex justify-center">
                  {item.rank === 1 && <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-500 rounded-lg ring-1 ring-amber-500/20 group-hover:scale-110 transition-transform"><Medal size={18} strokeWidth={2} /></div>}
                  {item.rank === 2 && <div className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg ring-1 ring-slate-500/20 group-hover:scale-110 transition-transform"><Medal size={18} strokeWidth={2} /></div>}
                  {item.rank === 3 && <div className="p-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-600 rounded-lg ring-1 ring-amber-700/20 group-hover:scale-110 transition-transform"><Medal size={18} strokeWidth={2} /></div>}
                  {item.rank > 3 && <span className="text-sm">{item.rank}</span>}
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-hover overflow-hidden ring-2 ring-transparent group-hover:ring-emerald-500/30 transition-all">
                  {item.avatar ? (
                    <Image src={item.avatar} alt={item.name} width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-bold bg-surface-hover">
                      {item.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{item.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">{item.points.toLocaleString()} XP</p>
                </div>
              </div>
              <Award className={cn("transition-transform group-hover:scale-110 group-hover:-rotate-12", item.rank <= 3 ? "text-emerald-500" : "text-muted-foreground/30")} size={20} strokeWidth={1.5} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
