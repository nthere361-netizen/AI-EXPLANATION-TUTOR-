export type ExplanationLevel = 'beginner' | 'intermediate' | 'deep_dive';

export interface VisualStage {
  label: string;
  description: string;
  badge?: string;
  icon?: string;
}

export interface VisualExplanation {
  title: string;
  type: 'flow' | 'comparison' | 'cycle' | 'layers' | 'tree';
  stages: VisualStage[];
  caption: string;
}

export interface StepItem {
  stepNumber: number;
  title: string;
  explanation: string;
  tip?: string;
}

export interface QuizOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  question: string;
  options: QuizOption[];
  hint?: string;
}

export interface GoDeeper {
  concept: string;
  whyItMatters: string;
  curiousQuestion: string;
}

export interface RealWorldExample {
  title: string;
  scenario: string;
  takeaway: string;
}

export interface ExplanationData {
  id: string;
  topic: string;
  level: ExplanationLevel;
  simpleExplanation: string;
  inSimpleWords: string;
  realWorldExample: RealWorldExample;
  visualExplanation: VisualExplanation;
  stepByStep: StepItem[];
  keyTakeaways: string[];
  checkUnderstanding: QuizQuestion;
  goDeeper: GoDeeper;
  suggestedNext: string[];
  timestamp: number;
  isCustom?: boolean;
}

export interface CodeTutorResponse {
  whatsWrong: string;
  why: string;
  correctedCode: string;
  whatChanged: string[];
  learnThisConcept: {
    concept: string;
    explanation: string;
    ruleOfThumb: string;
  };
  tryItYourself: {
    prompt: string;
    starterCode: string;
    solutionCode: string;
  };
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'notes' | 'code' | 'slides' | 'article';
  size: string;
  date: string;
  summary: string;
  keyConcepts: string[];
  content: string;
  recommendedQuestions: string[];
}

export interface LearningPathNode {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  estimatedTime: string;
  prompt: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  totalTopics: number;
  completedTopics: number;
  nodes: LearningPathNode[];
}

export interface UserPreferences {
  defaultLevel: ExplanationLevel;
  speechSpeed: number;
  voiceEnabled: boolean;
  explanationStyle: 'analogy' | 'visual' | 'academic';
  reducedMotion: boolean;
}

export interface ChallengeEvaluationResponse {
  isCorrect: boolean;
  feedback: string;
  conceptMastery: 'Mastered' | 'Partially Understood' | 'Needs Review';
  detectedIssues: string[];
}
