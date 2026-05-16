'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/features/auth/services/auth.service';
import { EyeIcon, EyeOffIcon } from '@/shared/icons';

export default function SignInForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const result = await login(identifier, password);
      setSuccess(result.message || 'Login successful');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-600 border border-emerald-100">
            {success}
          </div>
        )}
        <label className="block text-sm font-medium text-slate-700">
          Email or username
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email or username"
            required
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700 relative">
          Password
          <div className="relative mt-3">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </label>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span />
        <a href="#" className="font-medium text-emerald-600 hover:text-emerald-700">
          Forgot password?
        </a>
      </div>

      <div className="space-y-4">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div className="relative flex items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-400">
          <span className="absolute left-0 right-0 top-1/2 h-px bg-slate-200" />
          <span className="relative bg-white px-3">or</span>
        </div>

        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.5 12.2814C23.5 11.4167 23.4292 10.7083 23.2917 10.0208H12.25V13.9792H18.2625C18.0575 15.0625 17.4025 16.0104 16.4042 16.6458V19.5208H19.8125C21.6775 17.9167 23 15.303 23 12.2814Z" fill="#4285F4" />
            <path d="M12.25 23.5C14.5075 23.5 16.4075 22.6896 17.8875 21.3542L14.4042 18.6458C13.6042 19.2292 12.6142 19.5625 11.5 19.5625C9.2975 19.5625 7.4075 18.0625 6.6375 16.0521H3.0125V18.9792C4.4825 21.9792 8.05 23.5 12.25 23.5Z" fill="#34A853" />
            <path d="M6.6375 16.0521C6.3125 15.3646 6.125 14.6042 6.125 13.8125C6.125 13.0208 6.3125 12.2604 6.6375 11.5729V8.64583H3.0125C2.3375 10.0625 2 11.7188 2 13.8125C2 15.9062 2.3375 17.5625 3.0125 18.9792L6.6375 16.0521Z" fill="#FBBC05" />
            <path d="M12.25 6.0625C13.7775 6.0625 15.1375 6.64583 16.1625 7.64583L19.9 3.97917C17.8825 2.0625 15.1675 1 12.25 1C8.05 1 4.4825 2.52083 3.0125 5.52083L6.6375 8.44792C7.4075 6.4375 9.2975 4.9375 11.5 4.9375C12.6142 4.9375 13.6042 5.27083 14.4042 5.85417L12.25 6.0625Z" fill="#EA4335" />
          </svg>
          Sign in with Google
        </button>
      </div>
    </form>
  );
}
