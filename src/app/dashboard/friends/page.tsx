'use client';

import { FriendsPage } from '@/features/friends/views/FriendsPage';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardFriendsPage() {
  return (
    <>
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      }>
        <FriendsPage />
      </Suspense>
    </>
  );
}
