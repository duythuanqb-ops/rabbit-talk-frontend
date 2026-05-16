import { User } from '@/shared/types/api.types';

export interface LoginResponse {
  message: string;
  user: User;
}

export interface SignUpResponse {
  message: string;
  user: User;
}
