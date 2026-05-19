import { apiCall } from '@/shared/api/client';
import { Group, GroupMember, CreateGroupDto, UpdateGroupDto } from '../types/groups.types';
import { ApiResponse } from '@/shared/types/api.types';

export const groupsService = {
  getGroups: () => {
    return apiCall<ApiResponse<Group[]>>('/groups', {
      method: 'GET',
    });
  },

  getGroupById: (id: string) => {
    return apiCall<ApiResponse<Group>>(`/groups/${id}`, {
      method: 'GET',
    });
  },

  createGroup: (data: CreateGroupDto) => {
    return apiCall<ApiResponse<Group>>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGroup: (id: string, data: UpdateGroupDto) => {
    return apiCall<ApiResponse<Group>>(`/groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteGroup: (id: string) => {
    return apiCall<ApiResponse<{ success: boolean }>>(`/groups/${id}`, {
      method: 'DELETE',
    });
  },

  getGroupMembers: (groupId: string) => {
    return apiCall<ApiResponse<GroupMember[]>>(`/groups/${groupId}/members`, {
      method: 'GET',
    });
  },

  addMember: (groupId: string, identifier: string) => {
    return apiCall<ApiResponse<{ success: boolean; message: string }>>(`/groups/${groupId}/members`, {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  removeMember: (groupId: string, userId: string) => {
    return apiCall<ApiResponse<{ success: boolean; message: string }>>(`/groups/${groupId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  uploadAvatar: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiCall<ApiResponse<Group>>(`/groups/${id}/avatar`, {
      method: 'POST',
      body: formData,
    });
  }
};
