import { useState, useEffect, useCallback } from 'react';
import { X, Wand2, Plus, Pencil, Trash2, Volume2, Save, Undo, Loader2, Camera, Image as ImageIcon, Sparkles } from 'lucide-react';
import { flashcardService } from '../services/flashcard.service';
import { getAudioUrl } from '@/shared/utils/audio';
import toast from 'react-hot-toast';

export interface Flashcard {
  id: string;
  word?: string;
  phonetic?: string;
  part_of_speech?: string;
  meaning?: string;
  synonyms?: string;
  example_sentence?: string;
  audio_url?: string;
}

export function AddCardModal({ isOpen, onClose, setId, onAdded }: { isOpen: boolean, onClose: () => void, setId: string, onAdded: () => void }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  // Add form state
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // OCR state
  const [addMode, setAddMode] = useState<'single' | 'scan'>('single');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrRawText, setOcrRawText] = useState('');
  const [detectedWords, setDetectedWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<Record<string, boolean>>({});
  const [batchAdding, setBatchAdding] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [manualWordInput, setManualWordInput] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [failedWords, setFailedWords] = useState<Record<string, string>>({});



  const handleAiParse = async (textToParse: string) => {
    if (!textToParse.trim()) return;
    setIsAiParsing(true);
    setErrorMsg('');
    setFailedWords({});
    try {
      const res = (await flashcardService.parseOcrText(textToParse)) as { data?: string[]; words?: string[] } | string[];
      const extracted = Array.isArray(res) ? res : (res?.data || res?.words || []);
      setDetectedWords(extracted);
      
      const next: Record<string, boolean> = {};
      extracted.forEach((w: string) => {
        next[w] = true;
      });
      setSelectedWords(next);
    } catch (e: unknown) {
      console.error('Failed to parse text with AI:', e);
      setErrorMsg('⚠️ AI parsing failed: ' + ((e as Error).message || 'Please check your connection and configuration.'));
    } finally {
      setIsAiParsing(false);
    }
  };

  // Edit form state
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [editWord, setEditWord] = useState('');
  const [editPhonetic, setEditPhonetic] = useState('');
  const [editPartOfSpeech, setEditPartOfSpeech] = useState('');
  const [editMeaning, setEditMeaning] = useState('');
  const [editSynonyms, setEditSynonyms] = useState('');
  const [editExampleSentence, setEditExampleSentence] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    if (!setId) return;
    setLoadingCards(true);
    try {
      const res = await flashcardService.getCardsForSet(setId);
      const data = res.data || res;
      setCards(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to fetch cards:', e);
    } finally {
      setLoadingCards(false);
    }
  }, [setId]);

  useEffect(() => {
    if (isOpen && setId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchCards();
    }
  }, [isOpen, setId, fetchCards]);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!word) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await flashcardService.addCard(setId, word.trim());
      setWord('');
      fetchCards();
      onAdded();
    } catch (e: unknown) {
      console.error(e);
      setErrorMsg((e as Error).message || '⚠️ Word not found in dictionary databases. Please check your spelling.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrProgress(0);
    setOcrStatus('Sending image to AI...');
    setErrorMsg('');
    setOcrRawText('');
    setDetectedWords([]);

    try {
      // Simulate progress while waiting for AI response
      setOcrProgress(30);
      const extracted = (await flashcardService.parseImage(file)) as { data?: string[]; words?: string[] } | string[];
      setOcrProgress(100);

      const words: string[] = Array.isArray(extracted) ? extracted : (extracted?.data || extracted?.words || []);

      if (words.length === 0) {
        setErrorMsg('⚠️ No vocabulary words detected. Please try again with a clearer photo of the glossary page.');
      } else {
        setDetectedWords(words);
        const next: Record<string, boolean> = {};
        words.forEach((w: string) => { next[w] = true; });
        setSelectedWords(next);
        setOcrRawText('[Image processed by Gemini Vision AI]');
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('⚠️ Failed to process image: ' + ((err as Error).message || 'Please try again.'));
    } finally {
      setOcrLoading(false);
      setOcrStatus('');
    }
  };


  const handleBatchAdd = async () => {
    const wordsToImport = Object.keys(selectedWords).filter(w => selectedWords[w]);
    if (wordsToImport.length === 0) return;

    setBatchAdding(true);
    setBatchProgress({ current: 0, total: wordsToImport.length });
    setErrorMsg('');
    setFailedWords({});

    let successCount = 0;
    let failCount = 0;
    const fails: Record<string, string> = {};

    for (let i = 0; i < wordsToImport.length; i++) {
      const currentWord = wordsToImport[i];
      setBatchProgress(prev => ({ ...prev, current: i + 1 }));
      try {
        await flashcardService.addCard(setId, currentWord);
        successCount++;
      } catch (err: unknown) {
        console.error(`Failed to add batch word: ${currentWord}`, err);
        failCount++;
        fails[currentWord] = (err as Error).message || 'Word not found in dictionary';
      }
    }

    setBatchAdding(false);
    fetchCards();
    onAdded();

    if (failCount > 0) {
      setFailedWords(fails);
      // Keep only failed words in detectedWords checklist so the user can easily see and fix them
      const failedList = wordsToImport.filter(w => fails[w]);
      setDetectedWords(failedList);
      
      const nextSelected: Record<string, boolean> = {};
      failedList.forEach(w => {
        nextSelected[w] = true;
      });
      setSelectedWords(nextSelected);
      
      setErrorMsg(`⚠️ Successfully added ${successCount} words. ${failCount} words failed because they were not found in the dictionary databases. Please check their spelling, edit them, or add manually!`);
    } else {
      setDetectedWords([]);
      setSelectedWords({});
      setFailedWords({});
      setAddMode('single');
      setErrorMsg('');
    }
  };

  const handleAddManualWord = () => {
    const word = manualWordInput.trim();
    if (!word) return;
    
    // Add to detected words if not already there
    if (!detectedWords.includes(word)) {
      const updated = [...detectedWords, word].sort();
      setDetectedWords(updated);
      setSelectedWords(prev => ({ ...prev, [word]: true }));
    }
    
    setManualWordInput('');
  };

  const handleStartEdit = (card: Flashcard) => {
    setEditingCard(card);
    setEditWord(card.word || '');
    setEditPhonetic(card.phonetic || '');
    setEditPartOfSpeech(card.part_of_speech || '');
    setEditMeaning(card.meaning || '');
    setEditSynonyms(card.synonyms || '');
    setEditExampleSentence(card.example_sentence || '');
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCard || !editWord) return;
    setSavingEdit(true);
    try {
      await flashcardService.updateCard(editingCard.id, {
        word: editWord.trim(),
        phonetic: editPhonetic.trim(),
        part_of_speech: editPartOfSpeech.trim(),
        meaning: editMeaning.trim(),
        synonyms: editSynonyms.trim(),
        example_sentence: editExampleSentence.trim(),
      });
      setEditingCard(null);
      fetchCards();
      onAdded();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save changes');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setDeletingCardId(cardId);
  };

  const confirmDelete = async () => {
    if (!deletingCardId) return;
    try {
      await flashcardService.deleteCard(deletingCardId);
      setDeletingCardId(null);
      fetchCards();
      onAdded();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete word');
    }
  };

  const playAudio = (url: string) => {
    if (url) {
      new Audio(getAudioUrl(url)).play().catch(e => console.log('Audio playback failed', e));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-500">
              <Wand2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Manage Vocabulary Set</h2>
              <p className="text-xs font-semibold text-slate-500">Add, edit, or delete cards within this study set.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content split container */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Left panel: Add or Edit form */}
          <div className="w-full md:w-[38%] p-6 border-r border-slate-100 dark:border-slate-700 overflow-y-auto bg-slate-50/20 dark:bg-slate-800/20">
            {editingCard ? (
              // Edit Mode Form
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-1.5">
                    <Pencil size={14} />
                    Edit Word Details
                  </h3>
                  <button 
                    onClick={handleCancelEdit}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    <Undo size={12} /> Cancel
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">English Word</label>
                    <input 
                      type="text" 
                      value={editWord}
                      onChange={e => setEditWord(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Part of Speech</label>
                    <input 
                      type="text" 
                      placeholder="e.g. noun, verb, adjective"
                      value={editPartOfSpeech}
                      onChange={e => setEditPartOfSpeech(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phonetic Spelling</label>
                    <input 
                      type="text" 
                      placeholder="e.g. /ˈhæpi/"
                      value={editPhonetic}
                      onChange={e => setEditPhonetic(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Translation & Meaning</label>
                    <textarea 
                      rows={3}
                      placeholder="Enter Vietnamese definition"
                      value={editMeaning}
                      onChange={e => setEditMeaning(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Synonyms (Từ đồng nghĩa)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. cheerful, delighted, glad"
                      value={editSynonyms}
                      onChange={e => setEditSynonyms(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Example Sentence</label>
                    <textarea 
                      rows={2}
                      placeholder="Enter English example sentence"
                      value={editExampleSentence}
                      onChange={e => setEditExampleSentence(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button 
                    onClick={handleSaveEdit}
                    disabled={!editWord || savingEdit}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-1.5"
                  >
                    {savingEdit ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Save Changes</>}
                  </button>
                </div>
              </div>
            ) : (
              // Add Mode Form
              <div className="space-y-5">
                {/* Tab Switcher */}
                <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-600/50">
                  <button
                    onClick={() => {
                      setAddMode('single');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      addMode === 'single'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Wand2 size={14} />
                    Auto-Fill Single
                  </button>
                  <button
                    onClick={() => {
                      setAddMode('scan');
                      setErrorMsg('');
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      addMode === 'scan'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    <Camera size={14} />
                    Scan Image (AI Vision)
                  </button>
                </div>

                {addMode === 'single' ? (
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                      Add Word (AI Auto-fill)
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Enter English Word</label>
                        <input 
                          type="text" 
                          placeholder="e.g. ephemeral"
                          value={word}
                          onChange={e => {
                            setWord(e.target.value);
                            if (errorMsg) setErrorMsg('');
                          }}
                          onKeyDown={e => e.key === 'Enter' && handleAdd()}
                          className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-md font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          autoFocus
                        />
                        {errorMsg && (
                          <div className="mt-2 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            {errorMsg}
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={handleAdd}
                        disabled={!word || loading}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Add with AI</>}
                      </button>
                      
                      <div className="bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl p-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                        💡 Our AI will automatically contact dictionary definitions to fetch phonetic spellings, parts of speech, translations, and audio pronunciation tracks!
                      </div>
                    </div>
                  </div>
                ) : (
                  // OCR Image Scanning Mode
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                      Scan Textbook / Image
                    </h3>

                    {!ocrRawText ? (
                      <div className="space-y-4">
                        {/* Drag and Drop Zone */}
                        <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/20 rounded-2xl cursor-pointer transition-all p-4 text-center">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleScanImage} 
                            disabled={ocrLoading} 
                            className="hidden" 
                          />
                          {ocrLoading ? (
                            <div className="flex flex-col items-center space-y-3">
                              <Loader2 className="animate-spin text-indigo-600" size={32} />
                              <div className="space-y-1">
                                <p className="text-sm font-bold text-slate-700">{ocrStatus}</p>
                                <p className="text-xs font-semibold text-slate-400">{ocrProgress}% Complete</p>
                              </div>
                              {/* Simple Progress Bar */}
                              <div className="w-48 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-indigo-600 h-1.5 transition-all duration-300"
                                  style={{ width: `${ocrProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center space-y-2">
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 border border-slate-100">
                                <ImageIcon size={24} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">Upload vocab list photo</p>
                                <p className="text-xs font-medium text-slate-400 mt-1">Supports JPG, PNG up to 10MB</p>
                              </div>
                            </div>
                          )}
                        </label>

                        {errorMsg && (
                          <div className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl flex items-center gap-1.5 animate-in fade-in duration-200">
                            {errorMsg}
                          </div>
                        )}
                        
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed font-semibold">
                          📷 Snap a clean, well-lit photo of textbook words, worksheets, or word charts. Our Gemini Vision AI will read and extract all English vocabulary words automatically!
                        </div>
                      </div>
                    ) : (
                      // Scanned text editor and live word checklist!
                      <div className="space-y-4 flex flex-col min-h-0">
                        {/* Interactive Text Area */}
                        <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>📝 Scanned Text (Sửa từ ở đây nếu quét sai)</span>
                            <button
                              onClick={() => handleAiParse(ocrRawText)}
                              disabled={isAiParsing || !ocrRawText.trim()}
                              className="text-[10px] text-indigo-600 font-extrabold flex items-center gap-1 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50 px-2 py-0.5 rounded-md transition-colors"
                            >
                              {isAiParsing ? (
                                <>
                                  <Loader2 size={10} className="animate-spin" />
                                  Extracting...
                                </>
                              ) : (
                                <>
                                  <Sparkles size={10} />
                                  Re-extract with AI
                                </>
                              )}
                            </button>
                          </label>
                          <textarea
                            rows={3}
                            value={ocrRawText}
                            onChange={e => setOcrRawText(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-y"
                            placeholder="Scanned text will appear here. Edit or type new words manually."
                          />
                          {errorMsg && (
                            <div className="mt-2 text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl flex items-center gap-1.5 animate-in fade-in duration-200">
                              {errorMsg}
                            </div>
                          )}
                        </div>

                        {/* Extracted Checklist header */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-slate-500 uppercase tracking-wider">
                            🔍 Filtered Words ({detectedWords.length})
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const allSel: Record<string, boolean> = {};
                                detectedWords.forEach(w => { allSel[w] = true; });
                                setSelectedWords(allSel);
                              }}
                              className="text-indigo-600 hover:text-indigo-700 font-extrabold"
                            >
                              Select All
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => setSelectedWords({})}
                              className="text-slate-500 hover:text-slate-700 font-extrabold"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        {/* Manual Word Input */}
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Add Missing Words</label>
                            <input 
                              type="text" 
                              value={manualWordInput}
                              onChange={e => setManualWordInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && handleAddManualWord()}
                              placeholder="Type word and press Enter"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                          <button
                            onClick={handleAddManualWord}
                            disabled={!manualWordInput.trim()}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>

                        {/* Checklist Container */}
                        {isAiParsing ? (
                          <div className="flex flex-col items-center justify-center py-8 border border-dashed border-indigo-100 rounded-xl bg-indigo-50/10 text-indigo-500 gap-2">
                            <Loader2 className="animate-spin" size={20} />
                            <span className="text-[11px] font-bold text-indigo-600">AI is extracting clean English vocabulary...</span>
                          </div>
                        ) : detectedWords.length === 0 ? (
                          <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-400">
                            No clean English words extracted yet. Click &quot;Re-extract with AI&quot; or type manually!
                          </div>
                        ) : (
                          <div className="max-h-36 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50 space-y-1">
                            {detectedWords.map(w => (
                              <label 
                                key={w} 
                                className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white cursor-pointer select-none transition-colors border border-transparent hover:border-slate-100"
                              >
                                <input 
                                  type="checkbox"
                                  checked={!!selectedWords[w]}
                                  onChange={e => {
                                    setSelectedWords(prev => ({
                                      ...prev,
                                      [w]: e.target.checked
                                    }));
                                  }}
                                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-bold text-slate-700">{w}</span>
                                {failedWords[w] && (
                                  <span className="text-[10px] text-red-500 font-bold ml-auto bg-red-50 px-2 py-0.5 rounded-md border border-red-100 flex items-center gap-1">
                                    ⚠️ {failedWords[w]}
                                  </span>
                                )}
                              </label>
                            ))}
                          </div>
                        )}

                        {/* Batch Import Progress */}
                        {batchAdding ? (
                          <div className="space-y-2 bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-center">
                            <div className="flex items-center justify-center gap-2 text-indigo-600 font-extrabold text-xs">
                              <Loader2 className="animate-spin" size={14} />
                              Importing word {batchProgress.current} of {batchProgress.total}...
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-indigo-600 h-1.5 transition-all duration-300"
                                style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setOcrRawText('');
                                setDetectedWords([]);
                                setSelectedWords({});
                              }}
                              className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200"
                            >
                              Scan Again
                            </button>
                            <button
                              onClick={handleBatchAdd}
                              disabled={Object.keys(selectedWords).filter(w => selectedWords[w]).length === 0}
                              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-indigo-100 flex items-center justify-center gap-1.5"
                            >
                              <Sparkles size={13} />
                              Add Selected ({Object.keys(selectedWords).filter(w => selectedWords[w]).length})
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel: List of cards */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col min-h-0">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center justify-between">
              <span>Words in Set ({cards.length})</span>
            </h3>

            {loadingCards ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
                <Loader2 className="animate-spin text-indigo-500" size={24} />
                <span className="text-xs font-bold">Loading cards...</span>
              </div>
            ) : cards.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50/20 dark:bg-slate-800/20 py-12">
                <Wand2 className="text-slate-300 dark:text-slate-600 mb-3" size={32} />
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No words in this set yet</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Use the left panel to populate your vocabulary card deck.</p>
              </div>
            ) : (
              <div className="space-y-3 pr-1">
                {cards.map((card, idx) => {
                  const initials = card.word ? card.word.substring(0, 2).toUpperCase() : 'WD';
                  const bgColors = ['bg-rose-50 border-rose-100 text-rose-500', 'bg-emerald-50 border-emerald-100 text-emerald-500', 'bg-blue-50 border-blue-100 text-blue-500', 'bg-amber-50 border-amber-100 text-amber-500', 'bg-indigo-50 border-indigo-100 text-indigo-500'];
                  const colorClass = bgColors[idx % bgColors.length];

                  return (
                    <div 
                      key={card.id} 
                      className={`p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-all flex items-start gap-3 bg-white dark:bg-slate-800 ${
                        editingCard?.id === card.id ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50/5 dark:bg-indigo-900/10' : ''
                      }`}
                    >
                      {/* Avatar initial */}
                      <div className={`w-9 h-9 border rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-sm ${colorClass}`}>
                        {initials}
                      </div>

                      {/* Card Content details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">{card.word}</span>
                          
                          {card.part_of_speech && (
                            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md">
                              {card.part_of_speech}
                            </span>
                          )}

                          {card.phonetic && (
                            <span className="text-[11px] font-medium text-slate-400">{card.phonetic}</span>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold mt-1 leading-snug truncate" title={card.meaning}>
                          {card.meaning || <span className="text-slate-300 dark:text-slate-500 italic font-medium">No definition provided</span>}
                        </p>

                        {card.synonyms && (
                          <p className="text-[10px] text-indigo-600 font-bold mt-0.5" title={card.synonyms}>
                            <span className="text-slate-400 font-bold uppercase tracking-widest text-[8px] mr-1">Synonyms:</span>
                            {card.synonyms}
                          </p>
                        )}

                        {card.example_sentence && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5 font-medium truncate" title={card.example_sentence}>
                            &quot;{card.example_sentence}&quot;
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {card.audio_url && (
                          <button 
                            onClick={() => playAudio(card.audio_url!)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                            title="Play pronunciation"
                          >
                            <Volume2 size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleStartEdit(card)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100"
                          title="Edit word"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                          title="Delete word"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deletingCardId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 transform transition-all duration-300 scale-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-md font-extrabold text-slate-900 mb-1.5">Delete Vocabulary Word?</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6">
              This action cannot be undone. This word will be permanently removed from the vocabulary set.
            </p>
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setDeletingCardId(null)}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-200/60"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-rose-100"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
