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

export async function getAdminQuests() {
  return apiCall('/admin/quests', { method: 'GET' });
}

export async function createAdminQuest(data: { title: string; description: string; xp_reward: number; type: string; target_value: number }) {
  return apiCall('/admin/quests', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateAdminQuest(id: string, data: { title: string; description: string; xp_reward: number; type: string; target_value: number }) {
  return apiCall(`/admin/quests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteAdminQuest(id: string) {
  return apiCall(`/admin/quests/${id}`, { method: 'DELETE' });
}
