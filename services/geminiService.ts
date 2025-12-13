
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Course, GradeLevel, AnalysisResult, Exercise, Language, UniversityCheckResult, Difficulty, CareerCheckResult, PlaceResult, GroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    archetype: { type: Type.STRING, description: "A very short, cool title (max 3 words)." },
    careers: { 
      type: Type.ARRAY, 
      description: "3 concrete career paths.",
      items: { type: Type.STRING } 
    },
    colleges: {
      type: Type.ARRAY,
      description: "List of 5 college recommendations.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          location: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["Optimistisch", "Realistisch", "Sicher", "Reach", "Target", "Safety"] },
          acceptanceRate: { type: Type.STRING, description: "Short NC/Grade req." },
          reason: { type: Type.STRING, description: "Max 1 sentence reason." }
        },
        required: ["name", "location", "category", "acceptanceRate", "reason"]
      }
    },
    advice: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING, description: "Max 2 sentences." },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["summary", "strengths", "improvements"]
    }
  },
  required: ["colleges", "advice", "archetype", "careers"]
};

// Robust JSON Cleaner
const cleanJson = (text: string): string => {
  if (!text) return "{}";
  try {
    let clean = text.replace(/```json/g, '').replace(/```/g, '');
    const jsonMatch = clean.match(/\{[\s\S]*\}/);
    if (jsonMatch) return jsonMatch[0];
    return clean;
  } catch (e) {
    return text;
  }
};

export const analyzeAcademicProfile = async (
  averageGrade: number,
  gradeLevel: GradeLevel,
  courses: Course[],
  language: Language
): Promise<AnalysisResult> => {
  const courseList = courses.map(c => `${c.name}: ${c.grade}`).join(", ");
  const isUK = language === 'en';
  const targetLangName = isUK ? 'English' : 'German';

  const systemContext = isUK
    ? `System: UK (9-1 Scale). Location: UK.`
    : `System: German (1-6 Scale). Location: Germany.`;

  const prompt = `
    ${systemContext}
    Profile: Level ${gradeLevel}, Avg ${averageGrade.toFixed(2)}, Subjects: ${courseList}.
    
    Task: Analyze this profile.
    CRITICAL: Keep all text EXTREMELY SHORT and CONCISE.
    Language: STRICTLY ${targetLangName}.
    
    1. Archetype: Cool title (max 3 words).
    2. Careers: 3 fits.
    3. Colleges: 5 recommendations in ${isUK ? 'UK' : 'Germany'}.
    4. Advice: Max 2 sentences summary. Bullet points for strengths/improvements.
    
    Return JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response received.");
    return JSON.parse(cleanJson(text)) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const checkUniversityAdmission = async (
    uniQuery: string,
    courses: Course[],
    gradeLevel: GradeLevel,
    language: Language
  ): Promise<UniversityCheckResult> => {
    
    const isUK = language === 'en';
    const targetLangName = isUK ? 'English' : 'German';
    const courseSummary = courses.map(c => `${c.name} (${c.grade})`).join(", ");
    
    const prompt = `
      Check admission for "${uniQuery}".
      Profile: Level ${gradeLevel}, Grades: [${courseSummary}].
      Language: STRICTLY ${targetLangName}.
      
      Instructions:
      1. Find entry requirements.
      2. Compare with profile.
      3. KEEP IT SHORT. Verdict: 1 sentence. Gap Analysis: Bullet points.
      
      Output JSON:
      {
        "uniName": "string",
        "likelihood": "High" | "Medium" | "Low",
        "requirements": "Max 1 sentence.",
        "gapAnalysis": "Max 2 sentences on what to improve.",
        "verdictText": "1 sentence advice."
      }
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.5,
        }
      });
  
      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(cleanJson(text)) as UniversityCheckResult;
    } catch (error) {
      console.error("Uni Check Error:", error);
      throw new Error("Check failed");
    }
  };

export const checkCareerFit = async (
    jobTitle: string,
    courses: Course[],
    gradeLevel: GradeLevel,
    language: Language
  ): Promise<CareerCheckResult> => {
    
    const isUK = language === 'en';
    const targetLangName = isUK ? 'English' : 'German';
    const courseSummary = courses.map(c => `${c.name}: ${c.grade}`).join(", ");
    
    const prompt = `
      Analyze fit for job "${jobTitle}".
      Profile: Level ${gradeLevel}, Grades: [${courseSummary}].
      Language: STRICTLY ${targetLangName}.
      
      Instructions:
      1. Find academic requirements.
      2. KEEP IT SHORT. Analysis: Max 2 sentences.
      
      Output JSON:
      {
        "jobTitle": "${jobTitle}",
        "matchScore": number (0-100),
        "likelihood": "Very High" | "High" | "Medium" | "Low" | "Very Low",
        "analysis": "Max 2 sentences explaining the score.",
        "keySubjects": ["Subject 1", "Subject 2"]
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 0.5,
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(cleanJson(text)) as CareerCheckResult;
    } catch (error) {
      console.error("Career Check Error:", error);
      throw new Error("Career Check failed");
    }
  };

export const findNearbyPlaces = async (
  location: string, 
  language: Language
): Promise<PlaceResult> => {
  const isUK = language === 'en';
  const targetLang = isUK ? 'English' : 'German';
  
  const prompt = `
    Find 3-4 universities/colleges near "${location}".
    Language: ${targetLang}.
    Output: Markdown list.
    Constraint: Descriptions must be MAX 1 LINE.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      }
    });

    const text = response.text || (isUK ? "No results found." : "Keine Ergebnisse gefunden.");
    // Cast to unknown first to avoid partial type mismatch issues
    const chunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as unknown as GroundingChunk[];

    return { text, chunks };

  } catch (error) {
    console.error("Map Search Error:", error);
    throw new Error("Map search failed");
  }
};

const getRandomConcept = (subject: string): string => {
  // Simplified list for brevity
  const concepts: Record<string, string[]> = {
    'Math': ['Linear Functions', 'Geometry', 'Stochastics', 'Percentages', 'Calculus', 'Algebra'],
    'Mathematik': ['Lineare Funktionen', 'Geometrie', 'Stochastik', 'Prozentrechnung', 'Analysis', 'Algebra'],
    'German': ['Poetry Analysis', 'Grammar', 'Essay Structure', 'Spelling'],
    'Deutsch': ['Gedichtanalyse', 'Grammatik', 'Erörterung', 'Rechtschreibung', 'Kommasetzung'],
    'English': ['Tenses', 'If-Clauses', 'Text Analysis', 'Vocabulary', 'Gerunds'],
    'Englisch': ['Zeitformen', 'If-Clauses', 'Textanalyse', 'Vokabeln', 'Gerundium'],
    'Biology': ['Cells', 'Genetics', 'Ecology', 'Evolution', 'Human Body'],
    'Biologie': ['Zellen', 'Genetik', 'Ökologie', 'Evolution', 'Menschlicher Körper'],
    'History': ['Industrial Revolution', 'World War 1', 'Cold War', 'Middle Ages'],
    'Geschichte': ['Industrielle Revolution', 'Erster Weltkrieg', 'Kalter Krieg', 'Mittelalter']
  };

  const key = Object.keys(concepts).find(k => k.toLowerCase() === subject.toLowerCase()) || 'Math';
  const list = concepts[key] || concepts['Math'];
  return list[Math.floor(Math.random() * list.length)];
};

export const generatePracticeQuestion = async (
    subject: string, 
    gradeLevel: string,
    specificTopic: string | undefined, 
    language: Language,
    difficulty: Difficulty,
    retryCount = 0
  ): Promise<Exercise> => {
    
    const isNotesMode = specificTopic && specificTopic.length > 50;
    const randomSubConcept = !specificTopic ? getRandomConcept(subject) : '';
    const randomSeed = Math.random().toString(36).substring(7);
    
    const isUK = language === 'en';
    let targetLang = isUK ? 'English' : 'German';
    
    // STRICT Language Override for Language Subjects
    const subLower = subject.toLowerCase();
    if (subLower.includes('english') || subLower.includes('englisch')) {
        targetLang = 'English';
    } else if (subLower.includes('german') || subLower.includes('deutsch')) {
        targetLang = 'German';
    }

    const topicPrompt = isNotesMode 
        ? `Source: "${specificTopic.substring(0, 500)}...". Task: Question based on source.` 
        : `Topic: "${specificTopic || randomSubConcept}".`;

    const prompt = `
      Create a practice question for ${subject} (${gradeLevel}).
      Difficulty: ${difficulty}.
      Language: STRICTLY ${targetLang}.
      ${topicPrompt}
      
      Constraint: Keep Question and Explanation SHORT and DIRECT.
      Seed: ${randomSeed}.
      
      Output JSON (No Markdown):
      {
        "type": "multiple-choice" | "true-false" | "fill-blank" | "flashcard",
        "subject": "string",
        "topic": "string",
        "question": "string",
        "imageUrl": "string (optional)",
        "hint": "string",
        "options": ["a", "b", "c", "d"],
        "correctAnswer": "string",
        "explanation": "Max 2 sentences.",
        "difficulty": "Easy" | "Medium" | "Hard" | "Leicht" | "Mittel" | "Schwer"
      }
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 1.5,
        }
      });
  
      const text = response.text;
      if (!text) throw new Error("No response");
      return JSON.parse(cleanJson(text)) as Exercise;

    } catch (error) {
      if (retryCount < 2) return generatePracticeQuestion(subject, gradeLevel, specificTopic, language, difficulty, retryCount + 1);
      throw new Error("Gen Error");
    }
  };

export const createChatSession = (initialContext: string, isAdmin: boolean, language: Language) => {
  const isUK = language === 'en';
  const targetLang = isUK ? 'English' : 'German';

  const systemInstruction = isAdmin 
  ? `SYSTEM: ADMIN. Lang: ${targetLang}.` 
  : `Role: Study Coach 'Gem'. 
     Language: STRICTLY ${targetLang}.
     Constraint: RESPONSES MUST BE VERY SHORT (Max 2 sentences). NO FLUFF.
     Context: ${initialContext}`;

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: systemInstruction,
    }
  });
};
