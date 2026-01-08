
import React, { useState, useCallback } from 'react';
import { generatePracticeQuestion } from '../services/geminiService';
import { GradeLevel, Exercise, Language, TRANSLATIONS, Difficulty } from '../types';
import { BookOpen, Calculator, Languages, FlaskConical, History, BrainCircuit, ArrowRight, Loader2, Play, CheckCircle, RotateCcw, XCircle, Send } from 'lucide-react';

interface ExerciseHubProps {
  gradeLevel: GradeLevel;
  language: Language;
  onComplete: (correct: boolean, difficulty: Difficulty) => void;
}

const subjects = [
  { id: 'Mathematik', translationKey: 'Math', icon: Calculator, accent: 'text-accent', bg: 'bg-accent/5' },
  { id: 'Deutsch', translationKey: 'German', icon: BookOpen, accent: 'text-rose-500', bg: 'bg-rose-500/5' },
  { id: 'Englisch', translationKey: 'English', icon: Languages, accent: 'text-indigo-500', bg: 'bg-indigo-500/5' },
  { id: 'Biologie', translationKey: 'Biology', icon: FlaskConical, accent: 'text-emerald-600', bg: 'bg-emerald-600/5' },
  { id: 'Geschichte', translationKey: 'History', icon: History, accent: 'text-amber-700', bg: 'bg-amber-700/5' },
];

const ExerciseHub: React.FC<ExerciseHubProps> = ({ gradeLevel, language, onComplete }) => {
  const [viewState, setViewState] = useState<'selection' | 'config' | 'exercise' | 'result'>('selection');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [customTopic, setCustomTopic] = useState('');
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  
  // User Inputs
  const [textInput, setTextInput] = useState('');
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);

  const t = TRANSLATIONS[language];

  const handleSubjectSelect = (id: string) => { setSelectedSubject(id); setViewState('config'); };

  const startExercise = async () => {
    setViewState('exercise');
    setLoading(true);
    setTextInput('');
    setMultiSelect([]);
    try {
      const data = await generatePracticeQuestion(selectedSubject!, gradeLevel, customTopic, language, difficulty);
      setExercise(data);
    } catch (error) {
      alert(language === 'de' ? "Fehler beim Erstellen der Übung" : "Error generating session");
      setViewState('selection');
    } finally { setLoading(false); }
  };

  const checkAnswer = useCallback(() => {
    if (!exercise) return;
    
    let correct = false;
    
    if (exercise.type === 'multiple-choice') {
      // Logic handled by direct click
      return;
    } else if (exercise.type === 'text-input') {
      const userVal = textInput.trim().toLowerCase();
      const correctVal = String(exercise.correctAnswer).toLowerCase();
      correct = userVal === correctVal;
    } else if (exercise.type === 'multi-select') {
      const correctAnswers = Array.isArray(exercise.correctAnswer) ? exercise.correctAnswer : [exercise.correctAnswer];
      correct = multiSelect.length === correctAnswers.length && multiSelect.every(v => correctAnswers.includes(v));
    }

    setIsCorrect(correct);
    onComplete(correct, difficulty);
    setViewState('result');
  }, [exercise, textInput, multiSelect, onComplete, difficulty]);

  const handleMCOption = (opt: string) => {
    const correct = opt === exercise?.correctAnswer;
    setIsCorrect(correct);
    onComplete(correct, difficulty);
    setViewState('result');
  };

  const toggleMultiSelect = (opt: string) => {
    setMultiSelect(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
  };

  if (viewState === 'selection') {
    return (
      <div className="h-full flex flex-col animate-in fade-in duration-700">
        <div className="mb-12 text-center space-y-4">
            <h2 className="text-4xl font-black flex items-center justify-center gap-4 text-human-charcoal dark:text-warm-white tracking-tighter"><BrainCircuit className="w-10 h-10 text-accent" /> {t.studyHub}</h2>
            <p className="text-human-stone/60 dark:text-warm-gray font-black tracking-[0.4em] uppercase text-[10px]">{t.chooseSubject}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {subjects.map((sub) => (
            <button key={sub.id} onClick={() => handleSubjectSelect(sub.id)} className="p-8 rounded-[2.5rem] bg-canvas-surface dark:bg-white/5 border border-accent/10 hover:border-accent/40 transition-all group relative overflow-hidden text-left hover:-translate-y-2 shadow-soft">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-accent/5 ${sub.bg} ${sub.accent} shadow-inner transition-transform group-hover:scale-110`}><sub.icon className="w-8 h-8" /></div>
              <h3 className="text-xl font-black mb-3 text-human-charcoal dark:text-warm-white tracking-tight">{(t as any)[sub.translationKey]}</h3>
              <div className="flex items-center gap-3 text-[10px] font-black text-human-stone/40 uppercase tracking-widest group-hover:text-accent transition-colors">
                {t.start} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (viewState === 'config') {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-10 space-y-12 animate-in zoom-in-95 duration-500">
            <div className="space-y-4">
              <h2 className="text-5xl font-black text-human-charcoal dark:text-warm-white tracking-tighter">{(t as any)[subjects.find(s => s.id === selectedSubject)?.translationKey || 'Math']}</h2>
              <p className="text-accent font-black tracking-[0.5em] uppercase text-[10px]">{t.trainingFor}</p>
            </div>
            
            <div className="w-full max-w-sm space-y-8">
                <div className="space-y-4 text-left">
                  <label className="text-[11px] font-black text-human-stone uppercase tracking-[0.2em] ml-1">{t.difficulty}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                        <button key={d} onClick={() => setDifficulty(d)} className={`py-4 rounded-2xl font-black text-[11px] transition-all border uppercase tracking-widest ${difficulty === d ? 'bg-accent text-white border-accent shadow-elevated' : 'bg-canvas-muted text-human-stone border-accent/10'}`}>{(t as any)[d]}</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <label className="text-[11px] font-black text-human-stone uppercase tracking-[0.2em] ml-1">{t.topicPlaceholder}</label>
                  <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder={t.topicPlaceholder} className="w-full p-5 rounded-2xl border-2 border-accent/10 bg-canvas-muted dark:bg-espresso/50 outline-none font-bold text-lg text-human-charcoal dark:text-warm-white focus:border-accent shadow-inner transition-all" />
                </div>
                
                <button onClick={startExercise} className="w-full py-6 bg-accent text-white font-black rounded-[2rem] flex items-center justify-center gap-4 text-xl shadow-elevated hover:scale-[1.02] transition-all group active:scale-95">
                  <Play className="w-6 h-6 fill-white" /> {t.startQuiz}
                </button>
                <button onClick={() => setViewState('selection')} className="text-human-clay font-black hover:text-rose-500 transition-colors uppercase text-[10px] tracking-widest">{t.cancel}</button>
            </div>
        </div>
      );
  }

  if (viewState === 'result') {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-10 animate-in zoom-in-95 duration-500">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl ${isCorrect ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                {isCorrect ? <CheckCircle className="w-12 h-12 text-emerald-500" /> : <XCircle className="w-12 h-12 text-rose-500" />}
            </div>
            <h2 className="text-4xl font-black mb-2 text-human-charcoal dark:text-warm-white tracking-tighter">{isCorrect ? t.sessionComplete : t.wrongAnswer}</h2>
            <p className={`font-black mb-12 text-lg ${isCorrect ? 'text-accent' : 'text-rose-500'}`}>
                {isCorrect ? `+${difficulty === 'easy' ? 100 : difficulty === 'medium' ? 150 : 200}` : '-10'} {t.xpLabel}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button onClick={startExercise} className="flex-1 py-5 bg-accent text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-elevated hover:scale-105 transition-all">
                    <RotateCcw className="w-5 h-5" /> {t.nextExercise}
                </button>
                <button onClick={() => setViewState('selection')} className="flex-1 py-5 bg-canvas-muted dark:bg-white/5 text-human-charcoal dark:text-warm-white border border-accent/10 font-black rounded-2xl hover:bg-white transition-all">
                    {t.returnHub}
                </button>
            </div>
            {exercise?.explanation && <div className="mt-8 p-6 bg-canvas-muted dark:bg-white/5 rounded-3xl text-sm font-medium text-human-stone max-w-md border border-accent/10 italic">"{exercise.explanation}"</div>}
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full items-center justify-center p-10">
        {loading ? (
          <div className="flex flex-col items-center gap-10">
            <Loader2 className="w-20 h-20 animate-spin text-accent" />
            <p className="text-accent font-black animate-pulse tracking-[0.4em] uppercase text-[10px]">{t.creatingQuiz}</p>
          </div>
        ) : (
        <div className="w-full max-w-2xl premium-glass rounded-[3rem] p-12 border border-accent/20 space-y-12 shadow-elevated animate-in fade-in zoom-in-98 duration-500">
            <div className="space-y-6 text-center">
              <span className="text-[10px] font-black uppercase text-accent tracking-[0.4em] bg-accent/5 px-4 py-1.5 rounded-full">{exercise?.topic}</span>
              <h3 className="text-3xl font-black text-human-charcoal dark:text-warm-white leading-tight tracking-tight">{exercise?.question}</h3>
              {exercise?.type === 'multi-select' && <p className="text-[10px] font-black uppercase text-human-clay tracking-widest">{t.selectAll}</p>}
            </div>
            
            <div className="space-y-6">
                {exercise?.type === 'multiple-choice' && exercise?.options && (
                  <div className="grid grid-cols-1 gap-5">
                    {exercise.options.map((opt, i) => (
                      <button key={i} onClick={() => handleMCOption(opt)} className="w-full p-6 text-left rounded-2xl bg-canvas-muted dark:bg-white/5 border border-accent/5 hover:border-accent hover:bg-canvas-surface transition-all font-bold text-human-stone shadow-sm active:scale-[0.99] flex items-center gap-4 group">
                        <span className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-black text-accent group-hover:bg-accent group-hover:text-white transition-all">{String.fromCharCode(65 + i)}</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {exercise?.type === 'text-input' && (
                  <div className="space-y-6">
                    <input 
                      autoFocus
                      type="text" 
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t.typeAnswer}
                      className="w-full p-8 rounded-3xl bg-canvas-muted dark:bg-espresso/50 border-2 border-accent/10 focus:border-accent outline-none text-2xl font-black text-center transition-all shadow-inner"
                      onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                    />
                    <button onClick={checkAnswer} className="w-full py-6 bg-accent text-white font-black rounded-3xl flex items-center justify-center gap-3 shadow-soft hover:opacity-90 transition-opacity">
                      <Send className="w-5 h-5" /> {t.submitAnswer}
                    </button>
                  </div>
                )}

                {exercise?.type === 'multi-select' && exercise?.options && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      {exercise.options.map((opt, i) => {
                        const isSelected = multiSelect.includes(opt);
                        return (
                          <button key={i} onClick={() => toggleMultiSelect(opt)} className={`w-full p-5 text-left rounded-2xl border transition-all font-bold flex items-center gap-4 ${isSelected ? 'bg-accent border-accent text-white shadow-soft' : 'bg-canvas-muted border-accent/5 text-human-stone hover:border-accent/30'}`}>
                            <div className={`w-6 h-6 rounded flex items-center justify-center border ${isSelected ? 'bg-white border-white text-accent' : 'bg-canvas dark:bg-charcoal border-accent/20 text-transparent'}`}>
                              <CheckCircle className="w-4 h-4" />
                            </div>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={checkAnswer} disabled={multiSelect.length === 0} className="w-full py-6 bg-accent text-white font-black rounded-3xl flex items-center justify-center gap-3 shadow-soft disabled:opacity-30">
                      <CheckCircle className="w-5 h-5" /> {t.submitAnswer}
                    </button>
                  </div>
                )}
            </div>

            <div className="flex justify-between items-center pt-8 border-t border-accent/10">
                <span className="text-[10px] font-black text-accent uppercase tracking-widest">{t.difficulty}: {(t as any)[difficulty]}</span>
                <button onClick={() => setViewState('selection')} className="text-human-clay hover:text-rose-500 font-black text-xs transition-colors uppercase tracking-widest">{t.cancel}</button>
            </div>
        </div>)}
    </div>
  );
};

export default ExerciseHub;
