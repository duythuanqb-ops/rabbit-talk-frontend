'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import config from '@/config';

/**
 * SessionManager handles proactive token refreshing.
 * It calls the refresh endpoint every 10 minutes to ensure the session remains active
 * without waiting for an API call to fail with 401.
 */
export default function SessionManager() {
  const pathname = usePathname();

  useEffect(() => {
    // List of routes where we don't need to proactively refresh
    const authRoutes = ['/sign-in', '/'];
    const isAuthRoute = authRoutes.includes(pathname);

    // Initial check: if we just loaded the dashboard, maybe refresh once
    // but the interceptor in apiCall will handle it anyway.

    const interval = setInterval(async () => {
      if (!isAuthRoute) {
        try {
          const res = await fetch(`${config.apiUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          
          if (res.ok && config.nodeEnv !== 'production') {
            console.debug('[SessionManager] Token proactively refreshed');
          }
        } catch (err) {
          // Silent fail for background refresh
          console.debug('[SessionManager] Proactive refresh failed', err);
        }
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}
