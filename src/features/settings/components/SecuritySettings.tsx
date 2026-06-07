/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import { Shield, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { userAPI } from '../../user/services/user.service';

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setStatus('loading');
    setErrorMsg('');
    try {
      await userAPI.updatePassword({ currentPassword, newPassword });
      setStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Keep your account secure.</p>
      </div>

      <div className="space-y-4 pt-4 border-b border-slate-100 dark:border-slate-800 pb-8">
        <h3 className="font-medium text-slate-900 dark:text-white">Change Password</h3>
        <div className="grid grid-cols-1 gap-5 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Password</label>
            <input 
              type="password" 
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
            <input 
              type="password" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirm New Password</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" 
            />
          </div>
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-lg text-sm border border-rose-100 dark:border-rose-900/50">
              {errorMsg}
            </div>
          )}

          {status === 'success' && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-2">
              <CheckCircle size={16} /> Password updated successfully!
            </div>
          )}

          <div className="pt-2">
            <button 
              onClick={handleUpdatePassword}
              disabled={status === 'loading' || !currentPassword || !newPassword || !confirmPassword}
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors shadow-sm shadow-emerald-500/20 w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'loading' && <Loader2 size={16} className="animate-spin" />}
              {status === 'loading' ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-medium text-slate-900 dark:text-amber-50">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-600 dark:text-amber-200/70 mt-1 max-w-lg">Add an extra layer of security to your account by enabling two-factor authentication.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 font-medium transition-colors whitespace-nowrap shadow-sm shrink-0">
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  );
}