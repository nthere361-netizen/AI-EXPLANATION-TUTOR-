/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExplanationLevel = 'beginner' | 'intermediate' | 'deep_dive';

export type AppMode = 'explain' | 'realtime' | 'build' | 'code-tutor' | 'paths' | 'materials' | 'settings';

export type VisualDiagramType = 
  | 'flow' 
  | 'cycle' 
  | 'comparison' 
  | 'compare'
  | 'concept_map' 
  | 'timeline' 
  | 'layers' 
  | 'stack'
  | 'graph' 
  | 'chart'
  | 'tree' 
  | 'equation'
  | 'table';

export type DiagramColor = 'indigo' | 'slate' | 'emerald' | 'amber' | 'rose';

export interface DiagramNode {
  id: string;
  label: string;
  kind?: string;
  color?: DiagramColor;
  description?: string;
  badge?: string;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  animated?: boolean;
}

export interface DiagramLayer {
  label: string;
  items: string[];
  color?: DiagramColor;
  description?: string;
}

export interface DiagramDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  change?: string;
  color?: string;
}

export interface VisualStage {
  label: string;
  description: string;
  badge?: string;
  icon?: string;
  detail?: string;
}

export interface VisualComparisonData {
  sideA: { title: string; points: string[]; badge?: string };
  sideB: { title: string; points: string[]; badge?: string };
  keyDifference?: string;
}

export interface VisualConceptMapData {
  centralNode: string;
  branches: Array<{
    label: string;
    relationship: string;
    description: string;
  }>;
}

export interface VisualGraphData {
  type?: 'formula' | 'bar' | 'curve' | 'ratio';
  formula?: string;
  title?: string;
  elements: Array<{
    label: string;
    value?: string | number;
    description?: string;
    color?: string;
  }>;
  explanation?: string;
}

export interface VisualTableData {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface VisualChartPoint {
  label: string;
  value: number;
  color?: string;
}

export interface VisualChartData {
  type?: 'bar' | 'line' | 'sparkline';
  xAxisLabel?: string;
  yAxisLabel?: string;
  unit?: string;
  points: VisualChartPoint[];
}

export interface VisualEquationData {
  formula: string;
  title?: string;
  name?: string;
  variables: Array<{ symbol: string; meaning: string; value?: string; unit?: string }>;
  notes?: string[];
  explanation?: string;
  steps?: Array<{ step: string; explanation: string }>;
}

export interface VisualTimelineItem {
  phase?: string;
  time: string;
  title: string;
  description: string;
  badge?: string;
  status?: 'completed' | 'current' | 'upcoming' | string;
}

export interface VisualExplanation {
  id?: string;
  title: string;
  type: VisualDiagramType;
  stages: VisualStage[];
  caption: string;
  altText?: string;
  appliesToConcept?: boolean;
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  layers?: DiagramLayer[];
  data?: DiagramDataPoint[];
  comparisonData?: VisualComparisonData;
  conceptMapData?: VisualConceptMapData;
  graphData?: VisualGraphData;
  tableData?: VisualTableData;
  chartData?: VisualChartData;
  equationData?: VisualEquationData;
  timelineData?: VisualTimelineItem[];
  level?: ExplanationLevel;
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

// -------------------------------------------------------------
// Mode 1: Concept Explanation Data
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// Mode 2: Real-Time Information Data
// -------------------------------------------------------------
export type RealTimeIntent = 'weather' | 'finance' | 'news' | 'events' | 'general';

export interface LiveStatTile {
  label: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  icon?: string;
}

export interface RealTimeData {
  id: string;
  query: string;
  intent: RealTimeIntent;
  headline: string;
  source: string;
  lastUpdated: string;
  timestamp: number;
  inSimpleWords: string;
  firstPrinciples: string;
  realWorldContext: string;
  liveTiles: LiveStatTile[];
  visual: {
    type: 'trend' | 'stat_tiles' | 'comparison' | 'flow';
    title: string;
    caption?: string;
    dataPoints?: Array<{ label: string; value: number; change?: string }>;
    summary?: string;
  };
  keyTakeaways: string[];
  relatedQueries: string[];
  isLiveDataAvailable: boolean;
}

// -------------------------------------------------------------
// Mode 3: Build Something (Software/Product Architect) Data
// -------------------------------------------------------------
export interface BuildProjectBrief {
  title: string;
  tagline: string;
  targetAudience: string;
  coreGoal: string;
  keyFeatures: string[];
}

export interface ArchitectureLayer {
  name: string;
  color: string;
  badge: string;
  description: string;
  technologies: string[];
}

export interface ArchitectureDiagramData {
  title: string;
  layers: ArchitectureLayer[];
  dataFlowSteps: string[];
}

export interface TechStackItem {
  category: 'Frontend' | 'Backend' | 'Database' | 'Auth' | 'DevOps & Hosting' | 'State & UI';
  technology: string;
  reason: string;
}

export interface FileTreeNode {
  path: string;
  description: string;
  isFolder?: boolean;
}

export interface BuildPhase {
  phase: number;
  title: string;
  description: string;
  tasks: string[];
  estimatedHours?: string;
}

export interface CodeScaffoldFile {
  filename: string;
  language: string;
  description: string;
  code: string;
}

export interface BuildPlanData {
  id: string;
  idea: string;
  brief: BuildProjectBrief;
  architecture: ArchitectureDiagramData;
  techStack: TechStackItem[];
  fileTree: FileTreeNode[];
  phases: BuildPhase[];
  scaffoldFiles: CodeScaffoldFile[];
  timestamp: number;
}

// -------------------------------------------------------------
// Code Tutor & Challenge Types
// -------------------------------------------------------------
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

export interface ChallengeEvaluationResponse {
  isCorrect: boolean;
  feedback: string;
  conceptMastery: 'Mastered' | 'Partially Understood' | 'Needs Review';
  detectedIssues: string[];
}

// -------------------------------------------------------------
// Learning Materials, Paths & Preferences
// -------------------------------------------------------------
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

export interface LessonQuizOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface LessonQuizQuestion {
  question: string;
  options: LessonQuizOption[];
  hint?: string;
}

export interface Lesson {
  id: string;
  title: string;
  concept: string;
  summary: string;
  minutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  quiz: LessonQuizQuestion[];
  prerequisites?: string[]; // IDs of preceding lessons required before unlocking
  prompt?: string;
}

export interface StructuredLearningPath {
  id: string;
  title: string;
  subject: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  description: string;
  tags: string[];
  estimatedHours: number | string;
  prerequisites: string[]; // IDs or names of prerequisite paths/subjects
  lessons: Lesson[];
  outcomes: string[];
  category?: string;
  totalTopics?: number;
  completedTopics?: number;
  nodes?: LearningPathNode[];
}

export interface LearningPathNode {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  estimatedTime: string;
  prompt: string;
}

export interface LearningPath extends Partial<StructuredLearningPath> {
  id: string;
  title: string;
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
  theme?: 'light' | 'dark';
}

export interface PersonalNote {
  topic: string;
  text: string;
  updatedAt: number;
}

// -------------------------------------------------------------
// Voice Mode Data Models
// -------------------------------------------------------------
export type VoiceModeState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted';

export interface VoiceSentence {
  text: string;
  durationMs?: number;
}

export interface VoiceExplanationResponse {
  spokenText: string;
  sentences: VoiceSentence[];
  onScreenText: string;
  visual: VisualExplanation;
  intent: 'answer' | 'clarification' | 'simplification' | 'go_deeper' | 'repeat' | 'skip';
  followUpCommand?: string | null;
  realTimeData?: any | null;
}

export interface VoiceConversationTurn {
  id: string;
  role: 'user' | 'tutor';
  text: string;
  sentences?: VoiceSentence[];
  visual?: VisualExplanation;
  realTimeData?: any;
  timestamp: number;
  intent?: string;
}

export interface VoiceSettings {
  voiceName: string;
  rate: number;
  pitch: number;
  pushToTalk: boolean;
  autoStopSilenceMs: number;
}

export interface VoiceExplainRequest {
  query: string;
  level?: ExplanationLevel;
  mode: 'voice';
  intent?: string;
  conversationHistory?: Array<{ role: 'user' | 'tutor'; text: string }>;
  voiceSettings?: { rate?: number; pitch?: number; voiceName?: string };
}
