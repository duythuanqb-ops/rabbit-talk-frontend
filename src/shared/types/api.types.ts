export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface User {
  uuid: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
}
