import { Trophy, Medal, Award } from 'lucide-react';
import Image from 'next/image';

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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <h3 className="font-bold text-slate-900 flex items-center gap-2">
          <Trophy className="text-amber-400" size={20} />
          {title}
        </h3>
        <button className="text-emerald-600 text-sm font-medium hover:underline">View All</button>
      </div>
      <div className="divide-y divide-slate-50">
        {items.map((item) => (
          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-8 text-center font-bold text-slate-400">
                {item.rank === 1 && <Medal className="text-amber-400 mx-auto" size={20} />}
                {item.rank === 2 && <Medal className="text-slate-400 mx-auto" size={20} />}
                {item.rank === 3 && <Medal className="text-amber-700 mx-auto" size={20} />}
                {item.rank > 3 && item.rank}
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                {item.avatar ? (
                  <Image src={item.avatar} alt={item.name} width={40} height={40} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                    {item.name[0]}
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                <p className="text-xs text-slate-400">{item.points.toLocaleString()} XP</p>
              </div>
            </div>
            <Award className={item.rank <= 3 ? "text-emerald-500" : "text-slate-200"} size={20} />
          </div>
        ))}
      </div>
    </div>
  );
}
