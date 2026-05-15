import SignInForm from '@/features/auth/components/SignInForm';

interface Props {
  onSwitchToSignUp: () => void;
}

export default function AuthCard({ onSwitchToSignUp }: Props) {
  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600/90">Sign in</p>
        <h2 className="text-3xl font-semibold text-slate-950 sm:text-4xl">Welcome back.</h2>
        <p className="text-sm leading-6 text-slate-500">
          Use your email and password to sign in or continue with Google.
        </p>
      </div>

      <SignInForm />

      <div className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <button
          onClick={onSwitchToSignUp}
          className="font-semibold text-slate-950 hover:text-emerald-600 transition-colors"
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
