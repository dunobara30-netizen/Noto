import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2, Globe, ExternalLink } from 'lucide-react';
import { ChatMessage, Source } from '../types';
import { createChatSession } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

interface ChatWidgetProps {
  contextSummary: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ contextSummary, isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // Initialize chat session
  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
        setMessages([
            { 
                id: '1', 
                role: 'model', 
                text: "Hallo! Ich bin Gem. Ich kann live im Internet nach Unis und NC-Werten für dich suchen. Was möchtest du wissen?", 
                timestamp: new Date() 
            }
        ]);

        chatSessionRef.current = createChatSession(
            contextSummary || "Der Student hat noch keine Noten eingegeben."
        );
        initializedRef.current = true;
    }
  }, [isOpen, contextSummary]);

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
        text: "Verbindungsproblem. Bitte versuche es erneut.",
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-['Inter']">
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 transition-all animate-in slide-in-from-bottom-10 duration-200">
          {/* Header */}
          <div className="bg-violet-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse bg-green-400"></div>
              <div className="flex flex-col">
                 <span className="font-bold leading-tight">Gemini Coach</span>
                 <span className="text-[10px] flex items-center gap-1 text-violet-200">
                    <Globe className="w-3 h-3" />
                    Online Suche aktiv
                 </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
              <Minimize2 className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-violet-600 shadow-violet-200 text-white rounded-br-none shadow-md'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.text}
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
                                className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 text-[10px] font-medium text-slate-500 hover:text-violet-600 hover:border-violet-300 transition-colors shadow-sm"
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
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Frag nach Unis, NC-Werten..."
                disabled={isLoading}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 rounded-lg disabled:opacity-50 transition-colors text-violet-600 hover:bg-violet-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105
          ${isOpen ? 'bg-slate-200 text-slate-600 rotate-90' : 'bg-violet-600 text-white shadow-violet-300/50'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>
    </div>
  );
};

export default ChatWidget;