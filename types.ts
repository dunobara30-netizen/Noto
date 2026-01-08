
export interface Course {
  id: string;
  name: string;
  grade: string;
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
  Y7 = 'Year 7',
  Y8 = 'Year 8',
  Y9 = 'Year 9',
  Y10 = 'Year 10 (GCSE)',
  Y11 = 'Year 11 (GCSE)',
  Y12 = 'Year 12 (Sixth Form / A-Level)',
  Y13 = 'Year 13 (Sixth Form / A-Level)',
}

export interface AnalysisResult {
  colleges: CollegeRecommendation[];
  advice: {
    summary: string;
    strengths: string[];
    improvements: string[];
  };
  archetype: string;
  careers: string[];
}

export interface CollegeRecommendation {
  name: string;
  location: string;
  category: 'Optimistisch' | 'Realistisch' | 'Sicher' | 'Reach' | 'Target' | 'Safety';
  acceptanceRate: string;
  reason: string;
}

export interface Exercise {
  type: 'multiple-choice' | 'text-input' | 'multi-select';
  subject: string;
  topic: string;
  question: string;
  hint: string;
  options?: string[]; // For multiple-choice or multi-select
  correctAnswer: string | string[]; // Single string or array of strings for multi-select
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastVisit: string;
}

export type Language = 'de' | 'en';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Theme = 'default' | 'dark' | 'light';

// Added ChatMessage and Source interfaces
export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  sources?: Source[];
}

export interface Source {
  title: string;
  url: string;
}

// Added Grade constants and helper functions
export const GERMAN_GRADES: Record<string, number> = {
  '1+': 1.0, '1': 1.0, '1-': 1.3,
  '2+': 1.7, '2': 2.0, '2-': 2.3,
  '3+': 2.7, '3': 3.0, '3-': 3.3,
  '4+': 3.7, '4': 4.0, '4-': 4.3,
  '5+': 4.7, '5': 5.0, '5-': 5.3,
  '6': 6.0
};

export const UK_GRADES: Record<string, number> = {
  '9': 9.0, '8': 8.0, '7': 7.0, '6': 6.0, '5': 5.0, '4': 4.0, '3': 3.0, '2': 2.0, '1': 1.0, 'U': 0.0
};

export const GERMAN_LEVELS = [
  GradeLevel.Five, GradeLevel.Six, GradeLevel.Seven, GradeLevel.Eight,
  GradeLevel.Nine, GradeLevel.Ten, GradeLevel.EF, GradeLevel.Q1,
  GradeLevel.Q2, GradeLevel.Q3, GradeLevel.Q4, GradeLevel.ABITUR
];

export const UK_LEVELS = [
  GradeLevel.Y7, GradeLevel.Y8, GradeLevel.Y9, GradeLevel.Y10,
  GradeLevel.Y11, GradeLevel.Y12, GradeLevel.Y13
];

export const getClosestGradeLabel = (score: number, language: Language): string => {
  const grades = language === 'en' ? UK_GRADES : GERMAN_GRADES;
  let closest = Object.keys(grades)[0];
  let minDiff = Math.abs(score - grades[closest]);
  
  for (const label in grades) {
    const diff = Math.abs(score - grades[label]);
    if (diff < minDiff) {
      minDiff = diff;
      closest = label;
    }
  }
  return closest;
};

export const TRANSLATIONS = {
  de: {
    welcomeTitle: "GradePath AI",
    welcomeSubtitle: "Berechne deinen Schnitt und finde deinen Weg.",
    getStarted: "Jetzt Starten",
    backToStart: "Startmenü",
    dailyFocus: "Heutiger Fokus",
    navCheck: "Profil",
    navPractice: "Training",
    yourGrades: "Deine Noten",
    enterSubjects: "Trage deine Fächer ein",
    yourAverage: "Dein Schnitt",
    gradeLevel: "Klassenstufe / Phase",
    addCourse: "Fach hinzufügen",
    analyzeBtn: "Zukunft analysieren",
    analyzing: "KI berechnet...",
    coursePlaceholder: "Fach",
    aiAnalysis: "KI Analyse",
    collegesHeader: "Passende Hochschulen",
    chatGreeting: "Hallo! Ich bin Gem. Wie kann ich dir heute helfen?",
    chatGreetingAdmin: "Terminal bereit. Systemstatus: Optimal.",
    chatPlaceholder: "Frag mich was...",
    chatPlaceholderAdmin: "Befehl eingeben...",
    studyHub: "Study Hub",
    chooseSubject: "Wähle dein Fach für heute",
    start: "Start",
    trainingFor: "Training",
    topicPlaceholder: "z.B. Brüche, Geometrie...",
    startQuiz: "Quiz Starten",
    creatingQuiz: "Erstelle Quiz...",
    lightMode: "Heller Modus",
    darkMode: "Dunkler Modus",
    Math: "Mathematik",
    German: "Deutsch",
    English: "Englisch",
    Biology: "Biologie",
    History: "Geschichte",
    cancel: "Abbrechen",
    xpLabel: "XP",
    levelLabel: "Level",
    difficulty: "Schwierigkeit",
    easy: "Leicht",
    medium: "Mittel",
    hard: "Schwer",
    sessionComplete: "Richtig!",
    wrongAnswer: "Falsch!",
    xpEarned: "XP erhalten",
    xpLost: "XP verloren",
    returnHub: "Zum Hub",
    nextExercise: "Nächste Übung",
    byIhssan: "By Ihssan",
    nextLevelInfo: (xp: number, level: number) => `Noch ${xp} XP bis Level ${level}`,
    levelPass: "Level Pass",
    submitAnswer: "Antwort prüfen",
    typeAnswer: "Antwort hier schreiben...",
    selectAll: "Wähle alle richtigen aus",
    unlocked: "Freigeschaltet",
    locked: "Gesperrt",
    readyToCheck: "Bereit für den Check?",
    readyDesc: "Gib deine Noten ein und klicke auf 'Zukunft analysieren'.",
    oralTutor: "Mündlicher Tutor",
    listening: "Ich höre zu...",
    speaking: "Gem spricht...",
    endCall: "Gespräch beenden",
    deepSolver: "Deep Solver",
    aiInterviewer: "KI Interviewer",
  },
  en: {
    welcomeTitle: "GradePath AI",
    welcomeSubtitle: "Calculate your grades and find your path.",
    getStarted: "Get Started",
    backToStart: "Start Menu",
    dailyFocus: "Today's Focus",
    navCheck: "Profile",
    navPractice: "Training",
    yourGrades: "Your Grades",
    enterSubjects: "Enter your subjects",
    yourAverage: "Your Average",
    gradeLevel: "Grade Level / Year",
    addCourse: "Add Subject",
    analyzeBtn: "Analyze Future",
    analyzing: "AI Analyzing...",
    coursePlaceholder: "Subject",
    aiAnalysis: "AI Analysis",
    collegesHeader: "Matching Colleges",
    chatGreeting: "Hi! I'm Gem. How can I help you today?",
    chatGreetingAdmin: "Terminal Ready. System status: Optimal.",
    chatPlaceholder: "Ask me anything...",
    chatPlaceholderAdmin: "Enter command...",
    studyHub: "Study Hub",
    chooseSubject: "Choose your subject for today",
    start: "Start",
    trainingFor: "Training",
    topicPlaceholder: "e.g. Fractions, Past Tense...",
    startQuiz: "Start Quiz",
    creatingQuiz: "Creating Quiz...",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    Math: "Math",
    German: "German",
    English: "English",
    Biology: "Biology",
    History: "History",
    cancel: "Cancel",
    xpLabel: "XP",
    levelLabel: "Level",
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    sessionComplete: "Correct!",
    wrongAnswer: "Wrong!",
    xpEarned: "XP earned",
    xpLost: "XP lost",
    returnHub: "Return to Hub",
    nextExercise: "Next Exercise",
    byIhssan: "By Ihssan",
    nextLevelInfo: (xp: number, level: number) => `Earn ${xp} XP for Level ${level}`,
    levelPass: "Level Pass",
    submitAnswer: "Submit Answer",
    typeAnswer: "Type your answer...",
    selectAll: "Select all that apply",
    unlocked: "Unlocked",
    locked: "Locked",
    readyToCheck: "Ready to check?",
    readyDesc: "Enter your grades and click 'Analyze Future'.",
    oralTutor: "Oral Tutor",
    listening: "Listening...",
    speaking: "Gem speaking...",
    endCall: "End Call",
    deepSolver: "Deep Solver",
    aiInterviewer: "AI Interviewer",
  }
};

export const REWARDS = [
  { level: 1, name: "Default Theme", color: "Indigo", hex: "#6366F1" },
  { level: 3, name: "Scholar Rank", color: "Emerald", hex: "#10B981" },
  { level: 5, name: "Expert Rank", color: "Amber", hex: "#F59E0B" },
  { level: 7, name: "Master Rank", color: "Rose", hex: "#F43F5E" },
  { level: 10, name: "Visionary Rank", color: "Metallic", hex: "#B87333" },
];
