
import React, { useState, useEffect, useRef } from 'react';
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

const ChatWidget: React.FC<ChatWidgetProps> = ({ contextSummary, isOpen, setIsOpen, isAdmin, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  // Initialize chat session whenever open state or admin status changes
  useEffect(() => {
    if (isOpen) {
        const initialGreeting = isAdmin 
            ? t.chatGreetingAdmin
            : t.chatGreeting;

        setMessages([
            { 
                id: '1', 
                role: 'model', 
                text: initialGreeting, 
                timestamp: new Date() 
            }
        ]);

        chatSessionRef.current = createChatSession(
            contextSummary || "User has not entered grades yet.",
            isAdmin,
            language
        );
    }
  }, [isOpen, isAdmin, contextSummary, language]); // Added language dep

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const resultStream = await chatSessionRef.current.sendMessageStream({ message: userMsg.text });
      
      let fullResponse = "";
      let foundSources: Source[] = [];
      const modelMsgId = (Date.now() + 1).toString();
      
      // Add placeholder message
      setMessages(prev => [...prev, {
        id: modelMsgId,
        role: 'model',
        text: "",
        timestamp: new Date()
      }]);

      for await (const chunk of resultStream) {
        const responseChunk = chunk as GenerateContentResponse;
        const text = responseChunk.text || "";
        fullResponse += text;
        
        // Extract grounding chunks (sources) if available
        const groundingChunks = responseChunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
            groundingChunks.forEach((gc: any) => {
                if (gc.web?.uri && gc.web?.title) {
                    // Avoid duplicates
                    if (!foundSources.some(s => s.url === gc.web.uri)) {
                        foundSources.push({
                            title: gc.web.title,
                            url: gc.web.uri
                        });
                    }
                }
            });
        }
        
        setMessages(prev => prev.map(msg => 
          msg.id === modelMsgId ? { ...msg, text: fullResponse, sources: foundSources } : msg
        ));
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "Connection error. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Helper to strip weird tags if NOT admin. 
  // If Admin, we allow text to pass through but clean up bolding artifacts if they appear to keep it clean.
  const formatText = (text: string) => {
    if (!isAdmin) {
        return text
        .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
        .replace(/(\*|_)(.*?)\1/g, '$2')    // Remove italic
        .replace(/`([^`]+)`/g, '$1')        // Remove code blocks
        .replace(/[#*`]/g, '')              // Remove loose chars
        .trim();
    }
    
    // For Admin: We keep the text raw but clean common markdown artifacts for better readability in the mono font
    return text.replace(/\*\*/g, '').replace(/__/g, '');
  };

  // Theme configuration based on Admin status
  const theme = isAdmin ? {
    header: 'bg-slate-950',
    headerText: 'text-emerald-500 font-mono tracking-widest',
    userBubble: 'bg-slate-900 text-emerald-400 border border-emerald-900/50 font-mono',
    modelBubble: 'bg-black text-emerald-500 border border-slate-800 font-mono text-sm whitespace-pre-wrap',
    bg: 'bg-slate-900',
    input: 'bg-slate-950 text-emerald-400 border-slate-800 placeholder-slate-700 font-mono',
    button: 'text-emerald-500 hover:bg-slate-800',
    fab: 'bg-slate-900 text-emerald-400 shadow-emerald-900/20'
  } : {
    header: 'bg-violet-600',
    headerText: 'text-white',
    userBubble: 'bg-violet-600 shadow-violet-200 text-white rounded-br-none shadow-md',
    modelBubble: 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm',
    bg: 'bg-slate-50',
    input: 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white',
    button: 'text-violet-600 hover:bg-violet-50',
    fab: 'bg-violet-600 text-white shadow-violet-300/50'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-['Inter']">
      {isOpen && (
        <div className={`w-[calc(100vw-2rem)] sm:w-96 h-[500px] max-h-[70vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden mb-4 transition-all animate-in slide-in-from-bottom-10 duration-200 ${isAdmin ? 'border-slate-800' : 'border-slate-200'}`}>
          {/* Header */}
          <div className={`${theme.header} p-4 flex justify-between items-center transition-colors`}>
            <div className={`flex items-center gap-2 ${theme.headerText}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${isAdmin ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-green-400'}`}></div>
              <div className="flex flex-col">
                 <span className="font-bold leading-tight flex items-center gap-2">
                    {isAdmin ? <><ShieldCheck className="w-4 h-4" /> ROOT_SHELL</> : 'Gemini Coach'}
                 </span>
                 <span className={`text-[10px] flex items-center gap-1 ${isAdmin ? 'text-emerald-600/70 font-mono' : 'text-violet-200'}`}>
                    <Globe className="w-3 h-3" />
                    Online
                 </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className={`hover:bg-white/10 p-1 rounded-lg transition-colors ${theme.headerText}`}>
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar ${theme.bg}`}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-2xl leading-relaxed ${
                    msg.role === 'user' ? theme.userBubble : theme.modelBubble
                  }`}
                >
                  {formatText(msg.text)}
                </div>
                
                {/* Source Chips */}
                {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 max-w-[90%]">
                        {msg.sources.map((source, idx) => (
                            <a 
                                key={idx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-1 border rounded-full px-2 py-1 text-[10px] font-medium transition-colors shadow-sm ${isAdmin ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-emerald-400 hover:border-emerald-500' : 'bg-white border-slate-200 text-slate-500 hover:text-violet-600 hover:border-violet-300'}`}
                            >
                                <Globe className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">{source.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 ml-0.5 opacity-50" />
                            </a>
                        ))}
                    </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-3 border-t ${isAdmin ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isAdmin ? t.chatPlaceholderAdmin : t.chatPlaceholder}
                disabled={isLoading}
                className={`w-full pl-4 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all text-sm ${theme.input} ${isAdmin ? 'focus:ring-emerald-500' : 'focus:ring-violet-500'}`}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`absolute right-2 p-2 rounded-lg disabled:opacity-50 transition-colors ${theme.button}`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 ${theme.fab} ${isOpen ? 'rotate-90' : ''}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : (isAdmin ? <Lock className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />)}
      </button>
    </div>
  );
};

export default ChatWidget;
