import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { X, Brain, Loader2, Send, ArrowLeft } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface DeepSolverProps {
  language: Language;
  onComplete: () => void;
  onBack: () => void;
}

const DeepSolver: React.FC<DeepSolverProps> = ({ language, onComplete, onBack }) => {
  const [input, setInput] = useState('');
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const t = TRANSLATIONS[language];

  const handleSolve = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: (process as any).env.API_KEY });
    const targetLang = language === 'de' ? 'German' : 'English';
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Solve the following academic problem step-by-step. Language: STRICTLY ${targetLang}. Problem: ${input}`,
            config: {
                systemInstruction: `You are a specialized academic problem solver. Provide step-by-step logic. Keep it concise but thorough.`
            }
        });
        setSolution(response.text || "Error");
        onComplete();
    } catch (e) {
        setSolution("Service unavailable. Try again later.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
          <button onClick={onBack} className="p-3 hover:bg-canvas-muted dark:hover:bg-white/5 rounded-xl transition-all"><ArrowLeft className="w-5 h-5" /></button>
          <div className="text-center">
            <h2 className="text-2xl font-black text-human-charcoal dark:text-warm-white flex items-center gap-3"><Brain className="w-7 h-7 text-indigo-500" /> {t.deepSolver}</h2>
            <p className="text-[10px] uppercase tracking-widest text-human-stone opacity-50">{language === 'de' ? 'Komplexe Aufgaben lösen' : 'Solve complex problems'}</p>
          </div>
          <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={language === 'de' ? 'Füge deine Aufgabe hier ein...' : 'Paste your problem here...'}
            className="flex-1 p-6 rounded-3xl bg-canvas-muted dark:bg-espresso/50 border-2 border-accent-sand/40 dark:border-white/5 focus:border-indigo-500/50 transition-all outline-none font-medium text-lg resize-none text-human-charcoal dark:text-warm-white"
        />
        
        {solution && (
            <div className="p-8 rounded-3xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-human-charcoal dark:text-warm-white overflow-y-auto max-h-[300px]">
                <h4 className="font-bold text-xs uppercase tracking-widest text-indigo-500 mb-4">{language === 'de' ? 'Lösungsweg' : 'Solution Path'}</h4>
                <p className="whitespace-pre-wrap leading-relaxed">{solution}</p>
            </div>
        )}

        <button 
            onClick={handleSolve} 
            disabled={loading || !input.trim()} 
            className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-elevated hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
        >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            {language === 'de' ? 'Lösung berechnen' : 'Calculate Solution'}
        </button>
      </div>
    </div>
  );
};

export default DeepSolver;
