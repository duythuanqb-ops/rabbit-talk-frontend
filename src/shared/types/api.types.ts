export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  role?: UserRole;
  avatar_url?: string | null;
  bio?: string;
  is_email_verified?: boolean;
}
