'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/features/dashboard/components';
import {
  FileText, Plus, Play, Loader2, Trash2, Sparkles,
  RefreshCw, Save, X, Volume2, ChevronRight,
  ChevronLeft, Trophy, RotateCcw, Headphones, PenLine,
  Lightbulb, Globe, XCircle, Search, Users, Eye
} from 'lucide-react';
import { examsService, Exam, ExamQuestion, ExamAttempt } from '@/features/groups/services/exams.service';
import { groupsService } from '@/features/groups/services/groups.service';
import { Group } from '@/features/groups/types/groups.types';
import { getProfile } from '@/features/auth/services/auth.service';
import toast from 'react-hot-toast';

// ─── Cambridge-first speak helper ─────────────────────────────────────────────
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

// ─── Quiz type metadata ───────────────────────────────────────────────────────
const TYPE_META: Record<string, { label: string; emoji: string; color: string; gradient: string }> = {
  matching: { label: 'Matching',  emoji: '🔗', color: 'bg-purple-50 text-purple-600 border-purple-100',  gradient: 'from-purple-400 to-purple-600' },
  synonym:  { label: 'Synonym',   emoji: '🔗', color: 'bg-purple-50 text-purple-600 border-purple-100',  gradient: 'from-purple-400 to-purple-600' },
  listening:{ label: 'Listening', emoji: '🎧', color: 'bg-blue-50 text-blue-600 border-blue-100',        gradient: 'from-blue-400 to-blue-600'    },
  spelling: { label: 'Spelling',  emoji: '✏️', color: 'bg-amber-50 text-amber-600 border-amber-100',     gradient: 'from-amber-400 to-amber-600'  },
  situation:{ label: 'Situation', emoji: '🌍', color: 'bg-emerald-50 text-emerald-600 border-emerald-100',gradient: 'from-emerald-400 to-emerald-600'},
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  matching: <Lightbulb  size={15} className="text-purple-500" />,
  synonym:  <Lightbulb  size={15} className="text-purple-500" />,
  listening:<Headphones size={15} className="text-blue-500"   />,
  spelling: <PenLine    size={15} className="text-amber-500"  />,
  situation:<Globe      size={15} className="text-emerald-500"/>,
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

// ─── Editable Question Card (wizard review step) ──────────────────────────────
function EditableQuestion({ q, idx, onChange, onDelete, onFetchAudio, onAutoFillAI }: {
  q: ExamQuestion; idx: number;
  onChange: (u: ExamQuestion) => void;
  onDelete: () => void;
  onFetchAudio: (word: string, index: number) => void;
  onAutoFillAI: (word: string, index: number, type: string) => void;
}) {
  const meta = TYPE_META[q.type] ?? { label: q.type, emoji: '❓', color: 'bg-slate-50 text-slate-600 border-slate-100', gradient: 'from-slate-400 to-slate-600' };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
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
              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
              title="Test audio"
            >
              <Volume2 size={13} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete question"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 items-end">
        <div>
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Word</label>
          <input type="text" value={q.word} 
            onChange={e => onChange({ ...q, word: e.target.value })} 
            onBlur={() => { if (q.type === 'listening' && q.word?.trim()) onFetchAudio(q.word, idx); }}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-400" placeholder="e.g. happy" />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Question Type (Skill)</label>
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
          }} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-400 cursor-pointer">
            <option value="listening">🎧 Listening ( Cambridge Pronunciation )</option>
            <option value="synonym">🔗 Synonym ( Word Meaning )</option>
            <option value="spelling">✏️ Spelling ( Written Test )</option>
            <option value="situation">🌍 Situation ( Contextual Clue )</option>
            <option value="matching">🔗 Matching ( Synonym Pairs )</option>
          </select>
        </div>
        <div className="flex gap-2 w-full">
          <button type="button" onClick={() => onAutoFillAI(q.word, idx, q.type)} className="w-full py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-[10px] font-extrabold border border-purple-100 flex items-center justify-center gap-1 whitespace-nowrap" title="Generate context with AI">
            <Sparkles size={11} /> AI Auto-Fill
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Question Text</label>
          <input
            type="text"
            value={q.question_text}
            onChange={e => onChange({ ...q, question_text: e.target.value })}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-400"
          />
        </div>

        {q.type === 'matching' ? (
          <div>
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pairs</label>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 grid grid-cols-2 gap-2 text-xs font-medium text-slate-700">
              {(() => {
                try {
                  const pairs = JSON.parse(q.correct_answer);
                  return Object.entries(pairs).map(([w, s], i) => (
                    <div key={i} className="col-span-2 flex items-center gap-2">
                      <span className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">{w}</span>
                      <span className="text-slate-400">→</span>
                      <span className="flex-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg">{String(s)}</span>
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
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Options (Correct option must match answer precisely)</label>
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
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 focus:border-emerald-400 focus:ring-emerald-100'
                          : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-400 focus:ring-blue-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Correct Answer</label>
              <input
                type="text"
                value={q.correct_answer}
                onChange={e => onChange({ ...q, correct_answer: e.target.value })}
                className="w-full px-3 py-1.5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs font-bold text-emerald-800 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Question View (for test taking) ───────────────────────────────────────────
function QuestionView({ q, answer, onAnswer }: { q: ExamQuestion; answer: string; onAnswer: (val: string) => void }) {
  const isSelected = (opt: string) => answer === opt;
  const [selectedMatchWord, setSelectedMatchWord] = useState<string | null>(null);

  return (
    <div className="space-y-5 py-2">
      {/* Type pill */}
      <div className="flex items-center gap-2">
        <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
          {TYPE_ICON[q.type] ?? <Lightbulb size={16} />}
        </span>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {q.type} Quiz
        </span>
        {q.type === 'listening' && (
          <button
            onClick={() => speak(q.word, q.audio_url)}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 rounded-full text-xs font-bold transition-all animate-bounce"
          >
            <Volume2 size={13} /> Replay Cambridge Audio
          </button>
        )}
      </div>

      {/* Question string */}
      <h3 className="text-base font-black text-slate-800 leading-relaxed">
        {q.question_text}
      </h3>

      {/* Answer Area */}
      {q.type === 'matching' ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase">Words</h4>
            {(() => {
              try {
                const answerMap: Record<string, string> = answer ? JSON.parse(answer) : {};
                const correctMap = JSON.parse(q.correct_answer);
                const words = Object.keys(correctMap);
                return words.map((w, idx) => {
                  const hasMatch = !!answerMap[w];
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedMatchWord(w)}
                      className={`w-full p-3 rounded-xl border-2 text-left text-sm font-bold transition-all flex items-center justify-between ${
                        selectedMatchWord === w
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : hasMatch
                            ? 'border-slate-200 bg-slate-50 text-slate-500'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {w}
                      {hasMatch && <span className="text-[10px] text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 truncate max-w-[100px]">{answerMap[w]}</span>}
                    </button>
                  );
                });
              } catch {
                return null;
              }
            })()}
          </div>
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase">Synonyms</h4>
            {q.options?.map((opt, idx) => {
              try {
                const answerMap: Record<string, string> = answer ? JSON.parse(answer) : {};
                const isMatched = Object.values(answerMap).includes(opt);
                return (
                  <button
                    key={idx}
                    disabled={isMatched}
                    onClick={() => {
                      if (selectedMatchWord) {
                        const newMap = { ...answerMap, [selectedMatchWord]: opt };
                        onAnswer(JSON.stringify(newMap));
                        setSelectedMatchWord(null);
                      }
                    }}
                    className={`w-full p-3 rounded-xl border-2 text-left text-sm font-bold transition-all ${
                      isMatched
                        ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                        : selectedMatchWord
                          ? 'border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 text-purple-700 cursor-pointer animate-pulse'
                          : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {opt}
                  </button>
                );
              } catch {
                return null;
              }
            })}
          </div>
        </div>
      ) : q.options ? (
        <div className="grid grid-cols-1 gap-3">
          {q.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => onAnswer(opt)}
              className={`w-full p-4 rounded-2xl border-2 text-left text-sm font-bold transition-all flex items-center justify-between group ${
                isSelected(opt)
                  ? 'border-blue-500 bg-blue-50/50 text-blue-700 shadow-sm shadow-blue-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{opt}</span>
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                isSelected(opt) ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 text-slate-400'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={answer}
            onChange={e => onAnswer(e.target.value)}
            placeholder="Type your spelling..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg font-bold text-slate-800 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
            autoFocus
          />
          <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
            ⚠️ Double check spelling. Not case-sensitive.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Results Screen ────────────────────────────────────────────────────────────
function ResultsScreen({ result, onClose, onRetry, mode }: { result: ExamAttempt; onClose: () => void; onRetry: () => void; mode?: 'take' | 'review' }) {
  const scorePercent = result.percentage;
  const isPass = scorePercent >= 50;

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-6 py-6 min-h-0 w-full">
      {/* Compact Score Header Banner */}
      <div className={`w-full flex items-center justify-between gap-4 p-4 rounded-2xl border mb-6 shadow-sm flex-shrink-0 ${
        isPass ? 'bg-emerald-50/40 border-emerald-100/80 animate-in fade-in slide-in-from-top-4 duration-300' : 'bg-rose-50/40 border-rose-100/80 animate-in fade-in slide-in-from-top-4 duration-300'
      }`}>
        <div className="flex items-center gap-3">
          {/* Trophy & Badge */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 shadow-sm ${
            isPass ? 'bg-emerald-50 border-emerald-100 text-emerald-500 shadow-emerald-100' : 'bg-rose-50 border-rose-100 text-rose-500 shadow-rose-100'
          }`}>
            {isPass ? <Trophy size={22} className="animate-wiggle" /> : <XCircle size={22} />}
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900">
              {isPass ? 'Congratulations!' : 'Keep Practicing!'}
            </h3>
            <p className="text-[11px] text-slate-500 font-bold mt-0.5">
              You scored <span className={isPass ? 'text-emerald-600' : 'text-rose-600'}>{result.score}</span> out of <strong>{result.total}</strong> questions ({scorePercent}%)
            </p>
          </div>
        </div>

        {/* Score progress bar */}
        <div className="flex-1 max-w-[200px] min-w-[80px] bg-slate-200/60 h-2.5 rounded-full overflow-hidden border border-slate-300/30">
          <div className={`h-full rounded-full transition-all duration-1000 ${
            isPass ? 'bg-emerald-500' : 'bg-rose-500'
          }`} style={{ width: `${scorePercent}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 w-full mb-6">
        <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 mb-3 flex-shrink-0">Review Questions</h4>
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
          {result.gradedQuestions.map((q, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${q.isCorrect ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'} transition-all hover:shadow-sm`}>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                     <span className="text-[10px] font-black text-slate-400">#{idx + 1}</span>
                     <span className="font-extrabold text-slate-800 text-xs truncate">{q.word}</span>
                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${TYPE_META[q.type]?.color ?? 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                       {TYPE_META[q.type]?.label ?? q.type}
                     </span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0 ${
                    q.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                
                <p className="text-xs font-bold text-slate-800 leading-relaxed">&quot;{q.question_text}&quot;</p>
                
                {q.type === 'matching' ? (
                  <div className="space-y-1.5 bg-white border border-slate-100 rounded-xl p-3 shadow-sm w-full">
                    {(() => {
                      try {
                        const correctObj = JSON.parse(q.correctAnswer) as Record<string, string>;
                        const studentObj = q.studentAnswer ? (JSON.parse(q.studentAnswer) as Record<string, string>) : {};
                        return Object.entries(correctObj).map(([word, correctSyn], wIdx) => {
                          const studentSyn = studentObj[word] || '(blank)';
                          const isPairCorrect = studentSyn === correctSyn;
                          return (
                            <div key={wIdx} className="text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                              <span className="font-semibold text-slate-700">{word} →</span>
                              <div className="flex flex-col gap-0.5">
                                {isPairCorrect ? (
                                  <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded text-[9px] self-start sm:self-end">
                                    ✓ Student Answer: {studentSyn}
                                  </span>
                                ) : (
                                  <div className="space-y-0.5">
                                    <span className="text-rose-500 font-bold bg-rose-50 border border-rose-100/60 px-2 py-0.5 rounded block text-[9px] text-left sm:text-right">
                                      ✗ Student Answer: {studentSyn}
                                    </span>
                                    <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded block text-[9px] text-left sm:text-right">
                                      ✓ Correct Answer: {correctSyn}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      } catch {
                        return <span className="text-rose-500 text-[10px]">Invalid matching pairs</span>;
                      }
                    })()}
                  </div>
                ) : (
                  <div className="space-y-1.5 mt-1 text-xs w-full">
                    {q.isCorrect ? (
                      <p className="text-emerald-700 font-bold bg-emerald-50/80 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-emerald-100/60 w-full">
                        <span>✓ Your Answer:</span> 
                        <strong>{q.studentAnswer}</strong>
                      </p>
                    ) : (
                      <div className="bg-white border border-slate-100 p-3 rounded-xl space-y-1.5 shadow-sm w-full">
                        <p className="text-rose-600 font-bold flex items-center gap-1.5">
                          <span>✗ Your Answer:</span> 
                          <strong className="line-through">{q.studentAnswer || '(blank)'}</strong>
                        </p>
                        <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <span>✓ Correct Answer:</span> 
                          <strong>{q.correctAnswer}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full flex-shrink-0 mt-auto pt-3 border-t border-slate-100 bg-white">
        {mode !== 'review' && (
          <button onClick={onRetry}
            className="flex-1 py-3 border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5">
            <RotateCcw size={15} /> Retry
          </button>
        )}
        <button onClick={onClose}
          className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-100 transition-colors flex items-center justify-center">
          Done
        </button>
      </div>
    </div>
  );
}

// ─── Exam Taker Modal ─────────────────────────────────────────────────────────
function ExamTakerModal({ exam, onClose, mode = 'take' }: { exam: Exam; onClose: () => void; mode?: 'take' | 'review' }) {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamAttempt | null>(null);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examsService.getExamById(exam.id);
      const data = ((res as unknown) as { data?: Exam }).data ?? (res as Exam);
      const qList = [...(data?.questions ?? [])];
      
      if (mode === 'review') {
        const attemptsRes = await examsService.getAttempts(exam.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const attempts = (attemptsRes as any).data ?? attemptsRes;
        
        if (attempts && attempts.length > 0) {
          const attempt = attempts[0];
          let parsedAnswers: Record<string, string> = {};
          try {
            parsedAnswers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers;
          } catch {}
          
          let score = 0;
          const gradedQuestions = qList.map(q => {
            const studentAnswer = (parsedAnswers[q.id || ''] || '').trim();
            const correctAnswer = (q.correct_answer || '').trim();
            let isCorrect = false;

            if (q.type === 'spelling') {
              isCorrect = studentAnswer.toLowerCase() === correctAnswer.toLowerCase();
            } else if (q.type === 'matching') {
              try {
                const studentObj = JSON.parse(studentAnswer) as Record<string, string>;
                const correctObj = JSON.parse(correctAnswer) as Record<string, string>;
                isCorrect =
                  Object.keys(correctObj).every((k) => studentObj[k] === correctObj[k]) &&
                  Object.keys(studentObj).length === Object.keys(correctObj).length;
              } catch {
                isCorrect = false;
              }
            } else {
              isCorrect = studentAnswer === correctAnswer;
            }

            if (isCorrect) score++;

            return {
              questionId: q.id || '',
              word: q.word,
              type: q.type,
              question_text: q.question_text,
              studentAnswer,
              correctAnswer,
              isCorrect,
            };
          });

          setResult({
            attemptId: attempt.id,
            score,
            total: qList.length,
            percentage: Math.round((score / qList.length) * 100),
            gradedQuestions,
          });
        }
      } else {
        for (let i = qList.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [qList[i], qList[j]] = [qList[j], qList[i]];
        }
      }
      setQuestions(qList);
    } catch {
      toast.error('Failed to load exam questions');
    }
    setLoading(false);
  }, [exam.id, mode]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        loadQuestions();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [loadQuestions]);

  const currentQ = questions[currentIdx];
  const progress = questions.length > 0 ? (currentIdx / questions.length) * 100 : 0;

  useEffect(() => {
    if (currentQ?.type === 'listening') {
      const t = setTimeout(() => speak(currentQ.word, currentQ.audio_url), 400);
      return () => clearTimeout(t);
    }
  }, [currentQ]);

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(c => c + 1);
      const next = questions[currentIdx + 1];
      if (next?.type === 'listening') setTimeout(() => speak(next.word, next.audio_url), 300);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const ans: Record<string, string> = {};
      questions.forEach(q => { if (q.id) ans[q.id] = answers[q.id] ?? ''; });
      const res = await examsService.submitAttempt(exam.id, ans);
      const data = ((res as unknown) as { data?: ExamAttempt }).data ?? (res as ExamAttempt);
      setResult(data);
      toast.success('Exam submitted successfully!');
    } catch (e: unknown) {
      const errMessage = e instanceof Error ? e.message : String(e);
      toast.error(errMessage || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const isLast = currentIdx === questions.length - 1;
  const allAnswered = questions.length > 0 && questions.every(q => q.id && answers[q.id]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${result ? 'max-w-3xl' : 'max-w-xl'} max-h-[92vh] flex flex-col overflow-hidden relative transition-all duration-300`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="font-black text-slate-900 text-lg truncate">{exam.title}</h2>
            {!result && !loading && <p className="text-xs text-slate-500 font-semibold mt-0.5">Question {currentIdx + 1} of {questions.length}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {!result && !loading && (
          <div className="h-1.5 bg-slate-100">
            <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={32} />
                <p className="text-sm font-semibold text-slate-500">Loading questions...</p>
              </div>
            </div>
          ) : result ? (
            <ResultsScreen result={result} onClose={onClose} onRetry={() => { setResult(null); setAnswers({}); setCurrentIdx(0); loadQuestions(); }} mode={mode} />
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {currentQ && <QuestionView q={currentQ} answer={currentQ.id ? (answers[currentQ.id] ?? '') : ''} onAnswer={val => { if (currentQ.id) setAnswers(p => ({ ...p, [currentQ.id!]: val })); }} />}
            </div>
          )}
        </div>

        {!result && !loading && questions.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 rounded-b-3xl">
            <div className="flex items-center gap-1 flex-wrap max-w-[160px]">
              {questions.map((q, i) => (
                <button key={i} onClick={() => setCurrentIdx(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIdx ? 'bg-blue-500 scale-125' : q.id && answers[q.id] ? 'bg-emerald-400' : 'bg-slate-300 hover:bg-slate-400'}`} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => currentIdx > 0 && setCurrentIdx(c => c - 1)} disabled={currentIdx === 0}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={18} />
              </button>
              {isLast ? (
                <button onClick={handleSubmit} disabled={submitting || !allAnswered}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200">
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Trophy size={15} />}
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              ) : (
                <button onClick={handleNext}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-100">
                  Next <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Exam Editor Modal ────────────────────────────────────────────────────────
interface ExamEditorModalProps {
  exam: Exam;
  onClose: () => void;
  onSaved: () => void;
}

function ExamEditorModal({ exam, onClose, onSaved }: ExamEditorModalProps) {
  const [title, setTitle] = useState(exam.title);
  const [description, setDescription] = useState(exam.description || '');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // AI Vocabulary addition states
  const [showAddWordsDialog, setShowAddWordsDialog] = useState(false);
  const [newWordsInput, setNewWordsInput] = useState('');
  const [addingWords, setAddingWords] = useState(false);

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

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await examsService.getExamById(exam.id);
      const data = ((res as unknown) as { data?: Exam }).data ?? (res as Exam);
      setQuestions(data?.questions ?? []);
    } catch {
      toast.error('Failed to load exam questions');
    } finally {
      setLoading(false);
    }
  }, [exam.id]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        loadQuestions();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [loadQuestions]);

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


  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter an exam title');
      return;
    }
    if (!questions.length) {
      toast.error('Exam must have at least one question');
      return;
    }
    setSaving(true);
    try {
      await examsService.updateExam(exam.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        questions,
      });
      toast.success('Exam updated successfully! 🎉');
      onSaved();
      onClose();
    } catch (e: unknown) {
      const errMessage = e instanceof Error ? e.message : String(e);
      toast.error(errMessage || 'Failed to update exam');
    } finally {
      setSaving(false);
    }
  };

  const listeningCount = questions.filter(q => q.type === 'listening').length;
  const cambridgeCount = questions.filter(q => q.type === 'listening' && q.audio_url).length;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-3xl text-white">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2"><Sparkles size={20} /> Edit & Manage Exam</h2>
            <p className="text-blue-100 text-xs mt-0.5">Modify exam questions, add skills, or update pronunciation audio on the fly.</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8 min-h-0">
          {/* LEFT: Settings Form */}
          <div className="w-full lg:w-[40%] flex-shrink-0 space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">Exam Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Unit 2 Adjectives Quiz"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-600 mb-1">Description (Optional)</label>
              <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Synonyms, listening, situational context"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs font-medium text-slate-500 space-y-2 leading-relaxed">
              <h4 className="font-extrabold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">Teacher Quick Guide</h4>
              <p>✏️ <strong>Target Word</strong>: Input the English word. Changing it won&apos;t affect options unless you update them.</p>
              <p>🎧 <strong>Listening Skill</strong>: Click <em>Fetch Audio</em> to dynamically pull premium speech patterns from Cambridge Dictionary.</p>
              <p>🔗 <strong>Matching Type</strong>: Specify matching synonym pairs in valid JSON, e.g. <code>{"{\"happy\":\"joyful\"}"}</code>.</p>
            </div>
          </div>

          {/* RIGHT: Questions Editor */}
          <div className="w-full lg:w-[60%] border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8 space-y-5 flex flex-col min-h-0">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={32} />
                  <p className="text-sm font-semibold text-slate-500">Loading questions...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between flex-shrink-0">
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-sm">{questions.length} Total Questions</h3>
                    {listeningCount > 0 && (
                      <p className={`text-[11px] mt-0.5 font-bold ${cambridgeCount === listeningCount ? 'text-emerald-600' : 'text-amber-600'}`}>
                        🎧 {cambridgeCount}/{listeningCount} listening questions have premium Cambridge audio
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
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 flex flex-wrap items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Vocab list:</span>
                  {Array.from(
                    new Set(
                      questions
                        .map(q => q.word)
                        .flatMap(w => w.split(',').map(s => s.trim()))
                        .filter(Boolean)
                    )
                  ).map((word, wIdx) => (
                    <span key={wIdx} className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:border-blue-400 hover:text-blue-500 transition-all select-none">
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
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || loading || !questions.length}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving changes...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Add Vocabulary via AI Modal Overlay */}
      {showAddWordsDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col p-6 space-y-4 animate-in scale-in duration-200 text-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
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
                  setShowAddWordsDialog(false);
                  setNewWordsInput('');
                  toast.success('Added new empty question!');
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

// ─── Main ExamsPage Component ───────────────────────────────────────────────────
export default function ExamsPage() {
  const searchParams = useSearchParams();
  const filterGroupId = searchParams ? searchParams.get('groupId') : null;
  const autoCreate = searchParams ? searchParams.get('create') === 'true' : false;

  const [exams, setExams] = useState<Exam[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState(filterGroupId || '');

  // Wizard state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [wizardGroupId, setWizardGroupId] = useState(filterGroupId || '');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [saving, setSaving] = useState(false);

  // Wizard AI Vocabulary addition states
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

  // Active exam / Deleting state
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const profile = await getProfile();
      const user = profile.data || profile;
      setRole(user.role || 'student');

      // Load user classes/groups
      const groupRes = await groupsService.getGroups();
      const groupData = groupRes.data || groupRes || [];
      setGroups(groupData as Group[]);

      // Fetch exams general
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
      // Fallback questions
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
      await examsService.createExam({
        groupId: wizardGroupId,
        title: examTitle.trim(),
        description: examDesc.trim() || undefined,
        questions
      });
      toast.success('Exam published successfully!');
      resetWizard();
      loadData();
    } catch (e: unknown) {
      const errMessage = e instanceof Error ? e.message : String(e);
      toast.error(errMessage || 'Failed to publish exam');
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

  const handleWizardAutoFillAI = async (word: string, index: number, type: string) => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newQs: ExamQuestion[] = Array.isArray(res) ? (res as ExamQuestion[]) : (((res as any).data ?? []) as ExamQuestion[]);
      if (newQs && newQs.length > 0) {
        setQuestions(prev => mergeQuestions(prev, newQs));
        toast.success(`Generated questions for ${newWords.length} new word(s) successfully!`, { id: toastId });
        setWizardShowAddWords(false);
        setWizardNewWords('');
      } else {
        toast.error('Failed to generate questions. No questions returned from AI.', { id: toastId });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to generate questions with AI.', { id: toastId });
    } finally {
      setWizardAddingWords(false);
    }
  };


  const resetWizard = () => {
    setIsCreateOpen(false);
    setStep('input');
    setExamTitle('');
    setExamDesc('');
    setWordInput('');
    setQuestions([]);
    setWizardShowAddWords(false);
    setWizardNewWords('');
    setWizardAddingWords(false);
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

  // Filter exams based on Search & Class filter
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
    <DashboardLayout>
      {/* ─── Header: Library Info & Title ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-blue-500" />
            Exam Library
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Challenge your skills and master correct spelling and pronunciation.</p>
        </div>
        
        {role === 'teacher' && (
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="px-5 py-3 md:py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-200 flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> Create Exam
          </button>
        )}
      </div>

      {/* ─── Filters & Search ─── */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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

      {/* ─── Exams List Grid ─── */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm max-w-lg mx-auto">
          <FileText className="mx-auto text-slate-300 mb-4 animate-pulse" size={48} />
          <h3 className="text-xl font-bold text-slate-900 mb-2">No exams found</h3>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const group = groups.find(g => g.id === exam.group_id);
            const groupName = group ? group.title : 'General';
            const attempts = exam.attempt_count ?? 0;
            const maxScore = exam.max_score ?? null;

            return (
              <div key={exam.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <div className="p-6 border-b border-slate-100 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider inline-block">
                      {groupName}
                    </div>
                    {role === 'teacher' && (
                      <button 
                        onClick={() => setDeletingExamId(exam.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                        title="Delete Exam"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{exam.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 min-h-[2.5rem] mb-4 font-medium leading-relaxed">
                    {exam.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
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

                {/* Card footer CTAs */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      if (role === 'teacher') {
                        setEditingExam(exam);
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
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Create Exam Wizard Modal (Full Page Overlay) ─── */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-3xl text-white">
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

            {/* Stepper progress indicator */}
            <div className="flex border-b border-slate-100 px-6 pt-3 pb-0 gap-6">
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

            {/* Wizard Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {step === 'input' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-600 mb-1">Assigned Class *</label>
                      <div className="relative">
                        <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <select 
                          value={wizardGroupId} 
                          onChange={e => setWizardGroupId(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select a class...</option>
                          {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-600 mb-1">Exam Title *</label>
                      <input 
                        type="text" 
                        value={examTitle} 
                        onChange={e => setExamTitle(e.target.value)}
                        placeholder="e.g. Unit 2 Adjectives Quiz"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-600 mb-1">Description (Optional)</label>
                    <input 
                      type="text" 
                      value={examDesc} 
                      onChange={e => setExamDesc(e.target.value)}
                      placeholder="e.g. Synonyms, listening, situational context"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" 
                    />
                  </div>

                  <div className="border-t border-slate-100 pt-4">
                    <label className="block text-xs font-black text-slate-600 mb-1.5">Enter Word List *</label>
                    <textarea 
                      rows={6} 
                      value={wordInput} 
                      onChange={e => setWordInput(e.target.value)}
                      placeholder={`Enter vocabulary words separated by commas or new lines:\ne.g. happy, excited, intelligent, generous`}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" 
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
                      <h3 className="font-extrabold text-slate-800 text-sm">{questions.length} Questions Generated</h3>
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
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors border border-slate-200"
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

                  {/* Unique Vocabulary List Chip Container */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5 flex flex-wrap items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Vocab list:</span>
                    {Array.from(
                      new Set(
                        questions
                          .map(q => q.word)
                          .flatMap(w => w.split(',').map(s => s.trim()))
                          .filter(Boolean)
                      )
                    ).map((word, wIdx) => (
                      <span key={wIdx} className="text-xs font-bold px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-xl shadow-sm hover:border-blue-400 hover:text-blue-500 transition-all select-none">
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

            {/* Wizard Footer */}
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

      {/* ─── Active Exam Taker Modal ─── */}
      {activeExam && (
        <ExamTakerModal 
          exam={activeExam} 
          onClose={() => { 
            setActiveExam(null); 
            loadData(); 
          }} 
          mode={takerMode}
        />
      )}

      {/* ─── Active Exam Editor Modal ─── */}
      {editingExam && (
        <ExamEditorModal
          exam={editingExam}
          onClose={() => setEditingExam(null)}
          onSaved={loadData}
        />
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deletingExamId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-md font-extrabold text-slate-900 mb-1.5">Delete Exam?</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6 leading-relaxed">
              This will permanently delete this exam and all of its student attempts. This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeletingExamId(null)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
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
          </div>
        </div>
      )}

      {/* Inline Wizard Add Vocabulary via AI Modal Overlay */}
      {wizardShowAddWords && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col p-6 space-y-4 animate-in scale-in duration-200 text-slate-800">
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
    </DashboardLayout>
  );
}
