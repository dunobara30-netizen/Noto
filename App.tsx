import React, { useState } from 'react';
import GradeCalculator from './components/GradeCalculator';
import ResultsDashboard from './components/ResultsDashboard';
import ChatWidget from './components/ChatWidget';
import { Course, GradeLevel, AnalysisResult } from './types';
import { analyzeAcademicProfile } from './services/geminiService';
import { GraduationCap, Sparkles, MessageCircle, QrCode, X, Smartphone } from 'lucide-react';

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAverage, setCurrentAverage] = useState<number>(0);
  const [currentCourses, setCurrentCourses] = useState<Course[]>([]);
  const [contextSummary, setContextSummary] = useState<string>('');
  
  // Lifted state for ChatWidget
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleCalculateAndAnalyze = async (avg: number, courses: Course[], level: GradeLevel) => {
    setCurrentAverage(avg);
    setCurrentCourses(courses); // Store courses for the dashboard AI
    setIsAnalyzing(true);
    
    const summary = `Notendurchschnitt: ${avg.toFixed(2)}, Stufe: ${level}, Kurse: ${courses.map(c => `${c.name} (${c.grade})`).join(', ')}`;
    setContextSummary(summary);

    try {
      const result = await analyzeAcademicProfile(avg, level, courses);
      setAnalysisResult(result);
      
      // Scroll to dashboard results on success
      setTimeout(() => {
        document.getElementById('results-container')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error: any) {
      console.error("Analysis failed", error);
      alert(`Es gab ein Problem bei der Analyse: ${error.message || "Unbekannter Fehler"}. Bitte versuche es erneut.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNavClick = (action: 'dashboard' | 'tipps') => {
    if (action === 'dashboard') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'tipps') {
      setIsChatOpen(true);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  // Use Google Charts API for reliable QR code generation
  const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=350x350&chl=${encodeURIComponent(currentUrl)}&choe=UTF-8`;
  const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 flex flex-col overflow-x-hidden relative font-['Inter']">
      
      {/* Background Ambient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-violet-300/30 rounded-full blur-[100px] animate-pulse duration-3000 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-300/30 rounded-full blur-[100px] animate-pulse duration-5000 delay-1000 pointer-events-none"></div>
      
      {/* Navbar */}
      <header className="bg-white/70 backdrop-blur-md border-b border-white/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* QR Code Button */}
            <button 
              onClick={() => setShowQr(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 hover:bg-violet-600 hover:text-white hover:shadow-lg hover:shadow-violet-300/50 transition-all duration-300 group/qr"
              title="Scan for Mobile"
            >
              <QrCode className="w-5 h-5" />
              <span className="hidden sm:block font-bold text-sm">Mobile Access</span>
            </button>

            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
              <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-600 tracking-tight">
                GradePath AI
              </h1>
            </div>
          </div>

          <nav className="hidden md:flex gap-2 p-1">
            <button 
              onClick={() => handleNavClick('tipps')}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold bg-violet-600 text-white shadow-lg shadow-violet-300 hover:bg-violet-700 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              Tipps (Chat)
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:min-h-[600px]">
          
          {/* Left Column: Grade Input */}
          <div className="lg:col-span-5 flex flex-col">
            <GradeCalculator 
              onCalculate={handleCalculateAndAnalyze} 
              isAnalyzing={isAnalyzing} 
            />
          </div>

          {/* Right Column: Results */}
          <div id="results-container" className="lg:col-span-7 flex flex-col">
            <div className="flex items-center gap-2 mb-6 pl-2 mt-8 lg:mt-0">
              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                 <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-700">Deine Zukunftsanalyse</h2>
            </div>
            <div className="flex-1 bg-white/40 backdrop-blur-md rounded-3xl border border-white/60 shadow-xl shadow-slate-200/50 overflow-hidden relative min-h-[300px]">
               {/* Decorative background inside result container */}
               <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
              <ResultsDashboard 
                results={analysisResult} 
                gpa={currentAverage} 
                courses={currentCourses}
              />
            </div>
          </div>
        </div>
      </main>

      <ChatWidget 
        contextSummary={contextSummary} 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
      />

      {/* QR Code Modal */}
      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative animate-in zoom-in-95 duration-300 border border-white/50">
            <button 
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Teile deinen Weg</h3>
                <p className="text-slate-500 text-sm">Scanne den Code mit deinem Handy, um die App dort zu öffnen.</p>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-inner mx-auto inline-block group relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all opacity-50"></div>
                <img 
                  src={qrUrl} 
                  alt="QR Code via Google Charts" 
                  className="w-48 h-48 object-contain relative z-10"
                  loading="lazy"
                />
                <div className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-sm z-20">
                    <Smartphone className="w-4 h-4 text-violet-600" />
                </div>
              </div>

              {isLocalhost && (
                <div className="bg-amber-50 text-amber-700 text-[11px] font-medium p-3 rounded-xl text-left border border-amber-100">
                  <strong>Hinweis:</strong> Du bist im lokalen Modus (localhost). Damit der Scan funktioniert, müssen beide Geräte im selben WLAN sein oder die Seite muss veröffentlicht sein.
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 py-2">
                <Sparkles className="w-3 h-3" />
                Powered by Google Charts
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;