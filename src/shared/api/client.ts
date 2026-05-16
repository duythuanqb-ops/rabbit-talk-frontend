import config from '@/config';

const API_URL = config.apiUrl;

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  let response = await fetch(url, fetchOptions);

  // If unauthorized and not already trying to auth, try to refresh
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    try {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        // Retry the original request
        response = await fetch(url, fetchOptions);
      }
    } catch (err) {
      console.error('Refresh token failed:', err);
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json();
}


