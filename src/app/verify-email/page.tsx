'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiCall } from '@/shared/api/client';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setTimeout(() => {
        setStatus('error');
        setMessage('No verification token found. Please use the link from your email.');
      }, 0);
      return;
    }

    const verify = async () => {
      try {
        const res = await apiCall<{ message?: string }>(`/auth/verify-email?token=${token}`, { method: 'GET' });
        setStatus('success');
        setMessage(res?.message || 'Your email has been verified successfully!');
      } catch (err: unknown) {
        setStatus('error');
        setMessage((err as Error).message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center">
        {}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 text-white text-3xl font-bold shadow-lg shadow-emerald-500/30 mb-4">
            🐸
          </div>
          <h1 className="text-xl font-bold text-slate-900">RibbitTalk</h1>
        </div>

        {}
        {status === 'loading' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Loader2 size={52} className="text-emerald-500 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800">Verifying your email…</h2>
            <p className="text-slate-500 text-sm">Please wait a moment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle size={56} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Email Verified!</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="mt-4 w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-emerald-500/25"
            >
              Go to Settings
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <XCircle size={56} className="text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
            <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
            <button
              onClick={() => router.push('/dashboard/settings')}
              className="mt-4 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Back to Settings
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <Loader2 size={40} className="text-emerald-500 animate-spin" />
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
