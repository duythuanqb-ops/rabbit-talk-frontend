'use client';

import { useState, useEffect, useRef } from 'react';
import { UserCircle, Mail, Calendar, Edit3, Settings, Shield, Award, Flame, Star, Loader2 } from 'lucide-react';
import { getProfile, uploadCover } from '@/features/auth/services/auth.service';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/shared/utils/motion';
import ImageCropperModal from '@/features/dashboard/components/teacher/ImageCropperModal';


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

import { User } from '@/shared/types/api.types';

interface ProfileUser extends User {
  cover_url?: string | null;
  created_at?: string;
}

interface Achievement {
  id?: string;
  title: string;
  desc?: string;
  description?: string;
  icon: string;
  bg?: string;
  bg_color?: string;
}

interface ProfileStats {
  dayStreak: number;
  xp: number;
  league: string;
  achievements?: Achievement[];
}


export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [coverToCrop, setCoverToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    
    const url = URL.createObjectURL(file);
    setCoverToCrop(url);
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCroppedCover = async (croppedFile: File) => {
    try {
      setUploadingCover(true);
      const res = await uploadCover(croppedFile) as { data?: { cover_url?: string }; cover_url?: string };
      const newCoverUrl = res.data?.cover_url || res.cover_url;
      setUser((prev) => prev ? ({ ...prev, cover_url: newCoverUrl }) : null);
      setCoverToCrop(null);
    } catch (err) {
      console.error('Failed to upload cover', err);
    } finally {
      setUploadingCover(false);
    }
  };

  useEffect(() => {
    Promise.all([
      getProfile(),
      dashboardService.getProfileStats()
    ])
      .then(([userRes, statsRes]) => {
        const u = (userRes as { data?: ProfileUser }).data ?? (userRes as ProfileUser);
        setUser(u);
        setStats((statsRes as { data: ProfileStats }).data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch profile', err);
        setLoading(false);
      });
  }, []);

  const currentStats = stats ? [
    {
      label: 'Day Streak',
      value: `${stats.dayStreak} Days`,
      icon: Flame,
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      color: 'text-orange-500',
    },
    {
      label: 'Total XP',
      value: stats.xp.toLocaleString(),
      icon: Star,
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'League',
      value: stats.league,
      icon: Shield,
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      color: 'text-blue-500 dark:text-blue-400',
    },
  ] : STATS;
  
  const currentAchievements = stats?.achievements || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto space-y-6"
      >
        {}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] ring-1 ring-slate-100 dark:ring-slate-700 overflow-hidden"
        >
          {}
          <div 
            className="h-32 bg-gradient-to-r from-emerald-400 to-teal-500 relative bg-cover bg-center"
            style={user?.cover_url ? { backgroundImage: `url(${user.cover_url})` } : {}}
          >
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleCoverUpload}
              disabled={uploadingCover}
            />
            <button
              aria-label="Edit profile"
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition backdrop-blur-sm"
            >
              {uploadingCover ? <Loader2 size={18} className="animate-spin" /> : <Edit3 size={18} />}
            </button>
          </div>

          {}
          <div className="px-4 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-12 relative z-10">
              {}
              <div className="w-24 h-24 bg-white dark:bg-slate-700 rounded-full p-1 shadow-md">
                <div className="w-full h-full bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                  {user?.first_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>

              {}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Unknown User'}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2 mt-1 text-sm">
                  <Mail size={14} /> {user?.email || 'No email provided'}
                </p>
              </div>

              {}
              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                  Share Profile
                </button>
                <button aria-label="Settings" className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700">
              {currentStats.map(({ label, value, icon: Icon, bg, color }) => (
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

        {}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {}
          <motion.div
            variants={itemVariants}
            className="md:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] ring-1 ring-slate-100 dark:ring-slate-700 p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="text-emerald-500" />
              Recent Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentAchievements.length > 0 ? (
                currentAchievements.map((ach: Achievement) => (
                  <div
                    key={ach.id || ach.title}
                    className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-700/30 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${ach.bg_color || ach.bg || 'bg-slate-100'}`}>
                      {ach.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{ach.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ach.description || ach.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 p-6 text-center text-slate-500">
                  No achievements yet. Keep learning to earn some!
                </div>
              )}
            </div>
          </motion.div>

          {}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] ring-1 ring-slate-100 dark:ring-slate-700 p-6"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserCircle className="text-blue-500" />
              About Me
            </h3>
            <div className="space-y-4">
              {}
              <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                <Calendar size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                <span>Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}</span>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {user?.bio || "No bio available. Update your profile to tell everyone about yourself!"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

      </motion.div>

      {coverToCrop && (
        <ImageCropperModal
          imageSrc={coverToCrop}
          onClose={() => setCoverToCrop(null)}
          onCropComplete={handleCroppedCover}
          aspect={7}
          title="Position Cover Photo"
        />
      )}
    </>
  );
}
