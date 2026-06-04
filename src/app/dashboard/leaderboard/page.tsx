'use client';

import { Trophy, Star, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants, scaleUpVariants } from '@/shared/utils/motion';

// ─── Mock Data (replace with API calls) ───────────────────────────────────────
const TOP3_USERS = [
  { rank: 2, name: 'Sarah K.', points: 2310, avatar: 'SK', color: 'bg-slate-300 text-slate-800' },
  { rank: 1, name: 'Leo Chen', points: 2450, avatar: 'LC', color: 'bg-yellow-400 text-yellow-900' },
  { rank: 3, name: 'Ben W.',   points: 2240, avatar: 'BW', color: 'bg-orange-400 text-orange-900' },
];

const REST_USERS = [
  { rank: 4, name: 'Chloe M.', points: 2195, streak: 12 },
  { rank: 5, name: 'Alex R.',  points: 2100, streak: 5  },
  { rank: 6, name: 'David L.', points: 1950, streak: 8  },
  { rank: 7, name: 'Emma S.',  points: 1820, streak: 3  },
  { rank: 8, name: 'James T.', points: 1750, streak: 2  },
];

const PODIUM_HEIGHT: Record<number, string> = {
  1: 'from-yellow-400 to-yellow-200 h-32 md:h-40',
  2: 'from-slate-400  to-slate-200  h-24 md:h-28',
  3: 'from-orange-400 to-orange-200 h-16 md:h-20',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LeaderboardPage() {
  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="show">

        {/* Header */}
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

          {/* Scope toggle */}
          <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto overflow-hidden">
            <button className="flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm transition-all">
              Global
            </button>
            <button className="flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 transition-all hover:text-slate-700 dark:hover:text-white">
              Friends
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="max-w-3xl mx-auto mt-12">
          {/* Podium */}
          <div className="flex justify-center items-end gap-2 md:gap-6 mb-8 md:mb-12 h-56 md:h-64 pt-12">
            {TOP3_USERS.map((user) => (
              <motion.div
                key={user.rank}
                variants={itemVariants}
                className="flex flex-col items-center relative w-24 md:w-32"
              >
                {user.rank === 1 && (
                  <Trophy className="text-yellow-500 absolute -top-10 md:-top-12 z-20" size={32} />
                )}

                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center font-bold text-sm md:text-lg border-4 border-white dark:border-slate-800 shadow-xl z-10 ${user.color}`}>
                  {user.avatar}
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

          {/* Rankings list */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
          >
            {REST_USERS.map((user, idx) => (
              <motion.div
                key={user.rank}
                variants={itemVariants}
                className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  idx !== REST_USERS.length - 1 ? 'border-b border-slate-50 dark:border-slate-700' : ''
                }`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-6 md:w-8 text-center font-bold text-slate-400 dark:text-slate-500 text-sm md:text-base">
                    {user.rank}
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center font-bold text-xs md:text-sm">
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
