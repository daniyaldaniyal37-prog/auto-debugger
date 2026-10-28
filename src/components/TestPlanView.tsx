import React from 'react';
import { 
  CheckCircle2, 
  CircleDot, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Zap, 
  FileCode, 
  Calculator,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { TestPlan, TestCategoryId } from '../types';

interface TestPlanViewProps {
  testPlan: TestPlan;
  currentRunningCategory?: string;
}

const CATEGORY_ICONS: Record<TestCategoryId | string, React.ReactNode> = {
  functional: <CircleDot className="w-4 h-4 text-cyan-400" />,
  boundary: <Zap className="w-4 h-4 text-amber-400" />,
  security: <ShieldCheck className="w-4 h-4 text-rose-400" />,
  performance: <Cpu className="w-4 h-4 text-indigo-400" />,
  ui_responsive: <Layers className="w-4 h-4 text-blue-400" />,
  resilience: <Zap className="w-4 h-4 text-emerald-400" />,
  code_quality: <FileCode className="w-4 h-4 text-purple-400" />,
  math_benchmark: <Calculator className="w-4 h-4 text-amber-400" />,
};

export const TestPlanView: React.FC<TestPlanViewProps> = ({
  testPlan,
  currentRunningCategory,
}) => {
  const [expandedCat, setExpandedCat] = React.useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedCat(expandedCat === id ? null : id);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>طرح جامع تست اپلیکیشن</span>
            <span className="text-[11px] font-normal text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
              {testPlan.projectTypeLabel}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {testPlan.architectureSummary}
          </p>
        </div>

        <div className="text-xs text-slate-300 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          تخمین کل تست‌ها: <strong className="text-cyan-400">{testPlan.totalEstimatedTests}+</strong>
        </div>
      </div>

      {/* لیست دسته‌های تست */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {testPlan.categories.map((cat) => {
          const isRunning = currentRunningCategory === cat.id;
          const isDone = (cat.executedCount ?? 0) >= cat.plannedCount;
          const isExpanded = expandedCat === cat.id;

          return (
            <div
              key={cat.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isRunning
                  ? 'bg-cyan-950/30 border-cyan-500/60 ring-2 ring-cyan-500/20'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(cat.id)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    {CATEGORY_ICONS[cat.id] || <CircleDot className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span>{cat.title}</span>
                      {isRunning && (
                        <span className="text-[10px] text-cyan-400 font-normal animate-pulse">
                          (در حال اجرا...)
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {cat.executedCount ?? cat.plannedCount} تست طراحی‌شده
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isRunning ? (
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>

              {/* موارد تست تفصیلی */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {cat.description}
                  </p>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">نمونه تست‌های این بخش:</span>
                    <ul className="space-y-1 pr-3 list-disc text-slate-300 text-[11px]">
                      {cat.keyTestCases.map((tc, idx) => (
                        <li key={idx}>{tc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
