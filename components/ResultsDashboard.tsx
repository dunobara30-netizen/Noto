import React from 'react';
import { AnalysisResult, Course, Language, TRANSLATIONS, GradeLevel, Theme } from '../types';
import { MapPin, CheckCircle, Target, ArrowUpRight, Rocket, Building2 } from 'lucide-react';

interface ResultsDashboardProps {
  results: AnalysisResult | null;
  gpa: number;
  courses: Course[];
  gradeLevel: GradeLevel;
  language: Language;
  currentTheme: Theme;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ results, language }) => {
    const t = TRANSLATIONS[language];
    
    if (!results) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[450px] text-center p-10">
                <div className="w-24 h-24 bg-canvas-muted dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-10 border border-accent-sand/40 dark:border-white/5 shadow-inner">
                   <Target className="w-12 h-12 text-human-clay/30 dark:text-warm-gray opacity-40" />
                </div>
                <h3 className="text-2xl font-bold text-human-charcoal dark:text-warm-gray mb-4 tracking-tight">{t.readyToCheck}</h3>
                <p className="text-base text-human-stone/70 dark:text-warm-gray opacity-60 max-w-xs font-medium leading-relaxed">{t.readyDesc}</p>
            </div>
        );
    }

    return (
        <div className="space-y-20 animate-in fade-in duration-1000">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10">
                <div className="space-y-4">
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] bg-accent-warm/5 dark:bg-copper/10 text-accent-warm dark:text-copper border border-accent-warm/10 dark:border-copper/20">{t.aiAnalysis}</span>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-human-charcoal dark:text-warm-white tracking-tight leading-tight">{results.archetype}</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                    {results.careers.map((job, i) => (
                        <span key={i} className="px-5 py-2.5 rounded-xl border border-accent-sand/50 dark:border-white/5 text-sm font-bold text-human-stone dark:text-amber-accent bg-canvas-surface dark:bg-white/5 shadow-soft dark:shadow-none">{job}</span>
                    ))}
                </div>
            </div>

            <div className="p-10 sm:p-14 rounded-[3rem] bg-canvas-muted dark:bg-espresso/30 border border-accent-sand/30 dark:border-white/5 shadow-inner transition-all">
                <h3 className="font-bold text-xl mb-8 flex items-center gap-4 text-human-charcoal dark:text-copper tracking-tight"><Rocket className="w-7 h-7 text-accent-warm" /> Roadmap Strategy</h3>
                <p className="text-human-stone dark:text-warm-gray leading-relaxed mb-14 text-xl italic font-medium">"{results.advice.summary}"</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-14 border-t border-accent-sand/40 dark:border-white/5 pt-14">
                     <div className="space-y-6">
                         <p className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-500 tracking-[0.3em] flex items-center gap-3"><CheckCircle className="w-4 h-4" /> Core Strengths</p>
                         <ul className="space-y-4">
                           {results.advice.strengths.map((s, i) => (
                             <li key={i} className="text-base text-human-stone dark:text-warm-white flex items-start gap-4 font-medium">
                               <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2.5 shrink-0" /> {s}
                             </li>
                           ))}
                         </ul>
                     </div>
                     <div className="space-y-6">
                         <p className="text-[11px] font-bold uppercase text-human-clay dark:text-amber-accent tracking-[0.3em] flex items-center gap-3"><ArrowUpRight className="w-4 h-4" /> Growth Areas</p>
                         <ul className="space-y-4">
                           {results.advice.improvements.map((s, i) => (
                             <li key={i} className="text-base text-human-stone dark:text-warm-white flex items-start gap-4 font-medium">
                               <span className="w-2 h-2 rounded-full bg-human-stone/40 dark:bg-amber-accent mt-2.5 shrink-0" /> {s}
                             </li>
                           ))}
                         </ul>
                     </div>
                </div>
            </div>

            <div className="space-y-10">
                <h3 className="text-3xl font-extrabold flex items-center gap-4 text-human-charcoal dark:text-warm-white tracking-tight"><Building2 className="w-8 h-8 text-accent-warm dark:text-copper" /> {t.collegesHeader}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {results.colleges.map((college, idx) => (
                        <div key={idx} className="p-8 rounded-[2rem] bg-canvas-surface dark:bg-charcoal-lighter/30 border border-accent-sand/40 dark:border-white/5 hover:border-accent-warm/30 dark:hover:border-copper/30 transition-all group shadow-soft dark:shadow-none hover:-translate-y-1.5">
                            <div className="flex justify-between items-start mb-6">
                                <h4 className="font-bold text-xl text-human-charcoal dark:text-warm-white group-hover:text-accent-warm dark:group-hover:text-amber-accent transition-colors tracking-tight">{college.name}</h4>
                                <span className={`text-[10px] font-bold px-4 py-1.5 rounded-lg uppercase tracking-widest ${college.category === 'Reach' || college.category === 'Optimistisch' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'}`}>{college.category}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-human-stone dark:text-warm-gray mb-8 font-bold">
                                <MapPin className="w-4.5 h-4.5 text-human-clay dark:text-copper" /> {college.location} <span className="opacity-20">|</span> {college.acceptanceRate}
                            </div>
                            <p className="text-base text-human-stone/80 dark:text-warm-gray/80 leading-relaxed border-t border-canvas-muted dark:border-white/5 pt-6 font-medium italic">"{college.reason}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ResultsDashboard;