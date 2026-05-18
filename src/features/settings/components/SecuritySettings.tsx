import { Shield } from 'lucide-react';

export function SecuritySettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Security</h2>
        <p className="text-sm text-slate-500 mt-1">Keep your account secure.</p>
      </div>

      <div className="space-y-4 pt-4 border-b border-slate-100 pb-8">
        <h3 className="font-medium text-slate-900">Change Password</h3>
        <div className="grid grid-cols-1 gap-5 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Current Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">New Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>
          <div className="pt-2">
            <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors shadow-sm shadow-emerald-500/20 w-full sm:w-auto">
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-amber-200 bg-amber-50 gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 text-amber-600 bg-amber-100 p-2 rounded-lg">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Two-Factor Authentication</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-lg">Add an extra layer of security to your account by enabling two-factor authentication.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-100 font-medium transition-colors whitespace-nowrap shadow-sm shrink-0">
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  );
}