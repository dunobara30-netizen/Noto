import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { X, MessageSquare, Loader2, Send, ArrowLeft, Trophy } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface AIInterviewerProps {
  language: Language;
  onComplete: () => void;
  onBack: () => void;
}

const AIInterviewer: React.FC<AIInterviewerProps> = ({ language, onComplete, onBack }) => {
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [topic, setTopic] = useState('');
  const t = TRANSLATIONS[language];
  const chatRef = useRef<any>(null);

  const startSession = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: (process as any).env.API_KEY });
    const targetLang = language === 'de' ? 'German' : 'English';
    
    chatRef.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: `You are an expert academic interviewer. Target Language: STRICTLY ${targetLang}. Topic: ${topic}. Protocol: Ask one short, challenging question. Wait for answer. Evaluate (Positive/Negative feedback). Ask next question. Keep it concise.`
        }
    });

    try {
        const response = await chatRef.current.sendMessage({ message: "Start the interview now." });
        setMessages([{ role: 'ai', text: response.text || "" }]);
        setSessionActive(true);
    } catch (e) {
        alert("Session error");
    } finally {
        setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
        const response = await chatRef.current.sendMessage({ message: userText });
        setMessages(prev => [...prev, { role: 'ai', text: response.text || "" }]);
        if (messages.length > 6) {
            onComplete(); // Reward XP after a few rounds
        }
    } catch (e) {
        setMessages(prev => [...prev, { role: 'ai', text: "Error in conversation." }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in slide-in-from-right-10 duration-700">
      <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-3 hover:bg-canvas-muted dark:hover:bg-white/5 rounded-xl transition-all"><ArrowLeft className="w-5 h-5" /></button>
          <div className="text-center">
            <h2 className="text-2xl font-black text-human-charcoal dark:text-warm-white flex items-center gap-3"><MessageSquare className="w-7 h-7 text-accent-warm" /> {t.aiInterviewer}</h2>
          </div>
          <div className="w-10"></div>
      </div>

      {!sessionActive ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-8">
              <div className="w-20 h-20 bg-accent-warm/10 rounded-3xl flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-accent-warm" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{language === 'de' ? 'Bereit für das Abfragen?' : 'Ready for the interview?'}</h3>
                <p className="text-sm text-human-stone opacity-60 max-w-xs">{language === 'de' ? 'Wähle ein Thema und die KI wird dich wie ein Lehrer abfragen.' : 'Pick a topic and the AI will quiz you like a teacher.'}</p>
              </div>
              <input 
                type="text" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.topicPlaceholder}
                className="w-full max-w-sm p-5 rounded-2xl bg-canvas-muted dark:bg-white/5 border-2 border-accent-sand/40 dark:border-white/10 outline-none text-center font-bold text-lg"
              />
              <button onClick={startSession} className="w-full max-w-sm py-5 bg-accent-warm text-white font-bold rounded-2xl shadow-elevated">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (language === 'de' ? 'Sitzung starten' : 'Start Session')}
              </button>
          </div>
      ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
                  {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-4 rounded-2xl font-medium leading-relaxed ${m.role === 'user' ? 'bg-accent-warm text-white rounded-tr-none' : 'bg-canvas-muted dark:bg-charcoal-surface text-human-charcoal dark:text-warm-white rounded-tl-none border border-accent-sand/30 dark:border-white/5'}`}>
                              {m.text}
                          </div>
                      </div>
                  ))}
                  {loading && <Loader2 className="w-5 h-5 animate-spin text-accent-warm" />}
              </div>
              <div className="relative pt-4 border-t border-accent-sand/20">
                  <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t.chatPlaceholder}
                    className="w-full pl-6 pr-14 py-4.5 rounded-2xl bg-canvas-muted dark:bg-white/5 border border-accent-sand/30 dark:border-white/10 outline-none font-medium"
                  />
                  <button onClick={handleSend} className="absolute right-2 bottom-2 p-3 text-accent-warm hover:bg-accent-warm/5 rounded-xl transition-all">
                      <Send className="w-6 h-6" />
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default AIInterviewer;
