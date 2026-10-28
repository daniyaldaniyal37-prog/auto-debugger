import { ProjectFile } from '../types';

export interface SampleProject {
  id: string;
  name: string;
  badge: string;
  description: string;
  type: 'calculator' | 'web' | 'nodejs' | 'android';
  userGoal: string;
  files: ProjectFile[];
}

export const SAMPLE_PROJECTS: SampleProject[] = [
  {
    id: 'sample-calculator',
    name: 'ماشین‌حساب پیشرفته و مهندسی (با باگ‌های ریاضی و اعشاری)',
    badge: 'ماشین‌حساب وب',
    description: 'ماشین‌حساب تعاملی تحت وب با خطای اعشاری 0.1+0.2، عدم تبدیل درجه به رادیان، و خطای تقسیم بر صفر',
    type: 'calculator',
    userGoal: 'یک ماشین‌حساب مهندسی دقیق با پشتیبانی از ۴ عمل اصلی، توان، ریشه، توابع مثلثاتی به درجه و اولویت عملگرها',
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        size: 2150,
        originalContent: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ماشین‌حساب مهندسی</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="calculator-card">
    <div class="header">
      <h2>ماشین‌حساب مهندسی Pro</h2>
      <span class="mode-badge" id="modeBadge">DEG (درجه)</span>
    </div>
    <div class="display-container">
      <div class="history" id="historyText"></div>
      <input type="text" id="display" class="display" value="0" readonly />
    </div>
    <div class="keypad">
      <button class="btn btn-action" onclick="clearAll()">C</button>
      <button class="btn btn-action" onclick="deleteChar()">⌫</button>
      <button class="btn btn-fn" onclick="appendFn('sin(')">sin</button>
      <button class="btn btn-fn" onclick="appendFn('cos(')">cos</button>
      <button class="btn btn-fn" onclick="appendFn('tan(')">tan</button>

      <button class="btn btn-fn" onclick="appendFn('sqrt(')">√</button>
      <button class="btn btn-fn" onclick="appendOp('^')">xʸ</button>
      <button class="btn btn-fn" onclick="appendOp('(')">(</button>
      <button class="btn btn-fn" onclick="appendOp(')')">)</button>
      <button class="btn btn-op" onclick="appendOp('/')">÷</button>

      <button class="btn" onclick="appendNum('7')">7</button>
      <button class="btn" onclick="appendNum('8')">8</button>
      <button class="btn" onclick="appendNum('9')">9</button>
      <button class="btn btn-op" onclick="appendOp('*')">×</button>
      <button class="btn btn-fn" onclick="appendFn('log(')">log</button>

      <button class="btn" onclick="appendNum('4')">4</button>
      <button class="btn" onclick="appendNum('5')">5</button>
      <button class="btn" onclick="appendNum('6')">6</button>
      <button class="btn btn-op" onclick="appendOp('-')">-</button>
      <button class="btn btn-fn" onclick="appendPi()">π</button>

      <button class="btn" onclick="appendNum('1')">1</button>
      <button class="btn" onclick="appendNum('2')">2</button>
      <button class="btn" onclick="appendNum('3')">3</button>
      <button class="btn btn-op" onclick="appendOp('+')">+</button>
      <button class="btn btn-action" onclick="toggleSign()">±</button>

      <button class="btn btn-zero" onclick="appendNum('0')">0</button>
      <button class="btn" onclick="appendDot()">.</button>
      <button class="btn btn-equal" id="equalBtn" onclick="calculateResult()">=</button>
    </div>
  </div>
  <script src="calculator.js"></script>
</body>
</html>`,
        content: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ماشین‌حساب مهندسی</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="calculator-card">
    <div class="header">
      <h2>ماشین‌حساب مهندسی Pro</h2>
      <span class="mode-badge" id="modeBadge">DEG (درجه)</span>
    </div>
    <div class="display-container">
      <div class="history" id="historyText"></div>
      <input type="text" id="display" class="display" value="0" readonly />
    </div>
    <div class="keypad">
      <button class="btn btn-action" onclick="clearAll()">C</button>
      <button class="btn btn-action" onclick="deleteChar()">⌫</button>
      <button class="btn btn-fn" onclick="appendFn('sin(')">sin</button>
      <button class="btn btn-fn" onclick="appendFn('cos(')">cos</button>
      <button class="btn btn-fn" onclick="appendFn('tan(')">tan</button>

      <button class="btn btn-fn" onclick="appendFn('sqrt(')">√</button>
      <button class="btn btn-fn" onclick="appendOp('^')">xʸ</button>
      <button class="btn btn-fn" onclick="appendOp('(')">(</button>
      <button class="btn btn-fn" onclick="appendOp(')')">)</button>
      <button class="btn btn-op" onclick="appendOp('/')">÷</button>

      <button class="btn" onclick="appendNum('7')">7</button>
      <button class="btn" onclick="appendNum('8')">8</button>
      <button class="btn" onclick="appendNum('9')">9</button>
      <button class="btn btn-op" onclick="appendOp('*')">×</button>
      <button class="btn btn-fn" onclick="appendFn('log(')">log</button>

      <button class="btn" onclick="appendNum('4')">4</button>
      <button class="btn" onclick="appendNum('5')">5</button>
      <button class="btn" onclick="appendNum('6')">6</button>
      <button class="btn btn-op" onclick="appendOp('-')">-</button>
      <button class="btn btn-fn" onclick="appendPi()">π</button>

      <button class="btn" onclick="appendNum('1')">1</button>
      <button class="btn" onclick="appendNum('2')">2</button>
      <button class="btn" onclick="appendNum('3')">3</button>
      <button class="btn btn-op" onclick="appendOp('+')">+</button>
      <button class="btn btn-action" onclick="toggleSign()">±</button>

      <button class="btn btn-zero" onclick="appendNum('0')">0</button>
      <button class="btn" onclick="appendDot()">.</button>
      <button class="btn btn-equal" id="equalBtn" onclick="calculateResult()">=</button>
    </div>
  </div>
  <script src="calculator.js"></script>
</body>
</html>`
      },
      {
        name: 'style.css',
        path: 'style.css',
        size: 1400,
        originalContent: `body {
  background-color: #0b1329;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  color: #fff;
}
.calculator-card {
  background: #1e293b;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  width: 360px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.header h2 {
  font-size: 1.1rem;
  margin: 0;
  color: #94a3b8;
}
.mode-badge {
  background: #0284c7;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: bold;
}
.display-container {
  background: #0f172a;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: left;
  border: 1px solid #334155;
}
.history {
  font-size: 0.85rem;
  color: #64748b;
  height: 20px;
  overflow: hidden;
}
.display {
  width: 100%;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  color: #38bdf8;
  outline: none;
  font-family: monospace;
}
.keypad {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.btn {
  background: #334155;
  border: none;
  color: #f8fafc;
  font-size: 1.1rem;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn:hover { background: #475569; }
.btn-op { background: #d97706; }
.btn-op:hover { background: #b45309; }
.btn-action { background: #dc2626; }
.btn-action:hover { background: #b91c1c; }
.btn-fn { background: #4f46e5; font-size: 0.9rem; }
.btn-fn:hover { background: #4338ca; }
.btn-equal { background: #16a34a; font-weight: bold; }
.btn-equal:hover { background: #15803d; }
.btn-zero { grid-column: span 2; }`,
        content: `body {
  background-color: #0b1329;
  font-family: system-ui, -apple-system, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  color: #fff;
}
.calculator-card {
  background: #1e293b;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  width: 360px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.header h2 {
  font-size: 1.1rem;
  margin: 0;
  color: #94a3b8;
}
.mode-badge {
  background: #0284c7;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: bold;
}
.display-container {
  background: #0f172a;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  text-align: left;
  border: 1px solid #334155;
}
.history {
  font-size: 0.85rem;
  color: #64748b;
  height: 20px;
  overflow: hidden;
}
.display {
  width: 100%;
  background: transparent;
  border: none;
  font-size: 1.8rem;
  color: #38bdf8;
  outline: none;
  font-family: monospace;
}
.keypad {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.btn {
  background: #334155;
  border: none;
  color: #f8fafc;
  font-size: 1.1rem;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn:hover { background: #475569; }
.btn-op { background: #d97706; }
.btn-op:hover { background: #b45309; }
.btn-action { background: #dc2626; }
.btn-action:hover { background: #b91c1c; }
.btn-fn { background: #4f46e5; font-size: 0.9rem; }
.btn-fn:hover { background: #4338ca; }
.btn-equal { background: #16a34a; font-weight: bold; }
.btn-equal:hover { background: #15803d; }
.btn-zero { grid-column: span 2; }`
      },
      {
        name: 'calculator.js',
        path: 'calculator.js',
        size: 2600,
        originalContent: `// کدهای ماشین‌حساب حاوی باگ‌های واقعی برای شناسایی توسط Auto Debugger
let currentInput = "0";
let calculationHistory = "";

// باگ نشت حافظه: افزودن مکرر رویداد روی پنجره در هر بار اجرای اسکریپت
window.addEventListener("resize", function() {
  console.log("Window resized in calculator");
});

function appendNum(num) {
  if (currentInput === "0") {
    currentInput = num;
  } else {
    currentInput += num;
  }
  updateDisplay();
}

function appendOp(op) {
  currentInput += " " + op + " ";
  updateDisplay();
}

function appendFn(fn) {
  if (currentInput === "0") currentInput = fn;
  else currentInput += fn;
  updateDisplay();
}

function appendPi() {
  currentInput += Math.PI.toString();
  updateDisplay();
}

function appendDot() {
  // باگ مرزی: عدم بررسی وجود ممیز دوتایی در عدد جاری
  currentInput += ".";
  updateDisplay();
}

function clearAll() {
  currentInput = "0";
  calculationHistory = "";
  updateDisplay();
}

function deleteChar() {
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = "0";
  }
  updateDisplay();
}

function toggleSign() {
  try {
    currentInput = String(-parseFloat(currentInput));
    updateDisplay();
  } catch(e) {}
}

function updateDisplay() {
  document.getElementById("display").value = currentInput;
  document.getElementById("historyText").innerText = calculationHistory;
}

// تابع اصلی محاسبه که دارای چندین باگ مهم است:
function calculate(expr) {
  let expression = expr || currentInput;
  calculationHistory = expression;

  // باگ ۱: عدم تبدیل درجه به رادیان برای sin, cos, tan
  // در حالی که در UI نوشته شده DEG (درجه)، مستقیماً از Math.sin استفاده می‌کند که رادیان می‌گیرد!
  // مثلاً sin(30) به جای 0.5 عدد -0.988 می‌شود!
  let sanitized = expression
    .replace(/sin\\(/g, "Math.sin(")
    .replace(/cos\\(/g, "Math.cos(")
    .replace(/tan\\(/g, "Math.tan(")
    .replace(/sqrt\\(/g, "Math.sqrt(")
    .replace(/log\\(/g, "Math.log10(")
    .replace(/\\^/g, "**");

  try {
    // باگ امنیتی و منطقی: استفاده مستقیم از eval بدون اعتبارسنجی
    let result = eval(sanitized);

    // باگ ۲: عدم هندلینگ خطای تقسیم بر صفر (خروجی Infinity بدون هشدار به کاربر)
    if (result === Infinity || result === -Infinity) {
      console.warn("Division by zero resulted in Infinity");
    }

    // باگ ۳: خطای اعشاری ممیز شناور (0.1 + 0.2 = 0.30000000000000004)
    // هیچ گردکردن مناسب با EPSILON انجام نشده است!
    return result;
  } catch(err) {
    console.error("Calculation Error:", err.message);
    return "Error";
  }
}

function calculateResult() {
  const res = calculate(currentInput);
  currentInput = String(res);
  updateDisplay();
}

// برای تست مستقیم
window.calculate = calculate;`,
        content: `// کدهای ماشین‌حساب حاوی باگ‌های واقعی برای شناسایی توسط Auto Debugger
let currentInput = "0";
let calculationHistory = "";

// باگ نشت حافظه: افزودن مکرر رویداد روی پنجره در هر بار اجرای اسکریپت
window.addEventListener("resize", function() {
  console.log("Window resized in calculator");
});

function appendNum(num) {
  if (currentInput === "0") {
    currentInput = num;
  } else {
    currentInput += num;
  }
  updateDisplay();
}

function appendOp(op) {
  currentInput += " " + op + " ";
  updateDisplay();
}

function appendFn(fn) {
  if (currentInput === "0") currentInput = fn;
  else currentInput += fn;
  updateDisplay();
}

function appendPi() {
  currentInput += Math.PI.toString();
  updateDisplay();
}

function appendDot() {
  // باگ مرزی: عدم بررسی وجود ممیز دوتایی در عدد جاری
  currentInput += ".";
  updateDisplay();
}

function clearAll() {
  currentInput = "0";
  calculationHistory = "";
  updateDisplay();
}

function deleteChar() {
  if (currentInput.length > 1) {
    currentInput = currentInput.slice(0, -1);
  } else {
    currentInput = "0";
  }
  updateDisplay();
}

function toggleSign() {
  try {
    currentInput = String(-parseFloat(currentInput));
    updateDisplay();
  } catch(e) {}
}

function updateDisplay() {
  document.getElementById("display").value = currentInput;
  document.getElementById("historyText").innerText = calculationHistory;
}

// تابع اصلی محاسبه که دارای چندین باگ مهم است:
function calculate(expr) {
  let expression = expr || currentInput;
  calculationHistory = expression;

  // باگ ۱: عدم تبدیل درجه به رادیان برای sin, cos, tan
  // در حالی که در UI نوشته شده DEG (درجه)، مستقیماً از Math.sin استفاده می‌کند که رادیان می‌گیرد!
  // مثلاً sin(30) به جای 0.5 عدد -0.988 می‌شود!
  let sanitized = expression
    .replace(/sin\\(/g, "Math.sin(")
    .replace(/cos\\(/g, "Math.cos(")
    .replace(/tan\\(/g, "Math.tan(")
    .replace(/sqrt\\(/g, "Math.sqrt(")
    .replace(/log\\(/g, "Math.log10(")
    .replace(/\\^/g, "**");

  try {
    // باگ امنیتی و منطقی: استفاده مستقیم از eval بدون اعتبارسنجی
    let result = eval(sanitized);

    // باگ ۲: عدم هندلینگ خطای تقسیم بر صفر (خروجی Infinity بدون هشدار به کاربر)
    if (result === Infinity || result === -Infinity) {
      console.warn("Division by zero resulted in Infinity");
    }

    // باگ ۳: خطای اعشاری ممیز شناور (0.1 + 0.2 = 0.30000000000000004)
    // هیچ گردکردن مناسب با EPSILON انجام نشده است!
    return result;
  } catch(err) {
    console.error("Calculation Error:", err.message);
    return "Error";
  }
}

function calculateResult() {
  const res = calculate(currentInput);
  currentInput = String(res);
  updateDisplay();
}

// برای تست مستقیم
window.calculate = calculate;`
      }
    ]
  },
  {
    id: 'sample-ecommerce',
    name: 'سامانه ثبت سفارش و پرداخت (با باگ امنیتی XSS و خطای مرزی)',
    badge: 'وب اپلیکیشن فروشگاهی',
    description: 'فرم ثبت سفارش با آسیب‌پذیری تزریق اسکریپت (XSS)، مقادیر مرزی منفی در تعداد کالا و کلید محرمانه لو رفته',
    type: 'web',
    userGoal: 'یک فرم سفارش محصول با سبد خرید، محاسبه خودکار تخفیف و ثبت نظرات کاربر با اعتبارسنجی قوی',
    files: [
      {
        name: 'index.html',
        path: 'index.html',
        size: 1950,
        originalContent: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>فروشگاه آنلاین - تسویه حساب</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: sans-serif; padding: 20px; }
    .card { background: #1e293b; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto; }
    input, button { width: 100%; padding: 10px; margin: 8px 0; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: #fff; }
    button { background: #2563eb; cursor: pointer; border: none; font-weight: bold; }
    .comment-box { border-top: 1px solid #334155; margin-top: 16px; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>سبد خرید و ثبت نهایی</h2>
    <p>قیمت واحد محصول: ۵۰,۰۰۰ تومان</p>
    <label>تعداد کالا:</label>
    <input type="number" id="qtyInput" value="1" />
    <label>کد تخفیف:</label>
    <input type="text" id="couponInput" placeholder="OFFER20" />
    <label>یادداشت مشتری:</label>
    <input type="text" id="noteInput" placeholder="توضیحات ارسال..." />
    <button id="checkoutBtn" onclick="processOrder()">تایید و پرداخت</button>
    <div id="orderSummary" style="margin-top: 15px;"></div>
    <div class="comment-box" id="reviewsContainer">
      <h4>نظرات ثبت‌شده:</h4>
      <div id="commentList"></div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
        content: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>فروشگاه آنلاین - تسویه حساب</title>
  <style>
    body { background: #0f172a; color: #f8fafc; font-family: sans-serif; padding: 20px; }
    .card { background: #1e293b; padding: 24px; border-radius: 12px; max-width: 500px; margin: 0 auto; }
    input, button { width: 100%; padding: 10px; margin: 8px 0; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: #fff; }
    button { background: #2563eb; cursor: pointer; border: none; font-weight: bold; }
    .comment-box { border-top: 1px solid #334155; margin-top: 16px; padding-top: 10px; }
  </style>
</head>
<body>
  <div class="card">
    <h2>سبد خرید و ثبت نهایی</h2>
    <p>قیمت واحد محصول: ۵۰,۰۰۰ تومان</p>
    <label>تعداد کالا:</label>
    <input type="number" id="qtyInput" value="1" />
    <label>کد تخفیف:</label>
    <input type="text" id="couponInput" placeholder="OFFER20" />
    <label>یادداشت مشتری:</label>
    <input type="text" id="noteInput" placeholder="توضیحات ارسال..." />
    <button id="checkoutBtn" onclick="processOrder()">تایید و پرداخت</button>
    <div id="orderSummary" style="margin-top: 15px;"></div>
    <div class="comment-box" id="reviewsContainer">
      <h4>نظرات ثبت‌شده:</h4>
      <div id="commentList"></div>
    </div>
  </div>
  <script src="app.js"></script>
</body>
</html>`
      },
      {
        name: 'app.js',
        path: 'app.js',
        size: 1800,
        originalContent: `// باگ امنیتی ۱: کلید محرمانه درگاه پرداخت در سمت کلاینت لو رفته است
const PAYMENT_GATEWAY_SECRET = "sk_live_992384102938491028349182390";

const UNIT_PRICE = 50000;

function processOrder() {
  const qtyInput = document.getElementById("qtyInput").value;
  const noteInput = document.getElementById("noteInput").value;
  const qty = parseInt(qtyInput);

  // باگ مرزی ۲: عدم اعتبارسنجی مقادیر مرزی منفی یا صفر
  // اگر کاربر -5 وارد کند، مبلغ نهایی منفی می‌شود و شرکت به مشتری بدهکار می‌شود!
  const total = qty * UNIT_PRICE;

  document.getElementById("orderSummary").innerText = "مبلغ قابل پرداخت: " + total.toLocaleString() + " تومان";

  // باگ امنیتی ۳: آسیب‌پذیری شدید XSS از طریق innerHTML با متن یادداشت کاربر بدون پاکسازی
  const commentList = document.getElementById("commentList");
  commentList.innerHTML += "<div class='item'>یادداشت: " + noteInput + "</div>";

  console.log("سفارش با موفقیت پردازش شد به ارزش:", total);
}`,
        content: `// باگ امنیتی ۱: کلید محرمانه درگاه پرداخت در سمت کلاینت لو رفته است
const PAYMENT_GATEWAY_SECRET = "sk_live_992384102938491028349182390";

const UNIT_PRICE = 50000;

function processOrder() {
  const qtyInput = document.getElementById("qtyInput").value;
  const noteInput = document.getElementById("noteInput").value;
  const qty = parseInt(qtyInput);

  // باگ مرزی ۲: عدم اعتبارسنجی مقادیر مرزی منفی یا صفر
  // اگر کاربر -5 وارد کند، مبلغ نهایی منفی می‌شود و شرکت به مشتری بدهکار می‌شود!
  const total = qty * UNIT_PRICE;

  document.getElementById("orderSummary").innerText = "مبلغ قابل پرداخت: " + total.toLocaleString() + " تومان";

  // باگ امنیتی ۳: آسیب‌پذیری شدید XSS از طریق innerHTML با متن یادداشت کاربر بدون پاکسازی
  const commentList = document.getElementById("commentList");
  commentList.innerHTML += "<div class='item'>یادداشت: " + noteInput + "</div>";

  console.log("سفارش با موفقیت پردازش شد به ارزش:", total);
}`
      }
    ]
  },
  {
    id: 'sample-android',
    name: 'ماژول همگام‌سازی پیام‌های اندروید (تحلیل استاتیک Kotlin)',
    badge: 'پروژه اندروید (کاتلین)',
    description: 'کدهای کاتلین حاوی خطای نشت حافظه Context، خطای اجرای شبکه روی ترد اصلی و عدم اعتبارسنجی دسترسی‌ها',
    type: 'android',
    userGoal: 'ماژول سینک پیام‌ها و کش محلی پیام‌های دریافتی در پس‌زمینه با هندلینگ چرخه حیات اندروید',
    files: [
      {
        name: 'MessageSyncManager.kt',
        path: 'src/main/java/com/app/sync/MessageSyncManager.kt',
        size: 1750,
        originalContent: `package com.app.sync

import android.content.Context
import java.net.URL

object MessageSyncManager {
    // باگ بحرانی ۱: نشت حافظه اندروید (Memory Leak)
    // نگه‌داشتن رفرنس استاتیک مستقیم به Activity Context که مانع از پاک شدن اکتیویتی در Garbage Collector می‌شود
    var activeContext: Context? = null

    fun initialize(context: Context) {
        this.activeContext = context
    }

    // باگ بحرانی ۲: اجرای درخواست شبکه روی ترد اصلی (NetworkOnMainThreadException)
    // این متد روی ترد اصلی فراخوانی می‌شود و اپلیکیشن کرش می‌کند!
    fun fetchMessagesFromCloud(endpointUrl: String): String {
        val url = URL(endpointUrl)
        val connection = url.openConnection()
        val data = connection.getInputStream().bufferedReader().use { it.readText() }
        return data
    }

    // باگ ۳: ریسک NullPointerException
    fun showToastNotification(message: String) {
        // عدم بررسی امن null بودن context
        android.widget.Toast.makeText(activeContext!!, message, android.widget.Toast.LENGTH_SHORT).show()
    }
}`,
        content: `package com.app.sync

import android.content.Context
import java.net.URL

object MessageSyncManager {
    // باگ بحرانی ۱: نشت حافظه اندروید (Memory Leak)
    // نگه‌داشتن رفرنس استاتیک مستقیم به Activity Context که مانع از پاک شدن اکتیویتی در Garbage Collector می‌شود
    var activeContext: Context? = null

    fun initialize(context: Context) {
        this.activeContext = context
    }

    // باگ بحرانی ۲: اجرای درخواست شبکه روی ترد اصلی (NetworkOnMainThreadException)
    // این متد روی ترد اصلی فراخوانی می‌شود و اپلیکیشن کرش می‌کند!
    fun fetchMessagesFromCloud(endpointUrl: String): String {
        val url = URL(endpointUrl)
        val connection = url.openConnection()
        val data = connection.getInputStream().bufferedReader().use { it.readText() }
        return data
    }

    // باگ ۳: ریسک NullPointerException
    fun showToastNotification(message: String) {
        // عدم بررسی امن null بودن context
        android.widget.Toast.makeText(activeContext!!, message, android.widget.Toast.LENGTH_SHORT).show()
    }
}`
      },
      {
        name: 'AndroidManifest.xml',
        path: 'src/main/AndroidManifest.xml',
        size: 800,
        originalContent: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.app.sync">

    <!-- باگ ۴: عدم تعریف مجوز اینترنت android.permission.INTERNET با وجود کدهای شبکه -->
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="SyncApp"
        android:theme="@style/Theme.AppCompat.Light">
    </application>
</manifest>`,
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.app.sync">

    <!-- باگ ۴: عدم تعریف مجوز اینترنت android.permission.INTERNET با وجود کدهای شبکه -->
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="SyncApp"
        android:theme="@style/Theme.AppCompat.Light">
    </application>
</manifest>`
      }
    ]
  }
];
