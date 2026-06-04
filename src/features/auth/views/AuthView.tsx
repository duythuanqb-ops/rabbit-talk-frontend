/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AuthCard from '../components/AuthCard';
import SignUpCard from '../components/SignUpCard';

export default function AuthView() {
  const pathname = usePathname();
  const router = useRouter();
  const isSignUpPath = pathname === '/sign-up';

  const [panelIsSignUp, setPanelIsSignUp] = useState(isSignUpPath);
  const [formIsSignUp, setFormIsSignUp] = useState(isSignUpPath);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkIsDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPanelIsSignUp(isSignUpPath);
    setFormIsSignUp(isSignUpPath);
  }, [isSignUpPath]);

  const switchTo = (toSignUp: boolean) => {
    const newPath = toSignUp ? '/sign-up' : '/sign-in';
    setPanelIsSignUp(toSignUp);
    // Change URL
    router.push(newPath, { scroll: false });
    // Switch the form immediately; AnimatePresence handles the transition
    setFormIsSignUp(toSignUp);
  };

  const formContent = formIsSignUp ? (
    <SignUpCard onSwitchToSignIn={() => switchTo(false)} />
  ) : (
    <AuthCard onSwitchToSignUp={() => switchTo(true)} />
  );

  return (
    <main className="relative min-h-screen lg:h-screen flex flex-col lg:block overflow-x-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* ========== MOBILE HEADER (< lg) ========== */}
      <div className="lg:hidden flex flex-col items-center px-6 pt-10 pb-6 z-10 relative">
        <motion.img
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          src="/rabbit-mascot.png"
          alt="RibbitTalk rabbit mascot"
          className="h-36 w-auto drop-shadow-lg"
        />
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mt-2 text-xs font-bold uppercase tracking-[0.35em] text-primary"
        >
          RibbitTalk
        </motion.p>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-4 text-3xl font-bold text-foreground leading-tight text-center tracking-tight"
        >
          {panelIsSignUp ? 'Start your journey' : 'Learn every day,'}
          <span className="block text-primary text-2xl mt-1">
            {panelIsSignUp ? 'one lesson at a time.' : 'smile every hour.'}
          </span>
        </motion.h1>
      </div>

      {/* ========== DESKTOP BRANDING PANEL (lg+) ========== */}
      <motion.section
        className="hidden lg:flex absolute top-0 h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 dark:from-emerald-900 dark:via-[#050505] dark:to-[#050505] px-16 py-14 shadow-2xl"
        initial={false}
        animate={{
          width: '55%',
          left: panelIsSignUp ? '45%' : '0%',
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ zIndex: 10 }}
      >
        {/* Subtle Ambient Glow Orbs */}
        <div className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-emerald-300/30 dark:bg-emerald-500/10 blur-[120px] mix-blend-screen animate-float" />
        <div className="absolute top-[40%] -right-[20%] h-[500px] w-[500px] rounded-full bg-lime-300/20 dark:bg-lime-500/5 blur-[100px] mix-blend-screen animate-float" style={{ animationDelay: '-3s' }} />

        {/* Ethereal Glass Container for Content */}
        <div className="relative z-10 glass rounded-3xl p-10 border border-white/20 shadow-2xl backdrop-blur-md bg-white/10 dark:bg-black/20">
          <motion.p 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-100 drop-shadow-sm mb-6"
          >
            RibbitTalk
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
            className="text-5xl font-bold leading-[1.1] text-white xl:text-6xl tracking-tight drop-shadow-md"
          >
            {panelIsSignUp ? 'Start your journey,' : 'Learn every day,'}
            <span className="block text-emerald-100 mt-2">
              {panelIsSignUp ? 'one lesson at a time.' : 'smile every hour.'}
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            className="mt-6 max-w-md text-lg leading-relaxed text-emerald-50/90 font-medium"
          >
            {panelIsSignUp
              ? 'Join thousands of young learners and start speaking with confidence 🌱'
              : 'From tadpole to champion — every lesson feels friendly and fun 🌿'}
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5, type: 'spring', bounce: 0.4 }}
          className="relative z-10 flex flex-1 items-end justify-center pb-4 mt-12"
        >
          <div className="relative group">
            {/* Mascot glow effect */}
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-50 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <motion.img
              whileHover={{ scale: 1.05, rotate: [0, -2, 2, -2, 0] }}
              transition={{ duration: 0.5 }}
              src="/rabbit-mascot.png"
              alt="RibbitTalk rabbit mascot"
              className="relative h-[380px] w-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] cursor-pointer z-10"
            />
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="relative z-10 text-xs font-medium text-emerald-200/60 tracking-wide mt-4"
        >
          © 2026 RibbitTalk · Built for young learners everywhere
        </motion.p>
      </motion.section>

      {/* ========== SHARED FORM PANEL ========== */}
      <motion.section
        className="flex-1 flex flex-col items-center lg:absolute lg:top-0 lg:h-full lg:justify-center overflow-y-auto bg-background px-6 pb-10 lg:px-12 lg:py-12 z-10 relative w-full lg:w-[45%]"
        initial={false}
        animate={{
          left: isDesktop ? (panelIsSignUp ? '0%' : '55%') : '0%',
        }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={formIsSignUp ? 'signup' : 'signin'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm lg:max-w-md"
          >
            {formContent}
          </motion.div>
        </AnimatePresence>
      </motion.section>
    </main>
  );
}

