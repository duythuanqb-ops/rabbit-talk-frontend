import { useState, useEffect, useRef } from 'react';
import { Mail, X, Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { verifyEmailOtp, sendVerificationEmail } from '@/features/auth/services/auth.service';

export function OtpModal({
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
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X size={18} />
        </button>

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

        {errorMsg && (
          <p className="text-center text-sm text-rose-500 mb-4">{errorMsg}</p>
        )}

        {submitState === 'success' && (
          <p className="text-center text-sm text-emerald-600 font-medium mb-4">✓ Email verified successfully!</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitState === 'loading' || submitState === 'success'}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitState === 'loading' && <Loader2 size={16} className="animate-spin" />}
          {submitState === 'success' ? 'Verified ✓' : submitState === 'loading' ? 'Verifying…' : 'Verify Email'}
        </button>

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