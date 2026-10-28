import { ProjectFile, LiveConsoleMessage } from '../types';

export interface SandboxEventListener {
  onConsoleMessage?: (msg: LiveConsoleMessage) => void;
  onError?: (error: { message: string; filename?: string; lineno?: number; colno?: number; stack?: string }) => void;
  onBotAction?: (action: string) => void;
  onEvaluationResult?: (res: { expression: string; result: any }) => void;
}

export class SandboxController {
  private iframe: HTMLIFrameElement | null = null;
  private listeners: SandboxEventListener = {};
  private boundMessageHandler: ((e: MessageEvent) => void) | null = null;

  constructor(iframe: HTMLIFrameElement, listeners: SandboxEventListener) {
    this.iframe = iframe;
    this.listeners = listeners;
    this.initMessageListener();
  }

  private initMessageListener() {
    this.boundMessageHandler = (event: MessageEvent) => {
      // Validate message origin / format
      if (!event.data || typeof event.data !== 'object') return;
      const { source, type, payload } = event.data;
      if (source !== 'auto-debugger-sandbox') return;

      if (type === 'console') {
        const text = Array.isArray(payload.args)
          ? payload.args.map((a: any) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')
          : String(payload.args);

        this.listeners.onConsoleMessage?.({
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: payload.level === 'error' ? 'error' : payload.level === 'warn' ? 'warn' : 'log',
          text: `[${payload.level.toUpperCase()}] ${text}`,
          timestamp: new Date().toLocaleTimeString('fa-IR'),
        });
      } else if (type === 'error') {
        this.listeners.onError?.(payload);
        this.listeners.onConsoleMessage?.({
          id: `err-${Date.now()}`,
          type: 'error',
          text: `[خطای پیش‌بینی‌نشده] ${payload.message} ${payload.filename ? `در ${payload.filename}:${payload.lineno}` : ''}`,
          timestamp: new Date().toLocaleTimeString('fa-IR'),
        });
      } else if (type === 'bot_action') {
        this.listeners.onBotAction?.(payload.text);
        this.listeners.onConsoleMessage?.({
          id: `bot-${Date.now()}`,
          type: 'bot',
          text: `🤖 [بات تست]: ${payload.text}`,
          timestamp: new Date().toLocaleTimeString('fa-IR'),
        });
      } else if (type === 'calc_eval_result') {
        this.listeners.onEvaluationResult?.(payload);
      }
    };

    window.addEventListener('message', this.boundMessageHandler);
  }

  // ایجاد و تزریق کدهای پروژه به همراه اسکریپت مانیتورینگ و تست خودکار
  public loadProject(files: ProjectFile[]) {
    if (!this.iframe) return;

    // پیدا کردن HTML اصلی یا ساختن یک سند HTML اگر تنها فایل‌های JS وجود دارد
    let htmlFile = files.find((f) => f.name.toLowerCase().endsWith('.html') || f.name.toLowerCase() === 'index.html');
    let jsFiles = files.filter((f) => f.name.endsWith('.js') || f.name.endsWith('.ts') || f.name.endsWith('.jsx'));
    let cssFiles = files.filter((f) => f.name.endsWith('.css'));

    let baseHtml = htmlFile?.content || `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Sandbox App</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="app"></div>
</body>
</html>`;

    // اسکریپت رهگیری و مانیتورینگ که در ابتدای iframe قرار می‌گیرد
    const instrumentationScript = `
<script>
(function() {
  const postMsg = (type, payload) => {
    try {
      window.parent.postMessage({ source: 'auto-debugger-sandbox', type, payload }, '*');
    } catch(e) {}
  };

  // رهگیری خطاها
  window.onerror = function(message, filename, lineno, colno, error) {
    postMsg('error', { message: String(message), filename, lineno, colno, stack: error ? error.stack : '' });
    return false;
  };

  window.addEventListener('unhandledrejection', function(event) {
    postMsg('error', { message: 'Unhandled Promise Rejection: ' + (event.reason ? (event.reason.message || event.reason) : 'Unknown'), stack: event.reason ? event.reason.stack : '' });
  });

  // مانیتورینگ کنسول
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = function(...args) {
    postMsg('console', { level: 'log', args });
    originalLog.apply(console, args);
  };
  console.warn = function(...args) {
    postMsg('console', { level: 'warn', args });
    originalWarn.apply(console, args);
  };
  console.error = function(...args) {
    postMsg('console', { level: 'error', args });
    originalError.apply(console, args);
  };

  // جلوگیری از مسدود شدن صفحه با alert یا prompt
  window.alert = function(msg) {
    postMsg('console', { level: 'warn', args: ['[window.alert فراخوانی شد]: ' + msg] });
  };
  window.confirm = function(msg) {
    postMsg('console', { level: 'warn', args: ['[window.confirm تایید شد]: ' + msg] });
    return true;
  };
  window.prompt = function(msg) {
    postMsg('console', { level: 'warn', args: ['[window.prompt مقداردهی شد]: ' + msg] });
    return 'تست مقدار خودکار';
  };

  // گوش دادن به دستورات تست از پنجره اصلی
  window.addEventListener('message', function(ev) {
    if (!ev.data || ev.data.target !== 'sandbox-runner') return;
    const { cmd, payload } = ev.data;

    if (cmd === 'run_bot_clicks') {
      runAutomatedClicks();
    } else if (cmd === 'run_form_inputs') {
      runAutomatedFormInputs(payload.payloadType);
    } else if (cmd === 'run_chaos_clicks') {
      runChaosClicks();
    } else if (cmd === 'eval_expression') {
      evaluateCalcExpression(payload.expression);
    }
  });

  // بات تست خودکار کلیک‌ها
  function runAutomatedClicks() {
    const buttons = Array.from(document.querySelectorAll('button, a[href], [role="button"], input[type="button"], input[type="submit"]'));
    postMsg('bot_action', { text: 'شناسایی ' + buttons.length + ' عنصر قابل تعامل برای کلیک خودکار' });
    let count = 0;
    buttons.forEach((btn, idx) => {
      setTimeout(() => {
        try {
          btn.focus();
          btn.click();
          count++;
          postMsg('bot_action', { text: 'کلیک روی عنصر: ' + (btn.innerText || btn.getAttribute('aria-label') || btn.tagName) });
        } catch(e) {
          postMsg('error', { message: 'خطا در شبیه‌سازی کلیک روی ' + btn.tagName + ': ' + e.message });
        }
      }, idx * 120);
    });
  }

  // بات تست تزریق داده‌های مرزی در فرم‌ها
  function runAutomatedFormInputs(type) {
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'));
    postMsg('bot_action', { text: 'تست تزریق ورودی‌های مرزی روی ' + inputs.length + ' فیلد ورودی' });
    
    let testValue = '';
    if (type === 'xss') testValue = '<script>alert("xss")</script><img src=x onerror=console.error("xss_vuln")>';
    else if (type === 'sql') testValue = "' OR '1'='1' -- ";
    else if (type === 'persian_emoji') testValue = 'تست ورودی فارسی با ایموجی 🚀✨ و اعراب‌گذاری ًٌٍَُِّ';
    else if (type === 'extreme_length') testValue = 'A'.repeat(5000);
    else if (type === 'negative_number') testValue = '-99999999.999';
    else if (type === 'empty') testValue = '';
    else testValue = 'مقدار تست پیش‌فرض 1234';

    inputs.forEach((inp) => {
      try {
        inp.value = testValue;
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        postMsg('bot_action', { text: 'تزریق داده (' + type + ') در فیلد ' + (inp.name || inp.id || inp.placeholder || 'ناشناس') });
      } catch(e) {
        postMsg('error', { message: 'خطا در مقداردهی فیلد: ' + e.message });
      }
    });
  }

  // بات تست کلیک‌های سریع و استرس (Chaos & Debounce)
  function runChaosClicks() {
    const primaryBtn = document.querySelector('button, [role="button"]');
    if (!primaryBtn) return;
    postMsg('bot_action', { text: 'آغاز تست پایداری: ۲۰ کلیک با توالی ۵۰ میلی‌ثانیه برای سنجش دیبانس و حافظه' });
    for(let i = 0; i < 20; i++) {
      setTimeout(() => {
        try {
          primaryBtn.click();
        } catch(e) {
          postMsg('error', { message: 'شکست تحت فشار کلیک سریع: ' + e.message });
        }
      }, i * 50);
    }
  }

  // شبیه‌سازی و ارزیابی محاسبات ماشین‌حساب در محیط DOM
  function evaluateCalcExpression(expr) {
    try {
      // بررسی وجود توابع عمومی محاسباتی در کد کاربر
      let res = null;
      if (typeof window.calculate === 'function') {
        res = window.calculate(expr);
      } else if (typeof window.calc === 'function') {
        res = window.calc(expr);
      } else if (typeof window.evaluateExpression === 'function') {
        res = window.evaluateExpression(expr);
      } else {
        // تلاش برای تزریق به نمایشگر ماشین‌حساب و زدن کلید مساوی
        const display = document.querySelector('.display, input[type="text"], #result, #display, output');
        const eqBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '=' || b.id === 'equal');
        if (display && eqBtn) {
          if (display.tagName === 'INPUT') display.value = expr;
          else display.innerText = expr;
          eqBtn.click();
          res = display.tagName === 'INPUT' ? display.value : display.innerText;
        } else {
          // در صورت نبود UI، اجرای امن فرمول با eval یا Function داخلی
          try {
            res = Function('"use strict"; return (' + expr + ')')();
          } catch(e) {
            res = 'Error';
          }
        }
      }
      postMsg('calc_eval_result', { expression: expr, result: res });
    } catch(err) {
      postMsg('calc_eval_result', { expression: expr, result: 'Error: ' + err.message });
    }
  }
})();
</script>
`;

    // اضافه کردن استایل‌های سفارشی
    let stylesToInject = cssFiles.map((c) => `<style data-filename="${c.name}">\n${c.content}\n</style>`).join('\n');

    // اضافه کردن اسکریپت‌های کاربر
    let scriptsToInject = jsFiles
      .map((j) => `<script data-filename="${j.name}">\n${j.content}\n</script>`)
      .join('\n');

    // درج هوشمند در سند HTML
    let injectedHtml = baseHtml;
    if (injectedHtml.includes('</head>')) {
      injectedHtml = injectedHtml.replace('</head>', `${stylesToInject}\n${instrumentationScript}\n</head>`);
    } else {
      injectedHtml = `${stylesToInject}\n${instrumentationScript}\n` + injectedHtml;
    }

    if (injectedHtml.includes('</body>')) {
      injectedHtml = injectedHtml.replace('</body>', `${scriptsToInject}\n</body>`);
    } else {
      injectedHtml = injectedHtml + `\n${scriptsToInject}`;
    }

    this.iframe.srcdoc = injectedHtml;
  }

  // ارسال فرمان به بات داخل سند iframe
  public sendBotCommand(cmd: 'run_bot_clicks' | 'run_form_inputs' | 'run_chaos_clicks' | 'eval_expression', payload: any = {}) {
    if (!this.iframe || !this.iframe.contentWindow) return;
    this.iframe.contentWindow.postMessage({ target: 'sandbox-runner', cmd, payload }, '*');
  }

  public cleanup() {
    if (this.boundMessageHandler) {
      window.removeEventListener('message', this.boundMessageHandler);
    }
  }
}
