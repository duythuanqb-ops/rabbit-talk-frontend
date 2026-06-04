'use client';

import { useState } from 'react';
import {
  Users, X, Sparkles, Loader2, RefreshCw, Save,
  Volume2, Trash2, Plus,
} from 'lucide-react';
import { examsService, ExamQuestion } from '@/features/groups/services/exams.service';
import { Group } from '@/features/groups/types/groups.types';
import toast from 'react-hot-toast';

// ─── Quiz type metadata ───────────────────────────────────────────────────────
const TYPE_META: Record<string, { label: string; emoji: string; color: string }> = {
  matching: { label: 'Matching',  emoji: '🔗', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  synonym:  { label: 'Synonym',   emoji: '🔗', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  listening:{ label: 'Listening', emoji: '🎧', color: 'bg-blue-50 text-blue-600 border-blue-100'       },
  spelling: { label: 'Spelling',  emoji: '✏️', color: 'bg-amber-50 text-amber-600 border-amber-100'    },
  situation:{ label: 'Situation', emoji: '🌍', color: 'bg-emerald-50 text-emerald-600 border-emerald-100'},
};

function buildGoogleTtsProxyUrl(text: string): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
  return `${apiBase}/proxy-audio?url=${encodeURIComponent(ttsUrl)}`;
}

function speak(text: string, audioUrl?: string | null) {
  if (typeof window === 'undefined') return;
  speechSynthesis.cancel();
  // Use stored URL if available, otherwise build a Google TTS proxy URL on the fly
  const src = audioUrl || buildGoogleTtsProxyUrl(text);
  const audio = new Audio();
  audio.src = src;
  audio.play().catch(() => {
    setTimeout(() => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'en-US';
      utt.rate = 0.85;
      speechSynthesis.speak(utt);
    }, 50);
  });
}
const mergeQuestions = (existingList: ExamQuestion[], generatedList: ExamQuestion[]): ExamQuestion[] => {
  const result = existingList.map(q => ({ ...q }));
  let existingMatchingIdx = result.findIndex(q => q.type === 'matching');
  
  for (const newQ of generatedList) {
    if (newQ.type === 'matching') {
      if (existingMatchingIdx > -1) {
        const existingQ = result[existingMatchingIdx];
        try {
          const existingPairs = existingQ.correct_answer ? JSON.parse(existingQ.correct_answer) : {};
          const newPairs = newQ.correct_answer ? JSON.parse(newQ.correct_answer) : {};
          const mergedPairs = { ...existingPairs, ...newPairs };
          
          existingQ.correct_answer = JSON.stringify(mergedPairs);
          existingQ.word = Object.keys(mergedPairs).join(', ');
          
          const allOptions = Object.values(mergedPairs) as string[];
          existingQ.options = Array.from(new Set(allOptions)).sort(() => Math.random() - 0.5);
        } catch (e) {
          console.error('Failed to merge matching questions:', e);
          result.push({ ...newQ });
        }
      } else {
        result.push({ ...newQ });
        existingMatchingIdx = result.length - 1;
      }
    } else {
      result.push({ ...newQ });
    }
  }
  return result;
};

// ─── Editable Question Card ───────────────────────────────────────────────────
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

// ─── Exam Create Wizard ───────────────────────────────────────────────────────
interface ExamCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  groups: Group[];
  defaultGroupId?: string;
}

export function ExamCreateWizard({ isOpen, onClose, onCreated, groups, defaultGroupId }: ExamCreateWizardProps) {
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [wizardGroupId, setWizardGroupId] = useState(defaultGroupId || '');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  // AI Vocabulary addition states
  const [showAddWordsDialog, setShowAddWordsDialog] = useState(false);
  const [newWordsInput, setNewWordsInput] = useState('');
  const [addingWords, setAddingWords] = useState(false);

  const listeningCount = questions.filter(q => q.type === 'listening').length;
  const cambridgeCount = questions.filter(q => q.type === 'listening' && q.audio_url).length;

  const handleQuestionChange = (updated: ExamQuestion, index: number) => {
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

  const reset = () => {
    setStep('input');
    setExamTitle('');
    setExamDesc('');
    setWordInput('');
    setWizardGroupId(defaultGroupId || '');
    setQuestions([]);
    setShowAddWordsDialog(false);
    setNewWordsInput('');
    setAddingWords(false);
    onClose();
  };

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
      const qs: ExamQuestion[] = Array.isArray(res) ? (res as ExamQuestion[]) : (((res as unknown) as { data?: ExamQuestion[] }).data ?? []);
      if (!qs.length) throw new Error('No questions returned');
      setQuestions(mergeQuestions([], qs));
      setStep('review');
      toast.success('Questions generated with Cambridge audio! 🎧');
    } catch (e) {
      const err = e as Error;
      toast.error(err?.message || 'Failed to generate questions. Please try again.', { icon: '❌' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!questions.length) return;
    setSaving(true);
    try {
      await examsService.createExam({ groupId: wizardGroupId, title: examTitle.trim(), description: examDesc.trim() || undefined, questions });
      toast.success('Exam published successfully!');
      onCreated();
      reset();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to publish exam');
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (res as any).data ?? res;
      if (data && data.audioUrl) {
        setQuestions(qs => qs.map((x, i) => i === index ? { ...x, audio_url: data.audioUrl } : x));
        toast.success(`Successfully loaded Cambridge pronunciation audio for "${word}"! 🎧`, { id: toastId });
        speak(word, data.audioUrl);
      } else {
        toast.error(`Audio not found for "${word}" in Cambridge Dictionary.`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error(`Failed to fetch Cambridge audio for "${word}".`, { id: toastId });
    }
  };

  const handleAutoFillAI = async (word: string, index: number, type: string) => {
    if (!word.trim()) {
      toast.error('Please enter a word first');
      return;
    }
    const toastId = toast.loading(`Generating question for "${word}"...`);
    try {
      const res = await examsService.generateQuestions([word.trim()]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newQs: ExamQuestion[] = Array.isArray(res) ? (res as ExamQuestion[]) : (((res as any).data ?? []) as ExamQuestion[]);
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || `Failed to generate details for "${word}".`, { id: toastId });
    }
  };

  const handleAIAddWords = async () => {
    if (!newWordsInput.trim()) {
      toast.error('Please enter at least one word');
      return;
    }
    const words = newWordsInput.split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
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

    setAddingWords(true);
    const toastId = toast.loading(`Generating questions for ${newWords.length} new word(s)...`);
    try {
      const res = await examsService.generateQuestions(newWords);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newQs: ExamQuestion[] = Array.isArray(res) ? (res as ExamQuestion[]) : (((res as any).data ?? []) as ExamQuestion[]);
      if (newQs && newQs.length > 0) {
        setQuestions(prev => mergeQuestions(prev, newQs));
        toast.success(`Generated questions for ${newWords.length} new word(s) successfully!`, { id: toastId });
        setShowAddWordsDialog(false);
        setNewWordsInput('');
      } else {
        toast.error('Failed to generate questions. No questions returned from AI.', { id: toastId });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to generate questions with AI.', { id: toastId });
    } finally {
      setAddingWords(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full ${step === 'review' ? 'max-w-6xl' : 'max-w-2xl'} max-h-[92vh] flex flex-col overflow-hidden transition-all duration-300`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-3xl text-white">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2"><Sparkles size={20} /> Create AI Vocabulary Exam</h2>
            <p className="text-blue-100 text-xs mt-0.5">{step === 'input' ? 'Step 1: Exam Settings & Wordlist' : 'Step 1: Settings & Wordlist | Step 2: Review Questions'}</p>
          </div>
          <button onClick={reset} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        {/* Stepper */}
        {step === 'input' && (
          <div className="flex border-b border-slate-100 px-6 pt-3 pb-0 gap-6">
            {(['input', 'review'] as const).map((s, i) => (
              <button key={s} onClick={() => { if (s === 'input') setStep('input'); }}
                className={`pb-3 text-xs font-bold border-b-2 transition-colors ${step === s ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400'}`}>
                {i + 1}. {s === 'input' ? (defaultGroupId ? 'Exam Settings & Wordlist' : 'Select Class & Wordlist') : 'Review Cambridge Audio & Questions'}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className={`flex-1 overflow-y-auto p-6 ${step === 'review' ? 'flex flex-col lg:flex-row gap-8' : 'space-y-5'}`}>
          {/* LEFT: Input Form (Always visible) */}
          <div className={`${step === 'review' ? 'w-full lg:w-[40%] flex-shrink-0 space-y-5' : 'space-y-5'}`}>
            <div className={`grid grid-cols-1 ${defaultGroupId ? '' : 'md:grid-cols-2'} gap-4`}>
              {!defaultGroupId && (
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-1">Assigned Class *</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <select value={wizardGroupId} onChange={e => setWizardGroupId(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 appearance-none cursor-pointer">
                      <option value="" disabled>Select a class...</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-black text-slate-600 mb-1">Exam Title *</label>
                <input type="text" value={examTitle} onChange={e => setExamTitle(e.target.value)} placeholder="e.g. Unit 2 Adjectives Quiz"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">Description (Optional)</label>
              <input type="text" value={examDesc} onChange={e => setExamDesc(e.target.value)} placeholder="e.g. Synonyms, listening, situational context"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
            </div>
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-xs font-black text-slate-600 mb-1.5">Enter Word List *</label>
              <textarea rows={6} value={wordInput} onChange={e => setWordInput(e.target.value)}
                placeholder={`Enter vocabulary words separated by commas or new lines:\ne.g. happy, excited, intelligent, generous`}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-white resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                🎧 Listening questions are guaranteed to use correct **Cambridge Dictionary** pronunciation audio instead of AI-synthesized robotic speech.
              </p>
            </div>
            {step === 'review' && (
              <div className="pt-2">
                <button onClick={handleGenerate} disabled={generating || !examTitle || !wordInput || !wizardGroupId}
                  className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-50 font-bold rounded-xl text-sm transition-all border border-blue-200">
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  {generating ? 'Processing...' : 'Update Questions'}
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Review Column (Only in review mode) */}
          {step === 'review' && (
            <div className="w-full lg:w-[60%] border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8 space-y-5 flex flex-col min-h-0">
              <div className="flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">{questions.length} Questions Generated</h3>
                  {listeningCount > 0 && (
                    <p className={`text-[11px] mt-0.5 font-bold ${cambridgeCount === listeningCount ? 'text-emerald-600' : 'text-amber-600'}`}>
                      🎧 {cambridgeCount}/{listeningCount} listening questions loaded with premium Cambridge audio
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => setShowAddWordsDialog(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-all shadow-sm border border-emerald-600">
                  <Plus size={13} /> Add Question
                </button>
              </div>
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                {Object.entries(TYPE_META).map(([type, meta]) => {
                  const cnt = questions.filter(q => q.type === type).length;
                  if (!cnt) return null;
                  return <span key={type} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${meta.color}`}>{meta.emoji} {meta.label}: {cnt}</span>;
                })}
              </div>

              {/* Unique Vocabulary List Chip Container */}
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

              <div className="space-y-4 overflow-y-auto flex-1 pr-1 pb-4">
                {questions.map((q, idx) => (
                  <EditableQuestion key={idx} q={q} idx={idx}
                    onChange={updated => handleQuestionChange(updated, idx)}
                    onDelete={() => setQuestions(qs => qs.filter((_, i) => i !== idx))}
                    onFetchAudio={handleFetchAudio}
                    onAutoFillAI={handleAutoFillAI}
                  />
                ))}
              </div>
              <button type="button" onClick={() => setShowAddWordsDialog(true)} className="w-full py-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-600 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0">
                <Plus size={14} /> Add Another Question
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80">
          <button onClick={reset} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          {step === 'input' ? (
            <button onClick={handleGenerate} disabled={generating || !examTitle || !wordInput || !wizardGroupId}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-200">
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {generating ? 'Processing words + Fetching Cambridge audio...' : 'Generate Questions'}
            </button>
          ) : (
            <button onClick={handleSave} disabled={saving || !questions.length}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Publishing Exam...' : 'Publish Exam'}
            </button>
          )}
        </div>
      </div>

      {/* Add Vocabulary via AI Modal Overlay */}
      {showAddWordsDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col p-6 space-y-4 animate-in scale-in duration-200 text-slate-800 dark:text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="text-purple-500" size={18} /> Add Vocabulary via AI
              </h3>
              <button onClick={() => { setShowAddWordsDialog(false); setNewWordsInput(''); }} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">New Target Words</label>
              <textarea
                rows={4}
                value={newWordsInput}
                onChange={e => setNewWordsInput(e.target.value)}
                placeholder="Enter words separated by commas or new lines, e.g. genius, brave, wisdom"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-white resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
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
                  setShowAddWordsDialog(false);
                  setNewWordsInput('');
                  toast.success('Added new empty question! Go ahead and fill in details.');
                }}
                className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={13} /> Add Empty Card
              </button>
              <button
                type="button"
                disabled={addingWords || !newWordsInput.trim()}
                onClick={handleAIAddWords}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-200 flex items-center justify-center gap-1.5"
              >
                {addingWords ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {addingWords ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
