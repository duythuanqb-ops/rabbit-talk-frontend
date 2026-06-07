import { apiCall } from '@/shared/api/client';

export const dashboardService = {
  getTeacherStats: () => apiCall('/dashboard/teacher/stats'),
  getTeacherAlerts: () => apiCall('/dashboard/teacher/alerts'),
  getLeaderboard: (scope: 'global' | 'friends' = 'global') => apiCall(`/dashboard/leaderboard?scope=${scope}`),
  getProfileStats: () => apiCall('/dashboard/profile'),
  getStudentStats: () => apiCall('/dashboard/student/stats'),
  getStudentAssignments: () => apiCall('/dashboard/student/assignments'),
  getStudentQuests: () => apiCall('/dashboard/student/quests'),
  getStudentAttendance: () => apiCall('/dashboard/student/attendance'),
  getStudentVocabulary: () => apiCall('/dashboard/student/vocabulary'),
  getVocabularyStudyCards: () => apiCall('/dashboard/student/vocabulary/study'),
  trackQuestProgress: (questType: string, increment: number = 1) => apiCall('/dashboard/student/quests/track', { method: 'POST', body: JSON.stringify({ questType, increment }) }),
  toggleVocabularyStar: (flashcardId: string) => apiCall(`/dashboard/student/vocabulary/star?flashcardId=${flashcardId}`, { method: 'POST' }),
  addCustomWord: (word: string, meaning?: string, phonetic?: string) => apiCall('/dashboard/student/vocabulary/custom', { method: 'POST', body: JSON.stringify({ word, meaning, phonetic }) }),
  updateCustomWord: (id: string, word: string, meaning?: string) => apiCall(`/dashboard/student/vocabulary/custom/${id}`, { method: 'PUT', body: JSON.stringify({ word, meaning }) }),
  deleteCustomWord: (id: string) => apiCall(`/dashboard/student/vocabulary/custom/${id}`, { method: 'DELETE' }),
  checkInStudent: () => apiCall('/dashboard/student/checkin', { method: 'POST' }),
};
