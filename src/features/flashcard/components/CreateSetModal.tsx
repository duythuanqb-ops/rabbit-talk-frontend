import { useState, useEffect } from 'react';
import { X, Plus, Users } from 'lucide-react';
import { groupsService } from '@/features/groups/services/groups.service';

export function CreateSetModal({ isOpen, onClose, onCreate, defaultGroupId }: { isOpen: boolean, onClose: () => void, onCreate: (groupId: string, title: string, desc: string) => Promise<void>, defaultGroupId?: string }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [groupId, setGroupId] = useState(defaultGroupId || '');
  const [groups, setGroups] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      groupsService.getGroups().then(res => {
        const data = res.data || res;
        if (Array.isArray(data)) {
          setGroups(data);
          if (defaultGroupId) {
            setGroupId(defaultGroupId);
          }
        }
      }).catch(err => console.error(err));
    }
  }, [isOpen, defaultGroupId]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title || !groupId) return;
    setLoading(true);
    await onCreate(groupId, title, desc);
    setLoading(false);
    setTitle('');
    setDesc('');
    setGroupId('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create Flashcard Set</h2>
        
        <div className="space-y-4">
          {!defaultGroupId && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Class/Group</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <select 
                  value={groupId} 
                  onChange={e => setGroupId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 appearance-none"
                >
                  <option value="" disabled>Select a class...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Set Title</label>
            <input 
              type="text" 
              placeholder="e.g. Daily Routines"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description (Optional)</label>
            <textarea 
              placeholder="What is this set about?"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none h-24"
            />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={!title || !groupId || loading}
            className="w-full mt-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-orange-200 dark:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin text-xl leading-none">⟳</span> : <><Plus size={18} /> Create Set</>}
          </button>
        </div>
      </div>
    </div>
  );
}
