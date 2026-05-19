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
  Loader2,
  Plus,
  Swords
} from 'lucide-react';
import { getProfile } from '@/features/auth/services/auth.service';
import { groupsService } from '@/features/groups/services/groups.service';
import { Group } from '@/features/groups/types/groups.types';

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
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

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

  useEffect(() => {
    if (role === 'teacher') {
      setLoadingGroups(true);
      groupsService.getGroups()
        .then((res) => {
          setGroups(res.data || []);
        })
        .catch((err) => {
          console.error('Failed to load groups for dashboard', err);
        })
        .finally(() => {
          setLoadingGroups(false);
        });
    }
  }, [role]);

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
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">My Classes</h3>
                  <p className="text-slate-500 text-sm">Select a class to manage or start a Live Battle.</p>
                </div>
                <button 
                  onClick={() => router.push('/dashboard/groups')}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus size={14} /> Create Class
                </button>
              </div>

              {loadingGroups ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="animate-spin text-emerald-500" size={24} />
                </div>
              ) : groups.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="mx-auto text-slate-300 mb-3" size={36} />
                  <p className="text-slate-500 font-medium text-sm">No classes created yet</p>
                  <button 
                    onClick={() => router.push('/dashboard/groups')}
                    className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-200"
                  >
                    Create Your First Class
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groups.map((group) => (
                    <div 
                      key={group.id}
                      onClick={() => router.push(`/dashboard/groups?groupId=${group.id}`)}
                      className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:shadow-md hover:bg-white transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex gap-3 items-start mb-3">
                          {(group as any).avatar ? (
                            <img 
                              src={(group as any).avatar} 
                              alt={group.title} 
                              className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
                              {group.title[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-slate-950 group-hover:text-emerald-600 transition truncate pr-2 text-base">
                                {group.title}
                              </h4>
                              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0">
                                Active
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {group.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-100/60 mt-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Click to manage &rarr;
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/dashboard/battle');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white hover:bg-emerald-600 font-bold rounded-lg text-xs transition-colors shadow-sm"
                        >
                          <Swords size={12} /> Battle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
