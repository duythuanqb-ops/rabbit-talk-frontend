import { useState } from 'react';
import { FadeIn } from '@/shared/components/animations/FadeIn';
import { Button } from '@/components/ui/Button';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (memberIdentifier: string) => Promise<boolean>;
}

export function AddMemberModal({ isOpen, onClose, onAdd }: AddMemberModalProps) {
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await onAdd(memberIdentifier);
    setIsSaving(false);
    if (success) {
      setMemberIdentifier('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <FadeIn className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Add Member</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Username or Email</label>
            <input 
              required 
              type="text" 
              value={memberIdentifier} 
              onChange={e => setMemberIdentifier(e.target.value)} 
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-white" 
              placeholder="Enter student username or email" 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              onClick={onClose} 
              disabled={isSaving}
              variant="outline"
              className="rounded-xl border-slate-200 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              variant="primary"
              className="rounded-xl shadow-lg shadow-emerald-200"
            >
              {isSaving ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
