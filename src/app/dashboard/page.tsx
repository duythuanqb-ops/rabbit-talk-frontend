'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/features/dashboard/components';
import { StatCard } from '@/features/dashboard/components';
import { Leaderboard } from '@/features/dashboard/components';
import { AttendanceTracker } from '@/features/dashboard/components';
import { VocabularyWidget } from '@/features/dashboard/components';
import { TeacherGroupManager } from '@/features/dashboard/components';
import { DailyQuests } from '@/features/dashboard/components';
import { UpcomingAssignments } from '@/features/dashboard/components';
import { NeedsAttention } from '@/features/dashboard/components';
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

  useEffect(() => {
    getProfile()
      .then((res) => {
        const user = res.data || res;
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          setRole(user.role || 'student');
          setUserName(user.first_name || user.username || 'User');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch profile', err);
        setRole('student');
        setUserName('User');
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Good morning, {role === 'student' ? `${userName}!` : `Professor ${userName}!`} 👋
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            {role === 'student' 
              ? "You're on an 18-day streak! Keep up the great work." 
              : "Here's what's happening with your classes today."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {role === 'student' ? (
          <>
            <StatCard title="Total XP" value="12,450" icon={Star} color="orange" trend="+12% this week" trendType="up" />
            <StatCard title="Words Learned" value="842" icon={BookOpen} color="emerald" trend="+45 today" trendType="up" />
            <StatCard title="Current Rank" value="#4" icon={Trophy} color="blue" trend="Top 5%" trendType="up" />
            <StatCard title="Day Streak" value="18" icon={Flame} color="purple" trend="New record!" trendType="up" />
          </>
        ) : (
          <>
            <StatCard title="Total Students" value="28" icon={Users} color="blue" />
            <StatCard title="Avg. Progress" value="76%" icon={Star} color="emerald" trend="+2% today" trendType="up" />
            <StatCard title="Pending Exams" value="3" icon={FileText} color="orange" />
            <StatCard title="Weekly Engagement" value="85%" icon={Clock} color="purple" trendType="neutral" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {role === 'student' ? (
            <>
              <UpcomingAssignments />
              <AttendanceTracker />
              <VocabularyWidget />
            </>
          ) : (
            <TeacherGroupManager />
          )}
        </div>
        
        <div className="space-y-8">
          {role === 'student' ? (
            <DailyQuests />
          ) : (
            <NeedsAttention />
          )}
          
          <Leaderboard 
            title={role === 'student' ? "Friend Leaderboard" : "Top Students"} 
            items={mockLeaderboard} 
          />
          
          <div className="bg-gradient-to-br from-emerald-500 to-lime-400 p-6 rounded-2xl text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">Upgrade to Pro</h4>
              <p className="text-white/80 text-sm mb-4">Get unlimited exams and advanced AI vocabulary coaching.</p>
              <button className="bg-white text-emerald-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors">
                Learn More
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
