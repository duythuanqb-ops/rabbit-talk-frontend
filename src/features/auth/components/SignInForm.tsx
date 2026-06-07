'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, googleLogin } from '@/features/auth/services/auth.service';
import { EyeIcon, EyeOffIcon } from '@/shared/icons';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/Button';

export default function SignInForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setError(null);
      setSuccess(null);
      setLoading(true);
      try {
        const result = await googleLogin(tokenResponse.access_token);
        setSuccess(result.message || 'Google login successful');
        router.push('/dashboard');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || 'Google login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google login failed'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFieldErrors({});
    
    // Custom validation
    const errors: { identifier?: string; password?: string } = {};
    if (!identifier) errors.identifier = 'Please enter your email or username';
    if (!password) errors.password = 'Please enter your password';
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const result = await login(identifier, password);
      setSuccess(result.message || 'Login successful');
      router.push('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };


  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
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
        <label className="block text-sm font-medium text-foreground">
          Email or username
          <input
            type="text"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              if (fieldErrors.identifier) setFieldErrors({ ...fieldErrors, identifier: undefined });
            }}
            placeholder="Email or username"
            className={`mt-3 w-full rounded-2xl border ${fieldErrors.identifier ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/50 focus:ring-emerald-500/50'} px-4 py-3 text-sm text-foreground shadow-sm backdrop-blur-sm outline-none transition-all focus:bg-white dark:focus:bg-black focus:ring-2 focus:shadow-md`}
          />
          {fieldErrors.identifier && (
            <span className="mt-2 block text-xs text-red-500 font-medium">{fieldErrors.identifier}</span>
          )}
        </label>

        <label className="block text-sm font-medium text-foreground relative">
          Password
          <div className="relative mt-3">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: undefined });
              }}
              placeholder="Password"
              className={`w-full rounded-2xl border ${fieldErrors.password ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-slate-200 dark:border-white/10 bg-white/50 dark:bg-black/50 focus:ring-emerald-500/50'} px-4 py-3 text-sm text-foreground shadow-sm backdrop-blur-sm outline-none transition-all focus:bg-white dark:focus:bg-black focus:ring-2 focus:shadow-md pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {fieldErrors.password && (
            <span className="mt-2 block text-xs text-red-500 font-medium">{fieldErrors.password}</span>
          )}
        </label>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-500">
        <span />
        <button
          type="button"
          onClick={() => router.push('/forgot-password')}
          className="font-medium text-emerald-600 hover:text-emerald-700"
        >
          Forgot password?
        </button>
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          disabled={loading}
          isLoading={loading}
          className="w-full"
          variant="primary"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>

        <div className="relative flex items-center justify-center text-xs uppercase tracking-[0.3em] text-slate-400">
          <span className="absolute left-0 right-0 top-1/2 h-px bg-slate-200 dark:bg-slate-800" />
          <span className="relative bg-white/80 dark:bg-black/80 backdrop-blur-sm px-3 rounded-full">or</span>
        </div>

        <Button
          type="button"
          onClick={() => handleGoogleLogin()}
          disabled={loading}
          className="w-full"
          variant="outline"
          leftIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.5 12.2814C23.5 11.4167 23.4292 10.7083 23.2917 10.0208H12.25V13.9792H18.2625C18.0575 15.0625 17.4025 16.0104 16.4042 16.6458V19.5208H19.8125C21.6775 17.9167 23 15.303 23 12.2814Z" fill="#4285F4" />
              <path d="M12.25 23.5C14.5075 23.5 16.4075 22.6896 17.8875 21.3542L14.4042 18.6458C13.6042 19.2292 12.6142 19.5625 11.5 19.5625C9.2975 19.5625 7.4075 18.0625 6.6375 16.0521H3.0125V18.9792C4.4825 21.9792 8.05 23.5 12.25 23.5Z" fill="#34A853" />
              <path d="M6.6375 16.0521C6.3125 15.3646 6.125 14.6042 6.125 13.8125C6.125 13.0208 6.3125 12.2604 6.6375 11.5729V8.64583H3.0125C2.3375 10.0625 2 11.7188 2 13.8125C2 15.9062 2.3375 17.5625 3.0125 18.9792L6.6375 16.0521Z" fill="#FBBC05" />
              <path d="M12.25 6.0625C13.7775 6.0625 15.1375 6.64583 16.1625 7.64583L19.9 3.97917C17.8825 2.0625 15.1675 1 12.25 1C8.05 1 4.4825 2.52083 3.0125 5.52083L6.6375 8.44792C7.4075 6.4375 9.2975 4.9375 11.5 4.9375C12.6142 4.9375 13.6042 5.27083 14.4042 5.85417L12.25 6.0625Z" fill="#EA4335" />
            </svg>
          }
        >
          Sign in with Google
        </Button>
      </div>
    </form>
  );
}
