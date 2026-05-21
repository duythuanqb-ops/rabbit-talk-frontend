'use client';

import { DashboardLayout } from '@/features/dashboard/components';
import { TeacherGroupManager } from '@/features/dashboard/components';
import { Users, GraduationCap, Loader2, X, Calendar, BookOpen, User } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/features/auth/services/auth.service';
import { groupsService } from '@/features/groups/services/groups.service';

export default function GroupsPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    getProfile()
      .then((res) => {
        const user = res.data || res;
        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else {
          setRole(user.role || 'student');
          if (user.role === 'student') {
            groupsService.getGroups()
              .then((groupRes) => {
                const groupData = groupRes.data || groupRes || [];
                setGroups(Array.isArray(groupData) ? groupData : []);
                setLoading(false);
              })
              .catch((err) => {
                console.error('Failed to fetch student groups', err);
                setLoading(false);
              });
          } else {
            setLoading(false);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch profile', err);
        setRole('student');
        setLoading(false);
      });
  }, [router]);

  useEffect(() => {
    if (selectedGroup) {
      setLoadingMembers(true);
      groupsService.getGroupMembers(selectedGroup.id)
        .then((res) => {
          const memberData = res.data || res || [];
          setMembers(Array.isArray(memberData) ? memberData : []);
          setLoadingMembers(false);
        })
        .catch((err) => {
          console.error('Failed to fetch group members', err);
          setLoadingMembers(false);
        });
    } else {
      setMembers([]);
    }
  }, [selectedGroup]);

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
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>}>
          <TeacherGroupManager />
        </Suspense>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
             <div>
               <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-2">
                 <GraduationCap size={16} className="text-emerald-500" />
                 You can only be added to classes by your teacher.
               </p>

               {groups.length === 0 ? (
                 <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50 max-w-md mx-auto">
                   <Users className="mx-auto text-slate-300 mb-4" size={48} />
                   <h3 className="text-lg font-bold text-slate-900 mb-1">No classes found</h3>
                   <p className="text-sm text-slate-500 px-6">
                     You are not enrolled in any groups yet. Ask your teacher to add you using your email.
                   </p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {groups.map((g, i) => {
                     const colors = ['emerald', 'blue', 'orange', 'indigo', 'rose', 'amber'];
                     const color = colors[i % colors.length];
                     return (
                       <div 
                         key={g.id} 
                         onClick={() => setSelectedGroup(g)}
                         className="p-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:border-emerald-200 hover:shadow-md transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between"
                       >
                         <div>
                           <div className="flex justify-between items-start mb-4">
                             <div>
                               <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition text-lg">{g.title}</h3>
                               <p className="text-xs text-slate-500 mt-1 font-medium">by {g.instructor || 'Teacher'}</p>
                             </div>
                             <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                               {g.avatar ? (
                                 <img src={g.avatar} alt={g.title} className="w-8 h-8 rounded-lg object-cover" />
                               ) : (
                                 <Users size={18} className={`text-${color}-500`} />
                               )}
                             </div>
                           </div>

                           <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500">
                             <span className="flex items-center gap-1.5 bg-white border border-slate-100 px-2 py-1 rounded-lg">
                               <Users size={12} className="text-slate-400" /> {g.members_count || 0} Members
                             </span>
                           </div>
                         </div>

                         <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                             Joined {new Date(g.created_at).toLocaleDateString()}
                           </p>
                           <button 
                             onClick={(e) => { 
                               e.stopPropagation(); 
                               router.push(`/dashboard/vocabulary?groupId=${g.id}`); 
                             }}
                             className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                           >
                             Learn Words &rarr;
                           </button>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>
        </div>
      )}

      {selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedGroup(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                {selectedGroup.avatar ? (
                  <img src={selectedGroup.avatar} alt={selectedGroup.title} className="w-full h-full object-cover" />
                ) : (
                  <Users className="text-emerald-500" size={32} />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mb-1.5">
                  Classroom
                </span>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{selectedGroup.title}</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Instructor: <span className="text-slate-800 font-bold">{selectedGroup.instructor || 'Teacher'}</span></p>
              </div>
            </div>

            <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Class Description</h4>
              <p className="text-slate-700 text-sm leading-relaxed font-medium">
                {selectedGroup.description || "No description provided for this group."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined On</p>
                  <p className="text-xs font-bold text-slate-800">{new Date(selectedGroup.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Size</p>
                  <p className="text-xs font-bold text-slate-800">{selectedGroup.members_count || 0} enrolled</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-1.5">
                <Users size={16} className="text-slate-400" />
                Classmates
              </h3>
              {loadingMembers ? (
                <div className="flex items-center gap-2 py-4 justify-center text-sm font-medium text-slate-400">
                  <Loader2 className="animate-spin text-emerald-500" size={16} /> Loading classmates...
                </div>
              ) : members.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 italic text-center">No other members in this class yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[160px] overflow-y-auto pr-1">
                  {members.map((member) => (
                    <div key={member.uuid} className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                      <div className="w-7 h-7 bg-white border border-slate-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.username} className="w-full h-full object-cover" />
                        ) : (
                          <User size={12} className="text-slate-400" />
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate" title={`${member.first_name} ${member.last_name}`}>
                        {member.first_name} {member.last_name[0]}.
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedGroup(null)}
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors"
              >
                Close Info
              </button>
              <button 
                onClick={() => {
                  setSelectedGroup(null);
                  router.push(`/dashboard/vocabulary?groupId=${selectedGroup.id}`);
                }}
                className="flex-[2] py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm shadow-lg shadow-orange-200 transition-colors flex items-center justify-center gap-2"
              >
                <BookOpen size={16} /> Learn Vocabulary &rarr;
              </button>
            </div>

          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
