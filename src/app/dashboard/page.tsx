'use client';

import { useRouter } from 'next/navigation';
import { logout } from '@/features/auth/services/auth.service';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-slate-500">Welcome to your dashboard! (This is a blank page as requested)</p>
      
      <button
        onClick={handleLogout}
        className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
      >
        Logout
      </button>
    </div>
  );
}
