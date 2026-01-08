
import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, Mic, PhoneOff, Activity, Play, AlertCircle, Loader2 } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface OralTutorProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  targetLanguage?: string;
  subject?: string;
  topic?: string;
  initialStream?: MediaStream | null;
}

// Audio Utils
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

const OralTutor: React.FC<OralTutorProps> = ({ isOpen, onClose, language, targetLanguage, subject = "General", topic = "Basics", initialStream }) => {
    // Determine initial view based on props
    const [view, setView] = useState<'idle' | 'connecting' | 'session' | 'error'>('idle');
    const [status, setStatus] = useState<'listening' | 'speaking'>('listening');
    const [caption, setCaption] = useState("");
    const [errorMsg, setErrorMsg] = useState<string>("");
    const t = TRANSLATIONS[language];
    
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null); 
    const nextStartTimeRef = useRef<number>(0);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const promptLang = targetLanguage === 'German' ? 'German' : 'English';
    const posWord = promptLang === 'English' ? "Amazing!" : "Super!";
    const negWord = promptLang === 'English' ? "Not there yet" : "Noch nicht ganz";
    const randomSeed = Math.floor(Math.random() * 10000);

    const systemPrompt = `
    ROLE: Oral Exam Teacher. 
    SUBJECT: ${subject}. 
    TOPIC: ${topic}.
    LANGUAGE: STRICTLY ${promptLang}.
    SESSION_ID: ${randomSeed}.

    PROTOCOL:
    1. WAIT for the user to say "Start" or "Hello".
    2. IMMEDIATELY ask ONE specific, UNIQUE, and creative short question about the TOPIC. Do not ask generic questions like "What is [Topic]?".
    3. WAIT for the user's answer.
    4. EVALUATE the answer:
       - IF GOOD: Start your response with "${posWord}". Then briefly explain why.
       - IF BAD/WRONG: Start your response with "${negWord}". Then correct them briefly.
    5. Ask the NEXT question (different from the first).

    CONSTRAINT: Keep responses SHORT (max 2 sentences).
    `;

    // Handle initial stream or error from parent
    useEffect(() => {
        if (isOpen) {
            setCaption("");
            setErrorMsg("");
            
            if (initialStream && initialStream.active) {
                // If a stream is provided (from the toggle) and active, start immediately
                connectSession(initialStream);
            } else {
                setView('idle');
            }
        } else {
            stopSession();
        }
    }, [isOpen, initialStream]);

    useEffect(() => {
        return () => {
            stopSession();
        };
    }, []);

    const stopSession = () => {
        // Only stop tracks if we created the stream (i.e., not initialStream)
        // Note: We don't stop tracks of initialStream here to avoid breaking parent state unexpectedly.
        
        if (streamRef.current && streamRef.current !== initialStream) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        streamRef.current = null;

        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        for (const s of sourcesRef.current) {
          s.stop();
        }
        sourcesRef.current.clear();
        sessionPromiseRef.current = null;
    };

    const handlePermissionError = (e: any) => {
        if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
            setErrorMsg(language === 'en' 
                ? "Microphone access blocked. Please click the lock icon in your address bar and 'Allow' microphone access." 
                : "Mikrofonzugriff blockiert. Bitte klicke auf das Schloss-Symbol in der Adressleiste und erlaube das Mikrofon.");
        } else if (e.name === 'NotFoundError') {
            setErrorMsg(language === 'en' ? "No microphone found on this device." : "Kein Mikrofon auf diesem Gerät gefunden.");
        } else if (e.name === 'NotReadableError') {
            setErrorMsg(language === 'en' ? "Microphone is busy or being used by another app." : "Das Mikrofon wird bereits von einer anderen App verwendet.");
        } else {
            setErrorMsg(language === 'en' 
                ? `Error accessing microphone: ${e.message}` 
                : `Fehler beim Mikrofonzugriff: ${e.message}`);
        }
        setView('error');
    };

    // Internal retry handler if no initial stream
    const handleStart = async () => {
        // If initial stream is available, use it first
        if (initialStream && initialStream.active) {
            connectSession(initialStream);
            return;
        }

        stopSession();
        setErrorMsg("");
        
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Browser API not supported");
            }

            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
            } catch (err) {
                // Fallback
                console.warn("Falling back to basic audio constraints");
                stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            }

            // If successful, we use this new stream
            connectSession(stream);
        } catch (e) {
            handlePermissionError(e);
        }
    };

    const connectSession = async (stream: MediaStream) => {
        if (!process.env.API_KEY) {
            console.error("API Key missing");
            setErrorMsg("System Error: API Key missing.");
            setView('error');
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        streamRef.current = stream;

        try {
            // Initialize Audio Contexts
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            if (inputCtx.state === 'suspended') await inputCtx.resume();
            if (outputCtx.state === 'suspended') await outputCtx.resume();

            inputAudioContextRef.current = inputCtx;
            outputAudioContextRef.current = outputCtx;
            nextStartTimeRef.current = 0;

            setView('connecting');

            // Connect to Gemini Live API
            // Fixed: Updated model to the recommended version 'gemini-2.5-flash-native-audio-preview-12-2025'
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        console.log("Gemini Live Connected");
                        setStatus('listening');
                        setView('session');
                        
                        const source = inputCtx.createMediaStreamSource(stream);
                        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.onaudioprocess = (e) => {
                            // Fixed: Using sessionPromise.then to ensure data is sent only after the session is resolved
                            if (!sessionPromiseRef.current) return;
                            
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmData = new Int16Array(inputData.length);
                            for(let i=0; i<inputData.length; i++) {
                                pcmData[i] = inputData[i] * 32768;
                            }
                            const uint8 = new Uint8Array(pcmData.buffer);
                            
                            sessionPromiseRef.current.then(session => {
                                session.sendRealtimeInput({
                                    media: { mimeType: 'audio/pcm;rate=16000', data: encode(uint8) }
                                });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputCtx.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.outputTranscription?.text) {
                            setCaption(prev => prev + message.serverContent?.outputTranscription?.text);
                        }
                        if (message.serverContent?.interrupted) {
                            setCaption("");
                            // Handle interruption by stopping current audio sources
                            for (const source of sourcesRef.current) {
                                source.stop();
                            }
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                        const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData) {
                            setStatus('speaking');
                            if (outputCtx.state === 'suspended') await outputCtx.resume();

                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                            
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            
                            source.addEventListener('ended', () => {
                                sourcesRef.current.delete(source);
                                if (sourcesRef.current.size === 0) setStatus('listening');
                            });
                            
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                    },
                    onclose: () => {
                        console.log("Session closed");
                    },
                    onerror: (e) => {
                        console.error("Session error", e);
                        setErrorMsg("Connection to AI service interrupted.");
                        setView('error');
                    }
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {}, 
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    systemInstruction: systemPrompt,
                }
            });

        } catch (e: any) {
            console.error("Failed to start oral tutor", e);
            stopSession();
            handlePermissionError(e);
        }
    };

    if (!isOpen) return null;

    // --- VIEW: ERROR ---
    if (view === 'error') {
        return (
            <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300 p-6">
                <button onClick={onClose} className="absolute top-6 right-6 p-4 text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                <div className="bg-slate-800 p-8 rounded-3xl max-w-sm w-full border border-red-900/50 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3">
                        {language === 'en' ? 'Access Issue' : 'Zugriffsproblem'}
                    </h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        {errorMsg}
                    </p>
                    <div className="space-y-3">
                        <button 
                            onClick={handleStart} 
                            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/40"
                        >
                            {language === 'en' ? 'Try Again' : 'Erneut versuchen'}
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-3 bg-transparent text-slate-400 font-bold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            {t.cancel}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: CONNECTING ---
    if (view === 'connecting') {
        return (
            <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
                 <div className="flex flex-col items-center gap-4">
                     <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                     <p className="text-emerald-500 font-bold animate-pulse">Connecting to Tutor...</p>
                 </div>
            </div>
        );
    }

    // --- VIEW: SESSION & IDLE ---
    return (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
            <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-slate-800 rounded-full text-white hover:bg-slate-700 transition-colors"><X className="w-6 h-6" /></button>
            <div className="text-center space-y-8 w-full max-w-lg px-6">
                
                {/* Caption Display */}
                {caption && (
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 text-white font-medium text-lg leading-relaxed border border-white/10 animate-in fade-in slide-in-from-top-4 shadow-2xl">
                        "{caption}"
                    </div>
                )}

                <div className="relative mx-auto w-fit">
                    <div className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                        status === 'speaking' ? 'bg-emerald-500 opacity-60 scale-150 animate-pulse' : 
                        (status === 'listening' && view === 'session') ? 'bg-violet-600 opacity-40 scale-100' : 'bg-slate-500 opacity-20'
                    }`}></div>
                    <div className={`relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                        status === 'speaking' ? 'bg-white scale-110 shadow-[0_0_50px_rgba(255,255,255,0.5)]' : 
                        (status === 'listening' && view === 'session') ? 'bg-violet-600 scale-100 shadow-xl' : 'bg-slate-800'
                    }`}>
                        {status === 'speaking' ? <Activity className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-600 animate-pulse" /> : <Mic className="w-10 h-10 sm:w-14 sm:h-14 text-white" />}
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{t.oralTutor}</h2>
                    
                    {view === 'idle' ? (
                        <div className="space-y-4">
                            <p className="text-slate-400 font-medium text-sm">
                                {language === 'en' ? 'Tap below to start the session.' : 'Tippe unten, um zu beginnen.'}
                            </p>
                            <button 
                                onClick={handleStart}
                                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-emerald-600 font-lg rounded-full hover:bg-emerald-500 hover:scale-105 shadow-lg shadow-emerald-900/40"
                            >
                                <Mic className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                                {language === 'en' ? 'Enable & Start' : 'Aktivieren & Starten'}
                            </button>
                        </div>
                    ) : (
                        <>
                            {status === 'listening' && !caption && (
                                <p className="text-emerald-400 font-bold animate-pulse text-lg flex items-center justify-center gap-2">
                                    <Play className="w-4 h-4" /> Say "Start" to begin!
                                </p>
                            )}
                            <p className="text-slate-400 font-medium text-sm mt-2">
                                {status === 'listening' ? t.listening : t.speaking}
                            </p>
                        </>
                    )}
                    
                    <p className="text-slate-600 text-xs mt-4">Topic: {topic}</p>
                </div>
                {view !== 'idle' && (
                    <button onClick={onClose} className="bg-rose-500/20 text-rose-400 border border-rose-500/50 px-8 py-3 rounded-full font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 mx-auto">
                        <PhoneOff className="w-5 h-5" />
                        {t.endCall}
                    </button>
                )}
            </div>
        </div>
    );
};

export default OralTutor;
