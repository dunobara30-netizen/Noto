import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Course, GradeLevel, AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for structured output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    colleges: {
      type: Type.ARRAY,
      description: "Eine Liste von 5-6 Hochschulempfehlungen basierend auf allgemeinem Wissen.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          location: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["Optimistisch", "Realistisch", "Sicher"] },
          acceptanceRate: { type: Type.STRING, description: "Geschätzter NC oder Hürde" },
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
  required: ["colleges", "advice"]
};

const cleanJson = (text: string): string => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
};

// Static analysis based on model training
export const analyzeAcademicProfile = async (
  averageGrade: number,
  gradeLevel: GradeLevel,
  courses: Course[]
): Promise<AnalysisResult> => {
  const courseList = courses.map(c => `${c.name}: ${c.grade}`).join(", ");
  const prompt = `
    Analysiere das Profil (Deutsches System 1+ bis 6):
    Stufe: ${gradeLevel}, Schnitt: ${averageGrade.toFixed(2)}.
    Fächer: ${courseList}.
    
    Erstelle ein JSON mit Uni-Empfehlungen und Tipps.
    Nutze internes Wissen für Uni-Vorschläge.
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
    if (!text) throw new Error("Keine Antwort erhalten.");
    return JSON.parse(cleanJson(text)) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const createChatSession = (initialContext: string) => {
  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      // Detailed system instruction to prevent markdown formatting issues and ensure brevity
      systemInstruction: `Du bist 'Gem', ein effizienter Studienberater.
      Kontext des Schülers: ${initialContext}.
      
      STRENGE REGELN:
      1. Fasse dich EXTREM kurz. Maximal 2-3 Sätze pro Antwort.
      2. Komm sofort auf den Punkt. Kein Smalltalk, kein "Gern geschehen".
      3. Antworte IMMER nur in reinem Text (Plain Text).
      4. KEINE Markdown-Formatierungen (#, *, **).
      
      INHALT:
      - Nenne direkt passende Studiengänge/Unis.
      - Gib kurze, knackige Tipps.`,
    }
  });
};