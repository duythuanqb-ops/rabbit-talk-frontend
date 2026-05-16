'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Trophy, 
  UserCircle, 
  Settings, 
  LogOut,
  GraduationCap,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout } from '@/features/auth/services/auth.service';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'My Groups', icon: Users, href: '/dashboard/groups' },
  { name: 'Vocabulary', icon: BookOpen, href: '/dashboard/vocabulary' },
  { name: 'Leaderboard', icon: Trophy, href: '/dashboard/leaderboard' },
  { name: 'Profile', icon: UserCircle, href: '/dashboard/profile' },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
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
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity" 
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-64 h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
              <GraduationCap size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">RibbitTalk</span>
          </div>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-emerald-50 text-emerald-600 font-medium" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-colors",
                  isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-900"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            href="/dashboard/settings"
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <Settings size={20} />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
