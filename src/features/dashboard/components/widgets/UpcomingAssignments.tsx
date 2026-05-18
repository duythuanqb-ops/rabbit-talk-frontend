import { FileText, Clock, AlertCircle } from 'lucide-react';

const mockAssignments = [
  { id: 1, title: 'Midterm Spanish Test', type: 'Exam', group: 'Spanish Beginners', dueDate: 'Today, 11:59 PM', isUrgent: true },
  { id: 2, title: 'Restaurant Vocab Quiz', type: 'Quiz', group: 'Spanish Beginners', dueDate: 'Tomorrow', isUrgent: false },
  { id: 3, title: 'Read Chapter 4', type: 'Homework', group: 'Advanced English', dueDate: 'Friday', isUrgent: false },
];

export function UpcomingAssignments() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
          <FileText className="text-blue-500" size={20} />
          Upcoming Assignments
        </h3>
        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">View All</button>
      </div>

      <div className="space-y-3">
        {mockAssignments.map((assignment) => (
          <div key={assignment.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${assignment.isUrgent ? 'border-red-100 bg-red-50/30 hover:bg-red-50/80' : 'border-slate-100 bg-white hover:bg-slate-50'}`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${assignment.type === 'Exam' ? 'bg-purple-100 text-purple-700' : assignment.type === 'Quiz' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                  {assignment.type}
                </span>
                {assignment.isUrgent && <span className="flex items-center gap-1 text-[10px] font-bold text-red-600"><AlertCircle size={12}/> Urgent</span>}
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{assignment.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{assignment.group}</p>
            </div>
            
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 mt-2 sm:mt-0">
              <div className={`flex items-center gap-1 text-xs font-bold ${assignment.isUrgent ? 'text-red-500' : 'text-slate-500'}`}>
                <Clock size={14} /> {assignment.dueDate}
              </div>
              <button className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${assignment.isUrgent ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                Start
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
