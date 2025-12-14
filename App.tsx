import React, { useState, useEffect, useRef } from 'react';
import GradeCalculator from './components/GradeCalculator';
import ResultsDashboard from './components/ResultsDashboard';
import ChatWidget from './components/ChatWidget';
import ExerciseHub from './components/ExerciseHub';
import { Course, GradeLevel, AnalysisResult, Language, TRANSLATIONS, Theme } from './types';
import { analyzeAcademicProfile } from './services/geminiService';
import { 
  GraduationCap, Sparkles, QrCode, X, Smartphone, Download, Share, MoreVertical, Copy, ShieldCheck, 
  Eye, EyeOff, Lock, Unlock, Edit2, BrainCircuit, LayoutDashboard, Languages, Moon, Sun, ArrowRight, 
  Play, Home, Scale, Radio, Volume2, VolumeX, Quote, MessageCircle, 
  // Theme Icons
  Ghost, Gift, Rocket, Zap, Coffee, Trees, BookOpen, PenTool, ClipboardList, Library, Gamepad2, 
  Leaf, CloudRain, Umbrella, Bug, Circle, Cloud, Flower2, Lamp, Search, Hourglass, CloudMoon, Star, CloudFog,
  Heart, Music, Triangle, AlertTriangle, CloudLightning, Wind, Eraser, Ruler, Disc, Utensils, Glasses,
  IceCream, Sprout, Droplets, Timer, Files, Puzzle, MonitorPlay
} from 'lucide-react';

// --- GENERIC ANIMATED BACKGROUND COMPONENT ---
interface ThemeRainProps {
  items: string[];
  colors?: string; // Tailwind text color class
  count?: number;
  glow?: boolean;
}

const ThemeRain: React.FC<ThemeRainProps> = ({ items, colors = "text-white", count = 50, glow = false }) => {
  // Generate static items to avoid re-renders causing jumps
  const [elements] = useState(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 8 + 12}s`, // Slow, floaty
    animationDelay: `${Math.random() * 10}s`,
    opacity: Math.random() * 0.6 + 0.4, // Higher opacity as requested
    size: Math.random() * 1.5 + 1 + 'rem',
    item: items[Math.floor(Math.random() * items.length)]
  })));

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {elements.map(el => (
        <div
          key={el.id}
          className={`absolute select-none animate-snowfall drop-shadow-md ${colors} ${glow ? 'blur-[1px]' : ''}`}
          style={{
            left: el.left,
            top: '-50px',
            fontSize: el.size,
            opacity: el.opacity,
            animationDuration: el.animationDuration,
            animationDelay: el.animationDelay,
            textShadow: glow ? '0 0 10px currentColor' : '0 2px 4px rgba(0,0,0,0.3)',
            filter: glow ? 'brightness(1.5)' : 'none'
          }}
        >
          {el.item}
        </div>
      ))}
    </div>
  );
};

// --- THEME DECORATIONS (ALIVE, TRANSPARENT, SPACIOUS WIDGETS) ---
const ThemeDecorations: React.FC<{ theme: Theme, isDarkMode: boolean }> = ({ theme, isDarkMode }) => {
    switch (theme) {
        case 'halloween':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {/* Hanging Spider - Top Right */}
                    <div className="absolute -top-10 right-10 flex flex-col items-center animate-in slide-in-from-top duration-[2000ms] opacity-90">
                        <div className="w-0.5 h-32 bg-slate-400/50"></div>
                        <Bug className="w-20 h-20 text-slate-800 dark:text-slate-200 animate-bounce drop-shadow-xl" style={{ animationDuration: '3s' }} />
                    </div>
                    {/* Floating Ghost - Bottom Left */}
                    <div className="absolute bottom-20 -left-6 opacity-80 animate-pulse" style={{ animationDuration: '4s' }}>
                        <Ghost className="w-32 h-32 text-slate-300 drop-shadow-2xl rotate-12" />
                    </div>
                    {/* Fog - Bottom Right */}
                    <div className="absolute -bottom-10 -right-10 opacity-60">
                        <CloudFog className="w-64 h-64 text-purple-800/40 dark:text-purple-400/20" />
                    </div>
                </div>
            );
        case 'christmas':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {/* Hanging Ornament - Top Left */}
                    <div className="absolute -top-4 left-10 flex flex-col items-center animate-in slide-in-from-top duration-[1500ms] opacity-90">
                        <div className="w-0.5 h-24 bg-red-300/50"></div>
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 to-red-800 shadow-xl border-4 border-white/20 flex items-center justify-center animate-spin-slow">
                                <Sparkles className="w-12 h-12 text-white/60" />
                            </div>
                        </div>
                    </div>
                    {/* Gift - Bottom Right */}
                    <div className="absolute bottom-8 right-8 rotate-[-12deg] opacity-90 hover:scale-110 transition-transform duration-500">
                        <Gift className="w-32 h-32 text-red-600 fill-red-100 drop-shadow-2xl" />
                    </div>
                </div>
            );
        case 'space':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {/* Rocket - Bottom Left (Launching) */}
                    <div className="absolute -bottom-10 -left-10 transform -rotate-45 animate-in slide-in-from-bottom-20 duration-[3000ms] opacity-80">
                        <Rocket className="w-48 h-48 text-indigo-500 drop-shadow-[0_0_50px_rgba(99,102,241,0.6)]" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-10 h-40 bg-gradient-to-b from-orange-500 to-transparent blur-2xl"></div>
                    </div>
                    {/* Astronaut/Star - Top Right */}
                    <div className="absolute top-10 right-10 animate-pulse opacity-90" style={{ animationDuration: '6s' }}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-yellow-100/20 blur-xl rounded-full"></div>
                            <Star className="w-32 h-32 text-yellow-200 fill-yellow-100 drop-shadow-[0_0_30px_rgba(253,224,71,0.6)] rotate-12" />
                        </div>
                    </div>
                </div>
            );
        case 'library':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {/* Vintage Lamp - Top Right (Hanging) */}
                    <div className="absolute -top-10 right-16 flex flex-col items-center animate-in slide-in-from-top duration-1000 opacity-90">
                        <div className="w-1 h-40 bg-[#2a1b12] shadow-xl"></div>
                        <div className="relative">
                            <Lamp className="w-24 h-24 text-[#eaddcf] fill-[#eaddcf]/90 drop-shadow-[0_20px_60px_rgba(255,220,100,0.6)]" />
                            {/* Glow */}
                            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-yellow-100/10 blur-3xl rounded-full"></div>
                        </div>
                    </div>
                    {/* Open Book & Quill - Bottom Left */}
                    <div className="absolute bottom-10 left-10 opacity-80 rotate-3">
                        <BookOpen className="w-32 h-32 text-[#5c4033] fill-[#f5f5dc] drop-shadow-xl" />
                        <PenTool className="w-16 h-16 text-[#3e2b22] absolute -top-8 -right-4 -rotate-12 drop-shadow-md" />
                    </div>
                </div>
            );
        case 'nature':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {/* Hanging Vines - Top Left */}
                    <div className="absolute -top-10 -left-10 text-emerald-800 dark:text-emerald-400 opacity-80 animate-in slide-in-from-top duration-[2s]">
                        <Trees className="w-64 h-64 -translate-x-4 -translate-y-4 filter drop-shadow-lg" />
                    </div>
                    {/* Floating Leaf - Top Right */}
                    <div className="absolute top-20 -right-10 text-emerald-600 opacity-60 transform rotate-45 blur-[1px] animate-pulse" style={{ animationDuration: '6s' }}>
                        <Leaf className="w-32 h-32" />
                    </div>
                    {/* Flower - Bottom Right */}
                    <div className="absolute bottom-10 right-10 text-pink-400 opacity-80 animate-bounce" style={{ animationDuration: '4s' }}>
                        <Flower2 className="w-24 h-24 drop-shadow-lg" />
                    </div>
                </div>
            );
        case 'coffee':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Steam rising - Bottom Right */}
                    <div className="fixed bottom-0 -right-10 flex gap-4 opacity-30 z-50">
                        <div className="w-16 h-80 bg-gradient-to-t from-white to-transparent blur-3xl rounded-full animate-pulse" style={{ animationDuration: '4s' }}></div>
                        <div className="w-20 h-96 bg-gradient-to-t from-white to-transparent blur-3xl rounded-full animate-pulse delay-700" style={{ animationDuration: '6s' }}></div>
                    </div>
                    {/* Coffee Cup - Top Left */}
                    <div className="absolute top-10 left-10 opacity-90 rotate-[-12deg]">
                        <Coffee className="w-32 h-32 text-[#6f4e37] drop-shadow-2xl" />
                        <div className="absolute -top-10 left-4 w-full flex justify-center gap-2 opacity-40">
                             <div className="w-2 h-12 bg-white/50 rounded-full blur-sm animate-pulse"></div>
                             <div className="w-2 h-16 bg-white/50 rounded-full blur-sm animate-pulse delay-300"></div>
                        </div>
                    </div>
                </div>
            );
        case 'summer':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {/* Blazing Sun - Top Right */}
                    <div className="absolute -top-20 -right-20 animate-spin-slow opacity-90">
                        <Sun className="w-64 h-64 text-orange-400/80 fill-yellow-300 drop-shadow-[0_0_50px_rgba(253,186,116,0.8)]" />
                    </div>
                    {/* Ice Cream - Bottom Left */}
                    <div className="absolute bottom-10 left-10 opacity-90 rotate-12 z-50 animate-bounce" style={{ animationDuration: '3s' }}>
                        <IceCream className="w-40 h-40 text-pink-400 fill-pink-100 drop-shadow-2xl" />
                    </div>
                </div>
            );
        case 'pixel':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50 font-mono">
                    {/* Scanlines */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_4px,3px_100%] pointer-events-none z-[60]"></div>
                    {/* Invader - Top Left */}
                    <Gamepad2 className="absolute top-10 left-10 w-32 h-32 text-[#0f380f]/60 animate-bounce drop-shadow-md" style={{ animationDuration: '3s' }} />
                    {/* Hearts - Top Right */}
                    <div className="absolute top-10 right-10 flex gap-2 opacity-90">
                        <Heart className="w-10 h-10 text-[#0f380f] fill-[#0f380f]" />
                        <Heart className="w-10 h-10 text-[#0f380f] fill-[#0f380f]" />
                        <Heart className="w-10 h-10 text-[#0f380f] fill-transparent border-4 border-[#0f380f] animate-pulse" />
                    </div>
                </div>
            );
        case 'neon':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {/* Floating Triangle - Top Right */}
                    <div className="absolute top-20 right-20 opacity-80 animate-spin-slow">
                        <Triangle className="w-40 h-40 text-cyan-400 stroke-[1] fill-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]" />
                    </div>
                    {/* Floating Circle - Bottom Left */}
                    <div className="absolute bottom-20 left-20 opacity-80 animate-pulse" style={{ animationDuration: '4s' }}>
                        <Circle className="w-32 h-32 text-fuchsia-500 stroke-[3] fill-transparent drop-shadow-[0_0_20px_rgba(232,121,249,0.8)]" />
                    </div>
                    {/* Lightning - Top Left (Small) */}
                    <div className="absolute top-32 left-10 opacity-60">
                        <Zap className="w-16 h-16 text-yellow-400 fill-yellow-200 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] -rotate-12" />
                    </div>
                </div>
            );
        case 'school':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {/* Pencil - Bottom Left */}
                    <div className="absolute bottom-10 -left-4 transform rotate-12 opacity-80 hover:translate-x-4 transition-transform">
                        <Edit2 className="w-48 h-48 text-blue-600 fill-blue-100 drop-shadow-xl" />
                    </div>
                    {/* A+ - Top Right */}
                    <div className="absolute top-10 right-10 opacity-30 rotate-12">
                        <div className="text-9xl font-black text-blue-900 leading-none drop-shadow-sm">A+</div>
                    </div>
                    {/* Ruler - Top Left */}
                    <div className="absolute top-20 -left-10 rotate-45 opacity-60">
                        <Ruler className="w-40 h-40 text-slate-500/50" />
                    </div>
                </div>
            );
        case 'chalkboard':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Formulas - Top Left */}
                    <div className="absolute top-16 left-10 opacity-40 text-white font-serif text-7xl rotate-[-6deg] tracking-widest blur-[1px]">
                        E = mc²
                    </div>
                    {/* Pen/Chalk - Bottom Right */}
                    <div className="absolute bottom-10 right-10 opacity-80 text-white">
                        <PenTool className="w-32 h-32 drop-shadow-2xl -rotate-90" />
                    </div>
                    {/* Eraser - Bottom Left */}
                    <div className="absolute bottom-20 left-20 opacity-60 rotate-12">
                        <Eraser className="w-24 h-24 text-stone-300 drop-shadow-lg" />
                    </div>
                </div>
            );
        case 'exam':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Clock - Top Right */}
                    <div className="absolute top-10 right-10 opacity-90 animate-pulse" style={{ animationDuration: '2s' }}>
                        <Timer className="w-48 h-48 text-red-700 drop-shadow-2xl" />
                    </div>
                    {/* Papers - Bottom Left */}
                    <div className="absolute bottom-10 left-10 opacity-80 rotate-6">
                        <Files className="w-40 h-40 text-slate-700 fill-white drop-shadow-xl" />
                    </div>
                    {/* Warning - Top Left */}
                    <div className="absolute top-20 left-20 opacity-40 rotate-[-12deg]">
                        <AlertTriangle className="w-32 h-32 text-red-600" />
                    </div>
                </div>
            );
        case 'spring':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {/* Flowers - Bottom Right */}
                    <div className="absolute bottom-10 -right-4 text-pink-500 opacity-80 animate-bounce" style={{ animationDuration: '5s' }}>
                        <Flower2 className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-xl -rotate-12" />
                    </div>
                    {/* Sprout - Top Left */}
                    <div className="absolute top-20 left-10 opacity-90 animate-in slide-in-from-bottom duration-[3s]">
                         <Sprout className="w-32 h-32 text-green-600 fill-green-100 drop-shadow-lg" />
                         <Droplets className="w-8 h-8 text-blue-400 absolute -top-4 right-0 animate-bounce" style={{ animationDuration: '2s' }} />
                    </div>
                    {/* Floating Petal - Top Right */}
                    <div className="absolute top-40 right-20 text-pink-300 opacity-60 rotate-45 blur-[1px]">
                        <Circle className="w-10 h-10 sm:w-12 sm:h-12 rounded-full scale-y-50" />
                    </div>
                </div>
            );
        case 'autumn':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    {/* Falling Leaf 1 - Top Left */}
                    <div className="absolute top-10 -left-6 text-orange-600/90 rotate-12 animate-in slide-in-from-top duration-[4s]">
                        <Leaf className="w-40 h-40 drop-shadow-xl" />
                    </div>
                    {/* Falling Leaf 2 - Bottom Right */}
                    <div className="absolute bottom-20 -right-6 text-red-700/80 -rotate-45 animate-pulse" style={{ animationDuration: '5s' }}>
                        <Leaf className="w-56 h-56 drop-shadow-2xl" />
                    </div>
                    {/* Wind Swirl - Bottom Left */}
                    <div className="absolute bottom-10 left-20 opacity-40">
                        <Wind className="w-32 h-32 text-slate-400 rotate-12" />
                    </div>
                </div>
            );
        case 'night':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    {/* Moon - Top Right */}
                    <div className="absolute top-10 right-10 text-indigo-200/60 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        <CloudMoon className="w-48 h-48" />
                    </div>
                    {/* Star - Bottom Left */}
                    <div className="absolute bottom-20 left-10 text-yellow-100/40 animate-pulse" style={{ animationDuration: '3s' }}>
                        <Star className="w-24 h-24 fill-yellow-100/20" />
                    </div>
                    {/* Cloud - Top Left */}
                    <div className="absolute top-32 left-0 text-slate-500/20 blur-sm">
                        <Cloud className="w-64 h-64" />
                    </div>
                </div>
            );
        default:
            return null;
    }
};

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
  
  // Theme & Music State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>('default');
  const [isRainActive, setIsRainActive] = useState(true); // For transition delay
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Theme Transition Logic: Pause rain for 1s on theme change
  useEffect(() => {
      setIsRainActive(false);
      const timer = setTimeout(() => {
          setIsRainActive(true);
      }, 1000); // Reduced to 1s
      return () => clearTimeout(timer);
  }, [currentTheme]);

  // --- AUDIO LOGIC ---
  const PLAYLIST = [
    { title: "Lofi Study", url: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3", icon: Radio, color: "text-rose-500" }
  ];

  const [currentSong, setCurrentSong] = useState(PLAYLIST[0]);

  // Dedicated Music Selector Function
  const handleMusicSelect = () => {
      if (isMusicPlaying) {
          setIsMusicPlaying(false);
      } else {
          setIsMusicPlaying(true);
      }
  };

  // Handle Playback State
  useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      if (isMusicPlaying) {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
              playPromise.catch((error) => {
                  console.log("Playback interaction required or interrupted:", error);
                  if (error.name === 'NotAllowedError') {
                    setIsMusicPlaying(false); 
                  }
              });
          }
      } else {
          audio.pause();
      }
  }, [isMusicPlaying]);

  const handleAudioError = () => {
      console.warn("Audio stream error for URL:", currentSong.url);
      setIsMusicPlaying(false);
      alert(`Could not play "${currentSong.title}". Please select another track.`);
  };

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
            // Smooth scroll to results
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // -------- THEME UTILS --------
  
  // Dynamic Button Class Generator based on Theme (Start Screen & App)
  const getThemeButtonClass = () => {
      switch (currentTheme) {
          case 'christmas':
              return 'bg-red-600 border-red-500 text-white hover:bg-red-500 shadow-xl shadow-red-900/50 font-serif';
          case 'school':
              return 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-xl font-sans';
          case 'chalkboard':
              return 'bg-white text-black border-white hover:bg-gray-200 shadow-xl font-serif font-bold tracking-widest';
          case 'exam':
              return 'bg-black text-white border-black hover:bg-gray-800 shadow-xl font-mono uppercase tracking-tighter';
          case 'pixel':
              return 'bg-[#8b9c0f] text-[#0f380f] border-4 border-[#0f380f] hover:bg-[#9bbc0f] shadow-[4px_4px_0px_0px_rgba(15,56,15,1)] font-mono tracking-widest uppercase rounded-none hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-none';
          case 'neon':
              return 'bg-black border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-900/20 shadow-[0_0_15px_rgba(232,121,249,0.5)] font-sans tracking-wide rounded-none';
          case 'space':
              return 'bg-indigo-900/80 border border-indigo-400 text-indigo-100 hover:bg-indigo-800 shadow-[0_0_20px_rgba(99,102,241,0.4)] backdrop-blur-md rounded-full';
          case 'halloween':
              return 'bg-purple-900 border border-orange-500 text-orange-400 hover:bg-purple-800 font-serif tracking-wider shadow-lg rounded-xl';
          case 'coffee':
              return 'bg-[#6f4e37] text-[#f5f5dc] border border-[#4a3525] hover:bg-[#5d4037] shadow-md font-serif rounded-lg';
          case 'nature':
              return 'bg-emerald-700 text-emerald-50 border border-emerald-600 hover:bg-emerald-600 shadow-lg font-sans rounded-2xl';
          case 'spring':
              return 'bg-pink-400 text-white border-pink-300 hover:bg-pink-500 shadow-lg font-sans rounded-3xl';
          case 'summer':
              return 'bg-orange-400 text-white border-orange-300 hover:bg-orange-500 shadow-lg font-sans rounded-2xl';
          case 'night':
              return 'bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700 shadow-lg shadow-blue-900/20 rounded-full';
          case 'library':
              return 'bg-[#8b4513] text-[#f5f5dc] border border-[#5c4033] hover:bg-[#a0522d] shadow-sm font-serif rounded-lg';
          case 'autumn':
              return 'bg-orange-600 text-white border border-orange-500 hover:bg-orange-500 shadow-lg font-serif rounded-xl';
          default:
              return isDarkMode 
                ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-[0_0_30px_rgba(167,139,250,0.3)]' 
                : 'bg-white/70 border-white/60 text-violet-700 hover:bg-white/90 shadow-xl shadow-violet-200/50';
      }
  };

  // -------- RENDER SETTINGS MENU ITEM HELPERS --------
  const ThemeButton = ({ themeId, label, color }: { themeId: Theme, label: string, color: string }) => (
      <button 
        onClick={() => setCurrentTheme(themeId)}
        className={`p-2 rounded-lg text-[10px] font-bold border transition-all truncate ${currentTheme === themeId ? `ring-2 ring-offset-1 ring-violet-400 ${color} shadow-sm` : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
        style={currentTheme === themeId ? {} : {}}
      >
        {label}
      </button>
  );

  const SettingsMenuContent = () => {
    return (
    <div className="space-y-3 w-full max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
        <div className="flex items-center justify-between px-1">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Theme</span>
        </div>
        
        {/* Academic */}
        <div>
            <span className="text-[10px] font-bold text-slate-400 pl-1 mb-1 block">Academic</span>
            <div className="grid grid-cols-3 gap-2">
                <ThemeButton themeId="default" label="Default" color="bg-violet-100 text-violet-700 border-violet-300" />
                <ThemeButton themeId="school" label="School" color="bg-blue-100 text-blue-700 border-blue-300" />
                <ThemeButton themeId="chalkboard" label="Chalk" color="bg-emerald-900 text-emerald-100 border-emerald-700" />
                <ThemeButton themeId="library" label="Library" color="bg-[#eaddcf] text-[#5c4033] border-[#c0a080]" />
                <ThemeButton themeId="exam" label="Exam" color="bg-white text-black border-slate-400" />
            </div>
        </div>

        {/* Seasonal */}
        <div>
            <span className="text-[10px] font-bold text-slate-400 pl-1 mb-1 block">Seasonal</span>
            <div className="grid grid-cols-3 gap-2">
                <ThemeButton themeId="spring" label="Spring" color="bg-pink-100 text-pink-700 border-pink-300" />
                <ThemeButton themeId="summer" label="Summer" color="bg-yellow-100 text-amber-700 border-amber-300" />
                <ThemeButton themeId="autumn" label="Autumn" color="bg-orange-100 text-orange-800 border-orange-300" />
                <ThemeButton themeId="halloween" label="Spooky" color="bg-purple-900 text-orange-400 border-orange-500" />
                <ThemeButton themeId="christmas" label="Xmas" color="bg-red-100 text-red-700 border-red-300" />
            </div>
        </div>

        {/* Creative & Aesthetic */}
        <div>
            <span className="text-[10px] font-bold text-slate-400 pl-1 mb-1 block">Creative</span>
            <div className="grid grid-cols-3 gap-2">
                <ThemeButton themeId="pixel" label="Retro" color="bg-gray-200 text-green-700 border-gray-400 font-mono" />
                <ThemeButton themeId="space" label="Space" color="bg-indigo-950 text-indigo-200 border-indigo-700" />
                <ThemeButton themeId="neon" label="Neon" color="bg-black text-fuchsia-400 border-fuchsia-500" />
                <ThemeButton themeId="coffee" label="Coffee" color="bg-[#dcc8b8] text-[#4a3525] border-[#9c7c64]" />
                <ThemeButton themeId="nature" label="Nature" color="bg-green-100 text-green-800 border-green-300" />
                <ThemeButton themeId="night" label="Night" color="bg-slate-800 text-slate-300 border-slate-600" />
            </div>
        </div>

        <div className={`h-px my-2 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

        {/* Lofi Radio - Placed ABOVE Language */}
        <button onClick={handleMusicSelect} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left text-sm font-bold min-h-[44px] ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
            {isMusicPlaying ? <Volume2 className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" /> : <VolumeX className="w-5 h-5 text-slate-400 shrink-0" />}
            <div className="flex flex-col">
                <span>{t.lofiRadio}</span>
                {isMusicPlaying && <span className="text-[10px] text-emerald-500 font-medium">Playing Lofi Beats</span>}
            </div>
        </button>

        <button onClick={toggleLanguage} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left text-sm font-bold min-h-[44px] ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
            <Languages className="w-5 h-5 text-fuchsia-400 shrink-0" />
            <span>{language === 'de' ? 'Sprache: Deutsch' : 'Language: English'}</span>
        </button>

        <button onClick={toggleDarkMode} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left text-sm font-bold min-h-[44px] ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
            {isDarkMode ? <Moon className="w-5 h-5 text-violet-400 shrink-0" /> : <Sun className="w-5 h-5 text-amber-500 shrink-0" />}
            <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        
        <button onClick={() => setShowGradeInfo(true)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left text-sm font-bold min-h-[44px] ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
            <Scale className="w-5 h-5 text-blue-400 shrink-0" />
            <span>Info</span>
        </button>

        <div className={`h-px my-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

        <button onClick={isAdmin ? handleLogout : () => setShowLogin(true)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left text-sm font-bold min-h-[44px] ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
            {isAdmin ? <Unlock className="w-5 h-5 text-emerald-400 shrink-0" /> : <Lock className="w-5 h-5 text-slate-400 shrink-0" />}
            <span>{isAdmin ? 'Admin Active' : 'Admin Login'}</span>
        </button>
    </div>
    );
  };

  // Helper to get App Background Classes based on Theme
  // NOTE: This must allow the fixed background layers to show through.
  const getAppBackground = () => {
    if (isAdmin) return 'bg-slate-950';
    return 'bg-transparent'; 
  };

  // Helper for Theme-specific fixed backgrounds
  const renderThemeBackgrounds = () => {
      // Admin Overlay
      if (isAdmin) {
          return <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay -z-10 pointer-events-none"></div>;
      }
      
      let bgLayer = null;
      let animLayer = null;

      switch (currentTheme) {
          case 'christmas':
              bgLayer = <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-red-950 via-slate-900 to-emerald-950"></div>;
              if (isRainActive) animLayer = <ThemeRain items={['❄️', '⛄', '🎄', '🎁', '✨']} colors="text-white opacity-80" />;
              break;
          case 'school':
              bgLayer = (
                 <div className="fixed inset-0 z-[-1] bg-[#fdfbf7]" style={{
                     backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px)',
                     backgroundSize: '100% 2rem'
                 }}></div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['✏️', '📏', '📐', '🎒', '🖇️', '📝']} colors="text-slate-400 opacity-60" />;
              break;
          case 'chalkboard':
              bgLayer = (
                <div className="fixed inset-0 z-[-1] bg-[#2d3436] overflow-hidden border-[16px] border-[#5d4037]">
                    <div className="absolute inset-0 bg-[#3b6045] opacity-90"></div>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.15),_transparent_70%)]"></div>
                </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['∑', 'π', '√', 'x', 'y', '÷', '∞', '+', '-', '∫']} colors="text-white font-serif font-bold opacity-90" count={40} />;
              break;
          case 'library':
               bgLayer = (
                <div className="fixed inset-0 z-[-1] bg-[#4a3b32] flex flex-col justify-between">
                    {/* Improved Bookshelf Effect */}
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-1 border-b-[24px] border-[#2a1b12] shadow-2xl relative overflow-hidden bg-[#3e2b22] flex items-end">
                             {/* Book Spines */}
                             <div className="w-full h-2/3 flex items-end justify-center px-10 gap-1 opacity-60">
                                {Array.from({length: 20}).map((_, j) => (
                                    <div key={j} className="w-8 sm:w-12 h-full rounded-t-sm border-l border-white/10" 
                                    style={{ 
                                        height: `${Math.random() * 40 + 60}%`, 
                                        backgroundColor: `hsl(${Math.random() * 40 + 10}, ${Math.random() * 30 + 20}%, ${Math.random() * 20 + 20}%)` 
                                    }}></div>
                                ))}
                             </div>
                             <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none"></div>
                        </div>
                    ))}
                </div>
               );
               break;
          case 'exam':
               bgLayer = (
                <div className="fixed inset-0 z-[-1] bg-white">
                    {/* Graph Paper Pattern */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)',
                        backgroundSize: '20px 20px'
                    }}></div>
                    {/* Margin Line */}
                    <div className="absolute left-8 sm:left-12 top-0 bottom-0 w-0.5 bg-red-400/50 shadow-sm"></div>
                </div>
               );
               if (isRainActive) animLayer = <ThemeRain items={['⏱️', 'A+', '📝', '❓', '❗', '1.0', 'F', 'C']} colors="text-red-600 font-bold opacity-80" count={30} />;
               break;
          case 'spring':
              bgLayer = (
                <div className="fixed inset-0 z-[-1] bg-[#ffecf2] overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffcce0_0%,_transparent_60%)]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vmin] h-[90vmin] rounded-full bg-pink-300 opacity-20 blur-3xl"></div>
                    <div className="absolute top-1/3 left-1/3 w-[40vmin] h-[40vmin] rounded-full bg-pink-400 opacity-10 blur-2xl"></div>
                </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🌸', '💮', '🌱', '🐝', '🍡']} colors="text-pink-500 opacity-80" />;
              break;
          case 'summer':
              bgLayer = (
                <div className="fixed inset-0 z-[-1] flex flex-col">
                    <div className="flex-1 bg-gradient-to-b from-[#4facfe] to-[#00f2fe]"></div>
                    <div className="h-[25%] bg-[#f6d365] bg-gradient-to-b from-[#f2d2a9] to-[#d4af37]"></div>
                </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🦀', '🏖️', '🌊', '🐚', '🍦']} colors="text-orange-500 opacity-90" />;
              break;
          case 'autumn':
              bgLayer = (
                <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-orange-50 via-orange-100 to-amber-200">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🍂', '🍁', '🍄', '🌰', '🧣', '🌧️']} colors="text-orange-800 opacity-80" />;
              break;
          case 'halloween':
              bgLayer = <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-purple-900 to-black"></div>;
              if (isRainActive) animLayer = <ThemeRain items={['🎃', '👻', '🕸️', '🕷️', '🍬', '💀']} colors="text-orange-500 opacity-90" glow />;
              break;
          case 'night':
              bgLayer = (
                <div className="fixed inset-0 z-[-1] bg-[#020617] overflow-hidden">
                    {/* Faint Stars (Static) */}
                    <div className="absolute inset-0 opacity-50" style={{
                        backgroundImage: 'radial-gradient(1px 1px at 10% 10%, white 1px, transparent 0), radial-gradient(1px 1px at 20% 40%, white 1px, transparent 0), radial-gradient(1.5px 1.5px at 30% 70%, white 1px, transparent 0), radial-gradient(1px 1px at 40% 20%, white 1px, transparent 0), radial-gradient(2px 2px at 60% 60%, white 1px, transparent 0), radial-gradient(1px 1px at 80% 30%, white 1px, transparent 0), radial-gradient(1px 1px at 90% 90%, white 1px, transparent 0)',
                        backgroundSize: '500px 500px'
                    }}></div>
                    <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-indigo-950/50 to-transparent"></div>
                </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['⭐', '🌙', '💤', '🦉', '🔭']} colors="text-yellow-200 opacity-60" glow />;
              break;
          case 'pixel':
              bgLayer = (
                <div className="fixed inset-0 z-[-1] bg-[#9bbc0f] flex items-center justify-center">
                    {/* Pixel Grid Texture */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'linear-gradient(#8b9c0f 2px, transparent 2px), linear-gradient(90deg, #8b9c0f 2px, transparent 2px)',
                        backgroundSize: '40px 40px',
                        backgroundPosition: '-2px -2px'
                    }}></div>
                    <div className="absolute inset-0 bg-[#0f380f] opacity-10"></div>
                </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['👾', '🪙', '🍄', '🧱', '🐍']} colors="text-[#333] font-mono opacity-100" count={30} />;
              break;
          case 'space':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-[#0b0b0c] overflow-hidden">
                      {/* CSS Saturn */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-[#ceb888] shadow-[inset_-10px_-10px_30px_rgba(0,0,0,0.5)]"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[60px] rounded-[50%] border-[16px] border-[#a09070] border-t-transparent/30 rotate-12 opacity-80"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🪐', '⭐', '☄️', '🛸', '🛰️']} colors="text-white opacity-80" glow />;
              break;
          case 'neon':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-[#050505]">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.2)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%]"></div>
                      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-fuchsia-900/20 to-transparent opacity-50"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['⚡', '👾', '🕹️', '💾', '💿']} colors="text-fuchsia-400 opacity-80" glow />;
              break;
          case 'coffee':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-[#e3dcd2]">
                      {/* Cafe Wall Texture */}
                      <div className="absolute inset-0 opacity-10" style={{
                          backgroundImage: 'linear-gradient(to right, #8b5e3c 1px, transparent 1px), linear-gradient(to bottom, #8b5e3c 1px, transparent 1px)',
                          backgroundSize: '40px 40px'
                      }}></div>
                      {/* Warm Gradient Overlay (Cozy Lighting) */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#c9b49c]/40 via-transparent to-[#5d4037]/20"></div>
                      
                      {/* Decorative Circle (Abstract Art on Wall) */}
                      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#d7ccc8] rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
                      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#a1887f] rounded-full blur-3xl opacity-40 mix-blend-multiply"></div>

                      <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['☕', '🥐', '🥯', '🍪', '🤎', '🍂']} colors="text-[#5d4037] opacity-60" />;
              break;
          // DEFAULT CASE MUST PROVIDE A BACKGROUND IF ONE DOESN'T EXIST
          default:
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-slate-50 dark:bg-slate-950 transition-colors duration-500"></div>
              );
              break;
      }

      return (
        <>
            {bgLayer}
            {animLayer}
            <div className={`fixed inset-0 pointer-events-none transition-colors duration-1000 z-[-2] ${getAppBackground()}`}></div>
        </>
      );
  };

  return (
    // REMOVED SOLID BG COLOR FROM ROOT TO ALLOW FIXED BACKGROUNDS TO SHOW
    <div className={`min-h-screen transition-colors duration-500 font-sans selection:bg-violet-200 selection:text-violet-900 ${isDarkMode ? 'dark text-white' : 'text-slate-900'} ${isBlurred ? 'blur-sm' : ''}`}>
      <audio ref={audioRef} src={currentSong.url} loop />
      
      {/* Backgrounds */}
      {renderThemeBackgrounds()}
      <ThemeDecorations theme={currentTheme} isDarkMode={isDarkMode} />

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-sm shadow-2xl scale-100 transition-all border border-slate-100 dark:border-slate-700">
            <h3 className="text-2xl font-black mb-6 text-center text-slate-800 dark:text-white">Admin Access</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className={`w-full p-4 rounded-xl border-2 outline-none text-center text-2xl font-bold tracking-widest transition-all ${
                  loginError 
                    ? 'border-red-500 bg-red-50 text-red-900 shake' 
                    : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 dark:text-white focus:border-violet-500'
                }`}
                autoFocus
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowLogin(false); setPinInput(''); setLoginError(false); }}
                  className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-200/50 dark:shadow-none"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Info Modal */}
      {showGradeInfo && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] border border-slate-100 dark:border-slate-700">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Scale className="w-5 h-5 text-blue-500" />
                            {t.gradeInfoTitle}
                        </h3>
                        <button onClick={() => setShowGradeInfo(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    <div className="overflow-y-auto p-6 space-y-4 custom-scrollbar">
                         {(officialGradeInfo as any)[language].map((item: any, idx: number) => (
                             <div key={idx} className={`p-4 rounded-2xl border border-transparent ${item.bg}`}>
                                 <div className="flex justify-between items-center mb-1">
                                     <span className={`font-black text-lg ${item.color}`}>{item.range}</span>
                                     <span className={`text-xs font-bold uppercase tracking-wider ${item.color}`}>{item.label}</span>
                                 </div>
                                 <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                     {item.desc}
                                 </p>
                             </div>
                         ))}
                    </div>
               </div>
          </div>
      )}

      {!hasStarted ? (
        // --- START SCREEN ---
        <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center z-10">
          
          <div className="absolute top-6 right-6 flex gap-3">
               <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className={`p-3 rounded-full backdrop-blur-md shadow-sm transition-all hover:scale-105 ${isDarkMode ? 'bg-white/10 text-white' : 'bg-white/80 text-slate-700'}`}
               >
                  <MoreVertical className="w-5 h-5" />
               </button>
               {showMenu && (
                   <div ref={menuRef} className="absolute top-14 right-0 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-2 animate-in slide-in-from-top-2 z-50">
                       <SettingsMenuContent />
                   </div>
               )}
          </div>

          <div className="max-w-md w-full animate-in slide-in-from-bottom-8 duration-700">
             <div className="mb-8 relative inline-block">
                <div className={`absolute inset-0 blur-3xl rounded-full opacity-50 ${isDarkMode ? 'bg-violet-900' : 'bg-violet-200'}`}></div>
                <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 transition-transform hover:rotate-6 duration-500 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-violet-600'}`}>
                   <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
             </div>
             
             <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tight leading-tight">
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400">
                  Grade
               </span>
               <span className={isDarkMode ? 'text-white' : 'text-slate-800'}>Path</span>
             </h1>
             <p className="text-xs font-bold text-slate-400 mb-6 tracking-widest uppercase">by Ihssan</p>
             
             <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
               {t.welcomeSubtitle}
             </p>

             {/* Daily Focus Card */}
             <div className="mb-8 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm text-left relative overflow-hidden group hover:-translate-y-1 transition-transform">
                 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-fuchsia-500"></div>
                 <div className="flex items-center gap-2 mb-2">
                     <Quote className="w-4 h-4 text-violet-500" />
                     <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t.dailyFocus}</span>
                 </div>
                 <p className="text-slate-700 dark:text-slate-200 font-serif italic text-lg leading-relaxed mb-2">
                     "{dailyQuote.text}"
                 </p>
                 <p className="text-xs font-bold text-slate-400 text-right">— {dailyQuote.author}</p>
             </div>

             <button
               onClick={() => setHasStarted(true)}
               className={`w-full py-4 sm:py-5 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group ${getThemeButtonClass()}`}
             >
                <span className="relative z-10 flex items-center gap-2">
                   {t.getStarted} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
             </button>
             
             <button
                onClick={() => setShowGradeInfo(true)}
                className="mt-4 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
             >
                 {t.gradeInfoBtn}
             </button>

             <div className="mt-12 flex justify-center gap-4 opacity-50">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Apple_logo_grey.svg/172px-Apple_logo_grey.svg.png" className={`h-6 ${isDarkMode ? 'invert' : ''}`} alt="iOS" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Android_robot.svg/172px-Android_robot.svg.png" className={`h-6 ${isDarkMode ? 'brightness-0 invert' : ''}`} alt="Android" />
             </div>
          </div>
        </div>
      ) : (
        // --- MAIN APP ---
        <div className="relative min-h-screen flex flex-col max-w-5xl mx-auto z-10 px-4 pb-20">
           
           {/* Header */}
           <header className="py-6 flex flex-col relative z-20 gap-4">
               <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-violet-600'}`}>
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="font-black text-xl leading-none dark:text-white">GradePath</h1>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentGradeLevel}</span>
                        </div>
                        {/* Home Button Moved Here */}
                        <button 
                                onClick={() => setHasStarted(false)} 
                                className="ml-2 p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 shadow-sm" 
                                title="Home"
                            >
                                <Home className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <button 
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className={`p-3 rounded-xl transition-all shadow-sm ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
               </div>

               {/* Top Navigation Tabs */}
               <div className="p-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl flex relative backdrop-blur-md w-full">
                    <button 
                        onClick={() => setActiveView('dashboard')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${activeView === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        {t.navCheck}
                    </button>
                    <button 
                        onClick={() => setActiveView('exercises')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all relative z-10 ${activeView === 'exercises' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        {t.navPractice}
                    </button>
               </div>
           </header>

           {/* Mobile Menu Overlay */}
           {showMobileMenu && (
               <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
                   <div 
                      ref={mobileMenuRef}
                      className="absolute top-20 right-4 w-72 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-4 border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-4 space-y-4"
                      onClick={e => e.stopPropagation()}
                   >
                        <SettingsMenuContent />
                        <div className="h-px bg-slate-100 dark:bg-slate-700"></div>
                        <button onClick={() => setHasStarted(false)} className="w-full py-3 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                            <Home className="w-4 h-4" />
                            {t.backToStart}
                        </button>
                   </div>
               </div>
           )}

           {/* Content Area - Vertical Stack for Scrolling */}
           <div className="flex flex-col gap-6 w-full">
               
               {activeView === 'dashboard' ? (
                   <>
                       {/* 1. Calculator Section */}
                       <div className="w-full">
                           <GradeCalculator 
                              courses={currentCourses}
                              setCourses={setCurrentCourses}
                              gradeLevel={currentGradeLevel}
                              setGradeLevel={setCurrentGradeLevel}
                              onCalculate={handleCalculateAndAnalyze}
                              isAnalyzing={isAnalyzing}
                              language={language}
                              currentTheme={currentTheme}
                           />
                       </div>

                       {/* 2. Results Section (Scroll Down Target) */}
                       <div id="results-container" className={`w-full min-h-[500px] rounded-[2.5rem] shadow-2xl p-4 sm:p-8 relative transition-all duration-500 border ${
                            currentTheme === 'christmas' ? 'bg-white/80 border-red-100 shadow-red-100' :
                            currentTheme === 'school' ? 'bg-white/80 border-blue-100 shadow-blue-100' :
                            currentTheme === 'chalkboard' ? 'bg-[#333]/90 border-[#444] shadow-black' :
                            currentTheme === 'pixel' ? 'bg-white border-4 border-[#0f380f] rounded-none' :
                            currentTheme === 'neon' ? 'bg-black/60 border-fuchsia-500/30 shadow-[0_0_30px_rgba(232,121,249,0.1)] rounded-none backdrop-blur-xl' :
                            currentTheme === 'library' ? 'bg-[#fdfbf7]/90 border-[#dcc8b8] shadow-[#dcc8b8]' :
                            'bg-white/60 dark:bg-slate-900/60 border-white/40 dark:border-slate-700/40 backdrop-blur-xl'
                        }`}>
                            <ResultsDashboard 
                                results={analysisResult} 
                                gpa={currentAverage} 
                                courses={currentCourses}
                                gradeLevel={currentGradeLevel}
                                language={language}
                                currentTheme={currentTheme}
                            />
                       </div>
                   </>
               ) : (
                   /* 3. Exercises Section (Separate View) */
                   <div className={`w-full min-h-[600px] rounded-[2.5rem] shadow-2xl p-4 sm:p-8 relative transition-all duration-500 border ${
                        currentTheme === 'christmas' ? 'bg-white/80 border-red-100 shadow-red-100' :
                        currentTheme === 'school' ? 'bg-white/80 border-blue-100 shadow-blue-100' :
                        currentTheme === 'chalkboard' ? 'bg-[#333]/90 border-[#444] shadow-black' :
                        currentTheme === 'pixel' ? 'bg-white border-4 border-[#0f380f] rounded-none' :
                        currentTheme === 'neon' ? 'bg-black/60 border-fuchsia-500/30 shadow-[0_0_30px_rgba(232,121,249,0.1)] rounded-none backdrop-blur-xl' :
                        currentTheme === 'library' ? 'bg-[#fdfbf7]/90 border-[#dcc8b8] shadow-[#dcc8b8]' :
                        'bg-white/60 dark:bg-slate-900/60 border-white/40 dark:border-slate-700/40 backdrop-blur-xl'
                   }`}>
                        <ExerciseHub 
                            gradeLevel={currentGradeLevel} 
                            language={language}
                            currentTheme={currentTheme}
                        />
                   </div>
               )}
           </div>

           {/* Mobile Bottom Nav (Optional: Removed since we have top tabs now, or can keep as redundancy, but user asked for Top Buttons) */}
           {/* Keeping minimal floating action button for Chat if needed, but navigation is handled at top now */}
           <div className="fixed bottom-6 right-6 z-50">
               <button 
                  onClick={() => setIsChatOpen(true)}
                  className="w-14 h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full shadow-lg shadow-violet-200 dark:shadow-none flex items-center justify-center border-4 border-white dark:border-slate-900"
               >
                   <MessageCircle className="w-7 h-7 text-white" />
               </button>
           </div>
           
           <ChatWidget 
              contextSummary={contextSummary}
              isOpen={isChatOpen}
              setIsOpen={setIsChatOpen}
              isAdmin={isAdmin}
              language={language}
           />
        </div>
      )}
    </div>
  );
};

export default App;