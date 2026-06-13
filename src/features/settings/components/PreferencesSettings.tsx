'use client';

import { Save, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

export function PreferencesSettings() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Preferences</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize your RibbitTalk experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-b border-slate-100 dark:border-slate-800 pb-8">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Language</label>
          <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer">
            <option>English (US)</option>
            <option>Vietnamese</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
          <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer">
            <option>(GMT+07:00) Indochina Time</option>
            <option>(GMT-05:00) Eastern Time</option>
            <option>(GMT+00:00) UTC</option>
            <option>(GMT+09:00) Japan Standard Time</option>
          </select>
        </div>
      </div>

      <div className="pt-2">
        <h3 className="font-medium text-slate-900 dark:text-white mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-fluid active:scale-[0.98] relative ${mounted && theme === 'light' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'}`}
          >
            {mounted && theme === 'light' && <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center"></div>}
            <div className="w-full max-w-[120px] h-20 bg-white rounded border border-slate-200 flex flex-col overflow-hidden shadow-sm">
              <div className="h-4 bg-slate-100 w-full border-b border-slate-200"></div>
              <div className="flex flex-1">
                <div className="w-1/4 bg-slate-50 border-r border-slate-200"></div>
                <div className="flex-1 bg-white p-2 flex flex-col gap-1.5">
                  <div className="h-1.5 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-1.5 bg-slate-100 rounded w-full"></div>
                  <div className="h-1.5 bg-slate-100 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <span className={`text-sm font-medium ${mounted && theme === 'light' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>Light</span>
          </button>
          
          <button 
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-fluid active:scale-[0.98] relative ${mounted && theme === 'dark' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'}`}
          >
            {mounted && theme === 'dark' && <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center"></div>}
            <div className="w-full max-w-[120px] h-20 bg-slate-900 rounded border border-slate-800 flex flex-col overflow-hidden shadow-sm">
              <div className="h-4 bg-slate-950 w-full border-b border-slate-800"></div>
              <div className="flex flex-1">
                <div className="w-1/4 bg-slate-950 border-r border-slate-800"></div>
                <div className="flex-1 bg-slate-900 p-2 flex flex-col gap-1.5">
                  <div className="h-1.5 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-1.5 bg-slate-800 rounded w-full"></div>
                  <div className="h-1.5 bg-slate-800 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <span className={`text-sm font-medium ${mounted && theme === 'dark' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>Dark</span>
          </button>

          <button 
            onClick={() => setTheme('system')}
            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-3 transition-fluid active:scale-[0.98] relative ${mounted && theme === 'system' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'}`}
          >
            {mounted && theme === 'system' && <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center"></div>}
            <div className="w-full max-w-[120px] h-20 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <Monitor size={32} />
            </div>
            <span className={`text-sm font-medium ${mounted && theme === 'system' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>System</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-8">
        <Button variant="primary" leftIcon={<Save size={18} />}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
}