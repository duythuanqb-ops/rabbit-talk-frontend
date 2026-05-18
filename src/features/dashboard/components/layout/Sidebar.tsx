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
  X,
  ShieldAlert,
  School,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { logout, getProfile } from '@/features/auth/services/auth.service';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'student' | 'teacher' | 'admin' | null;

const studentNav = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'My Groups', icon: Users, href: '/dashboard/groups' },
  { name: 'Vocabulary', icon: BookOpen, href: '/dashboard/vocabulary' },
  { name: 'Leaderboard', icon: Trophy, href: '/dashboard/leaderboard' },
  { name: 'Profile', icon: UserCircle, href: '/dashboard/profile' },
];

const teacherNav = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'My Classes', icon: School, href: '/dashboard/groups' },
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProfile()
      .then((res) => {
        const user = res.data || res;
        setRole(user.role || 'student');
        setUserName(user.first_name || user.username || 'User');
        setAvatarUrl(user.avatar_url || null);
      })
      .catch(() => setRole('student'));
  }, []);

  // Close menu when clicking outside
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

  // Close menu on route change
  useEffect(() => {
    setShowUserMenu(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const navItems = role === 'admin' ? adminNav : role === 'teacher' ? teacherNav : studentNav;
  const badge = role ? roleBadge[role] : null;
  const initials = userName ? userName.charAt(0).toUpperCase() : 'U';

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
        {/* Logo */}
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

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isAdminItem = item.href === '/dashboard/admin';
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
                    ? isAdminItem
                      ? "bg-indigo-50 text-indigo-600 font-medium"
                      : "bg-emerald-50 text-emerald-600 font-medium"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon size={20} className={cn(
                  "transition-colors",
                  isActive
                    ? isAdminItem ? "text-indigo-600" : "text-emerald-600"
                    : "text-slate-400 group-hover:text-slate-900"
                )} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User profile card with popup menu */}
        <div className="p-4 border-t border-slate-100" ref={menuRef}>

          {/* Popup menu — slides up when open */}
          {showUserMenu && (
            <div className="mb-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-150">
              {role !== 'admin' && (
                <Link
                  href="/dashboard/settings"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-b border-slate-100",
                    pathname === '/dashboard/settings'
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Settings size={16} className={pathname === '/dashboard/settings' ? "text-emerald-500" : "text-slate-400"} />
                  Settings
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}

          {/* User card — click to toggle popup */}
          {role && (
            <button
              onClick={() => setShowUserMenu((prev) => !prev)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200",
                showUserMenu
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200"
              )}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0 overflow-hidden ring-2 ring-white">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : initials}
              </div>

              {/* Name + badge */}
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                {badge && (
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider", badge.color)}>
                    {badge.label}
                  </span>
                )}
              </div>

              {/* Chevron — rotates when open */}
              <ChevronUp
                size={16}
                className={cn(
                  "text-slate-400 transition-transform duration-200 shrink-0",
                  showUserMenu ? "rotate-0" : "rotate-180"
                )}
              />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
