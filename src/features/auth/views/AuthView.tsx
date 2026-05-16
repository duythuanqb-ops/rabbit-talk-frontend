'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AuthCard from '../components/AuthCard';
import SignUpCard from '../components/SignUpCard';

export default function AuthView() {
  const pathname = usePathname();
  const router = useRouter();
  const isSignUpPath = pathname === '/sign-up';

  const [panelIsSignUp, setPanelIsSignUp] = useState(isSignUpPath);
  const [formIsSignUp, setFormIsSignUp] = useState(isSignUpPath);
  const [formVisible, setFormVisible] = useState(true);

  useEffect(() => {
    setPanelIsSignUp(isSignUpPath);
    setFormIsSignUp(isSignUpPath);
  }, [isSignUpPath]);

  const switchTo = (toSignUp: boolean) => {
    const newPath = toSignUp ? '/sign-up' : '/sign-in';
    
    setPanelIsSignUp(toSignUp);
    setFormVisible(false);
    
    // Change URL
    router.push(newPath, { scroll: false });

    setTimeout(() => {
      setFormIsSignUp(toSignUp);
      setFormVisible(true);
    }, 200);
  };

  const formContent = formIsSignUp ? (
    <SignUpCard onSwitchToSignIn={() => switchTo(false)} />
  ) : (
    <AuthCard onSwitchToSignUp={() => switchTo(true)} />
  );

  return (
    <>
      {/* ========== MOBILE (< lg) ========== */}
      <main className="lg:hidden min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 px-6 py-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/rabbit-mascot.png"
            alt="RibbitTalk rabbit mascot"
            className="h-36 w-auto drop-shadow-md"
          />
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-emerald-600">RibbitTalk</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900 leading-tight text-center">
            {panelIsSignUp ? 'Start your journey' : 'Learn every day,'}
            <span className="block text-emerald-600 text-2xl">
              {panelIsSignUp ? 'one lesson at a time.' : 'smile every hour.'}
            </span>
          </h1>
        </div>

        {/* Form */}
        <div
          className="w-full max-w-sm"
          style={{ opacity: formVisible ? 1 : 0, transition: 'opacity 0.25s ease-in-out' }}
        >
          {formContent}
        </div>
      </main>

      {/* ========== DESKTOP (lg+) ========== */}
      <main className="hidden lg:block relative h-screen overflow-hidden text-slate-900">
        {/* Gradient branding panel */}
        <section
          className="absolute top-0 h-full flex flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-400 via-lime-300 to-amber-200 px-16 py-14"
          style={{
            width: '55%',
            left: panelIsSignUp ? '45%' : '0%',
            transition: 'left 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 10,
          }}
        >
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-600/20 blur-3xl" />

          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-[0.35em] text-emerald-950/70">RibbitTalk</p>
            <h1 className="mt-6 text-5xl font-bold leading-tight text-slate-900 xl:text-6xl">
              {panelIsSignUp ? 'Start your journey,' : 'Learn every day,'}
              <span className="block text-emerald-800">
                {panelIsSignUp ? 'one lesson at a time.' : 'smile every hour.'}
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-800/80">
              {panelIsSignUp
                ? 'Join thousands of young learners and start speaking with confidence 🌱'
                : 'From tadpole to champion — every lesson feels friendly and fun 🌿'}
            </p>
          </div>

          <div className="relative z-10 flex flex-1 items-end justify-center pb-4">
            <img
              src="/rabbit-mascot.png"
              alt="RibbitTalk rabbit mascot"
              className="h-[380px] w-auto drop-shadow-2xl"
            />
          </div>

          <p className="relative z-10 text-xs text-slate-700/60">
            © 2026 RibbitTalk · Built for young learners everywhere
          </p>
        </section>

        {/* Form panel */}
        <section
          className="absolute top-0 h-full flex flex-col items-center justify-center overflow-y-auto bg-white px-12 py-12"
          style={{
            width: '45%',
            left: panelIsSignUp ? '0%' : '55%',
            transition: 'left 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 10,
          }}
        >
          <div
            className="w-full max-w-md"
            style={{ opacity: formVisible ? 1 : 0, transition: 'opacity 0.25s ease-in-out' }}
          >
            {formContent}
          </div>
        </section>
      </main>
    </>
  );
}
