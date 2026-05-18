const fs = require('fs');

const content = fs.readFileSync('src/app/dashboard/battle/page.tsx', 'utf8');
const sections = content.split(/\/\/ ─── [A-Za-z ]+ ─+/);

// sections[0] is initial imports
// sections[1] is Types
// sections[2] is Setup Phase
// sections[3] is Battle Phase
// sections[4] is Results Phase
// sections[5] is Main Page

const typesAndConsts = sections[1];
const typesMatch = typesAndConsts.match(/type Phase[\s\S]*?correct: boolean; }/);
const typesContent = `export ` + (typesMatch ? typesMatch[0].replace(/type Phase/, 'export type Phase').replace(/interface/, 'export interface').replace(/interface/, 'export interface') : '');

// Write files
const componentsDir = 'src/features/battle/components';
const viewsDir = 'src/features/battle/views';
const typesDir = 'src/features/battle/types';
const constantsDir = 'src/features/battle/constants';

fs.mkdirSync(componentsDir, { recursive: true });
fs.mkdirSync(viewsDir, { recursive: true });
fs.mkdirSync(typesDir, { recursive: true });
fs.mkdirSync(constantsDir, { recursive: true });

fs.writeFileSync(`${typesDir}/battle.types.ts`, `
export type Phase = 'setup' | 'battle' | 'results';
export interface WordItem { id: number; word: string; hint: string; }
export interface Player  { name: string; initials: string; score: number; answered: boolean; correct: boolean; }
`);

fs.writeFileSync(`${constantsDir}/battle.constants.ts`, `
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
`);

const setupCode = `import { useState } from 'react';
import { Swords, Timer, Zap, Trash2, Plus, Play } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { WordItem } from '../types/battle.types';
import { defaultWords, mockPlayers } from '../constants/battle.constants';

export ` + sections[2].trim();

fs.writeFileSync(`${componentsDir}/SetupPhase.tsx`, setupCode);

const battleCode = `import { useState, useRef, useEffect } from 'react';
import { StopCircle, SkipForward, Volume2, Trophy, Medal, Users } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { WordItem, Player } from '../types/battle.types';
import { mockPlayers } from '../constants/battle.constants';

export ` + sections[3].trim();

fs.writeFileSync(`${componentsDir}/BattlePhase.tsx`, battleCode);

const resultsCode = `import { Trophy, RotateCcw, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Player } from '../types/battle.types';

export ` + sections[4].trim();

fs.writeFileSync(`${componentsDir}/ResultsPhase.tsx`, resultsCode);

const pageCode = `'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/features/dashboard/components';
import { Swords, ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Phase, WordItem, Player } from '../types/battle.types';
import { SetupPhase } from '../components/SetupPhase';
import { BattlePhase } from '../components/BattlePhase';
import { ResultsPhase } from '../components/ResultsPhase';

export ` + sections[5].trim().replace(/export default function LiveBattlePage/, 'function LiveBattlePage');

fs.writeFileSync(`${viewsDir}/LiveBattlePage.tsx`, pageCode);
console.log('Battle split V2 success');
