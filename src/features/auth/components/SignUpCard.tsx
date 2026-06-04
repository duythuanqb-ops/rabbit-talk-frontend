import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/shared/utils/motion';
import SignUpForm from './SignUpForm';

interface Props {
  onSwitchToSignIn: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SignUpCard({ onSwitchToSignIn }: Props) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="space-y-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary/90">Sign up</p>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl tracking-tight">Create account.</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          Join RibbitTalk and start your learning journey today.
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <SignUpForm onSuccess={onSwitchToSignIn} />
      </motion.div>

      <motion.div variants={itemVariants} className="text-center text-sm text-muted-foreground pt-2">
        Already have an account?{' '}
        <button
          onClick={onSwitchToSignIn}
          className="font-semibold text-foreground hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-4"
        >
          Sign in
        </button>
      </motion.div>
    </motion.div>
  );
}
