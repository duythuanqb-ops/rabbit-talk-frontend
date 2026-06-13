'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, Trophy, RotateCcw, Headphones, PenLine,
  Lightbulb, Globe, XCircle, ChevronRight, ChevronLeft, X, Volume2
} from 'lucide-react';
import { examsService, Exam, ExamQuestion, ExamAttempt } from '@/features/groups/services/exams.service';
import toast from 'react-hot-toast';

function buildGoogleTtsProxyUrl(text: string): string {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';
  const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
  return `${apiBase}/proxy-audio?url=${encodeURIComponent(ttsUrl)}`;
}

export function speak(text: string, audioUrl?: string | null) {
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


export const TYPE_META: Record<string, { label: string; emoji: string; color: string; gradient: string }> = {
  matching: { label: 'Matching',  emoji: '🔗', color: 'bg-purple-50 text-purple-600 border-purple-100',  gradient: 'from-purple-400 to-purple-600' },
  synonym:  { label: 'Synonym',   emoji: '🔗', color: 'bg-purple-50 text-purple-600 border-purple-100',  gradient: 'from-purple-400 to-purple-600' },
  listening:{ label: 'Listening', emoji: '🎧', color: 'bg-blue-50 text-blue-600 border-blue-100',        gradient: 'from-blue-400 to-blue-600'    },
  spelling: { label: 'Spelling',  emoji: '✏️', color: 'bg-amber-50 text-amber-600 border-amber-100',     gradient: 'from-amber-400 to-amber-600'  },
  situation:{ label: 'Situation', emoji: '🌍', color: 'bg-emerald-50 text-emerald-600 border-emerald-100',gradient: 'from-emerald-400 to-emerald-600'},
};

export const TYPE_ICON: Record<string, React.ReactNode> = {
  matching: <Lightbulb  size={15} className="text-purple-500" />,
  synonym:  <Lightbulb  size={15} className="text-purple-500" />,
  listening:<Headphones size={15} className="text-blue-500"   />,
  spelling: <PenLine    size={15} className="text-amber-500"  />,
  situation:<Globe      size={15} className="text-emerald-500"/>,
};

export const mergeQuestions = (existingList: ExamQuestion[], generatedList: ExamQuestion[]): ExamQuestion[] => {
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


function QuestionView({ q, answer, onAnswer }: { q: ExamQuestion; answer: string; onAnswer: (val: string) => void }) {
  const isSelected = (opt: string) => answer === opt;
  const [selectedMatchWord, setSelectedMatchWord] = useState<string | null>(null);

  return (
    <div className="space-y-5 py-2">
      {}
      <div className="flex items-center gap-2">
        <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-blue-800">
          {TYPE_ICON[q.type] ?? <Lightbulb size={16} />}
        </span>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {q.type} Quiz
        </span>
        {q.type === 'listening' && (
          <button
            onClick={() => speak(q.word, q.audio_url)}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full text-xs font-bold transition-all animate-bounce"
          >
            <Volume2 size={13} /> Replay Cambridge Audio
          </button>
        )}
      </div>

      {}
      <h3 className="text-base font-black text-slate-800 dark:text-slate-200 leading-relaxed">
        {q.question_text}
      </h3>

      {}
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
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : hasMatch
                            ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {w}
                      {hasMatch && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50 truncate max-w-[100px]">{answerMap[w]}</span>}
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
                        ? 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        : selectedMatchWord
                          ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:border-purple-400 dark:hover:border-purple-500 text-purple-700 dark:text-purple-400 cursor-pointer animate-pulse'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
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
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm shadow-blue-100 dark:shadow-none'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-900/50'
              }`}
            >
              <span>{opt}</span>
              <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                isSelected(opt) ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500'
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
            className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-bold text-slate-800 dark:text-slate-200 text-center focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
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


function ResultsScreen({ result, onClose, onRetry, mode }: { result: ExamAttempt; onClose: () => void; onRetry: () => void; mode?: 'take' | 'review' }) {
  const scorePercent = result.percentage;
  const isPass = scorePercent >= 50;

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-6 py-6 min-h-0 w-full">
      {}
      <div className={`w-full flex items-center justify-between gap-4 p-4 rounded-2xl border mb-6 shadow-sm flex-shrink-0 ${
        isPass ? 'bg-emerald-50/40 dark:bg-emerald-900/20 border-emerald-100/80 dark:border-emerald-800 animate-in fade-in slide-in-from-top-4 duration-300' : 'bg-rose-50/40 dark:bg-rose-900/20 border-rose-100/80 dark:border-rose-800 animate-in fade-in slide-in-from-top-4 duration-300'
      }`}>
        <div className="flex items-center gap-3">
          {}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0 shadow-sm ${
            isPass ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-100 dark:border-emerald-700 text-emerald-500 shadow-emerald-100 dark:shadow-none' : 'bg-rose-50 dark:bg-rose-900/40 border-rose-100 dark:border-rose-700 text-rose-500 shadow-rose-100 dark:shadow-none'
          }`}>
            {isPass ? <Trophy size={22} className="animate-wiggle" /> : <XCircle size={22} />}
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {isPass ? 'Congratulations!' : 'Keep Practicing!'}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">
              You scored <span className={isPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{result.score}</span> out of <strong className="dark:text-slate-300">{result.total}</strong> questions ({scorePercent}%)
            </p>
          </div>
        </div>

        {}
        <div className="flex-1 max-w-[200px] min-w-[80px] bg-slate-200/60 dark:bg-slate-700/60 h-2.5 rounded-full overflow-hidden border border-slate-300/30 dark:border-slate-600/30">
          <div className={`h-full rounded-full transition-all duration-1000 ${
            isPass ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-rose-500 dark:bg-rose-500'
          }`} style={{ width: `${scorePercent}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 w-full mb-6">
        <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700 pb-2 mb-3 flex-shrink-0">Review Questions</h4>
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-0">
          {result.gradedQuestions.map((q, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${q.isCorrect ? 'bg-emerald-50/30 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/50' : 'bg-rose-50/30 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/50'} transition-all hover:shadow-sm`}>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                     <span className="text-[10px] font-black text-slate-400 dark:text-slate-500">#{idx + 1}</span>
                     <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs truncate">{q.word}</span>
                     <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${TYPE_META[q.type]?.color ?? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}>
                       {TYPE_META[q.type]?.label ?? q.type}
                     </span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md flex-shrink-0 ${
                    q.isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400'
                  }`}>
                    {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                  </span>
                </div>
                
                <p className="text-xs font-bold text-slate-800 dark:text-slate-300 leading-relaxed">&quot;{q.question_text}&quot;</p>
                
                {q.type === 'matching' ? (
                  <div className="space-y-1.5 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-sm w-full">
                    {(() => {
                      try {
                        const correctObj = JSON.parse(q.correctAnswer) as Record<string, string>;
                        const studentObj = q.studentAnswer ? (JSON.parse(q.studentAnswer) as Record<string, string>) : {};
                        return Object.entries(correctObj).map(([word, correctSyn], wIdx) => {
                          const studentSyn = studentObj[word] || '(blank)';
                          const isPairCorrect = studentSyn === correctSyn;
                          return (
                            <div key={wIdx} className="text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-50 dark:border-slate-700/50 pb-1.5 last:border-0 last:pb-0">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{word} →</span>
                              <div className="flex flex-col gap-0.5">
                                {isPairCorrect ? (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100/60 dark:border-emerald-800/50 px-2 py-0.5 rounded text-[9px] self-start sm:self-end">
                                    ✓ Student Answer: {studentSyn}
                                  </span>
                                ) : (
                                  <div className="space-y-0.5">
                                    <span className="text-rose-500 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/30 border border-rose-100/60 dark:border-rose-800/50 px-2 py-0.5 rounded block text-[9px] text-left sm:text-right">
                                      ✗ Student Answer: {studentSyn}
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100/60 dark:border-emerald-800/50 px-2 py-0.5 rounded block text-[9px] text-left sm:text-right">
                                      ✓ Correct Answer: {correctSyn}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        });
                      } catch {
                        return <span className="text-rose-500 dark:text-rose-400 text-[10px]">Invalid matching pairs</span>;
                      }
                    })()}
                  </div>
                ) : (
                  <div className="space-y-1.5 mt-1 text-xs w-full">
                    {q.isCorrect ? (
                      <p className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50/80 dark:bg-emerald-900/30 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-emerald-100/60 dark:border-emerald-800/50 w-full">
                        <span>✓ Your Answer:</span> 
                        <strong>{q.studentAnswer}</strong>
                      </p>
                    ) : (
                      <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-3 rounded-xl space-y-1.5 shadow-sm w-full">
                        <p className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                          <span>✗ Your Answer:</span> 
                          <strong className="line-through">{q.studentAnswer || '(blank)'}</strong>
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
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

      {}
      <div className="flex gap-3 w-full flex-shrink-0 mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800">
        {mode !== 'review' && (
          <button onClick={onRetry}
            className="flex-1 py-3 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5">
            <RotateCcw size={15} /> Retry
          </button>
        )}
        <button onClick={onClose}
          className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-100 dark:shadow-none transition-colors flex items-center justify-center">
          Done
        </button>
      </div>
    </div>
  );
}


export function SharedExamTakerModal({ exam, onClose, mode = 'take' }: { exam: Exam; onClose: () => void; mode?: 'take' | 'review' }) {
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
        const attempts = (attemptsRes as { data?: Array<{ id: string; score: number; total_questions: number; answers: string; completed_at: string }> }).data ?? (attemptsRes as Array<{ id: string; score: number; total_questions: number; answers: string; completed_at: string }>);
        
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
      <div className={`bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full ${result ? 'max-w-3xl' : 'max-w-xl'} max-h-[92vh] flex flex-col overflow-hidden relative transition-all duration-300`}>
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
