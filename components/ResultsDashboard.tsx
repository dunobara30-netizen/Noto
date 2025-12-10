
import React, { useState } from 'react';
import { AnalysisResult, getClosestGradeLabel, Course, Language, TRANSLATIONS, UniversityCheckResult, GradeLevel, CareerCheckResult } from '../types';
import { MapPin, CheckCircle, Target, ArrowUpRight, Briefcase, Award, Star, User, Search, Loader2, Building2, AlertCircle, Rocket } from 'lucide-react';
import { BarChart, Bar, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { checkUniversityAdmission, checkCareerFit } from '../services/geminiService';

interface ResultsDashboardProps {
  results: AnalysisResult | null;
  gpa: number;
  courses: Course[];
  gradeLevel: GradeLevel;
  language: Language;
}

// --- STANDALONE COMPONENTS TO PREVENT RENDER/FOCUS ISSUES ---

interface UniLookupProps {
    t: any;
    uniQuery: string;
    setUniQuery: (val: string) => void;
    handleUniCheck: () => void;
    checkingUni: boolean;
    uniResult: UniversityCheckResult | null;
    isUK: boolean;
}

const UniLookupSection: React.FC<UniLookupProps> = ({ t, uniQuery, setUniQuery, handleUniCheck, checkingUni, uniResult, isUK }) => (
    <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-3xl border border-violet-100 dark:border-violet-800 p-5 sm:p-6 shadow-sm mb-6 transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-4 text-violet-700 dark:text-violet-300">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
              <Building2 className="w-5 h-5" />
          </div>
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
                  className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-violet-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
              />
              <Search className="absolute left-3 top-3.5 sm:top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <button 
              onClick={handleUniCheck}
              disabled={checkingUni || !uniQuery}
              className="bg-violet-600 text-white px-4 sm:px-6 rounded-2xl font-bold shadow-lg shadow-violet-200 dark:shadow-none hover:bg-violet-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 active:scale-95"
          >
              {checkingUni ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
              <span className="hidden sm:inline">{t.checkAdmission}</span>
          </button>
      </div>

      {/* Lookup Result */}
      {uniResult && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-md animate-in slide-in-from-bottom-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{uniResult.uniName}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border w-fit ${
                      uniResult.likelihood === 'High' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' :
                      uniResult.likelihood === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                      'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'
                  }`}>
                      {uniResult.likelihood === 'High' ? (isUK ? 'High Chance' : 'Gute Chancen') : uniResult.likelihood === 'Medium' ? 'Competitive' : (isUK ? 'Low Chance' : 'Schwierig')}
                  </span>
              </div>
              
              <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                      <div className="shrink-0 mt-0.5"><Target className="w-5 h-5 text-slate-400 dark:text-slate-500" /></div>
                      <div>
                          <span className="block font-bold text-slate-600 dark:text-slate-300 text-xs uppercase mb-1 tracking-wide">{t.requirements}</span>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{uniResult.requirements}</p>
                      </div>
                  </div>
                  <div className="flex gap-3">
                      <div className="shrink-0 mt-0.5"><AlertCircle className="w-5 h-5 text-violet-500" /></div>
                      <div>
                          <span className="block font-bold text-slate-600 dark:text-slate-300 text-xs uppercase mb-1 tracking-wide">{t.gapAnalysis}</span>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{uniResult.gapAnalysis}</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
);

interface CareerCheckProps {
    t: any;
    jobQuery: string;
    setJobQuery: (val: string) => void;
    handleJobCheck: () => void;
    checkingJob: boolean;
    jobResult: CareerCheckResult | null;
}

const CareerCheckSection: React.FC<CareerCheckProps> = ({ t, jobQuery, setJobQuery, handleJobCheck, checkingJob, jobResult }) => (
    <div className="bg-gradient-to-r from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20 rounded-3xl border border-fuchsia-100 dark:border-fuchsia-800 p-5 sm:p-6 shadow-sm mb-6 transition-all hover:shadow-md">
        <div className="flex items-center gap-2 mb-4 text-fuchsia-700 dark:text-fuchsia-300">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
               <Rocket className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base sm:text-lg">{t.careerCheckHeader}</h3>
        </div>

        <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
                <input 
                    type="text" 
                    value={jobQuery}
                    onChange={(e) => setJobQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleJobCheck()}
                    placeholder={t.careerCheckPlaceholder}
                    className="w-full pl-10 pr-4 py-3 sm:py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-fuchsia-400 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                />
                <Briefcase className="absolute left-3 top-3.5 sm:top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
            </div>
            <button 
                onClick={handleJobCheck}
                disabled={checkingJob || !jobQuery}
                className="bg-fuchsia-600 text-white px-4 sm:px-6 rounded-2xl font-bold shadow-lg shadow-fuchsia-200 dark:shadow-none hover:bg-fuchsia-700 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 active:scale-95"
            >
                {checkingJob ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
                <span className="hidden sm:inline">{t.checkCareer}</span>
            </button>
        </div>

        {/* Job Result */}
        {jobResult && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-md animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{jobResult.jobTitle}</h4>
                    <div className="text-right">
                        <span className="block text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
                            {jobResult.matchScore}%
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">{t.matchScore}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full mb-5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                          jobResult.matchScore > 80 ? 'bg-emerald-500' : jobResult.matchScore > 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`} 
                      style={{ width: `${jobResult.matchScore}%` }}
                    ></div>
                </div>

                <div className="space-y-4 text-sm">
                    <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                        {jobResult.analysis}
                    </p>
                    
                    {jobResult.keySubjects && jobResult.keySubjects.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {jobResult.keySubjects.map((subj, idx) => (
                                <span key={idx} className="bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 px-3 py-1.5 rounded-xl text-xs font-bold border border-fuchsia-100 dark:border-fuchsia-800">
                                    {subj}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
);

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, gpa, courses, gradeLevel, language }) => {
  const t = TRANSLATIONS[language];
  const isUK = language === 'en';

  // State for Uni Lookup
  const [uniQuery, setUniQuery] = useState('');
  const [checkingUni, setCheckingUni] = useState(false);
  const [uniResult, setUniResult] = useState<UniversityCheckResult | null>(null);

  // State for Career Check
  const [jobQuery, setJobQuery] = useState('');
  const [checkingJob, setCheckingJob] = useState(false);
  const [jobResult, setJobResult] = useState<CareerCheckResult | null>(null);

  const handleUniCheck = async () => {
    if (!uniQuery.trim()) return;
    setCheckingUni(true);
    setUniResult(null);
    try {
        const result = await checkUniversityAdmission(uniQuery, courses, gradeLevel, language);
        setUniResult(result);
    } catch (e) {
        alert(language === 'en' ? "Check failed. Please try again." : "Check fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
        setCheckingUni(false);
    }
  };

  const handleJobCheck = async () => {
      if (!jobQuery.trim()) return;
      setCheckingJob(true);
      setJobResult(null);
      try {
          const result = await checkCareerFit(jobQuery, courses, gradeLevel, language);
          setJobResult(result);
      } catch (e) {
          alert(language === 'en' ? "Job check failed. Please try again." : "Job-Check fehlgeschlagen. Bitte erneut versuchen.");
      } finally {
          setCheckingJob(false);
      }
  };

  if (!results) {
    return (
      <div className="h-full flex flex-col p-4 sm:p-6 pb-24 lg:pb-24 overflow-y-auto custom-scrollbar">
        {/* Render Tools even in empty state */}
        <UniLookupSection 
            t={t} 
            uniQuery={uniQuery} 
            setUniQuery={setUniQuery} 
            handleUniCheck={handleUniCheck} 
            checkingUni={checkingUni} 
            uniResult={uniResult} 
            isUK={isUK}
        />
        <CareerCheckSection 
            t={t} 
            jobQuery={jobQuery} 
            setJobQuery={setJobQuery} 
            handleJobCheck={handleJobCheck} 
            checkingJob={checkingJob} 
            jobResult={jobResult}
        />
        
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center animate-in fade-in duration-700 min-h-[200px]">
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
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-500" />
            {t.yourResult}
        </h2>
      </div>

      {/* Personality Archetype Hero Card */}
      {results.archetype && (
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-violet-200 dark:shadow-none relative overflow-hidden transition-transform hover:scale-[1.01] duration-500">
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
      <UniLookupSection 
        t={t} 
        uniQuery={uniQuery} 
        setUniQuery={setUniQuery} 
        handleUniCheck={handleUniCheck} 
        checkingUni={checkingUni} 
        uniResult={uniResult} 
        isUK={isUK}
      />
      
      {/* CAREER FIT TOOL */}
      <CareerCheckSection 
        t={t} 
        jobQuery={jobQuery} 
        setJobQuery={setJobQuery} 
        handleJobCheck={handleJobCheck} 
        checkingJob={checkingJob} 
        jobResult={jobResult}
      />

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
