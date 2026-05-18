import config from '@/config';

const API_URL = config.apiUrl;

const NO_REFRESH_ENDPOINTS = ['/auth/login', '/auth/logout', '/auth/refresh', '/auth/google'];

function redirectToSignIn() {
  if (typeof window !== 'undefined') {
    window.location.href = '/sign-in';
  }
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    credentials: 'include',
  };

  let response = await fetch(url, fetchOptions);

  // If unauthorized and not a no-refresh endpoint, attempt token refresh
  const shouldAttemptRefresh = response.status === 401 &&
    !NO_REFRESH_ENDPOINTS.some(ep => endpoint.includes(ep));

  if (shouldAttemptRefresh) {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        // Retry the original request with fresh token
        response = await fetch(url, fetchOptions);
      } else {
        // Refresh token is invalid/expired — session is lost, force logout
        console.warn('[apiCall] Refresh token expired. Redirecting to sign-in.');
        redirectToSignIn();
        throw new Error('Session expired. Please sign in again.');
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'Session expired. Please sign in again.') {
        throw err;
      }
      console.error('[apiCall] Refresh token request failed:', err);
      redirectToSignIn();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json();
}
