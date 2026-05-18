'use client';

import { DashboardLayout } from '@/features/dashboard/components';
import { TeacherGroupManager } from '@/features/dashboard/components';
import { Users, Search, Plus, UserPlus, GraduationCap, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/features/auth/services/auth.service';

export default function GroupsPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const [studentTab, setStudentTab] = useState<'classes' | 'friends'>('classes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((res) => {
        const user = res.data || res;
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          setRole(user.role || 'student');
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch profile', err);
        setRole('student');
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
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-emerald-500" />
            {role === 'student' ? 'Community & Classes' : 'My Groups'}
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            {role === 'student' ? 'View your classes and connect with friends.' : 'Manage your classes and students.'}
          </p>
        </div>
      </div>

      {role === 'teacher' ? (
        <TeacherGroupManager />
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex gap-4 border-b border-slate-100 w-full md:w-auto">
                 <button 
                   onClick={() => setStudentTab('classes')}
                   className={`pb-3 text-sm font-bold transition-colors ${studentTab === 'classes' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   My Classes
                 </button>
                 <button 
                   onClick={() => setStudentTab('friends')}
                   className={`pb-3 text-sm font-bold transition-colors ${studentTab === 'friends' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                   Find Friends
                 </button>
              </div>
           </div>
           
           {studentTab === 'classes' ? (
             <div>
               <p className="text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                 <GraduationCap size={16} className="text-emerald-500" />
                 You can only be added to classes by your teacher.
               </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Spanish Beginners', members: 12, instructor: 'Prof. Rossi', progress: 75, color: 'emerald', isLive: true },
                    { name: 'Advanced English', members: 24, instructor: 'Ms. Smith', progress: 40, color: 'blue', isLive: false },
                  ].map((g, i) => (
                    <div key={i} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-emerald-200 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden">
                      {g.isLive && (
                        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-sm flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                          LIVE BATTLE
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-4 mt-2">
                        <div>
                          <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition">{g.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">by {g.instructor}</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <Users size={16} className={`text-${g.color}-500`} />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500">
                        <span className="flex items-center gap-1"><Users size={12}/> {g.members}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                        <div className={`h-full bg-${g.color}-500 rounded-full transition-all`} style={{width: `${g.progress}%`}}></div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-slate-500 font-medium">{g.progress}% completed</p>
                        {g.isLive && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); window.location.href = '/dashboard/battle'; }}
                             className="text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 px-2 py-1 rounded-md transition-colors"
                           >
                             Join Now &rarr;
                           </button>
                        )}
                      </div>
                    </div>
                  ))}
               </div>
             </div>
           ) : (
             <div>
               <div className="flex gap-2 w-full max-w-md mb-6">
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="text" placeholder="Search friends by name or username..." className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                 </div>
                 <button className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl text-sm hover:bg-emerald-600 transition shadow-lg shadow-emerald-200">
                   Search
                 </button>
               </div>
               
               <div className="space-y-3">
                 {[
                   { name: 'Michael Scott', username: '@mscott', mutual: 3, avatar: 'MS' },
                   { name: 'Jim Halpert', username: '@jhalpert', mutual: 1, avatar: 'JH' },
                   { name: 'Pam Beesly', username: '@pbeesly', mutual: 5, avatar: 'PB' },
                 ].map((user, i) => (
                   <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                         {user.avatar}
                       </div>
                       <div>
                         <div className="font-bold text-slate-800">{user.name} <span className="font-normal text-slate-500 text-sm ml-1">{user.username}</span></div>
                         <div className="text-xs text-slate-500 mt-0.5">{user.mutual} mutual friends</div>
                       </div>
                     </div>
                     <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-lg text-xs hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                       <UserPlus size={14} /> Add Friend
                     </button>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>
      )}
    </DashboardLayout>
  );
}
