'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Loader2 } from 'lucide-react';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants, scaleUpVariants } from '@/shared/utils/motion';
import Image from 'next/image';




const PODIUM_HEIGHT: Record<number, string> = {
  1: 'from-yellow-400 to-yellow-200 h-32 md:h-40',
  2: 'from-slate-400  to-slate-200  h-24 md:h-28',
  3: 'from-orange-400 to-orange-200 h-16 md:h-20',
};

interface LeaderboardUser {
  rank: number;
  name: string;
  xp?: number;
  points?: number;
  avatar?: string;
  streak?: number;
}


export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'Global' | 'Friends'>('Global');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    setTimeout(() => setLoading(true), 0);
    dashboardService.getLeaderboard(activeTab.toLowerCase() as 'global' | 'friends')
      .then(res => {
        const data = (res as { data?: LeaderboardUser[] }).data ?? (res as LeaderboardUser[]);
        setUsers(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab]);

  const top3 = users.slice(0, 3).map((u: LeaderboardUser) => ({
    rank: u.rank,
    name: u.name,
    points: u.xp || u.points,
    avatar: u.avatar || u.name.substring(0, 2).toUpperCase(),
    color: u.rank === 1 ? 'bg-yellow-400 text-yellow-900' : u.rank === 2 ? 'bg-slate-300 text-slate-800' : 'bg-orange-400 text-orange-900'
  })).sort((a, b) => {
    
    if (a.rank === 2 && b.rank === 1) return -1;
    if (a.rank === 1 && b.rank === 2) return 1;
    if (a.rank === 3) return 1;
    return 0;
  });
  const rest = users.slice(3).map((u: LeaderboardUser) => ({
    rank: u.rank,
    name: u.name,
    points: u.xp || u.points,
    streak: u.streak || 0
  }));

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="show">

        {}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Trophy className="text-yellow-500" />
              Leaderboard
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
              Compete with friends and learners worldwide.
            </p>
          </div>

          {}
          <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto overflow-hidden">
            <button 
              onClick={() => setActiveTab('Global')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'Global' 
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              Global
            </button>
            <button 
              onClick={() => setActiveTab('Friends')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'Friends' 
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              Friends
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="max-w-3xl mx-auto mt-12">
          <div className="flex justify-center items-end gap-2 md:gap-6 mb-8 md:mb-12 h-56 md:h-64 pt-12">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
              </div>
            ) : top3.map((user) => (
              <motion.div
                key={user.rank}
                variants={itemVariants}
                className="flex flex-col items-center relative w-24 md:w-32"
              >
                {user.rank === 1 && (
                  <Trophy className="text-yellow-500 absolute -top-10 md:-top-12 z-20" size={32} />
                )}

                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-sm md:text-lg border-4 border-white dark:border-slate-800 shadow-xl z-10 ${user.color} overflow-hidden`}>
                  {user.avatar.length > 2 && user.avatar.startsWith('http') ? (
                    <Image unoptimized src={user.avatar} alt={user.name} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    user.avatar
                  )}
                </div>

                <div className="mt-2 text-center z-10">
                  <div className="font-bold text-slate-900 dark:text-white text-xs md:text-sm whitespace-nowrap">
                    {user.name}
                  </div>
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                    <Star size={10} className="fill-current" /> {user.points}
                  </div>
                </div>

                <motion.div
                  variants={scaleUpVariants}
                  style={{ transformOrigin: 'bottom' }}
                  className={`w-full mt-4 rounded-t-xl bg-gradient-to-t shadow-[0_0_20px_rgba(0,0,0,0.1)] relative overflow-hidden ${PODIUM_HEIGHT[user.rank]}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-50" />
                  <div className="text-center font-bold text-white/80 mt-4 text-3xl relative z-10 drop-shadow-md">
                    {user.rank}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
          >
            {!loading && rest.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No other learners found. Invite some friends!
              </div>
            )}
            {rest.map((user, idx) => (
              <motion.div
                key={user.rank}
                variants={itemVariants}
                className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  idx !== rest.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-6 md:w-8 text-center font-bold text-slate-400 dark:text-slate-500 text-sm md:text-base">
                    {user.rank}
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-xs md:text-sm overflow-hidden">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base">
                    {user.name}
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                  <div className="hidden sm:flex items-center gap-1 text-sm font-bold text-orange-500">
                    <Flame size={16} className="fill-current" /> {user.streak}
                  </div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 w-16 md:w-20 text-right">
                    {user.points} XP
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </motion.div>
    </>
  );
}
