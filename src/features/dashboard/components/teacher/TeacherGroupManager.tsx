/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, Swords, Settings } from 'lucide-react';
import { Group } from '../../../groups/types/groups.types';
import { ConfirmModal } from '@/shared/components/ConfirmModal';
import { useGroupManager } from '@/features/groups/hooks/useGroupManager';
import { GroupFormModal } from './GroupFormModal';

export function TeacherGroupManager() {
  const router = useRouter();

  const {
    groups,
    saveGroup,
  } = useGroupManager();

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
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

  const handleStartBattle = (groupId: string, groupName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/dashboard/battle?groupId=${groupId}&groupName=${encodeURIComponent(groupName)}`);
  };

  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-surface p-6 relative min-h-[400px]">
        <GroupFormModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          onSave={(form, file) => saveGroup(editingGroup, form, file)}
          editingGroup={editingGroup}
        />

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 dark:text-white text-xl flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Users size={24} />
            </div>
            My Groups
          </h3>
          <button
            onClick={() => {
              setEditingGroup(null);
              setIsGroupModalOpen(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all text-sm font-bold shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            Create Group
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100 shadow-sm">
              <Users size={32} className="text-slate-300" />
            </div>
            <h4 className="text-lg font-bold text-slate-800 mb-1">No groups found</h4>
            <p className="text-slate-500 max-w-sm mb-6 text-sm">
              Create your first group to start managing students, assigning exams, and hosting live battles.
            </p>
            <button
              onClick={() => {
                setEditingGroup(null);
                setIsGroupModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-bold border border-emerald-100"
            >
              <Plus size={18} />
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => router.push(`/dashboard/groups/${group.id}`)}
                className="p-5 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-700/50 hover:ring-emerald-300 dark:hover:ring-emerald-500/50 transition-all cursor-pointer bg-white dark:bg-slate-700 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 group relative flex flex-col h-full"
              >
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-colors">
                    <Settings size={14} />
                  </div>
                </div>

                <div className="flex gap-4 items-start mb-4 pr-10">
                  {group.avatar ? (
                    <img
                      src={group.avatar}
                      alt={group.title}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                      {group.title[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-lg line-clamp-1">
                      {group.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                      {group.description || 'No description'}
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex gap-2 mt-4">
                    <div className="flex-1 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-100 flex flex-col items-center justify-center gap-1">
                      <Users size={16} className="text-indigo-500" />
                      Manage
                    </div>
                    <button
                      onClick={(e) => handleStartBattle(group.id, group.title, e)}
                      className="flex-1 py-2 bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex flex-col items-center justify-center gap-1 transition-colors shadow-sm"
                      title="Start Live Battle"
                    >
                      <Swords size={16} />
                      Battle
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <ConfirmModal
          isOpen={confirmState.isOpen}
          onClose={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
          onConfirm={confirmState.onConfirm}
          title={confirmState.title}
          message={confirmState.message}
          type={confirmState.type}
        />
      </div>
    </div>
  );
}

