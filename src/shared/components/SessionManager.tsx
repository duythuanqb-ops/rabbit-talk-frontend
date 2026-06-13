'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import config from '@/config';


export default function SessionManager() {
  const pathname = usePathname();
  const router = useRouter();
  const hasRefreshedOnMount = useRef(false);

  useEffect(() => {
    const authRoutes = ['/sign-in', '/sign-up', '/', '/forgot-password', '/verify-email'];
    const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith('/sign-') || pathname.startsWith('/forgot-password') || pathname.startsWith('/verify-email'));

    if (isAuthRoute) {
      
      hasRefreshedOnMount.current = false;
      return;
    }

    
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
          
          hasRefreshedOnMount.current = true; 
        }
      })();
    }

    
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
    }, 10 * 60 * 1000); 

    return () => clearInterval(interval);
  }, [pathname, router]);

  return null;
}
