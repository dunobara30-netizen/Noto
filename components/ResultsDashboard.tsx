import React, { useState } from 'react';
import { AnalysisResult, getClosestGradeLabel, Course, Language, TRANSLATIONS, UniversityCheckResult, GradeLevel } from '../types';
import { MapPin, CheckCircle, Target, ArrowUpRight, Briefcase, Award, Star, User, Search, Loader2, Building2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { checkUniversityAdmission } from '../services/geminiService';

interface ResultsDashboardProps {
  results: AnalysisResult | null;
  gpa: number;
  courses: Course[];
  gradeLevel: GradeLevel;
  language: Language;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, gpa, courses, gradeLevel, language }) => {
  const t = TRANSLATIONS[language];
  const isUK = language === 'en';

  // State for Uni Lookup
  const [uniQuery, setUniQuery] = useState('');
  const [checkingUni, setCheckingUni] = useState(false);
  const [uniResult, setUniResult] = useState<UniversityCheckResult | null>(null);

  const handleUniCheck = async () => {
    if (!uniQuery.trim()) return;
    setCheckingUni(true);
    setUniResult(null);
    try {
        const result = await checkUniversityAdmission(uniQuery, courses, gradeLevel, language);
        setUniResult(result);
    } catch (e) {
        alert("Check failed. Please try again.");
    } finally {
        setCheckingUni(false);
    }
  };

  // Reusable Uni Lookup Component
  const UniLookupSection = () => (
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-3xl border border-violet-100 dark:border-violet-800 p-5 sm:p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4 text-violet-700 dark:text-violet-300">
            <Building2 className="w-5 h-5" />
            <h3 className="font-bold text-base sm:text-lg">{t.uniLookupHeader}</h3>
        </div>
        
        <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
                <input 
                    type="text" 
                    value={uniQuery}
                    onChange={(e) => setUniQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUniCheck()}
                    placeholder={t.uniLookupPlaceholder}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-violet-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                />
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
            </div>
            <button 
                onClick={handleUniCheck}
                disabled={checkingUni || !uniQuery}
                className="bg-violet-600 text-white px-4 sm:px-6 rounded-xl font-bold shadow-lg shadow-violet-200 dark:shadow-none hover:bg-violet-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
            >
                {checkingUni ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                <span className="hidden sm:inline">{t.checkAdmission}</span>
            </button>
        </div>

        {/* Lookup Result */}
        {uniResult && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-700 shadow-md animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{uniResult.uniName}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        uniResult.likelihood === 'High' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                        uniResult.likelihood === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                        'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'
                    }`}>
                        {uniResult.likelihood === 'High' ? (isUK ? 'Likely' : 'Gut möglich') : uniResult.likelihood === 'Medium' ? 'Competitive' : (isUK ? 'Unlikely' : 'Unwahrscheinlich')}
                    </span>
                </div>
                
                <div className="space-y-3 text-sm">
                    <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5"><Target className="w-4 h-4 text-slate-400 dark:text-slate-500" /></div>
                        <div>
                            <span className="block font-bold text-slate-600 dark:text-slate-300 text-xs uppercase mb-1">{t.requirements}</span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{uniResult.requirements}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5"><AlertCircle className="w-4 h-4 text-violet-400" /></div>
                        <div>
                            <span className="block font-bold text-slate-600 dark:text-slate-300 text-xs uppercase mb-1">{t.gapAnalysis}</span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{uniResult.gapAnalysis}</p>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
  );

  if (!results) {
    return (
      <div className="h-full flex flex-col p-4 sm:p-6 pb-24 lg:pb-24 overflow-y-auto custom-scrollbar">
        {/* Render Uni Lookup even in empty state */}
        <UniLookupSection />
        
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center animate-in fade-in duration-700">
            <div className="bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/20 dark:to-fuchsia-900/20 p-6 sm:p-8 rounded-full shadow-inner mb-6 animate-pulse">
                <Target className="w-12 h-12 sm:w-16 sm:h-16 text-violet-400 dark:text-violet-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-200 mb-3">{t.readyToCheck}</h3>
            <p className="max-w-sm text-slate-500 dark:text-slate-400 leading-relaxed text-sm sm:text-base">{t.readyDesc}</p>
        </div>
      </div>
    );
  }

  // Calculate Target Grade logic
  let targetGradeNum = 0;
  if (isUK) {
      targetGradeNum = Math.min(9.3, gpa + 0.5); // Max grade 9+ (9.3)
  } else {
      targetGradeNum = Math.max(0.7, gpa - 0.3); // Min grade 1+ (0.7)
  }

  const chartData = [
    { name: t.current, val: gpa, label: getClosestGradeLabel(gpa, language) },
    { name: t.target, val: targetGradeNum, label: getClosestGradeLabel(targetGradeNum, language) },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 h-auto lg:h-full lg:overflow-y-auto pr-0 sm:pr-3 custom-scrollbar p-4 sm:p-6 pb-24 lg:pb-24 animate-in slide-in-from-right-4 duration-500">
      
      {/* Header (Visible mostly on desktop inside container) */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-500" />
            {t.yourResult}
        </h2>
      </div>

      {/* Personality Archetype Hero Card */}
      {results.archetype && (
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-violet-200 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 pointer-events-none">
                <Star className="w-24 h-24 sm:w-32 sm:h-32 text-white fill-white" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 opacity-80">
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">{t.profileType}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4 tracking-tight">
                    {results.archetype}
                </h1>
                
                {/* Embedded Career Chips */}
                {results.careers && results.careers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {results.careers.map((career, idx) => (
                            <div key={idx} className="bg-white/20 backdrop-blur-md border border-white/30 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2">
                                <Briefcase className="w-3 h-3" />
                                {career}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Visual Grade Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 p-5 sm:p-6 flex flex-col md:flex-row gap-6 items-stretch">
         <div className="flex-1 w-full min-h-[180px] sm:h-48 relative">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">{t.trend}</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  {/* German is reversed (1 is high), UK is standard (9 is high) */}
                  <YAxis domain={isUK ? [0, 10] : [0, 6]} hide reversed={!isUK} /> 
                  <Tooltip cursor={{fill: 'transparent'}} content={() => null} />
                  <Bar dataKey="val" radius={[8, 8, 8, 8]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
            </ResponsiveContainer>
            {/* Labels overlay */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-around w-full font-bold text-slate-600 dark:text-slate-300 text-sm">
                <span>{getClosestGradeLabel(gpa, language)} <span className="text-xs text-slate-400 font-normal block sm:inline">{t.current}</span></span>
                <span className="text-emerald-600 dark:text-emerald-400">{getClosestGradeLabel(targetGradeNum, language)} <span className="text-xs text-emerald-400 dark:text-emerald-600 font-normal block sm:inline">{t.target}</span></span>
            </div>
         </div>
         <div className="flex-1 space-y-3 sm:space-y-4 w-full flex flex-col justify-center">
             <div className="bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <h4 className="text-xs sm:text-sm font-bold text-violet-600 dark:text-violet-400 mb-1">{t.aiAnalysis}</h4>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm italic leading-relaxed">"{results.advice.summary}"</p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2.5 sm:p-3 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate">{results.advice.strengths[0] || "Good basis"}</span>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 sm:p-3 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                    <span className="truncate">{results.advice.improvements[0] || "Potential"}</span>
                </div>
             </div>
         </div>
      </div>
      
      {/* UNI LOOKUP TOOL */}
      <UniLookupSection />

      {/* Standard Recommendations */}
      <div className="space-y-4 pt-2 sm:pt-4 border-t border-slate-200/60 dark:border-slate-700">
        <div className="flex items-center justify-between px-1">
             <h3 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">{t.collegesHeader}</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          {results.colleges.map((college, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-2 gap-2">
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm sm:text-base">{college.name}</h4>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{college.location}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${
                    ['Optimistisch', 'Reach'].includes(college.category) ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800' :
                    ['Realistisch', 'Target'].includes(college.category) ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                    'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800'
                }`}>
                  {college.category}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-2 line-clamp-2 sm:line-clamp-none">{college.reason}</p>
              <div className="inline-block bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded text-xs text-slate-500 dark:text-slate-400">
                <strong>{t.hurdle}:</strong> {college.acceptanceRate}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;