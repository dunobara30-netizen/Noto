import React, { useState, useEffect, useRef, memo } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Globe, ExternalLink, ShieldCheck, Lock } from 'lucide-react';
import { ChatMessage, Source, Language, TRANSLATIONS } from '../types';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

interface ChatWidgetProps {
  contextSummary: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isAdmin: boolean;
  language: Language;
}

const formatText = (text: string, isAdmin: boolean) => {
    if (!isAdmin) {
        return text
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[#*`]/g, '')
        .trim();
    }
    return text.replace(/\*\*/g, '').replace(/__/g, '');
};

const getTheme = (isAdmin: boolean) => isAdmin ? {
    userBubble: 'bg-charcoal text-emerald-400 border border-emerald-900/30 font-mono',
    modelBubble: 'bg-espresso border border-white/5 font-mono text-xs whitespace-pre-wrap text-warm-white/80',
} : {
    userBubble: 'bg-human-charcoal text-white rounded-br-none shadow-soft',
    modelBubble: 'bg-canvas-muted dark:bg-charcoal-surface text-human-charcoal dark:text-warm-white border border-accent-sand/50 dark:border-white/5 rounded-bl-none shadow-sm',
};

const getContainerTheme = (isAdmin: boolean) => ({
    header: isAdmin ? 'bg-black' : 'bg-canvas-muted dark:bg-espresso border-b border-accent-sand/50 dark:border-white/5',
    headerText: isAdmin ? 'text-emerald-500 font-mono tracking-widest' : 'text-human-charcoal dark:text-amber-accent font-bold tracking-tight',
    bg: 'bg-canvas dark:bg-charcoal',
    input: 'bg-canvas-surface dark:bg-charcoal-surface border-accent-sand/50 dark:border-white/10 text-human-charcoal dark:text-warm-white placeholder-human-clay/30 focus:border-accent-warm/40 shadow-inner',
    button: 'text-accent-warm hover:bg-accent-warm/5',
    fab: isAdmin ? 'bg-black text-emerald-500 border border-emerald-900/50 shadow-2xl' : 'bg-human-charcoal text-white shadow-elevated'
});

const MessageItem = memo(({ msg, isAdmin }: { msg: ChatMessage, isAdmin: boolean }) => {
    const theme = getTheme(isAdmin);
    return (
        <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-1`}>
            <div className={`max-w-[88%] p-4.5 rounded-[1.4rem] leading-relaxed text-[15px] ${msg.role === 'user' ? theme.userBubble : theme.modelBubble}`}>
                {formatText(msg.text, isAdmin)}
            </div>
            {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                    {msg.sources.map((source, idx) => (
                        <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-canvas-muted dark:bg-white/5 border border-accent-sand/50 dark:border-white/5 rounded-full px-3 py-1.5 text-[9px] font-bold text-human-clay hover:text-accent-warm transition-colors">
                            <Globe className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[90px]">{source.title}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
});

const ChatInput = ({ onSend, isAdmin, placeholder, isLoading }: { onSend: (text: string) => void, isAdmin: boolean, placeholder: string, isLoading: boolean }) => {
    const [input, setInput] = useState('');
    const theme = getContainerTheme(isAdmin);

    const handleSend = () => {
        if (!input.trim()) return;
        onSend(input);
        setInput('');
    };

    return (
        <div className="p-5 border-t border-accent-sand/30 dark:border-white/5 bg-canvas dark:bg-charcoal">
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={placeholder}
                    disabled={isLoading}
                    className={`w-full pl-6 pr-14 py-4.5 border rounded-2xl focus:outline-none transition-all text-[15px] font-medium ${theme.input}`}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className={`absolute right-3.5 p-3 rounded-xl disabled:opacity-20 transition-all ${theme.button}`}>
                    {isLoading ? <Loader2 className="w-5.5 h-5.5 animate-spin" /> : <Send className="w-5.5 h-5.5" />}
                </button>
            </div>
        </div>
    );
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ contextSummary, isOpen, setIsOpen, isAdmin, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];
  const containerTheme = getContainerTheme(isAdmin);

  useEffect(() => {
    if (isOpen) {
        const initialGreeting = isAdmin ? t.chatGreetingAdmin : t.chatGreeting;
        if (messages.length === 0) setMessages([{ id: '1', role: 'model', text: initialGreeting, timestamp: new Date() }]);
        chatSessionRef.current = createChatSession(contextSummary || "New User", isAdmin, language);
    }
  }, [isOpen, isAdmin, contextSummary, language]);

  useEffect(() => { if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, isOpen]);

  const handleSend = async (text: string) => {
    if (!chatSessionRef.current) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const resultStream = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      let fullResponse = "";
      let foundSources: Source[] = [];
      const modelMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: "", timestamp: new Date() }]);

      for await (const chunk of resultStream) {
        const responseChunk = chunk as GenerateContentResponse;
        fullResponse += responseChunk.text || "";
        const groundingChunks = responseChunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
            groundingChunks.forEach((gc: any) => {
                if (gc.web?.uri && !foundSources.some(s => s.url === gc.web.uri)) {
                    foundSources.push({ title: gc.web.title, url: gc.web.uri });
                }
            });
        }
        setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last.id === modelMsgId) return [...prev.slice(0, -1), { ...last, text: fullResponse, sources: [...foundSources] }];
            return prev;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Session error. Please retry.", timestamp: new Date() }]);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[calc(100vw-5rem)] sm:w-[420px] h-[650px] max-h-[80vh] rounded-[2.5rem] premium-glass shadow-elevated border border-accent-sand/40 dark:border-white/10 flex flex-col overflow-hidden mb-6 animate-in slide-in-from-bottom-10 duration-600">
          <div className={`${containerTheme.header} p-6 flex justify-between items-center`}>
            <div className={`flex items-center gap-3.5 ${containerTheme.headerText}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isAdmin ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-accent-warm shadow-[0_0_15px_rgba(99,102,241,0.3)]'}`}></div>
              <span className="text-sm font-bold uppercase tracking-widest">{isAdmin ? 'SYSTEM_CORE' : 'Gem Assistant'}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-human-charcoal/5 dark:hover:bg-white/10 p-2 rounded-xl text-human-clay transition-all">
              <Minimize2 className="w-5.5 h-5.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-7 space-y-7 custom-scrollbar bg-canvas/40 dark:bg-charcoal">
            {messages.map((msg) => <MessageItem key={msg.id} msg={msg} isAdmin={isAdmin} />)}
            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSend={handleSend} isAdmin={isAdmin} placeholder={isAdmin ? t.chatPlaceholderAdmin : t.chatPlaceholder} isLoading={isLoading} />
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`h-16 w-16 rounded-[1.8rem] transition-all duration-700 hover:scale-110 active:scale-90 flex items-center justify-center ${containerTheme.fab}`}>
        {isOpen ? <X className="w-7 h-7" /> : (isAdmin ? <Lock className="w-7 h-7" /> : <MessageCircle className="w-8 h-8" />)}
      </button>
    </div>
  );
};

export default ChatWidget;