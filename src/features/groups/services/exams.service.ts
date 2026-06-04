import { apiCall } from '@/shared/api/client';

export interface ExamQuestion {
  id?: string;
  word: string;
  type: 'matching' | 'synonym' | 'listening' | 'spelling' | 'situation';
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  audio_url?: string | null;
}

export interface Exam {
  id: string;
  group_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  is_published?: boolean;
  created_at: string;
  question_count?: number;
  student_count?: number;
  attempt_count?: number;
  max_score?: number;
  questions?: ExamQuestion[];
}

export interface ExamAttempt {
  attemptId: string;
  score: number;
  total: number;
  percentage: number;
  gradedQuestions: Array<{
    questionId: string;
    word: string;
    type: string;
    question_text: string;
    studentAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
}

export const examsService = {
  lookupWord: (word: string) =>
    apiCall<{ phonetic: string; audioUrl: string; meaning: string; synonyms: string; exampleSentence: string }>(
      `/exams/lookup-word/${encodeURIComponent(word)}`,
      { method: 'GET' }
    ),

  generateQuestions: (items: string[]) =>
    apiCall<ExamQuestion[]>('/exams/generate', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),

  createExam: (data: { groupId: string; title: string; description?: string; questions: ExamQuestion[] }) =>
    apiCall<Exam>('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateExam: (id: string, data: { title: string; description?: string; questions: ExamQuestion[] }) =>
    apiCall<Exam>(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updatePublishStatus: (id: string, isPublished: boolean) =>
    apiCall<{ success: boolean; is_published: boolean }>(`/exams/${id}/publish`, {
      method: 'PUT',
      body: JSON.stringify({ isPublished }),
    }),

  getMyExams: () =>
    apiCall<Exam[]>('/exams', { method: 'GET' }),

  getExamsByGroup: (groupId: string) =>
    apiCall<Exam[]>(`/exams/group/${groupId}`, { method: 'GET' }),

  getExamById: (id: string) =>
    apiCall<Exam>(`/exams/${id}`, { method: 'GET' }),

  deleteExam: (id: string) =>
    apiCall<{ success: boolean; message: string }>(`/exams/${id}`, { method: 'DELETE' }),

  submitAttempt: (id: string, answers: Record<string, string>) =>
    apiCall<ExamAttempt>(`/exams/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  getAttempts: (id: string) =>
    apiCall<Array<{ id: string; score: number; total_questions: number; answers: string; completed_at: string }>>(`/exams/${id}/attempts`, {
      method: 'GET',
    }),
};
