export type Severity = 'بحرانی' | 'مهم' | 'متوسط' | 'جزئی';

export type TestCategoryId = 
  | 'functional'
  | 'boundary'
  | 'security'
  | 'performance'
  | 'ui_responsive'
  | 'resilience'
  | 'code_quality'
  | 'math_benchmark';

export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  size: number;
  originalContent: string;
  history?: { timestamp: string; content: string; reason: string }[];
}

export interface BugItem {
  id: string;
  title: string;
  severity: Severity;
  category: TestCategoryId;
  fileName: string;
  lineNumber: number;
  codeSnippet: string;
  description: string;
  reproductionSteps: string[];
  suggestedFix: string;
  isRegression?: boolean;
  attemptCount: number;
  status: 'detected' | 'fixing' | 'fixed' | 'unresolved';
}

export interface TestCategoryPlan {
  id: TestCategoryId;
  title: string;
  plannedCount: number;
  description: string;
  keyTestCases: string[];
  executedCount?: number;
  passedCount?: number;
  failedCount?: number;
}

export interface TestPlan {
  projectType: 'web' | 'calculator' | 'nodejs' | 'python' | 'android' | 'other';
  projectTypeLabel: string;
  isCalculator: boolean;
  entryFile: string;
  frameworksDetected: string[];
  architectureSummary: string;
  totalEstimatedTests: number;
  categories: TestCategoryPlan[];
}

export interface TestLog {
  id: string;
  timestamp: string;
  category: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'test';
}

export interface RoundHistory {
  round: number;
  timestamp: string;
  testsRun: number;
  bugsFound: number;
  bugsFixed: number;
  cleanRound: boolean;
}

export interface MathBenchmarkResult {
  id: string;
  expression: string;
  appOutput: number | string;
  referenceAnswer: number | string;
  delta: number;
  status: 'match' | 'discrepancy' | 'error';
  isToleranceAcceptable: boolean;
  description: string;
}

export interface LiveConsoleMessage {
  id: string;
  type: 'log' | 'warn' | 'error' | 'bot' | 'network';
  text: string;
  timestamp: string;
}

export interface ModifiedFileDiff {
  fileName: string;
  previousContent: string;
  updatedContent: string;
  summaryOfChanges: string;
  fixedBugIds: string[];
}
