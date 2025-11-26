import React, { useState, useEffect } from 'react';
import GradeCalculator from './components/GradeCalculator';
import ResultsDashboard from './components/ResultsDashboard';
import ChatWidget from './components/ChatWidget';
import { Course, GradeLevel, AnalysisResult } from './types';
import { analyzeAcademicProfile } from './services/geminiService';
import { GraduationCap, Sparkles, QrCode, X, Smartphone, Download, Share, MoreVertical, Copy, ShieldCheck, Eye, EyeOff, Lock, Unlock, Edit2 } from 'lucide-react';

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentAverage, setCurrentAverage] = useState<number>(0);
  const [currentCourses, setCurrentCourses] = useState<Course[]>([]);
  const [contextSummary, setContextSummary] = useState<string>('');
  
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

  // Security & Privacy State
  const [sessionKey, setSessionKey] = useState(0); 
  const [isBlurred, setIsBlurred] = useState(false);
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  // Handle PWA Install Prompt & QR Init
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setQrSource(window.location.href);
    }

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
      setIsChatOpen(true); // Auto open chat on login
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

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrSource)}`;
  const isLocalhost = currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1');

  return (
    <div className={`min-h-screen bg-[#f0f4f8] text-slate-800 flex flex-col overflow-x-hidden relative font-['Inter'] transition-colors duration-500 ${isAdmin ? 'bg-slate-900' : ''}`}>
      
      {/* Background Ambient Blobs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] animate-pulse duration-3000 pointer-events-none ${isAdmin ? 'bg-emerald-900/20' : 'bg-violet-300/30'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] animate-pulse duration-5000 delay-1000 pointer-events-none ${isAdmin ? 'bg-slate-800/40' : 'bg-fuchsia-300/30'}`}></div>
      
      {/* Navbar */}
      <header className={`backdrop-blur-md border-b sticky top-0 z-40 shadow-sm transition-colors ${isAdmin ? 'bg-slate-900/80 border-slate-700' : 'bg-white/70 border-white/50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 select-none">
            <div className={`p-2.5 rounded-xl shadow-lg transition-transform duration-300 ${isAdmin ? 'bg-slate-800 shadow-emerald-900/20 border border-emerald-500/30' : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-violet-500/20'}`}>
              <GraduationCap className={`w-6 h-6 ${isAdmin ? 'text-emerald-500' : 'text-white'}`} />
            </div>
            <h1 className={`text-xl sm:text-2xl font-black tracking-tight hidden sm:block ${isAdmin ? 'text-emerald-500' : 'bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-fuchsia-600'}`}>
              {isAdmin ? 'SYSTEM_OVERRIDE' : 'GradePath'}
            </h1>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2">
            
            {/* Admin Lock */}
            <button 
                onClick={isAdmin ? handleLogout : () => setShowLogin(true)}
                className={`p-2 rounded-xl transition-all border ${
                    isAdmin 
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/20' 
                    : 'bg-white text-slate-400 border-slate-200 hover:text-violet-600 hover:border-violet-200'
                }`}
            >
                {isAdmin ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </button>

            {/* Security Tools Group */}
            <div className={`flex items-center rounded-xl p-1 mr-2 border ${isAdmin ? 'bg-slate-800 border-slate-700' : 'bg-slate-100/50 border-white/50'}`}>
               <button 
                 onClick={() => setShowPrivacyInfo(true)}
                 className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all ${isAdmin ? 'text-slate-400 hover:text-white' : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'}`}
                 title="Datenschutz Status: Sicher"
               >
                 <ShieldCheck className="w-4 h-4" />
                 <span className="text-xs font-bold hidden md:inline">Anonym</span>
               </button>

               <div className={`w-px h-4 mx-1 ${isAdmin ? 'bg-slate-600' : 'bg-slate-300'}`}></div>

               <button 
                 onClick={() => setIsBlurred(!isBlurred)}
                 className={`p-1.5 rounded-lg transition-all ${
                     isBlurred 
                        ? (isAdmin ? 'bg-emerald-900/30 text-emerald-400' : 'bg-violet-100 text-violet-600') 
                        : (isAdmin ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200')
                 }`}
                 title={isBlurred ? "Inhalt anzeigen" : "Inhalt verbergen (Stealth Mode)"}
               >
                 {isBlurred ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
               </button>
            </div>

            {/* Install Button */}
            <button 
              onClick={handleInstallClick}
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${isAdmin ? 'text-slate-500 hover:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 hover:text-violet-600'}`}
              title="App installieren"
            >
              <Download className="w-5 h-5" />
            </button>

            {/* QR Code */}
            <button 
              onClick={() => setShowQr(true)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white shadow-lg transition-all duration-300 border border-white/20 hover:scale-105 ${isAdmin ? 'bg-slate-800 shadow-emerald-900/20 hover:bg-slate-700 text-emerald-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-violet-200 hover:shadow-violet-300'}`}
            >
              <QrCode className="w-5 h-5" />
              <span className="font-bold text-sm hidden sm:inline">App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pb-32 transition-all duration-500 ${isBlurred ? 'blur-xl opacity-50 select-none pointer-events-none grayscale' : ''}`}>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:min-h-[600px]">
          
          {/* Left Column: Grade Input */}
          <div className="lg:col-span-5 flex flex-col">
            <div className={isAdmin ? 'opacity-80 grayscale hover:grayscale-0 transition-all' : ''}>
                <GradeCalculator 
                key={`calc-${sessionKey}`} // Changing key forces re-render (reset)
                onCalculate={handleCalculateAndAnalyze} 
                isAnalyzing={isAnalyzing}
                />
            </div>
          </div>

          {/* Right Column: Results */}
          <div id="results-container" className="lg:col-span-7 flex flex-col">
            <div className="flex items-center gap-2 mb-6 pl-2 mt-8 lg:mt-0">
              <div className={`p-1.5 rounded-lg shadow-sm ${isAdmin ? 'bg-slate-800' : 'bg-white'}`}>
                 <Sparkles className={`w-5 h-5 ${isAdmin ? 'text-emerald-500' : 'text-amber-500'}`} />
              </div>
              <h2 className={`text-xl font-bold ${isAdmin ? 'text-slate-200' : 'text-slate-700'}`}>Deine Zukunftsanalyse</h2>
            </div>
            <div className={`flex-1 backdrop-blur-md rounded-3xl border shadow-xl overflow-hidden relative min-h-[300px] ${isAdmin ? 'bg-slate-800/50 border-slate-700 shadow-black/50' : 'bg-white/40 border-white/60 shadow-slate-200/50'}`}>
               <div className={`absolute inset-0 bg-gradient-to-b pointer-events-none ${isAdmin ? 'from-slate-800/40 to-transparent' : 'from-white/40 to-transparent'}`}></div>
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

      {/* Chat Widget */}
      {!isBlurred && (
        <div>
            <ChatWidget 
            key={`chat-${sessionKey}-${isAdmin}`}
            contextSummary={contextSummary} 
            isOpen={isChatOpen} 
            setIsOpen={setIsChatOpen} 
            isAdmin={isAdmin}
            />
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-xs w-full relative animate-in zoom-in-95 duration-300 border border-white/50">
             <button 
               onClick={() => { setShowLogin(false); setPinInput(''); }}
               className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
             >
               <X className="w-6 h-6" />
             </button>
             <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Admin Access</h3>
                <p className="text-slate-500 text-sm mb-6">Enter code to unlock Main AI.</p>
                <form onSubmit={handleLogin} className="relative">
                    <input 
                        type="password" 
                        inputMode="numeric"
                        maxLength={4}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value)}
                        className={`w-full bg-slate-50 border-2 rounded-xl py-3 px-4 text-center text-2xl font-bold tracking-widest focus:outline-none transition-all ${loginError ? 'border-red-500 text-red-500 bg-red-50' : 'border-slate-200 focus:border-violet-500 text-slate-800'}`}
                        placeholder="••••"
                        autoFocus
                    />
                    {loginError && <p className="text-red-500 text-xs font-bold mt-2 animate-pulse">Zugriff verweigert</p>}
                    <button type="submit" className="w-full mt-4 bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-700 transition-colors">
                        Unlock
                    </button>
                </form>
             </div>
           </div>
        </div>
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
                  src={qrApiUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 object-contain relative z-10"
                />
              </div>

              {/* Editable URL Section */}
              <div className="space-y-2 pt-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Verlinkte Adresse (Editierbar)</p>
                <div className="flex items-center gap-2 bg-slate-50 p-2 pl-3 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-violet-200 focus-within:border-violet-400 transition-all">
                  <div className="shrink-0 text-slate-400"><Edit2 className="w-3 h-3" /></div>
                  <input 
                    type="text" 
                    value={qrSource} 
                    onChange={(e) => setQrSource(e.target.value)}
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