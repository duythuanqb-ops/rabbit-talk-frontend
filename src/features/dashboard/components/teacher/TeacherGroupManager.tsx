'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Plus, FileText, BarChart3, ChevronLeft, BookOpen, Clock, Trophy, Play, Swords } from 'lucide-react';

const mockGroups = [
  { 
    id: '1', name: 'Spanish Beginners', students: 12, avgProgress: 75,
    exams: [
      { id: 'e1', title: 'Midterm Test', dueDate: 'Next Week', participants: 10 },
      { id: 'e2', title: 'Pop Quiz 1', dueDate: 'Completed', participants: 12 },
    ],
    vocabLessons: [
      { id: 'v1', title: 'Food & Drinks', words: 20 },
      { id: 'v2', title: 'Travel Basic', words: 15 },
    ]
  },
  { 
    id: '2', name: 'Intermediate French', students: 8, avgProgress: 42,
    exams: [],
    vocabLessons: []
  },
];

export function TeacherGroupManager() {
  const router = useRouter();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const selectedGroup = mockGroups.find(g => g.id === selectedGroupId);

  const handleStartBattle = (groupId: string, groupName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    router.push(`/dashboard/battle?groupId=${groupId}&groupName=${encodeURIComponent(groupName)}`);
  };

  if (selectedGroup) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        {/* Detail view header */}
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setSelectedGroupId(null)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-500" />
          </button>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">{selectedGroup.name}</h3>
            <p className="text-sm text-slate-500">{selectedGroup.students} active students • {selectedGroup.avgProgress}% avg progress</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Exams Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-emerald-500" size={18} />
                Exams & Tests
              </h4>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors text-xs font-bold shadow-sm">
                <Plus size={14} />
                Create Exam
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedGroup.exams.length > 0 ? selectedGroup.exams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{exam.title}</h5>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock size={12} /> {exam.dueDate} • {exam.participants}/{selectedGroup.students} completed
                    </p>
                  </div>
                  <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View Results</button>
                </div>
              )) : (
                <p className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">No exams created yet.</p>
              )}
            </div>
          </div>

          {/* Vocabulary Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="text-orange-500" size={18} />
                Vocabulary Lessons
              </h4>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-xs font-bold shadow-sm">
                <Plus size={14} />
                Create Lesson
              </button>
            </div>
            
            <div className="space-y-3">
              {selectedGroup.vocabLessons.length > 0 ? selectedGroup.vocabLessons.map(lesson => (
                <div key={lesson.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                  <div>
                    <h5 className="font-bold text-slate-800 text-sm">{lesson.title}</h5>
                    <p className="text-xs text-slate-500 mt-1">{lesson.words} words</p>
                  </div>
                  <button className="text-xs font-bold text-orange-600 hover:text-orange-700">Edit</button>
                </div>
              )) : (
                <p className="text-sm text-slate-400 text-center py-4 border border-dashed border-slate-200 rounded-lg">No vocabulary lessons created yet.</p>
              )}
            </div>
          </div>

          {/* Live Battle Section — now passes groupId to battle page */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-lg relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div>
                <h4 className="font-bold flex items-center gap-2 text-lg">
                  <Swords size={20} className="text-emerald-400" />
                  Live Vocab Battle
                </h4>
                <p className="text-sm text-white/70 mt-1">
                  Start a real-time pronunciation battle for <span className="font-semibold text-white">{selectedGroup.name}</span>
                </p>
              </div>
              <button 
                onClick={() => handleStartBattle(selectedGroup.id, selectedGroup.name)}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-colors font-bold shadow-lg shadow-emerald-900/30 whitespace-nowrap"
              >
                <Play size={16} className="fill-white" />
                Start Battle
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view — each card now has a Battle button
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <Users className="text-emerald-500" size={20} />
          My Groups
        </h3>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-bold shadow-lg shadow-emerald-200">
          <Plus size={18} />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockGroups.map((group) => (
          <div 
            key={group.id}
            onClick={() => setSelectedGroupId(group.id)}
            className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer bg-slate-50/50 hover:shadow-md group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{group.name}</h4>
                <p className="text-xs text-slate-500">{group.students} active students</p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <BarChart3 size={16} className="text-emerald-500" />
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                <span>Progress</span>
                <span>{group.avgProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${group.avgProgress}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 py-2 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-100 flex items-center justify-center gap-2">
                <FileText size={14} />
                {group.exams.length} Exams
              </div>
              <div className="flex-1 py-2 bg-white text-slate-700 text-xs font-bold rounded-lg border border-slate-100 flex items-center justify-center gap-2">
                <BookOpen size={14} />
                {group.vocabLessons.length} Vocab
              </div>
              {/* Battle shortcut button */}
              <button
                onClick={(e) => handleStartBattle(group.id, group.name, e)}
                className="px-3 py-2 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                title="Start Live Battle"
              >
                <Swords size={13} />
                Battle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
