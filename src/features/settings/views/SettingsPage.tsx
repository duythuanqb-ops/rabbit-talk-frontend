'use client';

import { useState } from 'react';
import { User, Bell, Lock, Globe } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { DashboardLayout } from '@/features/dashboard/components';
import { ProfileSettings } from '../components/ProfileSettings';
import { NotificationSettings } from '../components/NotificationSettings';
import { SecuritySettings } from '../components/SecuritySettings';
import { PreferencesSettings } from '../components/PreferencesSettings';

const tabs = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'security', name: 'Security', icon: Lock },
  { id: 'preferences', name: 'Preferences', icon: Globe },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto w-full pb-12">
        <div className="mb-8">
          <h1 className='text-3xl font-bold text-slate-900'>Settings</h1>
          <p className='text-slate-500 mt-2'>Manage your account settings and preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium",
                      isActive 
                        ? "bg-emerald-50 text-emerald-600 shadow-sm" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon size={20} className={cn(
                      "transition-colors",
                      isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-900"
                    )} />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'security' && <SecuritySettings />}
            {activeTab === 'preferences' && <PreferencesSettings />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}