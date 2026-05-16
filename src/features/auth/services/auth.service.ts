import config from '@/config';
import { apiCall } from '@/shared/api/client';

export async function login(identifier: string, pass: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password: pass }),
  });
}

export async function logout() {
  return apiCall('/auth/logout', {
    method: 'POST',
  });
}

export async function googleLogin(token: string) {
  return apiCall('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
