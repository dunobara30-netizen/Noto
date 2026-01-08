import React, { useState, useEffect, useCallback } from 'react';
import { Course, GradeLevel, GERMAN_GRADES, UK_GRADES, GERMAN_LEVELS, UK_LEVELS, getClosestGradeLabel, Language, TRANSLATIONS, Theme } from '../types';
import { Plus, Trash2, Sparkles, GraduationCap, ChevronDown } from 'lucide-react';

interface GradeCalculatorProps {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  gradeLevel: GradeLevel;
  setGradeLevel: (level: GradeLevel) => void;
  onCalculate: (average: number) => void;
  isAnalyzing: boolean;
  language: Language;
  currentTheme: Theme;
}

const GradeCalculator: React.FC<GradeCalculatorProps> = ({ courses, setCourses, gradeLevel, setGradeLevel, onCalculate, isAnalyzing, language }) => {
  const [average, setAverage] = useState<number>(0);
  const t = TRANSLATIONS[language];
  const isUK = language === 'en';
  const gradeSystem = isUK ? UK_GRADES : GERMAN_GRADES;
  const gradeLevels = isUK ? UK_LEVELS : GERMAN_LEVELS;

  const calculateAvg = useCallback(() => {
    let totalScore = 0, totalCredits = 0;
    courses.forEach(c => {
      const score = gradeSystem[c.grade] || 0;
      if (score > 0) { totalScore += score * c.credits; totalCredits += c.credits; }
    });
    const calculated = totalCredits > 0 ? totalScore / totalCredits : 0;
    setAverage(calculated);
    return calculated;
  }, [courses, gradeSystem]);

  useEffect(() => { calculateAvg(); }, [calculateAvg]);

  const addCourse = () => setCourses([...courses, { id: Date.now().toString(), name: '', grade: isUK ? '5' : '3', credits: 1 }]);
  const removeCourse = (id: string) => setCourses(courses.filter(c => c.id !== id));
  const updateCourse = (id: string, field: keyof Course, value: any) => setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));

  return (
    <div className="p-8 sm:p-14 premium-glass rounded-[2.5rem] border border-accent-sand/50 dark:border-white/5 space-y-12 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-12">
        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold flex items-center gap-4 text-human-charcoal dark:text-warm-white tracking-tight">
            <GraduationCap className="w-9 h-9 text-accent-warm dark:text-copper" /> {t.yourGrades}
          </h2>
          <p className="text-[11px] font-bold text-human-stone uppercase tracking-[0.25em] pl-1">{t.enterSubjects}</p>
        </div>
        <div className="bg-canvas-surface dark:bg-espresso/50 border border-accent-sand/60 dark:border-white/5 p-8 rounded-[2rem] flex flex-col items-center justify-center min-w-[170px] shadow-soft dark:shadow-none">
            <span className="text-[10px] font-bold uppercase block text-human-stone dark:text-warm-gray tracking-widest mb-1.5">{t.yourAverage}</span>
            <div className="text-5xl font-extrabold text-human-charcoal dark:text-amber-accent leading-none">{average > 0 ? getClosestGradeLabel(average, language) : '—'}</div>
            {average > 0 && <div className="text-xs font-semibold text-human-clay dark:text-warm-gray opacity-70 mt-2">Ø {average.toFixed(2)}</div>}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-[11px] font-bold text-human-stone dark:text-warm-gray uppercase tracking-widest pl-1">{t.gradeLevel}</label>
        <div className="relative">
          <select value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value as GradeLevel)} className="w-full p-5 bg-canvas-muted dark:bg-white/5 hover:bg-canvas-surface dark:hover:bg-white/10 border border-accent-sand/40 dark:border-white/10 rounded-2xl font-semibold outline-none transition-all appearance-none text-human-charcoal dark:text-warm-white cursor-pointer shadow-sm focus:border-accent-warm/30">
            {gradeLevels.map((l) => (<option key={l} value={l} className="bg-white dark:bg-charcoal text-human-charcoal dark:text-warm-white">{l}</option>))}
          </select>
          <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-human-clay dark:text-warm-gray pointer-events-none w-5 h-5" />
        </div>
      </div>

      <div className="space-y-6">
        {courses.map((c, i) => (
          <div key={c.id} className="flex items-center gap-6 p-5 rounded-2xl bg-canvas-surface dark:bg-white/5 border border-accent-sand/30 dark:border-white/5 group hover:border-accent-warm/20 dark:hover:border-copper/20 transition-all duration-400 shadow-sm hover:shadow-soft">
            <div className="h-10 w-10 flex items-center justify-center font-bold text-[11px] bg-canvas-muted dark:bg-espresso text-human-clay dark:text-warm-gray rounded-xl shrink-0 border border-accent-sand/40 dark:border-white/5">{i + 1}</div>
            <input type="text" placeholder={t.coursePlaceholder} value={c.name} onChange={(e) => updateCourse(c.id, 'name', e.target.value)} className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-lg text-human-charcoal dark:text-warm-white placeholder-human-clay/30" />
            <select value={c.grade} onChange={(e) => updateCourse(c.id, 'grade', e.target.value)} className="w-24 py-3.5 px-4 text-lg font-extrabold text-center rounded-[1.2rem] bg-canvas-muted dark:bg-charcoal border border-accent-sand/40 dark:border-white/10 text-human-charcoal dark:text-amber-accent shadow-inner outline-none transition-all hover:bg-white dark:hover:bg-charcoal">
                {Object.keys(gradeSystem).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <button onClick={() => removeCourse(c.id)} className="p-3 text-human-stone/30 dark:text-warm-gray hover:text-rose-400 transition-all hover:bg-rose-50 dark:hover:bg-white/5 rounded-xl"><Trash2 className="w-5.5 h-5.5" /></button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 pt-8">
          <button onClick={addCourse} className="w-full py-5 font-bold border-2 border-dashed border-accent-sand dark:border-white/10 text-human-clay dark:text-warm-gray hover:text-human-charcoal dark:hover:text-warm-white hover:border-accent-warm/40 dark:hover:border-white/20 rounded-2xl transition-all flex items-center justify-center gap-3">
            <Plus className="w-5 h-5" /> {t.addCourse}
          </button>
          <button onClick={() => onCalculate(calculateAvg())} disabled={isAnalyzing || courses.length === 0} className="w-full py-6 text-xl font-bold flex items-center justify-center gap-4 bg-human-charcoal dark:bg-copper hover:shadow-elevated hover:-translate-y-0.5 text-white rounded-[1.8rem] transition-all disabled:opacity-30 disabled:pointer-events-none group">
            {isAnalyzing ? <span className="flex items-center gap-3"><Sparkles className="animate-pulse w-6 h-6" /> {t.analyzing}</span> : <><Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" /> {t.analyzeBtn}</>}
          </button>
      </div>
    </div>
  );
};

export default GradeCalculator;