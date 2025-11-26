export interface Course {
  id: string;
  name: string;
  grade: string; // German grade value (e.g., "1+", "2-")
  credits: number;
}

export enum GradeLevel {
  Five = 'Klasse 5',
  Six = 'Klasse 6',
  Seven = 'Klasse 7',
  Eight = 'Klasse 8',
  Nine = 'Klasse 9',
  Ten = 'Klasse 10 (Mittlere Reife)',
  EF = 'Einführungsphase (EF/11)',
  Q1 = 'Qualifikationsphase 1 (Q1/12.1)',
  Q2 = 'Qualifikationsphase 2 (Q2/12.2)',
  Q3 = 'Qualifikationsphase 3 (Q3/13.1)',
  Q4 = 'Qualifikationsphase 4 (Q4/13.2)',
  ABITUR = 'Abitur (Gesamt)',
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
  archetype: string; // e.g. "Der Analytiker"
  careers: string[]; // e.g. ["Ingenieur", "Data Scientist"]
}

export interface Source {
  title: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: Source[];
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