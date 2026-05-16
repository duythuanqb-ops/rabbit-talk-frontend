'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { User, Bell, Lock, Globe, Save, Upload, Shield, Loader2, X, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProfile, sendVerificationEmail, verifyEmailOtp } from '@/features/auth/services/auth.service';

const tabs = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'security', name: 'Security', icon: Lock },
  { id: 'preferences', name: 'Preferences', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto w-full pb-12">
        <div className="mb-8">
          <h1 className='text-3xl font-bold text-slate-900'>Settings</h1>
          <p className='text-slate-500 mt-2'>Manage your account settings and preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium",
                      isActive 
                        ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon size={20} className={cn(
                      "transition-colors",
                      isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-900"
                    )} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'preferences' && <PreferencesSettings />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function OtpModal({
  email,
  onClose,
  onVerified,
}: {
  email: string;
  onClose: () => void;
  onVerified: () => void;
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setErrorMsg('');
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((ch, i) => { if (i < 6) next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async () => {
    const code = digits.join('');
    if (code.length !== 6) { setErrorMsg('Please enter all 6 digits.'); return; }
    setSubmitState('loading');
    setErrorMsg('');
    try {
      await verifyEmailOtp(code);
      setSubmitState('success');
      setTimeout(() => { onVerified(); onClose(); }, 1500);
    } catch (err: any) {
      setSubmitState('error');
      setErrorMsg(err.message || 'Invalid code. Please try again.');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  const handleResend = async () => {
    setResendState('sending');
    try {
      await sendVerificationEmail();
      setResendState('sent');
      setCountdown(60);
      setDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch {
      setResendState('idle');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 mb-4">
            <Mail size={26} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Check your email</h3>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            We sent a 6-digit code to<br />
            <span className="font-semibold text-slate-700">{email}</span>
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigitChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={submitState === 'loading' || submitState === 'success'}
              className={cn(
                "w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none",
                "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10",
                d ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-900",
                submitState === 'error' && "border-rose-300 bg-rose-50",
                submitState === 'success' && "border-emerald-400 bg-emerald-50 text-emerald-700",
              )}
            />
          ))}
        </div>

        {/* Error message */}
        {errorMsg && (
          <p className="text-center text-sm text-rose-500 mb-4">{errorMsg}</p>
        )}

        {/* Success message */}
        {submitState === 'success' && (
          <p className="text-center text-sm text-emerald-600 font-medium mb-4">✓ Email verified successfully!</p>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={submitState === 'loading' || submitState === 'success'}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitState === 'loading' && <Loader2 size={16} className="animate-spin" />}
          {submitState === 'success' ? 'Verified ✓' : submitState === 'loading' ? 'Verifying…' : 'Verify Email'}
        </button>

        {/* Resend */}
        <p className="text-center text-sm text-slate-500 mt-4">
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span className="text-slate-400">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resendState === 'sending'}
              className="text-indigo-600 hover:text-indigo-700 font-medium underline-offset-2 hover:underline disabled:opacity-50"
            >
              {resendState === 'sending' ? 'Sending…' : resendState === 'sent' ? 'Sent!' : 'Resend code'}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

function ProfileSettings() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [showOtpModal, setShowOtpModal] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await getProfile();
      setUser(response.data || response);
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleSendOtp = async () => {
    setSendState('sending');
    try {
      await sendVerificationEmail();
      setSendState('idle');
      setShowOtpModal(true);
    } catch (err: any) {
      setSendState('error');
      setTimeout(() => setSendState('idle'), 3000);
    }
  };

  const handleVerified = () => {
    // Refresh user data to reflect is_email_verified = true
    setLoading(true);
    fetchUser();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-slate-500">
        Failed to load user data. Please try again.
      </div>
    );
  }

  const firstName = user.first_name || user.firstName || '';
  const lastName = user.last_name || user.lastName || '';
  const email = user.email || '';
  const bio = user.bio || '';
  const isEmailVerified = !!user.is_email_verified;

  const initials = firstName
    ? firstName.charAt(0).toUpperCase() + (lastName ? lastName.charAt(0).toUpperCase() : '')
    : (user.username ? user.username.charAt(0).toUpperCase() : 'U');

  return (
    <>
      {showOtpModal && (
        <OtpModal
          email={email}
          onClose={() => setShowOtpModal(false)}
          onVerified={handleVerified}
        />
      )}

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
          <p className="text-sm text-slate-500 mt-1">Update your photo and personal details here.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
          <div className="w-24 h-24 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl font-bold shadow-inner">
            {initials}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors flex items-center gap-2 shadow-sm">
                <Upload size={18} />
                Upload new photo
              </button>
              <button className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-medium transition-colors">
                Remove
              </button>
            </div>
            <p className="text-xs text-slate-400">JPG, GIF or PNG. Max size of 800K</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">First Name</label>
            <input type="text" defaultValue={firstName} key={`fn-${firstName}`} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Last Name</label>
            <input type="text" defaultValue={lastName} key={`ln-${lastName}`} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input type="email" defaultValue={email} key={`em-${email}`} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
              {isEmailVerified ? (
                <div className="px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-lg font-medium whitespace-nowrap border border-emerald-100 flex items-center gap-2">
                  <Shield size={16} /> Verified
                </div>
              ) : (
                <button
                  onClick={handleSendOtp}
                  disabled={sendState === 'sending'}
                  className="px-4 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium transition-colors whitespace-nowrap border border-indigo-100 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendState === 'sending' && <Loader2 size={14} className="animate-spin" />}
                  {sendState === 'sending' ? 'Sending…' : sendState === 'error' ? 'Failed — Retry' : 'Verify Email'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">Bio</label>
            <textarea rows={4} defaultValue={bio} key={`bio-${bio}`} className="w-full px-4 py-3 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"></textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors flex items-center gap-2 shadow-sm shadow-emerald-500/20">
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
        <p className="text-sm text-slate-500 mt-1">Manage when and how you receive notifications.</p>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div>
            <h3 className="font-medium text-slate-900">Email Notifications</h3>
            <p className="text-sm text-slate-500 mt-1">Receive daily summaries and important updates via email.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div>
            <h3 className="font-medium text-slate-900">Group Messages</h3>
            <p className="text-sm text-slate-500 mt-1">Get notified when a student or teacher messages your group.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div>
            <h3 className="font-medium text-slate-900">Vocab Battle Invites</h3>
            <p className="text-sm text-slate-500 mt-1">Be alerted when someone challenges you to a vocabulary battle.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
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

function PreferencesSettings() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Preferences</h2>
        <p className="text-sm text-slate-500 mt-1">Customize your RibbitTalk experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Language</label>
          <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer">
            <option>English (US)</option>
            <option>Vietnamese</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Timezone</label>
          <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer">
            <option>(GMT+07:00) Indochina Time</option>
            <option>(GMT-05:00) Eastern Time</option>
            <option>(GMT+00:00) UTC</option>
            <option>(GMT+09:00) Japan Standard Time</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <h3 className="font-medium text-slate-900 mb-4">Theme</h3>
        <div className="flex gap-4">
          <button className="flex-1 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50 flex flex-col items-center gap-3 transition-all relative">
            <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center"></div>
            <div className="w-full max-w-[120px] h-20 bg-white rounded border border-slate-200 flex flex-col overflow-hidden shadow-sm">
              <div className="h-4 bg-slate-100 w-full border-b border-slate-200"></div>
              <div className="flex flex-1">
                <div className="w-1/4 bg-slate-50 border-r border-slate-200"></div>
                <div className="flex-1 bg-white p-2 flex flex-col gap-1.5">
                  <div className="h-1.5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-1.5 bg-slate-100 rounded w-full"></div>
                  <div className="h-1.5 bg-slate-100 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-emerald-700">Light Mode</span>
          </button>
          
          <button className="flex-1 p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white flex flex-col items-center gap-3 transition-all relative">
            <div className="w-full max-w-[120px] h-20 bg-slate-900 rounded border border-slate-800 flex flex-col overflow-hidden shadow-sm">
              <div className="h-4 bg-slate-950 w-full border-b border-slate-800"></div>
              <div className="flex flex-1">
                <div className="w-1/4 bg-slate-950 border-r border-slate-800"></div>
                <div className="flex-1 bg-slate-900 p-2 flex flex-col gap-1.5">
                  <div className="h-1.5 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-1.5 bg-slate-800 rounded w-full"></div>
                  <div className="h-1.5 bg-slate-800 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <span className="text-sm font-medium text-slate-600">Dark Mode</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <button className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors flex items-center gap-2 shadow-sm shadow-emerald-500/20">
          <Save size={18} />
          Save Preferences
        </button>
      </div>
    </div>
  );
}

