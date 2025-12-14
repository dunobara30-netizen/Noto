
import React, { useState } from 'react';
import { generatePracticeQuestion } from '../services/geminiService';
import { GradeLevel, Exercise, Language, TRANSLATIONS, Difficulty, Theme } from '../types';
import { BookOpen, Calculator, Languages, FlaskConical, History, BrainCircuit, ArrowRight, RefreshCcw, Check, X as XIcon, Loader2, Sparkles, Play, Pencil, Lightbulb, Gauge, RotateCcw } from 'lucide-react';

interface ExerciseHubProps {
  gradeLevel: GradeLevel;
  language: Language;
  currentTheme: Theme;
}

const subjects = [
  { id: 'Mathematik', translationKey: 'Math', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', gradient: 'from-blue-400 to-cyan-400' },
  { id: 'Deutsch', translationKey: 'German', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', gradient: 'from-amber-400 to-orange-400' },
  { id: 'Englisch', translationKey: 'English', icon: Languages, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', gradient: 'from-violet-400 to-fuchsia-400' },
  { id: 'Biologie', translationKey: 'Biology', icon: FlaskConical, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', gradient: 'from-emerald-400 to-teal-400' },
  { id: 'Geschichte', translationKey: 'History', icon: History, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', gradient: 'from-rose-400 to-pink-400' },
];

const ExerciseHub: React.FC<ExerciseHubProps> = ({ gradeLevel, language, currentTheme }) => {
  // State: 'selection' -> 'config' -> 'exercise'
  const [viewState, setViewState] = useState<'selection' | 'config' | 'exercise'>('selection');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  // Config State
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [sourceMode, setSourceMode] = useState<'topic' | 'notes'>('topic');
  const [customTopic, setCustomTopic] = useState(''); // Used for topic OR notes text
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]); // Track question questions to avoid repeats
  
  // Interaction State
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillInput, setFillInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false); // For Flashcards
  
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const t = TRANSLATIONS[language];

  // Helper to get button class based on theme
  const getButtonClass = () => {
      switch(currentTheme) {
          case 'plush': return 'bg-rose-300 border-b-4 border-rose-400 active:border-b-0 active:translate-y-1';
          case 'music': return 'bg-violet-400 border-b-4 border-violet-500 active:border-b-0 active:translate-y-1';
          case 'christmas': return 'bg-gradient-to-r from-red-600 to-emerald-600 shadow-red-200 hover:shadow-red-300';
          case 'chalkboard': return 'bg-white text-stone-900 border-2 border-dashed border-stone-500 hover:bg-stone-200';
          case 'school': return 'bg-blue-600 text-white shadow-blue-200 hover:shadow-blue-300 font-sans';
          case 'library': return 'bg-[#5c4033] text-[#f5f5dc] border border-[#3e2b22] shadow-sm hover:bg-[#3e2b22]';
          case 'exam': return 'bg-black text-white border-2 border-black hover:bg-gray-800';
          default: return 'bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-violet-200 dark:shadow-none hover:shadow-violet-300';
      }
  };

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setViewState('config');
    setCustomTopic(''); // Reset topic
    setDifficulty('medium'); // Reset difficulty
    setSourceMode('topic');
    setHistory([]); // Reset history for new subject session
  };

  const startExercise = async () => {
    if (!selectedSubject) return;

    setViewState('exercise');
    setExercise(null);
    setSelectedAnswer(null);
    setFillInput('');
    setIsFlipped(false);
    setShowResult(false);
    setShowHint(false);
    setImageError(false);
    setLoading(true);

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 20000)
      );
      
      const subStyle = getSubjectStyle(selectedSubject);
      const apiSubject = language === 'en' 
        ? (TRANSLATIONS.en as any)[subStyle?.translationKey || ''] || selectedSubject
        : selectedSubject;

      // Pass history to avoid repeats
      const data = await Promise.race([
          generatePracticeQuestion(apiSubject, gradeLevel, customTopic, language, difficulty, history),
          timeoutPromise
      ]) as Exercise;

      setExercise(data);
      // Add new question to history
      setHistory(prev => [...prev, data.question]);

    } catch (error: any) {
      console.error(error);
      alert(language === 'en' ? "Could not generate a valid question. Please try again." : "Konnte keine Frage generieren. Bitte versuche es erneut.");
      setViewState('selection');
      setSelectedSubject(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (option: string) => {
    if (showResult) return;
    setSelectedAnswer(option);
  };

  const checkAnswer = () => {
    if (exercise?.type === 'fill-blank') {
         if (!fillInput.trim()) return;
         setSelectedAnswer(fillInput.trim()); // Store user input as selected
    }
    
    // For flashcards, "checking" isn't standard, but we show result to allow "Next"
    if (exercise?.type === 'flashcard') {
        setIsFlipped(true);
    }

    setShowResult(true);
  };

  const nextQuestion = () => {
    // Restart with same settings
    startExercise();
  };

  const goBack = () => {
    if (viewState === 'config') {
        setViewState('selection');
        setSelectedSubject(null);
    } else if (viewState === 'exercise') {
        setViewState('config');
        setExercise(null);
    }
  };

  const getSubjectStyle = (id: string) => subjects.find(s => s.id === id);

  // Normalize comparisons for logic (Case insensitive)
  const isCorrect = () => {
      if (!exercise) return false;
      if (exercise.type === 'flashcard') return true; 
      
      const cleanAnswer = exercise.correctAnswer.trim().toLowerCase();
      
      if (exercise.type === 'fill-blank') {
          return fillInput.trim().toLowerCase() === cleanAnswer;
      }
      
      if (exercise.type === 'true-false') {
          const mapBool = (val: string | null) => {
              if (!val) return '';
              const v = val.toLowerCase();
              if (v === 'wahr' || v === 'true') return 'true';
              if (v === 'falsch' || v === 'false') return 'false';
              return v;
          };
          return mapBool(selectedAnswer) === mapBool(exercise.correctAnswer);
      }
      return selectedAnswer === exercise.correctAnswer;
  };

  const getSelectedSubjectName = () => {
      if (!selectedSubject) return "";
      const subStyle = getSubjectStyle(selectedSubject);
      return (t as any)[subStyle?.translationKey || ''] || selectedSubject;
  };

  // RENDER HELPERS
  const renderExerciseContent = () => {
    if (!exercise) return null;

    switch (exercise.type) {
        case 'multiple-choice':
            return (
                <div className="space-y-3 mb-6">
                    {exercise.options?.map((option, idx) => {
                        let btnClass = "bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-200 dark:hover:border-violet-600 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 hover:text-violet-700 dark:hover:text-violet-300";
                        if (currentTheme === 'plush') btnClass = "bg-white border-2 border-dashed border-rose-200 text-stone-600 hover:bg-rose-50";
                        if (currentTheme === 'music') btnClass = "bg-white border border-violet-100 text-violet-700 hover:bg-violet-50 hover:border-violet-300";
                        if (currentTheme === 'chalkboard') btnClass = "bg-[#2a2a2a] border-2 border-[#444] text-white hover:border-white hover:bg-[#333]";
                        if (currentTheme === 'exam') btnClass = "bg-white border border-black text-black hover:bg-gray-100";
                        if (currentTheme === 'school') btnClass = "bg-[#fdfbf7] border-b-2 border-blue-200 text-slate-800 hover:bg-blue-50";

                        if (selectedAnswer === option) {
                            if (currentTheme === 'plush') btnClass = "bg-rose-100 border-rose-300 text-rose-600 shadow-sm";
                            else if (currentTheme === 'music') btnClass = "bg-violet-100 border-violet-400 text-violet-700 shadow-sm";
                            else if (currentTheme === 'christmas') btnClass = "bg-red-600 border-red-600 text-white shadow-lg shadow-red-200 transform scale-[1.02]";
                            else if (currentTheme === 'chalkboard') btnClass = "bg-white border-white text-black shadow-lg transform scale-[1.02] font-handwriting";
                            else if (currentTheme === 'exam') btnClass = "bg-black border-black text-white transform scale-[1.02]";
                            else btnClass = "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-none transform scale-[1.02]";
                        }
                        
                        if (showResult) {
                            if (option === exercise.correctAnswer) {
                                btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none ring-4 ring-emerald-100 dark:ring-emerald-900";
                            } else if (option === selectedAnswer && selectedAnswer !== exercise.correctAnswer) {
                                btnClass = "bg-rose-500 border-rose-500 text-white opacity-50";
                            } else {
                                btnClass = "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswerClick(option)}
                                disabled={showResult}
                                className={`w-full p-4 sm:p-5 rounded-2xl text-left font-bold transition-all duration-200 flex items-center justify-between group ${btnClass} ${currentTheme === 'plush' || currentTheme === 'music' ? 'rounded-full' : ''}`}
                            >
                                <span className="text-base sm:text-lg">{option}</span>
                                {showResult && option === exercise.correctAnswer && <Check className="w-5 h-5 sm:w-6 sm:h-6" />}
                                {showResult && option === selectedAnswer && option !== exercise.correctAnswer && <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
                            </button>
                        );
                    })}
                </div>
            );
        
        case 'true-false':
            return (
                <div className="flex gap-4 mb-6">
                    {['True', 'False'].map((option) => {
                        const localizedOption = language === 'de' 
                            ? (option === 'True' ? 'Wahr' : 'Falsch') 
                            : option;
                        
                        const isSelected = selectedAnswer === localizedOption;
                        let btnClass = "bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-200 dark:hover:border-violet-600";
                        if (currentTheme === 'plush') btnClass = "bg-white border-2 border-dashed border-rose-200 text-stone-600";
                        if (currentTheme === 'music') btnClass = "bg-white border border-violet-200 text-violet-600";
                        if (currentTheme === 'chalkboard') btnClass = "bg-[#2a2a2a] border-2 border-[#444] text-white hover:border-white hover:bg-[#333]";

                        if (isSelected) {
                            if (currentTheme === 'plush') btnClass = "bg-rose-100 border-rose-300 text-rose-600";
                            else if (currentTheme === 'music') btnClass = "bg-violet-100 border-violet-400 text-violet-700";
                            else if (currentTheme === 'christmas') btnClass = "bg-red-600 border-red-600 text-white";
                            else if (currentTheme === 'chalkboard') btnClass = "bg-white border-white text-black";
                            else if (currentTheme === 'exam') btnClass = "bg-black border-black text-white";
                            else btnClass = "bg-violet-600 border-violet-600 text-white";
                        }
                        
                        if (showResult) {
                            const mapBool = (val: string) => {
                                const v = val.toLowerCase();
                                return (v === 'wahr' || v === 'true');
                            };
                            
                            const isOptionCorrect = mapBool(localizedOption) === mapBool(exercise.correctAnswer);
                            
                            if (isOptionCorrect) {
                                btnClass = "bg-emerald-500 border-emerald-500 text-white ring-4 ring-emerald-100 dark:ring-emerald-900";
                            } else if (isSelected && !isOptionCorrect) {
                                btnClass = "bg-rose-500 border-rose-500 text-white opacity-50";
                            } else {
                                btnClass = "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswerClick(localizedOption)}
                                disabled={showResult}
                                className={`flex-1 p-6 rounded-2xl font-black text-xl transition-all ${btnClass} ${currentTheme === 'plush' || currentTheme === 'music' ? 'rounded-full' : ''}`}
                            >
                                {localizedOption}
                            </button>
                        );
                    })}
                </div>
            );

        case 'fill-blank':
            return (
                <div className="mb-6">
                     <div className="relative">
                        <input 
                            type="text" 
                            value={fillInput}
                            onChange={(e) => setFillInput(e.target.value)}
                            disabled={showResult}
                            placeholder={t.fillPlaceholder}
                            className={`w-full p-4 sm:p-5 rounded-2xl text-lg font-bold border-2 outline-none transition-all ${
                                showResult 
                                    ? (isCorrect()
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' 
                                        : 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400')
                                    : (currentTheme === 'plush' ? 'border-dashed border-rose-200 bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-50 text-stone-700 rounded-full' : (currentTheme === 'music' ? 'border-violet-200 bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-50 text-violet-700 rounded-full' : (currentTheme === 'christmas' ? 'border-red-100 bg-white focus:border-red-400 focus:ring-4 focus:ring-red-50 text-slate-700' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:focus:ring-violet-900/20 text-slate-700 dark:text-slate-100')))
                            }`}
                        />
                        {showResult && (
                             <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {isCorrect()
                                    ? <Check className="w-6 h-6 text-emerald-500" />
                                    : <XIcon className="w-6 h-6 text-rose-500" />
                                }
                             </div>
                        )}
                     </div>
                     {showResult && !isCorrect() && (
                         <div className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
                             Correct: <span className="text-emerald-600 dark:text-emerald-400">{exercise.correctAnswer}</span>
                         </div>
                     )}
                </div>
            );

        case 'flashcard':
            return (
                <div className="mb-6 perspective-1000">
                    <div 
                        onClick={() => setIsFlipped(!isFlipped)} 
                        className={`relative w-full h-64 transition-all duration-700 preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                        style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    >
                        {/* Front */}
                        <div className={`absolute inset-0 backface-hidden bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl shadow-lg flex flex-col items-center justify-center p-6 text-center ${currentTheme === 'plush' ? 'border-dashed border-rose-200' : (currentTheme === 'music' ? 'border-violet-200' : '')}`}>
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Question / Term</span>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">{exercise.question}</h3>
                            <span className={`absolute bottom-4 text-xs font-bold flex items-center gap-1 ${currentTheme === 'plush' ? 'text-rose-400' : (currentTheme === 'music' ? 'text-violet-500' : (currentTheme === 'christmas' ? 'text-red-500' : 'text-violet-500 dark:text-violet-400'))}`}>
                                <RotateCcw className="w-3 h-3" /> {t.revealCard}
                            </span>
                        </div>

                        {/* Back */}
                        <div className={`absolute inset-0 backface-hidden text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 text-center ${currentTheme === 'plush' ? 'bg-rose-300' : (currentTheme === 'music' ? 'bg-violet-400' : (currentTheme === 'christmas' ? 'bg-red-600' : 'bg-violet-600 dark:bg-violet-800'))}`} style={{ transform: 'rotateY(180deg)' }}>
                            <span className={`text-xs font-bold uppercase tracking-widest mb-4 ${currentTheme === 'plush' || currentTheme === 'music' ? 'text-white/80' : (currentTheme === 'christmas' ? 'text-red-200' : 'text-violet-200')}`}>Answer</span>
                            <h3 className="text-xl sm:text-2xl font-black">{exercise.correctAnswer}</h3>
                        </div>
                    </div>
                </div>
            );
            
        default:
            return null;
    }
  };


  // VIEW: SELECTION
  if (viewState === 'selection') {
    return (
      <div className="animate-in slide-in-from-bottom-4 duration-500 h-full flex flex-col p-4 sm:p-6 transition-all relative">

        <div className="mb-6 text-center space-y-2 mt-2 sm:mt-6">
            <h2 className={`text-2xl sm:text-3xl font-black text-transparent bg-clip-text flex items-center justify-center gap-2 ${
                currentTheme === 'plush'
                ? 'text-rose-400' :
                currentTheme === 'music'
                ? 'text-violet-500' :
                currentTheme === 'christmas'
                ? 'bg-gradient-to-r from-red-600 to-emerald-600' 
                : (currentTheme === 'exam' ? 'text-slate-900 dark:text-white' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400')
            }`}>
                <BrainCircuit className={`w-7 h-7 sm:w-8 sm:h-8 ${currentTheme === 'plush' ? 'text-rose-300' : (currentTheme === 'music' ? 'text-violet-400' : (currentTheme === 'christmas' ? 'text-emerald-500' : 'text-violet-500 dark:text-violet-400'))}`} />
                {t.studyHub}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">{t.chooseSubject}</p>
        </div>

        {/* 1 Column on Mobile, 2 on MD, 3 on LG - Fixes "squeezed" look */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 overflow-y-auto pb-24 px-1 custom-scrollbar">
          {subjects.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => handleSubjectSelect(sub.id)}
              className={`p-6 sm:p-8 rounded-[2rem] border-2 shadow-sm hover:shadow-xl transition-all duration-300 group text-left relative overflow-hidden bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:-translate-y-1 active:scale-95 ${
                  currentTheme === 'plush' ? 'border-dashed border-rose-200 hover:border-rose-300 rounded-[3rem]' :
                  currentTheme === 'music' ? 'border-violet-100 hover:border-violet-300 rounded-[3rem]' :
                  currentTheme === 'christmas' ? 'hover:border-red-200' : 'hover:border-violet-200 dark:hover:border-violet-700'
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Vibrant Background Blob */}
              <div className={`absolute -right-8 -bottom-8 w-32 h-32 sm:w-40 sm:h-40 rounded-full opacity-10 dark:opacity-20 bg-gradient-to-br ${sub.gradient} group-hover:scale-125 transition-transform duration-500`}></div>
              
              <div className="flex items-start justify-between relative z-10">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-sm flex items-center justify-center mb-4 text-white bg-gradient-to-br ${sub.gradient} ${currentTheme === 'plush' || currentTheme === 'music' ? 'rounded-full' : ''}`}>
                    <sub.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentTheme === 'plush' ? 'bg-orange-50 text-stone-500' : (currentTheme === 'music' ? 'bg-violet-50 text-violet-500' : 'bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300')}`}>
                    {gradeLevel}
                  </div>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1 relative z-10">
                {(t as any)[sub.translationKey] || sub.id}
              </h3>
              <p className={`text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 transition-colors ${
                  currentTheme === 'plush' ? 'group-hover:text-rose-400' :
                  currentTheme === 'music' ? 'group-hover:text-violet-500' :
                  currentTheme === 'christmas' ? 'group-hover:text-red-500' : 'group-hover:text-violet-500 dark:group-hover:text-violet-400'
              }`}>
                 {t.start} <ArrowRight className="w-4 h-4" />
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // VIEW: CONFIGURATION (Topic Selection)
  if (viewState === 'config' && selectedSubject) {
      const subStyle = getSubjectStyle(selectedSubject);
      const subjectName = getSelectedSubjectName();
      
      return (
        <div className="h-full flex flex-col animate-in zoom-in-95 duration-300 relative p-4 sm:p-6 items-center justify-center text-center transition-all">

            <button 
                onClick={goBack}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xs flex items-center gap-1 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-10"
            >
                <ArrowRight className="w-4 h-4 rotate-180" /> {t.back}
            </button>

            <div className="relative inline-block mb-6 animate-in zoom-in duration-500">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl shadow-lg flex items-center justify-center text-white bg-gradient-to-br ${currentTheme === 'plush' || currentTheme === 'music' ? 'rounded-full' : ''} ${subStyle?.gradient || 'from-slate-400 to-slate-500'}`}>
                    {subStyle && <subStyle.icon className="w-10 h-10 sm:w-12 sm:h-12" />}
                </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">
                {subjectName} {t.trainingFor}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs text-sm sm:text-base">
                {t.whatTopic}
            </p>

            <div className="w-full max-w-sm space-y-4">
                
                {/* Source Toggle */}
                <div className={`flex p-1 rounded-xl mb-2 border ${currentTheme === 'plush' ? 'bg-orange-50 border-rose-100' : (currentTheme === 'music' ? 'bg-violet-50 border-violet-100' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700')}`}>
                    <button 
                        onClick={() => setSourceMode('topic')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                            sourceMode === 'topic' 
                            ? (currentTheme === 'plush' ? 'bg-white text-rose-400 shadow-sm' : (currentTheme === 'music' ? 'bg-white text-violet-500 shadow-sm' : (currentTheme === 'christmas' ? 'bg-white text-red-600 shadow-sm' : 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-300 shadow-sm')))
                            : 'text-slate-400'
                        }`}
                    >
                        {t.topic}
                    </button>
                    <button 
                        onClick={() => setSourceMode('notes')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                            sourceMode === 'notes' 
                            ? (currentTheme === 'plush' ? 'bg-white text-rose-400 shadow-sm' : (currentTheme === 'music' ? 'bg-white text-violet-500 shadow-sm' : (currentTheme === 'christmas' ? 'bg-white text-red-600 shadow-sm' : 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-300 shadow-sm')))
                            : 'text-slate-400'
                        }`}
                    >
                        {t.fromNotes}
                    </button>
                </div>

                {/* Input Area */}
                {sourceMode === 'topic' ? (
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Pencil className={`h-5 w-5 transition-colors ${currentTheme === 'plush' ? 'text-rose-200 group-focus-within:text-rose-400' : (currentTheme === 'music' ? 'text-violet-200 group-focus-within:text-violet-400' : (currentTheme === 'christmas' ? 'text-slate-400 group-focus-within:text-red-500' : 'text-slate-400 group-focus-within:text-violet-500'))}`} />
                        </div>
                        <input
                            type="text"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            placeholder={t.topicPlaceholder}
                            className={`block w-full pl-12 pr-4 py-3 sm:py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none transition-all font-bold text-base sm:text-lg shadow-sm ${
                                currentTheme === 'plush' 
                                ? 'border-dashed border-rose-200 rounded-full focus:border-rose-400 focus:ring-4 focus:ring-rose-50' :
                                currentTheme === 'music'
                                ? 'border-violet-200 rounded-full focus:border-violet-400 focus:ring-4 focus:ring-violet-50' :
                                currentTheme === 'christmas' 
                                ? 'focus:border-red-400 focus:ring-4 focus:ring-red-50'
                                : 'focus:border-violet-400 focus:ring-4 focus:ring-violet-50 dark:focus:ring-violet-900/20'
                            }`}
                            autoFocus
                        />
                    </div>
                ) : (
                    <div className="relative group">
                        <textarea
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            placeholder={t.pasteNotes}
                            className={`block w-full p-4 h-32 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none transition-all font-medium text-sm shadow-sm resize-none ${
                                currentTheme === 'plush' 
                                ? 'border-dashed border-rose-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-50' :
                                currentTheme === 'music'
                                ? 'border-violet-200 focus:border-violet-400 focus:ring-4 focus:ring-violet-50' :
                                currentTheme === 'christmas'
                                ? 'focus:border-red-400 focus:ring-4 focus:ring-red-50'
                                : 'focus:border-violet-400 focus:ring-4 focus:ring-violet-50 dark:focus:ring-violet-900/20'
                            }`}
                            autoFocus
                        />
                    </div>
                )}
                
                {/* Difficulty Selector */}
                <div className={`p-1.5 rounded-2xl flex items-center justify-between gap-1 border ${currentTheme === 'plush' ? 'bg-orange-50 border-rose-100' : (currentTheme === 'music' ? 'bg-violet-50 border-violet-100' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700')}`}>
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                                difficulty === level 
                                    ? (level === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shadow-sm' : level === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 shadow-sm' : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 shadow-sm')
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                            }`}
                        >
                            {(t as any)[level]}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                         {t.difficulty}: <span className={`${difficulty === 'easy' ? 'text-green-500' : difficulty === 'medium' ? 'text-amber-500' : 'text-rose-500'}`}>{(t as any)[difficulty]}</span>
                    </span>
                    <span className="text-slate-300 text-[10px]">•</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                        {sourceMode === 'notes' ? t.fromNotes : (customTopic ? t.specificTopic : t.randomTopic)}
                    </span>
                </div>

                {/* Main Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={startExercise}
                        disabled={sourceMode === 'notes' && !customTopic.trim()}
                        className={`w-full py-3 sm:py-4 text-white font-bold rounded-2xl shadow-lg dark:shadow-none hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 text-base sm:text-lg disabled:opacity-50 disabled:shadow-none ${getButtonClass()} ${currentTheme === 'plush' || currentTheme === 'music' ? 'rounded-full' : ''}`}
                    >
                        <Play className="w-5 h-5 fill-white" />
                        {t.startQuiz}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // VIEW: EXERCISE (Loading & Question)
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300 relative transition-all">
      <button 
        onClick={goBack}
        className="absolute top-2 sm:top-4 left-2 sm:left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xs flex items-center gap-1 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors z-20"
      >
        <ArrowRight className="w-3 h-3 rotate-180" /> {t.quit}
      </button>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-8">
                <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${currentTheme === 'plush' ? 'bg-rose-200' : (currentTheme === 'music' ? 'bg-violet-200' : (currentTheme === 'christmas' ? 'bg-red-200' : 'bg-violet-200 dark:bg-violet-900/30'))}`}></div>
                <Loader2 className={`w-16 h-16 sm:w-20 sm:h-20 animate-spin relative z-10 ${currentTheme === 'plush' ? 'text-rose-400' : (currentTheme === 'music' ? 'text-violet-500' : (currentTheme === 'christmas' ? 'text-red-600' : 'text-violet-600 dark:text-violet-400'))}`} />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-200 animate-pulse mb-2">
                {t.creatingQuiz}
            </h3>
            <div className={`px-4 py-2 rounded-xl border font-medium text-sm flex items-center gap-2 ${currentTheme === 'plush' ? 'bg-orange-50 border-rose-100 text-stone-500' : (currentTheme === 'music' ? 'bg-violet-50 border-violet-100 text-violet-500' : 'bg-white/50 dark:bg-slate-700/50 border-white/50 dark:border-slate-600 text-slate-500 dark:text-slate-400')}`}>
                <Gauge className="w-4 h-4" />
                <span>{(t as any)[difficulty]}</span>
            </div>
        </div>
      ) : exercise ? (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar px-3 sm:px-6 pt-12 sm:pt-16 pb-4">
            {/* Question Card */}
            <div className={`backdrop-blur-sm rounded-[2rem] p-5 sm:p-6 shadow-xl border mb-6 relative animate-in slide-in-from-right-8 ${
                currentTheme === 'plush'
                ? 'bg-[#fffbf7] border-4 border-rose-100 shadow-rose-100 rounded-[2.5rem]' :
                currentTheme === 'music'
                ? 'bg-[#fdfaff] border-2 border-violet-100 shadow-violet-100 rounded-[2.5rem]' :
                currentTheme === 'christmas' 
                ? 'bg-white/90 border-red-100 shadow-red-100'
                : (currentTheme === 'chalkboard' ? 'bg-[#333] border-[#555] shadow-black' : (currentTheme === 'exam' ? 'bg-white border-2 border-black shadow-none' : 'bg-white/80 dark:bg-slate-800/80 shadow-slate-200/50 dark:shadow-none border-white dark:border-slate-700'))
            }`}>
                
                {/* Meta Header */}
                <div className="flex justify-between items-start mb-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border truncate max-w-[200px] ${
                        currentTheme === 'plush'
                        ? 'bg-rose-100 text-rose-500 border-rose-200' :
                        currentTheme === 'music'
                        ? 'bg-violet-100 text-violet-600 border-violet-200' :
                        currentTheme === 'christmas' 
                        ? 'bg-gradient-to-r from-red-50 to-amber-50 text-red-700 border-red-100'
                        : 'bg-gradient-to-r from-violet-100 to-fuchsia-100 dark:from-violet-900/30 dark:to-fuchsia-900/30 text-violet-700 dark:text-violet-300 border-white dark:border-slate-700'
                    }`}>
                        {exercise.topic.substring(0, 30)}{exercise.topic.length > 30 ? '...' : ''}
                    </span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${exercise.difficulty === 'Leicht' || exercise.difficulty === 'Easy' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : (exercise.difficulty === 'Mittel' || exercise.difficulty === 'Medium') ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'}`}>
                        {exercise.difficulty}
                    </span>
                </div>

                {/* Optional Image */}
                {exercise.imageUrl && !imageError && exercise.type !== 'flashcard' && (
                    <div className="mb-6 rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-700 max-h-40 sm:max-h-48 relative bg-slate-50 dark:bg-slate-900">
                        <img 
                            src={exercise.imageUrl} 
                            alt="Visual aid"
                            className="w-full h-full object-contain"
                            onError={() => setImageError(true)}
                        />
                         <div className="absolute bottom-1 right-2 text-[8px] text-slate-400 bg-white/80 dark:bg-slate-900/80 px-1 rounded">Image source may be subject to copyright</div>
                    </div>
                )}
                
                {/* Standard Question Text (Except for Flashcards which have unique layout) */}
                {exercise.type !== 'flashcard' && (
                    <h3 className={`text-lg sm:text-2xl font-bold leading-snug mb-2 ${currentTheme === 'plush' ? 'text-stone-700' : (currentTheme === 'music' ? 'text-violet-700' : (currentTheme === 'chalkboard' ? 'text-white' : 'text-slate-800 dark:text-slate-100'))}`}>
                        {exercise.question}
                    </h3>
                )}
                
                {/* Hint Button (Not for flashcards usually, or maybe yes?) */}
                <button 
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors mt-2"
                >
                    <Lightbulb className={`w-4 h-4 ${showHint ? 'fill-amber-500' : ''}`} />
                    {showHint ? t.hintHide : t.hintBtn}
                </button>

                {/* Hint Display */}
                {showHint && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-medium border border-amber-100 dark:border-amber-800 animate-in fade-in slide-in-from-top-2">
                        💡 {exercise.hint}
                    </div>
                )}
            </div>

            {/* Interaction Area based on Type */}
            {renderExerciseContent()}

            {/* Feedback & Actions */}
            {showResult ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500 mt-auto">
                    {/* Feedback only shows for non-flashcards */}
                    {exercise.type !== 'flashcard' ? (
                         <div className={`p-5 sm:p-6 rounded-3xl border mb-6 ${
                             isCorrect() ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800'
                         }`}>
                            <h4 className={`font-black text-lg mb-2 flex items-center gap-2 ${
                                isCorrect() ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                            }`}>
                                {isCorrect() ? <><Sparkles className="w-5 h-5"/> {t.correct}</> : t.incorrect}
                            </h4>
                            <p className={`text-sm sm:text-base font-medium leading-relaxed ${
                                isCorrect() ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'
                            }`}>
                                {exercise.explanation}
                            </p>
                        </div>
                    ) : (
                         // Simple flashcard explanation
                         <div className="p-5 sm:p-6 rounded-3xl border mb-6 bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700">
                             <h4 className="font-black text-lg mb-2 text-slate-700 dark:text-slate-200">Explanation</h4>
                             <p className="text-slate-600 dark:text-slate-400 text-sm">{exercise.explanation}</p>
                         </div>
                    )}
                   
                    <button 
                        onClick={nextQuestion}
                        className={`w-full py-4 sm:py-5 text-white font-bold rounded-2xl shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-base sm:text-lg ${
                            currentTheme === 'plush' ? 'bg-stone-700 rounded-full' : (currentTheme === 'music' ? 'bg-violet-600 rounded-full' : (currentTheme === 'exam' ? 'bg-black text-white hover:bg-gray-800' : 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-700'))
                        }`}
                    >
                        <RefreshCcw className="w-5 h-5" /> {t.nextQuestion}
                    </button>
                </div>
            ) : (
                <button 
                    onClick={checkAnswer}
                    // Disable check if no input provided. Flashcards (Reveal) are never disabled.
                    disabled={
                        ((exercise.type === 'multiple-choice' || exercise.type === 'true-false') && !selectedAnswer) ||
                        (exercise.type === 'fill-blank' && !fillInput.trim())
                    }
                    className={`w-full py-4 sm:py-5 text-white font-bold rounded-2xl shadow-xl disabled:opacity-50 disabled:shadow-none hover:-translate-y-1 transition-all mt-auto text-base sm:text-lg ${getButtonClass()} ${currentTheme === 'plush' || currentTheme === 'music' ? 'rounded-full' : ''}`}
                >
                    {exercise.type === 'flashcard' ? t.revealCard : t.checkAnswer}
                </button>
            )}
        </div>
      ) : null}
    </div>
  );
};

export default ExerciseHub;
