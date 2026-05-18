'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import config from '@/config';

/**
 * SessionManager handles proactive token refreshing.
 * - On mount (when entering a protected route): immediately tries to refresh to extend session.
 * - Every 10 minutes: proactively refreshes to keep session alive without waiting for a 401.
 * - If refresh fails: redirects user to sign-in (session truly expired).
 */
export default function SessionManager() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const authRoutes = ['/sign-in', '/sign-up', '/'];
    const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith('/sign-'));

    if (isAuthRoute) return;

    /**
     * Attempt to refresh the token. Returns true if successful, false if session is dead.
     */
    async function tryRefresh(): Promise<boolean> {
      try {
        const res = await fetch(`${config.apiUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        return res.ok;
      } catch {
        return false;
      }
    }

    // Immediately refresh on mount for protected routes.
    // This ensures a long-idle session gets a fresh token before any API call is made.
    (async () => {
      const ok = await tryRefresh();
      if (ok) {
        console.debug('[SessionManager] Token refreshed on mount');
      } else {
        console.warn('[SessionManager] Session expired on mount. Redirecting to sign-in.');
        router.replace('/sign-in');
      }
    })();

    // Proactively refresh every 10 minutes to keep session alive
    const interval = setInterval(async () => {
      const ok = await tryRefresh();
      if (ok) {
        console.debug('[SessionManager] Token proactively refreshed');
      } else {
        console.warn('[SessionManager] Proactive refresh failed. Redirecting to sign-in.');
        router.replace('/sign-in');
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [pathname, router]);

  return null;
}
