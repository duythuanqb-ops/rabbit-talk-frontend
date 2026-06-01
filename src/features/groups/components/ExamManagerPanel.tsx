'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText, Plus, Loader2, Trash2, Sparkles,
  RefreshCw, Save, X, Volume2, CheckCircle, ChevronRight,
  ChevronLeft, Trophy, RotateCcw, Headphones, PenLine,
  Lightbulb, Globe, XCircle
} from 'lucide-react';
import { examsService, Exam, ExamQuestion, ExamAttempt } from '../services/exams.service';
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
    // Final fallback: Web Speech API (with delay to avoid Chrome cancel+speak bug)
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

// ─── Question view during exam ────────────────────────────────────────────────
function QuestionView({ q, answer, onAnswer }: { q: ExamQuestion; answer: string; onAnswer: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedMatchWord, setSelectedMatchWord] = useState<string | null>(null);

  useEffect(() => {
    if (q.type === 'spelling' && inputRef.current) inputRef.current.focus();
  }, [q]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q.options) setShuffledOptions([...q.options].sort(() => Math.random() - 0.5));
  }, [q.id, q.options]);

  const gradient = TYPE_META[q.type]?.gradient ?? 'from-slate-400 to-slate-600';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
          {TYPE_ICON[q.type]}
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{TYPE_META[q.type]?.label ?? q.type}</span>
      </div>

      <div className={`p-5 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
        {q.type === 'listening' ? (
          <div className="flex flex-col items-center gap-4 py-2">
            <p className="text-sm font-semibold text-white/80">{q.question_text}</p>
            <button onClick={() => speak(q.word, q.audio_url)}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold rounded-2xl text-sm transition-all hover:scale-105 active:scale-95 border border-white/30 shadow-lg">
              <Volume2 size={20} className="animate-pulse" /> Play Pronunciation
            </button>
          </div>
        ) : (
          <p className="text-lg font-bold leading-relaxed">{q.question_text}</p>
        )}
      </div>

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
      ) : q.type === 'spelling' ? (
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type the correct spelling:</label>
          <input ref={inputRef} type="text" value={answer} onChange={e => onAnswer(e.target.value)}
            placeholder="Type your spelling..." autoComplete="off" autoCorrect="off" spellCheck={false}
            className="w-full px-5 py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg font-bold text-slate-800 text-center focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
          <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1 mt-2">
            ⚠️ Not case-sensitive.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Choose the correct answer:</label>
          {(shuffledOptions.length ? shuffledOptions : q.options ?? []).map((opt, i) => (
            <button key={i} onClick={() => onAnswer(opt)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all font-semibold text-sm group ${
                answer === opt
                  ? `border-transparent bg-gradient-to-r ${gradient} text-white shadow-lg scale-[1.01]`
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}>
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${answer === opt ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {answer === opt && <CheckCircle size={16} className="text-white/80 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({ result, onClose, onRetry }: { result: ExamAttempt; onClose: () => void; onRetry: () => void }) {
  const pct = result.percentage;
  const grade = pct >= 90 ? 'Excellent! 🏆' : pct >= 70 ? 'Good Job! 🌟' : pct >= 50 ? 'Keep Practicing! 💪' : 'Try Again! 📚';
  const ringColor = pct >= 90 ? 'text-emerald-500' : pct >= 70 ? 'text-orange-500' : pct >= 50 ? 'text-amber-500' : 'text-rose-500';
  const circumference = 2 * Math.PI * 45;

  return (
    <div className="flex flex-col h-full">
      {/* Compact Score Header Banner */}
      <div className="w-full flex items-center justify-between gap-4 p-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={circumference - (pct / 100) * circumference}
                strokeLinecap="round" className={`${ringColor} transition-all duration-1000`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-slate-900">{pct}%</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">{grade}</p>
            <p className="text-xs text-slate-500 font-bold mt-0.5">{result.score} / {result.total} correct</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Answer Breakdown</h3>
        {result.gradedQuestions.map((gq, idx) => (
          <div key={idx} className={`rounded-xl border p-4 flex items-start gap-3.5 transition-all hover:shadow-sm ${gq.isCorrect ? 'border-emerald-100 bg-emerald-50/40' : 'border-rose-100 bg-rose-50/40'}`}>
            {gq.isCorrect ? (
              <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                <span className="font-bold text-slate-800 text-sm truncate">{gq.word}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${TYPE_META[gq.type]?.color ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>{TYPE_META[gq.type]?.label ?? gq.type}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 mb-2.5 font-medium italic leading-relaxed">
                &quot;{gq.question_text}&quot;
              </p>
              
              {gq.type === 'matching' ? (
                <div className="space-y-1.5 bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                  {(() => {
                    try {
                      const correctObj = JSON.parse(gq.correctAnswer) as Record<string, string>;
                      const studentObj = gq.studentAnswer ? (JSON.parse(gq.studentAnswer) as Record<string, string>) : {};
                      return Object.entries(correctObj).map(([word, correctSyn], wIdx) => {
                        const studentSyn = studentObj[word] || '(blank)';
                        const isPairCorrect = studentSyn === correctSyn;
                        return (
                          <div key={wIdx} className="text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                            <span className="font-semibold text-slate-700">{word} →</span>
                            <div className="flex flex-col gap-0.5">
                              {isPairCorrect ? (
                                <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded text-[10px] self-start sm:self-end">
                                  ✓ Student Answer: {studentSyn}
                                </span>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="text-rose-500 font-bold bg-rose-50 border border-rose-100/60 px-2 py-0.5 rounded block text-[10px] text-left sm:text-right">
                                    ✗ Student Answer: {studentSyn}
                                  </span>
                                  <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/60 px-2 py-0.5 rounded block text-[10px] text-left sm:text-right">
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
                <div className="space-y-1.5 mt-1 text-xs">
                  {gq.isCorrect ? (
                    <p className="text-emerald-700 font-bold bg-emerald-50/80 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-emerald-100/60">
                      <span>✓ Your Answer:</span> 
                      <strong>{gq.studentAnswer}</strong>
                    </p>
                  ) : (
                    <div className="bg-white border border-slate-100 p-3 rounded-xl space-y-1.5 shadow-sm">
                      <p className="text-rose-600 font-bold flex items-center gap-1.5">
                        <span>✗ Your Answer:</span> 
                        <strong className="line-through">{gq.studentAnswer || '(blank)'}</strong>
                      </p>
                      <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <span>✓ Correct Answer:</span> 
                        <strong>{gq.correctAnswer}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
        <button onClick={onRetry} className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors">
          <RotateCcw size={15} /> Try Again
        </button>
        <button onClick={onClose} className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-sm transition-colors shadow-lg shadow-emerald-200">
          <Trophy size={15} /> Done
        </button>
      </div>
    </div>
  );
}

// ─── Exam Taker Modal ─────────────────────────────────────────────────────────
function ExamTakerModal({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ExamAttempt | null>(null);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res: unknown = await examsService.getExamById(exam.id);
      const data = (res as { data?: Exam }).data ?? (res as Exam);
      const qList = [...(data?.questions ?? [])];
      for (let i = qList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [qList[i], qList[j]] = [qList[j], qList[i]];
      }
      setQuestions(qList);
    } catch {
      toast.error('Failed to load exam questions');
    } finally {
      setLoading(false);
    }
  }, [exam.id]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadQuestions(); }, [loadQuestions]);

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
      const res: unknown = await examsService.submitAttempt(exam.id, ans);
      setResult((res as { data?: ExamAttempt }).data ?? (res as ExamAttempt));
    } catch (e) {
      const err = e as Error;
      toast.error(err?.message ?? 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const isLast = currentIdx === questions.length - 1;
  const allAnswered = questions.length > 0 && questions.every(q => q.id && answers[q.id]);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`bg-white rounded-3xl shadow-2xl w-full ${result ? 'max-w-3xl' : 'max-w-xl'} max-h-[92vh] flex flex-col overflow-hidden transition-all duration-300`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="font-black text-slate-900 text-lg truncate">{exam.title}</h2>
            {!result && !loading && <p className="text-xs text-slate-500 font-semibold mt-0.5">Question {currentIdx + 1} of {questions.length}</p>}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
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
            <ResultsScreen result={result} onClose={onClose} onRetry={() => { setResult(null); setAnswers({}); setCurrentIdx(0); loadQuestions(); }} />
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

// ─── Main ExamManagerPanel ────────────────────────────────────────────────────
interface Props {
  groupId: string;
}

export function ExamManagerPanel({ groupId }: Props) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [showExamList, setShowExamList] = useState(false);

  // Wizard state
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [wordInput, setWordInput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Wizard AI Vocabulary addition states
  const [wizardShowAddWords, setWizardShowAddWords] = useState(false);
  const [wizardNewWords, setWizardNewWords] = useState('');
  const [wizardAddingWords, setWizardAddingWords] = useState(false);

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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadExams(); }, [loadExams]);



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
    if (!examTitle.trim()) { toast.error('Please enter an exam title'); return; }
    if (!questions.length) { toast.error('No questions to save'); return; }
    setSaving(true);
    try {
      await examsService.createExam({ groupId, title: examTitle.trim(), description: examDesc.trim() || undefined, questions });
      toast.success('Exam published! 🎉');
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
    setStep('input');
    setWordInput('');
    setExamTitle('');
    setExamDesc('');
    setQuestions([]);
    setWizardShowAddWords(false);
    setWizardNewWords('');
    setWizardAddingWords(false);
  };

  const listeningCount = questions.filter(q => q.type === 'listening').length;
  const cambridgeCount = questions.filter(q => q.type === 'listening' && q.audio_url).length;

  return (
    <div className="flex flex-col h-full">
      {/* ── Header: title only (no button) ── */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <FileText className="text-blue-500" size={18} /> Exams
        </h4>
      </div>

      {/* ── Description ── */}
      <p className="text-sm text-slate-500 mb-6">
        Create AI-powered vocabulary exams for your students with Cambridge-quality audio for listening questions.
      </p>

      {/* ── Exam list (shown when toggled) ── */}
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
                <button onClick={() => setEditingExam(exam)}
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

      {/* ── Action buttons (always at bottom, like Vocabulary Sets) ── */}
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

      {/* ─── Create Wizard Modal ─── */}
      {showWizard && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

            {/* Wizard header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-3xl">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Sparkles size={20} /> Create AI Exam
                </h2>
                <p className="text-blue-100 text-xs mt-0.5">
                  {step === 'input' ? 'Step 1: Enter words' : 'Step 2: Review questions'}
                </p>
              </div>
              <button onClick={resetWizard} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Step tabs */}
            <div className="flex border-b border-slate-100 px-6 pt-3 pb-0 gap-6">
              {(['input', 'review'] as const).map((s, i) => (
                <button key={s} onClick={() => step === 'review' && s === 'input' && setStep('input')}
                  className={`pb-3 text-xs font-bold border-b-2 transition-colors ${step === s ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400'}`}>
                  {i + 1}. {s === 'input' ? 'Enter Words' : 'Review Questions'}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {step === 'input' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Exam Title *</label>
                    <input type="text" value={examTitle} onChange={e => setExamTitle(e.target.value)}
                      placeholder="e.g. Unit 5 Vocabulary Quiz"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Description (optional)</label>
                    <input type="text" value={examDesc} onChange={e => setExamDesc(e.target.value)}
                      placeholder="e.g. Covers Unit 5 adjectives"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Enter Words *</label>
                    <textarea rows={6} value={wordInput} onChange={e => setWordInput(e.target.value)}
                      placeholder={`Enter words separated by commas or new lines:\nhappy, hungry, tired\ngenius\nattack`}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 resize-none focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                    <p className="text-[11px] text-slate-400 mt-1.5">
                      🎧 Listening questions will use <strong>Cambridge Dictionary</strong> audio (not AI voice).
                    </p>
                  </div>
                </>
              )}

              {step === 'review' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">{questions.length} Questions Generated</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {listeningCount > 0 && (
                          <span className={cambridgeCount === listeningCount ? 'text-emerald-600' : 'text-amber-600'}>
                            🎧 {cambridgeCount}/{listeningCount} listening questions have Cambridge audio
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setStep('input')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                        <RefreshCw size={13} /> Regenerate
                      </button>
                      <button type="button" onClick={() => setWizardShowAddWords(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-colors shadow-sm">
                        <Plus size={13} /> Add Question
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Object.entries(TYPE_META).map(([type, meta]) => {
                      const cnt = questions.filter(q => q.type === type).length;
                      if (!cnt) return null;
                      return (
                        <span key={type} className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${meta.color}`}>
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
                      <EditableQuestion key={idx} q={q} idx={idx}
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

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button onClick={resetWizard} className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                Cancel
              </button>
              {step === 'input' ? (
                <button onClick={handleGenerate} disabled={generating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-blue-200">
                  {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {generating ? 'Generating + Fetching Cambridge Audio...' : 'Generate Questions'}
                </button>
              ) : (
                <button onClick={handleSave} disabled={saving || !questions.length}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-200">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'Publishing...' : 'Publish Exam'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Exam Taker Modal ─── */}
      {activeExam && <ExamTakerModal exam={activeExam} onClose={() => { setActiveExam(null); loadExams(); }} />}

      {/* ─── Exam Editor Modal ─── */}
      {editingExam && (
        <ExamEditorModal
          exam={editingExam}
          onClose={() => setEditingExam(null)}
          onSaved={loadExams}
        />
      )}

      {/* ─── Delete confirm ─── */}
      {deletingId && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-black text-slate-900 mb-2">Delete Exam?</h3>
            <p className="text-sm text-slate-500 mb-6">This action cannot be undone. All student attempts will also be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-sm transition-colors shadow-md shadow-rose-200">Delete</button>
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
    </div>
  );
}
