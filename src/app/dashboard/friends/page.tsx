'use client';

import { DashboardLayout } from '@/features/dashboard/components';
import { FriendsPage } from '@/features/friends/views/FriendsPage';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardFriendsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
      }>
        <FriendsPage />
      </Suspense>
    </DashboardLayout>
  );
}
