/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import { apiCall } from '@/shared/api/client';
import { User } from '@/shared/types/api.types';

export const userAPI = {
  create: (data: Partial<User>) => apiCall<{ data: User }>('/users', { method: 'POST', body: JSON.stringify(data) }),
  getAll: () => apiCall<{ data: User[] }>('/users'),
  updateProfile: (data: any) => apiCall('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updatePassword: (data: any) => apiCall('/users/password', { method: 'PUT', body: JSON.stringify(data) }),
};
