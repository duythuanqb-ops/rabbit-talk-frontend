import { motion } from 'framer-motion';
import SignInForm from '@/features/auth/components/SignInForm';

interface Props {
  onSwitchToSignUp: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function AuthCard({ onSwitchToSignUp }: Props) {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      <motion.div variants={item} className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary/90">Sign in</p>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl tracking-tight">Welcome back.</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Use your email and password to sign in or continue with Google.
        </p>
      </motion.div>

      <motion.div variants={item}>
        <SignInForm />
      </motion.div>

      <motion.div variants={item} className="text-center text-sm text-muted-foreground pt-4">
        Don&apos;t have an account?{' '}
        <button
          onClick={onSwitchToSignUp}
          className="font-semibold text-foreground hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4"
        >
          Sign up
        </button>
      </motion.div>
    </motion.div>
  );
}

