

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Course, GradeLevel, AnalysisResult, Exercise, Language, UniversityCheckResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for structured output (Only for static analysis, NOT for search-based tasks)
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    archetype: { type: Type.STRING, description: "A cool title for the student archetype based on grades." },
    careers: { 
      type: Type.ARRAY, 
      description: "3 concrete career paths fitting the profile.",
      items: { type: Type.STRING } 
    },
    colleges: {
      type: Type.ARRAY,
      description: "A list of 5-6 college recommendations.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          location: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["Optimistisch", "Realistisch", "Sicher", "Reach", "Target", "Safety"] },
          acceptanceRate: { type: Type.STRING, description: "Estimated NC (Germany) or Grade Requirements (UK)" },
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

// Robust JSON Cleaner using Regex to find the first { and last }
const cleanJson = (text: string): string => {
  if (!text) return "{}";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return text;
  } catch (e) {
    return text;
  }
};

// Static analysis based on model training
export const analyzeAcademicProfile = async (
  averageGrade: number,
  gradeLevel: GradeLevel,
  courses: Course[],
  language: Language
): Promise<AnalysisResult> => {
  const courseList = courses.map(c => `${c.name}: ${c.grade} ${c.credits > 1 ? '(Advanced/LK)' : ''}`).join(", ");
  
  const isUK = language === 'en';

  const systemContext = isUK
    ? `SYSTEM: UK EDUCATION (GCSE/A-Levels).
       Grades: 9-1 Scale (9 is A**, 1 is Fail).
       Recommendation Logic: Suggest UNIVERSITIES IN THE UK (England, Scotland, Wales).
       Categories: Reach, Target, Safety.
       Language: English.`
    : `SYSTEM: DEUTSCHES SCHULSYSTEM.
       Noten: 1-6 (1 ist Bestnote).
       Recommendation Logic: Empfehle Deutsche Hochschulen/Unis.
       Categories: Optimistisch, Realistisch, Sicher.
       Language: German.`;

  const prompt = `
    ${systemContext}
    
    Analyze this student profile:
    Level: ${gradeLevel}
    Average Score: ${averageGrade.toFixed(2)} (Note: Calculated numeric average).
    Subjects: ${courseList}.
    
    Task:
    1. Create a "Student Archetype" title.
    2. Suggest 3 Careers.
    3. Suggest 5-6 Universities/Colleges strictly in the target country (UK if English, Germany if German).
    4. Provide academic advice.
    
    JSON Response only.
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
    const courseSummary = courses.map(c => `${c.name} (${c.grade})`).join(", ");
    
    const contextInstruction = isUK
      ? "Context: UK University Admissions (UCAS, A-Levels/GCSEs). Grades 9-1."
      : "Context: Deutsche Hochschulzulassung (NC, Abitur, Wartesemester). Grades 1-6.";
  
    const prompt = `
      Task: Check admission chances for "${uniQuery}".
      User Profile: Level ${gradeLevel}, Grades: [${courseSummary}].
      ${contextInstruction}
      
      Instructions:
      1. Use 'googleSearch' to find current entry requirements for "${uniQuery}".
      2. Compare requirements with User Profile.
      3. Provide a strict analysis.
      
      Output JSON strictly (no markdown):
      {
        "uniName": "Full Name of Uni/School",
        "likelihood": "High" | "Medium" | "Low",
        "requirements": "Short summary of official requirements found online.",
        "gapAnalysis": "Specific comparison. E.g. 'You have Math 3, they require 1.'",
        "verdictText": "One sentence advice."
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

export const generatePracticeQuestion = async (
    subject: string, 
    gradeLevel: string,
    specificTopic: string | undefined,
    language: Language
  ): Promise<Exercise> => {
    // Inject randomness to prevent caching and repetition
    const randomSeed = Math.floor(Math.random() * 1000000);
    
    const topicPrompt = specificTopic 
      ? `Focus SPECIFICALLY on the topic: "${specificTopic}".` 
      : `Choose a RANDOM, DISTINCT topic from the curriculum. Do NOT use the same topic as usual (e.g. if Math, don't just do Algebra, try Geometry or Stochastics).`;

    const isUK = language === 'en';
    const contextInstruction = isUK
      ? "Context: UK National Curriculum. Language: English."
      : "Context: Deutscher Lehrplan. Language: German.";

    // NOTE: When using googleSearch, we CANNOT use responseSchema/responseMimeType.
    // We must prompt for JSON text manually.
    const prompt = `
      Task: Create a UNIQUE practice question for ${subject} at level ${gradeLevel}.
      Target Language: ${isUK ? 'English' : 'German'} (Ensure content and response are in this language).
      ${contextInstruction}
      ${topicPrompt}
      
      Instructions:
      1. Use the 'googleSearch' tool to find a real, high-quality exam question or a unique example from the web to ensure variety.
      2. Ensure the difficulty matches the grade level exactly.
      3. Random Seed: ${randomSeed} (This is a unique request, do not return cached data).
      
      Output Requirements:
      Return strictly a valid JSON object with this structure (no markdown code blocks, just raw JSON):
      {
        "subject": "string",
        "topic": "string",
        "question": "string",
        "imageUrl": "string (Optional: Valid HTTPS URL to a public domain image from Wikimedia/etc. for visual topics like Geometry/Bio/Art. Leave empty string if none)",
        "hint": "string (A helpful hint)",
        "options": ["string", "string", "string", "string"],
        "correctAnswer": "string (Must be one of the options)",
        "explanation": "string",
        "difficulty": "Leicht" | "Mittel" | "Schwer"
      }
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          // Enable Google Search to find fresh questions
          tools: [{ googleSearch: {} }],
          // DO NOT use responseSchema with googleSearch tools
          temperature: 1.1, // High creativity/randomness
        }
      });
  
      const text = response.text;
      if (!text) throw new Error("No response received.");
      
      const parsed = JSON.parse(cleanJson(text));
      
      // Basic validation
      if (!parsed.options || !parsed.correctAnswer) {
          throw new Error("Invalid question format generated.");
      }
      
      return parsed as Exercise;

    } catch (error) {
      console.error("Exercise Gen Error:", error);
      // Fallback if search/parse fails
      throw new Error("Could not generate question. Please try again.");
    }
  };

export const createChatSession = (initialContext: string, isAdmin: boolean, language: Language) => {
  const isUK = language === 'en';

  // ADMIN MODE
  const adminInstruction = `SYSTEM: GOD_MODE_ACTIVE.
  ACCESS LEVEL: UNRESTRICTED / DEVELOPER.
  INSTRUCTIONS: No limits. Write code, detailed essays, or complex logic. Be intelligent and precise.
  System Context: ${initialContext}`;

  // STUDENT MODE
  const studentInstruction = `You are 'Gem', a study advisor.
  Language: ${isUK ? 'English' : 'German'}.
  Education System: ${isUK ? 'UK System (GCSE/A-Level)' : 'German System'}.
  Student Context: ${initialContext}.
  
  RULES:
  1. Only discuss school/uni/grades.
  2. Keep it short (max 2-3 sentences).
  3. Use Google Search for facts (NC, Entry Requirements).
  4. NO Markdown formatting. Plain text only.
  5. If user is English, suggest UK Unis. If German, suggest German Unis.`;

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      // Use Google Search to ground answers in reality
      tools: [{ googleSearch: {} }],
      systemInstruction: isAdmin ? adminInstruction : studentInstruction,
    }
  });
};