import React, { useState, useEffect } from 'react';
import GradeCalculator from './components/GradeCalculator';
import ResultsDashboard from './components/ResultsDashboard';
import ChatWidget from './components/ChatWidget';
import { Course, GradeLevel, AnalysisResult } from './types';
import { analyzeAcademicProfile } from './services/geminiService';
import { GraduationCap, Sparkles, QrCode, X, Smartphone, Download, Share, MoreVertical, Copy, ShieldCheck, Trash2, Eye, EyeOff } from 'lucide-react';

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAverage, setCurrentAverage] = useState<number>(0);
  const [currentCourses, setCurrentCourses] = useState<Course[]>([]);
  const [contextSummary, setContextSummary] = useState<string>('');
  
  // Lifted state for ChatWidget
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [installTab, setInstallTab] = useState<'android' | 'ios'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Security & Privacy State
  const [sessionKey, setSessionKey] = useState(0); // Used to completely reset child components
  const [isBlurred, setIsBlurred] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  // Handle PWA Install Prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

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

  const handleCalculateAndAnalyze = async (avg: number, courses: Course[], level: GradeLevel) => {
    setCurrentAverage(avg);
    setCurrentCourses(courses);
    setIsAnalyzing(true);
    
    const summary = `Notendurchschnitt: ${avg.toFixed(2)}, Stufe: ${level}, Kurse: ${courses.map(c => `${c.name} (${c.grade})`).join(', ')}`;
    setContextSummary(summary);

    try {
      const result = await analyzeAcademicProfile(avg, level, courses);
      setAnalysisResult(result);
      
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

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleClearSession = () => {
    if (window.confirm("Sicher? Alle Daten werden sofort unwiderruflich gelöscht.")) {
      setAnalysisResult(null);
      setCurrentAverage(0);
      setCurrentCourses([]);
      setContextSummary('');
      setIsChatOpen(false);
      setIsBlurred(false);
      setSessionKey(prev => prev + 1); // Re-mounts children to reset their internal state
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
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
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-600 tracking-tight hidden sm:block">
              GradePath
            </h1>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2">
            
            {/* Security Tools Group */}
            <div className="flex items-center bg-slate-100/50 rounded-xl p-1 mr-2 border border-white/50">
               <button 
                 onClick={() => setShowPrivacyInfo(true)}
                 className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                 title="Datenschutz Status: Sicher"
               >
                 <ShieldCheck className="w-4 h-4" />
                 <span className="text-xs font-bold hidden md:inline">Anonym</span>
               </button>

               <div className="w-px h-4 bg-slate-300 mx-1"></div>

               <button 
                 onClick={() => setIsBlurred(!isBlurred)}
                 className={`p-1.5 rounded-lg transition-all ${isBlurred ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'}`}
                 title={isBlurred ? "Inhalt anzeigen" : "Inhalt verbergen (Stealth Mode)"}
               >
                 {isBlurred ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
               </button>

               <button 
                 onClick={handleClearSession}
                 className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                 title="Alles löschen (Panic Button)"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>

            {/* Install Button */}
            <button 
              onClick={handleInstallClick}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-violet-600 transition-all"
              title="App installieren"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* QR Code */}
            <button 
              onClick={() => setShowQr(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:scale-105 transition-all duration-300 border border-white/20"
            >
              <QrCode className="w-5 h-5" />
              <span className="font-bold text-sm hidden sm:inline">Auf's Handy</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pb-32 transition-all duration-500 ${isBlurred ? 'blur-xl opacity-50 select-none pointer-events-none grayscale' : ''}`}>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:min-h-[600px]">
          
          {/* Left Column: Grade Input */}
          <div className="lg:col-span-5 flex flex-col">
            <GradeCalculator 
              key={`calc-${sessionKey}`} // Changing key forces re-render (reset)
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
               <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
              <ResultsDashboard 
                key={`results-${sessionKey}`}
                results={analysisResult} 
                gpa={currentAverage} 
                courses={currentCourses}
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Lock Overlay when Blurred */}
      {isBlurred && (
        <div className="fixed inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white flex flex-col items-center animate-in zoom-in-95 duration-300 pointer-events-auto">
             <div className="bg-violet-100 p-4 rounded-full mb-4">
                <EyeOff className="w-8 h-8 text-violet-600" />
             </div>
             <h3 className="text-xl font-bold text-slate-800">Privater Modus Aktiv</h3>
             <p className="text-slate-500 text-sm mb-4">Deine Daten sind verborgen.</p>
             <button 
                onClick={() => setIsBlurred(false)}
                className="px-6 py-2 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors"
             >
                Anzeigen
             </button>
          </div>
        </div>
      )}

      {/* Chat Widget - Always available if not blurred */}
      {!isBlurred && (
        <ChatWidget 
          key={`chat-${sessionKey}`}
          contextSummary={contextSummary} 
          isOpen={isChatOpen} 
          setIsOpen={setIsChatOpen} 
        />
      )}

      {/* Privacy Info Modal */}
      {showPrivacyInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full relative animate-in zoom-in-95 duration-300 border border-white/50">
            <button 
              onClick={() => setShowPrivacyInfo(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Deine Sicherheit</h3>
                <div className="mt-4 space-y-3 text-left">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm flex gap-3">
                        <div className="min-w-[4px] bg-emerald-400 rounded-full"></div>
                        <div>
                            <p className="font-bold text-slate-700">Anonym & Lokal</p>
                            <p className="text-slate-500 text-xs">Deine Noten verlassen nie dieses Gerät. Alles wird im Browser berechnet.</p>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm flex gap-3">
                        <div className="min-w-[4px] bg-violet-400 rounded-full"></div>
                        <div>
                            <p className="font-bold text-slate-700">Kein Login</p>
                            <p className="text-slate-500 text-xs">Du benötigst keinen Account. Starte einfach und schließe den Tab, um alles zu löschen.</p>
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
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full relative animate-in zoom-in-95 duration-300 border border-white/50">
            <button 
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-violet-600">
                    <Download className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">App installieren</h3>
                <p className="text-sm text-slate-500 mt-1">Wähle dein Gerät für die Anleitung.</p>
            </div>

            {/* OS Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
              <button 
                onClick={() => setInstallTab('android')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${installTab === 'android' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Android
              </button>
              <button 
                onClick={() => setInstallTab('ios')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${installTab === 'ios' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                iOS / iPhone
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-600 text-left">
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 min-h-[140px]">
                {installTab === 'android' ? (
                  <div className="space-y-3">
                    <div className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
                        <Smartphone className="w-4 h-4 text-green-600" />
                        Android (Chrome)
                    </div>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0 text-slate-400">1</span>
                          <span className="leading-snug">Tippe oben rechts auf das <span className="font-bold text-slate-800">Drei-Punkte-Menü</span> <MoreVertical className="w-3 h-3 inline align-middle" /></span>
                      </li>
                      <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0 text-slate-400">2</span>
                          <span className="leading-snug">Wähle <span className="font-bold text-slate-800">"App installieren"</span> oder <span className="font-bold text-slate-800">"Zum Startbildschirm"</span></span>
                      </li>
                    </ol>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
                        <Smartphone className="w-4 h-4 text-slate-800" />
                        iOS (Safari)
                    </div>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0 text-slate-400">1</span>
                          <span className="leading-snug">Tippe unten in der Leiste auf <span className="font-bold text-blue-600">Teilen</span> <Share className="w-3 h-3 inline align-middle" /></span>
                      </li>
                      <li className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold shrink-0 text-slate-400">2</span>
                          <span className="leading-snug">Scrolle nach unten und wähle <span className="font-bold text-slate-800">"Zum Home-Bildschirm"</span></span>
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
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative animate-in zoom-in-95 duration-300 border border-white/50">
            <button 
              onClick={() => setShowQr(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Auf's Handy übertragen</h3>
                <p className="text-slate-500 text-sm">Scanne den Code mit deiner Kamera.</p>
              </div>
              
              <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-inner mx-auto inline-block relative group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 rounded-xl blur-xl opacity-50"></div>
                <img 
                  src={qrUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 object-contain relative z-10"
                />
              </div>

              {/* Manual URL Copy Section */}
              <div className="space-y-2 pt-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Oder Link kopieren</p>
                <div className="flex items-center gap-2 bg-slate-50 p-2 pl-3 rounded-xl border border-slate-200">
                  <input 
                    type="text" 
                    readOnly 
                    value={currentUrl} 
                    className="bg-transparent w-full text-xs text-slate-600 font-mono outline-none truncate"
                  />
                  <button 
                    onClick={handleCopyUrl}
                    className={`p-2 rounded-lg transition-all shrink-0 ${copySuccess ? 'bg-green-500 text-white' : 'bg-white shadow-sm text-slate-500 hover:text-violet-600'}`}
                  >
                    {copySuccess ? <Sparkles className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isLocalhost && (
                <div className="bg-amber-50 text-amber-700 text-[11px] font-medium p-3 rounded-xl text-left border border-amber-100 leading-tight">
                  ⚠️ Du bist auf "localhost". Dein Handy muss im selben WLAN sein. Nutze deine lokale IP-Adresse statt "localhost".
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