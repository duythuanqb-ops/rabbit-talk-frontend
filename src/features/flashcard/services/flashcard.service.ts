import { apiCall } from '@/shared/api/client';

export const flashcardService = {
  
  getMySets: async () => {
    return apiCall('/flashcard-sets', { method: 'GET' });
  },

  
  createSet: async (groupId: string, title: string, description: string) => {
    return apiCall(`/groups/${groupId}/flashcard-sets`, {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  },

  
  getCardsForSet: async (setId: string) => {
    return apiCall(`/flashcard-sets/${setId}/cards`, { method: 'GET' });
  },

  
  addCard: async (setId: string, word: string) => {
    return apiCall(`/flashcard-sets/${setId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ word }),
    });
  },

  
  updateProgress: async (cardId: string, status: 'learning' | 'mastered') => {
    return apiCall(`/flashcards/${cardId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  
  updateCard: async (cardId: string, data: { word: string; phonetic?: string; part_of_speech?: string; meaning?: string; synonyms?: string; example_sentence?: string }) => {
    return apiCall(`/flashcards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  
  deleteCard: async (cardId: string) => {
    return apiCall(`/flashcards/${cardId}`, {
      method: 'DELETE',
    });
  },

  
  updateSet: async (setId: string, title: string, description: string) => {
    return apiCall(`/flashcard-sets/${setId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description }),
    });
  },

  
  deleteSet: async (setId: string) => {
    return apiCall(`/flashcard-sets/${setId}`, {
      method: 'DELETE',
    });
  },

  
  updatePublishStatus: async (setId: string, isPublished: boolean) => {
    return apiCall(`/flashcard-sets/${setId}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ is_published: isPublished }),
    });
  },

  
  parseOcrText: async (text: string): Promise<string[]> => {
    return apiCall('/flashcard-sets/parse-ocr', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  
  parseImage: async (file: File): Promise<string[]> => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCall('/flashcard-sets/parse-image', {
      method: 'POST',
      body: formData,
    });
  },
};
