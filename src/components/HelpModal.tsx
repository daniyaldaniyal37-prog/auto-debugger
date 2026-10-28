import React from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Calculator, 
  Cpu, 
  Layers, 
  RotateCw, 
  Zap, 
  Lock
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* هدر */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">
              راهنمای چرخه کار، قوانین و استانداردهای Auto Debugger
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* محتوا */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300 leading-relaxed">
          
          {/* چرخه ۱۰ مرحله‌ای */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
              <RotateCw className="w-4 h-4" />
              <span>چرخه کاری سامانه (گام به گام):</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 pr-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <li><strong>آپلود پروژه:</strong> دریافت فایل‌های ZIP، پوشه، یا فایل‌های مستقل وب، نود، پایتون و اندروید.</li>
              <li><strong>تحلیل ساختار و طرح تست:</strong> تشخیص نوع اپ و ساخت صدها مورد آزمون در ۷ دسته‌بندی.</li>
              <li><strong>اجرای تست‌های زنده:</strong> اجرای مستقیم در ساندباکس مرورگر و تزریق اسکریپت‌های تست خودکار.</li>
              <li><strong>تولید گزارش باگ‌ها:</strong> ثبت باگ‌ها همراه با سطح شدت، فایل، شماره خط، کد و راهکار.</li>
              <li><strong>توقف و درخواست تایید از کاربر:</strong> عدم تغییر خودسرانه کد بدون تایید صریح شما.</li>
              <li><strong>رفع خودکار باگ‌ها و نمایش Diff:</strong> ارائه کد تمیز جدید و نمایش تفاوت قبل و بعد.</li>
              <li><strong>تست مجدد و رگرسیون:</strong> اجرای آزمون‌های جدید و مطمئن شدن از عدم بازگشت باگ قبلی.</li>
              <li><strong>تکرار چرخه:</strong> تکرار مراحل تا رفع کامل باگ‌ها (حداکثر ۱۰ دور).</li>
              <li><strong>اعلام وضعیت:</strong> پس از دو دور متوالی پاک، ثبت وضعیت «هیچ باگ شناخته‌شده‌ای باقی نمانده».</li>
              <li><strong>تحویل نهایی:</strong> دانلود پروژه اصلاح‌شده به صورت ZIP به همراه گزارش کیفیت.</li>
            </ol>
          </div>

          {/* قوانین خاص ماشین‌حساب */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span>قوانین اختصاصی برنامه‌های محاسباتی و ماشین‌حساب:</span>
            </h4>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 text-slate-400">
              <p>• <strong>عدم تکیه بر هوش مصنوعی برای خروجی ریاضی:</strong> تمام جواب‌های مرجع مستقیماً با کدهای Math.js و Math جاوااسکریپت و جداول مقادیر قطعی ارزیابی می‌شوند.</p>
              <p>• <strong>تولید صدها عبارت تست:</strong> اولویت عملگرها، پرانتزهای تودرتو، توان، ریشه، توابع مثلثاتی به رادیان و درجه، لگاریتم و فاکتوریل.</p>
              <p>• <strong>سنجش خطای ممیز شناور (IEEE 754):</strong> استفاده از تلورانس خطای گردکردن (<code className="text-cyan-300 font-mono">EPSILON = 1e-9</code>) برای جلوگیری از باگ کاذب.</p>
            </div>
          </div>

          {/* قوانین امنیتی و نسخه پشتیبان */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>قوانین ایمنی، نسخه پشتیبان و صداقت:</span>
            </h4>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 text-slate-400">
              <p>• <strong>پشتیبان‌گیری اولیه (Undo):</strong> فایل‌های اولیه کاربر همواره محفوظ بوده و با دکمه بازگردانی قابل بازیابی است.</p>
              <p>• <strong>هشدار پس از ۳ بار تلاش:</strong> اگر باگی بعد از ۳ بار اصلاح نشود، برای جلوگیری از لوپ درخواست راهنمایی می‌کند.</p>
              <p>• <strong>صداقت علمی:</strong> هیچ نرم‌افزاری «کاملاً بی‌نقص» نامیده نمی‌شود، بلکه عبارت استاندارد «هیچ باگ شناخته‌شده‌ای باقی نمانده» به کار می‌رود.</p>
            </div>
          </div>

        </div>

        {/* فوتر */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
          >
            متوجه شدم
          </button>
        </div>

      </div>
    </div>
  );
};
