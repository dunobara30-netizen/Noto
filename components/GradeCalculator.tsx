import React, { useState, useEffect } from 'react';
import { Course, GradeLevel, GERMAN_GRADES, getClosestGradeLabel } from '../types';
import { Plus, Trash2, Sparkles, GraduationCap, Star } from 'lucide-react';

interface GradeCalculatorProps {
  onCalculate: (average: number, courses: Course[], level: GradeLevel) => void;
  isAnalyzing: boolean;
}

const GradeCalculator: React.FC<GradeCalculatorProps> = ({ onCalculate, isAnalyzing }) => {
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: 'Mathematik', grade: '2', credits: 1 },
    { id: '2', name: 'Deutsch', grade: '1-', credits: 1 },
    { id: '3', name: 'Englisch', grade: '2-', credits: 1 },
  ]);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>(GradeLevel.Ten);
  const [average, setAverage] = useState<number>(0);

  // Check if current level supports Advanced Courses (LK) - Q-Phase & Abitur only
  const isAdvancedLevel = [
    GradeLevel.Q1,
    GradeLevel.Q2,
    GradeLevel.Q3,
    GradeLevel.Q4,
    GradeLevel.ABITUR
  ].includes(gradeLevel);

  // Auto-reset LK weights if switching to lower grades (5-11/EF)
  useEffect(() => {
    if (!isAdvancedLevel) {
      setCourses(prev => {
        const hasWeightedCourses = prev.some(c => c.credits > 1);
        if (hasWeightedCourses) {
          return prev.map(c => ({ ...c, credits: 1 }));
        }
        return prev;
      });
    }
  }, [gradeLevel, isAdvancedLevel]);

  const calculateAverage = React.useCallback(() => {
    let totalScore = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      const score = GERMAN_GRADES[course.grade] || 0;
      if (score > 0) {
        totalScore += score * course.credits;
        totalCredits += course.credits;
      }
    });

    const calculated = totalCredits > 0 ? totalScore / totalCredits : 0;
    setAverage(calculated);
    return calculated;
  }, [courses]);

  useEffect(() => {
    calculateAverage();
  }, [calculateAverage]);

  const addCourse = () => {
    setCourses([...courses, { id: Date.now().toString(), name: '', grade: '1', credits: 1 }]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof Course, value: string | number) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const toggleLK = (id: string) => {
    setCourses(courses.map(c => c.id === id ? { ...c, credits: c.credits === 1 ? 2 : 1 } : c));
  };

  const handleAnalyze = () => {
    const currentAvg = calculateAverage();
    onCalculate(currentAvg, courses, gradeLevel);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-violet-200/50 p-6 border border-white/50 h-[600px] lg:h-full flex flex-col transition-all duration-500 animate-in slide-in-from-left-4 hover:shadow-violet-300/50 relative overflow-hidden">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-violet-600" />
            Deine Noten
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Trage deine Fächer ein {isAdvancedLevel ? '(LK = ★)' : ''}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 p-0.5 rounded-2xl shadow-lg shadow-violet-300/50 transform hover:scale-105 transition-transform duration-300">
          <div className="bg-white rounded-[14px] px-5 py-3 text-center min-w-[100px]">
            <span className="text-[10px] text-violet-600 font-bold uppercase tracking-wider block mb-0.5">Dein Schnitt</span>
            <div className="text-3xl font-black text-slate-800 leading-none">
              {average > 0 ? getClosestGradeLabel(average) : '-'}
            </div>
            {average > 0 && (
              <div className="text-xs font-bold text-slate-400 mt-1">
                (Ø {average.toFixed(2).replace('.', ',')})
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-600 mb-3 uppercase tracking-wide">Klassenstufe / Phase</label>
        <div className="relative">
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value as GradeLevel)}
            className="w-full p-4 rounded-2xl border-2 bg-slate-50/50 transition-all outline-none font-semibold appearance-none cursor-pointer border-slate-100 focus:border-violet-500 focus:ring-4 focus:ring-violet-100 text-slate-700"
          >
            {Object.values(GradeLevel).map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-violet-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6 custom-scrollbar">
        {courses.map((course, idx) => (
          <div 
            key={course.id} 
            className={`flex items-center gap-3 p-3 rounded-2xl border shadow-sm transition-all duration-300 group animate-in slide-in-from-bottom-2 ${course.credits > 1 ? 'bg-violet-50/50 border-violet-200' : 'bg-white border-slate-100 hover:shadow-md hover:border-violet-200'}`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${course.credits > 1 ? 'bg-violet-600 text-white' : 'bg-violet-50 text-violet-600'}`}>
              {idx + 1}
            </div>
            
            <input
              type="text"
              placeholder="Fach (z.B. Bio)"
              value={course.name}
              onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
              className="flex-1 bg-transparent border-none focus:ring-0 font-bold placeholder-slate-300 text-lg text-slate-700"
            />
            
            {/* LK Toggle - Only visible for Q-Phase/Abitur */}
            {isAdvancedLevel && (
              <button
                  onClick={() => toggleLK(course.id)}
                  className={`p-2 rounded-xl transition-all ${course.credits > 1 ? 'text-amber-400 hover:bg-amber-100' : 'text-slate-200 hover:text-amber-400 hover:bg-slate-50'}`}
                  title={course.credits > 1 ? "Leistungskurs (zählt doppelt)" : "Als LK markieren"}
              >
                  <Star className={`w-5 h-5 ${course.credits > 1 ? 'fill-amber-400' : ''}`} />
              </button>
            )}

            <div className="relative">
                <select
                  value={course.grade}
                  onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                  className="w-20 bg-slate-50 border-none rounded-xl py-2 px-3 text-lg font-black text-center appearance-none cursor-pointer text-slate-700 focus:ring-2 focus:ring-violet-500 focus:bg-white"
                >
                  {Object.keys(GERMAN_GRADES).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
            </div>
            
            <button
            onClick={() => removeCourse(course.id)}
            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
            >
            <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4 mt-auto">
          <button
            onClick={addCourse}
            className="w-full py-4 px-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 font-bold flex items-center justify-center gap-2 transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Fach hinzufügen
          </button>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || courses.length === 0}
          className={`w-full py-5 rounded-2xl font-bold text-white text-lg shadow-lg shadow-violet-300/50 flex items-center justify-center gap-3 transition-all transform
            ${isAnalyzing || courses.length === 0
              ? 'bg-slate-300 cursor-not-allowed shadow-none' 
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-fuchsia-300/50 hover:-translate-y-1 active:scale-95'}`}
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyse läuft...
            </span>
          ) : (
            <>
              <Sparkles className="w-6 h-6 fill-white/20" />
              Zukunft checken
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default GradeCalculator;