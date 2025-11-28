
import React, { useState } from 'react';
import { generatePracticeQuestion } from '../services/geminiService';
import { GradeLevel, Exercise, Language, TRANSLATIONS } from '../types';
import { BookOpen, Calculator, Languages, FlaskConical, History, BrainCircuit, ArrowRight, RefreshCcw, Check, X as XIcon, Loader2, Sparkles, Play, Pencil, Lightbulb, Image as ImageIcon } from 'lucide-react';

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
  
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [imageError, setImageError] = useState(false);

  const t = TRANSLATIONS[language];

  const handleSubjectSelect = (subjectId: string) => {
    setSelectedSubject(subjectId);
    setViewState('config');
    setCustomTopic(''); // Reset topic
  };

  const startExercise = async () => {
    if (!selectedSubject) return;

    setViewState('exercise');
    setExercise(null);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowHint(false);
    setImageError(false);
    setLoading(true);

    try {
      // Add timeout race condition to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 15000)
      );
      
      // Determine the correctly translated subject name for the API
      // If language is English, send 'Math' instead of 'Mathematik'
      const subStyle = getSubjectStyle(selectedSubject);
      const apiSubject = language === 'en' 
        ? (TRANSLATIONS.en as any)[subStyle?.translationKey || ''] || selectedSubject
        : selectedSubject;

      const data = await Promise.race([
          generatePracticeQuestion(apiSubject, gradeLevel, customTopic, language),
          timeoutPromise
      ]) as Exercise;

      setExercise(data);
    } catch (error) {
      console.error(error);
      alert(language === 'en' ? "Failed to generate a valid question. Please try again." : "Konnte keine Frage generieren. Bitte versuche es erneut.");
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
    if (selectedAnswer) setShowResult(true);
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

  // VIEW: SELECTION
  if (viewState === 'selection') {
    return (
      <div className="animate-in slide-in-from-bottom-4 duration-500 h-full flex flex-col p-4 sm:p-6">
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
        <div className="h-full flex flex-col animate-in zoom-in-95 duration-300 relative p-4 sm:p-6 items-center justify-center text-center">
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
            <p className="text-slate-500 mb-8 max-w-xs text-sm sm:text-base">
                {t.whatTopic}
            </p>

            <div className="w-full max-w-sm space-y-4">
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
                
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {customTopic ? t.specificTopic : t.randomTopic}
                </p>

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
    <div className="h-full flex flex-col animate-in fade-in duration-300 relative">
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
            <div className="bg-white/50 px-4 py-2 rounded-xl border border-white/50 text-slate-500 font-medium text-sm">
                {t.topic}: {customTopic || "Random"}
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
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${exercise.difficulty === 'Leicht' ? 'text-green-600 bg-green-50 border-green-100' : exercise.difficulty === 'Mittel' ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                        {exercise.difficulty}
                    </span>
                </div>

                {/* Optional Image */}
                {exercise.imageUrl && !imageError && (
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
                
                {/* Image Placeholder if Error or No Image provided by AI but topic is visual */}
                {(!exercise.imageUrl || imageError) && ['Geometrie', 'Kunst', 'Biologie', 'Geometry', 'Art', 'Biology'].some(k => exercise.topic.includes(k) || exercise.subject.includes(k)) && (
                     <div className="mb-6 h-20 sm:h-24 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-300 gap-2">
                        <ImageIcon className="w-5 h-5" />
                        <span className="text-xs font-bold">{t.noImage}</span>
                    </div>
                )}

                <h3 className="text-lg sm:text-2xl font-bold text-slate-800 leading-snug mb-2">
                    {exercise.question}
                </h3>
                
                {/* Hint Button */}
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

            {/* Options */}
            <div className="space-y-3 mb-6">
                {exercise.options.map((option, idx) => {
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

            {/* Feedback & Actions */}
            {showResult ? (
                <div className="animate-in slide-in-from-bottom-4 duration-500 mt-auto">
                    <div className={`p-5 sm:p-6 rounded-3xl border mb-6 ${selectedAnswer === exercise.correctAnswer ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                        <h4 className={`font-black text-lg mb-2 flex items-center gap-2 ${selectedAnswer === exercise.correctAnswer ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {selectedAnswer === exercise.correctAnswer ? <><Sparkles className="w-5 h-5"/> {t.correct}</> : t.incorrect}
                        </h4>
                        <p className={`text-sm sm:text-base font-medium leading-relaxed ${selectedAnswer === exercise.correctAnswer ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {exercise.explanation}
                        </p>
                    </div>
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
                    disabled={!selectedAnswer}
                    className="w-full py-4 sm:py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-200 disabled:opacity-50 disabled:shadow-none hover:shadow-fuchsia-300 hover:-translate-y-1 transition-all mt-auto text-base sm:text-lg"
                >
                    {t.checkAnswer}
                </button>
            )}
        </div>
      ) : null}
    </div>
  );
};

export default ExerciseHub;
