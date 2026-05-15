import config from '@/config';

const API_URL = config.apiUrl;

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    const message = Array.isArray(error.message) ? error.message.join(', ') : error.message;
    throw new Error(message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const userAPI = {
  create: (data: any) => apiCall('/users', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => apiCall('/users'),
};
