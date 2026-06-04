/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ChevronLeft, BookOpen, Swords, Trash2, Edit, Loader2, UserPlus, UserMinus, Play, FileText } from 'lucide-react';
import { Group, GroupMember } from '../../../groups/types/groups.types';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { ExamCreateWizard } from '@/features/exam/components/ExamCreateWizard';
import { CreateSetModal } from '@/features/flashcard/components/CreateSetModal';
import { flashcardService } from '@/features/flashcard/services/flashcard.service';
import { useGroupManager } from '@/features/groups/hooks/useGroupManager';
import { GroupFormModal } from './GroupFormModal';
import { AddMemberModal } from './AddMemberModal';

interface TeacherGroupDetailProps {
  groupId: string;
}

export function TeacherGroupDetail({ groupId }: TeacherGroupDetailProps) {
  const router = useRouter();
  
  const {
    groups,
    selectedGroup,
    members,
    loading,
    saveGroup,
    deleteGroup,
    addMember,
    removeMember,
  } = useGroupManager(groupId);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isCreateSetOpen, setIsCreateSetOpen] = useState(false);

  const triggerConfirm = (options: {
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }) => {
    setConfirmState({
      isOpen: true,
      ...options,
    });
  };

  const handleGoBack = () => {
    router.push('/dashboard/groups');
  };

  const handleStartBattle = (groupId: string, groupName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/dashboard/battle?groupId=${groupId}&groupName=${encodeURIComponent(groupName)}`);
  };

  const handleDeleteGroup = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerConfirm({
      title: 'Delete Class',
      message: 'Are you sure you want to delete this class? This action cannot be undone and all student memberships will be removed.',
      type: 'danger',
      onConfirm: async () => {
        const success = await deleteGroup(groupId);
        if (success) {
          router.push('/dashboard/groups');
        }
      },
    });
  };

  const handleRemoveMember = (userId: string) => {
    if (!selectedGroup) return;
    triggerConfirm({
      title: 'Remove Member',
      message: 'Are you sure you want to remove this member from the class?',
      type: 'danger',
      onConfirm: async () => {
        await removeMember(selectedGroup.id, userId);
      },
    });
  };

  if (loading || !selectedGroup) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-emerald-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="double-bezel">
      <div className="double-bezel-inner bg-surface p-6 relative">
        <GroupFormModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          onSave={(form, file) => saveGroup(editingGroup, form, file)}
          editingGroup={editingGroup}
        />

        <AddMemberModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          onAdd={(identifier) => addMember(selectedGroup.id, identifier)}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 hover:text-slate-700"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-4">
              {selectedGroup.avatar ? (
                <img
                  src={selectedGroup.avatar}
                  alt={selectedGroup.title}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-2xl shadow-md flex-shrink-0">
                  {selectedGroup.title[0].toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-2xl tracking-tight">
                  {selectedGroup.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedGroup.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingGroup(selectedGroup);
                setIsGroupModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-bold rounded-xl transition-colors"
            >
              <Edit size={16} /> Edit
            </button>
            <button
              onClick={(e) => handleDeleteGroup(selectedGroup.id, e)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 font-bold rounded-xl transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-700" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div>
                  <h4 className="font-bold flex items-center gap-2 text-xl mb-2">
                    <Swords size={24} className="text-emerald-400" />
                    Live Vocab Battle
                  </h4>
                  <p className="text-sm text-white/70 max-w-sm leading-relaxed">
                    Start a real-time pronunciation battle for{' '}
                    <span className="font-semibold text-white">{selectedGroup.title}</span>. Challenge
                    your students and track their progress live.
                  </p>
                </div>
                <button
                  onClick={() => handleStartBattle(selectedGroup.id, selectedGroup.title)}
                  className="flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all font-bold shadow-lg shadow-emerald-900/30 whitespace-nowrap hover:scale-105 active:scale-95"
                >
                  <Play size={18} className="fill-white" />
                  Start Battle
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <FileText className="text-blue-500" size={18} />
                      Exams
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">
                    Create customized exams with synonym, listening, spelling, and situational questions
                    using Cambridge pronunciation audio.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/exams?groupId=${selectedGroup.id}`)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl text-xs transition-colors border border-slate-200 dark:border-slate-600"
                  >
                    View Library
                  </button>
                  <button
                    onClick={() => setIsCreateExamOpen(true)}
                    className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-200 transition-colors"
                  >
                    + Create Exam
                  </button>
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <BookOpen className="text-orange-500" size={18} />
                      Vocabulary Sets
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 mb-6">
                    Create flashcards for your students with automated dictionary lookup and AI-generated
                    definitions.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/vocabulary?groupId=${selectedGroup.id}`)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl text-xs transition-colors border border-slate-200 dark:border-slate-600"
                  >
                    View Library
                  </button>
                  <button
                    onClick={() => setIsCreateSetOpen(true)}
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-200 transition-colors"
                  >
                    + Create Set
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 shadow-sm sticky top-6">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Users className="text-indigo-500" size={18} />
                  Members ({members.length})
                </h4>
                <button
                  onClick={() => setIsMemberModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-bold shadow-sm"
                >
                  <UserPlus size={14} />
                  Add
                </button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div
                      key={member.uuid}
                      className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-600/50 group transition-all hover:bg-white dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-500 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center font-bold text-indigo-600 border border-indigo-100">
                          {member.first_name?.[0]}
                          {member.last_name?.[0]}
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800 dark:text-white text-sm">
                            {member.first_name} {member.last_name}
                          </h5>
                          <p className="text-xs text-slate-500">{member.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetId =
                            member.uuid ||
                            (member as GroupMember & { user_id?: string }).user_id ||
                            member.uuid;
                          handleRemoveMember(targetId);
                        }}
                        className="text-rose-500 hover:text-white p-2 rounded-lg bg-rose-50 hover:bg-rose-500 transition-all flex items-center justify-center shadow-sm hover:shadow active:scale-95"
                        title="Remove member"
                      >
                        <UserMinus size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100 dark:border-slate-600">
                      <Users size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No members yet</p>
                    <button
                      onClick={() => setIsMemberModalOpen(true)}
                      className="mt-2 text-xs font-bold text-indigo-500 hover:text-indigo-600"
                    >
                      Add first member
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <ConfirmModal
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmState.onConfirm}
          title={confirmState.title}
          message={confirmState.message}
          type={confirmState.type}
        />

        <ExamCreateWizard
          isOpen={isCreateExamOpen}
          onClose={() => setIsCreateExamOpen(false)}
          onCreated={() => setIsCreateExamOpen(false)}
          groups={groups}
          defaultGroupId={selectedGroup.id}
        />

        <CreateSetModal
          isOpen={isCreateSetOpen}
          onClose={() => setIsCreateSetOpen(false)}
          onCreate={async (groupId, title, desc) => {
            await flashcardService.createSet(groupId, title, desc);
            setIsCreateSetOpen(false);
          }}
          defaultGroupId={selectedGroup.id}
        />
      </div>
    </div>
  );
}
