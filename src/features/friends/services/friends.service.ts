import { apiCall } from '@/shared/api/client';
import { ApiResponse } from '@/shared/types/api.types';
import { Friend, PendingRequest, SearchUserResult } from '../types/friends.types';

export const friendsService = {
  getFriends: () => {
    return apiCall<ApiResponse<Friend[]>>('/friends', {
      method: 'GET',
    });
  },

  getPendingRequests: () => {
    return apiCall<ApiResponse<PendingRequest[]>>('/friends/requests/pending', {
      method: 'GET',
    });
  },

  sendFriendRequest: (receiverIdentifier: string) => {
    return apiCall<ApiResponse<{ success: boolean; status: string; message: string }>>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ receiverIdentifier }),
    });
  },

  respondFriendRequest: (requestId: string, accept: boolean) => {
    return apiCall<ApiResponse<{ success: boolean; message: string }>>(`/friends/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ accept }),
    });
  },

  unfriend: (friendUuid: string) => {
    return apiCall<ApiResponse<{ success: boolean; message: string }>>(`/friends/${friendUuid}`, {
      method: 'DELETE',
    });
  },

  searchUsers: (query: string) => {
    return apiCall<ApiResponse<SearchUserResult[]>>(`/friends/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    });
  }
};
