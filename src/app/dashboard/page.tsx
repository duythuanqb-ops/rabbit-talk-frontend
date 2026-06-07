'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/shared/utils/motion';
import { StatCard } from '@/features/dashboard/components';
import { Leaderboard } from '@/features/dashboard/components';
import { AttendanceTracker } from '@/features/dashboard/components';
import { VocabularyWidget } from '@/features/dashboard/components';
import { DailyQuests } from '@/features/dashboard/components';
import { UpcomingAssignments } from '@/features/dashboard/components';
import { NeedsAttention } from '@/features/dashboard/components';
import { TeacherClassesWidget } from '@/features/dashboard/components';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Star, 
  Flame,
  FileText,
  Clock,
  Loader2
} from 'lucide-react';
import { getProfile } from '@/features/auth/services/auth.service';
import { dashboardService } from '@/features/dashboard/services/dashboard.service';

interface DashboardStats {
  totalStudents?: number;
  avgProgress?: number;
  pendingExams?: number;
  weeklyEngagement?: number;
  totalXp?: number;
  wordsLearned?: number;
  currentRank?: number;
  dayStreak?: number;
}

const mockLeaderboard = [
  { id: '1', name: 'Leo Chen', points: 2450, rank: 1 },
  { id: '2', name: 'Sarah K.', points: 2310, rank: 2 },
  { id: '3', name: 'Ben W.', points: 2240, rank: 3 },
  { id: '4', name: 'Chloe M.', points: 2195, rank: 4 },
  { id: '5', name: 'Alex R.', points: 2100, rank: 5 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ id: string; name: string; points: number; rank: number }[]>([]);

  const fetchStats = () => {
    getProfile().then(res => {
      const user = res.data || res;
      if (user.role === 'teacher') {
        dashboardService.getTeacherStats().then(res => setStats(res.data)).catch(console.error);
      } else {
        dashboardService.getStudentStats().then(res => setStats(res.data)).catch(console.error);
      }
      dashboardService.getLeaderboard().then(res => setLeaderboard(res.data)).catch(console.error);
    }).catch(console.error);
  };

  useEffect(() => {
    getProfile()
      .then((res) => {
        const user = res.data || res;
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          setRole(user.role || 'student');
          setUserName(user.first_name || user.username || 'User');
          
          if (user.role === 'teacher') {
            dashboardService.getTeacherStats().then(res => setStats(res.data)).catch(console.error);
          } else {
            dashboardService.getStudentStats().then(res => setStats(res.data)).catch(console.error);
          }
          dashboardService.getLeaderboard().then(res => setLeaderboard(res.data)).catch(console.error);
          
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch profile', err);
        setRole('student');
        setUserName('User');
        setLoading(false);
      });

    const handleQuestUpdate = () => fetchStats();
    window.addEventListener('questUpdate', handleQuestUpdate);
    return () => window.removeEventListener('questUpdate', handleQuestUpdate);
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Good morning, {role === 'student' ? `${userName}!` : `Professor ${userName}!`} 👋
            </h1>
            <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
              {role === 'student' 
                ? stats?.dayStreak && stats.dayStreak > 0 ? `You're on an ${stats.dayStreak}-day streak! Keep up the great work.` : "Ready to learn? Let's start your streak today!"
                : "Here's what's happening with your classes today."}
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {role === 'student' ? (
            <>
              <StatCard title="Total XP" value={stats?.totalXp?.toLocaleString() || "0"} icon={Star} color="orange" trend="Keep it up!" trendType="up" />
              <StatCard title="Words Learned" value={stats?.wordsLearned?.toString() || "0"} icon={BookOpen} color="emerald" trend="Great job!" trendType="up" />
              <StatCard title="Current Rank" value={`#${stats?.currentRank || 1}`} icon={Trophy} color="blue" trend="Top 5%" trendType="up" />
              <StatCard title="Day Streak" value={stats?.dayStreak?.toString() || "0"} icon={Flame} color="purple" trend="Keep learning!" trendType="up" />
            </>
          ) : (
            <>
              <StatCard title="Total Students" value={stats?.totalStudents?.toString() || "0"} icon={Users} color="blue" />
              <StatCard title="Avg. Progress" value={`${stats?.avgProgress || 0}%`} icon={Star} color="emerald" trend="+2% today" trendType="up" />
              <StatCard title="Pending Exams" value={stats?.pendingExams?.toString() || "0"} icon={FileText} color="orange" />
              <StatCard title="Weekly Engagement" value={`${stats?.weeklyEngagement || 0}%`} icon={Clock} color="purple" trendType="neutral" />
            </>
          )}
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {role === 'student' ? (
              <>
                <motion.div variants={itemVariants}><UpcomingAssignments /></motion.div>
                <motion.div variants={itemVariants}><AttendanceTracker /></motion.div>
                <motion.div variants={itemVariants}><VocabularyWidget /></motion.div>
              </>
            ) : (
              <motion.div variants={itemVariants}>
                <TeacherClassesWidget />
              </motion.div>
            )}
          </div>
          
          <div className="space-y-8">
            {role === 'student' ? (
              <motion.div variants={itemVariants}><DailyQuests /></motion.div>
            ) : (
              <motion.div variants={itemVariants}><NeedsAttention /></motion.div>
            )}
            
            <motion.div variants={itemVariants}>
              <Leaderboard 
                title={role === 'student' ? "Friend Leaderboard" : "Top Students"} 
                items={leaderboard.length > 0 ? leaderboard : mockLeaderboard} 
              />
            </motion.div>
            

          </div>
        </div>
      </motion.div>
  );
}
