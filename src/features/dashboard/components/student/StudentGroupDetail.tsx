/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, BookOpen, User, FileText, ChevronLeft, Loader2 } from 'lucide-react';
import { groupsService } from '@/features/groups/services/groups.service';
import { Group, GroupMember } from '@/features/groups/types/groups.types';
import { motion } from 'framer-motion';

interface StudentGroupDetailProps {
  groupId: string;
}

export function StudentGroupDetail({ groupId }: StudentGroupDetailProps) {
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      groupsService.getGroupById(groupId),
      groupsService.getGroupMembers(groupId)
    ]).then(([groupRes, membersRes]) => {
      setSelectedGroup(groupRes.data as unknown as Group);
      setMembers((membersRes.data || []) as unknown as GroupMember[]);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch group details', err);
      setLoading(false);
    });
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  if (!selectedGroup) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Group not found.</p>
        <button onClick={() => router.push('/dashboard/groups')} className="mt-4 text-emerald-500 font-bold">
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 w-full shadow-lg border border-slate-100 dark:border-slate-700 relative">
      <button 
        onClick={() => router.push('/dashboard/groups')}
        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors flex items-center gap-1"
      >
        <ChevronLeft size={20} /> Back
      </button>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
          {selectedGroup.avatar ? (
            <img src={selectedGroup.avatar} alt={selectedGroup.title} className="w-full h-full object-cover" />
          ) : (
            <Users className="text-emerald-500" size={32} />
          )}
        </div>
        <div>
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mb-1.5">
            Classroom
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{selectedGroup.title}</h2>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Instructor: <span className="text-slate-800 dark:text-white font-bold">{selectedGroup.instructor || 'Teacher'}</span>
          </p>
        </div>
      </div>

      <div className="mb-6 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Class Description</h4>
        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
          {selectedGroup.description || "No description provided for this group."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400">
            <Calendar size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Joined On</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white">
              {new Date(selectedGroup.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400">
            <Users size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Class Size</p>
            <p className="text-xs font-bold text-slate-800 dark:text-white">{selectedGroup.members_count || 0} enrolled</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
          <Users size={16} className="text-slate-400" />
          Classmates
        </h3>
        {members.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 italic text-center">No other members in this class yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
            {members.map((member) => (
              <div key={member.uuid} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 p-2 rounded-xl">
                <div className="w-7 h-7 bg-white dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.username} className="w-full h-full object-cover" />
                  ) : (
                    <User size={12} className="text-slate-400" />
                  )}
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={`${member.first_name} ${member.last_name}`}>
                  {member.first_name} {member.last_name?.[0]}.
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2.5">
        <button 
          onClick={() => {
            router.push(`/dashboard/vocabulary?groupId=${selectedGroup.id}`);
          }}
          className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-orange-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <BookOpen size={14} /> Vocabulary
        </button>
        <button 
          onClick={() => {
            router.push(`/dashboard/exams?groupId=${selectedGroup.id}`);
          }}
          className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl text-xs shadow-lg shadow-blue-200 transition-colors flex items-center justify-center gap-1.5"
        >
          <FileText size={14} /> Exams
        </button>
      </div>
    </div>
  );
}
