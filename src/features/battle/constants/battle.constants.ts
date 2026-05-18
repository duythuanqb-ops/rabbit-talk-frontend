import { WordItem, Player } from '../types/battle.types';

export const defaultWords: WordItem[] = [
  { id: 1, word: 'RESTAURANT', hint: 'A place where you eat food' },
  { id: 2, word: 'BEAUTIFUL',  hint: 'Something that looks very nice' },
  { id: 3, word: 'ADVENTURE',  hint: 'An exciting journey or experience' },
  { id: 4, word: 'KNOWLEDGE',  hint: 'Information and understanding' },
  { id: 5, word: 'VOCABULARY', hint: 'A collection of words' },
];

export const mockPlayers: Player[] = [
  { name: 'Sarah K.',   initials: 'SK', score: 0, answered: false, correct: false },
  { name: 'Leo Chen',   initials: 'LC', score: 0, answered: false, correct: false },
  { name: 'Ben Wilson', initials: 'BW', score: 0, answered: false, correct: false },
  { name: 'Emma S.',    initials: 'ES', score: 0, answered: false, correct: false },
  { name: 'James T.',   initials: 'JT', score: 0, answered: false, correct: false },
];
