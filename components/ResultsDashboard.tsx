
import React, { useState } from 'react';
import { AnalysisResult, getClosestGradeLabel, Course, Language, TRANSLATIONS, UniversityCheckResult, GradeLevel, CareerCheckResult, PlaceResult } from '../types';
import { MapPin, CheckCircle, Target, ArrowUpRight, Briefcase, Award, Star, User, Search, Loader2, Building2, AlertCircle, Rocket, Map } from 'lucide-react';
import { BarChart, Bar, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { checkUniversityAdmission, checkCareerFit, findNearbyPlaces } from '../services/geminiService';

interface ResultsDashboardProps {
  results: AnalysisResult | null;
  gpa: number;
  courses: Course[];
  gradeLevel: GradeLevel;
  language: Language;
  isChristmasMode?: boolean;
}

interface UniLookupProps {
    t: any;
    uniQuery: string;
    setUniQuery: (val: string) => void;
    handleUniCheck: () => void;
    checkingUni: boolean;
    uniResult: UniversityCheckResult | null;
    isUK: boolean;
    isChristmasMode: boolean;
}

const UniLookupSection: React.FC<UniLookupProps> = ({ t, uniQuery, setUniQuery, handleUniCheck, checkingUni, uniResult, isUK, isChristmasMode }) => (
    <div className={`rounded-3xl border p-5 sm:p-6 shadow-sm mb-6 transition-all hover:shadow-md ${
        isChristmasMode 
        ? 'bg-gradient-to-r from-red-50 to-amber-50 border-red-100' 
        : 'bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border-violet-100 dark:border-violet-800'
    }`}>
      <div className={`flex items-center gap-2 mb-4 ${isChristmasMode ? 'text-red-700' : 'text-violet-700 dark:text-violet-300'}`}>
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
                  className={`w-full pl-10 pr-4 py-3 sm:py-4 rounded-2xl border-none shadow-sm focus:ring-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium ${
                      isChristmasMode ? 'focus:ring-red-400' : 'focus:ring-violet-400'
                  }`}
              />
              <Search className="absolute left-3 top-3.5 sm:top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <button 
              onClick={handleUniCheck}
              disabled={checkingUni || !uniQuery}
              className={`px-4 sm:px-6 rounded-2xl font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 active:scale-95 text-white ${
                  isChristmasMode 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                  : 'bg-violet-600 hover:bg-violet-700 shadow-violet-200 dark:shadow-none'
              }`}
          >
              {checkingUni ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
              <span className="hidden sm:inline">{t.checkAdmission}</span>
          </button>
      </div>

      {uniResult && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-md animate-in slide-in-from-bottom-2">
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

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, gpa, courses, gradeLevel, language, isChristmasMode = false }) => {
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
                    isChristmasMode ? 'bg-red-50 text-red-300' : 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-700'
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
                            isChristmasMode 
                            ? 'bg-red-100 text-red-600' 
                            : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300'
                        }`}>
                            {t.aiAnalysis}
                        </span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100">{results.archetype}</h2>
                </div>
                <div className="flex items-center gap-2">
                    {/* Career Tags */}
                    {results.careers.slice(0, 2).map((job, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/50">
                            {job}
                        </span>
                    ))}
                </div>
            </div>

            {/* Advice Section */}
            <div className={`p-5 rounded-2xl border ${
                isChristmasMode 
                ? 'bg-emerald-50 border-emerald-100' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'
            }`}>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                    <Rocket className={`w-5 h-5 ${isChristmasMode ? 'text-emerald-500' : 'text-violet-500'}`} />
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
                    isChristmasMode={isChristmasMode}
                />

                {/* 2. Career Check */}
                <div className={`rounded-3xl border p-5 sm:p-6 shadow-sm mb-6 transition-all hover:shadow-md ${
                    isChristmasMode 
                    ? 'bg-gradient-to-r from-red-50 to-amber-50 border-red-100' 
                    : 'bg-gradient-to-r from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20 border-fuchsia-100 dark:border-fuchsia-800'
                }`}>
                    <div className={`flex items-center gap-2 mb-4 ${isChristmasMode ? 'text-red-700' : 'text-fuchsia-700 dark:text-fuchsia-300'}`}>
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                            <Briefcase className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-base sm:text-lg">{t.careerCheckHeader}</h3>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                value={careerQuery}
                                onChange={(e) => setCareerQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCareerCheck()}
                                placeholder={t.careerCheckPlaceholder}
                                className={`w-full pl-10 pr-4 py-3 sm:py-4 rounded-2xl border-none shadow-sm focus:ring-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium ${
                                    isChristmasMode ? 'focus:ring-red-400' : 'focus:ring-fuchsia-400'
                                }`}
                            />
                            <Search className="absolute left-3 top-3.5 sm:top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
                        </div>
                        <button 
                            onClick={handleCareerCheck}
                            disabled={checkingCareer || !careerQuery}
                            className={`px-4 sm:px-6 rounded-2xl font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 active:scale-95 text-white ${
                                isChristmasMode 
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                                : 'bg-fuchsia-600 hover:bg-fuchsia-700 shadow-fuchsia-200 dark:shadow-none'
                            }`}
                        >
                            {checkingCareer ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5" />}
                            <span className="hidden sm:inline">{t.checkCareer}</span>
                        </button>
                    </div>

                    {careerResult && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-md animate-in slide-in-from-bottom-2">
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
             <div className={`rounded-3xl border p-5 sm:p-6 shadow-sm transition-all hover:shadow-md ${
                isChristmasMode 
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100' 
                : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-100 dark:border-blue-800'
            }`}>
                 <div className={`flex items-center gap-2 mb-4 ${isChristmasMode ? 'text-emerald-700' : 'text-blue-700 dark:text-blue-300'}`}>
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                        <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base sm:text-lg">{t.locationSearchHeader}</h3>
                </div>

                <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLocationSearch()}
                            placeholder={t.locationPlaceholder}
                            className={`w-full pl-10 pr-4 py-3 sm:py-4 rounded-2xl border-none shadow-sm focus:ring-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium ${
                                isChristmasMode ? 'focus:ring-emerald-400' : 'focus:ring-blue-400'
                            }`}
                        />
                        <Search className="absolute left-3 top-3.5 sm:top-4 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <button 
                        onClick={handleLocationSearch}
                        disabled={findingPlaces || !locationQuery}
                        className={`px-4 sm:px-6 rounded-2xl font-bold shadow-lg disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2 active:scale-95 text-white ${
                            isChristmasMode 
                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none'
                        }`}
                    >
                        {findingPlaces ? <Loader2 className="w-5 h-5 animate-spin" /> : <Map className="w-5 h-5" />}
                        <span className="hidden sm:inline">{t.findNearby}</span>
                    </button>
                </div>

                {placeResult && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-md animate-in slide-in-from-bottom-2">
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
                                    // Handle Google Maps Grounding Chunks
                                    // Structure might be { maps: { ... } } or { web: { ... } } depending on tool used.
                                    // The prompt used `googleMaps` tool, so we look for maps data or web data.
                                    
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
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                    <Building2 className={`w-6 h-6 ${isChristmasMode ? 'text-red-500' : 'text-violet-500'}`} />
                    {t.collegesHeader}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.colleges.map((college, idx) => (
                        <div 
                            key={idx} 
                            className={`p-5 rounded-2xl border transition-all hover:shadow-lg group ${
                                isChristmasMode 
                                ? 'bg-white hover:border-red-200 shadow-sm' 
                                : 'bg-white dark:bg-slate-800 hover:border-violet-200 dark:hover:border-violet-700 shadow-sm border-slate-100 dark:border-slate-700'
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
