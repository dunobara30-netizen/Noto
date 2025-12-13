import React, { useState, useEffect } from 'react';
import { Course, GradeLevel, GERMAN_GRADES, UK_GRADES, GERMAN_LEVELS, UK_LEVELS, getClosestGradeLabel, Language, TRANSLATIONS } from '../types';
import { Plus, Trash2, Sparkles, GraduationCap, Star, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';

interface GradeCalculatorProps {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  gradeLevel: GradeLevel;
  setGradeLevel: (level: GradeLevel) => void;
  onCalculate: (average: number) => void;
  isAnalyzing: boolean;
  language: Language;
  isChristmasMode?: boolean;
}

const GradeCalculator: React.FC<GradeCalculatorProps> = ({ 
  courses, 
  setCourses, 
  gradeLevel, 
  setGradeLevel, 
  onCalculate, 
  isAnalyzing,
  language,
  isChristmasMode = false
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

  return (
    <div className={`backdrop-blur-xl rounded-[2rem] shadow-2xl p-5 sm:p-8 border flex flex-col transition-all duration-500 animate-in slide-in-from-left-4 relative overflow-hidden h-full min-h-[500px] ${
        isChristmasMode 
        ? 'bg-white/90 border-red-100 shadow-red-200/50 hover:shadow-red-300/50' 
        : 'bg-white/80 dark:bg-slate-800/80 border-white/50 dark:border-slate-700 shadow-violet-200/50 dark:shadow-none hover:shadow-violet-300/50 dark:hover:shadow-slate-700/50'
    }`}>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 shrink-0">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text flex items-center gap-2 ${
              isChristmasMode ? 'bg-gradient-to-r from-red-600 to-emerald-600' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400'
          }`}>
            <GraduationCap className={`w-7 h-7 sm:w-8 sm:h-8 ${isChristmasMode ? 'text-red-600' : 'text-violet-600 dark:text-violet-400'}`} />
            {t.yourGrades}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mt-1">
            {t.enterSubjects} {isAdvancedLevel ? t.lkHint : ''}
          </p>
        </div>
        
        <div className={`p-0.5 rounded-2xl shadow-lg transform hover:scale-105 transition-transform duration-300 sm:self-start shrink-0 ${
            isChristmasMode ? 'bg-gradient-to-br from-red-500 to-amber-400 shadow-amber-200' : 'bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-violet-300/50 dark:shadow-none'
        }`}>
          <div className="bg-white dark:bg-slate-900 rounded-[14px] px-5 py-3 text-center min-w-[100px] flex sm:block items-center justify-between gap-4 sm:gap-0">
            <span className={`text-[10px] font-bold uppercase tracking-wider block mb-0 sm:mb-0.5 ${isChristmasMode ? 'text-red-600' : 'text-violet-600 dark:text-violet-400'}`}>{t.yourAverage}</span>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">
              {average > 0 ? getClosestGradeLabel(average, language) : '-'}
            </div>
            {average > 0 && (
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0 sm:mt-1">
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
                ? (isChristmasMode ? 'bg-red-100 text-red-700 border-red-200' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-700') 
                : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
              <SlidersHorizontal className="w-3 h-3" />
              {isSimulationMode ? t.simulationMode : t.simulationModeDesc}
          </button>
      </div>

      <div className="mb-6 sm:mb-8 shrink-0">
        <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 sm:mb-3 uppercase tracking-wide">{t.gradeLevel}</label>
        <div className="relative">
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
            className={`w-full p-3 sm:p-4 rounded-2xl border-2 transition-all outline-none font-semibold appearance-none cursor-pointer focus:ring-4 text-sm sm:text-base ${
                isChristmasMode 
                ? 'bg-red-50/50 border-red-100 text-slate-700 focus:border-red-500 focus:ring-red-100' 
                : 'bg-slate-50/50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-violet-100 dark:focus:ring-violet-900/20'
            }`}
          >
            {gradeLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
            <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none ${isChristmasMode ? 'text-red-500' : 'text-violet-500'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 mb-6 custom-scrollbar -mr-2 sm:pr-2 min-h-[150px]">
        {courses.map((course, idx) => (
          <div 
            key={course.id} 
            className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border shadow-sm transition-all duration-300 group animate-in slide-in-from-bottom-2 ${
                course.credits > 1 
                    ? (isChristmasMode ? 'bg-amber-50 border-amber-200' : 'bg-violet-50/50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800') 
                    : (isChristmasMode ? 'bg-white border-slate-100 hover:border-red-200 hover:shadow-md' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-700')
            }`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                course.credits > 1 
                    ? (isChristmasMode ? 'bg-amber-500 text-white' : 'bg-violet-600 text-white') 
                    : (isChristmasMode ? 'bg-red-50 text-red-600' : 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300')
            }`}>
              {idx + 1}
            </div>
            
            <input
              type="text"
              placeholder={t.coursePlaceholder}
              value={course.name}
              onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 font-bold placeholder-slate-300 dark:placeholder-slate-600 text-base sm:text-lg text-slate-700 dark:text-slate-200 min-w-0"
            />
            
            {/* LK/Advanced Toggle */}
            {isAdvancedLevel && (
              <button
                  onClick={() => toggleLK(course.id)}
                  className={`p-1.5 sm:p-2 rounded-xl transition-all ${course.credits > 1 ? 'text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30' : 'text-slate-200 dark:text-slate-600 hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  title={isUK ? "Higher Level / A-Level (Double Weight)" : "Leistungskurs (zählt doppelt)"}
              >
                  <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${course.credits > 1 ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            <div className="relative shrink-0 min-w-[80px] sm:min-w-[100px] flex justify-end">
                {isSimulationMode ? (
                    <div className="w-full flex flex-col items-end">
                         <span className={`text-lg font-black ${isChristmasMode ? 'text-red-500' : 'text-violet-500'}`}>{course.grade}</span>
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
                          className={`w-16 sm:w-20 border-none rounded-xl py-1.5 sm:py-2 px-2 sm:px-3 text-base sm:text-lg font-black text-center appearance-none cursor-pointer text-slate-700 dark:text-slate-200 focus:ring-2 ${
                              isChristmasMode ? 'bg-slate-50 focus:ring-red-500 focus:bg-white' : 'bg-slate-50 dark:bg-slate-800 focus:ring-violet-500 focus:bg-white dark:focus:bg-slate-700'
                          }`}
                        >
                          {Object.keys(gradeSystem).map(g => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                        <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                    </>
                )}
            </div>
            
            <button
            onClick={() => removeCourse(course.id)}
            className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-100 sm:opacity-0 group-hover:opacity-100"
            >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-3 sm:space-y-4 mt-auto shrink-0">
          <button
            onClick={addCourse}
            className={`w-full py-3 sm:py-4 px-4 border-2 border-dashed rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-base ${
                isChristmasMode 
                ? 'border-red-200 text-red-400 hover:border-red-400 hover:text-red-600 hover:bg-red-50' 
                : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10'
            }`}
          >
            <Plus className="w-5 h-5" />
            {t.addCourse}
          </button>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || courses.length === 0}
          className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-white text-base sm:text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform
            ${isAnalyzing || courses.length === 0
              ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed shadow-none' 
              : (isChristmasMode ? 'bg-gradient-to-r from-red-600 to-emerald-600 hover:shadow-emerald-200 shadow-red-200/50 hover:-translate-y-1 active:scale-95' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-fuchsia-300/50 shadow-violet-300/50 dark:shadow-none hover:-translate-y-1 active:scale-95')}`}
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