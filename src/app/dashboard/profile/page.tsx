'use client';

import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { UserCircle, Mail, MapPin, Calendar, Edit3, Settings, Shield, Award, Flame, Star } from 'lucide-react';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-emerald-400 to-teal-500 relative">
            <button className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition backdrop-blur-sm">
              <Edit3 size={18} />
            </button>
          </div>
          <div className="px-4 md:px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 -mt-12 relative z-10">
              <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-700">
                  LC
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-slate-900">Leo Chen</h1>
                <p className="text-slate-500 flex items-center justify-center md:justify-start gap-2 mt-1">
                  <Mail size={14} /> leo.chen@example.com
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button className="flex-1 md:flex-none px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition">
                  Share Profile
                </button>
                <button className="p-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition">
                  <Settings size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-3 bg-orange-50 text-orange-500 rounded-xl"><Flame size={20} /></div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Day Streak</div>
                  <div className="font-bold text-slate-900 text-lg">18 Days</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl"><Star size={20} /></div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">Total XP</div>
                  <div className="font-bold text-slate-900 text-lg">12,450</div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Shield size={20} /></div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase">League</div>
                  <div className="font-bold text-slate-900 text-lg">Diamond</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="text-emerald-500" />
              Recent Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Early Bird', desc: 'Completed a lesson before 8 AM', icon: '🌅', color: 'bg-orange-100' },
                { title: 'Vocab Master', desc: 'Learned 500 new words', icon: '🧠', color: 'bg-purple-100' },
                { title: 'Unstoppable', desc: 'Reached a 14-day streak', icon: '🔥', color: 'bg-red-100' },
                { title: 'Perfect Score', desc: '100% on a grammar test', icon: '💯', color: 'bg-emerald-100' },
              ].map((ach, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${ach.color}`}>
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{ach.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
               <UserCircle className="text-blue-500" />
               About Me
             </h3>
             <div className="space-y-4">
               <div className="flex items-start gap-3 text-sm text-slate-600">
                 <MapPin size={16} className="text-slate-400 mt-0.5" />
                 <span>Hanoi, Vietnam</span>
               </div>
               <div className="flex items-start gap-3 text-sm text-slate-600">
                 <Calendar size={16} className="text-slate-400 mt-0.5" />
                 <span>Joined May 2026</span>
               </div>
               <div className="pt-4 border-t border-slate-100">
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Passionate about learning languages and exploring new cultures. Currently focusing on Spanish and French. Let's learn together! 🌟
                 </p>
               </div>
             </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
