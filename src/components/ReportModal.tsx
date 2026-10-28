import React from 'react';
import JSZip from 'jszip';
import { 
  X, 
  Download, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Printer, 
  Copy, 
  Check, 
  Bug, 
  Cpu, 
  Layers
} from 'lucide-react';
import { ProjectFile, BugItem, RoundHistory, TestPlan } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: ProjectFile[];
  testPlan: TestPlan | null;
  roundHistories: RoundHistory[];
  allDetectedBugs: BugItem[];
  fixedBugs: BugItem[];
  currentRound: number;
  isClean: boolean;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  files,
  testPlan,
  roundHistories,
  allDetectedBugs,
  fixedBugs,
  currentRound,
  isClean,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [isExportingZip, setIsExportingZip] = React.useState(false);

  if (!isOpen) return null;

  const totalTestsAcrossRounds = roundHistories.reduce((acc, r) => acc + r.testsRun, 0);

  // تولید محتوای مارک‌داون گزارش کامل
  const generateMarkdownReport = () => {
    return `# گزارش تضمین کیفیت و عیب‌یابی خودکار (Auto Debugger Audit Report)
تاریخ گزارش: ${new Date().toLocaleDateString('fa-IR')}
وضعیت نهایی پروژه: ${isClean ? 'هیچ باگ شناخته‌شده‌ای باقی نمانده است (No Known Bugs Remaining)' : 'نیاز به بررسی تکمیلی'}

---

## ۱. مشخصات پروژه
- نوع معماری: ${testPlan?.projectTypeLabel || 'نامشخص'}
- فایل ورودی: ${testPlan?.entryFile || 'index.html'}
- فریم‌ورک‌های شناسایی‌شده: ${(testPlan?.frameworksDetected || []).join(', ') || 'Native JS/HTML'}
- تعداد کل فایل‌های پروژه: ${files.length}

---

## ۲. آمار و شاخص‌های تست و کیفیت
- کل دورهای تست انجام‌شده: ${currentRound}
- کل موارد تست ارزیابی‌شده در تمامی دورها: ${totalTestsAcrossRounds.toLocaleString('fa-IR')}
- کل باگ‌های کشف‌شده: ${allDetectedBugs.length}
- کل باگ‌های برطرف‌شده در سورس‌کد: ${fixedBugs.length}
- دورهای متوالی بدون باگ: ${isClean ? '۲ از ۲ (شرط تایید برآورده شد)' : '۰'}

---

## ۳. بیانیه صداقت مهندسی کیفیت
طبق استانداردهای تضمین کیفیت نرم‌افزار، هیچ برنامه‌ای را نمی‌توان «کاملاً بی‌نقص» یا ۱۰۰٪ عاری از نقص در تمام سناریوهای ممکن نامید. وضعیت تایید این سامانه به این معناست که کدهای این پروژه در برابر تمام تست‌های عملکردی، امنیت، مقادیر مرزی، پایداری، تست رگرسیون و محاسباتی آزمایش شده و **«هیچ باگ شناخته‌شده‌ای باقی نمانده است»**.

---

## ۴. لیست باگ‌های شناسایی و رفع‌شده
${fixedBugs.map((b, i) => `### ${i + 1}. ${b.title} [شدت: ${b.severity}]
- **فایل و خط:** ${b.fileName} (سطر ${b.lineNumber})
- **شرح مشکل:** ${b.description}
- **راهکار اعمال‌شده:** ${b.suggestedFix}
`).join('\n')}

---

*تولید شده توسط Auto Debugger Engine*
`;
  };

  // دانلود پروژه اصلاح‌شده به صورت فایل ZIP
  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      files.forEach((f) => {
        zip.file(f.path || f.name, f.content);
      });
      // افزودن فایل گزارش به داخل ZIP
      zip.file('AUTO_DEBUGGER_REPORT.md', generateMarkdownReport());

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `debugged-project-round${currentRound}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error creating ZIP export:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* هدر مدال گزارش */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              گزارش نهایی تضمین کیفیت و تحویل پروژه
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* محتوای اسکرول‌پذیر گزارش */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          
          {/* کارت وضعیت نهایی صادقانه */}
          <div className={`p-4 rounded-xl border flex items-center gap-3.5 ${
            isClean
              ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
              : 'bg-slate-950/70 border-slate-800 text-slate-300'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                وضعیت: {isClean ? 'هیچ باگ شناخته‌شده‌ای باقی نمانده' : 'در دست ارزیابی و رفع اشکال'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                طبق قوانین فنی Auto Debugger، هیچ برنامه‌ای کاملاً بی‌نقص اعلام نمی‌شود، بلکه بعد از دورهای متعدد و پاک بودن تست‌ها، عدم وجود باگ شناخته‌شده تایید می‌شود.
              </p>
            </div>
          </div>

          {/* آمار خلاصه */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">دورهای تست:</span>
              <span className="text-base font-bold text-white">{currentRound}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">تست‌های ارزیابی‌شده:</span>
              <span className="text-base font-bold text-cyan-400">{totalTestsAcrossRounds.toLocaleString('fa-IR')}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">باگ‌های کشف‌شده:</span>
              <span className="text-base font-bold text-amber-400">{allDetectedBugs.length}</span>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 font-sans block">باگ‌های اصلاح‌شده:</span>
              <span className="text-base font-bold text-emerald-400">{fixedBugs.length}</span>
            </div>
          </div>

          {/* لیست باگ‌های رفع‌شده */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Bug className="w-4 h-4 text-emerald-400" />
              <span>فهرست تفصیلی باگ‌های برطرف‌شده در کد:</span>
            </h4>

            {fixedBugs.length === 0 ? (
              <p className="text-slate-500 text-center py-4">باگی در این پروژه رفع نشده است.</p>
            ) : (
              <div className="space-y-2">
                {fixedBugs.map((bug, i) => (
                  <div key={bug.id} className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{i + 1}. {bug.title}</span>
                      </span>
                      <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/40">
                        {bug.fileName}:{bug.lineNumber}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{bug.description}</p>
                    <div className="text-[11px] text-emerald-300 font-mono bg-emerald-950/20 p-2 rounded border border-emerald-900/40">
                      راهکار: {bug.suggestedFix}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* فوتر اکشن‌ها و دانلود ZIP */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'کپی شد!' : 'کپی متن گزارش'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>چاپ / PDF</span>
            </button>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={isExportingZip}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingZip ? 'در حال آماده‌سازی ZIP...' : 'دانلود سورس‌کد اصلاح‌شده کامل (ZIP)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
