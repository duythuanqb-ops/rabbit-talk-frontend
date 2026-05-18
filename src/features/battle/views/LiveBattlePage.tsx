'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/features/dashboard/components';
import { Swords, ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Phase, WordItem, Player } from '../types/battle.types';
import { SetupPhase } from '../components/SetupPhase';
import { BattlePhase } from '../components/BattlePhase';
import { ResultsPhase } from '../components/ResultsPhase';

export function LiveBattlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupName = searchParams.get('group') || 'Beginner English 101';
  
  const [phase, setPhase] = useState<Phase>('setup');
  const [words, setWords] = useState<WordItem[]>([]);
  const [timeLimit, setTimeLimit] = useState(30);
  const [finalPlayers, setFinalPlayers] = useState<Player[]>([]);

  const handleStartBattle = (selectedWords: WordItem[], selectedTime: number) => {
    setWords(selectedWords);
    setTimeLimit(selectedTime);
    setPhase('battle');
  };

  const handleEndBattle = (players: Player[]) => {
    setFinalPlayers(players);
    setPhase('results');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto w-full pb-12">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-8">
          <button onClick={() => router.push('/dashboard')} className="hover:text-indigo-600 transition-colors">Dashboard</button>
          <ChevronRight size={16} />
          <button onClick={() => router.back()} className="hover:text-indigo-600 transition-colors">Groups</button>
          <ChevronRight size={16} />
          <span className="text-slate-900 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1.5">
            <Swords size={14} className="text-indigo-500" /> Live Battle
          </span>
        </div>

        {phase === 'setup' && <SetupPhase groupName={groupName} onStart={handleStartBattle} />}
        {phase === 'battle' && <BattlePhase words={words} timeLimit={timeLimit} groupName={groupName} onEnd={handleEndBattle} />}
        {phase === 'results' && <ResultsPhase players={finalPlayers} groupName={groupName} onRestart={() => setPhase('setup')} />}
      </div>
    </DashboardLayout>
  );
}

export default function LiveBattlePageWrapper() {
  return (
    <Suspense fallback={null}>
      <LiveBattlePage />
    </Suspense>
  );
}
