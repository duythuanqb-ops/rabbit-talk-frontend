'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FileText, Plus, Play, Loader2, Trash2, Sparkles,
  RefreshCw, Save, X, Volume2, Search, Users, Eye, EyeOff, ArrowLeft,
  Pencil
} from 'lucide-react';
import { examsService, Exam, ExamQuestion } from '@/features/groups/services/exams.service';
import { groupsService } from '@/features/groups/services/groups.service';
import { Group } from '@/features/groups/types/groups.types';
import { getProfile } from '@/features/auth/services/auth.service';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { containerVariants, itemVariants } from '@/shared/utils/motion';

import { SharedExamTakerModal, TYPE_META, speak, mergeQuestions } from "@/features/exams/components/SharedExamTakerModal";


function EditableQuestion({ q, idx, onChange, onDelete, onFetchAudio, onAutoFillAI }: {
  q: ExamQuestion; idx: number;
  onChange: (u: ExamQuestion) => void;
  onDelete: () => void;
  onFetchAudio: (word: string, index: number) => void;
  onAutoFillAI: (word: string, index: number, type: string) => void;
}) {
  const meta = TYPE_META[q.type] ?? { label: q.type, emoji: '❓', color: 'bg-slate-50 text-slate-600 border-slate-100', gradient: 'from-slate-400 to-slate-600' };

  return (
    <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-300">
            {idx + 1}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${meta.color}`}>
            {meta.emoji} {meta.label}
          </span>
          {q.audio_url && (
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-1">🎧 Audio Linked</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {q.audio_url && (
            <button
              onClick={() => speak(q.word, q.audio_url)}
              className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
              title="Test audio"
            >
              <Volume2 size={13} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
            title="Delete question"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 items-end">
        <div>
          <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Target Word</label>
          <input type="text" value={q.word} 
            onChange={e => onChange({ ...q, word: e.target.value })} 
            onBlur={() => { if (q.type === 'listening' && q.word?.trim()) onFetchAudio(q.word, idx); }}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-400" placeholder="e.g. happy" />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Question Type (Skill)</label>
          <select value={q.type} onChange={e => {
            const nextType = e.target.value as ExamQuestion['type'];
            let nextOptions = q.options;
            let nextText = q.question_text;
            if (nextType === 'spelling') {
              nextOptions = null;
              nextText = `“${q.word || 'meaning'}” → ______`;
            } else if (nextType === 'listening') {
              nextOptions = q.options || [q.word, q.word + 'e', q.word + 'y', q.word + 's'];
              nextText = 'Nghe phát âm và chọn từ viết đúng chính tả:';
              if (q.word?.trim()) {
                setTimeout(() => onFetchAudio(q.word, idx), 50);
              }
            } else if (nextType === 'synonym') {
              nextOptions = q.options || [q.word, '', '', ''];
              nextText = `Find a synonym for: "${q.word}"`;
            } else if (nextType === 'situation') {
              nextOptions = q.options || [q.word, 'lesson', 'school', 'homework'];
              nextText = `Which word fits this context: "The student learned a new ______ to describe this feeling."`;
            } else if (nextType === 'matching') {
              nextOptions = q.options || [];
              nextText = 'Nối từ tiếng Anh với từ đồng nghĩa tiếng Anh (Cambridge synonym) phù hợp:';
            }
            onChange({ ...q, type: nextType, options: nextOptions, question_text: nextText });
          }} className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="listening">🎧 Listening ( Cambridge Pronunciation )</option>
            <option value="synonym">🔗 Synonym ( Word Meaning )</option>
            <option value="spelling">✏️ Spelling ( Written Test )</option>
            <option value="situation">🌍 Situation ( Contextual Clue )</option>
            <option value="matching">🔗 Matching ( Synonym Pairs )</option>
          </select>
        </div>
        <div className="flex gap-2 w-full">
          <button type="button" onClick={() => onAutoFillAI(q.word, idx, q.type)} className="w-full py-1.5 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-lg text-[10px] font-extrabold border border-purple-100 dark:border-purple-800/50 flex items-center justify-center gap-1 whitespace-nowrap" title="Generate context with AI">
            <Sparkles size={11} /> AI Auto-Fill
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Question Text</label>
          <input
            type="text"
            value={q.question_text}
            onChange={e => onChange({ ...q, question_text: e.target.value })}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-400"
          />
        </div>

        {q.type === 'matching' ? (
          <div>
            <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Pairs</label>
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-200">
              {(() => {
                try {
                  const pairs = JSON.parse(q.correct_answer);
                  return Object.entries(pairs).map(([w, s], i) => (
                    <div key={i} className="col-span-2 flex items-center gap-2">
                      <span className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg text-slate-800 dark:text-white">{w}</span>
                      <span className="text-slate-400 dark:text-slate-500">→</span>
                      <span className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg">{String(s)}</span>
                    </div>
                  ));
                } catch {
                  return <span className="col-span-2 text-rose-500 text-[10px]">Invalid matching pairs data</span>;
                }
              })()}
            </div>
          </div>
        ) : (
          <>
            {q.options && (
              <div>
                <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Options (Correct option must match answer precisely)</label>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <input
                      key={oIdx}
                      type="text"
                      value={opt}
                      onChange={e => {
                        const next = [...q.options!];
                        next[oIdx] = e.target.value;
                        onChange({ ...q, options: next });
                      }}
                      className={`px-3 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-1 ${
                        opt === q.correct_answer
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400 focus:border-emerald-400 focus:ring-emerald-100 dark:focus:ring-emerald-900'
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:border-blue-400 focus:ring-blue-100 dark:focus:ring-blue-900'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Correct Answer</label>
              <input
                type="text"
                value={q.correct_answer}
                onChange={e => onChange({ ...q, correct_answer: e.target.value })}
                className="w-full px-3 py-1.5 bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-lg text-xs font-bold text-emerald-800 dark:text-emerald-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}


import { Suspense } from 'react';

function ExamsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterGroupId = searchParams ? searchParams.get('groupId') : null;
  const autoCreate = searchParams ? searchParams.get('create') === 'true' : false;

  const [exams, setExams] = useState<Exam[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState(filterGroupId || '');

  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [wizardGroupId, setWizardGroupId] = useState(filterGroupId || '');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  
  const [wizardShowAddWords, setWizardShowAddWords] = useState(false);
  const [wizardNewWords, setWizardNewWords] = useState('');
  const [wizardAddingWords, setWizardAddingWords] = useState(false);
  const [takerMode, setTakerMode] = useState<'take' | 'review'>('take');

  const handleWizardQuestionChange = (updated: ExamQuestion, index: number) => {
    if (updated.type === 'matching' && questions[index]?.type !== 'matching') {
      const existingMatchingIdx = questions.findIndex(q => q.type === 'matching');
      if (existingMatchingIdx > -1 && existingMatchingIdx !== index) {
        const existingQ = { ...questions[existingMatchingIdx] };
        const wordToMerge = updated.word || 'word';
        try {
          const existingPairs = existingQ.correct_answer ? JSON.parse(existingQ.correct_answer) : {};
          const synonym = wordToMerge + ' (synonym)';
          const mergedPairs = { ...existingPairs, [wordToMerge]: synonym };
          
          existingQ.correct_answer = JSON.stringify(mergedPairs);
          existingQ.word = Object.keys(mergedPairs).join(', ');
          
          const allOptions = Object.values(mergedPairs) as string[];
          existingQ.options = Array.from(new Set(allOptions)).sort(() => Math.random() - 0.5);
          
          setQuestions(prev => {
            const next = prev.map((x, i) => i === existingMatchingIdx ? existingQ : x);
            return next.filter((_, i) => i !== index);
          });
          
          toast.success(`Merged "${wordToMerge}" into the existing Matching question! 🔗`);
          return;
        } catch (e) {
          console.error('Failed to merge manual matching change:', e);
        }
      }
    }
    setQuestions(qs => qs.map((x, i) => i === index ? updated : x));
  };

  
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const profile = await getProfile();
      const user = ((profile as { data?: { role?: string } }).data ?? profile) as { role?: string };
      setRole((user.role as 'student' | 'teacher') || 'student');

      const groupRes = await groupsService.getGroups();
      setGroups(groupRes.data ?? []);

      
      const examRes = await examsService.getMyExams();
      const data = ((examRes as unknown) as { data?: Exam[] }).data ?? (examRes as Exam[]);
      setExams(data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load exam data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        loadData();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      if (autoCreate && role === 'teacher' && !loading) {
        setIsCreateOpen(true);
        if (filterGroupId) {
          setWizardGroupId(filterGroupId);
        }
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [autoCreate, role, loading, filterGroupId]);

  const handleGenerate = async () => {
    if (!examTitle.trim()) { toast.error('Please enter an exam title'); return; }
    if (!wizardGroupId) { toast.error('Please select a class'); return; }
    if (!wordInput.trim()) { toast.error('Please enter at least one word'); return; }

    const items = wordInput.trim().split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
    if (!items.length) { toast.error('No valid words found'); return; }
    if (items.length > 30) { toast.error('Please limit to 30 words'); return; }

    setGenerating(true);
    try {
      const res = await examsService.generateQuestions(items);
      const qs: ExamQuestion[] = Array.isArray(res)
        ? (res as ExamQuestion[])
        : (((res as unknown) as { data?: ExamQuestion[] }).data ?? []);
      if (!qs.length) throw new Error('No questions returned');
      setQuestions(mergeQuestions([], qs));
      setStep('review');
      toast.success('Questions generated successfully with Cambridge audio! 🎧');
    } catch {
      toast('Gemini failed or Cambridge limit hit. Using local fallback generation...', { icon: '⚠️' });
      
      const localQs = items.map((word, i) => {
        const t = i % 4;
        if (t === 0) {
          return { word, type: 'synonym' as const, question_text: `Find a synonym for: "${word}"`, options: [word, word + ' (wrong)', word + ' (other)', word + ' (different)'].sort(() => Math.random() - 0.5), correct_answer: word };
        } else if (t === 1) {
          const opts = [word, word + 'e', word.replace(/[aeiou]/g, 'a'), word + 'y'].filter((v, j, a) => a.indexOf(v) === j);
          while (opts.length < 4) opts.push(word + '-' + opts.length);
          return { word, type: 'listening' as const, question_text: 'Listen and choose the correct spelling:', options: opts.sort(() => Math.random() - 0.5), correct_answer: word };
        } else if (t === 2) {
          return { word, type: 'spelling' as const, question_text: `“${word}” → ______`, options: null, correct_answer: word };
        } else {
          return { word, type: 'situation' as const, question_text: `Which word fits this context: "The student learned a new ______ to describe this feeling."`, options: [word, 'lesson', 'school', 'homework'].sort(() => Math.random() - 0.5), correct_answer: word };
        }
      });
      setQuestions(mergeQuestions([], localQs as ExamQuestion[]));
      setStep('review');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!questions.length) return;
    setSaving(true);
    try {
      if (editingExamId) {
        await examsService.updateExam(editingExamId, {
          title: examTitle.trim(),
          description: examDesc.trim() || undefined,
          questions
        });
        toast.success('Exam updated successfully!');
      } else {
        await examsService.createExam({
          groupId: wizardGroupId,
          title: examTitle.trim(),
          description: examDesc.trim() || undefined,
          questions
        });
        toast.success('Exam published successfully!');
      }
      resetWizard();
      loadData();
    } catch (e: unknown) {
      const errMessage = e instanceof Error ? e.message : String(e);
      toast.error(errMessage || 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  const handleFetchAudio = async (word: string, index: number) => {
    if (!word.trim()) {
      toast.error('Please enter a word first');
      return;
    }
    const toastId = toast.loading(`Fetching Cambridge audio for "${word}"...`);
    try {
      const res = await examsService.lookupWord(word.trim());
      const data = (res as { data?: { audioUrl?: string } } & { audioUrl?: string }).data ?? res;
      const audioUrl = (data as { audioUrl?: string }).audioUrl;
      if (audioUrl) {
        setQuestions(qs => qs.map((x, i) => i === index ? { ...x, audio_url: audioUrl } : x));
        toast.success(`Successfully loaded Cambridge pronunciation audio for "${word}"! 🎧`, { id: toastId });
        speak(word, audioUrl);
      } else {
        toast.error(`Audio not found for "${word}" in Cambridge Dictionary.`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to fetch Cambridge audio for "${word}".`, { id: toastId });
    }
  };

  const handleWizardAutoFillAI = async (word: string, index: number, type: string) => {
    if (!word.trim()) {
      toast.error('Please enter a word first');
      return;
    }
    const toastId = toast.loading(`Generating question for "${word}"...`);
    try {
      const res = await examsService.generateQuestions([word.trim()]);
      const newQs: ExamQuestion[] = Array.isArray(res) ? (res as ExamQuestion[]) : (((res as { data?: ExamQuestion[] }).data ?? []) as ExamQuestion[]);
      if (newQs && newQs.length > 0) {
        const matchedQ = newQs.find(q => q.type === type) || newQs.find(q => q.type !== 'matching') || newQs[0];
        if (matchedQ) {
          setQuestions(qs => qs.map((x, i) => i === index ? {
            ...x,
            question_text: matchedQ.question_text,
            options: matchedQ.options,
            correct_answer: matchedQ.correct_answer,
            audio_url: matchedQ.audio_url || x.audio_url || null
          } : x));
          toast.success(`AI successfully generated details for "${word}"! ✨`, { id: toastId });
        } else {
          toast.error(`Could not generate details for "${word}".`, { id: toastId });
        }
      } else {
        toast.error(`AI failed to generate question details for "${word}".`, { id: toastId });
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error((err as { message?: string })?.message || `Failed to generate details for "${word}".`, { id: toastId });
    }
  };

  const handleWizardAIAddWords = async () => {
    if (!wizardNewWords.trim()) {
      toast.error('Please enter at least one word');
      return;
    }
    const words = wizardNewWords.split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
    if (!words.length) {
      toast.error('No valid words found');
      return;
    }

    const existingWords = new Set(questions.map(q => q.word.toLowerCase()));
    const duplicates: string[] = [];
    const newWords: string[] = [];

    words.forEach(w => {
      if (existingWords.has(w.toLowerCase())) {
        duplicates.push(w);
      } else {
        newWords.push(w);
      }
    });

    if (duplicates.length > 0) {
      toast(`Skipped ${duplicates.length} duplicate word(s) (${duplicates.join(', ')})`, {
         icon: '⚠️',
         duration: 4000,
      });
    }

    if (newWords.length === 0) {
      toast.error('All entered words already exist in this exam.');
      return;
    }

    setWizardAddingWords(true);
    const toastId = toast.loading(`Generating questions for ${newWords.length} new word(s)...`);
    try {
      const res = await examsService.generateQuestions(newWords);
      const newQs: ExamQuestion[] = Array.isArray(res) ? (res as ExamQuestion[]) : (((res as { data?: ExamQuestion[] }).data ?? []) as ExamQuestion[]);
      if (newQs && newQs.length > 0) {
        setQuestions(prev => mergeQuestions(prev, newQs));
        toast.success(`Generated questions for ${newWords.length} new word(s) successfully!`, { id: toastId });
        setWizardShowAddWords(false);
        setWizardNewWords('');
      } else {
        toast.error('Failed to generate questions. No questions returned from AI.', { id: toastId });
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error((err as { message?: string })?.message || 'Failed to generate questions with AI.', { id: toastId });
    } finally {
      setWizardAddingWords(false);
    }
  };


  const resetWizard = () => {
    setIsCreateOpen(false);
    setEditingExamId(null);
    setStep('input');
    setExamTitle('');
    setExamDesc('');
    setWordInput('');
    setQuestions([]);
    setWizardShowAddWords(false);
    setWizardNewWords('');
    setWizardAddingWords(false);
  };

  const handleTogglePublish = async (examId: string, isPublished: boolean) => {
    try {
      await examsService.updatePublishStatus(examId, isPublished);
      toast.success(`Exam marked as ${isPublished ? 'Active' : 'Draft'}`);
      
      
      setExams(prev => prev.map(e => e.id === examId ? { ...e, is_published: isPublished } : e));
    } catch (e: unknown) {
      const errMessage = e instanceof Error ? e.message : String(e);
      toast.error(errMessage || 'Failed to update publish status');
    }
  };

  const handleDeleteExam = async () => {
    if (!deletingExamId) return;
    try {
      await examsService.deleteExam(deletingExamId);
      toast.success('Exam deleted successfully');
      setDeletingExamId(null);
      loadData();
    } catch (e: unknown) {
      const errMessage = e instanceof Error ? e.message : String(e);
      toast.error(errMessage || 'Failed to delete exam');
    }
  };

  
  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (e.group_id && groups.find(g => g.id === e.group_id)?.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedGroupFilter) {
      return matchesSearch && e.group_id === selectedGroupFilter;
    }
    return matchesSearch;
  });

  const listeningCount = questions.filter(q => q.type === 'listening').length;
  const cambridgeCount = questions.filter(q => q.type === 'listening' && q.audio_url).length;

  return (
    <>
      {}
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
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <FileText className="text-blue-500" />
              Exam Library
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-1">Challenge your skills and master correct spelling and pronunciation.</p>
        </motion.div>
        
        {role === 'teacher' && (
          <motion.button 
            variants={itemVariants}
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-3 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-200 dark:shadow-none flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> Create Exam
          </motion.button>
        )}
      </motion.div>

      {}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search exams by title, class, or description..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all" 
          />
        </div>
        
        <div className="w-full md:w-64 relative">
          <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            value={selectedGroupFilter}
            onChange={e => setSelectedGroupFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm appearance-none cursor-pointer"
          >
            <option value="">All Classes</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </select>
        </div>
      </div>

      {}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-12 text-center shadow-sm max-w-lg mx-auto">
          <FileText className="mx-auto text-slate-300 dark:text-slate-500 mb-4 animate-pulse" size={48} />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No exams found</h3>
          <p className="text-slate-500 mb-6 text-sm">
            {role === 'teacher' ? "You haven't assigned any exams to this class yet." : "Your instructor hasn't scheduled any exams for you yet."}
          </p>
          {role === 'teacher' && (
            <button onClick={() => setIsCreateOpen(true)} className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-100">
              Create First Exam
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
          {filteredExams.map((exam) => {
            const group = groups.find(g => g.id === exam.group_id);
            const groupName = group ? group.title : 'General';
            const attempts = exam.attempt_count ?? 0;
            const maxScore = exam.max_score ?? null;
            const isPub = Boolean(Number(exam.is_published));

            return (
              <motion.div variants={itemVariants} whileHover={{ y: -5 }} key={exam.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-700 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider inline-block">
                        {groupName}
                      </div>
                      {role === 'teacher' && (
                        isPub ? (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Draft</span>
                        )
                      )}
                    </div>
                    {role === 'teacher' && (
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTogglePublish(exam.id, !isPub); }}
                          className={`p-1.5 rounded-lg transition-colors border border-transparent ${
                            isPub 
                              ? 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-100 dark:hover:border-emerald-800' 
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
                          }`}
                          title={isPub ? "Hide from students" : "Assign to students"}
                        >
                          {isPub ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingExamId(exam.id);
                            setExamTitle(exam.title);
                            setExamDesc(exam.description || '');
                            setWizardGroupId(exam.group_id);
                            setQuestions(exam.questions || []);
                            setStep('input');
                            setIsCreateOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                          title="Add Words"
                        >
                          <Plus size={15} />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingExamId(exam.id);
                            setExamTitle(exam.title);
                            setExamDesc(exam.description || '');
                            setWizardGroupId(exam.group_id);
                            setQuestions(exam.questions || []);
                            setStep('review');
                            setIsCreateOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                          title="Edit Exam"
                        >
                          <Pencil size={15} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeletingExamId(exam.id); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                          title="Delete Exam"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{exam.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem] mb-4 font-medium leading-relaxed">
                    {exam.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600/50">
                    <span className="flex items-center gap-1.5">
                      <FileText size={14} className="text-slate-400" /> 
                      {exam.question_count ?? 0} Questions
                    </span>
                    {role === 'student' && (
                      <span className={attempts > 0 ? 'text-emerald-500' : 'text-slate-500'}>
                        {attempts > 0 ? `Max Score: ${maxScore}/${exam.question_count}` : 'Not Attempted'}
                      </span>
                    )}
                    {role === 'teacher' && (
                      <span className="text-indigo-600 flex items-center gap-1">
                        <Eye size={12} /> {exam.student_count ?? 0} students submitted
                      </span>
                    )}
                  </div>
                </div>

                {}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={() => {
                      if (role === 'teacher') {
                        setEditingExamId(exam.id);
                        setExamTitle(exam.title);
                        setExamDesc(exam.description || '');
                        setWizardGroupId(exam.group_id);
                        setQuestions(exam.questions || []);
                        setStep('review');
                        setIsCreateOpen(true);
                      } else {
                        setTakerMode(attempts > 0 ? 'review' : 'take');
                        setActiveExam(exam);
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                      role === 'student' && attempts > 0 
                        ? 'bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-100'
                    }`}
                  >
                    {role === 'teacher' ? 'Edit & Manage Exam' : attempts > 0 ? 'Review Results' : 'Start Exam'}
                    {role === 'teacher' ? <FileText size={12} /> : attempts > 0 ? <Eye size={12} /> : <Play size={12} className="fill-current" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-3xl text-white">
              <div>
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Sparkles size={20} /> Create AI Vocabulary Exam
                </h2>
                <p className="text-blue-100 text-xs mt-0.5">
                  {step === 'input' ? 'Step 1: Exam Settings & Wordlist' : 'Step 2: Review & Modify Questions'}
                </p>
              </div>
              <button onClick={resetWizard} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {}
            <div className="flex border-b border-slate-100 dark:border-slate-700 px-6 pt-3 pb-0 gap-6">
              {(['input', 'review'] as const).map((s, i) => (
                <button 
                  key={s} 
                  onClick={() => step === 'review' && s === 'input' && setStep('input')}
                  className={`pb-3 text-xs font-bold border-b-2 transition-colors ${step === s ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400'}`}
                >
                  {i + 1}. {s === 'input' ? 'Select Class & Wordlist' : 'Review Cambridge Audio & Questions'}
                </button>
              ))}
            </div>

            {}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {step === 'input' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1">Assigned Class *</label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <select 
                          value={wizardGroupId} 
                          onChange={e => setWizardGroupId(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select a class...</option>
                          {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1">Exam Title *</label>
                      <input 
                        type="text" 
                        value={examTitle} 
                        onChange={e => setExamTitle(e.target.value)}
                        placeholder="e.g. Unit 2 Adjectives Quiz"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1">Description (Optional)</label>
                    <input 
                      type="text" 
                      value={examDesc} 
                      onChange={e => setExamDesc(e.target.value)}
                      placeholder="e.g. Synonyms, listening, situational context"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" 
                    />
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <label className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1.5">Enter Word List *</label>
                    <textarea 
                      rows={6} 
                      value={wordInput} 
                      onChange={e => setWordInput(e.target.value)}
                      placeholder={`Enter vocabulary words separated by commas or new lines:\ne.g. happy, excited, intelligent, generous`}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-white resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" 
                    />
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      🎧 Listening questions are guaranteed to use correct **Cambridge Dictionary** pronunciation audio instead of AI-synthesized robotic speech.
                    </p>
                  </div>
                </>
              )}

              {step === 'review' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-800 dark:text-white text-sm">{questions.length} Questions Generated</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {listeningCount > 0 && (
                          <span className={cambridgeCount === listeningCount ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                            🎧 {cambridgeCount}/{listeningCount} listening questions loaded with premium Cambridge audio
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setStep('input')} 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors border border-slate-200 dark:border-slate-600"
                      >
                        <RefreshCw size={13} /> Edit Words
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TYPE_META).map(([type, meta]) => {
                      const cnt = questions.filter(q => q.type === type).length;
                      if (!cnt) return null;
                      return (
                        <span key={type} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${meta.color}`}>
                          {meta.emoji} {meta.label}: {cnt}
                        </span>
                      );
                    })}
                  </div>

                  {}
                  <div className="bg-slate-50 dark:bg-slate-700/50 border border-slate-200/60 dark:border-slate-600 rounded-2xl p-3.5 flex flex-wrap items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Vocab list:</span>
                    {Array.from(
                      new Set(
                        questions
                          .map(q => q.word)
                          .flatMap(w => w.split(',').map(s => s.trim()))
                          .filter(Boolean)
                      )
                    ).map((word, wIdx) => (
                      <span key={wIdx} className="text-xs font-bold px-3 py-1 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-slate-700 dark:text-slate-100 rounded-xl shadow-sm hover:border-blue-400 hover:text-blue-500 transition-all select-none">
                        {word}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                    {questions.map((q, idx) => (
                      <EditableQuestion 
                        key={idx} 
                        q={q} 
                        idx={idx}
                        onChange={updated => handleWizardQuestionChange(updated, idx)}
                        onDelete={() => setQuestions(qs => qs.filter((_, i) => i !== idx))} 
                        onFetchAudio={handleFetchAudio}
                        onAutoFillAI={handleWizardAutoFillAI}
                      />
                    ))}
                    <button type="button" onClick={() => setWizardShowAddWords(true)} className="w-full py-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5">
                      <Plus size={14} /> Add Another Question
                    </button>
                  </div>
                </>
              )}
            </div>

            {}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={resetWizard} 
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              
              {step === 'input' ? (
                <button 
                  onClick={handleGenerate} 
                  disabled={generating || !examTitle || !wordInput || !wizardGroupId}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-200"
                >
                  {generating ? <Loader2 size={16} className="animate-spin animate-duration-1000" /> : <Sparkles size={16} />}
                  {generating ? 'Processing words + Fetching Cambridge audio...' : 'Generate Questions'}
                </button>
              ) : (
                <button 
                  onClick={handleSave} 
                  disabled={saving || !questions.length}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Publishing Exam...' : 'Publish Exam'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {}
      <AnimatePresence>
      {activeExam && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <SharedExamTakerModal exam={activeExam} mode={takerMode} onClose={() => {
            setActiveExam(null);
            loadData();
            const url = new URL(window.location.href);
            if (url.searchParams.has('take')) {
              url.searchParams.delete('take');
              router.replace(url.pathname + url.search);
            }
          }} />
        </motion.div>
      )}
      </AnimatePresence>

      {}
      <AnimatePresence>
      {deletingExamId && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100]"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 border border-rose-100 dark:border-rose-800 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-md font-extrabold text-slate-900 dark:text-white mb-1.5">Delete Exam?</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-6 leading-relaxed">
              This will permanently delete this exam and all of its student attempts. This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeletingExamId(null)}
                className="flex-1 py-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold rounded-xl text-xs transition-colors border border-slate-200 dark:border-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteExam}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-rose-100"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {}
      {wizardShowAddWords && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col p-6 space-y-4 animate-in scale-in duration-200 text-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="text-purple-500" size={18} /> Add Vocabulary via AI
              </h3>
              <button onClick={() => { setWizardShowAddWords(false); setWizardNewWords(''); }} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">New Target Words</label>
              <textarea
                rows={4}
                value={wizardNewWords}
                onChange={e => setWizardNewWords(e.target.value)}
                placeholder="Enter words separated by commas or new lines, e.g. genius, brave, wisdom"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Existing words in the exam will be automatically identified and skipped.
              </p>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const newQ: ExamQuestion = {
                    word: '',
                    type: 'listening',
                    question_text: 'Nghe phát âm và chọn từ viết đúng chính tả:',
                    options: ['', '', '', ''],
                    correct_answer: '',
                    audio_url: null,
                  };
                  setQuestions(prev => [...prev, newQ]);
                  setWizardShowAddWords(false);
                  setWizardNewWords('');
                  toast.success('Added new empty question!');
                }}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={13} /> Add Empty Card
              </button>
              <button
                type="button"
                disabled={wizardAddingWords || !wizardNewWords.trim()}
                onClick={handleWizardAIAddWords}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-1.5"
              >
                {wizardAddingWords ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {wizardAddingWords ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default function ExamsPage() { return <Suspense fallback={<div>Loading...</div>}><ExamsPageContent /></Suspense>; }
