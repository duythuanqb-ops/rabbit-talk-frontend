"use client";

import { useState, useEffect, useCallback } from 'react';
import { X, Volume2, CheckCircle2, XCircle, Star, BookOpen, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardService } from '../../services/dashboard.service';
import { getAudioUrl } from '@/shared/utils/audio';

interface StudyCard {
  id: string;
  word: string;
  meaning: string;
  phonetic?: string | null;
  exampleSentence?: string | null;
  synonyms?: string | null;
  audioUrl?: string | null;
  source: 'custom' | 'flashcard';
  status?: string;
}

interface VocabStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCardId?: string;
}

export function VocabStudyModal({ isOpen, onClose, initialCardId }: VocabStudyModalProps) {
  const [cards, setCards] = useState<StudyCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<{ id: string; result: 'learning' | 'mastered' }[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => {
      setLoading(true);
      setResults([]);
      setIsFlipped(false);
    }, 0);

    dashboardService.getVocabularyStudyCards()
      .then(res => {
        const data: StudyCard[] = (res as { data?: StudyCard[] }).data ?? [];
        if (initialCardId) {
          const idx = data.findIndex(c => c.id === initialCardId);
          if (idx > 0) {
            const reordered = [data[idx], ...data.slice(0, idx), ...data.slice(idx + 1)];
            setCards(reordered);
          } else {
            setCards(data);
          }
        } else {
          setCards(data);
        }
        setCurrentIndex(0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, initialCardId]);

  const currentCard = cards[currentIndex];
  const isFinished = cards.length > 0 && currentIndex >= cards.length;
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;
  const masteredCount = results.filter(r => r.result === 'mastered').length;

  const handleNext = useCallback(async (result: 'learning' | 'mastered') => {
    if (!currentCard) return;

    setResults(prev => [...prev, { id: currentCard.id, result }]);

    dashboardService.trackQuestProgress('practice_words', 1)
      .then(() => window.dispatchEvent(new Event('questUpdate')))
      .catch(console.error);

    if (currentCard.source === 'flashcard') {
      try {
        const { flashcardService } = await import('@/features/flashcard/services/flashcard.service');
        await flashcardService.updateProgress(currentCard.id, result);
      } catch {
      }
    }

    setIsFlipped(false);
    setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
  }, [currentCard]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setResults([]);
  };

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentCard?.audioUrl) {
      new Audio(getAudioUrl(currentCard.audioUrl)).play().catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4"
        >
          <style dangerouslySetInnerHTML={{ __html: `
            .perspective-1000 { perspective: 1000px; }
            .preserve-3d { transform-style: preserve-3d; }
            .backface-hidden { backface-visibility: hidden; }
            .rotate-y-180 { transform: rotateY(180deg); }
          ` }} />

          {}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X size={22} />
          </button>

          <div className="w-full max-w-2xl flex flex-col items-center">
            {}
            <div className="w-full mb-6">
              <div className="flex justify-between items-center text-white/70 text-sm font-bold mb-3">
                <span className="flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-400" />
                  My Vocabulary Practice
                </span>
                <span>{Math.min(currentIndex, cards.length)} / {cards.length}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>

            {}
            {loading ? (
              <div className="flex flex-col items-center gap-4 text-white">
                <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="font-bold animate-pulse">Loading your words...</p>
              </div>
            ) : cards.length === 0 ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-2xl max-w-sm w-full"
              >
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5">
                  <BookOpen size={36} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No words to study!</h2>
                <p className="text-slate-500 mb-6 text-sm">Add words or star words from your lessons to start practicing.</p>
                <button onClick={onClose} className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-colors">
                  Got it
                </button>
              </motion.div>
            ) : isFinished ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center shadow-2xl max-w-sm w-full"
              >
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Session Done!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  You mastered <span className="text-emerald-600 dark:text-emerald-400 font-bold">{masteredCount}</span> out of <span className="font-bold">{cards.length}</span> words.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-colors"
                  >
                    <RotateCcw size={16} /> Again
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-emerald-500/30"
                  >
                    Finish
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="w-full max-w-md">
                {}
                <div className="flex justify-center mb-4">
                  <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${
                    currentCard.source === 'custom'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {currentCard.source === 'custom' ? (
                      <span className="flex items-center gap-1.5"><BookOpen size={11} /> My Word</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><Star size={11} /> Starred from lesson</span>
                    )}
                  </span>
                </div>

                {}
                <div className="perspective-1000">
                  <div
                    className={`relative w-full h-[380px] transition-transform duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    {}
                    <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center border-b-[6px] border-slate-200 dark:border-slate-700">
                      {currentCard.audioUrl && (
                        <button
                          onClick={playAudio}
                          className="absolute top-5 right-5 p-2.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-500 rounded-xl transition-colors"
                        >
                          <Volume2 size={20} />
                        </button>
                      )}
                      <h2 className="text-5xl font-black text-slate-900 dark:text-white text-center tracking-tight mb-2">
                        {currentCard.word}
                      </h2>
                      {currentCard.phonetic && (
                        <p className="text-xl text-slate-400 font-medium">{currentCard.phonetic}</p>
                      )}
                      <p className="absolute bottom-6 text-slate-300 dark:text-slate-500 text-xs font-bold uppercase tracking-widest animate-bounce">
                        Tap to reveal
                      </p>
                    </div>

                    {}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-white rotate-y-180 border-b-[6px] border-indigo-800">
                      <h3 className="text-3xl font-bold mb-4 text-center leading-tight">
                        {currentCard.meaning}
                      </h3>
                      {currentCard.synonyms && (
                        <div className="text-indigo-100 text-xs font-semibold mb-4 flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl">
                          <span className="text-indigo-300 font-black uppercase tracking-wider text-[10px]">Synonyms:</span>
                          <span>{currentCard.synonyms}</span>
                        </div>
                      )}
                      {currentCard.exampleSentence && (
                        <div className="bg-white/10 border border-white/10 p-4 rounded-2xl w-full text-center italic text-indigo-100 text-base leading-relaxed">
                          &quot;{currentCard.exampleSentence}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <div className={`flex gap-4 mt-6 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <button
                    onClick={() => handleNext('learning')}
                    className="flex-1 py-4 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 text-rose-500 font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 text-base active:scale-95"
                  >
                    <XCircle size={20} /> Still Learning
                  </button>
                  <button
                    onClick={() => handleNext('mastered')}
                    className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 text-base active:scale-95 border-b-4 border-emerald-700"
                  >
                    <CheckCircle2 size={20} /> Got it!
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
