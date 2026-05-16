'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { Leaderboard } from '@/features/dashboard/components/Leaderboard';
import { AttendanceTracker } from '@/features/dashboard/components/AttendanceTracker';
import { VocabularyWidget } from '@/features/dashboard/components/VocabularyWidget';
import { TeacherGroupManager } from '@/features/dashboard/components/TeacherGroupManager';
import { DailyQuests } from '@/features/dashboard/components/DailyQuests';
import { UpcomingAssignments } from '@/features/dashboard/components/UpcomingAssignments';
import { NeedsAttention } from '@/features/dashboard/components/NeedsAttention';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  Star, 
  Flame,
  FileText,
  Clock
} from 'lucide-react';

const mockLeaderboard = [
  { id: '1', name: 'Leo Chen', points: 2450, rank: 1 },
  { id: '2', name: 'Sarah K.', points: 2310, rank: 2 },
  { id: '3', name: 'Ben W.', points: 2240, rank: 3 },
  { id: '4', name: 'Chloe M.', points: 2195, rank: 4 },
  { id: '5', name: 'Alex R.', points: 2100, rank: 5 },
];

export default function DashboardPage() {
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Good morning, {role === 'student' ? 'Leo!' : 'Professor Rossi!'} 👋
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            {role === 'student' 
              ? "You're on an 18-day streak! Keep up the great work." 
              : "Here's what's happening with your classes today."}
          </p>
        </div>
        
        {/* Simple Role Toggle for Demo */}
        <div className="flex bg-slate-200/50 p-1 rounded-xl border border-slate-200 w-full md:w-auto self-stretch md:self-auto overflow-hidden">
          <button 
            onClick={() => setRole('student')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${role === 'student' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            Student View
          </button>
          <button 
            onClick={() => setRole('teacher')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${role === 'teacher' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            Teacher View
          </button>
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
