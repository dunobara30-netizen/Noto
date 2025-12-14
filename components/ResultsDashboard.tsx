
import React, { useState } from 'react';
import { AnalysisResult, getClosestGradeLabel, Course, Language, TRANSLATIONS, UniversityCheckResult, GradeLevel, CareerCheckResult, PlaceResult, Theme } from '../types';
import { MapPin, CheckCircle, Target, ArrowUpRight, Briefcase, Award, Star, User, Search, Loader2, Building2, AlertCircle, Rocket, Map } from 'lucide-react';
import { BarChart, Bar, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { checkUniversityAdmission, checkCareerFit, findNearbyPlaces } from '../services/geminiService';

interface ResultsDashboardProps {
  results: AnalysisResult | null;
  gpa: number;
  courses: Course[];
  gradeLevel: GradeLevel;
  language: Language;
  currentTheme: Theme;
}

interface UniLookupProps {
    t: any;
    uniQuery: string;
    setUniQuery: (val: string) => void;
    handleUniCheck: () => void;
    checkingUni: boolean;
    uniResult: UniversityCheckResult | null;
    isUK: boolean;
    currentTheme: Theme;
}

const getThemeStyle = (theme: Theme, element: 'input' | 'button' | 'card' | 'iconBg') => {
    switch (theme) {
        case 'plush':
            if (element === 'input') return 'focus:ring-rose-200 border-2 border-dashed border-rose-200 bg-white text-stone-600 rounded-full font-bold';
            if (element === 'button') return 'bg-rose-300 hover:bg-rose-400 text-white shadow-sm border-b-4 border-rose-400 active:border-b-0 active:translate-y-1 rounded-full';
            if (element === 'card') return 'bg-[#fffbf7] border-4 border-dashed border-rose-100 rounded-[2.5rem]';
            if (element === 'iconBg') return 'bg-rose-100 text-rose-500 rounded-full';
            break;
        case 'music':
            if (element === 'input') return 'focus:ring-violet-200 border-2 border-violet-200 bg-white text-violet-700 rounded-full font-bold';
            if (element === 'button') return 'bg-violet-400 hover:bg-violet-500 text-white shadow-sm border-b-4 border-violet-500 active:border-b-0 active:translate-y-1 rounded-full';
            if (element === 'card') return 'bg-[#fdfaff] border-2 border-violet-100 rounded-[2.5rem]';
            if (element === 'iconBg') return 'bg-violet-100 text-violet-500 rounded-full';
            break;
        case 'christmas':
            if (element === 'input') return 'focus:ring-red-400 bg-white/70';
            if (element === 'button') return 'bg-red-600 hover:bg-red-700 shadow-red-200 text-white rounded-2xl';
            if (element === 'card') return 'bg-white/30 border-red-100 rounded-3xl backdrop-blur-md';
            if (element === 'iconBg') return 'bg-white text-red-600';
            break;
        case 'pixel':
            if (element === 'input') return 'focus:ring-0 border-2 border-[#0f380f] bg-[#9bbc0f]/20 font-mono rounded-none text-[#0f380f]';
            if (element === 'button') return 'bg-[#0f380f] text-[#9bbc0f] hover:bg-[#306230] font-mono rounded-none shadow-none border-2 border-[#0f380f]';
            if (element === 'card') return 'bg-[#f0f0f0]/70 border-4 border-[#0f380f] rounded-none';
            if (element === 'iconBg') return 'bg-[#0f380f] text-[#9bbc0f] rounded-none';
            break;
        case 'neon':
            if (element === 'input') return 'bg-black/30 border border-fuchsia-500/50 text-fuchsia-300 focus:border-fuchsia-500 focus:shadow-[0_0_10px_rgba(232,121,249,0.3)] rounded-none';
            if (element === 'button') return 'bg-black/50 border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-900/30 shadow-[0_0_15px_rgba(232,121,249,0.5)] rounded-none';
            if (element === 'card') return 'bg-black/10 border border-fuchsia-500/30 shadow-[0_0_20px_rgba(232,121,249,0.2)] rounded-none backdrop-blur-sm';
            if (element === 'iconBg') return 'bg-fuchsia-900/20 text-fuchsia-400 border border-fuchsia-500 rounded-none';
            break;
        case 'space':
            if (element === 'input') return 'bg-indigo-950/30 border-indigo-500/50 text-indigo-200 focus:border-indigo-400 focus:ring-indigo-900 rounded-xl';
            if (element === 'button') return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50 rounded-xl border border-indigo-400/30';
            if (element === 'card') return 'bg-slate-900/30 border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.2)] rounded-3xl backdrop-blur-sm';
            if (element === 'iconBg') return 'bg-indigo-500/20 text-indigo-300 rounded-xl';
            break;
        case 'chalkboard':
            if (element === 'input') return 'bg-[#444] border-gray-500 text-white font-serif rounded-sm';
            if (element === 'button') return 'bg-white text-black border-2 border-gray-400 hover:bg-gray-200 rounded-sm font-serif font-bold';
            if (element === 'card') return 'bg-black/20 border border-gray-600 shadow-lg rounded-sm backdrop-blur-sm';
            if (element === 'iconBg') return 'bg-[#555] text-white rounded-sm';
            break;
        case 'coffee':
            if (element === 'input') return 'bg-[#f5f5dc]/50 border-[#d2b48c] text-[#4a3525] focus:border-[#8b4513] rounded-lg font-serif';
            if (element === 'button') return 'bg-[#6f4e37] text-[#f5f5dc] border border-[#4a3525] hover:bg-[#5d4037] shadow-md font-serif rounded-lg';
            if (element === 'card') return 'bg-[#fff8e7]/40 border-[#d2b48c] shadow-md rounded-xl backdrop-blur-md';
            if (element === 'iconBg') return 'bg-[#8b4513] text-[#f5f5dc] rounded-lg';
            break;
        case 'school':
            if (element === 'input') return 'bg-white/60 border-blue-100 text-slate-700 focus:border-blue-500 focus:ring-blue-100 rounded-xl';
            if (element === 'button') return 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-xl font-sans rounded-xl';
            if (element === 'card') return 'bg-white/30 border-blue-100 shadow-sm rounded-3xl backdrop-blur-sm';
            if (element === 'iconBg') return 'bg-blue-100 text-blue-600 rounded-xl';
            break;
        case 'library':
            if (element === 'input') return 'bg-[#f5f5dc]/60 border-[#8b4513]/50 text-[#3e2b22] focus:border-[#5c4033] rounded-lg font-serif';
            if (element === 'button') return 'bg-[#5c4033] text-[#f5f5dc] border border-[#3e2b22] hover:bg-[#3e2b22] shadow-sm font-serif rounded-lg';
            if (element === 'card') return 'bg-[#f5f5dc]/40 border-[#8b4513] shadow-lg rounded-xl backdrop-blur-md';
            if (element === 'iconBg') return 'bg-[#3e2b22] text-[#f5f5dc] rounded-lg';
            break;
        case 'autumn':
            if (element === 'input') return 'bg-white/50 border-orange-200 text-orange-900 focus:border-orange-500 rounded-xl';
            if (element === 'button') return 'bg-orange-600 text-white border border-orange-700 hover:bg-orange-700 shadow-md font-serif rounded-xl';
            if (element === 'card') return 'bg-white/30 border-orange-200 shadow-orange-100 rounded-3xl backdrop-blur-md';
            if (element === 'iconBg') return 'bg-orange-100 text-orange-600 rounded-xl';
            break;
        default:
            if (element === 'input') return 'focus:ring-violet-400 bg-white/50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-2xl';
            if (element === 'button') return 'bg-violet-600 hover:bg-violet-700 shadow-violet-200 dark:shadow-none text-white rounded-2xl';
            if (element === 'card') return 'bg-white/30 dark:bg-slate-800/30 border-violet-100 dark:border-violet-800 rounded-3xl backdrop-blur-xl';
            if (element === 'iconBg') return 'bg-white dark:bg-slate-800 text-violet-600 dark:text-violet-400 rounded-xl';
            break;
    }
    return '';
};

const UniLookupSection: React.FC<UniLookupProps> = ({ t, uniQuery, setUniQuery, handleUniCheck, checkingUni, uniResult, isUK, currentTheme }) => (
    <div className={`border p-5 sm:p-6 shadow-sm mb-6 transition-all hover:shadow-md ${getThemeStyle(currentTheme, 'card')}`}>
      <div className={`flex items-center gap-2 mb-4`}>
          <div className={`p-2 shadow-sm ${getThemeStyle(currentTheme, 'iconBg')}`}>
              <Building2 className="w-5 h-5" />
          </div>
          <h3 className={`font-bold text-base sm:text-lg ${currentTheme === 'plush' ? 'text-rose-500' : (currentTheme === 'music' ? 'text-violet-500' : (currentTheme === 'chalkboard' ? 'text-white' : (currentTheme === 'neon' ? 'text-fuchsia-400' : (currentTheme === 'library' ? 'text-[#3e2b22]' : (currentTheme === 'autumn' ? 'text-orange-900' : 'text-slate-700 dark:text-slate-200')))))}`}>{t.uniLookupHeader}</h3>
      </div>
      
      <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
              <input 
                  type="text" 
                  value={uniQuery}
                  onChange={(e) => setUniQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUniCheck()}
                  placeholder={t.uniLookupPlaceholder}
                  className={`w-full pl-10 pr-4 py-3 sm:py-4 border-none shadow-sm focus:ring-2 font-medium ${getThemeStyle(currentTheme, 'input')}`}
              />
              <Search className="absolute left-3 top-3.5 sm:top-4 w-5 h-5 opacity-50" />
          </div>
          <button 
              onClick={handleUniCheck}
              disabled={checkingUni || !uniQuery}
              className={`px-4 sm:px-6 font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 active:scale-95 ${getThemeStyle(currentTheme, 'button')}`}
          >
              {checkingUni ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
              <span className="hidden sm:inline">{t.checkAdmission}</span>
          </button>
      </div>

      {uniResult && (
          <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-md animate-in slide-in-from-bottom-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{uniResult.uniName}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      uniResult.likelihood === 'High' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      uniResult.likelihood === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                  }`}>
                      {t.admissionChance}: {uniResult.likelihood}
                  </span>
              </div>
              
              <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                      <Target className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">{t.requirements}</p>
                          <p className="text-slate-600 dark:text-slate-400">{uniResult.requirements}</p>
                      </div>
                  </div>
                  <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                          <p className="font-bold text-slate-700 dark:text-slate-300">{t.gapAnalysis}</p>
                          <p className="text-slate-600 dark:text-slate-400">{uniResult.gapAnalysis}</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
);

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, gpa, courses, gradeLevel, language, currentTheme }) => {
    const t = TRANSLATIONS[language];
    const isUK = language === 'en';

    // Uni Lookup State
    const [uniQuery, setUniQuery] = useState('');
    const [checkingUni, setCheckingUni] = useState(false);
    const [uniResult, setUniResult] = useState<UniversityCheckResult | null>(null);

    // Career Check State
    const [careerQuery, setCareerQuery] = useState('');
    const [checkingCareer, setCheckingCareer] = useState(false);
    const [careerResult, setCareerResult] = useState<CareerCheckResult | null>(null);

    // Location Check State
    const [locationQuery, setLocationQuery] = useState('');
    const [findingPlaces, setFindingPlaces] = useState(false);
    const [placeResult, setPlaceResult] = useState<PlaceResult | null>(null);

    const handleUniCheck = async () => {
        if (!uniQuery) return;
        setCheckingUni(true);
        try {
            const res = await checkUniversityAdmission(uniQuery, courses, gradeLevel, language);
            setUniResult(res);
        } catch (e) {
            console.error(e);
        } finally {
            setCheckingUni(false);
        }
    };

    const handleCareerCheck = async () => {
        if (!careerQuery) return;
        setCheckingCareer(true);
        try {
            const res = await checkCareerFit(careerQuery, courses, gradeLevel, language);
            setCareerResult(res);
        } catch (e) {
            console.error(e);
        } finally {
            setCheckingCareer(false);
        }
    };
    
    const handleLocationSearch = async () => {
        if (!locationQuery) return;
        setFindingPlaces(true);
        try {
            const res = await findNearbyPlaces(locationQuery, language);
            setPlaceResult(res);
        } catch (e) {
            console.error(e);
        } finally {
            setFindingPlaces(false);
        }
    };

    if (!results) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 animate-pulse ${
                    currentTheme === 'plush' ? 'bg-rose-100 text-rose-300 rounded-full' :
                    currentTheme === 'music' ? 'bg-violet-100 text-violet-300 rounded-full' :
                    currentTheme === 'christmas' ? 'bg-red-50 text-red-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-700'
                }`}>
                   <Target className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500 mb-2">{t.readyToCheck}</h3>
                <p className="text-slate-400 dark:text-slate-500">{t.readyDesc}</p>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            currentTheme === 'plush'
                            ? 'bg-rose-100 text-rose-600 border border-rose-200' :
                            currentTheme === 'music' 
                            ? 'bg-violet-100 text-violet-600 border border-violet-200' :
                            currentTheme === 'christmas' 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300'
                        }`}>
                            {t.aiAnalysis}
                        </span>
                    </div>
                    <h2 className={`text-3xl font-black ${currentTheme === 'plush' ? 'text-stone-700' : (currentTheme === 'music' ? 'text-violet-700' : (currentTheme === 'library' ? 'text-[#3e2b22]' : (currentTheme === 'autumn' ? 'text-orange-900' : 'text-slate-800 dark:text-slate-100')))}`}>{results.archetype}</h2>
                </div>
                <div className="flex items-center gap-2">
                    {/* Career Tags */}
                    {results.careers.slice(0, 2).map((job, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50">
                            {job}
                        </span>
                    ))}
                </div>
            </div>

            {/* Advice Section */}
            <div className={`p-5 rounded-2xl border ${
                currentTheme === 'plush'
                ? 'bg-rose-50 border-rose-200 border-2 border-dashed' :
                currentTheme === 'music' 
                ? 'bg-violet-50 border-violet-200 border-2' :
                currentTheme === 'christmas' 
                ? 'bg-emerald-50/50 border-emerald-100' 
                : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-700'
            }`}>
                <h3 className={`font-bold mb-2 flex items-center gap-2 ${currentTheme === 'plush' ? 'text-stone-700' : (currentTheme === 'music' ? 'text-violet-700' : (currentTheme === 'library' ? 'text-[#3e2b22]' : (currentTheme === 'autumn' ? 'text-orange-900' : 'text-slate-800 dark:text-slate-200')))}`}>
                    <Rocket className={`w-5 h-5 ${currentTheme === 'plush' ? 'text-rose-400' : (currentTheme === 'music' ? 'text-violet-500' : (currentTheme === 'christmas' ? 'text-emerald-500' : (currentTheme === 'autumn' ? 'text-orange-600' : 'text-violet-500')))}`} />
                    Strategy
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                    {results.advice.summary}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                         <p className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                             <CheckCircle className="w-3 h-3" /> Strengths
                         </p>
                         <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                             {results.advice.strengths.map((s, i) => (
                                 <li key={i} className="flex items-start gap-2">
                                     <span className="opacity-50">•</span> {s}
                                 </li>
                             ))}
                         </ul>
                     </div>
                     <div>
                         <p className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                             <ArrowUpRight className="w-3 h-3" /> Focus Areas
                         </p>
                         <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                             {results.advice.improvements.map((s, i) => (
                                 <li key={i} className="flex items-start gap-2">
                                     <span className="opacity-50">•</span> {s}
                                 </li>
                             ))}
                         </ul>
                     </div>
                </div>
            </div>

            {/* Interactive Tools Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* 1. Uni Lookup */}
                <UniLookupSection 
                    t={t}
                    uniQuery={uniQuery}
                    setUniQuery={setUniQuery}
                    handleUniCheck={handleUniCheck}
                    checkingUni={checkingUni}
                    uniResult={uniResult}
                    isUK={isUK}
                    currentTheme={currentTheme}
                />

                {/* 2. Career Check */}
                <div className={`border p-5 sm:p-6 shadow-sm mb-6 transition-all hover:shadow-md ${getThemeStyle(currentTheme, 'card')}`}>
                    <div className={`flex items-center gap-2 mb-4`}>
                        <div className={`p-2 shadow-sm ${getThemeStyle(currentTheme, 'iconBg')}`}>
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <h3 className={`font-bold text-base sm:text-lg ${currentTheme === 'plush' ? 'text-rose-500' : (currentTheme === 'music' ? 'text-violet-500' : (currentTheme === 'chalkboard' ? 'text-white' : (currentTheme === 'neon' ? 'text-fuchsia-400' : (currentTheme === 'library' ? 'text-[#3e2b22]' : (currentTheme === 'autumn' ? 'text-orange-900' : 'text-slate-700 dark:text-slate-200')))))}`}>{t.careerCheckHeader}</h3>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={careerQuery}
                                onChange={(e) => setCareerQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCareerCheck()}
                                placeholder={t.careerCheckPlaceholder}
                                className={`w-full pl-10 pr-4 py-3 sm:py-4 border-none shadow-sm focus:ring-2 font-medium ${getThemeStyle(currentTheme, 'input')}`}
                            />
                            <Search className="absolute left-3 top-3.5 sm:top-4 w-5 h-5 opacity-50" />
                        </div>
                        <button 
                            onClick={handleCareerCheck}
                            disabled={checkingCareer || !careerQuery}
                            className={`px-4 sm:px-6 font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 active:scale-95 ${getThemeStyle(currentTheme, 'button')}`}
                        >
                            {checkingCareer ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
                            <span className="hidden sm:inline">{t.checkCareer}</span>
                        </button>
                    </div>

                    {careerResult && (
                        <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-md animate-in slide-in-from-bottom-2">
                             <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{careerResult.jobTitle}</h4>
                                <div className="text-right">
                                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">{t.matchScore}</span>
                                    <span className={`text-xl font-black ${
                                        careerResult.matchScore > 75 ? 'text-emerald-500' : 
                                        careerResult.matchScore > 40 ? 'text-amber-500' : 'text-rose-500'
                                    }`}>{careerResult.matchScore}%</span>
                                </div>
                             </div>
                             <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{careerResult.analysis}</p>
                             <div className="flex flex-wrap gap-2">
                                 {careerResult.keySubjects.map((subj, i) => (
                                     <span key={i} className="text-[10px] font-bold px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 dark:text-slate-400 uppercase">{subj}</span>
                                 ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>

             {/* Location / Maps Search */}
             <div className={`border p-5 sm:p-6 shadow-sm transition-all hover:shadow-md ${getThemeStyle(currentTheme, 'card')}`}>
                 <div className={`flex items-center gap-2 mb-4`}>
                    <div className={`p-2 shadow-sm ${getThemeStyle(currentTheme, 'iconBg')}`}>
                        <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className={`font-bold text-base sm:text-lg ${currentTheme === 'plush' ? 'text-rose-500' : (currentTheme === 'music' ? 'text-violet-500' : (currentTheme === 'chalkboard' ? 'text-white' : (currentTheme === 'neon' ? 'text-fuchsia-400' : (currentTheme === 'library' ? 'text-[#3e2b22]' : (currentTheme === 'autumn' ? 'text-orange-900' : 'text-slate-700 dark:text-slate-200')))))}`}>{t.locationSearchHeader}</h3>
                </div>

                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                            placeholder={t.locationPlaceholder}
                            className={`w-full pl-10 pr-4 py-3 sm:py-4 border-none shadow-sm focus:ring-2 font-medium ${getThemeStyle(currentTheme, 'input')}`}
                        />
                        <Search className="absolute left-3 top-3.5 sm:top-4 w-5 h-5 opacity-50" />
                    </div>
                    <button 
                        onClick={handleLocationSearch}
                        disabled={findingPlaces || !locationQuery}
                        className={`px-4 sm:px-6 font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 active:scale-95 ${getThemeStyle(currentTheme, 'button')}`}
                    >
                        {findingPlaces ? <Loader2 className="w-5 h-5 animate-spin" /> : <Map className="w-5 h-5" />}
                        <span className="hidden sm:inline">{t.findNearby}</span>
                    </button>
                </div>

                {placeResult && (
                    <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-md animate-in slide-in-from-bottom-2">
                        <div className="prose dark:prose-invert text-sm max-w-none mb-4">
                             {/* Render simple markdown text */}
                             {placeResult.text.split('\n').map((line, i) => (
                                 <p key={i} className="mb-1">{line}</p>
                             ))}
                        </div>
                        {placeResult.chunks && placeResult.chunks.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <span className="w-full text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.mapLinks}</span>
                                {placeResult.chunks.map((chunk, idx) => {
                                    
                                    const uri = chunk.web?.uri || chunk.maps?.googleMapsUri;
                                    const title = chunk.web?.title || chunk.maps?.place?.name || `Location ${idx + 1}`;

                                    if (uri) {
                                        return (
                                            <a 
                                                key={idx}
                                                href={uri}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-xs font-bold transition-colors border border-slate-200 dark:border-slate-600"
                                            >
                                                <MapPin className="w-3 h-3" />
                                                {title}
                                                <ArrowUpRight className="w-3 h-3 opacity-50" />
                                            </a>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>
                )}
             </div>

            {/* University Recommendations List */}
            <div>
                <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${currentTheme === 'plush' ? 'text-stone-700' : (currentTheme === 'music' ? 'text-violet-700' : (currentTheme === 'library' ? 'text-[#3e2b22]' : (currentTheme === 'autumn' ? 'text-orange-900' : 'text-slate-800 dark:text-slate-200')))}`}>
                    <Building2 className={`w-6 h-6 ${currentTheme === 'plush' ? 'text-rose-400' : (currentTheme === 'music' ? 'text-violet-500' : (currentTheme === 'christmas' ? 'text-red-500' : 'text-violet-500'))}`} />
                    {t.collegesHeader}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.colleges.map((college, idx) => (
                        <div 
                            key={idx} 
                            className={`p-5 rounded-2xl border transition-all hover:shadow-lg group ${
                                currentTheme === 'plush' ? 'bg-[#fffbf7] border-2 border-dashed border-rose-200' :
                                currentTheme === 'music' ? 'bg-[#fdfaff] border-2 border-violet-100 hover:border-violet-300' :
                                currentTheme === 'christmas' 
                                ? 'bg-white/70 hover:border-red-200 shadow-sm backdrop-blur-sm' 
                                : 'bg-white/30 dark:bg-slate-800/30 hover:border-violet-200 dark:hover:border-violet-700 shadow-sm border-slate-100 dark:border-slate-700 backdrop-blur-sm'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{college.name}</h4>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                                    college.category === 'Reach' || college.category === 'Optimistisch' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' :
                                    college.category === 'Safety' || college.category === 'Sicher' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                    'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                }`}>
                                    {college.category}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 font-medium">
                                <MapPin className="w-3 h-3" /> {college.location}
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-600 dark:text-slate-300">{college.acceptanceRate}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-700 pt-3 mt-1">
                                {college.reason}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResultsDashboard;
