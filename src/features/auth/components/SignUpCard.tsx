import SignUpForm from './SignUpForm';

interface Props {
  onSwitchToSignIn: () => void;
}

export default function SignUpCard({ onSwitchToSignIn }: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-600/90">Sign up</p>
        <h2 className="text-3xl font-semibold text-slate-950 sm:text-4xl">Create account.</h2>
        <p className="text-sm leading-6 text-slate-500">Join RibbitTalk and start your learning journey today.</p>
      </div>

      <SignUpForm onSuccess={onSwitchToSignIn} />

      <div className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button
          onClick={onSwitchToSignIn}
          className="font-semibold text-slate-950 hover:text-emerald-600 transition-colors"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
