import { Metadata } from 'next';
import LiveBattlePageWrapper from '@/features/battle/views/LiveBattlePage';

export const metadata: Metadata = {
  title: 'Live Battle',
};

export default function Page() {
  return <LiveBattlePageWrapper />;
}
