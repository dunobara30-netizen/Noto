
import { GoogleGenAI, Type } from "@google/genai";
import { Course, GradeLevel, AnalysisResult, Exercise, Language, Difficulty } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: any = {
  type: Type.OBJECT,
  properties: {
    archetype: { type: Type.STRING, description: "A very short, cool title (max 3 words)." },
    careers: { type: Type.ARRAY, items: { type: Type.STRING } },
    colleges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          location: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["Optimistisch", "Realistisch", "Sicher", "Reach", "Target", "Safety"] },
          acceptanceRate: { type: Type.STRING },
          reason: { type: Type.STRING }
        },
        required: ["name", "location", "category", "acceptanceRate", "reason"]
      }
    },
    advice: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["summary", "strengths", "improvements"]
    }
  },
  required: ["colleges", "advice", "archetype", "careers"]
};

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
  const targetLangName = language === 'en' ? 'English' : 'German';

  const prompt = `
    Analyze this academic profile for a ${gradeLevel} student. Average Grade: ${averageGrade.toFixed(2)}. 
    Subjects: ${courseList}. Language: STRICTLY ${targetLangName}. 
    Return JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(cleanJson(text)) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const generatePracticeQuestion = async (
    subject: string, 
    gradeLevel: string,
    specificTopic: string | undefined, 
    language: Language,
    difficulty: Difficulty,
    retryCount = 0
  ): Promise<Exercise> => {
    
    const isUK = language === 'en';
    let targetLang = isUK ? 'English' : 'German';
    
    if (subject.toLowerCase().includes('english') || subject.toLowerCase().includes('englisch')) targetLang = 'English';
    if (subject.toLowerCase().includes('german') || subject.toLowerCase().includes('deutsch')) targetLang = 'German';

    const questionTypes = ["multiple-choice", "text-input", "multi-select"];
    const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    const randomSeed = Math.random().toString(36).substring(7);

    const prompt = `
      Create a unique, creative academic question for ${subject} (${gradeLevel}).
      Interface Language: STRICTLY ${targetLang}.
      Topic: "${specificTopic || 'Core concepts'}".
      Difficulty: ${difficulty}.
      Question Type: ${randomType}.
      Random Seed: ${randomSeed}.
      
      RULES:
      1. For "text-input": correctAnswer must be a single word or short phrase.
      2. For "multi-select": include 4-5 options, where 2 or 3 are correct. correctAnswer must be an array of strings matching exactly the correct options.
      3. For "multiple-choice": include 4 options, 1 correct.
      4. Ensure high randomness and varied cognitive styles.
      
      Output JSON only:
      {
        "type": "${randomType}",
        "subject": "string",
        "topic": "string",
        "question": "string",
        "hint": "string",
        "options": ["A", "B", "C", "D"], // Only if multiple-choice or multi-select
        "correctAnswer": "string" | ["string"], // String for MC/Text, Array for Multi-select
        "explanation": "Max 2 sentences.",
        "difficulty": "${difficulty}"
      }
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { temperature: 1.0 }
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
  const targetLang = language === 'en' ? 'English' : 'German';
  const systemInstruction = `Role: Academic Coach 'Gem'. Language: ${targetLang}. Context: ${initialContext}. Keep answers short.`;

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction,
    }
  });
};

// Added solveHomeworkProblem function for image analysis
export const solveHomeworkProblem = async (base64Image: string, language: Language): Promise<string> => {
  const targetLang = language === 'en' ? 'English' : 'German';
  const prompt = `Analyze and solve the academic problem shown in this image. Provide a step-by-step explanation. Language: STRICTLY ${targetLang}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      }
    });
    return response.text || (language === 'en' ? "Could not solve problem." : "Aufgabe konnte nicht gelöst werden.");
  } catch (error) {
    console.error("Homework Solver Error:", error);
    return language === 'en' ? "Error processing image." : "Fehler bei der Bildverarbeitung.";
  }
};
