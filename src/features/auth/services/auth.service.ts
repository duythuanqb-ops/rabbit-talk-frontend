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

export async function getProfile() {
  return apiCall('/auth/profile', {
    method: 'GET',
  });
}

export async function sendVerificationEmail() {
  return apiCall('/auth/send-verification-email', {
    method: 'POST',
  });
}

export async function verifyEmailOtp(code: string) {
  return apiCall('/auth/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function updateProfile(data: {
  first_name?: string;
  last_name?: string;
  bio?: string;
}) {
  return apiCall('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiCall('/auth/avatar', {
    method: 'POST',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: formData as any,
  });
}

export async function removeAvatar() {
  return apiCall('/auth/avatar/remove', {
    method: 'PATCH',
  });
}

export async function uploadCover(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiCall('/auth/cover', {
    method: 'POST',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: formData as any,
  });
}

export async function removeCover() {
  return apiCall('/auth/cover/remove', {
    method: 'PATCH',
  });
}

export async function registerTeacher(data: {
  headline: string;
  experience_years: number;
  video_intro_url?: string;
  certificates?: string;
}) {
  return apiCall('/auth/teacher/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(email: string, resend?: boolean) {
  return apiCall('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email, resend }),
  });
}

export async function verifyForgotPasswordOtp(email: string, code: string) {
  return apiCall('/auth/forgot-password/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

export async function resetPassword(email: string, code: string, newPassword: string) {
  return apiCall('/auth/forgot-password/reset', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword }),
  });
}

