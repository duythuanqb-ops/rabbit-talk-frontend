import { apiCall } from '@/shared/api/client';
import { User } from '@/shared/types/api.types';

export const userAPI = {
  create: (data: Partial<User>) => apiCall<{ data: User }>('/users', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => apiCall<{ data: User[] }>('/users'),
  updateProfile: (data: unknown) => apiCall('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (data: unknown) => apiCall('/users/password', { method: 'PUT', body: JSON.stringify(data) }),
};
