

export interface Course {
  id: string;
  name: string;
  grade: string; // German (1-6) or UK (9-1)
  credits: number;
}

export enum GradeLevel {
  // German System
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
  
  // UK System
  Y7 = 'Year 7',
  Y8 = 'Year 8',
  Y9 = 'Year 9',
  Y10 = 'Year 10 (GCSE)',
  Y11 = 'Year 11 (GCSE)',
  Y12 = 'Year 12 (Sixth Form / A-Level)',
  Y13 = 'Year 13 (Sixth Form / A-Level)',
}

export interface CollegeRecommendation {
  name: string;
  location: string;
  category: 'Optimistisch' | 'Realistisch' | 'Sicher' | 'Reach' | 'Target' | 'Safety';
  acceptanceRate: string;
  reason: string;
}

export interface UniversityCheckResult {
  uniName: string;
  likelihood: 'High' | 'Medium' | 'Low';
  requirements: string;
  gapAnalysis: string; // What is missing?
  verdictText: string;
}

export interface AcademicAdvice {
  summary: string;
  strengths: string[];
  improvements: string[];
}

export interface AnalysisResult {
  colleges: CollegeRecommendation[];
  advice: AcademicAdvice;
  archetype: string;
  careers: string[];
}

export interface Exercise {
  subject: string;
  topic: string;
  question: string;
  imageUrl?: string;
  hint: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Leicht' | 'Mittel' | 'Schwer' | 'Easy' | 'Medium' | 'Hard';
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

// German Grading Scale (Lower is better)
export const GERMAN_GRADES: Record<string, number> = {
  '1+': 0.7, '1': 1.0, '1-': 1.3,
  '2+': 1.7, '2': 2.0, '2-': 2.3,
  '3+': 2.7, '3': 3.0, '3-': 3.3,
  '4+': 3.7, '4': 4.0, '4-': 4.3,
  '5+': 4.7, '5': 5.0, '5-': 5.3,
  '6': 6.0
};

// UK Grading Scale (GCSE 9-1) - Higher is better
export const UK_GRADES: Record<string, number> = {
  '9+': 9.3, '9': 9.0, '9-': 8.7, // A**
  '8+': 8.3, '8': 8.0, '8-': 7.7, // A*
  '7+': 7.3, '7': 7.0, '7-': 6.7, // A
  '6+': 6.3, '6': 6.0, '6-': 5.7, // B
  '5+': 5.3, '5': 5.0, '5-': 4.7, // Strong C
  '4+': 4.3, '4': 4.0, '4-': 3.7, // Standard C
  '3': 3.0, '2': 2.0, '1': 1.0, 'U': 0
};

export type Language = 'de' | 'en';
export type Difficulty = 'easy' | 'medium' | 'hard';

// Helper to find the closest grade label
export const getClosestGradeLabel = (average: number, language: Language): string => {
  const grades = language === 'en' ? UK_GRADES : GERMAN_GRADES;
  let closestLabel = '-';
  let minDiff = Number.MAX_VALUE;

  for (const [label, value] of Object.entries(grades)) {
    const diff = Math.abs(average - value);
    if (diff < minDiff) {
      minDiff = diff;
      closestLabel = label;
    }
  }
  return closestLabel;
};

// Available Grade Levels per System
export const GERMAN_LEVELS = [
  GradeLevel.Five, GradeLevel.Six, GradeLevel.Seven, GradeLevel.Eight, 
  GradeLevel.Nine, GradeLevel.Ten, GradeLevel.EF, GradeLevel.Q1, 
  GradeLevel.Q2, GradeLevel.Q3, GradeLevel.Q4, GradeLevel.ABITUR
];

export const UK_LEVELS = [
  GradeLevel.Y7, GradeLevel.Y8, GradeLevel.Y9, GradeLevel.Y10, 
  GradeLevel.Y11, GradeLevel.Y12, GradeLevel.Y13
];


export const TRANSLATIONS = {
  de: {
    navCheck: "Check",
    navPractice: "Üben",
    installApp: "App installieren",
    mobileAccess: "App",
    yourGrades: "Deine Noten",
    enterSubjects: "Trage deine Fächer ein",
    lkHint: "(LK = ★)",
    yourAverage: "Dein Schnitt",
    gradeLevel: "Klassenstufe / Phase",
    addCourse: "Fach hinzufügen",
    analyzeBtn: "Zukunft checken",
    analyzing: "Analyse läuft...",
    coursePlaceholder: "Fach",
    resultsHeader: "Deine Zukunftsanalyse",
    readyToCheck: "Bereit für den Check?",
    readyDesc: "Gib deine Noten ein und klicke auf 'Zukunft checken'.",
    yourResult: "Dein Ergebnis",
    profileType: "Dein Profil-Typ",
    trend: "Dein Trend",
    current: "Aktuell",
    target: "Ziel",
    aiAnalysis: "KI Analyse",
    collegesHeader: "Passende Hochschulen & Wege",
    hurdle: "Hürde",
    chatGreeting: "Hallo! Ich bin Gem. Ich kann live im Internet nach Unis und NC-Werten für dich suchen. Was möchtest du wissen?",
    chatGreetingAdmin: "SYSTEM: ONLINE. Awaiting commands.",
    chatPlaceholder: "Frag nach Unis, NC-Werten...",
    chatPlaceholderAdmin: "> Execute...",
    studyHub: "Study Hub",
    chooseSubject: "Wähle dein Fach für heute",
    start: "Loslegen",
    trainingFor: "Training",
    whatTopic: "Was möchtest du heute genau üben?",
    topicPlaceholder: "z.B. Brüche, Past Tense, Lyrik...",
    specificTopic: "Spezifisches Thema",
    randomTopic: "Zufälliges Thema",
    startQuiz: "Quiz Starten",
    creatingQuiz: "Erstelle Quiz...",
    topic: "Thema",
    hintBtn: "Brauchst du einen Tipp?",
    hintHide: "Tipp verbergen",
    checkAnswer: "Antwort prüfen",
    nextQuestion: "Nächste Aufgabe",
    correct: "Super!",
    incorrect: "Nicht ganz!",
    back: "Zurück",
    quit: "Beenden",
    noImage: "Kein Bild verfügbar",
    // Difficulty
    difficulty: "Schwierigkeit",
    easy: "Leicht",
    medium: "Mittel",
    hard: "Schwer",
    // Uni Lookup
    uniLookupHeader: "Wunsch-Uni Check",
    uniLookupPlaceholder: "Welche Uni/Schule interessiert dich?",
    checkAdmission: "Zulassung prüfen",
    checking: "Prüfe...",
    admissionChance: "Deine Chance",
    requirements: "Anforderungen",
    gapAnalysis: "Was du tun musst",
    // Subject Names
    Math: "Mathematik",
    German: "Deutsch",
    English: "Englisch",
    Biology: "Biologie",
    History: "Geschichte",
  },
  en: {
    navCheck: "Check",
    navPractice: "Practice",
    installApp: "Install App",
    mobileAccess: "Mobile",
    yourGrades: "Your Grades",
    enterSubjects: "Enter your subjects",
    lkHint: "(Higher Level = ★)", 
    yourAverage: "Predicted Grade",
    gradeLevel: "Year Group",
    addCourse: "Add Subject",
    analyzeBtn: "Check Future",
    analyzing: "Analyzing...",
    coursePlaceholder: "Subject",
    resultsHeader: "Your Future Analysis",
    readyToCheck: "Ready to check?",
    readyDesc: "Enter your grades and click 'Check Future'.",
    yourResult: "Your Result",
    profileType: "Your Archetype",
    trend: "Your Trend",
    current: "Current",
    target: "Target",
    aiAnalysis: "AI Analysis",
    collegesHeader: "Matching Universities & Paths",
    hurdle: "Requirement",
    chatGreeting: "Hi! I'm Gem. I can search the web for UK universities and admission requirements for you. What do you want to know?",
    chatGreetingAdmin: "SYSTEM: ONLINE. Awaiting commands.",
    chatPlaceholder: "Ask about Unis, Entry Requirements...",
    chatPlaceholderAdmin: "> Execute...",
    studyHub: "Study Hub",
    chooseSubject: "Choose your subject for today",
    start: "Start",
    trainingFor: "Training",
    whatTopic: "What do you want to practice exactly?",
    topicPlaceholder: "e.g. Fractions, Past Tense, Poetry...",
    specificTopic: "Specific Topic",
    randomTopic: "Random Topic",
    startQuiz: "Start Quiz",
    creatingQuiz: "Creating Quiz...",
    topic: "Topic",
    hintBtn: "Need a hint?",
    hintHide: "Hide hint",
    checkAnswer: "Check Answer",
    nextQuestion: "Next Question",
    correct: "Great job!",
    incorrect: "Not quite!",
    back: "Back",
    quit: "Quit",
    noImage: "No image available",
    // Difficulty
    difficulty: "Difficulty",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    // Uni Lookup
    uniLookupHeader: "Specific Uni Check",
    uniLookupPlaceholder: "Which Uni/School are you interested in?",
    checkAdmission: "Check Admission",
    checking: "Checking...",
    admissionChance: "Admissibility",
    requirements: "Requirements",
    gapAnalysis: "What you need to do",
    // Subject Names
    Math: "Math",
    German: "German",
    English: "English",
    Biology: "Biology",
    History: "History",
  }
};