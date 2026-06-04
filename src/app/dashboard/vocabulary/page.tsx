'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookOpen, Plus, Play, Search, Loader2, Pencil, Trash2, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { flashcardService } from '@/features/flashcard/services/flashcard.service';
import { getProfile } from '@/features/auth/services/auth.service';
import { CreateSetModal } from '@/features/flashcard/components/CreateSetModal';
import { AddCardModal } from '@/features/flashcard/components/AddCardModal';
import { StudyModal } from '@/features/flashcard/components/StudyModal';

import { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/shared/utils/motion';

function VocabularyPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterGroupId = searchParams ? searchParams.get('groupId') : null;
  const autoCreate = searchParams ? searchParams.get('create') === 'true' : false;

  const [sets, setSets] = useState<any[]>([]);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [addCardSetId, setAddCardSetId] = useState<string | null>(null);
  const [studySet, setStudySet] = useState<{ id: string, title: string } | null>(null);
  const [editingSet, setEditingSet] = useState<any | null>(null);
  const [editSetTitle, setEditSetTitle] = useState('');
  const [editSetDescription, setEditSetDescription] = useState('');
  const [deletingSetId, setDeletingSetId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const profile = await getProfile();
      const user = profile.data || profile;
      setRole(user.role || 'student');

      const res = await flashcardService.getMySets();
      setSets(res.data || res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (autoCreate && role === 'teacher' && !loading) {
      setIsCreateOpen(true);
    }
  }, [autoCreate, role, loading]);

  const handleCreateSet = async (groupId: string, title: string, desc: string) => {
    await flashcardService.createSet(groupId, title, desc);
    loadData();
  };

  const handleStartEditSet = (set: any) => {
    setEditingSet(set);
    setEditSetTitle(set.title);
    setEditSetDescription(set.description || '');
  };

  const handleSaveEditSet = async () => {
    if (!editingSet || !editSetTitle.trim()) return;
    try {
      await flashcardService.updateSet(editingSet.id, editSetTitle, editSetDescription);
      setEditingSet(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to update set');
    }
  };

  const handleDeleteSet = (setId: string) => {
    setDeletingSetId(setId);
  };

  const confirmDeleteSet = async () => {
    if (!deletingSetId) return;
    try {
      await flashcardService.deleteSet(deletingSetId);
      setDeletingSetId(null);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to delete set');
    }
  };

  const handleTogglePublish = async (setId: string, isPublished: boolean) => {
    try {
      await flashcardService.updatePublishStatus(setId, isPublished);
      loadData();
    } catch (e) {
      console.error(e);
      alert('Failed to update publish status');
    }
  };

  const filteredSets = sets.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.group_name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterGroupId) {
      return matchesSearch && s.group_id === filterGroupId;
    }
    return matchesSearch;
  });

  return (
    <>
      <motion.div 
        initial="hidden" 
        animate="show" 
        variants={containerVariants}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8"
      >
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3">
            {filterGroupId && (
              <button 
                onClick={() => router.push(`/dashboard/groups/${filterGroupId}`)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                title="Back to Group"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="text-orange-500" />
              Vocabulary Library
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">Master new words and track your progress.</p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search sets..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-3 md:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500" 
            />
          </div>
          {role === 'teacher' && (
            <button 
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-3 md:py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-md shadow-orange-200 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus size={16} /> Create Set
            </button>
          )}
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-12 text-center shadow-sm max-w-lg mx-auto">
          <BookOpen className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No flashcards found</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {role === 'teacher' ? "You haven't created any flashcard sets yet." : "Your teachers haven't assigned any flashcards to your classes."}
          </p>
          {role === 'teacher' && (
            <button onClick={() => setIsCreateOpen(true)} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl shadow-md">
              Create First Set
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="show"
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredSets.map((set) => {
            const isComplete = role === 'student' && set.mastered_count === set.card_count && set.card_count > 0;
            const progress = role === 'student' ? (set.card_count > 0 ? Math.round((set.mastered_count / set.card_count) * 100) : 0) : 0;
            
            return (
              <motion.div variants={itemVariants} whileHover={{ y: -5 }} key={set.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-700/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-md uppercase tracking-wider inline-block">
                        {set.group_name}
                      </div>
                      {role === 'teacher' && (
                        set.is_published ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Draft</span>
                        )
                      )}
                    </div>
                    {role === 'teacher' && (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleTogglePublish(set.id, !set.is_published)}
                          className={`p-1.5 rounded-lg transition-colors border border-transparent ${
                            set.is_published 
                              ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-100 dark:hover:border-emerald-800' 
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                          }`}
                          title={set.is_published ? "Hide from students" : "Assign to students"}
                        >
                          {set.is_published ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button 
                          onClick={() => setAddCardSetId(set.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                          title="Add Word"
                        >
                          <Plus size={18} />
                        </button>
                        <button 
                          onClick={() => handleStartEditSet(set)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                          title="Edit Set"
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSet(set.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                          title="Delete Set"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{set.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem] mb-4">
                    {set.description || "No description provided."}
                  </p>

                  <div 
                    onClick={() => set.card_count > 0 && setStudySet({ id: set.id, title: set.title })}
                    className={`flex items-center justify-between text-sm font-bold text-slate-700 dark:text-white bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-600/50 transition-colors ${
                      set.card_count > 0 ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-orange-600 dark:hover:text-orange-400' : ''
                    }`}
                    title={set.card_count > 0 ? "Click to view words" : undefined}
                  >
                    <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-slate-400" /> {set.card_count} Words</span>
                    {role === 'student' && (
                      <span className={isComplete ? 'text-emerald-500' : 'text-slate-500'}>
                        {set.mastered_count} Mastered
                      </span>
                    )}
                  </div>
                </div>

                {role === 'student' && (
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700">
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                    </div>
                    <button 
                      onClick={() => setStudySet({ id: set.id, title: set.title })}
                      disabled={set.card_count === 0}
                      className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        isComplete ? 'bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-slate-700' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-200 dark:shadow-none'
                      }`}
                    >
                      {isComplete ? 'Review Cards' : 'Start Learning'}
                      {!isComplete && <Play size={14} className="fill-current" />}
                    </button>
                  </div>
                )}

                {role === 'teacher' && (
                  <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                    <button 
                      onClick={() => setAddCardSetId(set.id)}
                      className="flex-1 py-3 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-sm transition-colors border border-indigo-100 dark:border-indigo-800 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Add Word
                    </button>
                    <button 
                      onClick={() => setStudySet({ id: set.id, title: set.title })}
                      disabled={set.card_count === 0}
                      className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-orange-200 dark:shadow-none"
                    >
                      <Play size={14} className="fill-current" /> View Cards
                    </button>
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Modals */}
      <CreateSetModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onCreate={handleCreateSet} 
        defaultGroupId={filterGroupId || undefined}
      />
      
      {addCardSetId && (
        <AddCardModal 
          isOpen={true} 
          onClose={() => setAddCardSetId(null)} 
          setId={addCardSetId}
          onAdded={() => {
            loadData();
          }}
        />
      )}

      {studySet && (
        <StudyModal 
          isOpen={true} 
          onClose={() => {
            setStudySet(null);
            loadData();
          }} 
          setId={studySet.id}
          setName={studySet.title}
        />
      )}

      <AnimatePresence>
      {editingSet && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl p-6 border border-slate-100 flex flex-col"
          >
            <h3 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <Pencil className="text-orange-500" size={20} />
              Edit Vocabulary Set
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Set Title</label>
                <input 
                  type="text"
                  value={editSetTitle}
                  onChange={e => setEditSetTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="e.g. Unit 1: Family Life"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description (Optional)</label>
                <textarea 
                  rows={3}
                  value={editSetDescription}
                  onChange={e => setEditSetDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                  placeholder="e.g. Core vocabulary list for unit 1 family relationships"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setEditingSet(null)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold rounded-xl text-sm transition-colors border border-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEditSet}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-orange-100"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {deletingSetId && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100]"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-md font-extrabold text-slate-900 mb-1.5">Delete Vocabulary Set?</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6 leading-relaxed">
              This will permanently delete the study set and all of its associated flashcards. This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeletingSetId(null)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteSet}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-rose-100"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
export default function VocabularyPage() { return <Suspense fallback={<div>Loading...</div>}><VocabularyPageContent /></Suspense>; }
