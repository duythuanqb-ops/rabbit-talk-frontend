'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ShieldAlert, Loader2, CheckCircle, XCircle, GraduationCap, Video, FileText, User } from 'lucide-react';
import { getProfile } from '@/features/auth/services/auth.service';
import { getTeacherRequests, approveTeacherRequest, rejectTeacherRequest, getAdminQuests, createAdminQuest, updateAdminQuest, deleteAdminQuest } from '@/features/auth/services/admin.service';
import { cn } from '@/shared/utils/cn';
import toast from 'react-hot-toast';

type TeacherRequest = {
  id: string;
  uuid: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  headline?: string;
  experience_years?: number;
  video_intro_url?: string;
  certificates?: string;
};

type Quest = {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  type: string;
  target_value: number;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<TeacherRequest[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [quests, setQuests] = useState<Quest[]>([]);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    xp_reward: 50,
    type: 'practice_words',
    target_value: 5
  });
  const [isCreatingQuest, setIsCreatingQuest] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await getTeacherRequests();
      setRequests((res as { data?: TeacherRequest[] }).data || (res as TeacherRequest[]));
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  }, []);

  const fetchQuests = useCallback(async () => {
    try {
      const res = await getAdminQuests();
      setQuests((res as { data?: Quest[] }).data || (res as Quest[]));
    } catch (err) {
      console.error('Failed to fetch quests', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getProfile();
        const user = (res as { data?: { role?: string; [key: string]: unknown } }).data || (res as { role?: string });
        if (user.role === 'admin') {
          setIsAdmin(true);
          await Promise.all([fetchRequests(), fetchQuests()]);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchRequests, fetchQuests]);

  const handleApprove = async (uuid: string) => {
    setActionLoading(`approve-${uuid}`);
    try {
      await approveTeacherRequest(uuid);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to approve', err);
      toast.error('Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (uuid: string) => {
    setActionLoading(`reject-${uuid}`);
    try {
      await rejectTeacherRequest(uuid);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to reject', err);
      toast.error('Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingQuest(true);
    try {
      if (editingQuestId) {
        await updateAdminQuest(editingQuestId, newQuest);
        toast.success('Quest updated successfully');
      } else {
        await createAdminQuest(newQuest);
        toast.success('Quest created successfully');
      }
      setNewQuest({ title: '', description: '', xp_reward: 50, type: 'practice_words', target_value: 5 });
      setEditingQuestId(null);
      await fetchQuests();
    } catch (err) {
      console.error('Failed to save quest', err);
      toast.error('Failed to save quest');
    } finally {
      setIsCreatingQuest(false);
    }
  };

  const handleEditQuest = (q: Quest) => {
    setEditingQuestId(q.id);
    setNewQuest({
      title: q.title,
      description: q.description,
      xp_reward: q.xp_reward,
      type: q.type,
      target_value: q.target_value
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDeleteQuest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this quest?')) return;
    setActionLoading(`delete-quest-${id}`);
    try {
      await deleteAdminQuest(id);
      toast.success('Quest deleted');
      await fetchQuests();
    } catch (err) {
      console.error('Failed to delete quest', err);
      toast.error('Failed to delete quest');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
    <>
      <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
    </>
  );
  }

  if (!isAdmin) {
    return (
    <>
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white border border-rose-100 rounded-2xl shadow-sm text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500">You do not have administrator privileges to view this page.</p>
        </div>
    </>
  );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <>
      <div className="max-w-6xl mx-auto w-full pb-12">
        {}
        <div className="mb-8 flex items-start gap-4">
          <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage users and pending teacher applications.</p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: requests.length, color: 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700', valueColor: 'text-slate-900 dark:text-white' },
            { label: 'Pending Review', value: pendingCount, color: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700', valueColor: 'text-amber-700 dark:text-amber-400' },
            { label: 'Approved', value: approvedCount, color: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700', valueColor: 'text-emerald-700 dark:text-emerald-400' },
            { label: 'Rejected', value: rejectedCount, color: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700', valueColor: 'text-rose-700 dark:text-rose-400' },
          ].map((stat) => (
            <div key={stat.label} className={`p-5 rounded-2xl border ${stat.color}`}>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.valueColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
            <GraduationCap className="text-indigo-500 dark:text-indigo-400" size={22} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Teacher Applications</h2>
            {pendingCount > 0 && (
              <span className="ml-auto px-2.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full">
                {pendingCount} pending
              </span>
            )}
          </div>

          <div className="p-0">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                No teacher requests found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((req) => (
                  <div key={req.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 overflow-hidden shrink-0">
                        {req.avatar_url ? (
                          <Image src={req.avatar_url} alt="Avatar" width={56} height={56} className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                            {req.first_name || req.last_name ? `${req.first_name || ''} ${req.last_name || ''}`.trim() : 'User'}
                          </h3>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider",
                            req.status === 'pending' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                            req.status === 'approved' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" :
                            "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400"
                          )}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{req.email}</p>
                        
                        <div className="pt-3 space-y-2">
                          <p className="text-slate-700 dark:text-slate-300 font-medium">{req.headline}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span className="flex items-center gap-1.5"><GraduationCap size={16} className="text-slate-400 dark:text-slate-500" /> {req.experience_years} years experience</span>
                            {req.video_intro_url && (
                              <a href={req.video_intro_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline">
                                <Video size={16} /> Intro Video
                              </a>
                            )}
                          </div>
                          {req.certificates && (
                            <div className="flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-400 mt-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                              <FileText size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                              <p>{req.certificates}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex md:flex-col gap-3 shrink-0 items-start">
                        <button
                          onClick={() => handleApprove(req.uuid)}
                          disabled={!!actionLoading}
                          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-sm shadow-emerald-500/20 flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-60"
                        >
                          {actionLoading === `approve-${req.uuid}` ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(req.uuid)}
                          disabled={!!actionLoading}
                          className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-60"
                        >
                          {actionLoading === `reject-${req.uuid}` ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {}
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
            <CheckCircle className="text-orange-500" size={22} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Quests Management</h2>
            <span className="ml-auto px-2.5 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 text-xs font-bold rounded-full">
              {quests.length} quests active
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            
            {}
            <div className="p-6 lg:col-span-1 bg-slate-50/30 dark:bg-slate-800/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">
                  {editingQuestId ? 'Edit Quest' : 'Create New Quest'}
                </h3>
                {editingQuestId && (
                  <button 
                    onClick={() => { setEditingQuestId(null); setNewQuest({ title: '', description: '', xp_reward: 50, type: 'practice_words', target_value: 5 }); }}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleCreateQuest} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Title</label>
                  <input required type="text" value={newQuest.title} onChange={e => setNewQuest({...newQuest, title: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm" placeholder="e.g. Practice 5 Words" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Description</label>
                  <input required type="text" value={newQuest.description} onChange={e => setNewQuest({...newQuest, description: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm" placeholder="e.g. Study your flashcards" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">XP Reward</label>
                    <input required type="number" min="1" value={newQuest.xp_reward} onChange={e => setNewQuest({...newQuest, xp_reward: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Target Value</label>
                    <input required type="number" min="1" value={newQuest.target_value} onChange={e => setNewQuest({...newQuest, target_value: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Quest Type</label>
                  <select value={newQuest.type} onChange={e => setNewQuest({...newQuest, type: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm">
                    <option value="practice_words">Practice Words</option>
                    <option value="add_custom_words">Add Custom Words</option>
                    <option value="take_exam">Take Exam</option>
                    <option value="daily_checkin">Daily Check-in</option>
                    <option value="perfect_exam">Perfect Exam Score</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">Changing the type requires backend support to track progress properly.</p>
                </div>
                
                <button disabled={isCreatingQuest} type="submit" className="w-full mt-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2">
                  {isCreatingQuest ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {editingQuestId ? 'Update Quest' : 'Create Quest'}
                </button>
              </form>
            </div>

            {}
            <div className="lg:col-span-2 p-0">
              {quests.length === 0 ? (
                <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                  No daily quests configured. Students won&apos;t see any quests.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {quests.map((q) => (
                    <div key={q.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">{q.title}</h4>
                          <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold rounded uppercase tracking-wider">
                            +{q.xp_reward} XP
                          </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{q.description}</p>
                        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-500 pt-1 font-medium">
                          <span>Type: {q.type}</span>
                          <span>&bull;</span>
                          <span>Target: {q.target_value}</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => handleEditQuest(q)}
                          disabled={!!actionLoading}
                          className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-60"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteQuest(q.id)}
                          disabled={actionLoading === `delete-quest-${q.id}`}
                          className="px-3 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-60"
                        >
                          {actionLoading === `delete-quest-${q.id}` ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

