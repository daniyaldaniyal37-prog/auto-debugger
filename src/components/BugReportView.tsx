import React, { useState } from 'react';
import { 
  Bug, 
  CheckSquare, 
  Square, 
  Wrench, 
  AlertTriangle, 
  Flame, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  FileCode, 
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { BugItem, Severity } from '../types';

interface BugReportViewProps {
  bugs: BugItem[];
  onFixSelectedBugs: (selectedBugIds: string[]) => void;
  onFixAllBugs: () => void;
  onReRunTests: () => void;
  isFixing: boolean;
  roundNumber: number;
}

export const BugReportView: React.FC<BugReportViewProps> = ({
  bugs,
  onFixSelectedBugs,
  onFixAllBugs,
  onReRunTests,
  isFixing,
  roundNumber,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(bugs.map((b) => b.id));
  const [expandedBugId, setExpandedBugId] = useState<string | null>(bugs[0]?.id || null);
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');

  const toggleSelectAll = () => {
    if (selectedIds.length === bugs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bugs.map((b) => b.id));
    }
  };

  const toggleSelectBug = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleExpandBug = (id: string) => {
    setExpandedBugId(expandedBugId === id ? null : id);
  };

  const filteredBugs = bugs.filter((b) => {
    if (severityFilter === 'all') return true;
    return b.severity === severityFilter;
  });

  const getSeverityBadge = (sev: Severity) => {
    switch (sev) {
      case 'بحرانی':
        return {
          text: 'بحرانی (Critical)',
          classes: 'bg-rose-950/80 text-rose-300 border-rose-800/80',
          icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
        };
      case 'مهم':
        return {
          text: 'مهم (Major)',
          classes: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'متوسط':
        return {
          text: 'متوسط (Medium)',
          classes: 'bg-yellow-950/80 text-yellow-300 border-yellow-800/80',
          icon: <AlertCircle className="w-3.5 h-3.5 text-yellow-400" />,
        };
      case 'جزئی':
        return {
          text: 'جزئی (Minor)',
          classes: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
          icon: <Info className="w-3.5 h-3.5 text-cyan-400" />,
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      
      {/* هدر بخش گزارش باگ‌ها و دکمه‌های تایید */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Bug className="w-5 h-5 text-rose-400" />
            <span>گزارش خطاهای شناسایی‌شده (دور {roundNumber})</span>
            <span className="text-xs bg-rose-950 text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-800 font-mono">
              {bugs.length} باگ
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            هیچ تغییری در کدهای شما بدون تایید صریح اعمال نمی‌شود. باگ‌های مورد نظر را انتخاب و تایید فرمایید.
          </p>
        </div>

        {/* دکمه‌های اصلی تایید و اقدام */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onFixAllBugs}
            disabled={isFixing || bugs.length === 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-700/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Wrench className="w-4 h-4" />
            <span>تایید و رفع همه باگ‌ها ({bugs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => onFixSelectedBugs(selectedIds)}
            disabled={isFixing || selectedIds.length === 0}
            className="px-4 py-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-800/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>رفع باگ‌های انتخاب‌شده ({selectedIds.length})</span>
          </button>

          <button
            type="button"
            onClick={onReRunTests}
            disabled={isFixing}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>اجرای مجدد تست‌ها</span>
          </button>
        </div>
      </div>

      {/* فیلترها و انتخاب همه */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white"
          >
            {selectedIds.length === bugs.length ? (
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            ) : (
              <Square className="w-4 h-4 text-slate-500" />
            )}
            <span>انتخاب همه ({bugs.length})</span>
          </button>
        </div>

        {/* فیلتر سطح شدت */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px]">فیلتر بر اساس شدت:</span>
          {(['all', 'بحرانی', 'مهم', 'متوسط', 'جزئی'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-colors ${
                severityFilter === sev
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev === 'all' ? 'همه' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* لیست باگ‌ها */}
      <div className="space-y-3">
        {filteredBugs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60">
            باگی با این فیلتر یافت نشد.
          </div>
        ) : (
          filteredBugs.map((bug) => {
            const isSelected = selectedIds.includes(bug.id);
            const isExpanded = expandedBugId === bug.id;
            const sevBadge = getSeverityBadge(bug.severity);
            const isStuck = bug.attemptCount >= 3;

            return (
              <div
                key={bug.id}
                className={`rounded-xl border transition-all ${
                  isStuck
                    ? 'bg-red-950/20 border-red-700 ring-2 ring-red-500/20'
                    : isSelected
                    ? 'bg-slate-950/90 border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-75'
                }`}
              >
                {/* سرتیتر باگ */}
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSelectBug(bug.id)}
                      className="text-slate-400 hover:text-cyan-400 shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-600" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0" onClick={() => toggleExpandBug(bug.id)}>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${sevBadge.classes}`}
                        >
                          {sevBadge.icon}
                          <span>{sevBadge.text}</span>
                        </span>

                        <span className="font-mono text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                          <FileCode className="w-3 h-3 text-cyan-400" />
                          <span>{bug.fileName}</span>
                          {bug.lineNumber > 0 && <span>: سطر {bug.lineNumber}</span>}
                        </span>

                        {bug.isRegression && (
                          <span className="text-[10px] font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            <span>باگ رگرسیون (بازگشتی)</span>
                          </span>
                        )}

                        {isStuck && (
                          <span className="text-[10px] font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800 animate-bounce">
                            ⚠️ ۳ بار تلاش ناموفق برای رفع
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-100 truncate cursor-pointer hover:text-cyan-300 transition-colors">
                        {bug.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleExpandBug(bug.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* جزئیات تفصیلی بازتولید، کد و راهکار */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3.5 text-xs">
                    
                    {/* شرح مشکل */}
                    <div className="space-y-1">
                      <span className="text-slate-400 font-semibold">شرح مشکل:</span>
                      <p className="text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                        {bug.description}
                      </p>
                    </div>

                    {/* قطعه کد مشکل‌دار */}
                    {bug.codeSnippet && (
                      <div className="space-y-1">
                        <span className="text-slate-400 font-semibold">قطعه کد مربوطه:</span>
                        <pre className="font-mono text-[11px] text-rose-300 bg-slate-900/90 p-3 rounded-lg border border-rose-900/40 overflow-x-auto">
                          {bug.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {/* مراحل بازتولید */}
                    {bug.reproductionSteps && bug.reproductionSteps.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-slate-400 font-semibold">مراحل بازتولید باگ:</span>
                        <ol className="list-decimal list-inside space-y-1 text-slate-300 pr-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                          {bug.reproductionSteps.map((step, sIdx) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {/* راهکار پیشنهادی برای اصلاح */}
                    <div className="space-y-1">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5" />
                        <span>راهکار اصلاحی پیشنهادی:</span>
                      </span>
                      <p className="text-slate-300 leading-relaxed bg-emerald-950/20 border border-emerald-900/50 p-3 rounded-lg">
                        {bug.suggestedFix}
                      </p>
                    </div>

                    {/* هشدار تلاش ناموفق ۳ بار */}
                    {isStuck && (
                      <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                          <span>نیاز به راهنمایی کاربر: این باگ پس از ۳ بار تلاش اصلاح نشد</span>
                        </div>
                        <p className="text-[11px] text-rose-300">
                          اتودیباگر متوجه شد که این باگ همچنان پابرجاست یا رفع آن باعث تداخل شده است. می‌توانید در بخش توضیحات پروژه راهنمایی مشخصی بنویسید یا فایل را مستقیماً بررسی نمایید.
                        </p>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
