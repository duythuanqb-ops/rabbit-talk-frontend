export type Phase = 'setup' | 'battle' | 'results';

export interface WordItem { id: number; word: string; hint: string; }
export interface Player  { name: string; initials: string; score: number; answered: boolean; correct: boolean; }
