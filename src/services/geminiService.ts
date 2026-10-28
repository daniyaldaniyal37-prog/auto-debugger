import { ProjectFile, TestPlan, BugItem, ModifiedFileDiff } from '../types';

export class GeminiService {
  public static async analyzeProject(files: ProjectFile[], userDescription?: string): Promise<TestPlan> {
    const res = await fetch('/api/analyze-project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: files.map((f) => ({ name: f.name, size: f.size, content: f.content })),
        userDescription,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در تحلیل پروژه با هوش مصنوعی');
    }

    return await res.json();
  }

  public static async runAiTests(params: {
    files: ProjectFile[];
    projectType: string;
    isCalculator: boolean;
    userDescription?: string;
    roundNumber: number;
    category?: string;
    liveErrors?: any[];
    mathDiscrepancies?: any[];
    attemptedFixBugs?: BugItem[];
  }): Promise<{
    testExecutionSummary: {
      totalCasesEvaluated: number;
      passedTests: number;
      failedTests: number;
    };
    bugs: BugItem[];
  }> {
    const res = await fetch('/api/run-ai-tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در اجرای تست‌های هوش مصنوعی');
    }

    return await res.json();
  }

  public static async fixBugs(params: {
    files: ProjectFile[];
    bugsToFix: BugItem[];
    roundNumber: number;
  }): Promise<{
    modifiedFiles: ModifiedFileDiff[];
    fixReport: string;
  }> {
    const res = await fetch('/api/fix-bugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'خطا در اعمال اصلاحات روی کد');
    }

    return await res.json();
  }
}
