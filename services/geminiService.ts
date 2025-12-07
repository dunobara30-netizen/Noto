
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Course, GradeLevel, AnalysisResult, Exercise, Language, UniversityCheckResult, Difficulty } from "../types";

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
      ? "Context: UK University Admissions (UCAS, A-Levels/GCSEs). Grades 9-1 (9 is best, 4 is pass)."
      : "Context: Deutsche Hochschulzulassung (NC, Abitur, Wartesemester). Grades 1-6 (1 is best).";
  
    const prompt = `
      Task: Check admission chances for "${uniQuery}".
      User Profile: Level ${gradeLevel}, Grades: [${courseSummary}].
      ${contextInstruction}
      
      Instructions:
      1. Use 'googleSearch' to find current entry requirements for "${uniQuery}".
      2. Compare requirements with User Profile grades.
      3. CRITICAL: Identify exactly what grades need to improve. If they have a 5 (UK) in Math but need a 7, say "You have 5, need 7".
      
      Output JSON strictly (no markdown):
      {
        "uniName": "Full Name of Uni/School",
        "likelihood": "High" | "Medium" | "Low",
        "requirements": "Short summary of requirements found (e.g. 'AAA at A-Level including Math').",
        "gapAnalysis": "Specific list of what grades to enter/improve. E.g. 'Your Math grade (5) is too low for this course, aim for 7.'",
        "verdictText": "One sentence actionable advice."
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

// Random sub-concepts to force variety
const getRandomConcept = (subject: string): string => {
  const concepts: Record<string, string[]> = {
    'Math': ['Linear Functions', 'Geometry 3D', 'Stochastics', 'Percentages', 'Calculus', 'Vectors', 'Algebra Basics', 'Logic Puzzles'],
    'Mathematik': ['Lineare Funktionen', 'Geometrie', 'Wahrscheinlichkeitsrechnung', 'Prozentrechnung', 'Analysis', 'Vektoren', 'Algebra', 'Logikrätsel'],
    'German': ['Poetry Analysis', 'Grammar Tenses', 'Essay Structure', 'Literature Epochs', 'Spelling Rules', 'Rhetorical Devices', 'Definitionen'],
    'Deutsch': ['Gedichtanalyse', 'Grammatik Zeitformen', 'Erörterung', 'Literaturepochen', 'Rechtschreibung', 'Rhetorische Mittel', 'Definitionen'],
    'English': ['Past Tenses', 'If-Clauses', 'Text Analysis', 'Creative Writing', 'Vocabulary: Politics', 'Idioms', 'Translations'],
    'Englisch': ['Zeitformen', 'If-Clauses', 'Textanalyse', 'Creative Writing', 'Wortschatz: Politik', 'Redewendungen', 'Übersetzung'],
    'Biology': ['Cell Structure', 'Genetics', 'Ecology', 'Evolution', 'Human Anatomy', 'Photosynthesis', 'Terminology'],
    'Biologie': ['Zellaufbau', 'Genetik', 'Ökologie', 'Evolution', 'Anatomie', 'Fotosynthese', 'Fachbegriffe'],
    'History': ['Industrial Revolution', 'World War 1', 'Ancient Rome', 'Cold War', 'French Revolution', 'Middle Ages', 'Dates & Events'],
    'Geschichte': ['Industrielle Revolution', 'Erster Weltkrieg', 'Römisches Reich', 'Kalter Krieg', 'Französische Revolution', 'Mittelalter', 'Daten & Fakten']
  };

  // Find key that matches loosely
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
    
    // 1. Force a random sub-concept if no specific topic is provided to prevent repetition
    const randomSubConcept = !specificTopic ? getRandomConcept(subject) : '';
    const randomSeed = Math.floor(Math.random() * 1000000); // Technical seed
    
    // 2. Build the Topic Prompt
    const topicPrompt = specificTopic 
      ? `Focus SPECIFICALLY on the topic: "${specificTopic}".` 
      : `Focus on the specific sub-topic: "${randomSubConcept}". Do NOT create a generic question.`;

    const isUK = language === 'en';
    const contextInstruction = isUK
      ? "Context: UK National Curriculum. Language: English."
      : "Context: Deutscher Lehrplan. Language: German.";

    // 3. Prompt Engineering for Clarity and Variety
    const prompt = `
      Task: Create a UNIQUE, HIGH-QUALITY practice exercise for ${subject} at level ${gradeLevel}.
      Difficulty Level: ${difficulty.toUpperCase()} (Adjust complexity relative to grade level).
      Target Language: ${isUK ? 'English' : 'German'} (Ensure content and response are in this language).
      ${contextInstruction}
      ${topicPrompt}
      
      Instructions:
      1. Use 'googleSearch' to find fresh data or real-world examples if needed.
      2. **CLARITY**: Write the question in simple, understandable student language.
      3. **VARIETY**: Randomly choose ONE of these types: 
         - "multiple-choice" (Standard)
         - "true-false" (Binary choice)
         - "fill-blank" (User must type the missing word)
         - "flashcard" (Front is term/question, Back is definition/answer)
      
      4. Random Seed: ${randomSeed}.
      
      Output Requirements:
      Return strictly a valid JSON object with this structure (no markdown code blocks, just raw JSON):
      {
        "type": "multiple-choice" | "true-false" | "fill-blank" | "flashcard",
        "subject": "string",
        "topic": "${specificTopic || randomSubConcept}",
        "question": "string (The question text OR the front of the flashcard OR the sentence with a ____ for fill-blank)",
        "imageUrl": "string (Optional: Valid HTTPS URL to a public domain image from Wikimedia/etc. for visual topics like Geometry/Bio/Art. Leave empty string if none)",
        "hint": "string (A helpful hint that doesn't give away the answer)",
        "options": ["string", "string", "string", "string"] (Only for multiple-choice, otherwise null/empty),
        "correctAnswer": "string (CRITICAL: For 'true-false' use exactly 'True' or 'False' (or 'Wahr'/'Falsch'). For 'fill-blank' use the missing word. For 'flashcard' use the answer)",
        "explanation": "string (Simple explanation of why the answer is correct)",
        "difficulty": "${isUK ? 'Easy' : 'Leicht'}" | "${isUK ? 'Medium' : 'Mittel'}" | "${isUK ? 'Hard' : 'Schwer'}"
      }
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 1.2, // Increased temperature for less deterministic/repetitive results
        }
      });
  
      const text = response.text;
      if (!text) throw new Error("No response received.");
      
      const parsed = JSON.parse(cleanJson(text)) as Exercise;
      
      // Validation Check
      if (!parsed.correctAnswer || !parsed.question || !parsed.type) {
          throw new Error("Invalid question format: missing critical fields.");
      }
      if (parsed.type === 'multiple-choice' && (!parsed.options || parsed.options.length < 2)) {
          throw new Error("Invalid multiple choice: missing options.");
      }
      
      return parsed;

    } catch (error) {
      console.error(`Exercise Gen Error (Attempt ${retryCount + 1}):`, error);
      
      // Retry logic (max 3 attempts)
      if (retryCount < 2) {
          return generatePracticeQuestion(subject, gradeLevel, specificTopic, language, difficulty, retryCount + 1);
      }
      
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
