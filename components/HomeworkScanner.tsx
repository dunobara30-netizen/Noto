import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, Check, RefreshCcw, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Language } from '../types';
import { solveHomeworkProblem } from '../services/geminiService';

interface HomeworkScannerProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const HomeworkScanner: React.FC<HomeworkScannerProps> = ({ isOpen, onClose, language }) => {
  const [view, setView] = useState<'camera' | 'solution'>('camera');
  const [imageData, setImageData] = useState<string | null>(null);
  const [solution, setSolution] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // cleanup function to stop all tracks and clear video source
  const stopCamera = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
            track.stop();
        });
        streamRef.current = null;
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
        // Reset state and start immediately when opened
        setView('camera');
        setImageData(null);
        setSolution('');
        setErrorMsg(null);
        startCamera(); 
    } else {
        stopCamera();
    }
  }, [isOpen]);

  // Safety cleanup on unmount
  useEffect(() => {
    return () => {
        stopCamera();
    };
  }, []);

  // Ensure video stream attaches if we are in camera view
  useEffect(() => {
      if (view === 'camera' && streamRef.current && videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
      }
  }, [view]);

  const startCamera = async () => {
      setErrorMsg(null);
      try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
              throw new Error("Camera API not supported.");
          }

          let stream;
          try {
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
          } catch (e) {
             // Fallback
             stream = await navigator.mediaDevices.getUserMedia({ video: true });
          }
          
          streamRef.current = stream;
          
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
          setView('camera'); 
      } catch (err: any) {
          console.error("Camera error:", err);
          let msg = language === 'en' 
            ? "Could not access camera. Please check permissions." 
            : "Kein Zugriff auf Kamera. Bitte Berechtigungen prüfen.";
            
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
              msg = language === 'en' 
                ? "Permission denied. Please allow camera access in your browser settings." 
                : "Zugriff verweigert. Bitte erlaube den Kamerazugriff in den Browsereinstellungen.";
          }
          
          setErrorMsg(msg);
      }
  };

  const captureImage = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
              setImageData(dataUrl);
              stopCamera(); // Stop camera immediately after capture
              solve(dataUrl);
          }
      }
  };

  const solve = async (imgData: string) => {
      setIsProcessing(true);
      setView('solution');
      try {
          const base64 = imgData.split(',')[1];
          const result = await solveHomeworkProblem(base64, language);
          setSolution(result);
      } catch (e) {
          setSolution("Sorry, I couldn't solve this. Please try again.");
      } finally {
          setIsProcessing(false);
      }
  };

  const reset = () => {
      setSolution('');
      setImageData(null);
      startCamera();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300 p-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-4 text-slate-400 hover:text-white transition-colors z-50">
            <X className="w-6 h-6" />
        </button>

        {view === 'camera' && (
            <div className="w-full max-w-md relative flex flex-col items-center">
                <div className="relative w-full aspect-[3/4] bg-black rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 mb-6">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {errorMsg && (
                        <div className="absolute inset-0 flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
                            <div className="text-center">
                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <p className="text-white font-medium">{errorMsg}</p>
                                <button 
                                    onClick={startCamera} 
                                    className="mt-4 px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Overlay Guides */}
                    {!errorMsg && (
                        <div className="absolute inset-0 border-2 border-white/30 rounded-3xl pointer-events-none m-6">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white/50 rounded-tl-xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white/50 rounded-tr-xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white/50 rounded-bl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white/50 rounded-br-xl"></div>
                        </div>
                    )}
                </div>
                
                {!errorMsg && (
                    <>
                        <button 
                            onClick={captureImage}
                            className="w-20 h-20 bg-white rounded-full border-4 border-fuchsia-500 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform flex items-center justify-center group"
                        >
                            <div className="w-16 h-16 bg-fuchsia-600 rounded-full group-hover:bg-fuchsia-500 transition-colors"></div>
                        </button>
                        <p className="text-white/50 font-medium text-sm mt-4 text-center">
                            {language === 'en' ? 'Align homework & tap to scan' : 'Hausaufgabe ausrichten & scannen'}
                        </p>
                    </>
                )}
            </div>
        )}

        {view === 'solution' && (
            <div className="w-full max-w-lg bg-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header with mini image preview */}
                <div className="bg-slate-900 p-4 flex items-center justify-between border-b border-slate-700">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-fuchsia-400" /> 
                        {language === 'en' ? 'AI Solution' : 'KI Lösung'}
                    </h3>
                    {imageData && <img src={imageData} alt="Scan" className="w-10 h-10 rounded-lg object-cover border border-slate-600" />}
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    {isProcessing ? (
                         <div className="flex flex-col items-center justify-center py-12">
                             <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin mb-4" />
                             <p className="text-slate-400 text-sm animate-pulse">{language === 'en' ? 'Analyzing problem...' : 'Analysiere Aufgabe...'}</p>
                         </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            {solution.split('\n').map((line, i) => (
                                <p key={i} className="mb-2 text-slate-300">{line}</p>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-slate-900 border-t border-slate-700 flex gap-3">
                     <button onClick={reset} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors border border-slate-700 flex items-center justify-center gap-2">
                        <RefreshCcw className="w-4 h-4" /> {language === 'en' ? 'Scan Again' : 'Nochmal scannen'}
                     </button>
                     <button onClick={onClose} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors">
                        {language === 'en' ? 'Done' : 'Fertig'}
                     </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default HomeworkScanner;