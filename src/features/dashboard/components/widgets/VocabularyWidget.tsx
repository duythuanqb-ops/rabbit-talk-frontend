"use client";

import { BookOpen, Plus, Star, X, Pencil, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboard.service';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/shared/components/animations/StaggerContainer';
import { VocabStudyModal } from './VocabStudyModal';

export interface VocabItem {
  id: string;
  word: string;
  meaning?: string;
  setTitle?: string;
  status?: string;
  isStarred?: boolean;
  source?: 'custom' | 'lesson';
}

export function VocabularyWidget() {
  const [vocab, setVocab] = useState<VocabItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyStartCardId, setStudyStartCardId] = useState<string | undefined>(undefined);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editWordId, setEditWordId] = useState('');
  const [editWordStr, setEditWordStr] = useState('');
  const [editMeaningStr, setEditMeaningStr] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const loadVocab = () => {
    dashboardService.getStudentVocabulary().then((res) => setVocab((res as { data?: VocabItem[] }).data || [])).catch(console.error);
  };

  useEffect(() => {
    loadVocab();
  }, []);


  const handleToggleStar = async (e: React.MouseEvent, item: VocabItem) => {
    e.stopPropagation();
    if (item.source === 'custom') return; 
    
    setVocab(prev => prev.map(v => v.id === item.id ? { ...v, isStarred: !v.isStarred } : v));
    try {
      await dashboardService.toggleVocabularyStar(item.id);
      
      loadVocab();
    } catch (err) {
      console.error(err);
      setVocab(prev => prev.map(v => v.id === item.id ? { ...v, isStarred: !v.isStarred } : v));
    }
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    setIsAdding(true);
    try {
      await dashboardService.addCustomWord(newWord.trim(), newMeaning.trim() || undefined);
      setNewWord('');
      setNewMeaning('');
      setShowAddModal(false);
      loadVocab();
      
      
      await dashboardService.trackQuestProgress('add_custom_words', 1);
      window.dispatchEvent(new Event('questUpdate'));
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateWord = async () => {
    if (!editWordStr.trim() || !editWordId) return;
    setIsEditing(true);
    try {
      await dashboardService.updateCustomWord(editWordId, editWordStr.trim(), editMeaningStr.trim() || undefined);
      setShowEditModal(false);
      loadVocab();
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteWord = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this word?')) {
      try {
        await dashboardService.deleteCustomWord(id);
        loadVocab();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEditModal = (e: React.MouseEvent, item: VocabItem) => {
    e.stopPropagation();
    setEditWordId(item.id);
    setEditWordStr(item.word);
    setEditMeaningStr(item.meaning || '');
    setShowEditModal(true);
  };

  return (
    <div className="double-bezel h-full">
      <div className="double-bezel-inner bg-surface p-6 h-full flex flex-col hover:shadow-lg transition-fluid">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <BookOpen className="text-emerald-500" size={20} />
            My Vocabulary
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
            title="Add a word"
          >
            <Plus size={18} />
          </button>
        </div>

        {}
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          Words you added · Starred words from lessons
        </p>

        <StaggerContainer className="space-y-2 flex-1 overflow-y-auto">
          {vocab.length === 0 && (
            <StaggerItem className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                <BookOpen size={24} />
              </div>
              <p className="font-bold text-slate-700 dark:text-slate-300">No words yet</p>
              <p className="text-xs text-slate-500 mt-1">Add a word or star words from lessons!</p>
            </StaggerItem>
          )}
          {vocab.map((item) => (
            <StaggerItem
              whileHover={{ scale: 1.01 }}
              key={item.id || item.word}
              onClick={() => { setStudyStartCardId(item.id); setShowStudyModal(true); }}
              className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-800/50 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 flex-shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {item.word[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{item.word}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{item.setTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                {item.source === 'custom' ? (
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                    My Word
                  </span>
                ) : (
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    item.status === 'mastered'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {item.status}
                  </span>
                )}
                {item.source !== 'custom' && (
                  <button
                    onClick={(e) => handleToggleStar(e, item)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Star
                      size={14}
                      className={item.isStarred ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}
                    />
                  </button>
                )}
                {item.source === 'custom' && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => openEditModal(e, item)}
                      className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 transition-colors"
                      title="Edit word"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteWord(e, item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 transition-colors"
                      title="Delete word"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <button
          onClick={() => { setStudyStartCardId(undefined); setShowStudyModal(true); }}
          disabled={vocab.length === 0}
          className="w-full mt-4 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl border-b-4 border-emerald-700 hover:border-emerald-600 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
        >
          Practice Session ✦
        </button>
      </div>

      {}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-slate-200 dark:border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <BookOpen className="text-emerald-500" size={18} />
                  Add New Word
                </h4>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Word *</label>
                  <input
                    autoFocus
                    type="text"
                    value={newWord}
                    onChange={e => setNewWord(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddWord()}
                    placeholder="e.g. eloquent"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Meaning (optional)</label>
                  <input
                    type="text"
                    value={newMeaning}
                    onChange={e => setNewMeaning(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddWord()}
                    placeholder="e.g. fluent or persuasive in speaking"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWord}
                  disabled={!newWord.trim() || isAdding}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                  {isAdding ? 'Adding...' : 'Add Word'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 border border-slate-200 dark:border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <BookOpen className="text-emerald-500" size={18} />
                  Edit Word
                </h4>
                <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Word *</label>
                  <input
                    autoFocus
                    type="text"
                    value={editWordStr}
                    onChange={e => setEditWordStr(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUpdateWord()}
                    placeholder="e.g. eloquent"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Meaning (optional)</label>
                  <input
                    type="text"
                    value={editMeaningStr}
                    onChange={e => setEditMeaningStr(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleUpdateWord()}
                    placeholder="e.g. fluent or persuasive in speaking"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="pt-2">
                  <button
                    onClick={handleUpdateWord}
                    disabled={!editWordStr.trim() || isEditing}
                    className="w-full py-2.5 text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors shadow-md shadow-emerald-500/20"
                  >
                    {isEditing ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <VocabStudyModal
        isOpen={showStudyModal}
        onClose={() => setShowStudyModal(false)}
        initialCardId={studyStartCardId}
      />
    </div>
  );
}
