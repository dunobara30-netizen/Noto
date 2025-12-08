
import React, { useState, useRef } from 'react';
import { generatePracticeQuestion } from '../services/geminiService';
import { GradeLevel, Exercise, Language, TRANSLATIONS, Difficulty } from '../types';
import { BookOpen, Calculator, Languages, FlaskConical, History, BrainCircuit, ArrowRight, RefreshCcw, Check, X as XIcon, Loader2, Sparkles, Play, Pencil, Lightbulb, Image as ImageIcon, Gauge, RotateCcw } from 'lucide-react';

interface ExerciseHubProps {
  gradeLevel: GradeLevel;
  language: Language;
}

const subjects = [
  { id: 'Mathematik', translationKey: 'Math', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', gradient: 'from-blue-400 to-cyan-400' },
  { id: 'Deutsch', translationKey: 'German', icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', gradient: 'from-amber-400 to-orange-400' },
  { id: 'Englisch', translationKey: 'English', icon: Languages, color: 'text-violet-500', bg: 'bg-violet-50', border: 'border-violet-200', gradient: 'from-violet-400 to-fuchsia-400' },
  { id: 'Biologie', translationKey: 'Biology', icon: FlaskConical, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', gradient: 'from-emerald-400 to-teal-400' },
  { id: 'Geschichte', translationKey: 'History', icon: History, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', gradient: 'from-rose-400 to-pink-400' },
];

const ExerciseHub: React.FC<ExerciseHubProps> = ({ gradeLevel, language }) => {
  // State: 'selection' -> 'config' -> 'exercise'
  const [viewState, setViewState] = useState<'selection' | 'config' | 'exercise'>('selection');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Interaction State
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [fillInput, setFillInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false); // For Flashcards
  
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const t = TRANSLATIONS[language];

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setViewState('config');
    setCustomTopic(''); // Reset topic
    setDifficulty('medium'); // Reset difficulty
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

      const data = await Promise.race([
          generatePracticeQuestion(apiSubject, gradeLevel, customTopic, language, difficulty),
          timeoutPromise
      ]) as Exercise;

      setExercise(data);
    } catch (error) {
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
      
      // Flashcards are self-graded basically
      if (exercise.type === 'flashcard') return true; 
      
      const cleanAnswer = exercise.correctAnswer.trim().toLowerCase();
      
      if (exercise.type === 'fill-blank') {
          return fillInput.trim().toLowerCase() === cleanAnswer;
      }
      
      if (exercise.type === 'true-false') {
          // Map "Wahr" -> "true", "True" -> "true", "False" -> "false", "Falsch" -> "false"
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

  // RENDER HELPERS
  const renderExerciseContent = () => {
    if (!exercise) return null;

    switch (exercise.type) {
        case 'multiple-choice':
            return (
                <div className="space-y-3 mb-6">
                    {exercise.options?.map((option, idx) => {
                        let btnClass = "bg-white border-2 border-slate-100 text-slate-600 hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-700";
                        if (selectedAnswer === option) {
                            btnClass = "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200 transform scale-[1.02]";
                        }
                        if (showResult) {
                            if (option === exercise.correctAnswer) {
                                btnClass = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 ring-4 ring-emerald-100";
                            } else if (option === selectedAnswer && selectedAnswer !== exercise.correctAnswer) {
                                btnClass = "bg-rose-500 border-rose-500 text-white opacity-50";
                            } else {
                                btnClass = "bg-slate-50 border-slate-100 text-slate-300 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleAnswerClick(option)}
                                disabled={showResult}
                                className={`w-full p-4 sm:p-5 rounded-2xl text-left font-bold transition-all duration-200 flex items-center justify-between group ${btnClass}`}
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
                        let btnClass = "bg-white border-2 border-slate-100 text-slate-600 hover:border-violet-200";

                        if (isSelected) btnClass = "bg-violet-600 border-violet-600 text-white";
                        
                        if (showResult) {
                            // Robust comparison
                            const mapBool = (val: string) => {
                                const v = val.toLowerCase();
                                return (v === 'wahr' || v === 'true');
                            };
                            
                            const isOptionCorrect = mapBool(localizedOption) === mapBool(exercise.correctAnswer);
                            
                            if (isOptionCorrect) {
                                btnClass = "bg-emerald-500 border-emerald-500 text-white ring-4 ring-emerald-100";
                            } else if (isSelected && !isOptionCorrect) {
                                btnClass = "bg-rose-500 border-rose-500 text-white opacity-50";
                            } else {
                                btnClass = "bg-slate-50 border-slate-100 text-slate-300 opacity-50";
                            }
                        }

                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswerClick(localizedOption)}
                                disabled={showResult}
                                className={`flex-1 p-6 rounded-2xl font-black text-xl transition-all ${btnClass}`}
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
                                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                                        : 'border-rose-500 bg-rose-50 text-rose-700')
                                    : 'border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-slate-700'
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
                         <div className="mt-2 text-sm font-bold text-slate-500">
                             Correct: <span className="text-emerald-600">{exercise.correctAnswer}</span>
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
                        <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-100 rounded-3xl shadow-lg flex flex-col items-center justify-center p-6 text-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Question / Term</span>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-800">{exercise.question}</h3>
                            <span className="absolute bottom-4 text-xs font-bold text-violet-500 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> {t.revealCard}
                            </span>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 backface-hidden bg-violet-600 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-6 text-center" style={{ transform: 'rotateY(180deg)' }}>
                            <span className="text-xs font-bold text-violet-200 uppercase tracking-widest mb-4">Answer</span>
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
      <div className="animate-in slide-in-from-bottom-4 duration-500 h-full flex flex-col p-4 sm:p-6 transition-all">
        <div className="mb-6 text-center space-y-2 mt-2 sm:mt-6">
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center gap-2">
                <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8 text-violet-500" />
                {t.studyHub}
            </h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base">{t.chooseSubject}</p>
        </div>

        {/* 1 Column on Mobile, 2 on MD, 3 on LG - Fixes "squeezed" look */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 overflow-y-auto pb-24 px-1 custom-scrollbar">
          {subjects.map((sub, idx) => (
            <button
              key={sub.id}
              onClick={() => handleSubjectSelect(sub.id)}
              className={`p-6 sm:p-8 rounded-[2rem] border-2 shadow-sm hover:shadow-xl transition-all duration-300 group text-left relative overflow-hidden bg-white border-slate-100 hover:border-violet-200 hover:-translate-y-1 active:scale-95`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Vibrant Background Blob */}
              <div className={`absolute -right-8 -bottom-8 w-32 h-32 sm:w-40 sm:h-40 rounded-full opacity-10 bg-gradient-to-br ${sub.gradient} group-hover:scale-125 transition-transform duration-500`}></div>
              
              <div className="flex items-start justify-between relative z-10">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-sm flex items-center justify-center mb-4 text-white bg-gradient-to-br ${sub.gradient}`}>
                    <sub.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>
                  <div className="bg-slate-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    {gradeLevel}
                  </div>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 relative z-10">
                {(t as any)[sub.translationKey] || sub.id}
              </h3>
              <p className="text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-violet-500 transition-colors">
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
      const subjectName = (t as any)[subStyle?.translationKey || ''] || selectedSubject;
      
      return (
        <div className="h-full flex flex-col animate-in zoom-in-95 duration-300 relative p-4 sm:p-6 items-center justify-center text-center transition-all">
            <button 
                onClick={goBack}
                className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 font-bold text-xs flex items-center gap-1 p-2 rounded-xl hover:bg-slate-100 transition-colors z-10"
            >
                <ArrowRight className="w-4 h-4 rotate-180" /> {t.back}
            </button>

            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl shadow-lg flex items-center justify-center mb-6 text-white bg-gradient-to-br ${subStyle?.gradient || 'from-slate-400 to-slate-500'} animate-in zoom-in duration-500`}>
                {subStyle && <subStyle.icon className="w-10 h-10 sm:w-12 sm:h-12" />}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2">
                {subjectName} {t.trainingFor}
            </h2>
            <p className="text-slate-500 mb-6 max-w-xs text-sm sm:text-base">
                {t.whatTopic}
            </p>

            <div className="w-full max-w-sm space-y-4">
                
                {/* Topic Input */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Pencil className="h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder={t.topicPlaceholder}
                        className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 placeholder-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-50 outline-none transition-all font-bold text-base sm:text-lg shadow-sm"
                        autoFocus
                    />
                </div>
                
                {/* Difficulty Selector */}
                <div className="bg-slate-50 p-1.5 rounded-2xl flex items-center justify-between gap-1 border border-slate-100">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                        <button
                            key={level}
                            onClick={() => setDifficulty(level)}
                            className={`flex-1 py-2 px-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                                difficulty === level 
                                    ? (level === 'easy' ? 'bg-green-100 text-green-700 shadow-sm' : level === 'medium' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'bg-rose-100 text-rose-700 shadow-sm')
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                            }`}
                        >
                            {(t as any)[level]}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                         {t.difficulty}: <span className={`${difficulty === 'easy' ? 'text-green-500' : difficulty === 'medium' ? 'text-amber-500' : 'text-rose-500'}`}>{(t as any)[difficulty]}</span>
                    </span>
                    <span className="text-slate-300 text-[10px]">•</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {customTopic ? t.specificTopic : t.randomTopic}
                    </span>
                </div>

                <button
                    onClick={startExercise}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-2 text-base sm:text-lg"
                >
                    <Play className="w-5 h-5 fill-white" />
                    {t.startQuiz}
                </button>
            </div>
        </div>
      );
  }

  // VIEW: EXERCISE (Loading & Question)
  return (
    <div className="h-full flex flex-col animate-in fade-in duration-300 relative transition-all">
      <button 
        onClick={goBack}
        className="absolute top-2 sm:top-4 left-2 sm:left-4 text-slate-400 hover:text-slate-600 font-bold text-xs flex items-center gap-1 p-2 rounded-lg hover:bg-slate-100 transition-colors z-20"
      >
        <ArrowRight className="w-3 h-3 rotate-180" /> {t.quit}
      </button>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-violet-200 rounded-full blur-2xl animate-pulse"></div>
                <Loader2 className="w-16 h-16 sm:w-20 sm:h-20 text-violet-600 animate-spin relative z-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-700 animate-pulse mb-2">
                {t.creatingQuiz}
            </h3>
            <div className="bg-white/50 px-4 py-2 rounded-xl border border-white/50 text-slate-500 font-medium text-sm flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                <span>{(t as any)[difficulty]}</span>
            </div>
        </div>
      ) : exercise ? (
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar px-3 sm:px-6 pt-12 sm:pt-16 pb-4">
            {/* Question Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-5 sm:p-6 shadow-xl shadow-slate-200/50 border border-white mb-6 relative animate-in slide-in-from-right-8">
                
                {/* Meta Header */}
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-gradient-to-r from-violet-100 to-fuchsia-100 text-violet-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white">
                        {exercise.topic}
                    </span>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${exercise.difficulty === 'Leicht' || exercise.difficulty === 'Easy' ? 'text-green-600 bg-green-50 border-green-100' : (exercise.difficulty === 'Mittel' || exercise.difficulty === 'Medium') ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                        {exercise.difficulty}
                    </span>
                </div>

                {/* Optional Image */}
                {exercise.imageUrl && !imageError && exercise.type !== 'flashcard' && (
                    <div className="mb-6 rounded-2xl overflow-hidden shadow-md border border-slate-100 max-h-40 sm:max-h-48 relative bg-slate-50">
                        <img 
                            src={exercise.imageUrl} 
                            alt="Visual aid"
                            className="w-full h-full object-contain"
                            onError={() => setImageError(true)}
                        />
                         <div className="absolute bottom-1 right-2 text-[8px] text-slate-400 bg-white/80 px-1 rounded">Image source may be subject to copyright</div>
                    </div>
                )}
                
                {/* Standard Question Text (Except for Flashcards which have unique layout) */}
                {exercise.type !== 'flashcard' && (
                    <h3 className="text-lg sm:text-2xl font-bold text-slate-800 leading-snug mb-2">
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
                    <div className="mt-3 p-3 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium border border-amber-100 animate-in fade-in slide-in-from-top-2">
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
                             isCorrect() ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                         }`}>
                            <h4 className={`font-black text-lg mb-2 flex items-center gap-2 ${
                                isCorrect() ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                                {isCorrect() ? <><Sparkles className="w-5 h-5"/> {t.correct}</> : t.incorrect}
                            </h4>
                            <p className={`text-sm sm:text-base font-medium leading-relaxed ${
                                isCorrect() ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                                {exercise.explanation}
                            </p>
                        </div>
                    ) : (
                         // Simple flashcard explanation
                         <div className="p-5 sm:p-6 rounded-3xl border mb-6 bg-slate-50 border-slate-100">
                             <h4 className="font-black text-lg mb-2 text-slate-700">Explanation</h4>
                             <p className="text-slate-600 text-sm">{exercise.explanation}</p>
                         </div>
                    )}
                   
                    <button 
                        onClick={nextQuestion}
                        className="w-full py-4 sm:py-5 bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-300 hover:bg-slate-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-base sm:text-lg"
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
                    className="w-full py-4 sm:py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-200 disabled:opacity-50 disabled:shadow-none hover:shadow-fuchsia-300 hover:-translate-y-1 transition-all mt-auto text-base sm:text-lg"
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
