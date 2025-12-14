
import React, { useState, useEffect, useRef } from 'react';
import GradeCalculator from './components/GradeCalculator';
import ResultsDashboard from './components/ResultsDashboard';
import ChatWidget from './components/ChatWidget';
import ExerciseHub from './components/ExerciseHub';
import { Course, GradeLevel, AnalysisResult, Language, TRANSLATIONS, Theme } from './types';
import { analyzeAcademicProfile } from './services/geminiService';
import { 
  GraduationCap, Sparkles, X, Smartphone, Share, MoreVertical, Copy, ShieldCheck, 
  Eye, EyeOff, Lock, Unlock, Edit2, BrainCircuit, LayoutDashboard, Languages, Moon, Sun, ArrowRight, 
  Play, Home, Scale, Radio, Volume2, VolumeX, Quote, MessageCircle, PenTool, Eraser, MicOff,
  // Theme Icons
  Ghost, Gift, Rocket, Zap, Coffee, Trees, BookOpen, ClipboardList, Library, Gamepad2, 
  Leaf, CloudRain, Umbrella, Bug, Circle, Cloud, Flower2, Lamp, Search, Hourglass, CloudMoon, Star, CloudFog,
  Heart, Music, Triangle, AlertTriangle, CloudLightning, Wind, Ruler, Disc, Utensils, Glasses,
  IceCream, Sprout, Droplets, Timer, Files, Puzzle, MonitorPlay, Settings, Settings2, Rabbit, PartyPopper, Tent, Anchor, Save, Cpu, Terminal, Snowflake, SunDim,
  Backpack, Monitor, Coins
} from 'lucide-react';

// --- GENERIC ANIMATED BACKGROUND COMPONENT ---
interface ThemeRainProps {
  items: string[];
  colors?: string; // Tailwind text color class
  count?: number;
  glow?: boolean;
}

const ThemeRain: React.FC<ThemeRainProps> = ({ items, colors = "text-white", count = 50, glow = false }) => {
  const [elements] = useState(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDuration: `${Math.random() * 8 + 12}s`, 
    animationDelay: `${Math.random() * 10}s`,
    opacity: Math.random() * 0.6 + 0.4,
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

// --- MISSING COMPONENTS DEFINITIONS ---

const Firework = ({ x, y, onComplete }: { x: number, y: number, onComplete: () => void }) => {
  useEffect(() => {
    const t = setTimeout(onComplete, 1000);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
      {[...Array(8)].map((_, i) => (
        <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
            style={{
                transform: `rotate(${i * 45}deg) translate(30px)`,
                opacity: 0.8
            }}
        ></div>
      ))}
      <div className="absolute w-3 h-3 bg-white rounded-full animate-ping"></div>
    </div>
  );
};

const WhiteboardOverlay = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && isOpen) {
            const resize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.lineCap = 'round';
                    ctx.strokeStyle = '#000';
                    ctx.lineWidth = 4;
                }
            };
            resize();
            window.addEventListener('resize', resize);
            return () => window.removeEventListener('resize', resize);
        }
    }, [isOpen]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext('2d');
        ctx?.beginPath();
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        ctx.lineTo(clientX, clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX, clientY);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-white cursor-crosshair touch-none animate-in fade-in duration-200">
            <div className="absolute top-4 right-4 flex gap-2">
                 <button onClick={() => {
                     const canvas = canvasRef.current;
                     const ctx = canvas?.getContext('2d');
                     if(canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                 }} className="p-3 bg-slate-100 text-slate-600 rounded-full shadow-lg hover:bg-slate-200 transition-colors">
                    <Eraser className="w-6 h-6" />
                 </button>
                 <button onClick={onClose} className="p-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors">
                    <X className="w-6 h-6" />
                </button>
            </div>
             <div className="absolute top-4 left-4 pointer-events-none opacity-50 text-sm font-bold text-slate-400">
                Whiteboard
            </div>
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="w-full h-full block"
            />
        </div>
    );
};

const GemAvatar = ({ mood }: { mood: 'neutral' | 'happy' | 'sad' }) => {
    return (
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-inner border-2 transition-colors duration-500 ${
            mood === 'happy' ? 'bg-emerald-100 border-emerald-200' : mood === 'sad' ? 'bg-rose-100 border-rose-200' : 'bg-violet-100 border-violet-200'
        }`}>
            {mood === 'happy' ? '🤩' : mood === 'sad' ? '🥺' : '🤖'}
        </div>
    );
};

// --- THEME DECORATIONS (ALIVE, TRANSPARENT, SPACIOUS WIDGETS) ---
// Reusable Layout Component for Steampunk-style placement
const BackgroundWidgetLayout = ({ 
    topRightIcon, 
    bottomLeftIcon, 
    trColor, 
    blColor, 
    trAnim = "animate-spin-slow", 
    blAnim = "animate-spin-reverse-slow" 
}: { 
    topRightIcon: React.ReactNode, 
    bottomLeftIcon: React.ReactNode, 
    trColor: string, 
    blColor: string,
    trAnim?: string,
    blAnim?: string
}) => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
        <div className={`absolute -top-10 -right-10 w-64 h-64 opacity-40 ${trAnim} ${trColor}`}>
            {topRightIcon}
        </div>
        <div className={`absolute bottom-20 -left-10 w-40 h-40 opacity-30 ${blAnim} ${blColor}`}>
            {bottomLeftIcon}
        </div>
    </div>
);

const ThemeDecorations: React.FC<{ theme: Theme, isDarkMode: boolean }> = ({ theme, isDarkMode }) => {
    const [chestOpen, setChestOpen] = useState(false);
    const [glitching, setGlitching] = useState(false);
    const [gongHit, setGongHit] = useState(false);
    const [gumballs, setGumballs] = useState<{id: number, color: string, left: string}[]>([]);
    const [ripples, setRipples] = useState<{id: number}[]>([]);
    const [hackMode, setHackMode] = useState(false);

    const triggerHack = () => {
        setGlitching(true);
        setHackMode(true);
        setTimeout(() => {
            setHackMode(false);
            setGlitching(false);
        }, 3000);
    };

    const hitGong = () => {
        setGongHit(true);
        const id = Date.now();
        setRipples(prev => [...prev, { id }]);
        setTimeout(() => setGongHit(false), 300);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 2000);
    };

    const dispenseGumball = () => {
        const colors = ['bg-red-400', 'bg-blue-400', 'bg-yellow-400', 'bg-green-400', 'bg-purple-400'];
        const id = Date.now();
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = `${Math.random() * 60 + 20}%`;
        setGumballs(prev => [...prev, { id, color, left }]);
        setTimeout(() => setGumballs(prev => prev.filter(g => g.id !== id)), 2000);
    };

    // Helper for icons to fill container
    const FullIcon = ({ Icon }: { Icon: React.ElementType }) => <Icon className="w-full h-full" />;

    switch (theme) {
        // --- PRESERVED THEMES (NO CHANGE) ---
        case 'steampunk':
            return (
                <BackgroundWidgetLayout 
                    topRightIcon={<FullIcon Icon={Settings} />}
                    bottomLeftIcon={<FullIcon Icon={Settings2} />}
                    trColor="text-amber-700"
                    blColor="text-stone-600"
                />
            );
        case 'music':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    <div className="absolute top-10 left-10 w-32 h-32 opacity-90 animate-spin-slow">
                        <svg viewBox="0 0 100 100" fill="none" className="drop-shadow-xl">
                            <circle cx="50" cy="50" r="48" fill="#1E1B2E" />
                            <circle cx="50" cy="50" r="40" stroke="#2D2A3E" strokeWidth="2" />
                            <circle cx="50" cy="50" r="32" stroke="#2D2A3E" strokeWidth="2" />
                            <circle cx="50" cy="50" r="24" stroke="#2D2A3E" strokeWidth="2" />
                            <circle cx="50" cy="50" r="16" fill="#F472B6" />
                            <circle cx="50" cy="50" r="3" fill="#1E1B2E" />
                            <path d="M20 50 A 30 30 0 0 1 80 50" stroke="white" strokeWidth="4" strokeOpacity="0.1" strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="absolute bottom-12 right-10 w-32 h-32 opacity-90 animate-bounce" style={{ animationDuration: '3s' }}>
                        <svg viewBox="0 0 100 100" fill="none" className="drop-shadow-xl rotate-12">
                            <path d="M30 70 L30 30 L70 20 L70 60" stroke="#8B5CF6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="25" cy="75" r="10" fill="#A78BFA" transform="rotate(-15 25 75)" />
                            <circle cx="65" cy="65" r="10" fill="#A78BFA" transform="rotate(-15 65 65)" />
                            <path d="M30 40 L70 30" stroke="#8B5CF6" strokeWidth="4" />
                        </svg>
                    </div>
                </div>
            );
        case 'circus':
            return (
                <>
                    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                        <div className="absolute bottom-10 right-10 opacity-90 animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="text-7xl drop-shadow-lg">🍿</div>
                        </div>
                    </div>
                    <div className="absolute bottom-10 left-10 z-50">
                        <button className="group relative transition-transform active:scale-95 hover:scale-105 cursor-pointer">
                            <div className="text-6xl -rotate-12">🎪</div>
                        </button>
                    </div>
                </>
            );
        case 'cyberpunk':
            return (
                <>
                    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-50 ${glitching ? 'animate-pulse opacity-50' : ''}`}>
                        <div className="absolute top-20 right-20 animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="text-green-500 drop-shadow-[0_0_10px_#22c55e]">
                                <Cpu className="w-24 h-24" />
                            </div>
                        </div>
                        <button 
                            onClick={triggerHack}
                            className="absolute bottom-20 left-10 pointer-events-auto bg-black border border-green-500 text-green-500 font-mono px-4 py-2 hover:bg-green-500 hover:text-black transition-colors shadow-[0_0_15px_#22c55e] uppercase tracking-widest flex items-center gap-2 group"
                        >
                            <Terminal className="w-4 h-4 group-hover:animate-pulse" />
                            [ SYSTEM_OVERRIDE ]
                        </button>
                    </div>
                    {hackMode && (
                        <div className="fixed inset-0 z-[100] bg-black font-mono overflow-hidden flex flex-col items-center justify-center pointer-events-none">
                            <div className="text-green-500 text-6xl font-black mb-4 animate-pulse tracking-widest">ACCESSING MAINFRAME...</div>
                            <div className="text-green-800 text-xl opacity-70 w-full break-all p-4 text-center">
                                {Array.from({length: 200}).map(() => Math.random() > 0.5 ? '1' : '0').join('')}
                            </div>
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-green-900/20 animate-pulse"></div>
                        </div>
                    )}
                </>
            );
        case 'candy':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    <div className="absolute top-1/4 -right-10 rotate-12 opacity-90">
                        <div className="w-40 h-40 rounded-full bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_purple,_red)] border-4 border-white shadow-xl animate-spin-slow"></div>
                        <div className="w-4 h-64 bg-white mx-auto mt-[-10px] relative z-[-1]"></div>
                    </div>
                    <div 
                        className="absolute bottom-10 left-10 pointer-events-auto cursor-pointer active:scale-95 transition-transform"
                        onClick={dispenseGumball}
                    >
                        <div className="w-32 h-32 bg-white/30 rounded-full border-4 border-pink-400 flex items-center justify-center relative overflow-hidden backdrop-blur-sm group">
                            <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-red-400"></div>
                            <div className="absolute bottom-8 right-8 w-8 h-8 rounded-full bg-blue-400"></div>
                            <div className="absolute top-10 right-6 w-5 h-5 rounded-full bg-yellow-400"></div>
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold text-pink-600/50 rotate-[-15deg]">PUSH</div>
                        </div>
                        <div className="w-32 h-20 bg-red-500 rounded-b-xl mx-auto mt-[-10px] border-4 border-red-600 relative z-[-1] flex justify-center">
                             <div className="w-10 h-6 bg-black/20 rounded-b-lg mt-1"></div>
                        </div>
                    </div>
                    {gumballs.map(ball => (
                        <div 
                            key={ball.id} 
                            className={`absolute w-8 h-8 rounded-full border-2 border-white shadow-md ${ball.color} animate-in zoom-in slide-in-from-bottom-20 duration-500 ease-out`}
                            style={{ bottom: '10px', left: '100px', transformOrigin: 'center' }}
                        >
                            <div className="absolute top-1 left-2 w-2 h-2 bg-white rounded-full opacity-50"></div>
                        </div>
                    ))}
                </div>
            );
        case 'vaporwave':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    <div className="absolute bottom-0 right-0 opacity-80 mix-blend-overlay">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/f/f0/Head_of_Statue_of_Liberty_1984.jpg" className="w-64 h-auto grayscale contrast-125 mask-image-gradient-b" alt="Statue" style={{ maskImage: 'linear-gradient(to top, black, transparent)' }} />
                    </div>
                    <div className="absolute bottom-20 left-10 animate-bounce pointer-events-auto cursor-pointer hover:rotate-12 transition-transform" style={{ animationDuration: '3s' }}>
                        <Save className="w-24 h-24 text-fuchsia-400 drop-shadow-[5px_5px_0px_#06b6d4]" />
                    </div>
                </div>
            );
        case 'zen':
            return (
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
                    <div className="absolute bottom-10 right-10 flex flex-col items-center opacity-90">
                        <div className="w-12 h-8 bg-stone-400 rounded-full mb-[-2px]"></div>
                        <div className="w-16 h-10 bg-stone-500 rounded-full mb-[-2px]"></div>
                        <div className="w-24 h-14 bg-stone-600 rounded-full"></div>
                    </div>
                    <div className="absolute top-20 left-10 pointer-events-auto cursor-pointer" onClick={hitGong}>
                        <div className={`w-32 h-32 rounded-full border-8 border-[#2c2c2c] bg-gradient-to-br from-[#d4af37] to-[#8a6e25] shadow-2xl flex items-center justify-center transition-transform origin-top ${gongHit ? 'animate-wiggle' : ''}`}>
                            <div className="w-4 h-4 bg-[#2c2c2c] rounded-full opacity-50"></div>
                        </div>
                    </div>
                    {ripples.map(ripple => (
                        <div 
                            key={ripple.id}
                            className="absolute top-20 left-10 w-32 h-32 rounded-full border-4 border-[#d4af37]/50 animate-ping pointer-events-none"
                            style={{ animationDuration: '2s' }}
                        ></div>
                    ))}
                </div>
            );

        // --- CONVERTED THEMES (STEAMPUNK LAYOUT) ---
        case 'plush':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Heart} />} bottomLeftIcon={<FullIcon Icon={Cloud} />} trColor="text-rose-400" blColor="text-pink-300" trAnim="animate-pulse" blAnim="animate-bounce" />;
        case 'newyear':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={PartyPopper} />} bottomLeftIcon={<FullIcon Icon={Star} />} trColor="text-yellow-400" blColor="text-yellow-600" trAnim="animate-pulse" blAnim="animate-spin-slow" />;
        case 'deepsea':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Anchor} />} bottomLeftIcon={<FullIcon Icon={Cloud} />} trColor="text-blue-300" blColor="text-cyan-600" trAnim="animate-pulse" blAnim="animate-bounce" />; // Cloud used as generic organic shape/bubble
        case 'christmas':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Snowflake} />} bottomLeftIcon={<FullIcon Icon={Gift} />} trColor="text-white" blColor="text-red-600" trAnim="animate-spin-slow" blAnim="animate-bounce" />;
        case 'halloween':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Ghost} />} bottomLeftIcon={<FullIcon Icon={Bug} />} trColor="text-white" blColor="text-purple-600" trAnim="animate-bounce" blAnim="animate-spin-slow" />;
        case 'space':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Rocket} />} bottomLeftIcon={<FullIcon Icon={Moon} />} trColor="text-white" blColor="text-yellow-200" trAnim="animate-spin-slow" blAnim="animate-pulse" />;
        case 'coffee':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Coffee} />} bottomLeftIcon={<FullIcon Icon={Utensils} />} trColor="text-[#4a3525]" blColor="text-[#8b4513]" trAnim="animate-pulse" blAnim="animate-bounce" />;
        case 'pixel':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Gamepad2} />} bottomLeftIcon={<FullIcon Icon={Monitor} />} trColor="text-[#0f380f]" blColor="text-[#9bbc0f]" trAnim="animate-bounce" blAnim="animate-pulse" />;
        case 'school':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Backpack} />} bottomLeftIcon={<FullIcon Icon={Ruler} />} trColor="text-blue-600" blColor="text-yellow-500" trAnim="animate-pulse" blAnim="animate-spin-slow" />;
        case 'chalkboard':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Edit2} />} bottomLeftIcon={<FullIcon Icon={Eraser} />} trColor="text-white" blColor="text-gray-400" trAnim="animate-bounce" blAnim="animate-pulse" />;
        case 'library':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Library} />} bottomLeftIcon={<FullIcon Icon={BookOpen} />} trColor="text-[#5c4033]" blColor="text-[#8b4513]" trAnim="animate-pulse" blAnim="animate-bounce" />;
        case 'exam':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Files} />} bottomLeftIcon={<FullIcon Icon={Timer} />} trColor="text-black" blColor="text-red-600" trAnim="animate-pulse" blAnim="animate-spin-slow" />;
        case 'summer':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Sun} />} bottomLeftIcon={<FullIcon Icon={IceCream} />} trColor="text-yellow-400" blColor="text-pink-400" trAnim="animate-spin-slow" blAnim="animate-bounce" />;
        case 'autumn':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Wind} />} bottomLeftIcon={<FullIcon Icon={Leaf} />} trColor="text-orange-300" blColor="text-orange-600" trAnim="animate-pulse" blAnim="animate-bounce" />;
        case 'neon':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Zap} />} bottomLeftIcon={<FullIcon Icon={Triangle} />} trColor="text-fuchsia-400" blColor="text-cyan-400" trAnim="animate-pulse" blAnim="animate-spin-slow" />;
        case 'night':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Moon} />} bottomLeftIcon={<FullIcon Icon={CloudMoon} />} trColor="text-slate-200" blColor="text-indigo-400" trAnim="animate-pulse" blAnim="animate-bounce" />;
        case 'spring':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Flower2} />} bottomLeftIcon={<FullIcon Icon={Sprout} />} trColor="text-pink-400" blColor="text-green-500" trAnim="animate-spin-slow" blAnim="animate-bounce" />;
        case 'nature':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Trees} />} bottomLeftIcon={<FullIcon Icon={Leaf} />} trColor="text-green-700" blColor="text-emerald-500" trAnim="animate-pulse" blAnim="animate-bounce" />;
        case 'easter':
            return <BackgroundWidgetLayout topRightIcon={<FullIcon Icon={Rabbit} />} bottomLeftIcon={<FullIcon Icon={Circle} />} trColor="text-white" blColor="text-pink-300" trAnim="animate-bounce" blAnim="animate-pulse" />;
        
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
  
  // Fireworks State (New Year Theme)
  const [fireworks, setFireworks] = useState<{id: number, x: number, y: number}[]>([]);
  
  // Feature States
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  
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

  // Handle background clicks for Fireworks
  const handleBackgroundClick = (e: React.MouseEvent) => {
      if (currentTheme !== 'newyear') return;
      
      const newFirework = {
          id: Date.now(),
          x: e.clientX,
          y: e.clientY
      };
      setFireworks(prev => [...prev, newFirework]);
  };

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
          case 'plush':
              return 'bg-rose-300 border-b-4 border-rose-400 text-white rounded-full hover:bg-rose-400 active:border-b-0 active:translate-y-1 transition-all';
          case 'music':
              return 'bg-violet-400 border-b-4 border-violet-500 text-white rounded-full hover:bg-violet-500 active:border-b-0 active:translate-y-1 transition-all';
          case 'steampunk':
              return 'bg-[#2b2b2b] border-2 border-[#cd7f32] text-[#cd7f32] font-mono tracking-widest hover:bg-[#3d3d3d] shadow-[0_0_10px_#cd7f32] rounded-2xl';
          case 'easter':
              return 'bg-yellow-300 border-b-4 border-yellow-400 text-green-700 font-bold rounded-full hover:bg-yellow-200 active:border-b-0 active:translate-y-1';
          case 'circus':
              return 'bg-red-600 border-4 border-yellow-400 text-white font-black tracking-wider shadow-lg hover:bg-red-500 rounded-2xl';
          case 'newyear':
              return 'bg-black border border-yellow-500 text-yellow-400 font-bold tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.5)] hover:bg-slate-900 rounded-2xl';
          case 'christmas':
              return 'bg-red-600 border-red-500 text-white hover:bg-red-500 shadow-xl shadow-red-900/50 font-serif rounded-2xl';
          case 'school':
              return 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-xl font-sans rounded-2xl';
          case 'chalkboard':
              return 'bg-white text-black border-white hover:bg-gray-200 shadow-xl font-serif font-bold tracking-widest rounded-2xl';
          case 'exam':
              return 'bg-black text-white border-black hover:bg-gray-800 shadow-xl font-mono uppercase tracking-tighter rounded-2xl';
          case 'pixel':
              return 'bg-[#8b9c0f] text-[#0f380f] border-4 border-[#0f380f] hover:bg-[#9bbc0f] shadow-[4px_4px_0px_0px_rgba(15,56,15,1)] font-mono tracking-widest uppercase rounded-2xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-none';
          case 'neon':
              return 'bg-black border border-fuchsia-500 text-fuchsia-400 hover:bg-fuchsia-900/20 shadow-[0_0_15px_rgba(232,121,249,0.5)] font-sans tracking-wide rounded-2xl';
          case 'space':
              return 'bg-indigo-900/80 border border-indigo-400 text-indigo-100 hover:bg-indigo-800 shadow-[0_0_20px_rgba(99,102,241,0.4)] backdrop-blur-md rounded-full';
          case 'halloween':
              return 'bg-purple-900 border border-orange-500 text-orange-400 hover:bg-purple-800 font-serif tracking-wider shadow-lg rounded-2xl';
          case 'coffee':
              return 'bg-[#6f4e37] text-[#f5f5dc] border border-[#4a3525] hover:bg-[#5d4037] shadow-md font-serif rounded-2xl';
          case 'nature':
              return 'bg-emerald-700 text-emerald-50 border border-emerald-600 hover:bg-emerald-600 shadow-lg font-sans rounded-2xl';
          case 'spring':
              return 'bg-pink-400 text-white border-pink-300 hover:bg-pink-500 shadow-lg font-sans rounded-3xl';
          case 'summer':
              return 'bg-orange-400 text-white border-orange-300 hover:bg-orange-500 shadow-lg font-sans rounded-2xl';
          case 'night':
              return 'bg-slate-800 text-slate-200 border border-slate-600 hover:bg-slate-700 shadow-lg shadow-blue-900/20 rounded-full';
          case 'library':
              return 'bg-[#8b4513] text-[#f5f5dc] border border-[#5c4033] hover:bg-[#a0522d] shadow-sm font-serif rounded-2xl';
          case 'autumn':
              return 'bg-orange-600 text-white border border-orange-500 hover:bg-orange-500 shadow-lg font-serif rounded-3xl';
          case 'deepsea':
              return 'bg-blue-900 border-2 border-blue-400 text-blue-100 rounded-3xl shadow-lg shadow-blue-900/50 hover:bg-blue-800';
          case 'cyberpunk':
              return 'bg-black border border-green-500 text-green-500 font-mono uppercase hover:bg-green-500 hover:text-black shadow-[0_0_10px_#22c55e] rounded-2xl';
          case 'candy':
              return 'bg-pink-300 border-b-4 border-pink-400 text-white rounded-full font-bold hover:bg-pink-400 active:border-b-0 active:translate-y-1';
          case 'vaporwave':
              return 'bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white rounded-2xl border-b-4 border-fuchsia-700 hover:brightness-110';
          case 'zen':
              return 'bg-[#a8a29e] text-white border border-[#78716c] rounded-full hover:bg-[#78716c] shadow-sm font-serif tracking-wide';
          default:
              return isDarkMode 
                ? 'bg-white/10 border-white/30 text-white hover:bg-white/20 shadow-[0_0_30px_rgba(167,139,250,0.3)] rounded-2xl' 
                : 'bg-white/70 border-white/60 text-violet-700 hover:bg-white/90 shadow-xl shadow-violet-200/50 rounded-2xl';
      }
  };

  // Dynamic Theme Icon for Header
  const ThemeIcon = () => {
      switch(currentTheme) {
          case 'school': return <Backpack className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'chalkboard': return <Edit2 className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'library': return <Library className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'exam': return <Files className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'summer': return <SunDim className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'autumn': return <Wind className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'halloween': return <Ghost className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'christmas': return <Gift className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'easter': return <Rabbit className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'pixel': return <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'space': return <Rocket className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'neon': return <Zap className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'coffee': return <Coffee className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'nature': return <Trees className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'night': return <Moon className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'cyberpunk': return <Terminal className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'steampunk': return <Settings className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'music': return <Music className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'plush': return <Heart className="w-8 h-8 sm:w-10 sm:h-10" />;
          case 'newyear': return <PartyPopper className="w-8 h-8 sm:w-10 sm:h-10" />;
          default: return <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10" />;
      }
  }

  // -------- RENDER SETTINGS MENU ITEM HELPERS --------
  const ThemeButton = ({ themeId, label, color }: { themeId: Theme, label: string, color: string }) => (
      <button 
        onClick={() => setCurrentTheme(themeId)}
        className={`p-2 rounded-2xl text-[10px] font-bold border transition-all truncate ${currentTheme === themeId ? `ring-2 ring-offset-1 ring-violet-400 ${color} shadow-sm` : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
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
                <ThemeButton themeId="easter" label="Easter" color="bg-yellow-100 text-green-700 border-yellow-300" />
                <ThemeButton themeId="newyear" label="New Year" color="bg-black text-yellow-400 border-yellow-500" />
            </div>
        </div>

        {/* Creative & Aesthetic */}
        <div>
            <span className="text-[10px] font-bold text-slate-400 pl-1 mb-1 block">Creative</span>
            <div className="grid grid-cols-3 gap-2">
                <ThemeButton themeId="plush" label="Plush" color="bg-rose-100 text-rose-600 border-rose-300" />
                <ThemeButton themeId="music" label="Music" color="bg-violet-100 text-violet-600 border-violet-300" />
                <ThemeButton themeId="pixel" label="Retro" color="bg-gray-200 text-green-700 border-gray-400 font-mono" />
                <ThemeButton themeId="space" label="Space" color="bg-indigo-950 text-indigo-200 border-indigo-700" />
                <ThemeButton themeId="neon" label="Neon" color="bg-black text-fuchsia-400 border-fuchsia-500" />
                <ThemeButton themeId="coffee" label="Coffee" color="bg-[#dcc8b8] text-[#4a3525] border-[#9c7c64]" />
                <ThemeButton themeId="nature" label="Nature" color="bg-green-100 text-green-800 border-green-300" />
                <ThemeButton themeId="night" label="Night" color="bg-slate-800 text-slate-300 border-slate-600" />
                <ThemeButton themeId="steampunk" label="Steam" color="bg-[#2b2b2b] text-[#cd7f32] border-[#cd7f32]" />
                <ThemeButton themeId="circus" label="Circus" color="bg-red-100 text-red-700 border-yellow-400" />
                <ThemeButton themeId="deepsea" label="Deep Sea" color="bg-blue-900 text-blue-200 border-blue-700" />
                <ThemeButton themeId="cyberpunk" label="Cyber" color="bg-black text-green-500 border-green-500 font-mono" />
                <ThemeButton themeId="candy" label="Candy" color="bg-pink-200 text-pink-600 border-pink-400" />
                <ThemeButton themeId="vaporwave" label="Vapor" color="bg-fuchsia-200 text-cyan-700 border-cyan-400" />
                <ThemeButton themeId="zen" label="Zen" color="bg-[#d6cfc7] text-[#5c5552] border-[#a8a29e]" />
            </div>
        </div>

        <div className={`h-px my-2 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

        {/* Lofi Radio */}
        <button onClick={handleMusicSelect} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left text-sm font-bold min-h-[44px] ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
            {isMusicPlaying ? <Volume2 className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" /> : <VolumeX className="w-5 h-5 text-slate-400 shrink-0" />}
            <div className="flex flex-col">
                <span>{t.lofiRadio}</span>
                {isMusicPlaying && <span className="text-[10px] text-emerald-500 font-medium">Playing Lofi Beats</span>}
            </div>
        </button>

        <button onClick={toggleLanguage} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left text-sm font-bold min-h-[44px] ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
            <Languages className="w-5 h-5 text-fuchsia-400 shrink-0" />
            <span>{language === 'de' ? 'Sprache: Deutsch' : 'Language: English'}</span>
        </button>

        <button onClick={toggleDarkMode} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left text-sm font-bold min-h-[44px] ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
            {isDarkMode ? <Moon className="w-5 h-5 text-violet-400 shrink-0" /> : <Sun className="w-5 h-5 text-amber-500 shrink-0" />}
            <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
        
        <button onClick={() => setShowGradeInfo(true)} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left text-sm font-bold min-h-[44px] ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
            <Scale className="w-5 h-5 text-blue-400 shrink-0" />
            <span>Info</span>
        </button>

        <div className={`h-px my-1 ${isDarkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

        <button onClick={isAdmin ? handleLogout : () => setShowLogin(true)} className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-left text-sm font-bold min-h-[44px] ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-slate-100 text-slate-700'}`}>
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
          case 'plush':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-[#fff0f5]">
                       <div className="absolute inset-0 opacity-10" style={{
                          backgroundImage: 'radial-gradient(#f9a8d4 3px, transparent 3px)',
                          backgroundSize: '24px 24px'
                      }}></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🎀', '✨', '🧶', '🧁', '☁️']} colors="text-rose-300 opacity-80" count={40} />;
              break;
          case 'music':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-violet-50 to-fuchsia-50">
                       <div className="absolute inset-0 opacity-10" style={{
                          backgroundImage: 'linear-gradient(to right, #8B5CF6 1px, transparent 1px)',
                          backgroundSize: '40px 100%' // Sheet music lines effect
                      }}></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🎵', '🎶', '🎹', '🎸', '🎧', '🎼']} colors="text-violet-400 opacity-80" count={40} />;
              break;
          case 'steampunk':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-[#1a1a1a]">
                      <div className="absolute inset-0 opacity-20" style={{
                          backgroundImage: 'repeating-linear-gradient(45deg, #cd7f32 0, #cd7f32 1px, transparent 0, transparent 50%)',
                          backgroundSize: '20px 20px'
                      }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['⚙️', '🗝️', '🕰️', '🔩', '🎩']} colors="text-[#cd7f32] opacity-60" count={30} />;
              break;
          case 'easter':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-blue-100 to-green-100">
                      <div className="absolute bottom-0 w-full h-1/3 bg-[#86efac] rounded-t-[50%] scale-150"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🥚', '🐰', '🐣', '🌷', '🥕']} colors="text-pink-400 opacity-80" count={40} />;
              break;
          case 'circus':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-white">
                      <div className="absolute inset-0 opacity-20" style={{
                          backgroundImage: 'repeating-conic-gradient(#ef4444 0 15deg, #ffffff 15deg 30deg)'
                      }}></div>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🍿', '🎪', '🎈', '🤹', '🎟️']} colors="text-red-500 opacity-90" count={40} />;
              break;
          case 'newyear':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-slate-950 overflow-hidden cursor-crosshair" onClick={handleBackgroundClick}>
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🥂', '🎉', '🎆', '🌟', '2025']} colors="text-yellow-200 opacity-70" count={40} glow />;
              break;
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
              // Just leaves for Autumn rain as requested
              if (isRainActive) animLayer = <ThemeRain items={['🍂', '🍁', '🍃', '🪵']} colors="text-orange-800 opacity-80" />;
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
          case 'deepsea':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-slate-900 to-blue-900 overflow-hidden">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_50%)]"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🫧', '🐟', '🐠', '🐚', '🦀']} colors="text-blue-300 opacity-50" />;
              break;
          case 'cyberpunk':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-black font-mono overflow-hidden">
                      <div className="absolute inset-0 opacity-20" style={{
                          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(34, 197, 94, .3) 25%, rgba(34, 197, 94, .3) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, .3) 75%, rgba(34, 197, 94, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(34, 197, 94, .3) 25%, rgba(34, 197, 94, .3) 26%, transparent 27%, transparent 74%, rgba(34, 197, 94, .3) 75%, rgba(34, 197, 94, .3) 76%, transparent 77%, transparent)',
                          backgroundSize: '50px 50px'
                      }}></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['0', '1', '█', '▓', '▒']} colors="text-green-500 font-mono opacity-80" count={60} glow />;
              break;
          case 'candy':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-[#ffe4e6]">
                      <div className="absolute inset-0" style={{
                          backgroundImage: 'radial-gradient(#f472b6 2px, transparent 2px)',
                          backgroundSize: '30px 30px'
                      }}></div>
                      <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-pink-200 to-transparent"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🍬', '🍭', '🧁', '🍩', '🍪']} colors="text-pink-500 opacity-80" />;
              break;
          case 'vaporwave':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-fuchsia-900 via-purple-900 to-cyan-900 overflow-hidden">
                      <div className="absolute bottom-0 w-full h-1/2 perspective-[500px]">
                          <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] transform-gpu rotate-x-60 origin-bottom scale-150"></div>
                      </div>
                      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-gradient-to-b from-yellow-400 to-pink-500 blur-xl opacity-80"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['💾', '🌴', '🗿', '🐬', '📼']} colors="text-cyan-300 opacity-80" glow />;
              break;
          case 'zen':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-[#e7e5e4]">
                      <div className="absolute inset-0 opacity-10" style={{
                          backgroundImage: 'repeating-radial-gradient(circle at center, #78716c 0, #78716c 1px, transparent 2px, transparent 20px)'
                      }}></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🌸', '🍃', '🎋', '🪷', '🍵']} colors="text-stone-600 opacity-60" />;
              break;
          case 'nature':
              bgLayer = (
                  <div className="fixed inset-0 z-[-1] bg-gradient-to-b from-sky-300 to-emerald-300">
                      <div className="absolute inset-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                      <div className="absolute top-10 left-10 w-32 h-16 bg-white/40 rounded-full blur-xl"></div>
                      <div className="absolute top-20 right-20 w-48 h-20 bg-white/30 rounded-full blur-xl"></div>
                  </div>
              );
              if (isRainActive) animLayer = <ThemeRain items={['🍃', '🌿', '🌱', '🌳', '🦜']} colors="text-emerald-800 opacity-60" />;
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
            {/* Render Fireworks Layer */}
            {currentTheme === 'newyear' && fireworks.map(fw => (
                <Firework 
                    key={fw.id} 
                    x={fw.x} 
                    y={fw.y} 
                    onComplete={() => setFireworks(prev => prev.filter(p => p.id !== fw.id))} 
                />
            ))}
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
      
      {/* Overlays */}
      <WhiteboardOverlay isOpen={showWhiteboard} onClose={() => setShowWhiteboard(false)} />
      
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
                <div className={`absolute inset-0 blur-3xl rounded-full opacity-50 ${currentTheme === 'plush' ? 'bg-rose-300' : (currentTheme === 'music' ? 'bg-violet-300' : (currentTheme === 'newyear' ? 'bg-yellow-500' : (isDarkMode ? 'bg-violet-900' : 'bg-violet-200')))}`}></div>
                <div className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 transition-transform hover:rotate-6 duration-500 ${currentTheme === 'plush' ? 'bg-rose-200 text-rose-500' : (currentTheme === 'music' ? 'bg-violet-200 text-violet-600' : (currentTheme === 'steampunk' ? 'bg-[#1a1a1a] border-2 border-[#cd7f32] text-[#cd7f32]' : (currentTheme === 'newyear' ? 'bg-black border border-yellow-500 text-yellow-400' : (currentTheme === 'christmas' ? 'bg-red-100 text-red-600' : 'bg-white text-violet-600'))))}`}>
                    <ThemeIcon />
                </div>
             </div>
             
             <h1 className={`text-4xl sm:text-5xl font-black mb-1 tracking-tight ${currentTheme === 'plush' ? 'text-rose-400' : (currentTheme === 'music' ? 'text-violet-500' : (currentTheme === 'steampunk' ? 'text-[#cd7f32] font-mono' : (currentTheme === 'newyear' ? 'text-yellow-400' : (currentTheme === 'christmas' ? 'text-white drop-shadow-md' : 'text-slate-800 dark:text-white'))))}`}>
                GradePath
             </h1>
             <p className={`text-xs font-bold uppercase tracking-widest mb-4 opacity-70 ${currentTheme === 'steampunk' ? 'text-[#8b4513]' : 'text-slate-500 dark:text-slate-400'}`}>by Ihssan</p>
             <p className={`text-lg sm:text-xl font-medium mb-10 leading-relaxed ${currentTheme === 'steampunk' ? 'text-[#8b4513]' : 'text-slate-500 dark:text-slate-300'}`}>
                {t.welcomeSubtitle}
             </p>

             <button 
                onClick={() => setHasStarted(true)}
                className={`w-full py-4 text-lg font-bold shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 ${getThemeButtonClass()}`}
             >
                {t.getStarted} <ArrowRight className="w-5 h-5" />
             </button>

             <div className="mt-12 opacity-80 hover:opacity-100 transition-opacity">
                 <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">{t.dailyFocus}</p>
                 <div className={`p-4 rounded-2xl border backdrop-blur-sm ${currentTheme === 'plush' ? 'bg-white/60 border-rose-200' : (currentTheme === 'music' ? 'bg-white/60 border-violet-200' : (currentTheme === 'steampunk' ? 'bg-[#1a1a1a]/80 border-[#cd7f32]' : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'))}`}>
                     <Quote className={`w-5 h-5 mb-2 ${currentTheme === 'plush' ? 'text-rose-300' : 'text-slate-300'}`} />
                     <p className={`text-sm italic font-medium mb-2 ${currentTheme === 'steampunk' ? 'text-[#cd7f32]' : 'text-slate-600 dark:text-slate-300'}`}>"{dailyQuote.text}"</p>
                     <p className="text-xs font-bold text-slate-400">— {dailyQuote.author}</p>
                 </div>
             </div>
          </div>
          
          {/* Footer */}
          <div className="absolute bottom-6 text-xs font-bold text-slate-400 dark:text-slate-600 flex gap-4">
              <button onClick={() => setShowGradeInfo(true)} className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors">
                  {t.gradeInfoBtn}
              </button>
              <span>•</span>
              <button onClick={handleInstallClick} className="hover:text-slate-600 dark:hover:text-slate-400 transition-colors flex items-center gap-1">
                  <Smartphone className="w-3 h-3" /> {t.installApp}
              </button>
          </div>
        </div>
      ) : (
        // --- MAIN APP ---
        <div className="relative min-h-screen flex flex-col max-w-5xl mx-auto z-10 px-4 pb-20">
           
           {/* Header */}
           <header className="py-6 flex flex-col relative z-20 gap-4">
               <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* BIGGER MAIN ICON */}
                        <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center shadow-lg ${currentTheme === 'plush' ? 'bg-white text-rose-300 border-2 border-dashed border-rose-200' : (currentTheme === 'music' ? 'bg-white text-violet-500 border-2 border-violet-200' : (currentTheme === 'steampunk' ? 'bg-[#2b2b2b] text-[#cd7f32] border border-[#cd7f32]' : (currentTheme === 'newyear' ? 'bg-black text-yellow-400 border border-yellow-500' : (isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-violet-600'))))}`}>
                            <ThemeIcon />
                        </div>
                        <div className="flex flex-col">
                            <h1 className={`font-black text-2xl leading-none ${currentTheme === 'newyear' || currentTheme === 'steampunk' ? 'text-white' : 'dark:text-white'}`}>GradePath</h1>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">by Ihssan</span>
                        </div>
                        {/* Home Button moved here from header cluster */}
                        <button 
                                onClick={() => setHasStarted(false)} 
                                className="ml-2 p-2 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 shadow-sm" 
                                title="Home"
                            >
                                <Home className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* MOVED FLOATING BUTTONS HERE */}
                        <button
                            onClick={() => setShowWhiteboard(true)}
                            className={`p-3 rounded-2xl transition-all shadow-sm ${currentTheme === 'steampunk' ? 'bg-[#1a1a1a] text-[#cd7f32] border border-[#cd7f32]' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                            title="Whiteboard"
                        >
                            <PenTool className="w-6 h-6" />
                        </button>

                        <button 
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className={`p-3 rounded-2xl transition-all shadow-sm ${currentTheme === 'plush' ? 'bg-white text-rose-400 border border-rose-100' : (currentTheme === 'music' ? 'bg-white text-violet-500 border border-violet-200' : (isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-100'))}`}
                        >
                            <MoreVertical className="w-6 h-6" />
                        </button>
                    </div>
               </div>

               {/* Top Navigation Tabs */}
               <div className={`p-1.5 bg-slate-100/50 dark:bg-slate-800/50 rounded-3xl flex relative backdrop-blur-md w-full ${currentTheme === 'plush' ? 'bg-white/50 border-2 border-dashed border-rose-200' : (currentTheme === 'music' ? 'bg-white/50 border border-violet-200' : '')}`}>
                    <button 
                        onClick={() => setActiveView('dashboard')}
                        className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all relative z-10 ${currentTheme === 'plush' || currentTheme === 'music' || currentTheme === 'easter' ? 'rounded-full' : ''} ${activeView === 'dashboard' ? (currentTheme === 'plush' ? 'bg-rose-300 text-white shadow-sm' : (currentTheme === 'music' ? 'bg-violet-400 text-white shadow-sm' : (currentTheme === 'steampunk' ? 'bg-[#2b2b2b] text-[#cd7f32] border border-[#cd7f32]' : (currentTheme === 'newyear' ? 'bg-black text-yellow-400 border border-yellow-500' : 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white')))) : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                    >
                        {t.navCheck}
                    </button>
                    <button 
                        onClick={() => setActiveView('exercises')}
                        className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all relative z-10 ${currentTheme === 'plush' || currentTheme === 'music' || currentTheme === 'easter' ? 'rounded-full' : ''} ${activeView === 'exercises' ? (currentTheme === 'plush' ? 'bg-rose-300 text-white shadow-sm' : (currentTheme === 'music' ? 'bg-violet-400 text-white shadow-sm' : (currentTheme === 'steampunk' ? 'bg-[#2b2b2b] text-[#cd7f32] border border-[#cd7f32]' : (currentTheme === 'newyear' ? 'bg-black text-yellow-400 border border-yellow-500' : 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-white')))) : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
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
                        <button onClick={() => setHasStarted(false)} className="w-full py-3 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors text-sm flex items-center justify-center gap-2">
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

                        {/* Gem Avatar - Reactive to GPA */}
                        <div className="flex justify-center -my-2 z-10 relative">
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
                                <GemAvatar mood={currentAverage === 0 ? 'neutral' : (currentAverage < 2.5 ? 'happy' : 'sad')} />
                                <div className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-[150px]">
                                    {currentAverage === 0 ? "Enter your grades, let's see where you stand!" : (currentAverage < 2.5 ? "Wow! You're crushing it! Keep going!" : "Don't worry, we can improve this together.")}
                                </div>
                            </div>
                        </div>

                       {/* 2. Results Section (Scroll Down Target) */}
                       <div id="results-container" className={`w-full min-h-[500px] rounded-[2.5rem] shadow-2xl p-4 sm:p-8 relative transition-all duration-500 border ${
                            currentTheme === 'plush' ? 'bg-[#fffbf7] border-rose-100 shadow-rose-100 border-4 border-dashed' :
                            currentTheme === 'music' ? 'bg-[#fdfaff] border-violet-200 shadow-violet-100 border-2' :
                            currentTheme === 'steampunk' ? 'bg-[#1a1a1a] border-[#cd7f32] shadow-[#cd7f32]/20 border-2' :
                            currentTheme === 'easter' ? 'bg-[#fdfbf7] border-pink-200 shadow-yellow-100 border-4 border-double' :
                            currentTheme === 'circus' ? 'bg-[#fff] border-red-500 shadow-yellow-200 border-4' :
                            currentTheme === 'newyear' ? 'bg-slate-900 border-yellow-500/50 shadow-yellow-500/20 border' :
                            currentTheme === 'christmas' ? 'bg-white/80 border-red-100 shadow-red-100' :
                            currentTheme === 'school' ? 'bg-white/80 border-blue-100 shadow-blue-100' :
                            currentTheme === 'chalkboard' ? 'bg-[#333]/90 border-[#444] shadow-black' :
                            currentTheme === 'pixel' ? 'bg-white border-4 border-[#0f380f] rounded-2xl' :
                            currentTheme === 'neon' ? 'bg-black/60 border-fuchsia-500/30 shadow-[0_0_30px_rgba(232,121,249,0.1)] rounded-2xl backdrop-blur-xl' :
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
                        currentTheme === 'plush' ? 'bg-[#fffbf7] border-rose-100 shadow-rose-100 border-4 border-dashed' :
                        currentTheme === 'music' ? 'bg-[#fdfaff] border-violet-200 shadow-violet-100 border-2' :
                        currentTheme === 'steampunk' ? 'bg-[#1a1a1a] border-[#cd7f32] shadow-[#cd7f32]/20 border-2' :
                        currentTheme === 'easter' ? 'bg-[#fdfbf7] border-pink-200 shadow-yellow-100 border-4 border-double' :
                        currentTheme === 'circus' ? 'bg-[#fff] border-red-500 shadow-yellow-200 border-4' :
                        currentTheme === 'newyear' ? 'bg-slate-900 border-yellow-500/50 shadow-yellow-500/20 border' :
                        currentTheme === 'christmas' ? 'bg-white/80 border-red-100 shadow-red-100' :
                        currentTheme === 'school' ? 'bg-white/80 border-blue-100 shadow-blue-100' :
                        currentTheme === 'chalkboard' ? 'bg-[#333]/90 border-[#444] shadow-black' :
                        currentTheme === 'pixel' ? 'bg-white border-4 border-[#0f380f] rounded-2xl' :
                        currentTheme === 'neon' ? 'bg-black/60 border-fuchsia-500/30 shadow-[0_0_30px_rgba(232,121,249,0.1)] rounded-2xl backdrop-blur-xl' :
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
