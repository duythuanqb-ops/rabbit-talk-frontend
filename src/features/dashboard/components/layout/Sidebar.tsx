'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  X,
  ShieldAlert,
  School,
  ChevronUp,
  UserPlus,
  FileText,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { logout, getProfile } from '@/features/auth/services/auth.service';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { User } from '@/shared/types/api.types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'student' | 'teacher' | 'admin' | null;

const studentNav = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'My Groups', icon: Users, href: '/dashboard/groups' },
  { name: 'Vocabulary', icon: BookOpen, href: '/dashboard/vocabulary' },
  { name: 'Exams', icon: FileText, href: '/dashboard/exams' },
  { name: 'Friends', icon: UserPlus, href: '/dashboard/friends' },
  { name: 'Leaderboard', icon: Trophy, href: '/dashboard/leaderboard' },
  { name: 'Profile', icon: UserCircle, href: '/dashboard/profile' },
];

const teacherNav = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'My Classes', icon: School, href: '/dashboard/groups' },
  { name: 'Friends', icon: UserPlus, href: '/dashboard/friends' },
  { name: 'Leaderboard', icon: Trophy, href: '/dashboard/leaderboard' },
  { name: 'Profile', icon: UserCircle, href: '/dashboard/profile' },
];

const adminNav = [
  { name: 'Admin Panel', icon: ShieldAlert, href: '/dashboard/admin' },
];

const roleBadge: Record<string, { label: string; color: string }> = {
  student: { label: 'Student', color: 'bg-emerald-100 text-emerald-700' },
  teacher: { label: 'Teacher', color: 'bg-blue-100 text-blue-700' },
  admin:   { label: 'Admin',   color: 'bg-indigo-100 text-indigo-700' },
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(null);
  const [userName, setUserName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const menuRef = useRef<HTMLDivElement>(null);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setShowUserMenu(false);
  }

  useEffect(() => {
    getProfile()
      .then((res) => {
        const user = (res as { data?: User }).data ?? (res as User);
        setRole(user.role || 'student');
        setUserName(user.first_name || user.username || 'User');
        setAvatarUrl(user.avatar_url || null);
      })
      .catch(() => setRole('student'))
      .finally(() => setIsLoading(false));
  }, []);

  
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : role === 'student' ? studentNav : [];
  const badge = role ? roleBadge[role] : null;
  const initials = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <>
      {}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "w-64 h-screen bg-surface/90 dark:bg-[#050505]/90 backdrop-blur-2xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col fixed left-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:translate-x-0 border-r border-white/10 dark:border-white/[0.05]",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {}
        <div className="p-8 flex items-center justify-between pb-4">
          <Link href="/dashboard" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white bg-emerald-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] group-hover:scale-105 transition-fluid">
              <GraduationCap size={22} strokeWidth={1.5} />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight group-hover:text-emerald-500 transition-colors">RibbitTalk</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-muted-foreground hover:bg-surface-hover rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {}
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-4">
          {isLoading ? (
            <div className="flex flex-col gap-2 py-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-11 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            navItems.map((item, index) => {
              const isActive = pathname === item.href;
              const isAdminItem = item.href === '/dashboard/admin';
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl transition-fluid group relative",
                    isActive
                      ? isAdminItem
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 font-semibold"
                        : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 font-semibold"
                      : "text-muted-foreground font-medium hover:bg-surface-hover hover:text-foreground active:scale-[0.98]"
                  )}
                >
                  {}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                  <item.icon size={20} strokeWidth={isActive ? 2 : 1.5} className={cn(
                    "transition-colors z-10",
                    isActive
                      ? isAdminItem ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-500 dark:text-emerald-400"
                      : "text-muted-foreground group-hover:text-emerald-400"
                  )} />
                  <span className="z-10">{item.name}</span>
                </Link>
              );
            })
          )}
        </nav>

        {}
        <div className="p-4 border-t border-border" ref={menuRef}>

          {}
          {showUserMenu && (
            <div className="mb-3 glass rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-300">
              {role !== 'admin' && (
                <Link
                  href="/dashboard/settings"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-border/50",
                    pathname === '/dashboard/settings'
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                      : "text-foreground hover:bg-surface-hover"
                  )}
                >
                  <Settings size={16} strokeWidth={1.5} className={pathname === '/dashboard/settings' ? "text-emerald-500" : "text-muted-foreground"} />
                  Settings
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Logout
              </button>
            </div>
          )}

          {}
          {isLoading ? (
             <div className="h-[68px] w-full bg-slate-100 dark:bg-white/5 rounded-[20px] animate-pulse" />
          ) : role && (
            <div className="double-bezel cursor-pointer group" onClick={() => setShowUserMenu((prev) => !prev)}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 double-bezel-inner transition-fluid",
                  showUserMenu
                    ? "ring-1 ring-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/10"
                    : "group-hover:bg-surface-hover"
                )}
              >
                {}
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-sm shrink-0 overflow-hidden ring-2 ring-white dark:ring-[#050505]">
                  {avatarUrl ? (
                    <Image unoptimized src={avatarUrl} alt="avatar" width={40} height={40} className="w-full h-full object-cover" />
                  ) : initials}
                </div>

                {}
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                  {badge && (
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider", badge.color)}>
                      {badge.label}
                    </span>
                  )}
                </div>

                {}
                <div className="w-6 h-6 rounded-full bg-surface-hover flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                  <ChevronUp
                    size={14}
                    strokeWidth={2}
                    className={cn(
                      "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] shrink-0",
                      showUserMenu ? "rotate-0 text-emerald-500" : "rotate-180 text-muted-foreground group-hover:text-emerald-500"
                    )}
                  />
                </div>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
