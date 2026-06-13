import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, Shield, Loader2, Save, GraduationCap, CheckCircle } from 'lucide-react';
import { getProfile, sendVerificationEmail, updateProfile, uploadAvatar, removeAvatar, registerTeacher } from '@/features/auth/services/auth.service';
import { ImageCropperModal } from '@/features/dashboard/components';
import { OtpModal } from './OtpModal';

interface UserProfile {
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar_url?: string | null;
  cover_url?: string | null;
  role?: string;
  is_verified?: boolean;
  email?: string;
  is_email_verified?: boolean;
  username?: string;
}

export function ProfileSettings() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [showOtpModal, setShowOtpModal] = useState(false);

  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const [teacherHeadline, setTeacherHeadline] = useState('');
  const [teacherExperience, setTeacherExperience] = useState('');
  const [teacherVideo, setTeacherVideo] = useState('');
  const [teacherCertificates, setTeacherCertificates] = useState('');
  const [teacherSubmitState, setTeacherSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [teacherErrorMsg, setTeacherErrorMsg] = useState('');
  const [isTeacherFormOpen, setIsTeacherFormOpen] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await getProfile();
      const data = response.data || response;
      setUser(data);
      setFirstName(data.first_name || data.firstName || '');
      setLastName(data.last_name || data.lastName || '');
      setBio(data.bio || '');
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        fetchUser();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [fetchUser]);

  const handleSendOtp = async () => {
    setSendState('sending');
    try {
      await sendVerificationEmail();
      setSendState('idle');
      setShowOtpModal(true);
    } catch {
      setSendState('error');
      setTimeout(() => setSendState('idle'), 3000);
    }
  };

  const handleVerified = () => {
    setLoading(true);
    fetchUser();
  };

  const handleSaveChanges = async () => {
    setSaveState('saving');
    try {
      await updateProfile({ first_name: firstName, last_name: lastName, bio });
      setSaveState('success');
      setTimeout(() => setSaveState('idle'), 2500);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
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

  const email = user.email || '';
  const isEmailVerified = !!user.is_email_verified;
  const avatarUrl = user.avatar_url;

  const initials = firstName
    ? firstName.charAt(0).toUpperCase() + (lastName ? lastName.charAt(0).toUpperCase() : '')
    : (user.username ? user.username.charAt(0).toUpperCase() : 'U');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    
    const url = URL.createObjectURL(file);
    setCropImageSrc(url);
    
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    const objectUrl = URL.createObjectURL(croppedFile);
    setUser({ ...user, avatar_url: objectUrl });
    setCropImageSrc(null);
    setUploadingAvatar(true);
    
    try {
      const res = (await uploadAvatar(croppedFile)) as { data?: { avatar_url?: string }; avatar_url?: string };
      const newAvatarUrl = res.data?.avatar_url || res.avatar_url;
      setUser((prev: UserProfile | null) => prev ? ({ ...prev, avatar_url: newAvatarUrl }) : null);
      await fetchUser(); 
    } catch (err) {
      console.error('Failed to upload avatar', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await removeAvatar();
      setUser({ ...user, avatar_url: null });
    } catch (err) {
      console.error('Failed to remove avatar', err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRegisterTeacher = async () => {
    if (!teacherHeadline || !teacherExperience) {
      setTeacherErrorMsg('Headline and Experience are required.');
      return;
    }
    setTeacherSubmitState('loading');
    setTeacherErrorMsg('');
    try {
      await registerTeacher({
        headline: teacherHeadline,
        experience_years: parseInt(teacherExperience) || 0,
        video_intro_url: teacherVideo || undefined,
        certificates: teacherCertificates || undefined,
      });
      setTeacherSubmitState('success');
      setTimeout(() => setTeacherSubmitState('idle'), 3000);
      fetchUser();
    } catch (err) {
      const error = err as Error;
      setTeacherSubmitState('error');
      setTeacherErrorMsg(error.message || 'Failed to register as teacher');
    }
  };

  return (
    <>
      {showOtpModal && (
        <OtpModal
          email={email}
          onClose={() => setShowOtpModal(false)}
          onVerified={handleVerified}
        />
      )}

      {cropImageSrc && (
        <ImageCropperModal
          imageSrc={cropImageSrc}
          onClose={() => setCropImageSrc(null)}
          onCropComplete={handleCropComplete}
        />
      )}

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your photo and personal details here.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-700">
          <div className="w-24 h-24 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-3xl font-bold shadow-inner overflow-hidden relative">
            {avatarUrl ? (
              <Image unoptimized src={avatarUrl} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-600" size={24} />
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                accept="image/png, image/jpeg, image/gif" 
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Upload size={18} />
                Upload new photo
              </button>
              {avatarUrl && (
                <button 
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400">JPG, GIF or PNG. Max size of 800K</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                readOnly
                className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 cursor-not-allowed select-none focus:outline-none"
              />
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
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself…"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          {saveState === 'success' && (
            <span className="text-sm text-emerald-600 font-medium">✓ Changes saved!</span>
          )}
          {saveState === 'error' && (
            <span className="text-sm text-rose-500 font-medium">Failed to save. Please try again.</span>
          )}
          <button
            onClick={handleSaveChanges}
            disabled={saveState === 'saving'}
            className="px-6 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-medium transition-colors flex items-center gap-2 shadow-sm shadow-emerald-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saveState === 'saving' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saveState === 'saving' ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="text-slate-800 dark:text-slate-200" size={22} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Teacher Profile</h2>
          </div>
          
          {user.role === 'teacher' ? (
            <div className="p-5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl flex items-start gap-3 shadow-sm">
              <CheckCircle size={22} className="shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <p className="font-bold">You are registered as a Teacher</p>
                <p className="text-sm mt-1 text-emerald-700">Your teacher profile is active. You can now manage classes and students.</p>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl space-y-5 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">Become a Teacher on RibbitTalk</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Register to start teaching, creating courses, and earning from your classes.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isTeacherFormOpen}
                    onChange={(e) => setIsTeacherFormOpen(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {isTeacherFormOpen && (
                <div className="pt-5 border-t border-slate-200 dark:border-slate-700 space-y-5 animate-in slide-in-from-top-2 fade-in duration-300">
                  {!isEmailVerified ? (
                    <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl flex items-start gap-3 shadow-sm">
                      <Shield size={20} className="mt-0.5 shrink-0 text-amber-500" />
                      <div>
                        <p className="font-semibold">Email verification required</p>
                        <p className="text-sm mt-1 mb-3 text-amber-700">You must verify your email address before you can register as a teacher.</p>
                        <button
                          onClick={handleSendOtp}
                          disabled={sendState === 'sending'}
                          className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium transition-colors border border-amber-200"
                        >
                          {sendState === 'sending' ? 'Sending...' : 'Verify Email Now'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Professional Headline <span className="text-rose-500">*</span></label>
                          <input
                            type="text"
                            value={teacherHeadline}
                            onChange={e => setTeacherHeadline(e.target.value)}
                            placeholder="e.g. Native English Speaker with 3 years experience"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Experience (Years) <span className="text-rose-500">*</span></label>
                            <input
                              type="number"
                              value={teacherExperience}
                              onChange={e => setTeacherExperience(e.target.value)}
                              min="0"
                              placeholder="e.g. 3"
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Video Intro URL (Optional)</label>
                            <input
                              type="text"
                              value={teacherVideo}
                              onChange={e => setTeacherVideo(e.target.value)}
                              placeholder="https://youtube.com/..."
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Certificates (Optional)</label>
                          <textarea
                            rows={2}
                            value={teacherCertificates}
                            onChange={e => setTeacherCertificates(e.target.value)}
                            placeholder="e.g. TEFL, TESOL, CELTA"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                          />
                        </div>
                      </div>

                      {teacherErrorMsg && (
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-100">
                          {teacherErrorMsg}
                        </div>
                      )}

                      {teacherSubmitState === 'success' && (
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm border border-emerald-100 font-medium">
                          ✓ Successfully registered as a teacher!
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={handleRegisterTeacher}
                          disabled={teacherSubmitState === 'loading' || teacherSubmitState === 'success'}
                          className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {teacherSubmitState === 'loading' && <Loader2 size={16} className="animate-spin" />}
                          {teacherSubmitState === 'loading' ? 'Submitting...' : 'Register as Teacher'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}