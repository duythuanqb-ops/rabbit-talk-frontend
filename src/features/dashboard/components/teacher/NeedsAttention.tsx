import { AlertTriangle, TrendingDown, MessageCircle } from 'lucide-react';

const mockAlerts = [
  { id: 1, student: 'David L.', avatar: 'DL', issue: 'Missed 3 classes in a row', group: 'Intermediate French' },
  { id: 2, student: 'Emma S.', avatar: 'ES', issue: 'Scored 45% on Midterm', group: 'Spanish Beginners' },
  { id: 3, student: 'James T.', avatar: 'JT', issue: 'Has not logged in for 5 days', group: 'Spanish Beginners' },
];

export function NeedsAttention() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
          <AlertTriangle className="text-rose-500" size={20} />
          Needs Attention
        </h3>
        <span className="flex items-center justify-center bg-rose-100 text-rose-600 text-xs font-bold w-6 h-6 rounded-full">
          {mockAlerts.length}
        </span>
      </div>

      <div className="space-y-3">
        {mockAlerts.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-4 rounded-xl border border-rose-50 bg-rose-50/40 hover:bg-rose-50/80 transition-colors">
            <div className="w-10 h-10 rounded-full bg-white border border-rose-100 flex items-center justify-center text-rose-700 font-bold shadow-sm shrink-0">
              {alert.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="truncate">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{alert.student}</h4>
                  <p className="text-xs text-slate-500 truncate">{alert.group}</p>
                </div>
                <button className="p-1.5 bg-white text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-md transition-colors border border-slate-100 shadow-sm shrink-0" title="Message Student">
                  <MessageCircle size={16} />
                </button>
              </div>
              
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-100/50 w-fit px-2 py-1 rounded-md">
                <TrendingDown size={14} />
                <span className="truncate">{alert.issue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
