
import React, { useState, useEffect, useRef } from 'react';
import GradeCalculator from './components/GradeCalculator';
import ResultsDashboard from './components/ResultsDashboard';
import ChatWidget from './components/ChatWidget';
import ExerciseHub from './components/ExerciseHub';
import { Course, GradeLevel, AnalysisResult, Language, TRANSLATIONS } from './types';
import { analyzeAcademicProfile } from './services/geminiService';
import { GraduationCap, Sparkles, QrCode, X, Smartphone, Download, Share, MoreVertical, Copy, ShieldCheck, Eye, EyeOff, Lock, Unlock, Edit2, BrainCircuit, LayoutDashboard, Languages, Moon, Sun, ArrowRight, Play, Home, Info, Scale, ChevronRight, Zap, Atom, Lightbulb, Quote, Menu, Settings, MessageCircle } from 'lucide-react';

const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAverage, setCurrentAverage] = useState<number>(0);
  
  // Lifted State for data persistence and sync
  const [currentCourses, setCurrentCourses] = useState<Course[]>([
    { id: '1', name: 'Mathematik', grade: '2', credits: 1 },
    { id: '2', name: 'Deutsch', grade: '1-', credits: 1 },
    { id: '3', name: 'Englisch', grade: '2-', credits: 1 },
  ]);
  const [currentGradeLevel, setCurrentGradeLevel] = useState<GradeLevel>(GradeLevel.Ten);
  const [language, setLanguage] = useState<Language>('de');
  
  const [contextSummary, setContextSummary] = useState<string>('');
  
  // Navigation State
  const [activeView, setActiveView] = useState<'dashboard' | 'exercises'>('dashboard');

  // Chat & Admin State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  // App Utilities
  const [showQr, setShowQr] = useState(false);
  const [qrSource, setQrSource] = useState('');
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installTab, setInstallTab] = useState<'android' | 'ios'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Start Screen State
  const [showGradeInfo, setShowGradeInfo] = useState(false);
  const [dailyQuote, setDailyQuote] = useState({ text: "", author: "" });
  const [showMenu, setShowMenu] = useState(false); // Start Screen Menu
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Main App Mobile Menu

  // Security & Privacy State
  const [sessionKey, setSessionKey] = useState(0); 
  const [isBlurred, setIsBlurred] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);

  const t = TRANSLATIONS[language];
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Motivational Quotes separated by language
  const QUOTES = {
    en: [
      { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
      { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
      { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" }
    ],
    de: [
      { text: "Bildung ist das, was übrig bleibt, wenn man alles vergessen hat, was man gelernt hat.", author: "Albert Einstein" },
      { text: "Es ist nicht zu wenig Zeit, die wir haben, sondern es ist zu viel Zeit, die wir nicht nutzen.", author: "Seneca" },
      { text: "Der Weg ist das Ziel.", author: "Konfuzius" },
      { text: "Auch aus Steinen, die einem in den Weg gelegt werden, kann man Schönes bauen.", author: "Johann Wolfgang von Goethe" },
      { text: "Man lernt nicht für die Schule, sondern für das Leben.", author: "Seneca" }
    ]
  };

  // Official Grade Data (Hardcoded as requested)
  const officialGradeInfo = {
      de: [
          { range: "1.0 - 1.5", label: "Sehr Gut (Exzellent)", desc: "Top-Leistung. Nötig für Medizin, Psychologie und Top-Unis (München, Heidelberg) in NC-Fächern.", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { range: "1.6 - 2.5", label: "Gut", desc: "Solide Leistung. Zugang zu den meisten Studiengängen (Jura, BWL, Lehramt) an fast allen Universitäten.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { range: "2.6 - 3.5", label: "Befriedigend", desc: "Durchschnitt. Zugang zu zulassungsfreien Studiengängen (oft MINT-Fächer wie Informatik, Physik, Chemie).", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { range: "3.6 - 4.0", label: "Ausreichend", desc: "Bestanden. Fokus sollte auf Ausbildung oder zulassungsfreien Hochschulen liegen.", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" }
      ],
      en: [
          { range: "9 - 8 (A*)", label: "Exceptional / Outstanding", desc: "Top tier. Required for Oxbridge, Imperial, and competitive Russell Group courses (Medicine, Law).", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { range: "7 (A)", label: "Excellent", desc: "High standard. Solid entry for most Russell Group universities.", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { range: "6 - 5", label: "Strong Pass (High B/C)", desc: "Good standard. Accepted for most Foundation degrees and mid-tier universities.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
          { range: "4", label: "Standard Pass (C)", desc: "Minimum requirement for many jobs and Sixth Form entry.", color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" }
      ]
  };


  // Initialize Dark Mode & PWA
  useEffect(() => {
    // Check local storage or system pref
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
    } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
    }

    if (typeof window !== 'undefined') {
      setQrSource(window.location.href);
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // Close menus when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setShowMenu(false);
        }
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
            setShowMobileMenu(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);

  // Update Quote on Language Change
  useEffect(() => {
    const list = QUOTES[language];
    setDailyQuote(list[Math.floor(Math.random() * list.length)]);
  }, [language]);

  const toggleDarkMode = () => {
      if (isDarkMode) {
          document.documentElement.classList.remove('dark');
          localStorage.theme = 'light';
          setIsDarkMode(false);
      } else {
          document.documentElement.classList.add('dark');
          localStorage.theme = 'dark';
          setIsDarkMode(true);
      }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setInstallTab(isIOS ? 'ios' : 'android');
      setShowInstallModal(true);
    }
  };

  const handleCalculateAndAnalyze = async (avg: number) => {
    setCurrentAverage(avg);
    setIsAnalyzing(true);
    
    // Summary uses the latest state which is already in currentGradeLevel/currentCourses
    const summary = `Notendurchschnitt: ${avg.toFixed(2)}, Stufe: ${currentGradeLevel}, Kurse: ${currentCourses.map(c => `${c.name} (${c.grade})`).join(', ')}`;
    setContextSummary(summary);

    try {
      const result = await analyzeAcademicProfile(avg, currentGradeLevel, currentCourses, language);
      setAnalysisResult(result);
      
      setTimeout(() => {
        const resultsEl = document.getElementById('results-container');
        if (resultsEl) {
            // Check if we are on mobile to scroll
            if (window.innerWidth < 1024) {
                resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
      }, 100);
      
    } catch (error: any) {
      console.error("Analysis failed", error);
      alert(`Problem analyzing profile: ${error.message}. Please try again.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrSource);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '6767') {
      setIsAdmin(true);
      setShowLogin(false);
      setPinInput('');
      setLoginError(false);
      if(hasStarted) setIsChatOpen(true);
    } else {
      setLoginError(true);
      setPinInput('');
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsChatOpen(false);
  };

  const toggleLanguage = () => {
    const newLang = language === 'de' ? 'en' : 'de';
    setLanguage(newLang);

    // INTELLIGENT MAPPING logic...
    const translateMapDeToEn: Record<string, string> = {
        'Mathematik': 'Math', 'Deutsch': 'German', 'Englisch': 'English', 'Biologie': 'Biology', 'Geschichte': 'History'
    };
    const translateMapEnToDe: Record<string, string> = {
        'Math': 'Mathematik', 'German': 'Deutsch', 'English': 'Englisch', 'Biology': 'Biologie', 'History': 'Geschichte'
    };

    const mapGrade = (grade: string, toEn: boolean): string => {
        if (toEn) {
            if (['1+', '1', '1-'].includes(grade)) return '9';
            if (['2+', '2', '2-'].includes(grade)) return '7';
            if (['3+', '3', '3-'].includes(grade)) return '5';
            if (['4+', '4', '4-'].includes(grade)) return '4';
            if (['5+', '5', '5-'].includes(grade)) return '2';
            if (grade === '6') return 'U';
            return '5'; // default
        } else {
            if (['9', '9+', '9'].includes(grade)) return '1';
            if (['8', '8+', '8'].includes(grade)) return '1-';
            if (['7', '7+', '7'].includes(grade)) return '2';
            if (['6', '6+', '6'].includes(grade)) return '2-';
            if (['5', '5+', '5'].includes(grade)) return '3';
            if (['4', '4+', '4'].includes(grade)) return '4';
            if (['3', '2', '1'].includes(grade)) return '5';
            if (grade === 'U') return '6';
            return '3'; // default
        }
    };

    setCurrentCourses(prev => prev.map(c => ({
        ...c,
        name: newLang === 'en' ? (translateMapDeToEn[c.name] || c.name) : (translateMapEnToDe[c.name] || c.name),
        grade: mapGrade(c.grade, newLang === 'en')
    })));

    if (newLang === 'en') {
        if (currentGradeLevel.includes('10')) setCurrentGradeLevel(GradeLevel.Y11);
        else if (currentGradeLevel.includes('Q')) setCurrentGradeLevel(GradeLevel.Y13);
        else if (currentGradeLevel.includes('5')) setCurrentGradeLevel(GradeLevel.Y7);
        else setCurrentGradeLevel(GradeLevel.Y10);
    } else {
        if (currentGradeLevel.includes('11')) setCurrentGradeLevel(GradeLevel.Ten);
        else if (currentGradeLevel.includes('13') || currentGradeLevel.includes('12')) setCurrentGradeLevel(GradeLevel.Q1);
        else if (currentGradeLevel.includes('7')) setCurrentGradeLevel(GradeLevel.Five);
        else setCurrentGradeLevel(GradeLevel.Ten);
    }
  };

  const handleBackToStart = () => {
      setHasStarted(false);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrSource)}`;
  const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');

  // -------- START SCREEN (MODERN VIBRANT) --------
  if (!hasStarted) {
    return (
      <div className={`fixed inset-0 font-['Inter'] overflow-hidden flex flex-col items-center justify-center p-6 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
         
         {/* ADAPTIVE VIBRANT BACKGROUND */}
         <div className={`absolute inset-0 animate-gradient-xy transition-opacity duration-1000 ${isDarkMode ? 'bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 opacity-100' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-fuchsia-50 opacity-100'}`}></div>
         
         {/* Floating Blobs for Atmosphere (Adaptive) */}
         <div className={`absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] rounded-full blur-[100px] animate-pulse ${isDarkMode ? 'bg-violet-600/40' : 'bg-violet-400/20'}`}></div>
         <div className={`absolute bottom-[-10%] right-[-10%] w-[50vh] h-[50vh] rounded-full blur-[100px] animate-pulse delay-1000 ${isDarkMode ? 'bg-fuchsia-600/40' : 'bg-fuchsia-400/20'}`}></div>
         
         {/* Noise Texture for Professional Polish (Visible on Dark) */}
         {isDarkMode && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>}

         {/* HEADER - SETTINGS MENU */}
         <div className="absolute top-6 right-6 z-40" ref={menuRef}>
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`p-3 rounded-full backdrop-blur-xl shadow-lg border transition-all ${isDarkMode ? 'bg-black/20 border-white/20 hover:bg-white/10 text-white' : 'bg-white/60 border-white/40 hover:bg-white/80 text-slate-700'}`}
            >
                <MoreVertical className="w-6 h-6" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
                <div className={`absolute right-0 mt-3 w-56 backdrop-blur-xl rounded-2xl shadow-2xl border p-2 animate-in zoom-in-95 origin-top-right z-50 ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/90 border-white/50'}`}>
                    
                    <button onClick={toggleLanguage} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left text-sm font-bold ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                        <Languages className="w-4 h-4 text-fuchsia-400" />
                        <span>{language === 'de' ? 'Sprache: Deutsch' : 'Language: English'}</span>
                    </button>

                    <button onClick={toggleDarkMode} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left text-sm font-bold ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                        {isDarkMode ? <Moon className="w-4 h-4 text-violet-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                        <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                    </button>
                    
                    <button onClick={() => setShowGradeInfo(true)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left text-sm font-bold ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                        <Scale className="w-4 h-4 text-blue-400" />
                        <span>Info</span>
                    </button>

                    <div className={`h-px my-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

                    <button onClick={isAdmin ? handleLogout : () => setShowLogin(true)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left text-sm font-bold ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
                        {isAdmin ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-400" />}
                        <span>{isAdmin ? 'Admin Active' : 'Admin Login'}</span>
                    </button>
                </div>
            )}
         </div>

         {/* MAIN CENTERED CARD */}
         <div className="relative z-10 w-full max-w-lg text-center animate-in slide-in-from-bottom-8 duration-1000">
             
             {/* 3D Glowing Icon */}
             <div className="relative mx-auto w-32 h-32 mb-8 group perspective-1000">
                 <div className={`absolute inset-0 rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-500 animate-pulse ${isDarkMode ? 'bg-violet-500' : 'bg-violet-400'}`}></div>
                 <div className="relative w-full h-full bg-gradient-to-br from-violet-600 to-fuchsia-500 rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-white/20 transform group-hover:rotate-6 transition-transform duration-500">
                    {isAdmin ? (
                        <ShieldCheck className="w-16 h-16 text-white drop-shadow-md" />
                    ) : (
                        <GraduationCap className="w-16 h-16 text-white drop-shadow-md" />
                    )}
                 </div>
             </div>

             <h1 className={`text-6xl sm:text-7xl font-black tracking-tighter mb-2 drop-shadow-lg ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                GradePath
             </h1>
             <p className={`text-lg sm:text-xl font-medium mb-10 tracking-wide ${isDarkMode ? 'text-violet-100/80' : 'text-slate-600'}`}>
                 {(t as any).welcomeSubtitle}
             </p>

             <button
                onClick={() => setHasStarted(true)}
                className={`group relative inline-flex items-center justify-center px-8 py-5 text-lg font-bold transition-all duration-200 backdrop-blur-md border rounded-full hover:scale-105 active:scale-95 w-full sm:w-auto min-w-[200px] ${isDarkMode ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-[0_0_30px_rgba(167,139,250,0.3)] hover:shadow-[0_0_50px_rgba(167,139,250,0.5)]' : 'bg-white/70 border-white/60 text-violet-700 hover:bg-white/90 shadow-xl shadow-violet-200/50'}`}
             >
                <span className="mr-3">{(t as any).getStarted}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>

             {/* Daily Quote Pill */}
             <div className="mt-12 mx-auto max-w-sm">
                <div className={`backdrop-blur-md rounded-2xl p-4 border text-center transition-all cursor-default ${isDarkMode ? 'bg-black/20 border-white/5 hover:bg-black/30' : 'bg-white/40 border-white/40 hover:bg-white/50'}`}>
                    <div className="flex justify-center mb-2">
                        <Quote className={`w-4 h-4 opacity-80 ${isDarkMode ? 'text-fuchsia-300' : 'text-fuchsia-600'}`} />
                    </div>
                    <p className={`text-sm italic leading-relaxed ${isDarkMode ? 'text-violet-100' : 'text-slate-700'}`}>"{dailyQuote.text}"</p>
                </div>
             </div>

             <div className={`mt-8 text-xs font-bold tracking-widest uppercase ${isDarkMode ? 'text-white/30' : 'text-slate-400'}`}>
                 By Azez • AI Powered
             </div>
         </div>

         {/* Login Modal */}
         {showLogin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
                <div className="bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-xs w-full relative animate-in zoom-in-95 duration-300 border border-slate-700">
                    <button 
                    onClick={() => { setShowLogin(false); setPinInput(''); }}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full transition-all"
                    >
                    <X className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-slate-700">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">System Access</h3>
                        <form onSubmit={handleLogin} className="relative">
                            <input 
                                type="password" 
                                inputMode="numeric"
                                maxLength={4}
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                className={`w-full bg-black border-2 rounded-xl py-3 px-4 text-center text-2xl font-bold tracking-widest focus:outline-none transition-all ${loginError ? 'border-red-500 text-red-500' : 'border-slate-700 focus:border-emerald-500 text-white'}`}
                                placeholder="••••"
                                autoFocus
                            />
                            <button type="submit" className="w-full mt-4 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50">
                                Unlock
                            </button>
                        </form>
                    </div>
                </div>
            </div>
         )}

         {/* Grade Info Modal */}
         {showGradeInfo && (
             <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
                 <div className="bg-slate-900 rounded-[2rem] shadow-2xl p-6 sm:p-8 max-w-lg w-full relative animate-in slide-in-from-bottom-10 duration-300 border border-slate-700 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <button 
                        onClick={() => setShowGradeInfo(false)}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl text-indigo-400">
                            <Scale className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">{(t as any).gradeInfoTitle}</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{language === 'de' ? 'Offizielle Daten (Deutschland)' : 'Official Data (UK)'}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {(language === 'de' ? officialGradeInfo.de : officialGradeInfo.en).map((info, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border border-slate-800 bg-slate-800/50`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`text-lg font-black ${info.color}`}>{info.range}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full bg-black/30 ${info.color}`}>{info.label}</span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                    {info.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                    
                    <button 
                        onClick={() => setShowGradeInfo(false)}
                        className="w-full mt-6 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-500 transition-colors"
                    >
                        Alles klar
                    </button>
                 </div>
             </div>
         )}
      </div>
    );
  }

  // -------- MAIN APP RENDER --------
  return (
    <div className={`min-h-screen text-slate-800 dark:text-slate-100 flex flex-col overflow-x-hidden relative font-['Inter'] transition-colors duration-500 ${isAdmin ? 'bg-slate-950' : 'bg-slate-50 dark:bg-slate-900'}`}>
      
      {/* GLOBAL BACKGROUND - FIXED TO PREVENT MOBILE SCROLL JUMP */}
      <div className={`fixed inset-0 -z-10 ${
          isAdmin 
          ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-black animate-gradient-xy' 
          : 'bg-slate-50 dark:bg-slate-900'
      }`}></div>
      
      {/* Noise Overlay - Admin Only */}
      {isAdmin && <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay -z-10 pointer-events-none"></div>}
      
      {/* Navbar */}
      <header className={`backdrop-blur-xl border-b sticky top-0 z-40 shadow-sm transition-colors ${isAdmin ? 'bg-slate-900/80 border-slate-700' : 'bg-white/60 dark:bg-slate-900/60 border-white/40 dark:border-slate-800'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-2 sm:gap-4">
              {/* Home / Back to Start Button */}
              <button 
                onClick={handleBackToStart}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-white/50 dark:hover:bg-slate-800 transition-all"
                title={(t as any).backToStart}
              >
                  <Home className="w-5 h-5" />
              </button>

              {/* Logo Section */}
              <div className="flex items-center gap-2 sm:gap-3 select-none">
                <div className={`p-2 sm:p-2.5 rounded-xl shadow-lg transition-transform duration-300 ${isAdmin ? 'bg-slate-800 shadow-emerald-900/20 border border-emerald-500/30' : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-violet-500/20'}`}>
                  <GraduationCap className={`w-5 h-5 sm:w-6 sm:h-6 ${isAdmin ? 'text-emerald-500' : 'text-white'}`} />
                </div>
                <div className="hidden sm:flex flex-col justify-center">
                  <h1 className={`text-lg sm:text-2xl font-black tracking-tight ${isAdmin ? 'text-emerald-500' : 'bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400'}`}>
                    {isAdmin ? 'SYSTEM_OVERRIDE' : 'GradePath'}
                  </h1>
                  {!isAdmin && <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider leading-none">by Azez</span>}
                </div>
              </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-white/40 dark:bg-slate-800/50 p-1 rounded-xl mx-2 border border-white/50 dark:border-slate-700 shrink-0 backdrop-blur-md">
             <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeView === 'dashboard' ? (isAdmin ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-sm') : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >
                <LayoutDashboard className="w-4 h-4" />
                <span className="inline">{t.navCheck}</span>
             </button>
             <button
                onClick={() => setActiveView('exercises')}
                className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeView === 'exercises' ? (isAdmin ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-sm') : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >
                <BrainCircuit className="w-4 h-4" />
                <span className="inline">{t.navPractice}</span>
             </button>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Desktop Security Tools Group (Hidden on Mobile) */}
            <div className={`hidden md:flex items-center rounded-xl p-1 mr-2 border ${isAdmin ? 'bg-slate-800 border-slate-700' : 'bg-white/40 dark:bg-slate-800/50 border-white/50 dark:border-slate-700 backdrop-blur-sm'}`}>
               <button 
                 onClick={() => setShowPrivacyInfo(true)}
                 className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${isAdmin ? 'text-slate-400 hover:text-white' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700'}`}
                 title="Privacy Status: Secure"
               >
                 <ShieldCheck className="w-4 h-4" />
                 <span className="text-xs font-bold hidden md:inline">Anon</span>
               </button>

               <div className={`w-px h-4 mx-1 ${isAdmin ? 'bg-slate-600' : 'bg-slate-300 dark:bg-slate-700'}`}></div>

               <button 
                 onClick={() => setIsBlurred(!isBlurred)}
                 className={`p-1.5 rounded-lg transition-all ${
                     isBlurred 
                        ? (isAdmin ? 'bg-emerald-900/30 text-emerald-400' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-300') 
                        : (isAdmin ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700')
                 }`}
                 title={isBlurred ? "Show Content" : "Hide Content (Stealth Mode)"}
               >
                 {isBlurred ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
               </button>
            </div>

            {/* Mobile Menu Button (Visible on Mobile) */}
            <div className="md:hidden relative" ref={mobileMenuRef}>
                 <button 
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className={`p-2 rounded-xl transition-all ${isAdmin ? 'text-emerald-500 bg-slate-800' : 'text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50'}`}
                 >
                    <MoreVertical className="w-5 h-5" />
                 </button>

                 {/* Mobile Dropdown */}
                 {showMobileMenu && (
                     <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-50 animate-in zoom-in-95 origin-top-right">
                         <button 
                            onClick={() => { setIsChatOpen(true); setShowMobileMenu(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm font-bold text-slate-700 dark:text-slate-200"
                         >
                            <MessageCircle className="w-4 h-4 text-violet-500" />
                            AI Coach
                         </button>
                         <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
                         <button 
                            onClick={() => { setIsBlurred(!isBlurred); setShowMobileMenu(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm font-bold text-slate-700 dark:text-slate-200"
                         >
                            {isBlurred ? <Eye className="w-4 h-4 text-violet-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                            {isBlurred ? 'Show Content' : 'Stealth Mode'}
                         </button>
                         <button 
                            onClick={() => { setShowPrivacyInfo(true); setShowMobileMenu(false); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm font-bold text-slate-700 dark:text-slate-200"
                         >
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Privacy Info
                         </button>
                     </div>
                 )}
            </div>

            {/* Install Button */}
            <button 
              onClick={handleInstallClick}
              className={`flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl transition-all ${isAdmin ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-300'}`}
              title={t.installApp}
            >
              <Download className="w-5 h-5" />
            </button>

            {/* QR Code */}
            <button 
              onClick={() => setShowQr(true)}
              className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-white shadow-lg transition-all duration-300 border border-white/20 hover:scale-105 active:scale-95 ${isAdmin ? 'bg-slate-800 shadow-emerald-900/20 hover:bg-slate-700 text-emerald-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-violet-200 dark:shadow-none hover:shadow-violet-300'}`}
            >
              <QrCode className="w-5 h-5" />
              <span className="font-bold text-sm hidden sm:inline">{t.mobileAccess}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 relative z-10 pb-24 sm:pb-32 transition-all duration-500 ${isBlurred ? 'blur-xl opacity-50 select-none pointer-events-none grayscale' : ''}`}>
        
        {activeView === 'dashboard' ? (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[auto] lg:min-h-[600px] h-full">
                {/* Left Column: Grade Input */}
                <div className="lg:col-span-5 flex flex-col h-full">
                    <div className={`${isAdmin ? 'opacity-80 grayscale hover:grayscale-0 transition-all' : ''} h-full`}>
                        <GradeCalculator 
                        key={`calc-${sessionKey}`} // Changing key forces re-render (reset)
                        courses={currentCourses}
                        setCourses={setCurrentCourses}
                        gradeLevel={currentGradeLevel}
                        setGradeLevel={setCurrentGradeLevel}
                        onCalculate={handleCalculateAndAnalyze} 
                        isAnalyzing={isAnalyzing}
                        language={language}
                        />
                    </div>
                </div>

                {/* Right Column: Results */}
                <div id="results-container" className="lg:col-span-7 flex flex-col h-full">
                    {/* Header for Results */}
                    <div className="flex items-center gap-2 mb-4 sm:mb-6 pl-1 mt-4 lg:mt-0">
                        <div className={`p-1.5 rounded-lg shadow-sm ${isAdmin ? 'bg-slate-800' : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-md'}`}>
                            <Sparkles className={`w-5 h-5 ${isAdmin ? 'text-emerald-500' : 'text-amber-500'}`} />
                        </div>
                        <h2 className={`text-lg sm:text-xl font-bold ${isAdmin ? 'text-slate-200' : 'text-slate-700 dark:text-slate-200'}`}>{t.resultsHeader}</h2>
                    </div>
                    
                    {/* Results Card */}
                    <div className={`flex-1 backdrop-blur-xl rounded-[2rem] border shadow-xl overflow-hidden relative min-h-[400px] ${isAdmin ? 'bg-slate-800/50 border-slate-700 shadow-black/50' : 'bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-slate-700/60 shadow-slate-200/50 dark:shadow-black/20'}`}>
                        <div className={`absolute inset-0 bg-gradient-to-b pointer-events-none ${isAdmin ? 'from-slate-800/40 to-transparent' : 'from-white/20 dark:from-slate-900/20 to-transparent'}`}></div>
                        <ResultsDashboard 
                            key={`results-${sessionKey}`}
                            results={analysisResult} 
                            gpa={currentAverage} 
                            courses={currentCourses}
                            gradeLevel={currentGradeLevel}
                            language={language}
                        />
                    </div>
                </div>
            </div>
        ) : (
            <div className="min-h-[70vh] h-full">
                <div className={`h-full w-full max-w-6xl mx-auto backdrop-blur-xl rounded-[2rem] border shadow-xl overflow-hidden relative ${isAdmin ? 'bg-slate-800/50 border-slate-700 shadow-black/50' : 'bg-white/60 dark:bg-slate-800/60 border-white/40 dark:border-slate-700/60 shadow-slate-200/50 dark:shadow-black/20'}`}>
                    <ExerciseHub gradeLevel={currentGradeLevel} language={language} />
                </div>
            </div>
        )}
      </main>
      
      {/* Lock Overlay when Blurred */}
      {isBlurred && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white dark:border-slate-700 flex flex-col items-center animate-in zoom-in-95 duration-300 pointer-events-auto">
             <div className="bg-violet-100 dark:bg-violet-900/30 p-4 rounded-full mb-4">
                <EyeOff className="w-8 h-8 text-violet-600 dark:text-violet-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Privater Modus Aktiv</h3>
             <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Deine Daten sind verborgen.</p>
             <button 
                onClick={() => setIsBlurred(false)}
                className="px-6 py-2 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors"
             >
                Anzeigen
             </button>
          </div>
        </div>
      )}

      {/* Chat Widget */}
      {!isBlurred && (
        <div>
            <ChatWidget 
            key={`chat-${sessionKey}-${isAdmin}-${language}`}
            contextSummary={contextSummary} 
            isOpen={isChatOpen} 
            setIsOpen={setIsChatOpen} 
            isAdmin={isAdmin}
            language={language}
            />
        </div>
      )}

      {/* Privacy Info Modal */}
      {showPrivacyInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 max-w-sm w-full relative animate-in zoom-in-95 duration-300 border border-white/50 dark:border-slate-700">
            <button 
              onClick={() => setShowPrivacyInfo(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Deine Sicherheit</h3>
                <div className="mt-4 space-y-3 text-left">
                    <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600 text-sm flex gap-3">
                        <div className="min-w-[4px] bg-emerald-400 rounded-full"></div>
                        <div>
                            <p className="font-bold text-slate-700 dark:text-slate-200">Anonym & Lokal</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">Deine Noten verlassen nie dieses Gerät. Alles wird im Browser berechnet.</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600 text-sm flex gap-3">
                        <div className="min-w-[4px] bg-violet-400 rounded-full"></div>
                        <div>
                            <p className="font-bold text-slate-700 dark:text-slate-200">Kein Login</p>
                            <p className="text-slate-500 dark:text-slate-400 text-xs">Du benötigst keinen Account. Starte einfach und schließe den Tab, um alles zu löschen.</p>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => setShowPrivacyInfo(false)}
                    className="w-full mt-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                    Alles klar
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Install Instructions Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 max-w-sm w-full relative animate-in zoom-in-95 duration-300 border border-white/50 dark:border-slate-700">
            <button 
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3 text-violet-600 dark:text-violet-400">
                    <Download className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t.installApp}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Wähle dein Gerät für die Anleitung.</p>
            </div>

            {/* OS Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-700 rounded-xl mb-6">
              <button 
                onClick={() => setInstallTab('android')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${installTab === 'android' ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                Android
              </button>
              <button 
                onClick={() => setInstallTab('ios')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${installTab === 'ios' ? 'bg-white dark:bg-slate-600 text-violet-600 dark:text-violet-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                iOS / iPhone
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 text-left">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-xl border border-slate-100 dark:border-slate-600 min-h-[140px]">
                {installTab === 'android' ? (
                  <div className="space-y-3">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-600 pb-2 mb-2">
                        <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
                        Android (Chrome)
                    </div>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 flex items-center justify-center text-xs font-bold shrink-0 text-slate-400 dark:text-slate-300">1</span>
                          <span className="leading-snug">Tippe oben rechts auf das <span className="font-bold text-slate-800 dark:text-slate-200">Drei-Punkte-Menü</span> <MoreVertical className="w-3 h-3 inline align-middle" /></span>
                      </li>
                      <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 flex items-center justify-center text-xs font-bold shrink-0 text-slate-400 dark:text-slate-300">2</span>
                          <span className="leading-snug">Wähle <span className="font-bold text-slate-800 dark:text-slate-200">"App installieren"</span> oder <span className="font-bold text-slate-800 dark:text-slate-200">"Zum Startbildschirm"</span></span>
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-200 dark:border-slate-600 pb-2 mb-2">
                        <Smartphone className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                        iOS (Safari)
                    </div>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 flex items-center justify-center text-xs font-bold shrink-0 text-slate-400 dark:text-slate-300">1</span>
                          <span className="leading-snug">Tippe unten in der Leiste auf <span className="font-bold text-blue-600 dark:text-blue-400">Teilen</span> <Share className="w-3 h-3 inline align-middle" /></span>
                      </li>
                      <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 flex items-center justify-center text-xs font-bold shrink-0 text-slate-400 dark:text-slate-300">2</span>
                          <span className="leading-snug">Scrolle nach unten und wähle <span className="font-bold text-slate-800 dark:text-slate-200">"Zum Home-Bildschirm"</span></span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full relative animate-in zoom-in-95 duration-300 border border-white/50 dark:border-slate-700">
            <button 
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Auf's Handy übertragen</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Scanne den Code mit deiner Kamera.</p>
              </div>
              
              <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 dark:border-slate-600 shadow-inner mx-auto inline-block relative group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 rounded-xl blur-xl opacity-50"></div>
                <img 
                  src={qrApiUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 object-contain relative z-10"
                />
              </div>

              {/* Editable URL Section */}
              <div className="space-y-2 pt-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Verlinkte Adresse (Editierbar)</p>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-700 p-2 pl-3 rounded-xl border border-slate-200 dark:border-slate-600 focus-within:ring-2 focus-within:ring-violet-200 focus-within:border-violet-400 transition-all">
                  <div className="shrink-0 text-slate-400 dark:text-slate-500"><Edit2 className="w-3 h-3" /></div>
                  <input 
                    type="text" 
                    value={qrSource} 
                    onChange={(e) => setQrSource(e.target.value)}
                    className="bg-transparent w-full text-xs text-slate-600 dark:text-slate-300 font-mono outline-none truncate"
                  />
                  <button 
                    onClick={handleCopyUrl}
                    className={`p-2 rounded-lg transition-all shrink-0 ${copySuccess ? 'bg-green-500 text-white' : 'bg-white dark:bg-slate-600 shadow-sm text-slate-500 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-300'}`}
                  >
                    {copySuccess ? <Sparkles className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isLocalhost && (
                <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium p-3 rounded-xl text-left border border-amber-100 dark:border-amber-800 leading-tight">
                  ⚠️ <strong>Localhost erkannt:</strong> Das Scannen funktioniert evtl. nicht, da dein Handy "localhost" nicht finden kann. Ersetze oben im Feld "localhost" durch die lokale IP deines PCs (z.B. 192.168.x.x).
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
