
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import GradeCalculator from './components/GradeCalculator';
import ResultsDashboard from './components/ResultsDashboard';
import ChatWidget from './components/ChatWidget';
import ExerciseHub from './components/ExerciseHub';
import { Course, GradeLevel, AnalysisResult, Language, TRANSLATIONS, UserStats, Difficulty, REWARDS } from './types';
import { analyzeAcademicProfile } from './services/geminiService';
import { 
  GraduationCap, Languages, Moon, Sun, ArrowRight, 
  Home, MoreVertical, Zap, Flame, Trophy, Sparkles, X, ChevronRight, Lock, CheckCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [language, setLanguage] = useState<Language>('de');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark';
    }
    return false;
  });
  
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('userStats');
    if (saved) return JSON.parse(saved);
    return { xp: 0, level: 1, streak: 1, lastVisit: new Date().toISOString() };
  });

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLevelPass, setShowLevelPass] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAverage, setCurrentAverage] = useState<number>(0);
  const [activeView, setActiveView] = useState<'dashboard' | 'exercises'>('dashboard');
  
  const [currentCourses, setCurrentCourses] = useState<Course[]>([
    { id: '1', name: 'Mathematik', grade: '2', credits: 1 },
    { id: '2', name: 'Deutsch', grade: '1-', credits: 1 },
    { id: '3', name: 'Englisch', grade: '2-', credits: 1 },
  ]);
  const [currentGradeLevel, setCurrentGradeLevel] = useState<GradeLevel>(GradeLevel.Ten);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = TRANSLATIONS[language];

  // Dynamic Accent Logic
  const getAccentClass = () => {
    if (stats.level >= 10) return 'accent-visionary';
    if (stats.level >= 7) return 'accent-master';
    if (stats.level >= 5) return 'accent-expert';
    if (stats.level >= 3) return 'accent-scholar';
    return 'accent-default';
  };

  useEffect(() => {
    localStorage.setItem('userStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    const today = new Date().toDateString();
    const last = new Date(stats.lastVisit).toDateString();
    if (today !== last) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (last === yesterday.toDateString()) {
        setStats(prev => ({ ...prev, streak: prev.streak + 1, lastVisit: new Date().toISOString() }));
      } else {
        setStats(prev => ({ ...prev, streak: 1, lastVisit: new Date().toISOString() }));
      }
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const updateXp = useCallback((amount: number) => {
    setStats(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      
      // Handle level up
      const xpToNextLevel = prev.level * 500;
      if (newXp >= xpToNextLevel) {
        newXp -= xpToNextLevel;
        newLevel += 1;
      }

      // Handle XP loss (cannot be below 0)
      if (newXp < 0) {
        newXp = 0;
      }

      return { ...prev, xp: newXp, level: newLevel };
    });
  }, []);

  const handleExerciseResult = useCallback((correct: boolean, difficulty: Difficulty) => {
    if (correct) {
      const xpMap = { easy: 100, medium: 150, hard: 200 };
      updateXp(xpMap[difficulty]);
    } else {
      updateXp(-10); // Take away 10 XP on wrong answer
    }
  }, [updateXp]);

  const toggleLanguage = () => setLanguage(language === 'de' ? 'en' : 'de');
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleCalculateAndAnalyze = async (avg: number) => {
    setCurrentAverage(avg);
    setIsAnalyzing(true);
    updateXp(50);
    try {
      const res = await analyzeAcademicProfile(avg, currentGradeLevel, currentCourses, language);
      setAnalysisResult(res);
      setTimeout(() => document.getElementById('results-container')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) { console.error(e); } finally { setIsAnalyzing(false); }
  };

  const xpProgress = (stats.xp / (stats.level * 500)) * 100;

  return (
    <div className={`min-h-screen transition-all duration-1000 ${getAccentClass()} text-human-charcoal dark:text-warm-white bg-canvas dark:bg-charcoal selection:bg-accent/10`}>
      <audio ref={audioRef} src="https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3" loop />
      
      {showLevelPass && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="w-full max-w-lg premium-glass rounded-[2.5rem] overflow-hidden shadow-elevated border border-accent/20 animate-in zoom-in-95 duration-300">
              <div className="p-8 bg-accent/5 flex justify-between items-center border-b border-accent/10">
                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3"><Zap className="text-accent w-6 h-6 fill-accent" /> {t.levelPass}</h2>
                <button onClick={() => setShowLevelPass(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {REWARDS.map((reward, i) => {
                  const isUnlocked = stats.level >= reward.level;
                  return (
                    <div key={i} className={`flex items-center gap-6 p-5 rounded-3xl border transition-all ${isUnlocked ? 'bg-accent/5 border-accent/20' : 'opacity-40 border-accent-sand dark:border-white/5 grayscale'}`}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl bg-canvas dark:bg-charcoal border border-accent/10">
                           {isUnlocked ? <CheckCircle className="text-accent w-7 h-7" /> : <Lock className="text-human-clay w-6 h-6" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-black uppercase text-accent tracking-widest">LVL {reward.level}</span>
                             {stats.level === reward.level && <span className="text-[9px] bg-accent text-white px-2 py-0.5 rounded-full font-bold">CURRENT</span>}
                          </div>
                          <h4 className="font-black text-lg leading-tight">{reward.name}</h4>
                          <p className="text-xs font-medium text-human-stone">{reward.color} Theme Accent</p>
                        </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-8 border-t border-accent/10 bg-canvas-muted dark:bg-white/5">
                 <div className="flex justify-between items-end mb-3">
                   <span className="text-xs font-black uppercase tracking-widest text-human-clay">LVL {stats.level} Progress</span>
                   <span className="text-xs font-black text-accent">{stats.xp} / {stats.level * 500} XP</span>
                 </div>
                 <div className="h-4 bg-accent/10 rounded-full overflow-hidden">
                   <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${xpProgress}%` }} />
                 </div>
              </div>
           </div>
        </div>
      )}

      {!hasStarted ? (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center z-10 overflow-hidden">
          <div className="max-w-md w-full animate-in slide-in-from-bottom-8 duration-1000">
             <div className="mb-14 relative inline-block">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl premium-glass flex items-center justify-center shadow-soft border border-accent/20 transition-all duration-1000 hover:rotate-6">
                    <GraduationCap className="w-10 h-10 sm:w-14 sm:h-14 text-accent" />
                </div>
                <div className="absolute -inset-4 bg-accent/5 blur-2xl rounded-full -z-10"></div>
             </div>
             <h1 className="text-5xl sm:text-6xl font-black mb-3 tracking-tighter text-human-charcoal dark:text-warm-white">GradePath AI</h1>
             <p className="text-xs font-black text-accent uppercase tracking-[0.5em] mb-12 drop-shadow-sm">{t.byIhssan}</p>
             <p className="text-lg font-medium mb-16 leading-relaxed text-human-stone/80 dark:text-warm-gray/80 max-w-xs mx-auto">{t.welcomeSubtitle}</p>
             <button onClick={() => setHasStarted(true)} className="w-full py-6 text-xl font-bold flex items-center justify-center gap-4 bg-human-charcoal dark:bg-accent text-white rounded-[2rem] shadow-elevated transition-all hover:scale-[1.02] active:scale-95 group">
                {t.getStarted} <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
             </button>
          </div>
        </div>
      ) : (
        <div className="relative min-h-screen flex flex-col max-w-4xl mx-auto z-10 px-4 pb-24">
           <header className="py-8 flex flex-col gap-6">
               <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl premium-glass flex items-center justify-center border border-accent/20 shadow-soft"><GraduationCap className="w-7 h-7 text-accent" /></div>
                        <div>
                            <h1 className="font-black text-lg leading-none text-human-charcoal dark:text-warm-white tracking-tight">GradePath</h1>
                            <span className="text-[10px] font-black text-accent uppercase tracking-widest mt-1 block">{t.byIhssan}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-canvas-muted dark:bg-white/5 rounded-full border border-accent/10 shadow-sm">
                            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                            <span className="text-xs font-bold">{stats.streak}</span>
                        </div>
                        <button onClick={() => setShowLevelPass(true)} className="flex items-center gap-1.5 px-4 py-1.5 bg-accent/10 dark:bg-accent/20 rounded-full border border-accent/20 shadow-sm hover:scale-105 transition-transform active:scale-95">
                            <Zap className="w-4 h-4 text-accent fill-accent" />
                            <span className="text-xs font-black">LVL {stats.level}</span>
                            <ChevronRight className="w-3 h-3 text-accent" />
                        </button>
                        <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-3 rounded-xl premium-glass text-human-clay shadow-soft"><MoreVertical className="w-5 h-5" /></button>
                    </div>
               </div>

               <div className="p-1.5 bg-canvas-muted dark:bg-white/5 rounded-[1.5rem] flex border border-accent/10 backdrop-blur-md">
                    <button onClick={() => setActiveView('dashboard')} className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${activeView === 'dashboard' ? 'bg-canvas-surface dark:bg-accent text-accent dark:text-white shadow-soft' : 'text-human-clay hover:text-human-charcoal'}`}>{t.navCheck}</button>
                    <button onClick={() => setActiveView('exercises')} className={`flex-1 py-4 rounded-xl text-sm font-black transition-all ${activeView === 'exercises' ? 'bg-canvas-surface dark:bg-accent text-accent dark:text-white shadow-soft' : 'text-human-clay hover:text-human-charcoal'}`}>{t.navPractice}</button>
               </div>
           </header>
           
           {showMobileMenu && (
               <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowMobileMenu(false)}>
                   <div className="w-full max-w-sm premium-glass rounded-[2.5rem] p-8 space-y-4 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <button onClick={toggleLanguage} className="w-full flex items-center justify-between p-4 rounded-2xl bg-canvas-muted dark:bg-white/5 font-bold"><div className="flex items-center gap-3"><Languages className="w-5 h-5" /> {language === 'de' ? 'Deutsch' : 'English'}</div></button>
                        <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-4 rounded-2xl bg-canvas-muted dark:bg-white/5 font-bold"><div className="flex items-center gap-3">{isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} {isDarkMode ? t.lightMode : t.darkMode}</div></button>
                        <button onClick={() => setHasStarted(false)} className="w-full p-4 rounded-2xl bg-rose-500/10 text-rose-500 font-bold flex items-center gap-3"><Home className="w-5 h-5" /> {t.backToStart}</button>
                   </div>
               </div>
           )}

           <main className="flex flex-col gap-12 w-full animate-in fade-in duration-1000">
               {activeView === 'dashboard' && (
                   <>
                       <GradeCalculator courses={currentCourses} setCourses={setCurrentCourses} gradeLevel={currentGradeLevel} setGradeLevel={setCurrentGradeLevel} onCalculate={handleCalculateAndAnalyze} isAnalyzing={isAnalyzing} language={language} currentTheme="default" />
                       <div id="results-container" className="w-full min-h-[500px] rounded-[3rem] premium-glass p-8 sm:p-14 border border-accent/10 shadow-elevated">
                            <ResultsDashboard results={analysisResult} gpa={currentAverage} courses={currentCourses} gradeLevel={currentGradeLevel} language={language} currentTheme="default" />
                       </div>
                   </>
               )}
               {activeView === 'exercises' && (
                   <div className="w-full min-h-[600px] rounded-[3rem] premium-glass p-8 sm:p-14 border border-accent/10 shadow-elevated">
                        <ExerciseHub gradeLevel={currentGradeLevel} language={language} onComplete={handleExerciseResult} />
                   </div>
               )}
           </main>
           <ChatWidget contextSummary={`Average: ${currentAverage}, Courses: ${currentCourses.length}`} isOpen={false} setIsOpen={() => {}} isAdmin={false} language={language} />
        </div>
      )}
      
      <style>{`
        .accent-default { --accent: 99 102 241; --accent-color: #6366F1; }
        .accent-scholar { --accent: 16 185 129; --accent-color: #10B981; }
        .accent-expert { --accent: 245 158 11; --accent-color: #F59E0B; }
        .accent-master { --accent: 244 63 94; --accent-color: #F43F5E; }
        .accent-visionary { --accent: 184 115 51; --accent-color: #B87333; }
        .bg-accent { background-color: var(--accent-color); }
        .text-accent { color: var(--accent-color); }
        .border-accent { border-color: var(--accent-color); }
        .bg-accent\\/10 { background-color: rgba(var(--accent), 0.1); }
        .bg-accent\\/5 { background-color: rgba(var(--accent), 0.05); }
        .accent-visionary h1 { background: linear-gradient(45deg, #B87333, #FFD700); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      `}</style>
    </div>
  );
};

export default App;
