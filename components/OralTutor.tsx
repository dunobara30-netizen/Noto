import React, { useRef, useState, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, Mic, PhoneOff, Activity, Shield, Play, Settings, ArrowRight } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface OralTutorProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  targetLanguage?: string;
  subject?: string;
  topic?: string;
}

// Audio Utils (from Gemini Docs)
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

const OralTutor: React.FC<OralTutorProps> = ({ isOpen, onClose, language, targetLanguage, subject = "General", topic = "Basics" }) => {
    const [view, setView] = useState<'setup' | 'consent' | 'session'>('setup');
    const [customTopic, setCustomTopic] = useState(topic);
    const [status, setStatus] = useState<'connecting' | 'listening' | 'speaking'>('connecting');
    const [caption, setCaption] = useState("");
    const t = TRANSLATIONS[language];
    
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    // Strict System Prompt Construction
    const promptLang = targetLanguage === 'German' ? 'German' : 'English';
    const posWord = promptLang === 'English' ? "Amazing!" : "Super!";
    const negWord = promptLang === 'English' ? "Not there yet" : "Noch nicht ganz";
    
    // Add randomness to prompt to ensure variety
    const randomSeed = Math.floor(Math.random() * 10000);

    const systemPrompt = `
    ROLE: Oral Exam Teacher. 
    SUBJECT: ${subject}. 
    TOPIC: ${customTopic}.
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

    useEffect(() => {
        if (isOpen) {
            setView('setup');
            setCustomTopic(topic);
            setCaption("");
        } else {
            stopSession();
        }
    }, [isOpen, topic]);

    const handleStartSetup = () => {
        setView('consent');
    };

    const handleConsent = () => {
        setView('session');
        startSession();
    };

    const startSession = async () => {
        setStatus('connecting');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        inputAudioContextRef.current = inputCtx;
        outputAudioContextRef.current = outputCtx;
        nextStartTimeRef.current = 0;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log("Gemini Live Connected");
                        setStatus('listening');
                        
                        const source = inputCtx.createMediaStreamSource(stream);
                        const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const pcmData = new Int16Array(inputData.length);
                            for(let i=0; i<inputData.length; i++) {
                                pcmData[i] = inputData[i] * 32768;
                            }
                            const uint8 = new Uint8Array(pcmData.buffer);
                            sessionPromiseRef.current?.then(session => {
                                session.sendRealtimeInput({
                                    media: { mimeType: 'audio/pcm;rate=16000', data: encode(uint8) }
                                });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputCtx.destination);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Handle Text Transcription (Caption)
                        if (msg.serverContent?.outputTranscription?.text) {
                            setCaption(prev => prev + msg.serverContent?.outputTranscription?.text);
                        }

                        // Handle Interruption (Clear Caption)
                        if (msg.serverContent?.interrupted) {
                            setCaption("");
                        }

                        // Handle Audio Output
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
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
                    onclose: () => stopSession(),
                    onerror: () => stopSession()
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    outputAudioTranscription: {}, // Enable transcription for captions
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                    systemInstruction: systemPrompt,
                    generationConfig: {
                        temperature: 1.0, // Increase temperature for variety
                    }
                }
            });

        } catch (e) {
            console.error("Failed to start oral tutor");
            onClose();
        }
    };

    const stopSession = () => {
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        sourcesRef.current.forEach(s => s.stop());
        sourcesRef.current.clear();
        sessionPromiseRef.current = null;
    };

    if (!isOpen) return null;

    // SETUP VIEW
    if (view === 'setup') {
        return (
            <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300 p-6">
                <button onClick={onClose} className="absolute top-6 right-6 p-4 text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                <div className="bg-slate-800 p-8 rounded-3xl max-w-sm w-full border border-slate-700 shadow-2xl">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400"><Settings className="w-8 h-8" /></div>
                    <h2 className="text-xl font-bold text-white mb-2 text-center">{language === 'en' ? 'Oral Tutor Setup' : 'Tutor Setup'}</h2>
                    <p className="text-slate-400 text-sm mb-6 text-center">{language === 'en' ? 'What exactly do you want to practice?' : 'Was genau möchtest du üben?'}</p>
                    
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Topic / Thema</label>
                        <textarea 
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-900/50 outline-none transition-all h-24 resize-none"
                            placeholder="e.g. Simple Past, Photosynthesis, World War 2..."
                        />
                    </div>

                    <button 
                        onClick={handleStartSetup} 
                        disabled={!customTopic.trim()}
                        className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {language === 'en' ? 'Next' : 'Weiter'} <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        );
    }

    // CONSENT VIEW
    if (view === 'consent') {
        return (
            <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300 p-6">
                 <button onClick={onClose} className="absolute top-6 right-6 p-4 text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                <div className="bg-slate-800 p-8 rounded-3xl max-w-sm w-full text-center border border-slate-700 shadow-2xl">
                    <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400"><Mic className="w-8 h-8" /></div>
                    <h2 className="text-xl font-bold text-white mb-2">{t.micConsentTitle}</h2>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">{t.micConsentDesc}</p>
                    <div className="flex gap-3">
                        <button onClick={() => setView('setup')} className="flex-1 py-3 bg-slate-700 text-slate-300 font-bold rounded-xl hover:bg-slate-600 transition-colors">{t.cancel}</button>
                        <button onClick={handleConsent} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50">{t.iAgree}</button>
                    </div>
                </div>
            </div>
        )
    }

    // SESSION VIEW
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
                        status === 'listening' ? 'bg-violet-600 opacity-40 scale-100' : 'bg-slate-500 opacity-20'
                    }`}></div>
                    <div className={`relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                        status === 'speaking' ? 'bg-white scale-110 shadow-[0_0_50px_rgba(255,255,255,0.5)]' : 
                        status === 'listening' ? 'bg-violet-600 scale-100 shadow-xl' : 'bg-slate-800'
                    }`}>
                        {status === 'speaking' ? <Activity className="w-10 h-10 sm:w-14 sm:h-14 text-emerald-600 animate-pulse" /> : <Mic className="w-10 h-10 sm:w-14 sm:h-14 text-white" />}
                    </div>
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{t.oralTutor}</h2>
                    {status === 'listening' && !caption && (
                        <p className="text-emerald-400 font-bold animate-pulse text-lg flex items-center justify-center gap-2">
                            <Play className="w-4 h-4" /> Say "Start" to begin!
                        </p>
                    )}
                    <p className="text-slate-400 font-medium text-sm mt-2">
                        {status === 'connecting' ? 'Connecting...' : status === 'listening' ? t.listening : t.speaking}
                    </p>
                    <p className="text-slate-600 text-xs mt-4">Topic: {customTopic}</p>
                </div>
                <button onClick={onClose} className="bg-rose-500/20 text-rose-400 border border-rose-500/50 px-8 py-3 rounded-full font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 mx-auto">
                    <PhoneOff className="w-5 h-5" />
                    {t.endCall}
                </button>
            </div>
        </div>
    );
};

export default OralTutor;