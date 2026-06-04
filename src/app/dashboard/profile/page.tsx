'use client';

import { UserCircle, Mail, MapPin, Calendar, Edit3, Settings, Shield, Award, Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/shared/utils/motion';

// ─── Static Data (replace with real user data from context/API) ───────────────
const STATS = [
  {
    label: 'Day Streak',
    value: '18 Days',
    icon: Flame,
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    color: 'text-orange-500',
  },
  {
    label: 'Total XP',
    value: '12,450',
    icon: Star,
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    label: 'League',
    value: 'Diamond',
    icon: Shield,
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    color: 'text-blue-500 dark:text-blue-400',
  },
] as const;

const ACHIEVEMENTS = [
  { title: 'Early Bird',    desc: 'Completed a lesson before 8 AM', icon: '🌅', bg: 'bg-orange-100  dark:bg-orange-900/20'  },
  { title: 'Vocab Master',  desc: 'Learned 500 new words',           icon: '🧠', bg: 'bg-purple-100  dark:bg-purple-900/20'  },
  { title: 'Unstoppable',   desc: 'Reached a 14-day streak',         icon: '🔥', bg: 'bg-red-100     dark:bg-red-900/20'     },
  { title: 'Perfect Score', desc: '100% on a grammar test',          icon: '💯', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* ── Profile Header ── */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] ring-1 ring-slate-100 dark:ring-slate-700 overflow-hidden"
        >
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-emerald-400 to-teal-500 relative">
            <button
              aria-label="Edit profile"
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition backdrop-blur-sm"
            >
              <Edit3 size={18} />
            </button>
          </div>

          {/* Info row */}
          <div className="px-4 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-12 relative z-10">
              {/* Avatar */}
              <div className="w-24 h-24 bg-white dark:bg-slate-700 rounded-full p-1 shadow-md">
                <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                  LC
                </div>
              </div>

              {/* Name & email */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leo Chen</h1>
                <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2 mt-1 text-sm">
                  <Mail size={14} /> leo.chen@example.com
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                  Share Profile
                </button>
                <button aria-label="Settings" className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
              {STATS.map(({ label, value, icon: Icon, bg, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`p-3 ${bg} ${color} rounded-xl`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">{label}</div>
                    <div className="font-bold text-slate-900 dark:text-white text-lg">{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Achievements & About ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Achievements */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] ring-1 ring-slate-100 dark:ring-slate-700 p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="text-emerald-500" />
              Recent Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.title}
                  className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${ach.bg}`}>
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{ach.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* About Me */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] ring-1 ring-slate-100 dark:ring-slate-700 p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCircle className="text-blue-500" />
              About Me
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <MapPin size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <span>Hanoi, Vietnam</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Calendar size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <span>Joined May 2026</span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Passionate about learning languages and exploring new cultures. Currently focusing on Spanish and French. Let&apos;s learn together! 🌟
                </p>
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>
    </>
  );
}
