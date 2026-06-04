'use client';

import { TeacherGroupManager } from '@/features/dashboard/components';
import { Users, GraduationCap, Loader2, Calendar, BookOpen, User, FileText } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/features/auth/services/auth.service';
import { groupsService } from '@/features/groups/services/groups.service';
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/shared/utils/motion';

export default function GroupsPage() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'teacher' | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any

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
        initial="hidden" 
        animate="show" 
        variants={containerVariants}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="text-emerald-500" />
            {role === 'student' ? 'Community & Classes' : 'My Groups'}
          </h1>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">
            {role === 'student' ? 'View your classes and connect with friends.' : 'Manage your classes and students.'}
          </p>
        </motion.div>
      </motion.div>

      {role === 'teacher' ? (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>}>
          <TeacherGroupManager />
        </Suspense>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={itemVariants} className="max-w-5xl mx-auto w-full"
        >
          <div 
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-700/50"
          >
             <motion.div variants={itemVariants}>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                 <GraduationCap size={16} className="text-emerald-500" />
                 You can only be added to classes by your teacher.
               </p>

               {groups.length === 0 ? (
                 <div className="text-center py-16 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-700/20 max-w-md mx-auto">
                   <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No classes found</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400 px-6">
                     You are not enrolled in any groups yet. Ask your teacher to add you using your email.
                   </p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {groups.map((g, i) => {
                     const colors = ['emerald', 'blue', 'orange', 'indigo', 'rose', 'amber'];
                     const color = colors[i % colors.length];
                     return (
                       <motion.div 
                         variants={itemVariants}
                         whileHover={{ y: -5 }}
                         key={g.id} 
                         onClick={() => router.push(`/dashboard/groups/${g.id}`)}
                         className="p-5 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] ring-1 ring-slate-100 dark:ring-slate-700 bg-slate-50/30 dark:bg-slate-800 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:ring-emerald-200 dark:hover:ring-emerald-700 transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between"
                       >
                         <div>
                           <div className="flex justify-between items-start mb-4">
                             <div>
                               <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition text-lg">{g.title}</h3>
                               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">by {g.instructor || 'Teacher'}</p>
                             </div>
                             <div className="p-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-700">
                               {g.avatar ? (
                                 <img src={g.avatar} alt={g.title} className="w-8 h-8 rounded-lg object-cover" />
                               ) : (
                                 <Users size={18} className={`text-${color}-500`} />
                               )}
                             </div>
                           </div>

                           <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                             <span className="flex items-center gap-1.5 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 px-2 py-1 rounded-lg">
                               <Users size={12} className="text-slate-400" /> {g.members_count || 0} Members
                             </span>
                           </div>
                         </div>

                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                              Joined {new Date(g.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2">
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  router.push(`/dashboard/vocabulary?groupId=${g.id}`); 
                                }}
                                className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                              >
                                Words
                              </button>
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  router.push(`/dashboard/exams?groupId=${g.id}`); 
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                              >
                                Exams
                              </button>
                            </div>
                          </div>
                       </motion.div>
                     );
                   })}
                 </div>
               )}
             </motion.div>
            </div>
         </motion.div>
      )}


    </>
  );
}
