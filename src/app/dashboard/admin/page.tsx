'use client';

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/features/dashboard/components';
import { ShieldAlert, Loader2, CheckCircle, XCircle, GraduationCap, Video, FileText, User } from 'lucide-react';
import { getProfile } from '@/features/auth/services/auth.service';
import { getTeacherRequests, approveTeacherRequest, rejectTeacherRequest } from '@/features/auth/services/admin.service';
import { cn } from '@/shared/utils/cn';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await getTeacherRequests();
      setRequests(res.data || res);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await getProfile();
        const user = res.data || res;
        if (user.role === 'admin') {
          setIsAdmin(true);
          await fetchRequests();
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchRequests]);

  const handleApprove = async (uuid: string) => {
    setActionLoading(`approve-${uuid}`);
    try {
      await approveTeacherRequest(uuid);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to approve', err);
      alert('Failed to approve request');
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
      alert('Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto mt-12 p-8 bg-white border border-rose-100 rounded-2xl shadow-sm text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500">You do not have administrator privileges to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto w-full pb-12">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage users and pending teacher applications.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: requests.length, color: 'bg-slate-50 border-slate-200', valueColor: 'text-slate-900' },
            { label: 'Pending Review', value: pendingCount, color: 'bg-amber-50 border-amber-200', valueColor: 'text-amber-700' },
            { label: 'Approved', value: approvedCount, color: 'bg-emerald-50 border-emerald-200', valueColor: 'text-emerald-700' },
            { label: 'Rejected', value: rejectedCount, color: 'bg-rose-50 border-rose-200', valueColor: 'text-rose-700' },
          ].map((stat) => (
            <div key={stat.label} className={`p-5 rounded-2xl border ${stat.color}`}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.valueColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Teacher Applications */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <GraduationCap className="text-indigo-500" size={22} />
            <h2 className="text-xl font-bold text-slate-900">Teacher Applications</h2>
            {pendingCount > 0 && (
              <span className="ml-auto px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                {pendingCount} pending
              </span>
            )}
          </div>

          <div className="p-0">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No teacher requests found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <div key={req.id} className="p-6 flex flex-col md:flex-row gap-6 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
                        {req.avatar_url ? (
                          <img src={req.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-lg">
                            {req.first_name || req.last_name ? `${req.first_name || ''} ${req.last_name || ''}`.trim() : 'User'}
                          </h3>
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider",
                            req.status === 'pending' ? "bg-amber-100 text-amber-700" :
                            req.status === 'approved' ? "bg-emerald-100 text-emerald-700" :
                            "bg-rose-100 text-rose-700"
                          )}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm">{req.email}</p>
                        
                        <div className="pt-3 space-y-2">
                          <p className="text-slate-700 font-medium">{req.headline}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <span className="flex items-center gap-1.5"><GraduationCap size={16} className="text-slate-400" /> {req.experience_years} years experience</span>
                            {req.video_intro_url && (
                              <a href={req.video_intro_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:underline">
                                <Video size={16} /> Intro Video
                              </a>
                            )}
                          </div>
                          {req.certificates && (
                            <div className="flex items-start gap-1.5 text-sm text-slate-600 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
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
                          className="px-4 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-60"
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
      </div>
    </DashboardLayout>
  );
}

