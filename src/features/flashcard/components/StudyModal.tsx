import { useState, useEffect } from 'react';
import { X, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { flashcardService } from '../services/flashcard.service';
import { getAudioUrl } from '@/shared/utils/audio';

export function StudyModal({ isOpen, onClose, setId, setName }: { isOpen: boolean, onClose: () => void, setId: string, setName: string }) {
  const [cards, setCards] = useState<{
    id: string;
    audio_url?: string;
    word?: string;
    definition?: string;
    example_sentence?: string;
    part_of_speech?: string;
    phonetic?: string;
    meaning?: string;
    synonyms?: string;
    source?: string;
  }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && setId) {
      flashcardService.getCardsForSet(setId).then(res => {
        const data = (res as { data?: typeof cards }).data ?? (res as typeof cards);
        if (Array.isArray(data)) {
          setCards(data);
        }
        setLoading(false);
      }).catch(e => {
        console.error(e);
        setLoading(false);
      });
    }
  }, [isOpen, setId]);

  if (!isOpen) return null;

  const currentCard = cards[currentIndex];
  const isFinished = currentIndex >= cards.length && cards.length > 0;
  
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const handleNext = async (status: 'learning' | 'mastered') => {
    if (currentCard) {
      await flashcardService.updateProgress(currentCard.id, status);
      
      
      try {
        const { dashboardService } = await import('@/features/dashboard/services/dashboard.service');
        await dashboardService.trackQuestProgress('practice_words', 1);
        window.dispatchEvent(new Event('questUpdate'));
      } catch (e) {
        console.error('Failed to track quest progress:', e);
      }
    }
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 150);
  };

  const playAudio = (e: React.MouseEvent | { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (currentCard?.audio_url) {
      new Audio(getAudioUrl(currentCard.audio_url)).play();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
      
      <div className="absolute top-6 right-6 z-10">
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm">
          <X size={24} />
        </button>
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center">
        {}
        <div className="w-full mb-8">
          <div className="flex justify-between text-white/70 text-sm font-bold mb-2">
            <span>{setName}</span>
            <span>{currentIndex} / {cards.length}</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {loading ? (
          <div className="text-white animate-pulse text-lg font-bold">Loading your cards...</div>
        ) : cards.length === 0 ? (
           <div className="bg-white rounded-3xl p-12 text-center shadow-2xl">
             <h2 className="text-2xl font-black text-slate-900 mb-2">No cards yet!</h2>
             <p className="text-slate-500 mb-6">Ask your teacher to add some vocabulary words.</p>
             <button onClick={onClose} className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl">Go Back</button>
           </div>
        ) : isFinished ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-2xl animate-in zoom-in duration-500 max-w-sm w-full">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">You did it!</h2>
            <p className="text-slate-500 font-medium mb-8">You&apos;ve gone through all the flashcards in this set.</p>
            <button onClick={onClose} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-colors shadow-lg">
              Finish Session
            </button>
          </div>
        ) : (
          <div className="w-full max-w-md perspective-1000">
            <div 
              className={`relative w-full h-[420px] transition-transform duration-500 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {}
              <div className="absolute inset-0 backface-hidden bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center border-b-8 border-slate-200">
                {currentCard.audio_url && (
                  <button onClick={playAudio} className="absolute top-6 right-6 p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-500 rounded-2xl transition-colors">
                    <Volume2 size={24} />
                  </button>
                )}
                <div className="flex flex-col items-center gap-1.5 mb-2">
                  <h2 className="text-5xl font-black text-slate-900 text-center tracking-tight">{currentCard.word}</h2>
                  {currentCard.part_of_speech && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block">
                      {currentCard.part_of_speech}
                    </span>
                  )}
                </div>
                {currentCard.phonetic && <p className="text-xl text-slate-400 font-medium">{currentCard.phonetic}</p>}
                <p className="absolute bottom-6 text-slate-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 animate-bounce">Tap to flip</p>
              </div>

              {}
              <div className="absolute inset-0 backface-hidden bg-indigo-600 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-white rotate-y-180 border-b-8 border-indigo-800">
                <h3 className="text-3xl font-bold mb-4 text-center leading-tight">{currentCard.meaning || "No meaning provided"}</h3>
                
                {currentCard.synonyms && (
                  <div className="text-indigo-100 font-semibold mb-6 text-xs flex items-center justify-center gap-2 bg-white/10 border border-white/5 px-3.5 py-1.5 rounded-xl">
                    <span className="text-indigo-300 font-black uppercase tracking-wider text-[10px]">Synonyms:</span>
                    <span className="text-white font-bold">{currentCard.synonyms}</span>
                  </div>
                )}

                {currentCard.example_sentence && (
                  <div className="bg-white/10 p-5 rounded-2xl w-full text-center italic text-indigo-100 text-lg">
                    &quot;{currentCard.example_sentence}&quot;
                  </div>
                )}
              </div>
            </div>

            {}
            <div className={`flex gap-4 mt-8 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <button 
                onClick={() => handleNext('learning')}
                className="flex-1 py-4 bg-white hover:bg-rose-50 border border-transparent hover:border-rose-200 text-rose-500 font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 text-lg active:scale-95"
              >
                <XCircle size={24} /> Still Learning
              </button>
              <button 
                onClick={() => handleNext('mastered')}
                className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 text-lg active:scale-95 border-b-4 border-emerald-700"
              >
                <CheckCircle2 size={24} /> Got it!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
