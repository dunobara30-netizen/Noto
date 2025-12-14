
import React, { useState, useEffect } from 'react';
import { Course, GradeLevel, GERMAN_GRADES, UK_GRADES, GERMAN_LEVELS, UK_LEVELS, getClosestGradeLabel, Language, TRANSLATIONS, Theme } from '../types';
import { Plus, Trash2, Sparkles, GraduationCap, Star, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';

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

const GradeCalculator: React.FC<GradeCalculatorProps> = ({ 
  courses, 
  setCourses, 
  gradeLevel, 
  setGradeLevel, 
  onCalculate, 
  isAnalyzing,
  language,
  currentTheme
}) => {
  const [average, setAverage] = useState<number>(0);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const t = TRANSLATIONS[language];

  // Detect which system we are using
  const isUK = language === 'en';
  const gradeSystem = isUK ? UK_GRADES : GERMAN_GRADES;
  const gradeLevels = isUK ? UK_LEVELS : GERMAN_LEVELS;

  // Helpers for sliders
  const gradeValues = Object.values(gradeSystem).sort((a, b) => a - b);
  const minGrade = gradeValues[0];
  const maxGrade = gradeValues[gradeValues.length - 1];

  // Helper to find key from value
  const getKeyFromValue = (val: number) => {
      // Find closest key in gradeSystem
      let closestKey = isUK ? '1' : '6';
      let minDiff = 100;
      for (const [k, v] of Object.entries(gradeSystem)) {
          if (Math.abs(v - val) < minDiff) {
              minDiff = Math.abs(v - val);
              closestKey = k;
          }
      }
      return closestKey;
  };

  // Check if current level supports Advanced Courses
  const isAdvancedLevel = [
    GradeLevel.Q1, GradeLevel.Q2, GradeLevel.Q3, GradeLevel.Q4, GradeLevel.ABITUR,
    GradeLevel.Y12, GradeLevel.Y13
  ].includes(gradeLevel);

  useEffect(() => {
    if (!isAdvancedLevel) {
      const hasWeightedCourses = courses.some(c => c.credits > 1);
      if (hasWeightedCourses) {
        setCourses(courses.map(c => ({ ...c, credits: 1 })));
      }
    }
  }, [gradeLevel, isAdvancedLevel]); 

  const calculateAverage = React.useCallback(() => {
    let totalScore = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const score = gradeSystem[course.grade] || 0;
      if (score > 0) {
        totalScore += score * course.credits;
        totalCredits += course.credits;
      }
    });

    const calculated = totalCredits > 0 ? totalScore / totalCredits : 0;
    setAverage(calculated);
    return calculated;
  }, [courses, gradeSystem]);

  useEffect(() => {
    calculateAverage();
  }, [calculateAverage]);

  const addCourse = () => {
    const defaultGrade = isUK ? '5' : '3';
    setCourses([...courses, { id: Date.now().toString(), name: '', grade: defaultGrade, credits: 1 }]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  
  // Special handler for slider updates (maps numeric back to string key)
  const updateCourseFromSlider = (id: string, numValue: number) => {
      const key = getKeyFromValue(numValue);
      updateCourse(id, 'grade', key);
  };

  const toggleLK = (id: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, credits: c.credits === 1 ? 2 : 1 } : c));
  };

  const handleAnalyze = () => {
    const currentAvg = calculateAverage();
    onCalculate(currentAvg);
  };

  // --- THEME UTILS for Inputs/Buttons ---
  const getThemeStyle = (element: 'buttonPrimary' | 'buttonSecondary' | 'input' | 'card' | 'badge') => {
      switch (currentTheme) {
          case 'plush':
              if (element === 'buttonPrimary') return 'bg-rose-300 border-b-4 border-rose-400 text-white rounded-full active:border-b-0 active:translate-y-1 transition-all font-bold tracking-wide shadow-sm';
              if (element === 'buttonSecondary') return 'bg-orange-50 border-2 border-dashed border-rose-200 text-rose-400 rounded-full hover:bg-white hover:border-rose-300';
              if (element === 'input') return 'bg-white border-2 border-dashed border-rose-200 text-stone-600 rounded-full focus:border-rose-400 focus:ring-0 text-center font-bold placeholder-rose-200';
              if (element === 'card') return 'bg-[#fffbf7] border-4 border-dashed border-rose-100 rounded-[2.5rem] shadow-xl shadow-rose-100/50';
              if (element === 'badge') return 'bg-rose-300 text-white rounded-full border-2 border-white shadow-sm';
              break;
          case 'music':
              if (element === 'buttonPrimary') return 'bg-violet-400 border-b-4 border-violet-500 text-white rounded-full active:border-b-0 active:translate-y-1 transition-all font-bold tracking-wide shadow-sm';
              if (element === 'buttonSecondary') return 'bg-violet-50 border-2 border-violet-200 text-violet-500 rounded-full hover:bg-white hover:border-violet-300';
              if (element === 'input') return 'bg-white border-2 border-violet-100 text-violet-700 rounded-full focus:border-violet-300 focus:ring-0 text-center font-bold placeholder-violet-200';
              if (element === 'card') return 'bg-[#fdfaff] border-2 border-violet-100 rounded-[2.5rem] shadow-xl shadow-violet-100/50';
              if (element === 'badge') return 'bg-violet-400 text-white rounded-full border-2 border-white shadow-sm';
              break;
          case 'christmas':
              if (element === 'buttonPrimary') return 'bg-gradient-to-r from-red-600 to-emerald-600 shadow-red-200 hover:shadow-red-300 border border-red-500 text-white font-serif';
              if (element === 'buttonSecondary') return 'border-2 border-dashed border-red-200 text-red-400 hover:border-red-400 hover:text-red-600 hover:bg-red-50/50 font-serif';
              if (element === 'input') return 'bg-white/30 border-red-100 focus:border-red-500 focus:ring-red-100 text-slate-800 placeholder-slate-500 font-bold';
              if (element === 'card') return 'bg-white/20 border-red-100 shadow-red-200/20'; // Highly Transparent
              if (element === 'badge') return 'bg-gradient-to-br from-red-500 to-amber-400 shadow-amber-200 text-white';
              break;
          case 'pixel':
              if (element === 'buttonPrimary') return 'bg-[#8b9c0f] text-[#0f380f] border-4 border-[#0f380f] hover:bg-[#9bbc0f] shadow-[4px_4px_0px_0px_rgba(15,56,15,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] rounded-none font-mono uppercase tracking-widest';
              if (element === 'buttonSecondary') return 'bg-white/80 text-[#0f380f] border-4 border-[#0f380f] border-dashed hover:bg-gray-100/50 rounded-none font-mono';
              if (element === 'input') return 'bg-[#9bbc0f]/20 border-4 border-[#0f380f] rounded-none font-mono text-[#0f380f] focus:bg-[#9bbc0f]/40';
              if (element === 'card') return 'bg-[#f0f0f0]/80 border-4 border-[#0f380f] rounded-none shadow-[8px_8px_0px_0px_rgba(15,56,15,0.5)]'; 
              if (element === 'badge') return 'bg-[#0f380f] text-[#9bbc0f] border-2 border-[#306230] rounded-none font-mono';
              break;
          case 'neon':
              if (element === 'buttonPrimary') return 'bg-black/50 border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-900/40 shadow-[0_0_15px_rgba(232,121,249,0.5)] font-sans tracking-wide rounded-none';
              if (element === 'buttonSecondary') return 'bg-black/20 border border-dashed border-fuchsia-500/50 text-fuchsia-500/70 hover:text-fuchsia-400 hover:border-fuchsia-400 hover:shadow-[0_0_10px_rgba(232,121,249,0.3)] rounded-none';
              if (element === 'input') return 'bg-black/40 border border-fuchsia-500/50 text-fuchsia-300 focus:border-fuchsia-500 focus:shadow-[0_0_10px_rgba(232,121,249,0.3)] rounded-none';
              if (element === 'card') return 'bg-black/20 border border-fuchsia-500/30 shadow-[0_0_20px_rgba(232,121,249,0.2)] rounded-none backdrop-blur-md'; // Dark Transparent
              if (element === 'badge') return 'bg-black/80 border border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] rounded-none';
              break;
          case 'space':
              if (element === 'buttonPrimary') return 'bg-indigo-900/60 border border-indigo-400 text-indigo-100 hover:bg-indigo-800/80 shadow-[0_0_20px_rgba(99,102,241,0.4)] backdrop-blur-md rounded-full';
              if (element === 'buttonSecondary') return 'border border-dashed border-indigo-400/50 text-indigo-300 hover:text-indigo-100 hover:border-indigo-300 hover:bg-indigo-900/20 rounded-full';
              if (element === 'input') return 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200 focus:border-indigo-400 focus:ring-indigo-900 rounded-xl';
              if (element === 'card') return 'bg-slate-900/30 border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.2)] rounded-3xl backdrop-blur-md'; 
              if (element === 'badge') return 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full';
              break;
          case 'school':
              if (element === 'buttonPrimary') return 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-xl font-sans rounded-xl';
              if (element === 'buttonSecondary') return 'border-2 border-dashed border-blue-200 text-blue-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl';
              if (element === 'input') return 'bg-white/40 border-blue-200 text-slate-700 focus:border-blue-500 focus:ring-blue-100 rounded-xl font-bold';
              if (element === 'card') return 'bg-white/30 border-blue-200 shadow-blue-100/50 rounded-3xl backdrop-blur-sm'; // See the paper
              if (element === 'badge') return 'bg-blue-600 text-white rounded-xl shadow-md';
              break;
          case 'exam':
              if (element === 'buttonPrimary') return 'bg-black text-white border-2 border-black hover:bg-gray-800 shadow-xl font-mono uppercase tracking-tighter';
              if (element === 'buttonSecondary') return 'border-2 border-dashed border-black text-black hover:bg-black hover:text-white font-mono uppercase';
              if (element === 'input') return 'bg-white/50 border-black text-black focus:ring-2 focus:ring-black rounded-none font-mono';
              if (element === 'card') return 'bg-white/40 border-2 border-black shadow-none rounded-none backdrop-blur-sm'; // See graph paper
              if (element === 'badge') return 'bg-black text-white border border-black font-mono uppercase';
              break;
          case 'chalkboard':
              if (element === 'buttonPrimary') return 'bg-white text-black border-2 border-gray-300 hover:bg-gray-200 shadow-md font-serif font-bold tracking-widest rounded-sm';
              if (element === 'buttonSecondary') return 'border-2 border-dashed border-gray-400 text-gray-300 hover:text-white hover:border-white hover:bg-white/10 rounded-sm font-serif';
              if (element === 'input') return 'bg-white/10 border-gray-500 text-white focus:border-white focus:ring-0 rounded-sm font-serif';
              if (element === 'card') return 'bg-black/20 border border-gray-600 shadow-xl rounded-sm backdrop-blur-sm'; // See chalkboard
              if (element === 'badge') return 'bg-[#444] border border-white text-white font-serif rounded-sm';
              break;
          case 'coffee':
              if (element === 'buttonPrimary') return 'bg-[#6f4e37] text-[#f5f5dc] border border-[#4a3525] hover:bg-[#5d4037] shadow-md font-serif rounded-lg';
              if (element === 'buttonSecondary') return 'border-2 border-dashed border-[#8b4513]/30 text-[#8b4513] hover:bg-[#8b4513]/10 rounded-lg';
              if (element === 'input') return 'bg-[#f5f5dc]/40 border-[#d2b48c] text-[#4a3525] focus:border-[#8b4513] rounded-lg font-serif';
              if (element === 'card') return 'bg-[#fff8e7]/40 border-[#d2b48c] shadow-md rounded-xl backdrop-blur-md';
              if (element === 'badge') return 'bg-[#8b4513] text-[#f5f5dc] rounded-lg shadow-sm';
              break;
          case 'library':
              if (element === 'buttonPrimary') return 'bg-[#5c4033] text-[#f5f5dc] border border-[#3e2b22] hover:bg-[#3e2b22] shadow-sm font-serif rounded-lg';
              if (element === 'buttonSecondary') return 'border-2 border-dashed border-[#5c4033]/40 text-[#3e2b22] hover:bg-[#3e2b22]/10 rounded-lg font-serif';
              if (element === 'input') return 'bg-[#f5f5dc]/40 border-[#8b4513]/50 text-[#3e2b22] focus:border-[#5c4033] rounded-lg font-serif';
              if (element === 'card') return 'bg-[#f5f5dc]/40 border-[#8b4513] shadow-lg rounded-xl backdrop-blur-md';
              if (element === 'badge') return 'bg-[#3e2b22] text-[#f5f5dc] border border-[#5c4033] rounded-lg';
              break;
          case 'autumn':
              if (element === 'buttonPrimary') return 'bg-orange-600 text-white border border-orange-700 hover:bg-orange-700 shadow-md font-serif rounded-xl';
              if (element === 'buttonSecondary') return 'border-2 border-dashed border-orange-300 text-orange-700 hover:bg-orange-50 rounded-xl';
              if (element === 'input') return 'bg-white/40 border-orange-200 text-orange-900 focus:border-orange-500 rounded-xl';
              if (element === 'card') return 'bg-white/30 border-orange-200 shadow-orange-100 rounded-3xl backdrop-blur-md';
              if (element === 'badge') return 'bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl shadow-sm';
              break;
          default:
              // Default / Modern
              if (element === 'buttonPrimary') return 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-fuchsia-300/50 shadow-violet-300/50 text-white rounded-2xl';
              if (element === 'buttonSecondary') return 'border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 rounded-2xl';
              if (element === 'input') return 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-violet-100 dark:focus:ring-violet-900/20 rounded-2xl';
              if (element === 'card') return 'bg-white/30 dark:bg-slate-800/30 border-white/30 dark:border-slate-700/30 shadow-violet-200/10 dark:shadow-none rounded-[2rem] backdrop-blur-xl'; 
              if (element === 'badge') return 'bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-violet-300/50 dark:shadow-none text-white rounded-[14px]';
              break;
      }
      return '';
  };

  return (
    <div className={`backdrop-blur-xl shadow-2xl p-5 sm:p-8 border flex flex-col transition-all duration-500 animate-in slide-in-from-left-4 relative overflow-hidden h-full min-h-[500px] ${getThemeStyle('card')}`}>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 shrink-0">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text flex items-center gap-2 ${
              currentTheme === 'plush' ? 'text-rose-400' :
              currentTheme === 'music' ? 'text-violet-500' :
              currentTheme === 'christmas' ? 'bg-gradient-to-r from-red-600 to-emerald-600' : 
              currentTheme === 'chalkboard' ? 'text-white font-serif' :
              currentTheme === 'pixel' ? 'text-[#0f380f] font-mono tracking-tighter' :
              currentTheme === 'neon' ? 'text-fuchsia-400 font-sans tracking-wide drop-shadow-[0_0_5px_rgba(232,121,249,0.8)]' :
              (currentTheme === 'library' ? 'text-[#3e2b22] font-serif' : 
              (currentTheme === 'autumn' ? 'text-orange-900 font-serif' :
              'bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400'))
          }`}>
            <GraduationCap className={`w-7 h-7 sm:w-8 sm:h-8 ${currentTheme === 'plush' ? 'text-rose-300' : (currentTheme === 'music' ? 'text-violet-400' : (currentTheme === 'christmas' ? 'text-red-600' : (currentTheme === 'chalkboard' ? 'text-white' : (currentTheme === 'pixel' ? 'text-[#0f380f]' : (currentTheme === 'library' ? 'text-[#5c4033]' : (currentTheme === 'autumn' ? 'text-orange-700' : 'text-violet-600 dark:text-violet-400'))))))}`} />
            {t.yourGrades}
          </h2>
          <p className={`text-xs sm:text-sm font-medium mt-1 ${currentTheme === 'plush' ? 'text-rose-300' : (currentTheme === 'music' ? 'text-violet-400' : (currentTheme === 'chalkboard' ? 'text-gray-300' : (currentTheme === 'library' ? 'text-[#5c4033]/70' : (currentTheme === 'autumn' ? 'text-orange-800/70' : 'text-slate-500 dark:text-slate-400'))))}`}>
            {t.enterSubjects} {isAdvancedLevel ? t.lkHint : ''}
          </p>
        </div>
        
        <div className={`p-0.5 transform hover:scale-105 transition-transform duration-300 sm:self-start shrink-0 ${getThemeStyle('badge')}`}>
          <div className={`rounded-[12px] px-5 py-3 text-center min-w-[100px] flex sm:block items-center justify-between gap-4 sm:gap-0 ${currentTheme === 'plush' ? 'bg-white/40 border-2 border-white rounded-full text-white' : (currentTheme === 'music' ? 'bg-white/40 border-2 border-white/50 rounded-full text-white' : (currentTheme === 'chalkboard' ? 'bg-[#333]' : 'bg-white/20 backdrop-blur-sm'))}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0 sm:mb-0.5 opacity-80`}>{t.yourAverage}</span>
            <div className="text-3xl font-black leading-none">
              {average > 0 ? getClosestGradeLabel(average, language) : '-'}
            </div>
            {average > 0 && (
              <div className="text-xs font-bold opacity-70 mt-0 sm:mt-1">
                (Ø {average.toFixed(2)})
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Simulation Toggle */}
      <div className="mb-4 flex items-center justify-end">
          <button 
            onClick={() => setIsSimulationMode(!isSimulationMode)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                isSimulationMode 
                ? (currentTheme === 'plush' ? 'bg-orange-50 text-rose-500 border-rose-200' : (currentTheme === 'music' ? 'bg-violet-50 text-violet-600 border-violet-200' : (currentTheme === 'christmas' ? 'bg-red-100 text-red-700 border-red-200' : (currentTheme === 'autumn' ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700'))))
                : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
              <SlidersHorizontal className="w-3 h-3" />
              {isSimulationMode ? t.simulationMode : t.simulationModeDesc}
          </button>
      </div>

      <div className="mb-6 sm:mb-8 shrink-0">
        <label className={`block text-sm font-bold mb-2 sm:mb-3 uppercase tracking-wide ${currentTheme === 'plush' ? 'text-rose-400' : (currentTheme === 'music' ? 'text-violet-500' : (currentTheme === 'chalkboard' ? 'text-gray-300' : (currentTheme === 'library' ? 'text-[#3e2b22]' : (currentTheme === 'autumn' ? 'text-orange-900' : 'text-slate-600 dark:text-slate-300'))))}`}>{t.gradeLevel}</label>
        <div className="relative">
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
            className={`w-full p-3 sm:p-4 border-2 transition-all outline-none font-semibold appearance-none cursor-pointer focus:ring-4 text-sm sm:text-base ${getThemeStyle('input')}`}
          >
            {gradeLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none opacity-50`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 mb-6 custom-scrollbar -mr-2 sm:pr-2 min-h-[150px]">
        {courses.map((course, idx) => (
          <div 
            key={course.id} 
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border shadow-sm transition-all duration-300 group animate-in slide-in-from-bottom-2 ${
                currentTheme === 'plush' ? 'rounded-[1.5rem] bg-white border-2 border-dashed border-rose-100 hover:border-rose-300' :
                currentTheme === 'music' ? 'rounded-[1.5rem] bg-white border border-violet-100 hover:border-violet-300' :
                currentTheme === 'pixel' ? 'rounded-none border-2 border-[#0f380f] bg-white/80' : 
                currentTheme === 'chalkboard' ? 'rounded-sm bg-[#333]/80 border-gray-600' :
                currentTheme === 'library' ? 'rounded-lg bg-[#f5f5dc]/50 border-[#8b4513]/30' :
                currentTheme === 'autumn' ? 'rounded-xl bg-white/40 border-orange-100' :
                currentTheme === 'school' ? 'rounded-xl bg-white/40 border-blue-200' :
                currentTheme === 'exam' ? 'rounded-none bg-white/60 border-black' :
                'rounded-2xl bg-white/40 dark:bg-slate-900/40 border-slate-100/30 dark:border-slate-700/30'
            }`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                currentTheme === 'plush' ? 'rounded-full bg-rose-200 text-white' :
                currentTheme === 'music' ? 'rounded-full bg-violet-200 text-white' :
                currentTheme === 'pixel' ? 'rounded-none bg-[#0f380f] text-[#9bbc0f]' :
                currentTheme === 'library' ? 'rounded-full bg-[#3e2b22] text-[#f5f5dc]' :
                currentTheme === 'autumn' ? 'rounded-full bg-orange-600 text-white' :
                currentTheme === 'exam' ? 'rounded-full bg-black text-white' :
                'rounded-full ' + (course.credits > 1 ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400')
            }`}>
              {idx + 1}
            </div>
            
            <input
              type="text"
              placeholder={t.coursePlaceholder}
              value={course.name}
              onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
              className={`flex-1 bg-transparent border-none focus:ring-0 font-bold placeholder-slate-400 dark:placeholder-slate-500 text-base sm:text-lg min-w-0 ${currentTheme === 'plush' ? 'text-stone-600 placeholder-rose-200' : (currentTheme === 'music' ? 'text-violet-700 placeholder-violet-200' : (currentTheme === 'chalkboard' ? 'text-white placeholder-gray-500' : (currentTheme === 'library' ? 'text-[#3e2b22] placeholder-[#8b4513]/50' : (currentTheme === 'autumn' ? 'text-orange-900 placeholder-orange-300' : 'text-slate-800 dark:text-slate-100'))))}`}
            />
            
            {/* LK/Advanced Toggle */}
            {isAdvancedLevel && (
              <button
                  onClick={() => toggleLK(course.id)}
                  className={`p-1.5 sm:p-2 rounded-xl transition-all ${course.credits > 1 ? 'text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30' : 'text-slate-200 dark:text-slate-600 hover:text-amber-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'}`}
                  title={isUK ? "Higher Level / A-Level (Double Weight)" : "Leistungskurs (zählt doppelt)"}
              >
                  <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${course.credits > 1 ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            <div className="relative shrink-0 min-w-[80px] sm:min-w-[100px] flex justify-end">
                {isSimulationMode ? (
                    <div className="w-full flex flex-col items-end">
                         <span className={`text-lg font-black ${currentTheme === 'plush' ? 'text-rose-400' : (currentTheme === 'music' ? 'text-violet-500' : (currentTheme === 'pixel' ? 'text-[#0f380f]' : (currentTheme === 'library' ? 'text-[#3e2b22]' : (currentTheme === 'autumn' ? 'text-orange-900' : 'text-slate-700 dark:text-slate-300'))))}`}>{course.grade}</span>
                         <input 
                            type="range" 
                            min={minGrade}
                            max={maxGrade}
                            step={0.1} // Fine grained control
                            value={gradeSystem[course.grade]}
                            onChange={(e) => updateCourseFromSlider(course.id, parseFloat(e.target.value))}
                            className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-violet-600"
                         />
                    </div>
                ) : (
                    <>
                        <select
                          value={course.grade}
                          onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                          className={`w-16 sm:w-20 border-none py-1.5 sm:py-2 px-2 sm:px-3 text-base sm:text-lg font-black text-center appearance-none cursor-pointer focus:ring-2 ${
                              currentTheme === 'plush' ? 'bg-rose-100 text-rose-500 rounded-2xl' :
                              currentTheme === 'music' ? 'bg-violet-100 text-violet-600 rounded-2xl' :
                              currentTheme === 'pixel' ? 'bg-[#9bbc0f] text-[#0f380f] rounded-none' : 
                              currentTheme === 'chalkboard' ? 'bg-[#444] text-white rounded-sm' :
                              currentTheme === 'library' ? 'bg-[#eaddcf] text-[#3e2b22] rounded-lg' :
                              currentTheme === 'autumn' ? 'bg-orange-100 text-orange-900 rounded-xl' :
                              'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl focus:ring-violet-500'
                          }`}
                        >
                          {Object.keys(gradeSystem).map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                    </>
                )}
            </div>
            
            <button
            onClick={() => removeCourse(course.id)}
            className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
            >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-3 sm:space-y-4 mt-auto shrink-0">
          <button
            onClick={addCourse}
            className={`w-full py-3 sm:py-4 px-4 font-bold flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-base ${getThemeStyle('buttonSecondary')}`}
          >
            <Plus className="w-5 h-5" />
            {t.addCourse}
          </button>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || courses.length === 0}
          className={`w-full py-4 sm:py-5 font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all transform
            ${isAnalyzing || courses.length === 0
              ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none rounded-xl' 
              : `${getThemeStyle('buttonPrimary')} hover:-translate-y-1 active:scale-95`}`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.analyzing}
            </span>
          ) : (
            <>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 fill-white/20" />
              {t.analyzeBtn}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GradeCalculator;
