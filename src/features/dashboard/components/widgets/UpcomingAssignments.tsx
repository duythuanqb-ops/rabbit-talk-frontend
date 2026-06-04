import { FileText, Clock, AlertCircle } from 'lucide-react';

const mockAssignments = [
  { id: 1, title: 'Midterm Spanish Test', type: 'Exam', group: 'Spanish Beginners', dueDate: 'Today, 11:59 PM', isUrgent: true },
  { id: 2, title: 'Restaurant Vocab Quiz', type: 'Quiz', group: 'Spanish Beginners', dueDate: 'Tomorrow', isUrgent: false },
  { id: 3, title: 'Read Chapter 4', type: 'Homework', group: 'Advanced English', dueDate: 'Friday', isUrgent: false },
];

export function UpcomingAssignments() {
  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-surface p-6 h-full flex flex-col hover:shadow-lg transition-fluid">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-lg">
          <FileText className="text-blue-500" size={20} />
          Upcoming Assignments
        </h3>
        <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">View All</button>
      </div>

      <div className="space-y-3">
        {mockAssignments.map((assignment) => (
          <div key={assignment.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${assignment.isUrgent ? 'border-red-100 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/20 hover:bg-red-50/80 dark:hover:bg-red-900/40' : 'border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${assignment.type === 'Exam' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : assignment.type === 'Quiz' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                  {assignment.type}
                </span>
                {assignment.isUrgent && <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400"><AlertCircle size={12}/> Urgent</span>}
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">{assignment.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{assignment.group}</p>
            </div>
            
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 mt-2 sm:mt-0">
              <div className={`flex items-center gap-1 text-xs font-bold ${assignment.isUrgent ? 'text-red-500 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <Clock size={14} /> {assignment.dueDate}
              </div>
              <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${assignment.isUrgent ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200 dark:shadow-none' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'}`}>
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
