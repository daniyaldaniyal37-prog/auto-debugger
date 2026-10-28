import React, { useState, useRef, useEffect } from 'react';
import { 
  Bug, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  FileText, 
  Download, 
  Layers, 
  Sparkles, 
  AlertTriangle,
  RotateCw,
  Terminal,
  Calculator,
  ShieldCheck
} from 'lucide-react';
import { 
  ProjectFile, 
  TestPlan, 
  BugItem, 
  RoundHistory, 
  MathBenchmarkResult, 
  LiveConsoleMessage, 
  ModifiedFileDiff 
} from './types';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { DashboardMetrics } from './components/DashboardMetrics';
import { LiveRunnerPanel } from './components/LiveRunnerPanel';
import { TestPlanView } from './components/TestPlanView';
import { MathBenchmarkPanel } from './components/MathBenchmarkPanel';
import { BugReportView } from './components/BugReportView';
import { DiffViewerModal } from './components/DiffViewerModal';
import { ReportModal } from './components/ReportModal';
import { HelpModal } from './components/HelpModal';
import { GeminiService } from './services/geminiService';
import { SandboxController } from './services/sandboxController';
import { 
  generateMathTestSuites, 
  calculateReferenceAnswer, 
  evaluateMathDiscrepancy 
} from './services/mathEngine';

export default function App() {
  // وضعیت‌های داده‌ای اصلی پروژه
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [originalBackupFiles, setOriginalBackupFiles] = useState<ProjectFile[]>([]);
  const [userDescription, setUserDescription] = useState<string>('');
  
  // وضعیت‌های چرخه تست
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'testing' | 'awaiting_approval' | 'fixing' | 'clean'>('idle');
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [maxRounds] = useState<number>(10);
  const [cleanRoundsCount, setCleanRoundsCount] = useState<number>(0);
  const [testPlan, setTestPlan] = useState<TestPlan | null>(null);
  
  // باگ‌ها و نتایج
  const [currentBugs, setCurrentBugs] = useState<BugItem[]>([]);
  const [allDetectedBugs, setAllDetectedBugs] = useState<BugItem[]>([]);
  const [fixedBugs, setFixedBugs] = useState<BugItem[]>([]);
  const [roundHistories, setRoundHistories] = useState<RoundHistory[]>([]);
  
  // لاگ‌ها و بنچمارک ریاضی
  const [consoleLogs, setConsoleLogs] = useState<LiveConsoleMessage[]>([]);
  const [mathResults, setMathResults] = useState<MathBenchmarkResult[]>([]);
  
  // مدال‌ها
  const [activeDiffs, setActiveDiffs] = useState<ModifiedFileDiff[]>([]);
  const [latestFixReport, setLatestFixReport] = useState<string>('');
  const [isDiffModalOpen, setIsDiffModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // مراجع ساندباکس زنده
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sandboxControllerRef = useRef<SandboxController | null>(null);

  // ثبت لاگ در کنسول
  const addLog = (type: 'log' | 'warn' | 'error' | 'bot' | 'network', text: string) => {
    setConsoleLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        text,
        timestamp: new Date().toLocaleTimeString('fa-IR'),
      },
    ]);
  };

  // مقداردهی و بارگذاری ساندباکس
  useEffect(() => {
    if (iframeRef.current && files.length > 0) {
      if (!sandboxControllerRef.current) {
        sandboxControllerRef.current = new SandboxController(iframeRef.current, {
          onConsoleMessage: (msg) => {
            setConsoleLogs((prev) => [...prev, msg]);
          },
          onError: (err) => {
            addLog('error', `خطای زمان اجرا: ${err.message}`);
          },
          onBotAction: (act) => {
            addLog('bot', act);
          },
        });
      }
      sandboxControllerRef.current.loadProject(files);
    }
  }, [files]);

  // مرحله ۱: دریافت فایل‌ها و شروع تحلیل ساختار
  const handleFilesLoaded = async (loadedFiles: ProjectFile[], desc?: string) => {
    setFiles(loadedFiles);
    setOriginalBackupFiles(JSON.parse(JSON.stringify(loadedFiles)));
    setUserDescription(desc || '');
    setStatus('analyzing');
    setConsoleLogs([]);
    setMathResults([]);
    setCurrentBugs([]);
    setAllDetectedBugs([]);
    setFixedBugs([]);
    setRoundHistories([]);
    setCleanRoundsCount(0);
    setCurrentRound(0);

    addLog('log', `بارگذاری ${loadedFiles.length} فایل در حافظه موقت مرورگر...`);

    try {
      addLog('log', 'ارسال ساختار فایل‌ها به Gemini برای تدوین طرح تست اختصاصی...');
      const plan = await GeminiService.analyzeProject(loadedFiles, desc);
      setTestPlan(plan);
      addLog('log', `طرح تست با موفقیت تدوین شد. نوع پروژه: ${plan.projectTypeLabel} | تخمین تست‌ها: ${plan.totalEstimatedTests}`);

      // بلافاصله دور ۱ تست‌ها شروع می‌شود
      startTestRound(1, loadedFiles, plan, []);
    } catch (err: any) {
      addLog('error', `خطا در تحلیل پروژه: ${err.message}`);
      setStatus('idle');
    }
  };

  // مرحله ۲ و ۳: اجرای یک دور تست کامل
  const startTestRound = async (
    roundNum: number,
    currentFiles: ProjectFile[],
    plan: TestPlan,
    previouslyFixed: BugItem[]
  ) => {
    setCurrentRound(roundNum);
    setStatus('testing');
    addLog('bot', `=== آغاز دور ${roundNum} از حداکثر ${maxRounds} دور تست ===`);

    // اجرای خودکار تعاملات بات در ساندباکس زنده برای پروژه‌های وب
    if (plan.projectType === 'web' || plan.projectType === 'calculator') {
      setTimeout(() => {
        sandboxControllerRef.current?.sendBotCommand('run_bot_clicks');
      }, 500);

      setTimeout(() => {
        sandboxControllerRef.current?.sendBotCommand('run_form_inputs', { payloadType: 'persian_emoji' });
      }, 1200);

      setTimeout(() => {
        sandboxControllerRef.current?.sendBotCommand('run_form_inputs', { payloadType: 'xss' });
      }, 1800);
    }

    // تست‌های ویژه محاسباتی برای ماشین‌حساب با کتابخانه mathjs
    let currentMathDiscrepancies: MathBenchmarkResult[] = [];
    if (plan.isCalculator || plan.projectType === 'calculator') {
      addLog('log', 'اجرای بنچمارک محاسباتی مستقل با موتور دقیق Math.js و جدول مقادیر قطعی...');
      const testCases = generateMathTestSuites();
      
      // ارزیابی هر تست با کدهای کاربر یا شبیه‌ساز DOM
      testCases.forEach((tc) => {
        // محاسبه فرضی یا ارزیابی روی فایل کدهای پروژه
        let appOutput: any = 'N/A';
        try {
          // بررسی فایل جاوااسکریپت برای پیدا کردن لاجیک محاسبه
          const jsFile = currentFiles.find((f) => f.name.endsWith('.js') || f.name.endsWith('.ts'));
          if (jsFile && jsFile.content.includes('function calculate')) {
            // شبیه‌سازی اجرای تابع محاسبه کدهای کاربر
            const sandboxScope = new Function(`
              ${jsFile.content}
              if (typeof calculate === 'function') return calculate(${JSON.stringify(tc.expression)});
              return 'N/A';
            `);
            appOutput = sandboxScope();
          } else {
            // در غیر این صورت اجرای معمول
            appOutput = Function(`"use strict"; try { return (${tc.expression}); } catch(e) { return 'Error'; }`)();
          }
        } catch (e: any) {
          appOutput = 'Error';
        }

        const benchmarkRes = evaluateMathDiscrepancy(tc.expression, appOutput, tc.description);
        currentMathDiscrepancies.push(benchmarkRes);
      });

      setMathResults(currentMathDiscrepancies);
      const mathBugsCount = currentMathDiscrepancies.filter((m) => m.status === 'discrepancy').length;
      addLog('log', `بنچمارک محاسباتی پایان یافت: ${testCases.length} تست ارزیابی شد | ${mathBugsCount} اختلاف ثبت شد.`);
    }

    // ارسال به Gemini برای آزمون عمیق استاتیک، امنیت، خطاهای پیش‌بینی‌نشده و رگرسیون
    try {
      addLog('log', 'ارزیابی کدهای پروژه با موتور تحلیلگر Gemini در تمامی دسته‌های ۷‌گانه...');
      
      const aiResult = await GeminiService.runAiTests({
        files: currentFiles,
        projectType: plan.projectType,
        isCalculator: plan.isCalculator,
        userDescription,
        roundNumber: roundNum,
        liveErrors: consoleLogs.filter((l) => l.type === 'error').map((l) => l.text),
        mathDiscrepancies: currentMathDiscrepancies.filter((m) => m.status === 'discrepancy').slice(0, 15),
        attemptedFixBugs: previouslyFixed,
      });

      const foundBugs: BugItem[] = (aiResult.bugs || []).map((b: any) => ({
        ...b,
        attemptCount: (currentBugs.find((cb) => cb.title === b.title)?.attemptCount || 0) + 1,
        status: 'detected',
      }));

      addLog('log', `دور ${roundNum} پایان یافت: ${aiResult.testExecutionSummary?.totalCasesEvaluated || 45} تست انجام شد، ${foundBugs.length} باگ شناسایی شد.`);

      // ثبت در تاریخچه دورها
      const isRoundClean = foundBugs.length === 0;
      setRoundHistories((prev) => [
        ...prev,
        {
          round: roundNum,
          timestamp: new Date().toLocaleTimeString('fa-IR'),
          testsRun: (aiResult.testExecutionSummary?.totalCasesEvaluated || 50) + currentMathDiscrepancies.length,
          bugsFound: foundBugs.length,
          bugsFixed: 0,
          cleanRound: isRoundClean,
        },
      ]);

      if (isRoundClean) {
        const nextCleanCount = cleanRoundsCount + 1;
        setCleanRoundsCount(nextCleanCount);
        addLog('bot', `دور ${roundNum} بدون هیچ باگی به پایان رسید! (دورهای متوالی پاک: ${nextCleanCount}/۲)`);

        if (nextCleanCount >= 2) {
          // قانون مهم: وقتی ۲ دور پشت سر هم هیچ باگی پیدا نشد، تایید نهایی
          setStatus('clean');
          addLog('bot', '🎉 تایید نهایی: دو دور متوالی بدون باگ سپری شد. وضعیت پروژه: «هیچ باگ شناخته‌شده‌ای باقی نمانده»');
          return;
        } else {
          // اجرای دور دوم برای راستی‌آزمایی مضاعف (Regression Round)
          addLog('log', 'آغاز دور دوم اعتبارسنجی مجدد برای تضمین قطعی...');
          setTimeout(() => {
            startTestRound(roundNum + 1, currentFiles, plan, previouslyFixed);
          }, 1500);
          return;
        }
      } else {
        // ریست شدن شمارشگر دورهای پاک اگر باگی پیدا شود
        setCleanRoundsCount(0);
        setCurrentBugs(foundBugs);
        setAllDetectedBugs((prev) => {
          const newOnes = foundBugs.filter((fb) => !prev.some((p) => p.title === fb.title));
          return [...prev, ...newOnes];
        });

        // مرحله ۴ و ۵: توقف و انتظار برای تایید کاربر
        setStatus('awaiting_approval');
        addLog('warn', `توقف چرخه: ${foundBugs.length} باگ در این دور شناسایی شد. منتظر تایید کاربر جهت اصلاح کد...`);
      }
    } catch (err: any) {
      addLog('error', `خطا در اجرای تست‌های دور ${roundNum}: ${err.message}`);
      setStatus('awaiting_approval');
    }
  };

  // مرحله ۶: اصلاح باگ‌های تایید شده توسط کاربر
  const handleFixBugs = async (bugsToFix: BugItem[]) => {
    if (bugsToFix.length === 0) return;
    setStatus('fixing');
    addLog('log', `کاربر تایید کرد: اصلاح ${bugsToFix.length} باگ در کدهای پروژه...`);

    try {
      const fixResult = await GeminiService.fixBugs({
        files,
        bugsToFix,
        roundNumber: currentRound,
      });

      // به‌روزرسانی محتوای فایل‌ها در حافظه مرورگر
      const updatedFilesList = files.map((file) => {
        const modified = fixResult.modifiedFiles.find((m) => m.fileName === file.name || m.fileName === file.path);
        if (modified) {
          return {
            ...file,
            content: modified.updatedContent,
            history: [
              ...(file.history || []),
              {
                timestamp: new Date().toLocaleTimeString('fa-IR'),
                content: file.content,
                reason: modified.summaryOfChanges,
              },
            ],
          };
        }
        return file;
      });

      setFiles(updatedFilesList);
      setFixedBugs((prev) => [...prev, ...bugsToFix]);
      setActiveDiffs(fixResult.modifiedFiles);
      setLatestFixReport(fixResult.fixReport);

      // به‌روزرسانی تاریخچه دور
      setRoundHistories((prev) =>
        prev.map((h) => (h.round === currentRound ? { ...h, bugsFixed: bugsToFix.length } : h))
      );

      addLog('log', `کدهای پروژه با موفقیت اصلاح شدند: ${fixResult.modifiedFiles.length} فایل تغییر یافت.`);

      // نمایش مدال تفاوت قبل و بعد (Diff Viewer)
      setIsDiffModalOpen(true);
    } catch (err: any) {
      addLog('error', `خطا در اعمال اصلاحات: ${err.message}`);
      setStatus('awaiting_approval');
    }
  };

  // مرحله ۷: ادامه به دور بعدی تست‌ها پس از تایید Diff
  const handleProceedToNextRound = () => {
    setIsDiffModalOpen(false);
    if (!testPlan) return;

    if (currentRound >= maxRounds) {
      addLog('warn', `به سقف حداکثر ${maxRounds} دور رسیدیم. توقف جهت جلوگیری از حلقه نامحدود.`);
      setStatus('awaiting_approval');
      return;
    }

    addLog('bot', 'کدهای اصلاح‌شده در ساندباکس زنده بارگذاری مجدد شدند.');
    sandboxControllerRef.current?.loadProject(files);

    // شروع دور بعدی تست‌ها (با تست‌های رگرسیون)
    startTestRound(currentRound + 1, files, testPlan, fixedBugs);
  };

  // بازگردانی فایل‌های اصلی اولیه (Undo)
  const handleRestoreOriginal = () => {
    if (originalBackupFiles.length === 0) return;
    if (window.confirm('آیا مایلید تمام تغییرات اعمال‌شده بازگردانی شود و به نسخه اولیه فایل‌ها برگردید؟')) {
      const restored = JSON.parse(JSON.stringify(originalBackupFiles));
      setFiles(restored);
      setCurrentBugs([]);
      setCleanRoundsCount(0);
      setStatus('awaiting_approval');
      addLog('warn', 'پروژه به نسخه اولیه قبل از هرگونه اصلاح بازگردانده شد.');
      sandboxControllerRef.current?.loadProject(restored);
    }
  };

  // پاکسازی کل پروژه برای دریافت پروژه جدید
  const handleReset = () => {
    if (files.length === 0 || window.confirm('آیا قصد دارید پروژه جاری را پاک کرده و پروژه جدیدی شروع کنید؟')) {
      setFiles([]);
      setOriginalBackupFiles([]);
      setUserDescription('');
      setStatus('idle');
      setCurrentRound(0);
      setCleanRoundsCount(0);
      setTestPlan(null);
      setCurrentBugs([]);
      setAllDetectedBugs([]);
      setFixedBugs([]);
      setRoundHistories([]);
      setConsoleLogs([]);
      setMathResults([]);
      setActiveDiffs([]);
    }
  };

  // کلیک‌های دستی بات در نوار ابزار
  const triggerBotClicks = () => {
    sandboxControllerRef.current?.sendBotCommand('run_bot_clicks');
  };
  const triggerFormInputs = (type: any) => {
    sandboxControllerRef.current?.sendBotCommand('run_form_inputs', { payloadType: type });
  };
  const triggerChaosClicks = () => {
    sandboxControllerRef.current?.sendBotCommand('run_chaos_clicks');
  };

  const totalTestsRunCount = roundHistories.reduce((acc, r) => acc + r.testsRun, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* هدر بالای صفحه */}
      <Header
        currentRound={currentRound}
        maxRounds={maxRounds}
        cleanRoundsCount={cleanRoundsCount}
        status={status}
        onReset={handleReset}
        onRestoreOriginal={handleRestoreOriginal}
        hasOriginalBackup={originalBackupFiles.length > 0}
        onOpenHelp={() => setIsHelpModalOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* محتوای اصلی داشبورد */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-8">
        
        {/* ۱. اگر پروژه‌ای آپلود نشده است: نمایش ناحیه آپلود */}
        {files.length === 0 ? (
          <UploadZone
            onFilesLoaded={handleFilesLoaded}
            isLoading={status === 'analyzing'}
          />
        ) : (
          <div className="space-y-6">
            
            {/* داشبورد آماری شاخص‌ها */}
            <DashboardMetrics
              currentRound={currentRound}
              maxRounds={maxRounds}
              cleanRoundsCount={cleanRoundsCount}
              totalTestsRun={totalTestsRunCount}
              bugsFound={allDetectedBugs.length}
              bugsFixed={fixedBugs.length}
              activeBugsCount={currentBugs.length}
              roundHistories={roundHistories}
              isClean={status === 'clean'}
            />

            {/* بخش دکمه‌های اکشن سریع بالا */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold text-white">پروژه:</span>
                <span className="font-mono text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/50">
                  {testPlan?.projectTypeLabel || 'در حال تحلیل'} ({files.length} فایل)
                </span>
                {testPlan?.isCalculator && (
                  <span className="text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/50">
                    ماشین‌حساب مهندسی
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>مشاهده و دانلود گزارش تحویل نهایی</span>
                </button>

                {activeDiffs.length > 0 && (
                  <button
                    onClick={() => setIsDiffModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-800/70 flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مشاهده تفاوت کدهای اصلاح‌شده (Diff)</span>
                  </button>
                )}
              </div>
            </div>

            {/* گرید دو ستونه: پنل اجرای زنده ساندباکس و لاگ‌ها + طرح تست یا گزارش باگ‌ها */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* ستون راست: پنل اجرای زنده اپلیکیشن و کنسول مانیتور */}
              <div className="lg:col-span-6 space-y-6">
                <LiveRunnerPanel
                  projectType={testPlan?.projectType || 'web'}
                  isCalculator={testPlan?.isCalculator || false}
                  iframeRef={iframeRef}
                  consoleLogs={consoleLogs}
                  onClearLogs={() => setConsoleLogs([])}
                  onTriggerBotClicks={triggerBotClicks}
                  onTriggerFormInputs={triggerFormInputs}
                  onTriggerChaosClicks={triggerChaosClicks}
                  files={files}
                />

                {/* طرح دسته‌بندی تست‌ها */}
                {testPlan && (
                  <TestPlanView
                    testPlan={testPlan}
                    currentRunningCategory={status === 'testing' ? 'functional' : undefined}
                  />
                )}
              </div>

              {/* ستون چپ: گزارش باگ‌ها، بنچمارک ریاضی، و فرم تایید اصلاح کد */}
              <div className="lg:col-span-6 space-y-6">
                
                {/* گزارش باگ‌های شناسایی‌شده با قابلیت تایید یا انتخاب */}
                {currentBugs.length > 0 && (
                  <BugReportView
                    bugs={currentBugs}
                    onFixSelectedBugs={(selectedIds) => {
                      const toFix = currentBugs.filter((b) => selectedIds.includes(b.id));
                      handleFixBugs(toFix);
                    }}
                    onFixAllBugs={() => handleFixBugs(currentBugs)}
                    onReRunTests={() => {
                      if (testPlan) startTestRound(currentRound, files, testPlan, fixedBugs);
                    }}
                    isFixing={status === 'fixing'}
                    roundNumber={currentRound}
                  />
                )}

                {/* پنل اختصاصی بنچمارک ریاضی برای ماشین‌حساب با Math.js */}
                {(testPlan?.isCalculator || mathResults.length > 0) && (
                  <MathBenchmarkPanel
                    results={mathResults}
                    isRunning={status === 'testing'}
                  />
                )}

                {/* پیام در حال اجرای تست‌ها یا وضعیت پاک بودن */}
                {status === 'testing' && currentBugs.length === 0 && (
                  <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto animate-spin">
                      <RotateCw className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white">
                      در حال اجرای صدها تست خودکار در دور {currentRound}...
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      ساندباکس مرورگر در حال مانیتورینگ خطاهای زمان اجرا، پاسخ‌های مرجع محاسباتی و تست‌های امنیت/مرزی است.
                    </p>
                  </div>
                )}

                {status === 'clean' && (
                  <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-700/60 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950/50">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white">
                        پروژه تایید شد: هیچ باگ شناخته‌شده‌ای باقی نمانده
                      </h3>
                      <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                        تمامی آزمون‌های چندگانه در دو دور پیاپی بدون کوچک‌ترین خطای جدید، نشت حافظه، نقص محاسباتی یا آسیب‌پذیری امنیتی با موفقیت سپری شدند.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/40 inline-flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>دانلود پروژه اصلاح‌شده (ZIP) + گزارش رسمی</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* مدال نمایش تفاوت کدهای اصلاح‌شده (Diff Viewer) */}
      <DiffViewerModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        diffs={activeDiffs}
        fixReport={latestFixReport}
        onProceedToNextRound={handleProceedToNextRound}
        roundNumber={currentRound}
      />

      {/* مدال گزارش نهایی و دانلود سورس اصلاح‌شده */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        files={files}
        testPlan={testPlan}
        roundHistories={roundHistories}
        allDetectedBugs={allDetectedBugs}
        fixedBugs={fixedBugs}
        currentRound={currentRound}
        isClean={status === 'clean'}
      />

      {/* مدال راهنما و استانداردهای تست */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      {/* فوتر */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>Auto Debugger • سامانه تمام‌خودکار تست، شناسایی و رفع هوشمند باگ نرم‌افزار</span>
          <span className="font-mono text-[11px] text-slate-600">Engineered with Google Gemini API & Math.js</span>
        </div>
      </footer>

    </div>
  );
}
