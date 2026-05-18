import { apiCall } from '@/shared/api/client';

export async function getTeacherRequests() {
  return apiCall('/admin/teachers/requests', {
    method: 'GET',
  });
}

export async function approveTeacherRequest(uuid: string) {
  return apiCall(`/admin/teachers/requests/${uuid}/approve`, {
    method: 'PATCH',
  });
}

export async function rejectTeacherRequest(uuid: string) {
  return apiCall(`/admin/teachers/requests/${uuid}/reject`, {
    method: 'PATCH',
  });
}
