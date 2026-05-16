'use client';

import { DashboardLayout } from '@/features/dashboard/components/DashboardLayout';
import { BookOpen, Search, Filter, Play, CheckCircle2 } from 'lucide-react';

const mockSets = [
  { title: 'Travel Essentials', words: 50, learned: 50, category: 'Travel', image: '✈️' },
  { title: 'Business Meeting', words: 40, learned: 15, category: 'Business', image: '💼' },
  { title: 'Restaurant & Food', words: 35, learned: 0, category: 'Food', image: '🍔' },
  { title: 'Daily Routines', words: 25, learned: 10, category: 'Basic', image: '⏰' },
];

export default function VocabularyPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="text-orange-500" />
            Vocabulary Library
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Master new words and track your progress.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search sets..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm" />
          </div>
          <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 shadow-sm transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockSets.map((set, i) => {
          const isComplete = set.learned === set.words;
          const progress = Math.round((set.learned / set.words) * 100);
          return (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="h-32 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-4xl relative">
                <span className="group-hover:scale-110 transition-transform duration-300">{set.image}</span>
                {isComplete && (
                  <div className="absolute top-3 right-3 bg-white rounded-full shadow-sm">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs font-bold text-orange-500 mb-1 uppercase tracking-wider">{set.category}</div>
                <h3 className="font-bold text-slate-900 mb-4">{set.title}</h3>
                
                <div className="space-y-2 mb-6 mt-auto">
                  <div className="flex justify-between text-xs font-medium text-slate-500">
                    <span>{progress}% Mastery</span>
                    <span>{set.learned}/{set.words} words</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                  </div>
                </div>

                <button className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${isComplete ? 'bg-slate-50 text-slate-600 hover:bg-slate-100' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'}`}>
                  {isComplete ? 'Review' : 'Continue Learning'}
                  {!isComplete && <Play size={14} className="fill-current" />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </DashboardLayout>
  );
}
