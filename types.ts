export interface Course {
  id: string;
  name: string;
  grade: string; // German grade value (e.g., "1+", "2-")
  credits: number;
}

export enum GradeLevel {
  CLASS_9 = '9. Klasse',
  CLASS_10 = '10. Klasse (Einführungsphase)',
  CLASS_11 = '11. Klasse (Qualifikationsphase 1)',
  CLASS_12 = '12. Klasse (Qualifikationsphase 2 / Abitur)',
  UNI = 'Universität / Hochschule',
}

export interface CollegeRecommendation {
  name: string;
  location: string;
  category: 'Optimistisch' | 'Realistisch' | 'Sicher';
  acceptanceRate: string;
  reason: string;
}

export interface AcademicAdvice {
  summary: string;
  strengths: string[];
  improvements: string[];
}

export interface AnalysisResult {
  colleges: CollegeRecommendation[];
  advice: AcademicAdvice;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// German Grading Scale (Numeric values for calculation)
export const GERMAN_GRADES: Record<string, number> = {
  '1+': 0.7,
  '1': 1.0,
  '1-': 1.3,
  '2+': 1.7,
  '2': 2.0,
  '2-': 2.3,
  '3+': 2.7,
  '3': 3.0,
  '3-': 3.3,
  '4+': 3.7,
  '4': 4.0,
  '4-': 4.3,
  '5+': 4.7,
  '5': 5.0,
  '5-': 5.3,
  '6': 6.0
};

// Helper to find the closest grade label for a numeric average
export const getClosestGradeLabel = (average: number): string => {
  let closestLabel = '-';
  let minDiff = Number.MAX_VALUE;

  for (const [label, value] of Object.entries(GERMAN_GRADES)) {
    const diff = Math.abs(average - value);
    if (diff < minDiff) {
      minDiff = diff;
      closestLabel = label;
    }
  }
  return closestLabel;
};
