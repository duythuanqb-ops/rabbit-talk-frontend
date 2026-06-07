'use client';

import { useEffect, useRef } from 'react';
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
  const hasRefreshedOnMount = useRef(false);

  useEffect(() => {
    const authRoutes = ['/sign-in', '/sign-up', '/', '/forgot-password', '/verify-email'];
    const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith('/sign-') || pathname.startsWith('/forgot-password') || pathname.startsWith('/verify-email'));

    if (isAuthRoute) {
      // Reset so that when they log in again, we can do a refresh on mount if they reload
      hasRefreshedOnMount.current = false;
      return;
    }

    /**
     * Attempt to refresh the token.
     * Returns:
     * - 'success': Token refreshed successfully.
     * - 'expired': Refresh token is expired or invalid (401/403).
     * - 'network_error': Server is down, request aborted, or other network failure.
     */
    async function tryRefresh(): Promise<'success' | 'expired' | 'network_error'> {
      try {
        const res = await fetch(`${config.apiUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) return 'success';
        if (res.status === 401 || res.status === 403) return 'expired';
        return 'network_error';
      } catch (err) {
        console.warn('[SessionManager] tryRefresh caught exception:', err);
        return 'network_error';
      }
    }

    // Immediately refresh on mount for protected routes ONLY once per app load.
    // This prevents redundant requests during rapid client-side navigations.
    if (!hasRefreshedOnMount.current) {
      (async () => {
        const result = await tryRefresh();
        if (result === 'success') {
          console.debug('[SessionManager] Token refreshed on initial mount');
          hasRefreshedOnMount.current = true;
        } else if (result === 'expired') {
          console.warn('[SessionManager] Session expired on mount. Redirecting to sign-in.');
          router.replace('/sign-in');
        } else {
          console.warn('[SessionManager] Network issue during mount refresh. Allowing session to continue.');
          // Do not redirect to sign-in on network errors!
          hasRefreshedOnMount.current = true; // Mark as done to prevent infinite retries
        }
      })();
    }

    // Proactively refresh every 10 minutes to keep session alive
    const interval = setInterval(async () => {
      const result = await tryRefresh();
      if (result === 'success') {
        console.debug('[SessionManager] Token proactively refreshed');
      } else if (result === 'expired') {
        console.warn('[SessionManager] Proactive refresh failed (session expired). Redirecting to sign-in.');
        router.replace('/sign-in');
      } else {
        console.warn('[SessionManager] Proactive refresh failed due to network. Will retry next interval.');
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [pathname, router]);

  return null;
}
