import React, { useState } from 'react';
import { 
  Terminal, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Play, 
  Trash2, 
  Bot, 
  AlertCircle, 
  CheckCircle, 
  Layers, 
  ShieldAlert, 
  Zap,
  Info
} from 'lucide-react';
import { LiveConsoleMessage, ProjectFile } from '../types';

interface LiveRunnerPanelProps {
  projectType: string;
  isCalculator: boolean;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  consoleLogs: LiveConsoleMessage[];
  onClearLogs: () => void;
  onTriggerBotClicks: () => void;
  onTriggerFormInputs: (type: 'xss' | 'sql' | 'persian_emoji' | 'extreme_length' | 'negative_number' | 'empty') => void;
  onTriggerChaosClicks: () => void;
  files: ProjectFile[];
}

export const LiveRunnerPanel: React.FC<LiveRunnerPanelProps> = ({
  projectType,
  isCalculator,
  iframeRef,
  consoleLogs,
  onClearLogs,
  onTriggerBotClicks,
  onTriggerFormInputs,
  onTriggerChaosClicks,
  files,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'console' | 'static_analysis'>(
    projectType === 'android' || projectType === 'python' ? 'static_analysis' : 'preview'
  );
  const [viewportWidth, setViewportWidth] = useState<'100%' | '768px' | '375px'>('100%');
  const [logFilter, setLogFilter] = useState<'all' | 'error' | 'warn' | 'bot'>('all');

  const filteredLogs = consoleLogs.filter((l) => {
    if (logFilter === 'all') return true;
    if (logFilter === 'error') return l.type === 'error';
    if (logFilter === 'warn') return l.type === 'warn';
    if (logFilter === 'bot') return l.type === 'bot';
    return true;
  });

  const isWebOrCalc = projectType === 'web' || projectType === 'calculator';

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[560px]">
      
      {/* هدر پنل و تب‌ها */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          {isWebOrCalc && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'preview'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>اجرای زنده در ساندباکس</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('console')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'console'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>کنسول و رویدادهای زنده</span>
            {consoleLogs.some((l) => l.type === 'error') && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            )}
          </button>

          {!isWebOrCalc && (
            <button
              onClick={() => setActiveTab('static_analysis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'static_analysis'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>تحلیل استاتیک و شبیه‌سازی منطق</span>
            </button>
          )}
        </div>

        {/* کنترل‌های ابعاد صفحه نمایش */}
        {activeTab === 'preview' && isWebOrCalc && (
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setViewportWidth('100%')}
              title="دسکتاپ (۱۰۰٪)"
              className={`p-1.5 rounded text-xs ${viewportWidth === '100%' ? 'bg-cyan-950 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Laptop className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportWidth('768px')}
              title="تبلت (۷۶۸ پیکسل)"
              className={`p-1.5 rounded text-xs ${viewportWidth === '768px' ? 'bg-cyan-950 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportWidth('375px')}
              title="موبایل (۳۷۵ پیکسل)"
              className={`p-1.5 rounded text-xs ${viewportWidth === '375px' ? 'bg-cyan-950 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* فیلترهای کنسول */}
        {activeTab === 'console' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px]">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-2 py-0.5 rounded ${logFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              >
                همه ({consoleLogs.length})
              </button>
              <button
                onClick={() => setLogFilter('error')}
                className={`px-2 py-0.5 rounded ${logFilter === 'error' ? 'bg-rose-900/60 text-rose-300' : 'text-slate-400'}`}
              >
                خطاها ({consoleLogs.filter((l) => l.type === 'error').length})
              </button>
              <button
                onClick={() => setLogFilter('bot')}
                className={`px-2 py-0.5 rounded ${logFilter === 'bot' ? 'bg-cyan-900/60 text-cyan-300' : 'text-slate-400'}`}
              >
                بات تست ({consoleLogs.filter((l) => l.type === 'bot').length})
              </button>
            </div>
            <button
              onClick={onClearLogs}
              title="پاکسازی لاگ‌ها"
              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* نوار ابزار تعاملی بات تست (Automation Bar) در بالای پیش‌نمایش */}
      {activeTab === 'preview' && isWebOrCalc && (
        <div className="bg-slate-950/60 border-b border-slate-800/80 px-4 py-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
            <Bot className="w-3.5 h-3.5 text-cyan-400" />
            <span>اسکریپت‌های تست تعاملی زنده:</span>
          </span>

          <button
            onClick={onTriggerBotClicks}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1"
          >
            <span>کلیک خودکار روی عناصر</span>
          </button>

          <button
            onClick={() => onTriggerFormInputs('empty')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            ورودی خالی
          </button>

          <button
            onClick={() => onTriggerFormInputs('persian_emoji')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            فارسی + ایموجی 🚀
          </button>

          <button
            onClick={() => onTriggerFormInputs('xss')}
            className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 transition-colors flex items-center gap-1"
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>تست XSS</span>
          </button>

          <button
            onClick={() => onTriggerFormInputs('sql')}
            className="px-2 py-1 rounded bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 border border-amber-800/50 transition-colors"
          >
            تست SQL Injection
          </button>

          <button
            onClick={onTriggerChaosClicks}
            className="px-2.5 py-1 rounded bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 transition-colors flex items-center gap-1 mr-auto"
          >
            <Zap className="w-3 h-3 text-indigo-400" />
            <span>تست استرس (۲۰ کلیک پیاپی)</span>
          </button>
        </div>
      )}

      {/* محتوای تب پیش‌نمایش iframe */}
      {activeTab === 'preview' && isWebOrCalc && (
        <div className="flex-1 bg-slate-950 flex items-center justify-center p-2 overflow-auto">
          <div
            style={{ width: viewportWidth }}
            className="h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-800 transition-all duration-300 shadow-2xl relative"
          >
            <iframe
              ref={iframeRef}
              title="Auto Debugger Live Sandbox"
              sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
              className="w-full h-full border-0 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
      )}

      {/* محتوای تب کنسول لاگ زنده */}
      {activeTab === 'console' && (
        <div className="flex-1 bg-slate-950 p-3 font-mono text-xs overflow-y-auto space-y-1.5">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-1 text-center font-sans">
              <Terminal className="w-8 h-8 opacity-40" />
              <p>هنوز پیامی در کنسول یا رویداد زنده ثبت نشده است.</p>
              <p className="text-[11px] text-slate-600">با اجرای تست‌ها یا تعامل با اپ، لاگ‌ها به صورت خودکار اینجا نمایش می‌یابند.</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-2 rounded border leading-relaxed flex items-start gap-2 ${
                  log.type === 'error'
                    ? 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                    : log.type === 'warn'
                    ? 'bg-amber-950/30 border-amber-900/50 text-amber-300'
                    : log.type === 'bot'
                    ? 'bg-cyan-950/30 border-cyan-900/50 text-cyan-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300'
                }`}
              >
                <span className="text-[10px] text-slate-500 shrink-0 select-none pt-0.5">
                  {log.timestamp}
                </span>
                <span className="break-all whitespace-pre-wrap">{log.text}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* محتوای تب تحلیل استاتیک و شبیه‌سازی منطق برای پروژه‌های غیر وب (مانند اندروید/پایتون) */}
      {activeTab === 'static_analysis' && (
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto space-y-4">
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/80 text-purple-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Info className="w-4 h-4 text-purple-400" />
              <span>شفافیت ارزیابی: تست از نوع تحلیلی و شبیه‌سازی منطق است</span>
            </div>
            <p className="text-xs text-purple-300 leading-relaxed">
              این پروژه ({projectType}) به دلیل عدم امکان اجرای بومی مستقیم در محیط مرورگر (مانند اکوسیستم اندروید/کاتلین یا پایتون سیستم‌عامل)، توسط اتودیباگر از طریق تحلیل استاتیک عمیق AST، شبیه‌سازی منطق اجرای برنامه و ارزیابی جریان داده با Gemini تست شده است.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              فایل‌های تحلیل‌شده در این پروژه:
            </h4>
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-cyan-400 font-semibold">{file.path || file.name}</span>
                    <span className="text-slate-500 text-[10px]">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg overflow-x-auto max-h-36">
                    {file.content.slice(0, 500)}
                    {file.content.length > 500 && '\n... [ادامه کد]'}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
