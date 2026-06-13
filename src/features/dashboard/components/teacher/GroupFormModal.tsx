import { useState } from 'react';
import { Group } from '../../../groups/types/groups.types';
import Image from 'next/image';
import { FadeIn } from '@/shared/components/animations/FadeIn';
import { Button } from '@/components/ui/Button';

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (groupForm: { title: string; description: string }, avatarFile: File | null) => Promise<boolean>;
  editingGroup: Group | null;
}

export function GroupFormModal({ isOpen, onClose, onSave, editingGroup }: GroupFormModalProps) {
  const [groupForm, setGroupForm] = useState({ title: editingGroup?.title || '', description: editingGroup?.description || '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(editingGroup?.avatar || null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const success = await onSave(groupForm, avatarFile);
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <FadeIn className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">
          {editingGroup ? 'Edit Group' : 'Create New Group'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Group Title</label>
            <input 
              required 
              type="text" 
              value={groupForm.title} 
              onChange={e => setGroupForm({ ...groupForm, title: e.target.value })} 
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-white" 
              placeholder="e.g. Advanced English" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
            <textarea 
              value={groupForm.description} 
              onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} 
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none text-slate-800 dark:text-white" 
              rows={3} 
              placeholder="Group description..." 
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Group Avatar</label>
            <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 rounded-xl">
              <div className="relative group flex-shrink-0">
                {avatarPreview ? (
                  <Image 
                    unoptimized
                    src={avatarPreview} 
                    alt="Avatar preview" 
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-xl shadow-inner">
                    {groupForm.title ? groupForm.title[0].toUpperCase() : 'G'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarPreview(URL.createObjectURL(file));
                    }
                  }} 
                  className="hidden" 
                  id={`group-avatar-upload-${editingGroup?.id || 'new'}`}
                />
                <label 
                  htmlFor={`group-avatar-upload-${editingGroup?.id || 'new'}`} 
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-600 hover:bg-slate-50 dark:hover:bg-slate-500 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-500 font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Choose Image
                </label>
                <p className="text-[9px] text-slate-400 mt-1 truncate">Recommended: Square, max 5MB</p>
              </div>
            </div>
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
              {isSaving ? 'Saving...' : (editingGroup ? 'Save Changes' : 'Create Group')}
            </Button>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
