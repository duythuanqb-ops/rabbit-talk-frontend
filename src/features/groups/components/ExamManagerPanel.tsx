'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Loader2, Trash2, Sparkles,
  Save, X, Volume2
} from 'lucide-react';
import { examsService, Exam, ExamQuestion } from '../services/exams.service';
import toast from 'react-hot-toast';
import { SharedExamTakerModal } from "@/features/exams/components/SharedExamTakerModal";


function buildGoogleTtsProxyUrl(text: string): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
  return `${apiBase}/proxy-audio?url=${encodeURIComponent(ttsUrl)}`;
}

function speak(text: string, audioUrl?: string | null) {
  if (typeof window === 'undefined') return;
  speechSynthesis.cancel();

  
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


const TYPE_META: Record<string, { label: string; emoji: string; color: string; gradient: string }> = {
  matching: { label: 'Matching',  emoji: '🔗', color: 'bg-purple-50 text-purple-600 border-purple-100',  gradient: 'from-purple-400 to-purple-600' },
  synonym:  { label: 'Synonym',   emoji: '🔗', color: 'bg-purple-50 text-purple-600 border-purple-100',  gradient: 'from-purple-400 to-purple-600' },
  listening:{ label: 'Listening', emoji: '🎧', color: 'bg-blue-50 text-blue-600 border-blue-100',        gradient: 'from-blue-400 to-blue-600'    },
  spelling: { label: 'Spelling',  emoji: '✏️', color: 'bg-amber-50 text-amber-600 border-amber-100',     gradient: 'from-amber-400 to-amber-600'  },
  situation:{ label: 'Situation', emoji: '🌍', color: 'bg-emerald-50 text-emerald-600 border-emerald-100',gradient: 'from-emerald-400 to-emerald-600'},
};



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
                      <span className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg">{w}</span>
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





interface Props {
  groupId: string;
}

export function ExamManagerPanel({ groupId }: Props) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [editingExamId, setEditingExamId] = useState<string | null>(null);
  const [showExamList, setShowExamList] = useState(false);

  
  const [showWizard, setShowWizard] = useState(false);
  
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [wizardDueDate, setWizardDueDate] = useState('');
  const [wizardStartDate, setWizardStartDate] = useState('');
  const [wizardAllowRetry, setWizardAllowRetry] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  
  const [wizardShowAddWords, setWizardShowAddWords] = useState(false);
  const [wizardNewWords, setWizardNewWords] = useState('');
  const [wizardAddingWords, setWizardAddingWords] = useState(false);

  const formatForDatetimeLocal = (isoString?: string) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

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

  const loadExams = useCallback(async () => {
    setLoading(true);
    try {
      const res: unknown = await examsService.getExamsByGroup(groupId);
      const data = (res as { data?: Exam[] }).data ?? (res as Exam[]) ?? [];
      setExams(data);
    } catch {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  
  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        loadExams();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [loadExams]);



  const handleGenerate = async () => {
    if (!wordInput.trim()) { toast.error('Please enter at least one word'); return; }
    const items = wordInput.trim().split(/[\n,]+/).map(w => w.trim()).filter(Boolean);
    if (!items.length) { toast.error('No valid words found'); return; }
    if (items.length > 30) { toast.error('Please limit to 30 words'); return; }

    setGenerating(true);
    try {
      const res: unknown = await examsService.generateQuestions(items);
      const qs: ExamQuestion[] = Array.isArray(res) ? (res as ExamQuestion[]) : (((res as unknown) as { data?: ExamQuestion[] }).data ?? []);
      if (!qs.length) throw new Error('No questions returned');
      setQuestions(mergeQuestions([], qs));
      if (!examTitle) setExamTitle(`Exam ${new Date().toLocaleDateString('vi-VN')}`);
      
      toast.success('Questions generated with Cambridge audio! 🎧');
    } catch (e) {
      const err = e as Error;
      toast.error(err?.message || 'Failed to generate questions. Please try again.', { icon: '❌' });
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!examTitle.trim()) { toast.error('Please enter an exam title'); return; }
    if (!questions.length) { toast.error('No questions to save'); return; }
    setSaving(true);
    try {
      const payload = {
        title: examTitle.trim(),
        description: examDesc.trim() || undefined,
        dueDate: wizardDueDate ? new Date(wizardDueDate).toISOString() : undefined,
        startDate: wizardStartDate ? new Date(wizardStartDate).toISOString() : undefined,
        allowRetry: wizardAllowRetry,
        questions
      };
      if (editingExamId) {
        await examsService.updateExam(editingExamId, payload);
        toast.success('Exam updated! 🎉');
      } else {
        await examsService.createExam({ groupId, ...payload });
        toast.success('Exam published! 🎉');
      }
      resetWizard();
      void loadExams();
    } catch (e) {
      const err = e as Error;
      toast.error(err?.message ?? 'Failed to save exam');
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
      
      const data = ((res as unknown) as { data?: { audioUrl?: string } }).data ?? (res as { audioUrl?: string });
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

  const handleWizardAutoFillAI = async (word: string, index: number, type: string) => {
    if (!word.trim()) {
      toast.error('Please enter a word first');
      return;
    }
    const toastId = toast.loading(`Generating question for "${word}"...`);
    try {
      const res = await examsService.generateQuestions([word.trim()]);
      
      const newQs: ExamQuestion[] = Array.isArray(res) ? (res as ExamQuestion[]) : (((res as unknown) as { data?: ExamQuestion[] }).data ?? []);
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
      
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error(error?.message || `Failed to generate details for "${word}".`, { id: toastId });
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
      
      const newQs: ExamQuestion[] = Array.isArray(res) ? (res as ExamQuestion[]) : (((res as unknown) as { data?: ExamQuestion[] }).data ?? []);
      if (newQs && newQs.length > 0) {
        setQuestions(prev => mergeQuestions(prev, newQs));
        toast.success(`Generated questions for ${newWords.length} new word(s) successfully!`, { id: toastId });
        setWizardShowAddWords(false);
        setWizardNewWords('');
      } else {
        toast.error('Failed to generate questions. No questions returned from AI.', { id: toastId });
      }
      
    } catch (err) {
      const error = err as Error;
      console.error(error);
      toast.error(error?.message || 'Failed to generate questions with AI.', { id: toastId });
    } finally {
      setWizardAddingWords(false);
    }
  };



  const handleDelete = async (id: string) => {
    try {
      await examsService.deleteExam(id);
      toast.success('Exam deleted');
      setDeletingId(null);
      loadExams();
    } catch {
      toast.error('Failed to delete exam');
    }
  };

  const resetWizard = () => {
    setShowWizard(false);
    setEditingExamId(null);
    
    setWordInput('');
    setExamTitle('');
    setExamDesc('');
    setWizardDueDate('');
    setWizardStartDate('');
    setWizardAllowRetry(false);
    setWordInput('');
    setWizardShowAddWords(false);
    setWizardNewWords('');
    setWizardAddingWords(false);
    setQuestions([]);
  };

  const listeningCount = questions.filter(q => q.type === 'listening').length;
  const cambridgeCount = questions.filter(q => q.type === 'listening' && q.audio_url).length;

  return (
    <div className="flex flex-col h-full">
      {}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-blue-500" size={18} /> Exams
        </h4>
      </div>

      {}
      <p className="text-sm text-slate-500 mb-6">
        Create AI-powered vocabulary exams for your students with Cambridge-quality audio for listening questions.
      </p>

      {}
      {loading ? (
        <div className="flex items-center justify-center py-4 flex-1">
          <Loader2 className="animate-spin text-blue-400" size={20} />
        </div>
      ) : showExamList && exams.length > 0 ? (
        <div className="space-y-2 mb-4 overflow-y-auto max-h-48">
          {exams.map(exam => (
            <div key={exam.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex-1 min-w-0 mr-2">
                <p className="font-bold text-slate-800 text-sm truncate">{exam.title}</p>
                <p className="text-[11px] text-slate-400 font-medium">{exam.question_count ?? 0} questions</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={async () => {
                  try {
                    const res = await examsService.getExamById(exam.id);
                    
                    const fullExam = ((res as unknown) as { data?: Exam }).data ?? (res as Exam);
                    setEditingExamId(exam.id);
                    setExamTitle(exam.title);
                    setExamDesc(exam.description || '');
                    setWizardDueDate(fullExam.due_date ? formatForDatetimeLocal(fullExam.due_date) : '');
                    setWizardStartDate(fullExam.start_date ? formatForDatetimeLocal(fullExam.start_date) : '');
                    setWizardAllowRetry(!!fullExam.allow_retry);
                    setQuestions(fullExam.questions || []);
                    
                    setShowWizard(true);
                  } catch (error) {
                    console.error(error);
                    toast.error('Failed to load exam details');
                  }
                }}
                  className="flex items-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-lg text-xs transition-colors">
                  <FileText size={11} /> Edit
                </button>
                <button onClick={() => setDeletingId(exam.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {}
      <div className="flex gap-2 mt-auto">
        {exams.length > 0 && (
          <button
            onClick={() => setShowExamList(v => !v)}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
          >
            {showExamList ? 'Hide List' : `View ${exams.length} Exam${exams.length > 1 ? 's' : ''}`}
          </button>
        )}
        <button
          onClick={() => setShowWizard(true)}
          className={`${exams.length > 0 ? 'flex-1' : 'w-full'} py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-200 transition-colors flex items-center justify-center gap-1.5`}
        >
          <Plus size={14} /> Create Exam
        </button>
      </div>

      {}
      {showWizard && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">

            {}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-blue-700 text-white shrink-0">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles size={20} /> Create AI Vocabulary Exam
                </h2>
                <p className="text-blue-100 text-xs mt-0.5">
                  Configure exam settings and review generated questions all in one place
                </p>
              </div>
              <button onClick={resetWizard} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {}
              <div className="w-full lg:w-[40%] flex flex-col border-r border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Exam Title *</label>
                    <input type="text" value={examTitle} onChange={e => setExamTitle(e.target.value)}
                      placeholder="e.g. Unit 5 Vocabulary Quiz"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold text-slate-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Description (optional)</label>
                    <input type="text" value={examDesc} onChange={e => setExamDesc(e.target.value)}
                      placeholder="e.g. Covers Unit 5 adjectives"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Start Date (optional)</label>
                      <input type="datetime-local" value={wizardStartDate} onChange={e => setWizardStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Due Date (optional)</label>
                      <input type="datetime-local" value={wizardDueDate} onChange={e => setWizardDueDate(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input 
                      type="checkbox" 
                      id="wizardAllowRetry" 
                      checked={wizardAllowRetry} 
                      onChange={e => setWizardAllowRetry(e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="wizardAllowRetry" className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Allow students to retry this exam
                    </label>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Enter Words *</label>
                    <textarea rows={6} value={wordInput} onChange={e => setWordInput(e.target.value)}
                      placeholder={`Enter words separated by commas or new lines:\nhappy, hungry, tired\ngenius\nattack`}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-700 dark:text-white resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      🎧 Listening questions will use <strong>Cambridge Dictionary</strong> audio (not AI voice).
                    </p>
                  </div>
                </div>
                
                {}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
                  <button onClick={handleGenerate} disabled={generating || !examTitle || !wordInput}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-200 dark:shadow-none">
                    {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {generating ? 'Processing words...' : 'Generate Questions'}
                  </button>
                </div>
              </div>

              {}
              <div className="w-full lg:w-[60%] flex flex-col bg-white dark:bg-slate-800">
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white">{questions.length} Questions Generated</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {listeningCount > 0 && (
                          <span className={cambridgeCount === listeningCount ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                            🎧 {cambridgeCount}/{listeningCount} listening questions have Cambridge audio
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TYPE_META).map(([type, meta]) => {
                      const cnt = questions.filter(q => q.type === type).length;
                      if (!cnt) return null;
                      return (
                        <span key={type} className={`text-[11px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${meta.color}`}>
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

                  <div className="space-y-4">
                    {questions.map((q, idx) => (
                      <EditableQuestion key={idx} q={q} idx={idx}
                        onChange={updated => handleWizardQuestionChange(updated, idx)}
                        onDelete={() => setQuestions(qs => qs.filter((_, i) => i !== idx))}
                        onFetchAudio={handleFetchAudio}
                        onAutoFillAI={handleWizardAutoFillAI}
                      />
                    ))}
                    {questions.length === 0 && (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                        <FileText size={48} className="mb-3 opacity-20" />
                        <p className="text-sm font-medium">No questions generated yet</p>
                        <p className="text-xs mt-1">Enter a wordlist on the left and click Generate</p>
                      </div>
                    )}
                    <button type="button" onClick={() => setWizardShowAddWords(true)} className="w-full py-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-300 hover:text-slate-600 dark:hover:text-white transition-colors flex items-center justify-center gap-1.5">
                      <Plus size={14} /> Add Another Question
                    </button>
                  </div>
                </div>

                {}
                <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 gap-3 shrink-0">
                  <button onClick={resetWizard} className="px-4 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving || !questions.length || !examTitle}
                    className="flex items-center gap-2 px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200 dark:shadow-none">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Publishing...' : 'Publish Exam'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {}
      {activeExam && <SharedExamTakerModal exam={activeExam} onClose={() => { setActiveExam(null); loadExams(); }} />}

      {}
      {deletingId && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-slate-900 dark:text-white mb-2">Delete Exam?</h3>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone. All student attempts will also be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-rose-200 dark:shadow-none">Delete</button>
            </div>
          </div>
        </div>
      )}

      {}
      {wizardShowAddWords && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 dark:border-slate-700 flex flex-col p-6 space-y-4 animate-in scale-in duration-200 text-slate-800 dark:text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="text-purple-500" size={18} /> Add Vocabulary via AI
              </h3>
              <button onClick={() => { setWizardShowAddWords(false); setWizardNewWords(''); }} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">New Target Words</label>
              <textarea
                rows={4}
                value={wizardNewWords}
                onChange={e => setWizardNewWords(e.target.value)}
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
                  setWizardShowAddWords(false);
                  setWizardNewWords('');
                  toast.success('Added new empty question!');
                }}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={13} /> Add Empty Card
              </button>
              <button
                type="button"
                disabled={wizardAddingWords || !wizardNewWords.trim()}
                onClick={handleWizardAIAddWords}
                className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-purple-200 dark:shadow-none flex items-center justify-center gap-1.5"
              >
                {wizardAddingWords ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {wizardAddingWords ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
