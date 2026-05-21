import { apiCall } from '@/shared/api/client';

export const flashcardService = {
  // Get all sets for the current user
  getMySets: async () => {
    return apiCall('/flashcard-sets', { method: 'GET' });
  },

  // Create a new flashcard set
  createSet: async (groupId: string, title: string, description: string) => {
    return apiCall(`/groups/${groupId}/flashcard-sets`, {
      method: 'POST',
      body: JSON.stringify({ title, description }),
    });
  },

  // Get all cards for a specific set
  getCardsForSet: async (setId: string) => {
    return apiCall(`/flashcard-sets/${setId}/cards`, { method: 'GET' });
  },

  // Add a new card with AI autogeneration
  addCard: async (setId: string, word: string) => {
    return apiCall(`/flashcard-sets/${setId}/cards`, {
      method: 'POST',
      body: JSON.stringify({ word }),
    });
  },

  // Update study progress for a card
  updateProgress: async (cardId: string, status: 'learning' | 'mastered') => {
    return apiCall(`/flashcards/${cardId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Update a card details manually
  updateCard: async (cardId: string, data: { word: string; phonetic?: string; part_of_speech?: string; meaning?: string; synonyms?: string; example_sentence?: string }) => {
    return apiCall(`/flashcards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a card
  deleteCard: async (cardId: string) => {
    return apiCall(`/flashcards/${cardId}`, {
      method: 'DELETE',
    });
  },

  // Update a flashcard set title and description
  updateSet: async (setId: string, title: string, description: string) => {
    return apiCall(`/flashcard-sets/${setId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description }),
    });
  },

  // Delete an entire flashcard set
  deleteSet: async (setId: string) => {
    return apiCall(`/flashcard-sets/${setId}`, {
      method: 'DELETE',
    });
  },

  // Toggle publish/assign status for a vocabulary set
  updatePublishStatus: async (setId: string, isPublished: boolean) => {
    return apiCall(`/flashcard-sets/${setId}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ is_published: isPublished }),
    });
  },

  // Parse raw OCR text to extract vocabulary words using backend AI
  parseOcrText: async (text: string): Promise<string[]> => {
    return apiCall('/flashcard-sets/parse-ocr', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  },

  // Parse image directly using Gemini Vision API (bypasses Tesseract OCR for higher accuracy)
  parseImage: async (file: File): Promise<string[]> => {
    const formData = new FormData();
    formData.append('image', file);
    return apiCall('/flashcard-sets/parse-image', {
      method: 'POST',
      body: formData,
    });
  },
};
