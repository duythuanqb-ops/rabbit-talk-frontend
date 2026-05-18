'use client';

import { DashboardLayout } from '@/features/dashboard/components';
import { Trophy, Star, Flame } from 'lucide-react';

const mockTop3 = [
  { rank: 2, name: 'Sarah K.', points: 2310, avatar: 'SK', color: 'bg-slate-300' },
  { rank: 1, name: 'Leo Chen', points: 2450, avatar: 'LC', color: 'bg-yellow-400' },
  { rank: 3, name: 'Ben W.', points: 2240, avatar: 'BW', color: 'bg-amber-600' },
];

const mockRest = [
  { rank: 4, name: 'Chloe M.', points: 2195, streak: 12 },
  { rank: 5, name: 'Alex R.', points: 2100, streak: 5 },
  { rank: 6, name: 'David L.', points: 1950, streak: 8 },
  { rank: 7, name: 'Emma S.', points: 1820, streak: 3 },
  { rank: 8, name: 'James T.', points: 1750, streak: 2 },
];

export default function LeaderboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Compete with friends and learners worldwide.</p>
        </div>
        <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200 w-full md:w-auto overflow-hidden">
          <button className="flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold bg-white text-emerald-600 shadow-sm transition-all">Global</button>
          <button className="flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold text-slate-500 transition-all hover:text-slate-700">Friends</button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-12">
        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-2 md:gap-6 mb-8 md:mb-12 h-56 md:h-64 pt-12">
          {mockTop3.map((user) => (
            <div key={user.rank} className="flex flex-col items-center relative w-24 md:w-32">
              {user.rank === 1 && <Trophy className="text-yellow-500 absolute -top-10 md:-top-12 z-20" size={32} />}
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-lg border-4 border-white shadow-lg z-10 ${user.color}`}>
                {user.avatar}
              </div>
              <div className="mt-2 text-center z-10">
                <div className="font-bold text-slate-900 text-xs md:text-sm whitespace-nowrap">{user.name}</div>
                <div className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                  <Star size={10} className="fill-current" /> {user.points}
                </div>
              </div>
              <div 
                className={`w-full mt-4 rounded-t-xl bg-gradient-to-t shadow-inner ${user.rank === 1 ? 'from-yellow-200 to-yellow-100 h-32 md:h-40' : user.rank === 2 ? 'from-slate-200 to-slate-100 h-24 md:h-28' : 'from-amber-200 to-amber-100 h-16 md:h-20'}`}
              >
                <div className="text-center font-bold text-white/50 mt-4 text-3xl">{user.rank}</div>
              </div>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {mockRest.map((user, idx) => (
            <div key={user.rank} className={`flex items-center justify-between p-4 ${idx !== mockRest.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50 transition-colors`}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-6 md:w-8 text-center font-bold text-slate-400 text-sm md:text-base">{user.rank}</div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
                  {user.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="font-bold text-slate-800 text-sm md:text-base">{user.name}</div>
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="hidden sm:flex items-center gap-1 text-sm font-bold text-orange-500">
                  <Flame size={16} className="fill-current" /> {user.streak}
                </div>
                <div className="text-sm font-bold text-emerald-600 w-16 md:w-20 text-right">
                  {user.points} XP
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
