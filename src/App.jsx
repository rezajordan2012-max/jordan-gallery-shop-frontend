import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import {
  ShoppingBag, ShoppingCart, X, Plus, Minus, Trash2, LayoutDashboard,
  Store, Pencil, Check, Menu, Sparkles, User, LogOut, Lock, Upload, Search, Camera
} from "lucide-react";
// برای اسکن بارکد با دوربین — کتابخانه‌ی رایگان و متن‌باز ZXing. قبل از دیپلوی، این پکیج را نصب کن:
//   npm install @zxing/browser
import { BrowserMultiFormatReader } from "@zxing/browser";

// آدرس بک‌اندی که راه‌اندازی کردی را اینجا جایگزین کن
// (بعد از دیپلوی سرور در پوشه‌ی backend، مثلاً: "https://jordan-gallery-shop-backend.onrender.com")
const API_BASE_URL = "https://jordan-gallery-shop-backend.onrender.com";


// فقط کاربری با همین ایمیل اجازه‌ی دسترسی به پنل مدیریت را دارد.
// تشخیص نهایی مدیر بودن باید سمت سرور (بک‌اند) هم بررسی شود؛ این فقط لایه‌ی نمایش در فرانت‌اند است.
const ADMIN_EMAIL = "rezajordan2012@gmail.com";

// تابع کمکی جدید: هنگام بیدار شدن سرور رایگان (Render) که ممکن است تا ۵۰ ثانیه طول بکشد،
// به‌جای شکست فوری، چند بار با فاصله دوباره تلاش می‌کند تا مشتری با محصولات fake گمراه نشود.
// همچنین کش را کاملاً غیرفعال می‌کند — هم کش خود مرورگر و هم هر پراکسی/کش شبکه‌ای بین راه (مثلاً برخی
// اپراتورهای موبایل) — چون این دقیقاً دلیل اصلیِ «توی گوشی خودم می‌بینم ولی گوشیِ بقیه نه» بود.
async function fetchWithRetry(url, options = {}, { retries = 6, delayMs = 4000 } = {}) {
  let lastErr;
  const bustUrl = url.includes("?") ? `${url}&_=${Date.now()}` : `${url}?_=${Date.now()}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(bustUrl, { ...options, cache: "no-store" });
      if (!res.ok) throw new Error("bad response");
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt < retries) await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  throw lastErr;
}

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&family=Baloo+2:wght@500;600;700;800&family=Lalezar&display=swap');

  .maison-root {
    font-family: 'Vazirmatn', sans-serif;
    background: #FFFFFF;
    color: #241E3D;
    -webkit-font-smoothing: antialiased;
  }
  .font-latin { font-family: 'Baloo 2', sans-serif; letter-spacing: 0.14em; }
  .font-display { font-family: 'Baloo 2', 'Vazirmatn', sans-serif; font-weight: 800; letter-spacing: -0.01em; }

  .brand-showcase {
    font-family: 'Lalezar', 'Vazirmatn', sans-serif;
    background: linear-gradient(90deg, #FF3E8E, #7B5CF6, #00C2CB, #FF3E8E);
    background-size: 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
    -webkit-text-stroke: 0.7px rgba(123,92,246,0.55);
    text-stroke: 0.7px rgba(123,92,246,0.55);
    animation: brandShine 6s ease-in-out infinite, brandTilt 5s ease-in-out infinite, brandGlow 6s ease-in-out infinite;
    line-height: 1.4;
    letter-spacing: 0.3px;
    display: inline-block;
    transform-style: preserve-3d;
  }
  @keyframes brandShine {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes brandTilt {
    0%, 100% { transform: perspective(320px) rotateY(0deg) rotateX(0deg) scale(1); }
    25% { transform: perspective(320px) rotateY(5deg) rotateX(1.5deg) scale(1.015); }
    75% { transform: perspective(320px) rotateY(-5deg) rotateX(-1.5deg) scale(1.015); }
  }
  @keyframes brandGlow {
    0%, 100% { filter: drop-shadow(0 2px 4px rgba(255,62,142,0.4)); }
    33% { filter: drop-shadow(0 2px 7px rgba(123,92,246,0.55)); }
    66% { filter: drop-shadow(0 2px 7px rgba(0,194,203,0.55)); }
  }
  @media (prefers-reduced-motion: reduce) {
    .brand-showcase { animation: none; }
  }

  ::selection { background: rgba(255,62,142,0.28); color: #241E3D; }

  .bg-panel { background: #FFFFFF; }
  .bg-panel-2 { background: #FBF3FF; }
  .border-hair { border-color: rgba(123,92,246,0.16); }
  .text-gold { color: #FF3E8E; }
  .text-muted { color: #756E93; }
  .bg-gold { background: #FF3E8E; }
  .bg-gold-grad { background: linear-gradient(135deg, #FF7CB3, #7B5CF6); }

  .btn-gold {
    background: linear-gradient(135deg, #FF3E8E, #7B5CF6);
    color: #FFFFFF;
    box-shadow: 0 6px 20px -6px rgba(255,62,142,0.5);
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  }
  .btn-gold:hover { filter: brightness(1.07); transform: translateY(-1px); box-shadow: 0 10px 26px -6px rgba(255,62,142,0.6); }
  .btn-gold:active { transform: translateY(0); }

  .btn-ghost {
    border: 1px solid rgba(123,92,246,0.3);
    color: #241E3D;
    background: rgba(123,92,246,0.04);
    transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
  }
  .btn-ghost:hover { border-color: #FF3E8E; color: #FF3E8E; background: rgba(255,62,142,0.08); }

  .card-perfume { background: linear-gradient(160deg, #FFD9EC, #FFF3F9); }
  .card-perfume-blue { background: linear-gradient(160deg, #CFE8FF, #F1F8FF); }
  .card-beauty { background: linear-gradient(160deg, #FFF0AE, #FFFBEA); }
  .card-hygiene { background: linear-gradient(160deg, #BDF3EA, #EEFFFC); }
  .card-electronics { background: linear-gradient(160deg, #E2D4FF, #F8F2FF); }
  .card-hairstyling { background: linear-gradient(160deg, #C6F5C1, #F1FFEF); }

  .product-card {
    transition: transform 0.28s cubic-bezier(.2,.8,.2,1), box-shadow 0.28s ease, border-color 0.28s ease;
    box-shadow: 0 1px 0 rgba(255,255,255,0.5) inset, 0 12px 24px -18px rgba(123,92,246,0.35);
  }
  .product-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255,62,142,0.5);
    box-shadow: 0 18px 34px -16px rgba(123,92,246,0.4), 0 0 0 1px rgba(255,62,142,0.18);
  }
  .product-card img { transition: transform 0.5s ease; }
  .product-card:hover img { transform: scale(1.045); }

  .category-card {
    transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
  }
  .category-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255,62,142,0.55);
    box-shadow: 0 16px 30px -18px rgba(123,92,246,0.45);
  }

  .glint {
    position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
    background: linear-gradient(100deg, transparent, rgba(255,255,255,0.55), transparent);
    animation: glintMove 5s ease-in-out infinite;
  }
  @keyframes glintMove {
    0% { left: -60%; }
    45% { left: 130%; }
    100% { left: 130%; }
  }
  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  .float-slow { animation: floatSlow 6s ease-in-out infinite; }

  @keyframes rayRotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
  .ray-burst {
    position: absolute; top: 50%; left: 50%; width: 340px; height: 340px;
    background: repeating-conic-gradient(from 0deg, rgba(255,62,142,0.18) 0deg 4deg, transparent 4deg 18deg);
    border-radius: 50%;
    animation: rayRotate 34s linear infinite;
    pointer-events: none;
  }
  @keyframes haloBreathe {
    0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(1); }
    50% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.08); }
  }
  .hero-halo {
    position: absolute; top: 50%; left: 50%; width: 260px; height: 260px;
    background: radial-gradient(circle, rgba(255,124,179,0.4), rgba(123,92,246,0.2) 55%, transparent 75%);
    filter: blur(6px);
    border-radius: 50%;
    animation: haloBreathe 5s ease-in-out infinite;
    pointer-events: none;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in-up { animation: fadeInUp 0.5s ease both; }

  .cart-drawer { transition: transform 0.35s cubic-bezier(.2,.8,.2,1); }

  .nav-link { position: relative; padding-bottom: 4px; transition: color 0.18s ease; }
  .nav-link::after {
    content: ""; position: absolute; right: 0; bottom: 0; height: 2px; width: 0;
    background: linear-gradient(90deg, #FF3E8E, #7B5CF6); border-radius: 2px; transition: width 0.25s ease;
  }
  .nav-link.active::after, .nav-link:hover::after { width: 100%; }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: rgba(255,62,142,0.6) !important;
    box-shadow: 0 0 0 3px rgba(255,62,142,0.14);
  }

  /* نوار اعلان متحرک بالای صفحه */
  .marquee-track {
    display: inline-flex;
    white-space: nowrap;
    animation: marqueeScroll 22s linear infinite;
  }
  @keyframes marqueeScroll {
    from { transform: translateX(0); }
    to { transform: translateX(-50%); }
  }

  /* پرش سبد خرید هنگام افزودن محصول */
  @keyframes cartBump {
    0% { transform: scale(1); }
    30% { transform: scale(1.28); }
    55% { transform: scale(0.95); }
    100% { transform: scale(1); }
  }
  .cart-bump { animation: cartBump 0.45s cubic-bezier(.3,1.6,.5,1); }

  /* اسکلتون درخشان هنگام بارگذاری محصولات */
  .skeleton {
    background: linear-gradient(100deg, #F3E9FF 30%, #FFE3F0 50%, #F3E9FF 70%);
    background-size: 200% 100%;
    animation: skeletonShine 1.4s ease-in-out infinite;
  }
  @keyframes skeletonShine {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ذرات درخشان شناور در هدر */
  @keyframes sparkleFloat {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
    50% { transform: translateY(-14px) scale(1.25); opacity: 1; }
  }
  .sparkle { animation: sparkleFloat 3.2s ease-in-out infinite; }

  @keyframes mistPuff {
    0% { transform: translateY(0) scale(0.6); opacity: 0.7; }
    100% { transform: translateY(-14px) scale(1.3); opacity: 0; }
  }
  .mist-puff { animation: mistPuff 1.8s ease-in-out infinite; }

  @keyframes waveShift {
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(3px); }
  }
  .wave-flow { animation: waveShift 2.4s ease-in-out infinite; }

  @keyframes rippleGrow {
    0% { transform: scale(0.5); opacity: 0.55; }
    100% { transform: scale(1.7); opacity: 0; }
  }
  .ripple-ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 1.5px solid currentColor;
    animation: rippleGrow 1.8s ease-out infinite;
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,62,142,0.45); }
    50% { box-shadow: 0 0 0 6px rgba(255,62,142,0); }
  }
  .pulse-glow { animation: pulseGlow 2.2s ease-in-out infinite; }

  /* موج نور طلایی روی آیکون‌های هدر (سبد خرید، حساب کاربری، جستجو، منو) — هر چند ثانیه یک‌بار
     رنگ آیکون از سفید به طلایی (هم‌رنگ لوگو) و برعکس تغییر می‌کند تا روی بنرها و پس‌زمینه‌های
     روشن هم گم نشوند. با تأخیرهای متفاوت روی هر آیکون، حس یک موج رد شونده از میان آن‌ها ایجاد می‌شود. */
  @keyframes iconGoldWave {
    0%, 80%, 100% { color: #FFD23F; filter: none; transform: scale(1); }
    87% { color: #FFF3C4; filter: drop-shadow(0 0 8px rgba(255,210,63,0.95)); transform: scale(1.14); }
    94% { color: #FFD23F; filter: none; transform: scale(1); }
  }
  .icon-gold-wave {
    display: inline-flex;
    color: #FFD23F;
    animation: iconGoldWave 7s ease-in-out infinite;
  }

  /* تاج صفحه‌ی اصلی: فقط لوگوی ویدیویی، وسط صفحه */

  @keyframes drawerSlideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  .menu-drawer { animation: drawerSlideIn 0.25s ease-out; }
  @media (prefers-reduced-motion: reduce) {
    .menu-drawer { animation: none; }
  }

  /* راهنمای انیمیشنی «دست در حال لمس دکمه‌ی منو» — تا زمانی که مشتری متوجه نشود این دکمه
     همان منوی اصلی انتخاب محصولات است، تکرار می‌شود. */
  @keyframes menuHintGlowPulse {
    0%, 100% { transform: translate(-50%, -50%) scale(0.85); opacity: 0.55; }
    50% { transform: translate(-50%, -50%) scale(1.25); opacity: 0.15; }
  }
  .menu-hint-glow {
    animation: menuHintGlowPulse 1.6s ease-in-out infinite;
  }
  @keyframes menuHintFingerTap {
    0% { transform: translate(-50%, -50%) translate(10px, -12px) scale(1); opacity: 0; }
    8% { opacity: 1; }
    22% { transform: translate(-50%, -50%) translate(1px, 1px) scale(0.82); }
    32% { transform: translate(-50%, -50%) translate(1px, 1px) scale(0.96); }
    48% { transform: translate(-50%, -50%) translate(1px, 1px) scale(0.82); }
    62% { transform: translate(-50%, -50%) translate(1px, 1px) scale(1); }
    82% { transform: translate(-50%, -50%) translate(10px, -12px) scale(1); opacity: 1; }
    100% { transform: translate(-50%, -50%) translate(10px, -12px) scale(1); opacity: 0; }
  }
  .menu-hint-finger {
    animation: menuHintFingerTap 1.9s cubic-bezier(.3,.6,.3,1) infinite;
    filter: drop-shadow(0 2px 5px rgba(36,30,61,0.35));
  }
  @keyframes menuHintRipple {
    0%, 18% { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
    30% { opacity: 0.65; }
    62% { transform: translate(-50%, -50%) scale(1.9); opacity: 0; }
    100% { opacity: 0; }
  }
  .menu-hint-ripple {
    animation: menuHintRipple 1.9s ease-out infinite;
  }

  /* جلوه‌ی «تپش لمس» روی دکمه‌ی منو — هر بار که کاربر لمسش کند اجرا می‌شود (نه فقط بار اول):
     کلمه‌ی menu با یه پرش بزرگ و کمی چرخش ظاهر می‌شود، لحظه‌ای می‌ایستد، سپس همراه با بزرگ‌تر
     شدن محو می‌شود؛ هم‌زمان چند حلقه‌ی موج رنگی (صورتی/بنفش/فیروزه‌ای، هماهنگ با پالت سایت) از
     دور دکمه بیرون می‌زنند و محو می‌شوند — دقیقاً مثل موجی که از یک لمس روی آب پخش می‌شود. */
  @keyframes menuTapWordPop {
    0% { transform: translate(-50%, -50%) scale(0.3) rotate(-10deg); opacity: 0; }
    30% { transform: translate(-50%, -50%) scale(1.25) rotate(4deg); opacity: 1; }
    45% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
    70% { transform: translate(-50%, -50%) scale(1.15) rotate(0deg); opacity: 0.85; }
    100% { transform: translate(-50%, -50%) scale(1.9) rotate(0deg); opacity: 0; }
  }
  .menu-tap-word {
    animation: menuTapWordPop 1s cubic-bezier(.28,1.55,.4,1) forwards;
  }
  @keyframes menuTapRippleWave {
    0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.85; }
    100% { transform: translate(-50%, -50%) scale(3.4); opacity: 0; }
  }
  .menu-tap-ripple {
    animation: menuTapRippleWave 1s cubic-bezier(.1,.5,.4,1) forwards;
  }
  @media (prefers-reduced-motion: reduce) {
    .menu-tap-word, .menu-tap-ripple { animation: none; opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .glint, .float-slow, .fade-in-up { animation: none; }
    .product-card, .product-card img, .category-card { transition: none; }
    .marquee-track, .cart-bump, .skeleton, .sparkle, .pulse-glow { animation: none; }
    .mist-puff, .wave-flow, .ripple-ring { animation: none; }
    .ray-burst, .hero-halo { animation: none; }
  }
`;

// گروه‌های فیلتر ادکلن — روی همه‌ی زیرشاخه‌های ادکلن یکسان اعمال می‌شود.
// هر گروه یک کلید پایدار (key) دارد تا بشود از هر گروه هم‌زمان و مستقل یک گزینه انتخاب کرد.
const PERFUME_FACETS = [
  {
    key: "scentFamily",
    group: "حس رایحه",
    options: {
      sweet: "شیرین",
      bitter: "تلخ",
      sour: "ترش",
      sharp: "تند",
      fresh: "تازه",
      clean: "تمیز",
      soapy: "صابونی",
      powdery: "پودری",
      creamy: "کرمی",
      soft: "نرم",
      dry: "خشک",
      smoky: "دودی",
      earthy: "خاکی",
      resinous: "رزینی",
      herbal: "گیاهی",
      leathery: "چرمی",
      musky: "مُشکی",
      aquatic: "دریایی",
      mossy: "خزه‌ای",
      incense: "بخوری",
    },
  },
  {
    key: "concentration",
    group: "غلظت مواد معطر",
    multi: false, // یک ادکلن هم‌زمان نمی‌تواند از چند نوع باشد (مثلاً هم اکستریت هم ادوپرفیوم) — تک‌انتخابی
    options: {
      extraitDeParfum: "اکستریت د پرفیوم",
      parfum: "پرفیوم",
      eauDeParfum: "ادو پرفیوم",
      eauDeParfumIntense: "ادوپرفیوم اینتنس",
      eauDeToilette: "ادو تویلت",
      eauDeCologne: "ادو کلن",
      eauFraiche: "او فرش",
    },
  },
  {
    key: "temperament",
    group: "طبع",
    options: { cool: "خنک", warm: "گرم", moderate: "معتدل" },
  },
  {
    key: "fragranceNote",
    group: "گروه بویایی",
    options: {
      floral: "گلی",
      woody: "چوبی",
      amber: "آمبری",
      citrusy: "مرکباتی",
      fruity: "میوه‌ای",
      aromatic: "آروماتیک",
      spicy: "ادویه‌ای",
      gourmand: "گورماند",
      green: "سبز",
      aquatic: "دریایی",
      leather: "چرمی",
      chypre: "شیپر(شیپغ)",
      fougere: "فوژه",
      tobacco: "تنباکویی",
    },
  },
];

// ماندگاری و پخش بوی ادکلن — هر کدام یک مقدار تک‌انتخابی از این سه گزینه (نه بخشی از PERFUME_FACETS
// چون این‌ها فیلتر جستجو نیستند، بلکه فقط مشخصات نمایشی هر محصول‌اند)
const PERFUME_LONGEVITY_OPTIONS = { low: "کم", medium: "متوسط", high: "زیاد" };
const PERFUME_SILLAGE_OPTIONS = { low: "کم", medium: "متوسط", high: "زیاد" };

// ---------------------------------------------------------------------------------
// پایگاه‌دانشِ نت‌های عطر — هر نت به سه دسته نگاشت شده: حس رایحه (scentFamily)،
// طبع (temperament) و گروه بویایی (fragranceGroup). این نگاشت بر پایه‌ی طبقه‌بندی رایج
// در منابع معتبر عطرشناسی (مثل Fragrantica و Basenotes) از خانواده‌ها و آکوردهای هر نت
// ساخته شده و مبنای «پیشنهاد خودکار» در پنل مدیریت است. کلیدهای هر دسته باید دقیقاً با
// کلیدهای گزینه‌های PERFUME_FACETS یکی باشند.
// ---------------------------------------------------------------------------------
// نام هر نت را با فرم‌های نوشتاری رایج آن (فارسی یا انگلیسی) یکسان‌سازی می‌کند: فاصله‌های اضافه
// و خط‌تیره را یکی می‌کند، حروف عربی «ي»/«ك» را به فارسی «ی»/«ک» تبدیل می‌کند، و با تبدیل به
// حروف کوچک، تطبیق انگلیسی را مستقل از بزرگی/کوچکی حروف می‌کند (روی متن فارسی بی‌اثر است).
function normalizeNoteName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک");
}

// پایگاه‌دانشِ نت‌های عطر — هر نت (با نام‌های رایج فارسی و انگلیسی‌اش) به سه دسته نگاشت شده:
// حس رایحه (scentFamily)، طبع (temperament) و گروه بویایی (fragranceGroup). این نگاشت بر پایه‌ی
// طبقه‌بندی رایج در منابع معتبر عطرشناسی (مثل Fragrantica و Basenotes) از خانواده‌ها و آکوردهای
// هر نت ساخته شده و مبنای «پیشنهاد خودکار» در پنل مدیریت است. کلیدهای هر دسته باید دقیقاً با
// کلیدهای گزینه‌های PERFUME_FACETS یکی باشند.
// ---------------------------------------------------------------------------------
const NOTE_ENTRIES = [
  // — مرکبات و نت‌های تازه —
  { aliases: ["برگاموت", "bergamot"], scentFamily: ["fresh", "sour"], temperament: ["cool"], fragranceGroup: ["citrusy"] },
  { aliases: ["لیمو", "لمون", "lemon"], scentFamily: ["fresh", "sour"], temperament: ["cool"], fragranceGroup: ["citrusy"] },
  { aliases: ["لیمو ترش", "لایم", "lime"], scentFamily: ["fresh", "sour"], temperament: ["cool"], fragranceGroup: ["citrusy"] },
  { aliases: ["پرتقال", "orange", "sweet orange"], scentFamily: ["fresh", "sweet"], temperament: ["cool"], fragranceGroup: ["citrusy"] },
  { aliases: ["نارنج", "bitter orange"], scentFamily: ["fresh", "bitter"], temperament: ["cool"], fragranceGroup: ["citrusy"] },
  { aliases: ["گریپ‌فروت", "گریپ فروت", "گریپفروت", "grapefruit"], scentFamily: ["fresh", "sour"], temperament: ["cool"], fragranceGroup: ["citrusy"] },
  { aliases: ["ماندارین", "نارنگی", "mandarin", "tangerine"], scentFamily: ["fresh", "sweet"], temperament: ["cool"], fragranceGroup: ["citrusy"] },
  { aliases: ["یوزو", "yuzu"], scentFamily: ["fresh", "sour"], temperament: ["cool"], fragranceGroup: ["citrusy"] },
  { aliases: ["نرولی", "گل نارنج", "neroli", "orange blossom"], scentFamily: ["fresh", "soft"], temperament: ["cool"], fragranceGroup: ["floral", "citrusy"] },
  // — آروماتیک و گیاهی —
  { aliases: ["نعنا", "نعناع", "mint", "peppermint", "spearmint"], scentFamily: ["fresh", "clean"], temperament: ["cool"], fragranceGroup: ["aromatic"] },
  { aliases: ["ریحان", "basil"], scentFamily: ["fresh", "herbal"], temperament: ["cool"], fragranceGroup: ["aromatic"] },
  { aliases: ["اسطوخودوس", "لوندر", "اسطوخدوس", "lavender"], scentFamily: ["fresh", "clean", "herbal"], temperament: ["cool"], fragranceGroup: ["aromatic", "fougere"] },
  { aliases: ["مریم‌گلی", "مریم گلی", "clary sage", "sage"], scentFamily: ["herbal", "dry"], temperament: ["moderate"], fragranceGroup: ["aromatic"] },
  { aliases: ["رزماری", "اکلیل کوهی", "rosemary"], scentFamily: ["fresh", "herbal"], temperament: ["cool"], fragranceGroup: ["aromatic"] },
  { aliases: ["آویشن", "تیم", "thyme"], scentFamily: ["herbal", "dry"], temperament: ["moderate"], fragranceGroup: ["aromatic"] },
  { aliases: ["گالبانوم", "galbanum"], scentFamily: ["herbal", "bitter"], temperament: ["cool"], fragranceGroup: ["green"] },
  { aliases: ["چای سبز", "green tea"], scentFamily: ["fresh", "herbal"], temperament: ["cool"], fragranceGroup: ["green", "aromatic"] },
  { aliases: ["برگ سبز", "برگ‌های سبز", "green leaves", "leaves"], scentFamily: ["fresh", "herbal"], temperament: ["cool"], fragranceGroup: ["green"] },
  { aliases: ["علف", "چمن", "grass", "green grass"], scentFamily: ["fresh", "herbal"], temperament: ["cool"], fragranceGroup: ["green"] },
  { aliases: ["خیار", "cucumber"], scentFamily: ["fresh", "clean"], temperament: ["cool"], fragranceGroup: ["green", "aquatic"] },
  { aliases: ["شمعدانی", "geranium"], scentFamily: ["herbal"], temperament: ["moderate"], fragranceGroup: ["floral", "green"] },
  // — ادویه‌ای —
  { aliases: ["هل", "cardamom"], scentFamily: ["sharp", "fresh"], temperament: ["warm"], fragranceGroup: ["spicy"] },
  { aliases: ["زنجبیل", "ginger"], scentFamily: ["sharp", "dry"], temperament: ["warm"], fragranceGroup: ["spicy"] },
  { aliases: ["فلفل صورتی", "pink pepper"], scentFamily: ["sharp"], temperament: ["warm"], fragranceGroup: ["spicy"] },
  { aliases: ["فلفل سیاه", "فلفل", "black pepper", "pepper"], scentFamily: ["sharp", "dry"], temperament: ["warm"], fragranceGroup: ["spicy"] },
  { aliases: ["دارچین", "cinnamon"], scentFamily: ["sharp", "sweet"], temperament: ["warm"], fragranceGroup: ["spicy"] },
  { aliases: ["میخک", "clove"], scentFamily: ["sharp"], temperament: ["warm"], fragranceGroup: ["spicy"] },
  { aliases: ["زیره", "cumin"], scentFamily: ["earthy", "bitter"], temperament: ["warm"], fragranceGroup: ["spicy"] },
  { aliases: ["زعفران", "saffron"], scentFamily: ["earthy", "leathery"], temperament: ["warm"], fragranceGroup: ["spicy"] },
  { aliases: ["جوز هندی", "جوزهندی", "nutmeg"], scentFamily: ["sharp"], temperament: ["warm"], fragranceGroup: ["spicy"] },
  // — میوه‌ای —
  { aliases: ["میوه‌های قرمز", "میوه های قرمز", "red fruits", "red berries"], scentFamily: ["sweet", "fresh"], temperament: ["cool"], fragranceGroup: ["fruity"] },
  { aliases: ["توت فرنگی", "strawberry"], scentFamily: ["sweet"], temperament: ["moderate"], fragranceGroup: ["fruity"] },
  { aliases: ["هلو", "peach"], scentFamily: ["sweet", "soft"], temperament: ["moderate"], fragranceGroup: ["fruity"] },
  { aliases: ["سیب", "apple"], scentFamily: ["fresh", "sweet"], temperament: ["cool"], fragranceGroup: ["fruity"] },
  { aliases: ["گلابی", "pear"], scentFamily: ["sweet", "soft"], temperament: ["moderate"], fragranceGroup: ["fruity"] },
  { aliases: ["آناناس", "pineapple"], scentFamily: ["sweet", "fresh"], temperament: ["cool"], fragranceGroup: ["fruity"] },
  { aliases: ["انبه", "مانگو", "mango"], scentFamily: ["sweet", "creamy"], temperament: ["warm"], fragranceGroup: ["fruity"] },
  { aliases: ["انار", "pomegranate"], scentFamily: ["sweet", "sour"], temperament: ["cool"], fragranceGroup: ["fruity"] },
  { aliases: ["ریبس سیاه", "کشمش سیاه", "blackcurrant", "black currant", "cassis"], scentFamily: ["sweet", "sour"], temperament: ["cool"], fragranceGroup: ["fruity"] },
  { aliases: ["انجیر", "fig"], scentFamily: ["sweet", "soft"], temperament: ["moderate"], fragranceGroup: ["fruity", "green"] },
  { aliases: ["آلو", "plum"], scentFamily: ["sweet", "soft"], temperament: ["moderate"], fragranceGroup: ["fruity"] },
  // — گلی —
  { aliases: ["گل رز", "رز", "گل سرخ", "rose"], scentFamily: ["sweet", "soft"], temperament: ["moderate"], fragranceGroup: ["floral"] },
  { aliases: ["یاس", "گل یاس", "jasmine"], scentFamily: ["sweet", "soft"], temperament: ["moderate"], fragranceGroup: ["floral"] },
  { aliases: ["عثمانتوس", "osmanthus"], scentFamily: ["sweet", "soft"], temperament: ["moderate"], fragranceGroup: ["floral", "fruity"] },
  { aliases: ["یلانگ یلانگ", "یلانگ‌یلانگ", "ylang ylang", "ylang-ylang"], scentFamily: ["sweet", "creamy"], temperament: ["warm"], fragranceGroup: ["floral"] },
  { aliases: ["گاردنیا", "gardenia"], scentFamily: ["creamy", "soft"], temperament: ["moderate"], fragranceGroup: ["floral"] },
  { aliases: ["نیلوفر آبی", "لوتوس", "lotus", "water lily"], scentFamily: ["clean", "fresh", "soft"], temperament: ["cool"], fragranceGroup: ["floral", "aquatic"] },
  { aliases: ["بنفشه", "violet"], scentFamily: ["powdery", "soft"], temperament: ["moderate"], fragranceGroup: ["floral"] },
  { aliases: ["ماگنولیا", "magnolia"], scentFamily: ["fresh", "soft"], temperament: ["moderate"], fragranceGroup: ["floral"] },
  { aliases: ["زنبق", "ایریس", "orris", "iris"], scentFamily: ["powdery", "dry"], temperament: ["moderate"], fragranceGroup: ["floral"] },
  { aliases: ["گل مریم", "توبروز", "tuberose"], scentFamily: ["sweet", "creamy"], temperament: ["warm"], fragranceGroup: ["floral"] },
  { aliases: ["سنبل", "موگه", "muguet", "lily of the valley"], scentFamily: ["fresh", "soft", "clean"], temperament: ["cool"], fragranceGroup: ["floral"] },
  { aliases: ["گل صدپر", "پیونی", "peony"], scentFamily: ["sweet", "soft"], temperament: ["moderate"], fragranceGroup: ["floral"] },
  { aliases: ["فریزیا", "freesia"], scentFamily: ["fresh", "soft"], temperament: ["cool"], fragranceGroup: ["floral"] },
  { aliases: ["میموزا", "mimosa"], scentFamily: ["sweet", "powdery"], temperament: ["moderate"], fragranceGroup: ["floral"] },
  // — چوبی —
  { aliases: ["صندل", "چوب صندل", "sandalwood", "sandal wood"], scentFamily: ["creamy", "soft", "musky"], temperament: ["warm"], fragranceGroup: ["woody"] },
  { aliases: ["چوب گایاک", "گایاک", "guaiac wood", "guaiacwood"], scentFamily: ["smoky", "dry", "resinous"], temperament: ["warm"], fragranceGroup: ["woody"] },
  { aliases: ["سدر", "چوب سدر", "cedar", "cedarwood"], scentFamily: ["dry", "resinous"], temperament: ["moderate"], fragranceGroup: ["woody"] },
  { aliases: ["وتیور", "vetiver"], scentFamily: ["earthy", "dry"], temperament: ["moderate"], fragranceGroup: ["woody"] },
  { aliases: ["عود", "چوب عود", "oud", "agarwood", "aoud", "oudh"], scentFamily: ["smoky", "resinous", "earthy"], temperament: ["warm"], fragranceGroup: ["woody", "amber"] },
  { aliases: ["پچولی", "patchouli"], scentFamily: ["earthy", "dry"], temperament: ["warm"], fragranceGroup: ["woody", "chypre"] },
  { aliases: ["بلوط", "oak", "oakwood"], scentFamily: ["dry", "resinous"], temperament: ["moderate"], fragranceGroup: ["woody"] },
  { aliases: ["سرو", "cypress"], scentFamily: ["fresh", "dry"], temperament: ["cool"], fragranceGroup: ["woody"] },
  { aliases: ["کاج", "pine"], scentFamily: ["fresh", "resinous"], temperament: ["cool"], fragranceGroup: ["woody"] },
  // — عنبری و رزینی —
  { aliases: ["عنبر", "کهربا", "amber", "ambergris"], scentFamily: ["sweet", "resinous", "musky"], temperament: ["warm"], fragranceGroup: ["amber"] },
  { aliases: ["نت‌های بالزامیک", "بالزامیک", "balsamic", "balsam"], scentFamily: ["resinous", "sweet"], temperament: ["warm"], fragranceGroup: ["amber"] },
  { aliases: ["بنزوئین", "benzoin"], scentFamily: ["sweet", "resinous"], temperament: ["warm"], fragranceGroup: ["amber"] },
  { aliases: ["لابدانوم", "labdanum"], scentFamily: ["resinous", "leathery"], temperament: ["warm"], fragranceGroup: ["amber", "chypre"] },
  { aliases: ["کندر", "frankincense", "olibanum", "incense"], scentFamily: ["resinous", "smoky"], temperament: ["warm"], fragranceGroup: ["amber"] },
  { aliases: ["مورّ", "مور", "myrrh"], scentFamily: ["resinous", "bitter"], temperament: ["warm"], fragranceGroup: ["amber"] },
  // — گورماند و شیرین —
  { aliases: ["وانیل", "vanilla"], scentFamily: ["sweet", "creamy"], temperament: ["warm"], fragranceGroup: ["gourmand"] },
  { aliases: ["شکلات", "کاکائو", "chocolate", "cacao", "cocoa"], scentFamily: ["sweet", "creamy"], temperament: ["warm"], fragranceGroup: ["gourmand"] },
  { aliases: ["قهوه", "coffee"], scentFamily: ["bitter", "smoky"], temperament: ["warm"], fragranceGroup: ["gourmand"] },
  { aliases: ["عسل", "honey"], scentFamily: ["sweet", "soft"], temperament: ["warm"], fragranceGroup: ["gourmand"] },
  { aliases: ["کارامل", "caramel"], scentFamily: ["sweet", "creamy"], temperament: ["warm"], fragranceGroup: ["gourmand"] },
  { aliases: ["بادام", "almond"], scentFamily: ["sweet", "creamy"], temperament: ["moderate"], fragranceGroup: ["gourmand"] },
  { aliases: ["نارگیل", "coconut"], scentFamily: ["creamy", "sweet"], temperament: ["warm"], fragranceGroup: ["gourmand", "aquatic"] },
  { aliases: ["توتکا", "لوبیای تونکا", "tonka bean", "tonka"], scentFamily: ["sweet", "creamy"], temperament: ["warm"], fragranceGroup: ["gourmand"] },
  { aliases: ["پرالین", "praline"], scentFamily: ["sweet", "creamy"], temperament: ["warm"], fragranceGroup: ["gourmand"] },
  // — مشکی، چرمی، توتون —
  { aliases: ["مشک", "musk"], scentFamily: ["musky", "soft"], temperament: ["warm"], fragranceGroup: ["amber"] },
  { aliases: ["تنباکو", "توتون", "tobacco"], scentFamily: ["sweet", "smoky"], temperament: ["warm"], fragranceGroup: ["tobacco"] },
  { aliases: ["چرم", "leather"], scentFamily: ["leathery", "smoky"], temperament: ["warm"], fragranceGroup: ["leather"] },
  { aliases: ["زباد", "civet"], scentFamily: ["musky", "bitter"], temperament: ["warm"], fragranceGroup: ["amber"] },
  { aliases: ["کاستوریوم", "castoreum"], scentFamily: ["leathery", "musky"], temperament: ["warm"], fragranceGroup: ["leather", "amber"] },
  // — دریایی —
  { aliases: ["نت‌های دریایی", "نت دریایی", "marine notes", "sea notes", "ozone", "ozonic"], scentFamily: ["aquatic", "fresh"], temperament: ["cool"], fragranceGroup: ["aquatic"] },
  { aliases: ["نمک دریا", "sea salt"], scentFamily: ["aquatic", "fresh"], temperament: ["cool"], fragranceGroup: ["aquatic"] },
  { aliases: ["باران", "rain", "rain accord"], scentFamily: ["fresh", "clean"], temperament: ["cool"], fragranceGroup: ["aquatic"] },
  // — خزه‌ای و صابونی —
  { aliases: ["خزه بلوط", "خزه‌ی بلوط", "oakmoss", "moss"], scentFamily: ["mossy", "earthy"], temperament: ["moderate"], fragranceGroup: ["chypre"] },
  { aliases: ["آلدهید", "آلدئید", "aldehyde", "aldehydes"], scentFamily: ["soapy", "clean"], temperament: ["cool"], fragranceGroup: ["aromatic"] },
  { aliases: ["پودر", "پودری", "powder"], scentFamily: ["powdery", "soft"], temperament: ["moderate"], fragranceGroup: ["floral"] },
];

// نقشه‌ی مسطحِ نام‌های نرمال‌شده به آیتم مربوطه‌شان — یک‌بار در زمان بارگذاری ماژول ساخته می‌شود
// تا جست‌وجوی هر نت در زمان اجرا فقط یک lookup ساده باشد.
const NOTE_ALIAS_MAP = NOTE_ENTRIES.reduce((map, entry) => {
  entry.aliases.forEach((alias) => {
    map[normalizeNoteName(alias)] = entry;
  });
  return map;
}, {});

// از روی نت‌های آغازین/میانی/پایه‌ی وارد‌شده (فارسی یا انگلیسی، با هر تعداد نت در هر آکورد)،
// محتمل‌ترین گزینه‌های «حس رایحه»، «طبع» و «گروه بویایی» را با شمارش فراوانی برچسب‌های
// نگاشت‌شده‌ی هر نت پیشنهاد می‌دهد. نتیجه هرگز چیزی را قفل نمی‌کند — فقط مقدار اولیه‌ی facets
// را پر می‌کند و مدیر می‌تواند هر گزینه را دستی عوض کند.
// نام‌های رایج برندهای عطر به فارسی (آوانویسی رایج) — برای وقتی داده از fraganty.ai (انگلیسی) می‌آید.
// اگر برندی در این لیست نباشد، همان نام انگلیسی به‌عنوان جایگزین نگه داشته می‌شود.
const BRAND_FA_MAP = {
  chanel: "شنل", dior: "دیور", "christian dior": "دیور", gucci: "گوچی", versace: "ورساچه",
  armani: "آرمانی", "giorgio armani": "جورجو آرمانی", "yves saint laurent": "ایو سن لوران", ysl: "ایو سن لوران",
  lalique: "لالیک", "tom ford": "تام فورد", prada: "پرادا", burberry: "بربری", hermes: "هرمس",
  "hermès": "هرمس", dolce: "دولچه و گابانا", "dolce & gabbana": "دولچه و گابانا", d_g: "دولچه و گابانا",
  lancome: "لانکوم", "lancôme": "لانکوم", guerlain: "گرلن", givenchy: "ژیوانشی", bvlgari: "بولگاری",
  bulgari: "بولگاری", "calvin klein": "کلوین کلاین", ck: "کلوین کلاین", montblanc: "مون‌بلان",
  paco: "پاکو رابان", "paco rabanne": "پاکو رابان", valentino: "والنتینو", jimmy: "جیمی چو",
  "jimmy choo": "جیمی چو", "jean paul gaultier": "ژان پل گوتیه", "narciso rodriguez": "نارسیسو رودریگز",
  azzaro: "آزارو", carolina: "کارولینا هررا", "carolina herrera": "کارولینا هررا", chloe: "کلویی",
  "chloé": "کلویی", davidoff: "داویدوف", elie: "الی صعب", "elie saab": "الی صعب", cartier: "کارتیه",
  hugoboss: "هوگو باس", "hugo boss": "هوگو باس", lacoste: "لاگوست", montale: "مونتاله",
  "mancera": "مانسرا", "xerjoff": "زرجوف", "creed": "کرید", "amouage": "آمواج", "parfums de marly": "پارفومز دو مارلی",
  "maison francis kurkdjian": "مزون فرانسیس کرکجان", mfk: "مزون فرانسیس کرکجان",
  "initio": "اینیشیو", "byredo": "بایردو", "acqua di parma": "آکوا دی پارما", "diptyque": "دیپتیک",
  "victoria's secret": "ویکتوریا سکرت", zara: "زارا", rasasi: "رصاصی", "lattafa": "لطافه",
  "afnan": "افنان", ajmal: "اجمل", "al haramain": "الحرمین",
};

// نام برند انگلیسی که از fraganty.ai می‌آید را در صورت وجود در لیست بالا، به فارسی برمی‌گرداند؛
// وگرنه همان نام اصلی را نگه می‌دارد (بهتر از خالی‌گذاشتن است، مدیر خودش دستی اصلاح می‌کند).
function translateBrandToFa(brandEn) {
  if (!brandEn) return "";
  const key = brandEn.trim().toLowerCase();
  return BRAND_FA_MAP[key] || brandEn;
}

// نام یک نت که از fraganty.ai به انگلیسی می‌آید را با پایگاه‌دانش نت‌های خودمان (NOTE_ALIAS_MAP)
// به فارسی ترجمه می‌کند — از میان تمام نام‌های مترادفِ ثبت‌شده برای همان نت، اولین موردی که فارسی
// باشد انتخاب می‌شود. اگر نت در پایگاه‌دانش نباشد، همان نام انگلیسی اصلی نگه داشته می‌شود.
function translateNoteToFa(noteNameEn) {
  const entry = NOTE_ALIAS_MAP[normalizeNoteName(noteNameEn)];
  if (!entry) return noteNameEn;
  const faAlias = entry.aliases.find((a) => /[\u0600-\u06FF]/.test(a));
  return faAlias || noteNameEn;
}

// آرایه‌ای از نت‌های fraganty.ai (مثل [{name:"Lemon"}, ...]) را به یک رشته‌ی فارسی با ویرگول جدا می‌کند.
function translateNotesArrayToFa(notesArr) {
  if (!Array.isArray(notesArr) || notesArr.length === 0) return "";
  return notesArr.map((n) => translateNoteToFa(n.name || n)).join("، ");
}

// رشته‌ی آزاد «غلظت» که هوش مصنوعی برمی‌گرداند (مثلاً "Eau de Parfum") را به کلید داخلی
// گزینه‌های PERFUME_FACETS.concentration نگاشت می‌کند.
function mapConcentrationLabelToKey(label) {
  if (!label) return null;
  const s = label.trim().toLowerCase();
  if (s.includes("extrait")) return "extraitDeParfum";
  if (s.includes("eau de parfum intense") || s.includes("edp intense")) return "eauDeParfumIntense";
  if (s.includes("eau de parfum") || s === "edp") return "eauDeParfum";
  if (s.includes("eau de toilette") || s === "edt") return "eauDeToilette";
  if (s.includes("eau de cologne") || s === "edc") return "eauDeCologne";
  if (s.includes("eau fraiche") || s.includes("eau fraîche")) return "eauFraiche";
  if (s.includes("parfum")) return "parfum";
  return null;
}

function inferPerfumeFacetsFromNotes(topNotes, middleNotes, baseNotes) {
  const allNotes = [topNotes, middleNotes, baseNotes]
    .filter(Boolean)
    .join("،")
    .split(/[,،]/)
    .map((n) => n.trim())
    .filter(Boolean);

  const matched = [];
  const unmatched = [];
  const counts = { scentFamily: {}, temperament: {}, fragranceGroup: {} };

  allNotes.forEach((noteRaw) => {
    const entry = NOTE_ALIAS_MAP[normalizeNoteName(noteRaw)];
    if (!entry) {
      unmatched.push(noteRaw);
      return;
    }
    matched.push(noteRaw);
    (entry.scentFamily || []).forEach((k) => { counts.scentFamily[k] = (counts.scentFamily[k] || 0) + 1; });
    (entry.temperament || []).forEach((k) => { counts.temperament[k] = (counts.temperament[k] || 0) + 1; });
    (entry.fragranceGroup || []).forEach((k) => { counts.fragranceGroup[k] = (counts.fragranceGroup[k] || 0) + 1; });
  });

  function topKeys(countObj, max) {
    return Object.entries(countObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, max)
      .map(([k]) => k);
  }

  return {
    scentFamily: topKeys(counts.scentFamily, 4),
    temperament: topKeys(counts.temperament, 2),
    fragranceNote: topKeys(counts.fragranceGroup, 4),

    matchedCount: matched.length,
    totalCount: allNotes.length,
    unmatched,
  };
}

const CATEGORIES = {
  perfume: {
    label: "ادکلن",
    subcategories: {
      menPerfume: { label: "ادکلن مردانه", types: PERFUME_FACETS },
      womenPerfume: { label: "ادکلن زنانه", types: PERFUME_FACETS },
      unisexPerfume: { label: "ادکلن یونیسکس", types: PERFUME_FACETS },
      kidsPerfume: { label: "ادکلن بچگانه", types: PERFUME_FACETS },
      sample: { label: "سمپل", types: PERFUME_FACETS },
      tester: { label: "تستر", types: PERFUME_FACETS },
      miniature: { label: "مینیاتوری", types: PERFUME_FACETS },
      giftSet: { label: "گیفت ست", types: PERFUME_FACETS },
      decant: { label: "دکانت (دست‌ریز)", types: PERFUME_FACETS },
    },
  },
  sprayAndSplash: {
    label: "اسپری و بادی اسپلش",
    subcategories: {
      menSpray: "اسپری خوشبو‌کننده مردانه",
      womenSpray: "اسپری خوشبو‌کننده زنانه",
      menBodySplash: "بادی اسپلش مردانه",
      womenBodySplash: "بادی اسپلش زنانه",
    },
  },
  makeup: {
    label: "آرایشی",
    subcategories: {
      face: {
        label: "صورت",
        types: [
          {
            key: "faceBase",
            group: "صورت",
            options: {
              primer: "پرایمر",
              concealer: "کانسیلر",
              foundation: "کرم پودر",
              blush: "رژگونه",
              highlighter: "هایلایتر",
              powder: "پودر",
              contour: "کانتور و برنزر",
              settingSpray: "اسپری تثبیت‌کننده",
            },
          },
          {
            key: "eyeArea",
            group: "چشم",
            options: {
              eyebrow: "ابرو",
              eyeshadow: "سایه چشم",
              glitter: "اکلیل",
              mascara: "ریمل",
              eyeliner: "خط چشم",
              eyePencil: "مداد چشم",
            },
          },
          {
            key: "lipArea",
            group: "لب",
            options: {
              lipstick: "رژ لب",
              gloss: "برق لب",
              liner: "خط لب",
              liquidLipstick: "رژ لب مایع",
              tint: "رنگ لب",
              lipCare: "مراقبت از لب",
              lipSet: "ست لب",
            },
          },
          {
            key: "accessoryArea",
            group: "ابزارهای زیبایی",
            options: {
              brushes: "برس‌ها",
              spongeTools: "اسفنج و ابزار",
              lashes: "مژه‌ها",
            },
          },
        ],
      },
      body: "بدن",
      hair: {
        label: "مو",
        types: {
          menHairColor: "رنگ مو آقایان",
          hairColor: "رنگ مو",
          colorShampoo: "شامپو رنگ",
          hairMousseMeshSpray: "موس و اسپری مش مو",
          hairStylingMousse: "موس حالت دهنده مو",
          hairStylingSpray: "اسپری حالت دهنده مو",
          hairGlueSpray: "اسپری چسب مو",
          hairWax: "واکس مو",
          hairCream: "کرم مو",
          hairGel: "ژل مو",
        },
      },
    },
  },
  hygiene: {
    label: "بهداشتی",
    subcategories: {
      hairCare: {
        label: "مراقبت از موی سر و ابرو و مژه",
        types: {
          shampoo: "شامپو موی سر",
          conditionerShampoo: "شامپو نرم‌کننده موی سر",
          dryShampoo: "شامپو خشک",
          hairMaskRinse: "ماسک مو با آبکشی",
          hairMaskNoRinse: "ماسک مو بدون آبکشی",
          twoPhaseSpray: "اسپری احیاکننده دوفاز",
          arganSerum: "انواع سرم آرگان و غیره",
          antiDandruffSerum: "سرم ضد شوره و خارش موی سر",
          antiHairLossTonic: "سرم و تونیک ضد ریزش موی سر",
          antiHairLossPill: "قرص ضد ریزش موی سر",
          hairCocktail: "کوکتل تقویت موی سر",
          eyebrowSerum: "سرم تقویت ابرو",
          eyelashSerum: "سرم تقویت مژه",
        },
      },
      faceSkin: {
        label: "مراقبت از پوست صورت",
        types: {
          antiWrinkleFace: "ضدچروک صورت",
          antiWrinkleEye: "ضدچروک دورچشم",
          antiSpotFace: "ضدلک صورت",
          antiSpotEye: "ضدلک دورچشم",
          poreMinimizer: "جمع‌کننده منافذ پوست",
          exfoliatorFace: "لایه‌بردار صورت",
          repairFace: "ترمیم‌کننده صورت",
          hydratingFace: "آبرسان صورت",
          moisturizerFace: "مرطوب‌کننده صورت",
          sunscreen: "ضدآفتاب",
          faceWash: "فیس واش",
          oilCleanser: "پاک‌کننده روغنی",
          scrub: "اسکراب",
          micellarWater: "میسلار",
          toner: "تونر",
          lipBalm: "بالم لب",
        },
      },
      bodySkin: {
        label: "مراقبت از پوست بدن",
        types: {
          bodyShampoo: "شامپو بدن",
          bodyLotion: "لوسیون بدن",
          bodyOil: "روغن بدن",
          bodyShimmerOil: "روغن شیمر بدن",
          handCream: "کرم مرطوب‌کننده دست",
          heelCrackCream: "کرم ترک پا",
        },
      },
      oral: {
        label: "مراقبت از دهان و دندان",
        types: {
          toothbrush: "مسواک",
          toothpaste: "خمیردندان",
          mouthwash: "دهان‌شویه",
          dentalFloss: "نخ دندان",
        },
      },
      feminine: "بهداشت شخصی بانوان",
      masculine: "بهداشت شخصی آقایان",
    },
  },
  electronics: {
    label: "لوازم برقی شخصی",
    subcategories: { hair: "مو", body: "بدن", face: "صورت" },
  },
};

// این دو شاخه از منوی کشویی (همبرگری) قابل ناوبری‌اند، اما تب‌های زیرشاخه روی خودِ صفحه‌ی
// محصولات نمایش داده نمی‌شوند (طبق درخواست: زیرشاخه فقط از مسیر منو در دسترس باشد).
const CATEGORIES_WITHOUT_PAGE_SUBCATEGORY_PILLS = ["sprayAndSplash", "electronics"];

const CATEGORY_LABEL = Object.fromEntries(
  Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])
);

const CATEGORY_ORDER = Object.keys(CATEGORIES);

const CATEGORY_CARD_CLASS = {
  perfume: "card-perfume-blue",
  sprayAndSplash: "card-perfume",
  makeup: "card-beauty",
  hygiene: "card-hygiene",
  electronics: "card-electronics",
};

// زیرشاخه‌ها یا به‌صورت ساده (رشته) هستند یا تودرتو (شیء با label و types) — این کمک‌تابع‌ها هر دو حالت را پشتیبانی می‌کنند.
function isNestedSubcategory(sub) {
  return sub && typeof sub === "object";
}

function subcategoryLabel(category, subcategory) {
  const cat = CATEGORIES[category];
  if (!cat || !cat.subcategories || !subcategory) return "";
  const sub = cat.subcategories[subcategory];
  if (!sub) return "";
  return isNestedSubcategory(sub) ? sub.label : sub;
}

function subcategoryTypes(category, subcategory) {
  const cat = CATEGORIES[category];
  if (!cat || !cat.subcategories || !subcategory) return null;
  const sub = cat.subcategories[subcategory];
  return isNestedSubcategory(sub) && sub.types ? sub.types : null;
}

// انواع دقیق یا به‌صورت یک لیست ساده (شیء) هستند، یا به‌صورت چند گروه موازی (آرایه‌ای از { group, options }) — مثل ادکلن.
function isGroupedTypes(types) {
  return Array.isArray(types);
}

function flattenTypes(types) {
  if (!types) return {};
  if (isGroupedTypes(types)) {
    return Object.assign({}, ...types.map((g) => g.options));
  }
  return types;
}

function typeLabel(category, subcategory, type) {
  const types = subcategoryTypes(category, subcategory);
  if (!types || !type) return "";
  return flattenTypes(types)[type] || "";
}

// برای زیرشاخه‌هایی مثل ادکلن که چند گروه فیلتر مستقل دارند (دسته بویایی/نوع/طبع/رایحه)،
// این تابع برچسب‌های انتخاب‌شده‌ی هر گروه را برای نمایش روی کارت محصول به هم می‌چسباند.
function facetsSummary(category, subcategory, facets) {
  const types = subcategoryTypes(category, subcategory);
  if (!types || !isGroupedTypes(types) || !facets) return "";
  return types
    .map((g) => {
      const vals = facets[g.key];
      if (!vals || (Array.isArray(vals) && vals.length === 0)) return null;
      const arr = Array.isArray(vals) ? vals : [vals];
      const labels = arr.map((v) => g.options[v]).filter(Boolean);
      return labels.length ? labels.join("/") : null;
    })
    .filter(Boolean)
    .join(" · ");
}

// برچسب‌های انتخاب‌شده‌ی فقط یک گروه فیلتر خاص (مثلاً فقط «طبع») را برمی‌گرداند — برای نمایش
// جداگانه‌ی هر مشخصه در صفحه‌ی اختصاصی محصول (برخلاف facetsSummary که همه‌ی گروه‌ها را با هم می‌چسباند)
function facetGroupValues(category, subcategory, groupKey, facets) {
  const types = subcategoryTypes(category, subcategory);
  if (!types || !isGroupedTypes(types) || !facets) return "";
  const group = types.find((g) => g.key === groupKey);
  if (!group) return "";
  const vals = facets[groupKey];
  if (!vals) return "";
  const arr = Array.isArray(vals) ? vals : [vals];
  return arr.map((v) => group.options[v]).filter(Boolean).join("، ");
}

function fmtPrice(n) {
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

// اگر محصول تخفیف اختصاصی داشته باشد همان اعمال می‌شود؛ در غیر این صورت تخفیف همگانی (مثلاً بلک‌فرایدی) اعمال می‌شود.
function effectiveDiscountPercent(product, globalDiscountPercent) {
  const own = Number(product?.discountPercent);
  if (Number.isFinite(own) && own > 0) return Math.min(own, 90);
  const g = Number(globalDiscountPercent);
  if (Number.isFinite(g) && g > 0) return Math.min(g, 90);
  return 0;
}

// بنرهای صفحه‌ی اصلی ممکن است رشته (لینک عکس، فرمت قدیمی) یا شیء { type: 'image'|'video', url } باشند.
// این تابع همیشه یک شیء استاندارد برمی‌گرداند تا کدهای بعدی مجبور نباشند دو حالت را جدا مدیریت کنند.
function normalizeBanner(item) {
  const base = { type: "image", url: "", imageFit: "cover", imagePosX: 50, imagePosY: 50, imageZoom: 1 };
  if (typeof item === "string") return { ...base, url: item };
  if (item && typeof item === "object" && item.url) {
    return {
      type: item.type === "video" ? "video" : "image",
      url: item.url,
      imageFit: item.imageFit === "contain" ? "contain" : "cover",
      imagePosX: Number.isFinite(Number(item.imagePosX)) ? Number(item.imagePosX) : 50,
      imagePosY: Number.isFinite(Number(item.imagePosY)) ? Number(item.imagePosY) : 50,
      imageZoom: Number.isFinite(Number(item.imageZoom)) && Number(item.imageZoom) > 0 ? Number(item.imageZoom) : 1,
    };
  }
  return base;
}

// بنر یک زیرشاخه‌ی خاص را برمی‌گرداند؛ اگر آن زیرشاخه بنر اختصاصی نداشته باشد، بنر کل دسته
// (در صورت وجود) به‌جایش برگردانده می‌شود؛ اگر هیچ‌کدام نباشد null برمی‌گردد (بدون بنر).
// بنر «مقصد نهایی» مسیر منو را برمی‌گرداند — سه سطح، از خاص به عام:
// ۱) دسته:زیرشاخه:نوع (مثلاً makeup:face:concealer — دقیقاً همان صفحه‌ای که مشتری با انتخاب
//    «کانسیلر» از منو به آن می‌رسد و محصولات را با برندهای مختلف می‌بیند و می‌خرد)
// ۲) دسته:زیرشاخه (وقتی نوع خاصی انتخاب نشده، مثلاً «همه‌ی صورت» یا برای ادکلن که خودِ زیرشاخه مقصد نهایی است)
// ۳) کل دسته (fallback عمومی وقتی هیچ‌کدام از موارد بالا تنظیم نشده باشد)
function resolveCategoryBanner(categoryBanners, category, subcategory, type) {
  if (!categoryBanners || !category || category === "all") return null;
  const typeKey = subcategory && subcategory !== "all" && type && type !== "all" ? `${category}:${subcategory}:${type}` : null;
  const subKey = subcategory && subcategory !== "all" ? `${category}:${subcategory}` : null;
  if (typeKey && categoryBanners[typeKey]) return normalizeBanner(categoryBanners[typeKey]);
  if (subKey && categoryBanners[subKey]) return normalizeBanner(categoryBanners[subKey]);
  if (categoryBanners[category]) return normalizeBanner(categoryBanners[category]);
  return null;
}

function discountedPrice(product, globalDiscountPercent) {
  const pct = effectiveDiscountPercent(product, globalDiscountPercent);
  if (pct <= 0) return product.price;
  return Math.round((product.price * (1 - pct / 100)) / 10) * 10;
}

// تنظیمات دستی نمایش تصویر محصول (که در پنل مدیریت قابل تغییرند): حالت جا‌گیری (contain/cover)،
// موقعیت افقی/عمودی تصویر داخل کادر و میزان بزرگ‌نمایی. اگر محصول این تنظیمات را نداشته باشد
// (محصولات قدیمی)، مقادیر پیش‌فرض قبلی (contain، وسط‌چین، بدون زوم) اعمال می‌شود.
function productImageStyle(product) {
  const fit = product?.imageFit === "cover" ? "cover" : "contain";
  const posX = Number.isFinite(Number(product?.imagePosX)) ? Number(product.imagePosX) : 50;
  const posY = Number.isFinite(Number(product?.imagePosY)) ? Number(product.imagePosY) : 50;
  const zoom = Number.isFinite(Number(product?.imageZoom)) && Number(product.imageZoom) > 0 ? Number(product.imageZoom) : 1;
  return {
    width: "100%",
    height: "100%",
    objectFit: fit,
    objectPosition: `${posX}% ${posY}%`,
    transform: zoom !== 1 ? `scale(${zoom})` : undefined,
    transformOrigin: `${posX}% ${posY}%`,
  };
}

// اگر آدرس تصویر روی Cloudinary خودمان میزبانی شده باشد (چه از آپلود مستقیم از گالری، چه از
// شناسایی هوشمند بارکد که سمت سرور روی همین Cloudinary بارگذاری می‌شود)، این تابع با تبدیل‌های
// خودِ Cloudinary — بدون هیچ سرویس یا هزینه‌ی اضافه — حاشیه‌ی یکنواخت اضافه‌ی دور عکس را خودکار
// می‌بُرد (e_trim) و عکس را داخل یک قاب مربعیِ با پس‌زمینه‌ی سفیدِ یکپارچه قرار می‌دهد (c_pad,b_white)
// تا مستقل از اینکه عکس اصلی چه اندازه/نسبتی داشته یا پس‌زمینه‌اش چه رنگی بوده، همیشه با یک قاب
// تمیز و یکسان در کارت/صفحه‌ی محصول نمایش داده شود. روی لینک‌های خارجیِ غیر Cloudinary (مثلاً وقتی
// مدیر مستقیم لینک عکس را می‌چسباند) بی‌اثر است و همان لینک اصلی بدون تغییر برگردانده می‌شود.
function framedProductImageUrl(url, size = 1000) {
  if (!url || typeof url !== "string") return url;
  const marker = "/upload/";
  const idx = url.indexOf(marker);
  if (!url.includes("res.cloudinary.com") || idx === -1) return url;
  const transform = `e_trim:10,c_pad,b_white,w_${size},h_${size},q_auto:good,f_auto`;
  return url.slice(0, idx + marker.length) + transform + "/" + url.slice(idx + marker.length);
}

// برای نمایش قیمت با جداکننده‌ی هزارگان (۳ رقم ۳ رقم) حین تایپ در پنل مدیریت
function formatPriceInput(digitsStr) {
  if (!digitsStr) return "";
  const n = Number(digitsStr);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("en-US");
}

const PERSIAN_ONES = ["", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه"];
const PERSIAN_TEENS = ["ده", "یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
const PERSIAN_TENS = ["", "ده", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const PERSIAN_HUNDREDS = ["", "صد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشتصد", "نهصد"];
const PERSIAN_SCALES = ["", "هزار", "میلیون", "میلیارد", "تریلیون"];

function threeDigitToPersianWords(n) {
  if (n === 0) return "";
  const parts = [];
  const h = Math.floor(n / 100);
  const rem = n % 100;
  if (h > 0) parts.push(PERSIAN_HUNDREDS[h]);
  if (rem > 0) {
    if (rem < 10) parts.push(PERSIAN_ONES[rem]);
    else if (rem < 20) parts.push(PERSIAN_TEENS[rem - 10]);
    else {
      const t = Math.floor(rem / 10);
      const o = rem % 10;
      parts.push(o === 0 ? PERSIAN_TENS[t] : `${PERSIAN_TENS[t]} و ${PERSIAN_ONES[o]}`);
    }
  }
  return parts.join(" و ");
}

// عدد را به حروف فارسی تبدیل می‌کند — برای نمایش مبلغ به حروف حین وارد کردن قیمت در پنل مدیریت
function numberToPersianWords(value) {
  let num = Math.floor(Number(value) || 0);
  if (num === 0) return "صفر";
  if (num < 0) return `منفی ${numberToPersianWords(-num)}`;

  const groups = [];
  let n = num;
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const groupWords = threeDigitToPersianWords(groups[i]);
    const scale = PERSIAN_SCALES[i];
    parts.push(scale ? `${groupWords} ${scale}` : groupWords);
  }
  return parts.join(" و ");
}

function isAdminUser(user) {
  return !!user && typeof user.email === "string" && user.email.toLowerCase() === ADMIN_EMAIL;
}

const CATEGORY_ICON_COLOR = {
  perfume: "#FF3E8E",
  sprayAndSplash: "#FF6FA5",
  makeup: "#D97706",
  hairStyling: "#16A34A",
  hygiene: "#0EA5A4",
  electronics: "#7B5CF6",
};

function CategoryIcon({ category, size = 34 }) {
  const c = CATEGORY_ICON_COLOR[category] || "#7B5CF6";

  if (category === "perfume") {
    return (
      <span style={{ position: "relative", display: "inline-flex", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="18" y="4" width="12" height="7" rx="2" fill={c} opacity="0.9" />
          <path d="M14 15a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v21a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V15Z" fill={c} opacity="0.18" stroke={c} strokeWidth="1.8" />
          <path d="M14 24h20" stroke={c} strokeWidth="1.4" opacity="0.55" />
        </svg>
        <span className="sparkle" style={{ position: "absolute", top: -2, left: -2, width: 5, height: 5, borderRadius: "50%", background: c, boxShadow: `0 0 6px 2px ${c}99` }} />
        <span className="sparkle" style={{ position: "absolute", bottom: 2, right: -3, width: 4, height: 4, borderRadius: "50%", background: c, boxShadow: `0 0 6px 2px ${c}99`, animationDelay: "0.7s" }} />
      </span>
    );
  }
  if (category === "sprayAndSplash") {
    return (
      <span style={{ position: "relative", display: "inline-flex", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="16" y="6" width="6" height="6" rx="1" fill={c} />
          <path d="M14 16h20a2 2 0 0 1 2 2v20a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V18a2 2 0 0 1 2-2Z" fill={c} opacity="0.18" stroke={c} strokeWidth="1.8" />
        </svg>
        <span className="mist-puff" style={{ position: "absolute", top: -6, left: 6, width: 6, height: 6, borderRadius: "50%", background: c, opacity: 0.6 }} />
        <span className="mist-puff" style={{ position: "absolute", top: -10, left: 16, width: 5, height: 5, borderRadius: "50%", background: c, opacity: 0.5, animationDelay: "0.5s" }} />
        <span className="mist-puff" style={{ position: "absolute", top: -4, left: 24, width: 4, height: 4, borderRadius: "50%", background: c, opacity: 0.45, animationDelay: "1s" }} />
      </span>
    );
  }
  if (category === "makeup") {
    return (
      <span className="pulse-glow" style={{ position: "relative", display: "inline-flex", width: size, height: size, borderRadius: "50%" }}>
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="20" y="4" width="8" height="16" rx="4" fill={c} />
          <path d="M15 20h18l-2.4 20a4 4 0 0 1-4 3.6h-5.2a4 4 0 0 1-4-3.6L15 20Z" fill={c} opacity="0.22" stroke={c} strokeWidth="1.8" />
        </svg>
      </span>
    );
  }
  if (category === "hairStyling") {
    return (
      <span style={{ position: "relative", display: "inline-flex", width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className="wave-flow">
          <path d="M6 16c6 0 6 6 12 6s6-6 12-6 6 6 12 6" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M6 26c6 0 6 6 12 6s6-6 12-6 6 6 12 6" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.7" />
          <path d="M6 36c6 0 6 6 12 6s6-6 12-6 6 6 12 6" stroke={c} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.45" />
        </svg>
      </span>
    );
  }
  if (category === "hygiene") {
    return (
      <span style={{ position: "relative", display: "inline-flex", width: size, height: size }}>
        <span className="ripple-ring" style={{ borderColor: c }} />
        <span className="ripple-ring" style={{ borderColor: c, animationDelay: "0.9s" }} />
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ position: "relative" }}>
          <path d="M24 6c8 10 12 16.5 12 22a12 12 0 1 1-24 0c0-5.5 4-12 12-22Z" fill={c} opacity="0.85" />
          <path d="M18 30a6 6 0 0 0 6 6" stroke="#FFFFFF" strokeWidth="1.4" opacity="0.7" strokeLinecap="round" />
        </svg>
      </span>
    );
  }
  // electronics
  return (
    <span className="pulse-glow" style={{ position: "relative", display: "inline-flex", width: size, height: size, borderRadius: 8 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="10" y="14" width="28" height="18" rx="3" fill={c} opacity="0.18" stroke={c} strokeWidth="1.8" />
        <path d="M18 32v4M30 32v4M16 40h16" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 23h16" stroke={c} strokeWidth="1.6" opacity="0.7" />
      </svg>
    </span>
  );
}

// کامپوننت کروماکی: ویدیو را روی یک کانواس پنهان می‌کشد و پیکسل‌های نزدیک به مشکی (پس‌زمینه‌ی ویدیو) را
// واقعاً شفاف می‌کند (نه فقط ترفند بلند-مود CSS) — بنابراین مستقل از رنگ پس‌زمینه‌ی سایت درست دیده می‌شود.
// منبع ویدیو با کیفیت بالا (تا ۱۰۸۰) است، ولی برای عملکرد روان، کانواس داخلی در اندازه‌ی کوچک‌تری
// (renderWidth) رسم می‌شود — مرورگر خودش کیفیت بالای منبع را با نرمی خوب کوچک می‌کند (تصویر تار نمی‌شود).
// کامپوننت کروماکی: ویدیو را روی یک کانواس پنهان می‌کشد و پیکسل‌های نزدیک به رنگ پس‌زمینه‌ی ویدیو
// (keyColor) را واقعاً شفاف می‌کند — مستقل از رنگ پس‌زمینه‌ی سایت درست دیده می‌شود. برای پس‌زمینه‌ی
// مشکی یک‌دست keyColor پیش‌فرض [0,0,0] کافی است؛ برای پس‌زمینه‌ی خاکستری/رنگی رنگ دقیق آن پاس داده می‌شود.
function ChromaKeyVideo({ src, style, className, renderWidth = 240, keyColor = [0, 0, 0], threshold = 20, feather = 45 }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const sizedRef = React.useRef(false);

  React.useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    let rafId;
    let cancelled = false;
    sizedRef.current = false;

    const [kr, kg, kb] = keyColor;
    const THRESH = threshold * threshold;

    function draw() {
      if (cancelled) return;
      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (!sizedRef.current) {
          canvas.width = renderWidth;
          canvas.height = Math.round((video.videoHeight / video.videoWidth) * renderWidth);
          sizedRef.current = true;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        for (let i = 0; i < data.length; i += 4) {
          const dr = data[i] - kr, dg = data[i + 1] - kg, db = data[i + 2] - kb;
          const distSq = dr * dr + dg * dg + db * db;
          if (distSq < THRESH) {
            data[i + 3] = 0;
          } else {
            const dist = Math.sqrt(distSq);
            const featherStart = Math.sqrt(THRESH);
            if (dist < featherStart + feather) {
              data[i + 3] = Math.round(255 * ((dist - featherStart) / feather));
            }
          }
        }
        ctx.putImageData(frame, 0, 0);
      }
      rafId = requestAnimationFrame(draw);
    }

    video.play().catch(() => {});
    rafId = requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [src, renderWidth, keyColor, threshold, feather]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} className={className} style={style} />
    </>
  );
}

// کامپوننت ویدیوی شفاف واقعی (بدون هیچ وابستگی به رنگ پس‌زمینه‌ی سایت): برخلاف کروماکی که
// فقط رنگ‌های نزدیک به یک رنگ خاص را حدس می‌زند و حذف می‌کند، این کامپوننت از یک فایل ویدیوی
// «دوبل» استفاده می‌کند که نیمه‌ی بالای هر فریمش رنگ واقعی (بدون پیش‌ضرب در آلفا) و نیمه‌ی
// پایینش ماسک شفافیت واقعی (استخراج‌شده از کانال آلفای اصلی ویدیو) است. هر فریم روی یک کانواس
// پنهان خوانده می‌شود، دو نیمه با هم ترکیب می‌شوند و یک تصویر با کانال آلفای واقعی و دقیق تولید
// می‌شود — نتیجه هیچ هاله یا لکه‌ی تیره‌ای در لبه‌ها روی هیچ پس‌زمینه‌ای (هر رنگ یا گرادیانی) ندارد.
function TrueAlphaVideo({ src, style, className, renderWidth = 300 }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const tempCanvasRef = React.useRef(null);
  const sizedRef = React.useRef(false);

  React.useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (!tempCanvasRef.current) tempCanvasRef.current = document.createElement("canvas");
    const tempCanvas = tempCanvasRef.current;
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    const ctx = canvas.getContext("2d");
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = "high";
    let rafId;
    let cancelled = false;
    sizedRef.current = false;
    let outWidth = 0;
    let outHeight = 0;

    function draw() {
      if (cancelled) return;
      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (!sizedRef.current) {
          // منبع یک فریم دوبل است: کل ارتفاعش رو نیمه‌ی رنگ (بالا) + نیمه‌ی آلفا (پایین) تشکیل می‌ده
          tempCanvas.width = renderWidth;
          tempCanvas.height = Math.round((video.videoHeight / video.videoWidth) * renderWidth);
          outWidth = tempCanvas.width;
          outHeight = Math.round(tempCanvas.height / 2);
          canvas.width = outWidth;
          canvas.height = outHeight;
          sizedRef.current = true;
        }
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const full = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const src8 = full.data;
        const out = ctx.createImageData(outWidth, outHeight);
        const dst8 = out.data;
        const rowLen = outWidth * 4;
        for (let y = 0; y < outHeight; y++) {
          const colorRowStart = y * rowLen;
          const alphaRowStart = (y + outHeight) * rowLen;
          for (let x = 0; x < outWidth; x++) {
            const ci = colorRowStart + x * 4;
            const ai = alphaRowStart + x * 4;
            const di = ci; // خروجی هم‌اندازه‌ی نیمه‌ی رنگ است، شاخص یکسان
            dst8[di] = src8[ci];
            dst8[di + 1] = src8[ci + 1];
            dst8[di + 2] = src8[ci + 2];
            // میانگین سه کانال ماسک آلفا برای کاهش خطای فشرده‌سازی رنگ (کروما ساب‌سمپلینگ)
            dst8[di + 3] = (src8[ai] + src8[ai + 1] + src8[ai + 2]) / 3;
          }
        }
        ctx.putImageData(out, 0, 0);
      }
      rafId = requestAnimationFrame(draw);
    }

    video.play().catch(() => {});
    rafId = requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [src, renderWidth]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} className={className} style={style} />
    </>
  );
}


function parseVariantsText(text) {
  if (!text || !text.trim()) return [];
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [label, hex, image] = line.split(",").map((s) => s && s.trim());
      return { id: `v${i}-${Date.now()}`, label: label || line, hex: hex || "", image: image || "" };
    });
}

function variantsToText(variants) {
  if (!variants || variants.length === 0) return "";
  return variants
    .map((v) => {
      const parts = [v.label];
      if (v.hex || v.image) parts.push(v.hex || "");
      if (v.image) parts.push(v.image);
      return parts.join(", ");
    })
    .join("\n");
}

const SEED_PRODUCTS = [
  { id: "p1", name: "بلور شب", brand: "جردن", category: "perfume", subcategory: "womenPerfume", price: 2450000, description: "رایحه‌ای شرقی و گرم با نت‌های عود و وانیل، مناسب شب.", image: "" },
  { id: "p2", name: "باغ سپید", brand: "جردن", category: "perfume", subcategory: "menPerfume", price: 1980000, description: "ترکیبی تازه از یاس و مرکبات برای روزهای بهاری.", image: "" },
  { id: "p3", name: "کانسیلر پوششی", brand: "اطلس", category: "makeup", subcategory: "face", type: "concealer", price: 890000, description: "کانسیلر با پوشش بالا، مناسب پوست‌های خشک و بی‌روح.", image: "" },
  { id: "p4", name: "پالت سایه صدف", brand: "اطلس", category: "makeup", subcategory: "eye", type: "eyeshadow", price: 1250000, description: "پالت سایه با پیگمنت بالا و بافت مخملی.", image: "" },
  {
    id: "p7",
    name: "رژ لب مخملی",
    brand: "اطلس",
    category: "makeup",
    subcategory: "lip",
    type: "lipstick",
    price: 620000,
    description: "بافت مخملی و ماندگاری بالا، با طیف گسترده‌ی رنگ — رنگ و شماره را انتخاب کن.",
    image: "",
    variants: [
      { id: "v1", label: "شماره ۱ - قرمز کلاسیک", hex: "#B0202E", image: "" },
      { id: "v2", label: "شماره ۲ - صورتی ملایم", hex: "#D98CA0", image: "" },
      { id: "v3", label: "شماره ۳ - نارنجی مرجانی", hex: "#E06B4E", image: "" },
      { id: "v4", label: "شماره ۴ - بژ خاکی", hex: "#B98567", image: "" },
      { id: "v5", label: "شماره ۵ - قرمز آجری", hex: "#8C3A2B", image: "" },
      { id: "v6", label: "شماره ۶ - زرشکی تیره", hex: "#5C1A2E", image: "" },
    ],
  },
  { id: "p8", name: "ست براش حرفه‌ای", brand: "اطلس", category: "makeup", subcategory: "accessory", type: "brushes", price: 540000, description: "ست براش‌های آرایشی با موی مصنوعی نرم.", image: "" },
  { id: "p9", name: "شامپو ترمیم‌کننده", brand: "ولوره", category: "hygiene", subcategory: "hairCare", price: 380000, description: "شامپو بدون سولفات، مناسب موهای آسیب‌دیده.", image: "" },
  { id: "p10", name: "لوسیون آبرسان بدن", brand: "ولوره", category: "hygiene", subcategory: "bodySkin", type: "bodyLotion", price: 420000, description: "لوسیون سبک و سریع‌جذب برای آبرسانی روزانه‌ی پوست.", image: "" },
  { id: "p5", name: "سشوار حرفه‌ای یون‌دار", brand: "ولوره", category: "electronics", subcategory: "hair", price: 3200000, description: "قدرت ۲۲۰۰ وات، فناوری یونیزه برای کاهش وز مو.", image: "" },
  { id: "p6", name: "اپیلاتور بی‌سیم", brand: "ولوره", category: "electronics", subcategory: "body", price: 2100000, description: "طراحی مینیمال، شارژ سریع و کاربرد ملایم روی پوست.", image: "" },
  { id: "p11", name: "دستگاه پاکسازی صورت", brand: "ولوره", category: "electronics", subcategory: "face", price: 1650000, description: "برس سونیک برای پاکسازی عمیق منافذ پوست صورت.", image: "" },
];

// مودال اسکن بارکد با دوربین — از کتابخانه‌ی رایگان ZXing استفاده می‌کند؛ به محض تشخیص یک بارکد
// معتبر، onDetected را صدا می‌زند و خودش را می‌بندد. کاملاً سمت مرورگر است، هیچ سروری درگیر نیست.
function BarcodeScannerModal({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;
    let cancelled = false;

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current,
        (result, err) => {
          if (cancelled) return;
          if (result) {
            onDetected(result.getText());
          }
          // NotFoundException در هر فریمی که بارکد پیدا نشود عادی است؛ نادیده گرفته می‌شود.
        }
      )
      .catch((e) => {
        if (!cancelled) setError("دسترسی به دوربین ممکن نشد — مطمئن شو اجازه‌ی دوربین را به مرورگر داده‌ای.");
      });

    return () => {
      cancelled = true;
      try {
        readerRef.current && readerRef.current.reset();
      } catch (e) {}
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)" }}>
      <div className="flex items-center justify-between w-full max-w-md mb-3">
        <span style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 700 }}>اسکن بارکد</span>
        <button onClick={onClose} aria-label="بستن"><X size={22} color="#FFFFFF" /></button>
      </div>
      <div className="relative w-full max-w-md rounded-xl overflow-hidden" style={{ aspectRatio: "4/3", background: "#111" }}>
        <video ref={videoRef} className="w-full h-full" style={{ objectFit: "cover" }} muted playsInline />
        <div
          style={{
            position: "absolute", top: "35%", bottom: "35%", insetInlineStart: "10%", insetInlineEnd: "10%",
            border: "2px solid #FF3E8E", borderRadius: 10, pointerEvents: "none",
          }}
        />
      </div>
      {error ? (
        <p style={{ color: "#FF8FA3", fontSize: 12.5, marginTop: 12, textAlign: "center", maxWidth: 320 }}>{error}</p>
      ) : (
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12.5, marginTop: 12 }}>بارکد را داخل کادر بگیر</p>
      )}
    </div>
  );
}


function ProductCard({ product, onOpen, globalDiscountPercent }) {
  const displayImage = product.image || "";
  const hasVariants = product.variants && product.variants.length > 0;
  const discountPct = effectiveDiscountPercent(product, globalDiscountPercent);
  const finalPrice = discountedPrice(product, globalDiscountPercent);

  return (
    <button
      type="button"
      onClick={() => onOpen(product.id)}
      className={`${CATEGORY_CARD_CLASS[product.category]} product-card rounded-xl border border-hair overflow-hidden flex flex-col text-right w-full`}
      style={{ position: "relative" }}
    >
      {discountPct > 0 && (
        <span
          style={{
            position: "absolute", top: 8, insetInlineStart: 8, zIndex: 1,
            background: "linear-gradient(135deg, #FF3E8E, #7B5CF6)", color: "#fff",
            fontSize: 10.5, fontWeight: 700, borderRadius: 999, padding: "3px 9px",
          }}
        >
          ٪{discountPct.toLocaleString("fa-IR")} تخفیف
        </span>
      )}
      <div className="flex items-center justify-center" style={{ background: "#FFFFFF", height: 168, overflow: "hidden" }}>
        {displayImage ? (
          <img
            src={framedProductImageUrl(displayImage)}
            alt={product.name}
            style={productImageStyle(product)}
            onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <div style={{ display: displayImage ? "none" : "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          <CategoryIcon category={product.category} size={54} />
        </div>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-gold" style={{ fontSize: 11 }}>{product.brand}</span>
          {subcategoryLabel(product.category, product.subcategory) && (
            <span className="text-muted" style={{ fontSize: 10, border: "1px solid rgba(123,92,246,0.3)", borderRadius: 999, padding: "2px 8px" }}>
              {subcategoryLabel(product.category, product.subcategory)}
              {product.type && ` · ${typeLabel(product.category, product.subcategory, product.type)}`}
              {product.facets && facetsSummary(product.category, product.subcategory, product.facets) && ` · ${facetsSummary(product.category, product.subcategory, product.facets)}`}
            </span>
          )}
        </div>
        <h3 className="font-display" style={{ fontSize: 16 }}>{product.name}</h3>
        <p className="text-muted" style={{ fontSize: 12, minHeight: 32 }}>{product.description}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            {discountPct > 0 && (
              <span className="text-muted" style={{ fontSize: 11, textDecoration: "line-through" }}>{fmtPrice(product.price)}</span>
            )}
            <span style={{ fontSize: 14, fontWeight: 700, color: discountPct > 0 ? "#FF3E8E" : undefined }}>{fmtPrice(finalPrice)}</span>
          </div>
          {hasVariants ? (
            <span className="text-gold" style={{ fontSize: 10.5 }}>{product.variants.length} رنگ/شماره ›</span>
          ) : (
            <span className="text-muted" style={{ fontSize: 10.5 }}>مشاهده ›</span>
          )}
        </div>
      </div>
    </button>
  );
}

function ProductDetailPage({ product, onBack, onAdd, globalDiscountPercent }) {
  const hasVariants = !!product && product.variants && product.variants.length > 0;
  const [variantId, setVariantId] = useState("");
  const selectedVariant = hasVariants ? product.variants.find((v) => v.id === variantId) : null;
  const displayImage = (selectedVariant && selectedVariant.image) || (product && product.image) || "";
  const discountPct = product ? effectiveDiscountPercent(product, globalDiscountPercent) : 0;
  const finalPrice = product ? discountedPrice(product, globalDiscountPercent) : 0;

  if (!product) {
    return (
      <section className="px-4 sm:px-8 max-w-3xl mx-auto py-16 text-center">
        <p className="text-muted mb-4">این محصول یافت نشد یا حذف شده است.</p>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-8 lg:px-12 max-w-3xl lg:max-w-5xl mx-auto py-6 pb-24">
      <div className="lg:flex lg:items-start lg:gap-10">
        <div
          className="rounded-2xl border border-hair overflow-hidden flex items-center justify-center mb-5 lg:mb-0 lg:sticky lg:top-24 h-96 lg:h-[520px] lg:w-[420px] lg:flex-shrink-0"
          style={{ background: "#FFFFFF" }}
        >
          {displayImage ? (
            <img
              src={framedProductImageUrl(displayImage)}
              alt={product.name}
              style={selectedVariant && selectedVariant.image ? { width: "100%", height: "100%", objectFit: "contain" } : productImageStyle(product)}
            />
          ) : (
            <CategoryIcon category={product.category} size={80} />
          )}
        </div>

        <div className="lg:flex-1 lg:min-w-0">
          <div className="flex items-center mb-1">
            <span className="text-gold" style={{ fontSize: 12 }}>{product.brand}</span>
          </div>
          <h1 className="font-display" style={{ fontSize: 24, marginBottom: product.nameEn ? 2 : 6 }}>{product.name}</h1>
          {product.nameEn && (
            <p className="text-muted" style={{ fontSize: 24, marginBottom: 10 }} dir="ltr">{product.nameEn}</p>
          )}
          <p style={{ marginBottom: 16 }}>
            {discountPct > 0 && (
              <span className="text-muted" style={{ fontSize: 13, textDecoration: "line-through", marginInlineEnd: 8 }}>
                {fmtPrice(product.price)}
              </span>
            )}
            <span style={{ fontSize: 19, fontWeight: 700, color: discountPct > 0 ? "#FF3E8E" : undefined }}>{fmtPrice(finalPrice)}</span>
            {discountPct > 0 && (
              <span
                style={{
                  marginInlineStart: 8, background: "linear-gradient(135deg, #FF3E8E, #7B5CF6)", color: "#fff",
                  fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "2px 9px",
                }}
              >
                ٪{discountPct.toLocaleString("fa-IR")} تخفیف
              </span>
            )}
          </p>

          {hasVariants && (
            <div className="mb-6">
              <p className="text-muted mb-2" style={{ fontSize: 12.5 }}>
                رنگ / شماره ({product.variants.length} طیف){selectedVariant ? ` — ${selectedVariant.label}` : ""}
              </p>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = variantId === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setVariantId(v.id)}
                      title={v.label}
                      aria-label={v.label}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        padding: 0,
                        cursor: "pointer",
                        background: v.image ? `center/cover no-repeat url(${v.image})` : (v.hex || "#EEE"),
                        border: isSelected ? "2.5px solid #FF3E8E" : "1px solid rgba(123,92,246,0.35)",
                        boxShadow: isSelected ? "0 0 0 3px rgba(255,62,142,0.22)" : "none",
                        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {(() => {
            const specsBlock =
              product.category === "perfume" &&
              (() => {
                const specs = [
                  { label: "برند", value: product.brand },
                  { label: "حجم", value: product.volume ? `${product.volume} میل` : "" },
                  { label: "غلظت مواد معطر", value: facetGroupValues(product.category, product.subcategory, "concentration", product.facets) },
                  { label: "ماندگاری", value: PERFUME_LONGEVITY_OPTIONS[product.longevity] },
                  { label: "پخش بو", value: PERFUME_SILLAGE_OPTIONS[product.sillage] },
                  { label: "گروه بویایی", value: facetGroupValues(product.category, product.subcategory, "fragranceNote", product.facets) },
                  { label: "طبع", value: facetGroupValues(product.category, product.subcategory, "temperament", product.facets) },
                  { label: "حس رایحه", value: facetGroupValues(product.category, product.subcategory, "scentFamily", product.facets) },
                  { label: "عطار", value: product.perfumer },
                  { label: "کشور سازنده", value: product.countryOfOrigin },
                  { label: "سال ساخت", value: product.yearMade },
                  {
                    label: "امتیاز کاربران فرگرانتیکا",
                    value: product.fragranticaRating ? (
                      <>
                        <span style={{ color: "#2563EB" }}>{product.fragranticaRating}</span>
                        <span style={{ color: "#000000" }}> از ۱۰</span>
                      </>
                    ) : "",
                  },
                ].filter((s) => s.value);
                if (specs.length === 0) return null;
                return (
                  <div className="mb-6">
                    <h2 className="font-display" style={{ fontSize: 14, marginBottom: 8 }}>مشخصات</h2>
                    <div className="rounded-xl border border-hair overflow-hidden" style={{ background: "rgba(123,92,246,0.05)" }}>
                      {specs.map((s, i) => (
                        <div
                          key={s.label}
                          className="flex items-center justify-between px-4 py-2.5"
                          style={i < specs.length - 1 ? { borderBottom: "1px solid rgba(123,92,246,0.14)" } : undefined}
                        >
                          <span className="text-muted" style={{ fontSize: 12.5 }}>{s.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#241E3D" }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })();

            const descriptionBlock = product.description && (
              <div className="mb-5">
                <h2 className="font-display" style={{ fontSize: 14, marginBottom: 5 }}>معرفی محصول</h2>
                <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-line" }}>{product.description}</p>
              </div>
            );

            const propertiesBlock = product.properties && (
              <div className="mb-5">
                <h2 className="font-display" style={{ fontSize: 14, marginBottom: 5 }}>ویژگی‌ها و خواص</h2>
                <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-line" }}>{product.properties}</p>
              </div>
            );

            const notesOrIngredientsBlock =
              product.category === "perfume" ? (
                (product.topNotes || product.middleNotes || product.baseNotes) && (
                  <div className="mb-7">
                    <h2 className="font-display" style={{ fontSize: 14, marginBottom: 10 }}>نت‌های رایحه</h2>
                    {[
                      { label: "Top Notes — نت‌های آغازین", value: product.topNotes, color: "#2563EB", cardClass: "card-perfume-blue" },
                      { label: "Middle Notes — نت‌های میانی", value: product.middleNotes, color: "#D97706", cardClass: "card-beauty" },
                      { label: "Base Notes — نت‌های پایه", value: product.baseNotes, color: "#16A34A", cardClass: "card-hairstyling" },
                    ].map(
                      (accord) =>
                        accord.value && (
                          <div key={accord.label} className="mb-5">
                            <p
                              className="font-display"
                              style={{ fontSize: 16, fontWeight: 800, color: accord.color, marginBottom: 10, textAlign: "center" }}
                            >
                              {accord.label}
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                              {accord.value
                                .split(/[,،]/)
                                .map((n) => n.trim())
                                .filter(Boolean)
                                .map((noteName, i) => (
                                  <span
                                    key={i}
                                    className={accord.cardClass}
                                    style={{
                                      fontSize: 12.5, borderRadius: 999, padding: "6px 14px",
                                      border: `1px solid ${accord.color}40`, color: "#241E3D",
                                    }}
                                  >
                                    {noteName}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )
                    )}
                  </div>
                )
              ) : (
                product.ingredients && (
                  <div className="mb-7">
                    <h2 className="font-display" style={{ fontSize: 14, marginBottom: 5 }}>ترکیبات</h2>
                    <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-line" }}>{product.ingredients}</p>
                  </div>
                )
              );

            // ترتیب درخواستی برای صفحات ادکلن: ترکیبات رایحه ← ویژگی‌ها و خواص ← مشخصات ← معرفی محصول
            // (ترکیبات رایحه و مشخصات جای هم را عوض کردند، و معرفی محصول درست زیر مشخصات آمده)
            if (product.category === "perfume") {
              return (
                <>
                  {notesOrIngredientsBlock}
                  {propertiesBlock}
                  {specsBlock}
                  {descriptionBlock}
                </>
              );
            }
            // برای بقیه‌ی دسته‌ها ترتیب قبلی دست‌نخورده باقی می‌ماند
            return (
              <>
                {descriptionBlock}
                {propertiesBlock}
                {notesOrIngredientsBlock}
              </>
            );
          })()}

          <button
            onClick={() => onAdd(product, variantId || undefined)}
            disabled={hasVariants && !variantId}
            className="btn-gold w-full lg:w-auto lg:px-10 rounded py-3 text-sm font-medium"
            style={hasVariants && !variantId ? { opacity: 0.55 } : undefined}
          >
            افزودن به سبد خرید
          </button>
          {hasVariants && !variantId && (
            <p className="text-muted text-center lg:text-right mt-2" style={{ fontSize: 11 }}>برای افزودن به سبد، یکی از رنگ‌ها/شماره‌ها رو انتخاب کن.</p>
          )}
        </div>
      </div>
    </section>
  );
}

const ORDER_STATUS_META = {
  paid: { label: "پرداخت‌شده", color: "#0EA5A4", bg: "rgba(14,165,164,0.12)" },
  pending: { label: "در انتظار پرداخت", color: "#D97706", bg: "rgba(217,119,6,0.12)" },
  canceled: { label: "لغوشده", color: "#756E93", bg: "rgba(117,110,147,0.14)" },
  failed: { label: "ناموفق", color: "#D6336C", bg: "rgba(214,51,108,0.12)" },
};

function fmtOrderDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const date = d.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
  const time = d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  return `${date} — ساعت ${time}`;
}

// صفحه‌ی «حساب کاربری من»: پروفایل مشتری، آمار خرید، و تاریخچه‌ی کامل سفارش‌ها — مشابه
// داشبورد شخصی در سایت‌های معتبر فروش آنلاین آرایشی-بهداشتی و عطر.
function AccountPage({ user, orders, loading, error, onRetry, onLogout, onBack }) {
  const paidOrders = orders.filter((o) => o.status === "paid");
  const totalSpent = paidOrders.reduce((s, o) => s + (Number(o.amount) || 0), 0);
  const lastOrder = orders.length > 0 ? orders[0] : null; // سرور همین حالا نزولی (جدیدترین اول) برمی‌گرداند
  const memberSince = user.createdAt ? fmtOrderDateTime(user.createdAt) : "";

  return (
    <section className="px-4 sm:px-8 lg:px-12 max-w-3xl mx-auto py-6 pb-24">
      {/* کارت پروفایل */}
      <div className="bg-panel border border-hair rounded-2xl p-5 mb-5 flex items-center gap-4">
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #FF3E8E, #7B5CF6)" }}
        >
          <User size={26} color="#FFFFFF" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display" style={{ fontSize: 18 }}>
            {user.fullName || "مشتری جردن"}
          </h1>
          <p className="text-muted" style={{ fontSize: 12.5, direction: "ltr", textAlign: "right" }}>{user.email}</p>
          {memberSince && (
            <p className="text-muted mt-1" style={{ fontSize: 11 }}>عضویت از {memberSince}</p>
          )}
        </div>
        <button onClick={onLogout} className="btn-ghost rounded-full px-3 py-2 text-xs flex items-center gap-1.5 flex-shrink-0">
          <LogOut size={13} /> خروج
        </button>
      </div>

      {/* آمار خرید */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-panel-2 border border-hair rounded-xl p-3 text-center">
          <p className="font-display" style={{ fontSize: 20, color: "#FF3E8E" }}>{orders.length.toLocaleString("fa-IR")}</p>
          <p className="text-muted" style={{ fontSize: 10.5, marginTop: 4 }}>تعداد سفارش</p>
        </div>
        <div className="bg-panel-2 border border-hair rounded-xl p-3 text-center">
          <p className="font-display" style={{ fontSize: 20, color: "#7B5CF6" }}>{paidOrders.length.toLocaleString("fa-IR")}</p>
          <p className="text-muted" style={{ fontSize: 10.5, marginTop: 4 }}>خرید موفق</p>
        </div>
        <div className="bg-panel-2 border border-hair rounded-xl p-3 text-center">
          <p className="font-display" style={{ fontSize: 13, color: "#0EA5A4" }}>{fmtPrice(totalSpent)}</p>
          <p className="text-muted" style={{ fontSize: 10.5, marginTop: 4 }}>مجموع خرید</p>
        </div>
      </div>

      {/* تاریخچه‌ی سفارش‌ها */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} color="#FF3E8E" />
        <h2 className="font-display" style={{ fontSize: 16 }}>تاریخچه‌ی خرید</h2>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton rounded-xl" style={{ height: 76 }} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl p-4 text-center" style={{ background: "rgba(214,51,108,0.1)" }}>
          <p style={{ fontSize: 12.5, color: "#D6336C", marginBottom: 8 }}>{error}</p>
          <button onClick={onRetry} className="btn-ghost rounded-full px-4 py-1.5 text-xs">تلاش دوباره</button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-panel-2 border border-hair rounded-xl p-6 text-center">
          <p className="text-muted" style={{ fontSize: 13 }}>هنوز خریدی از فروشگاه نداشته‌ای.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const meta = ORDER_STATUS_META[order.status] || ORDER_STATUS_META.pending;
            return (
              <div key={order.id} className="bg-panel border border-hair rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted" style={{ fontSize: 11.5 }}>{fmtOrderDateTime(order.created_at)}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: meta.color, background: meta.bg, borderRadius: 999, padding: "3px 10px" }}>
                    {meta.label}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mb-2">
                  {(order.items || []).map((item, i) => (
                    <p key={i} className="text-muted" style={{ fontSize: 12.5 }}>
                      {item.name} <span style={{ color: "#756E93" }}>× {Number(item.qty).toLocaleString("fa-IR")}</span>
                    </p>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-hair">
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>{fmtPrice(order.amount)}</span>
                  {order.ref_id && (
                    <span className="text-muted" style={{ fontSize: 11 }} dir="ltr">کد پیگیری: {order.ref_id}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function MaisonStore() {
  const [view, setView] = useState("store"); // store | admin
  const [menuOpen, setMenuOpen] = useState(false);
  // ارتفاع واقعیِ اندازه‌گیری‌شده‌ی نوار اطلاعیه‌ی متحرک بالای صفحه — به‌جای یک عدد حدسی ثابت،
  // هدر شناور (لوگو و آیکون‌ها) دقیقاً همین مقدار را به‌عنوان فاصله از بالای صفحه استفاده می‌کند
  // تا همیشه بدون هیچ فاصله‌ی خالی، درست زیر نوار اطلاعیه بچسبد.
  const marqueeRef = useRef(null);
  const [marqueeHeight, setMarqueeHeight] = useState(28);
  useLayoutEffect(() => {
    function measure() {
      if (marqueeRef.current) setMarqueeHeight(marqueeRef.current.offsetHeight);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  // راهنمای انیمیشنی روی دکمه‌ی منوی همبرگری («دست در حال لمس دکمه») تا زمانی که مشتری اولین بار
  // منو را باز کند نمایش داده می‌شود؛ بعد از اولین بار باز کردن، برای همیشه (حتی در بازدیدهای بعدی
  // همین مرورگر) پنهان می‌شود تا مزاحم استفاده‌ی عادی از سایت نشود.
  const [menuHintSeen, setMenuHintSeen] = useState(() => {
    try { return localStorage.getItem("maison_menu_hint_seen") === "1"; } catch (e) { return false; }
  });
  function dismissMenuHint() {
    setMenuHintSeen(true);
    try { localStorage.setItem("maison_menu_hint_seen", "1"); } catch (e) {}
  }
  // شمارنده‌ی جلوه‌ی «تپش لمس» روی دکمه‌ی منو — با هر کلیک یکی افزایش می‌یابد تا با تغییر key،
  // انیمیشن کلمه‌ی menu + حلقه‌های موج از نو (حتی وسط اجرای قبلی) اجرا شود.
  const [menuTapFxKey, setMenuTapFxKey] = useState(0);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [menuNav, setMenuNav] = useState(null); // null | { category } | { category, subcategory }
  const [categoryPageOpen, setCategoryPageOpen] = useState(false);
  const [openProductId, setOpenProductId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [activeFacets, setActiveFacets] = useState({}); // { [facetKey]: optionKey } — برای گروه‌های موازی مثل ادکلن
  const [activeBrand, setActiveBrand] = useState("all");
  const [cart, setCart] = useState({}); // id -> qty
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const [heroBanners, setHeroBanners] = useState([]); // لیست عکس‌های بنر متحرک صفحه‌ی اصلی
  const [bannerIndex, setBannerIndex] = useState(0);
  const [globalDiscountPercent, setGlobalDiscountPercent] = useState(0); // تخفیف همگانی روی همه‌ی محصولات (مثلاً برای بلک فرایدی)
  // بنر اختصاصی هر صفحه‌ی دسته‌بندی/زیرشاخه (مثل بنر بالای صفحه‌ی هر دسته در سایت‌های معتبر فروش آنلاین):
  // { [key]: { type:'image'|'video', url } } — کلید یا فقط نام دسته است (برای کل آن دسته) یا "دسته:زیرشاخه"
  // برای بنر اختصاصی همان زیرشاخه؛ اگر زیرشاخه بنر نداشته باشد، بنر کل دسته (در صورت وجود) نمایش داده می‌شود.
  const [categoryBanners, setCategoryBanners] = useState({});

  // احراز هویت و پرداخت — توکن در localStorage نگه داشته می‌شود تا با رفرش صفحه
  // یا برگشت به تب مرورگر، ورود کاربر حفظ شود و فقط با زدن دکمه‌ی خروج پاک شود.
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem("maison_auth_token") || null; } catch (e) { return null; }
  });
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("maison_auth_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  });
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", fullName: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // سفارش‌های کاربر برای «حساب کاربری من» — فقط وقتی کاربر لاگین است و وارد صفحه‌ی حساب می‌شود
  // (یا صفحه رفرش می‌شود درحالی‌که قبلاً در آن صفحه بوده) از سرور گرفته می‌شود.
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const isAdmin = isAdminUser(user);

  // هر بار که توکن یا کاربر تغییر کند، در localStorage هم به‌روزرسانی می‌شود.
  useEffect(() => {
    try {
      if (token) localStorage.setItem("maison_auth_token", token);
      else localStorage.removeItem("maison_auth_token");
    } catch (e) {}
  }, [token]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem("maison_auth_user", JSON.stringify(user));
      else localStorage.removeItem("maison_auth_user");
    } catch (e) {}
  }, [user]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/api/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setStorageError(false);
    } catch (e) {
      // بعد از چند بار تلاش هم اتصال به سرور برقرار نشد؛ برای اینکه مشتری با محصولات fake گمراه نشود،
      // لیست خالی نمایش داده می‌شود و پیام خطا نشان داده می‌شود.
      setProducts([]);
      setStorageError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetchWithRetry(`${API_BASE_URL}/api/settings`);
      const data = await res.json();
      if (data && Array.isArray(data.heroBanners) && data.heroBanners.length > 0) {
        setHeroBanners(data.heroBanners);
      }
      if (data && Number.isFinite(Number(data.globalDiscountPercent))) {
        setGlobalDiscountPercent(Number(data.globalDiscountPercent));
      }
      if (data && data.categoryBanners && typeof data.categoryBanners === "object") {
        setCategoryBanners(data.categoryBanners);
      }
    } catch (e) {
      // بعد از چند بار تلاش هم سرور در دسترس نبود، همان طرح پیش‌فرض نمایش داده می‌شود.
    }
  };

  useEffect(() => {
    loadProducts();
    loadSettings();
  }, []);

  // ---------------------------------------------------------------------------
  // تاریخچه‌ی ناوبری داخل سایت (برای دکمه‌ی برگشت گوشی/مرورگر)
  // هر بار که کاربر به یک صفحه‌ی جدید می‌رود (دسته، زیرشاخه، محصول، منو، پنل مدیریت)، یک ورودی به
  // تاریخچه‌ی مرورگر اضافه می‌شود. با زدن دکمه‌ی برگشت، به‌جای خروج از سایت، یک قدم به عقب
  // (صفحه‌ی قبلی) برمی‌گردیم؛ فقط وقتی به صفحه‌ی اصلی برسیم، برگشت بعدی از سایت خارج می‌شود.
  // ---------------------------------------------------------------------------
  const HOME_STATE = {
    view: "store",
    categoryPageOpen: false,
    activeCategory: "all",
    activeSubcategory: "all",
    activeType: "all",
    activeBrand: "all",
    searchTerm: "",
    openProductId: null,
    menuOpen: false,
  };

  function applySnapshot(snap) {
    const s = snap || HOME_STATE;
    setView(s.view || "store");
    setCategoryPageOpen(!!s.categoryPageOpen);
    setActiveCategory(s.activeCategory || "all");
    setActiveSubcategory(s.activeSubcategory || "all");
    setActiveType(s.activeType || "all");
    setActiveBrand(s.activeBrand || "all");
    setSearchTerm(s.searchTerm || "");
    setSearchDraft(s.searchTerm || "");
    setOpenProductId(s.openProductId || null);
    setMenuOpen(!!s.menuOpen);
    setActiveFacets({});
    setMenuNav(null);
    setCartOpen(false);
    setAuthOpen(false);
    setSearchOpen(false);
    setBrandMenuOpen(false);
  }

  // برای رفتن به یک صفحه‌ی تازه (مثل انتخاب دسته‌بندی) که همه‌چیز از نو تنظیم می‌شود
  function pushNav(overrides) {
    const snap = { ...HOME_STATE, ...overrides };
    window.history.pushState(snap, "");
  }

  // نسخه‌ی جایگزین‌کننده‌ی pushNav: به‌جای افزودن یک ورودی جدید به تاریخچه، ورودی فعلی (که معمولاً
  // همان ورودی «منو باز است» است) را با مقصد جدید جایگزین می‌کند. استفاده از این تابع هنگام ناوبری
  // از داخل منوی همبرگری به یک صفحه‌ی جدید (انتخاب دسته/زیرشاخه/نوع/برند و ...) ضروری است؛ در غیر
  // این صورت ورودیِ «منو باز» به‌عنوان یک قدم اضافه در تاریخچه باقی می‌ماند و با هر بار دکمه‌ی
  // بازگشت گوشی، منو دوباره و به‌طور ناخواسته باز می‌شود.
  function replaceNav(overrides) {
    const snap = { ...HOME_STATE, ...overrides };
    window.history.replaceState(snap, "");
  }

  // برای رفتن به یک صفحه‌ی جدید که باید زمینه‌ی فعلی (دسته/زیرشاخه‌ی باز) را حفظ کند
  // (مثل باز کردن محصول یا منو روی همون صفحه‌ای که هستیم)
  function pushNavPreserve(overrides) {
    const snap = {
      view, categoryPageOpen, activeCategory, activeSubcategory, activeType, activeBrand,
      searchTerm, openProductId, menuOpen,
      ...overrides,
    };
    window.history.pushState(snap, "");
  }

  // نسخه‌ی جایگزین‌کننده‌ی pushNavPreserve — برای وقتی فقط می‌خواهیم یک پوششِ روی صفحه (مثل منو)
  // را ببندیم بدون تغییر واقعی صفحه؛ ورودی فعلی تاریخچه به‌جای اضافه شدنِ ورودی نو، فقط به‌روزرسانی می‌شود.
  function replaceNavPreserve(overrides) {
    const snap = {
      view, categoryPageOpen, activeCategory, activeSubcategory, activeType, activeBrand,
      searchTerm, openProductId, menuOpen,
      ...overrides,
    };
    window.history.replaceState(snap, "");
  }

  useEffect(() => {
    window.history.replaceState(HOME_STATE, "");
    function onPopState(e) {
      applySnapshot(e.state);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (heroBanners.length < 2) return;
    // بنر ویدیویی با پایان پخش خودش (onEnded) به بنر بعدی می‌رود؛ این تایمر فقط برای بنرهای عکس است.
    if (normalizeBanner(heroBanners[bannerIndex]).type === "video") return;
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners, bannerIndex]);

  // اگر کاربر خارج شد یا کاربر دیگری وارد شد، در صورتی که در پنل مدیریت یا حساب کاربری بود، به فروشگاه برگردد.
  useEffect(() => {
    if (view === "admin" && !isAdmin) {
      setView("store");
    }
    if (view === "account" && !user) {
      setView("store");
    }
  }, [isAdmin, user, view]);

  const loadOrders = async () => {
    if (!token) return;
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "دریافت سفارش‌ها ناموفق بود");
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrdersError(
        err.message === "Failed to fetch"
          ? "اتصال به سرور برقرار نشد — لطفاً دوباره امتحان کن"
          : err.message
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  // هر بار که کاربر وارد صفحه‌ی «حساب کاربری من» می‌شود (یا مستقیم با رفرش صفحه به آن می‌رسد)، سفارش‌ها گرفته می‌شوند.
  useEffect(() => {
    if (view === "account" && user && token) {
      loadOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, user, token]);

  async function addProduct(payload) {
    const res = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "افزودن محصول ناموفق بود");
    await loadProducts();
    return data;
  }

  async function updateProduct(id, payload) {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ذخیره‌ی تغییرات ناموفق بود");
    await loadProducts();
    return data;
  }

  async function deleteProduct(id) {
    const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "حذف محصول ناموفق بود");
    await loadProducts();
  }

  async function uploadImage(imageBase64) {
    const res = await fetch(`${API_BASE_URL}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ imageBase64 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "آپلود تصویر ناموفق بود");
    return data.url;
  }

  // ویژگی «تشخیص هوشمند از روی عکس»: عکس را به سرور می‌فرستد، سرور با هوش مصنوعی بینایی تحلیلش می‌کند
  // و یک شیء با فیلدهای قابل‌تشخیص محصول (نام، برند، نت‌ها و ...) برمی‌گرداند.
  async function extractProductInfo(imageBase64) {
    const res = await fetch(`${API_BASE_URL}/api/ai/extract-product`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ imageBase64 }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "تشخیص هوشمند ناموفق بود");
    return data;
  }

  // جستجوی ادکلن بر اساس نام (fraganty.ai) — مرحله‌ی اول: لیست کوتاهی از محصولات محتمل
  async function searchPerfumeByName(query) {
    const res = await fetch(`${API_BASE_URL}/api/ai/search-perfume?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "جستجو ناموفق بود");
    return data.data || [];
  }

  // مرحله‌ی دوم: بعد از انتخاب مدیر از لیست، جزئیات کامل همان محصول
  async function getPerfumeDetails(slug) {
    const res = await fetch(`${API_BASE_URL}/api/ai/perfume-details?slug=${encodeURIComponent(slug)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "دریافت جزئیات ناموفق بود");
    return data;
  }

  // بعد از پر شدن نت‌ها/برند از fraganty.ai، توضیح انگلیسی (در صورت وجود) و داده‌های آکورد/فصل/زمان
  // را می‌گیرد و با هوش مصنوعی یک توضیح کوتاه و چند ویژگی کلیدی، کاملاً به فارسی، تولید می‌کند —
  // این درخواست جدا از جستجوی fraganty.ai است و از سهمیه‌ی آن مصرف نمی‌کند.
  async function translatePerfumeText(payload) {
    const res = await fetch(`${API_BASE_URL}/api/ai/translate-perfume-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ترجمه ناموفق بود");
    return data;
  }

  // اسکن بارکد: اول دیتابیس خودمان، بعد best-effort از UPCitemdb رایگان
  async function lookupBarcode(code) {
    const res = await fetch(`${API_BASE_URL}/api/ai/barcode-lookup?code=${encodeURIComponent(code)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "جستجوی بارکد ناموفق بود");
    return data;
  }

  async function updateHeroBanners(banners) {
    const res = await fetch(`${API_BASE_URL}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ heroBanners: banners }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ذخیره‌ی بنرها ناموفق بود");
    setHeroBanners(banners);
    setBannerIndex(0);
  }

  async function updateGlobalDiscount(percent) {
    const res = await fetch(`${API_BASE_URL}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ globalDiscountPercent: percent }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ذخیره‌ی تخفیف همگانی ناموفق بود");
    setGlobalDiscountPercent(percent);
  }

  async function updateCategoryBanners(banners) {
    const res = await fetch(`${API_BASE_URL}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ categoryBanners: banners }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ذخیره‌ی بنر دسته‌بندی ناموفق بود");
    setCategoryBanners(banners);
  }

  function addToCart(product, variantId) {
    if (product.variants && product.variants.length > 0 && !variantId) {
      return; // باید رنگ/شماره انتخاب شود
    }
    const key = variantId ? `${product.id}::${variantId}` : product.id;
    setCart((c) => ({ ...c, [key]: (c[key] || 0) + 1 }));
    setCartOpen(true);
    setCartBump(true);
    window.clearTimeout(addToCart._t);
    addToCart._t = window.setTimeout(() => setCartBump(false), 450);
  }
  function changeQty(key, delta) {
    setCart((c) => {
      const next = { ...c, [key]: (c[key] || 0) + delta };
      if (next[key] <= 0) delete next[key];
      return next;
    });
  }
  function removeFromCart(id) {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  }

  // درخواست ورود به پنل مدیریت: اگر کاربر لاگین نیست، فرم ورود باز می‌شود؛
  // اگر لاگین است ولی مدیر نیست، وارد پنل نمی‌شود.
  function requestAdminView() {
    if (!user) {
      setAuthMode("login");
      setAuthOpen(true);
      return;
    }
    if (isAdminUser(user)) {
      setView("admin");
    }
  }

  // درخواست ورود به «حساب کاربری من»: اگر کاربر هنوز عضو نشده، فرم ثبت‌نام/ورود (رایگان) باز می‌شود؛
  // اگر لاگین است، مستقیم به صفحه‌ی حساب کاربری‌اش می‌رود.
  function requestAccountView() {
    if (!user) {
      setAuthMode("register");
      setAuthOpen(true);
      return;
    }
    setView("account");
    pushNav({ view: "account" });
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطایی رخ داد");
      setToken(data.token);
      setUser(data.user);
      setAuthOpen(false);
      setAuthForm({ email: "", password: "", fullName: "" });
    } catch (err) {
      setAuthError(
        err.message === "Failed to fetch"
          ? "اتصال به سرور برقرار نشد — آدرس API_BASE_URL را بررسی کن"
          : err.message
      );
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    setView("store");
  }

  async function handleCheckout() {
    if (!token) {
      setAuthOpen(true);
      return;
    }
    setCheckoutError("");
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/payment/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: cartItems.map((i) => ({
            id: i.id,
            name: i.variant ? `${i.name} (${i.variant.label})` : i.name,
            qty: i.qty,
            price: i.price,
          })),
          amount: cartTotal,
          description: "خرید از فروشگاه",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "پرداخت آغاز نشد");
      window.location.href = data.paymentUrl;
    } catch (err) {
      setCheckoutError(
        err.message === "Failed to fetch"
          ? "اتصال به سرور پرداخت برقرار نشد — آدرس API_BASE_URL را بررسی کن"
          : err.message
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .map(([key, qty]) => {
          const [productId, variantId] = key.split("::");
          const product = products.find((p) => p.id === productId);
          if (!product) return null;
          const variant = variantId ? (product.variants || []).find((v) => v.id === variantId) : null;
          const unitPrice = discountedPrice(product, globalDiscountPercent);
          return { ...product, cartKey: key, qty, variant, originalPrice: product.price, price: unitPrice };
        })
        .filter(Boolean),
    [cart, products, globalDiscountPercent]
  );
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const allBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fa"));
  }, [products]);

  function selectBrand(brand) {
    setActiveCategory("all");
    setActiveSubcategory("all");
    setActiveType("all");
    setActiveBrand(brand);
    setView("store");
    setCategoryPageOpen(false);
    setOpenProductId(null);
    setBrandMenuOpen(false);
    setMenuOpen(false);
    replaceNav({ activeBrand: brand });
    setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  const brandsInCategory = useMemo(() => {
    const scoped = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);
    return Array.from(new Set(scoped.map((p) => p.brand).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fa"));
  }, [products, activeCategory]);

  const filteredProducts = products.filter((p) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        (p.name || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    }
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (activeCategory !== "all" && activeSubcategory !== "all" && (p.subcategory || "") !== activeSubcategory) return false;
    if (activeSubcategory !== "all" && activeType !== "all" && (p.type || "") !== activeType) return false;
    if (activeCategory === "perfume" && activeSubcategory !== "all" && Object.keys(activeFacets).length > 0) {
      for (const [facetKey, wantedArr] of Object.entries(activeFacets)) {
        const productVals = (p.facets && p.facets[facetKey]) || [];
        const hasOverlap = wantedArr.some((w) => productVals.includes(w));
        if (!hasOverlap) return false;
      }
    }
    if (activeBrand !== "all" && p.brand !== activeBrand) return false;
    return true;
  });

  function selectCategory(c) {
    setActiveCategory(c);
    setActiveSubcategory("all");
    setActiveType("all");
    setActiveFacets({});
    setActiveBrand("all");
    setView("store");
    setCategoryPageOpen(c !== "all");
    setOpenProductId(null);
  }

  function backToStore() {
    setActiveCategory("all");
    setActiveSubcategory("all");
    setActiveType("all");
    setActiveFacets({});
    setActiveBrand("all");
    setCategoryPageOpen(false);
    setSearchTerm("");
    setSearchDraft("");
    setOpenProductId(null);
  }

  function openProduct(id) {
    setOpenProductId(id);
    pushNavPreserve({ openProductId: id });
  }
  function closeProduct() {
    setOpenProductId(null);
  }

  function performSearch(term) {
    const q = term.trim();
    if (!q) return;
    setSearchTerm(q);
    setActiveCategory("all");
    setActiveSubcategory("all");
    setActiveType("all");
    setActiveFacets({});
    setActiveBrand("all");
    setCategoryPageOpen(true);
    setSearchOpen(false);
    setView("store");
    setOpenProductId(null);
    pushNav({ searchTerm: q, categoryPageOpen: true });
  }

  function selectSubcategory(key) {
    setActiveSubcategory(key);
    setActiveType("all");
    setActiveFacets({});
  }

  // multi=true (پیش‌فرض): چندانتخابی — مثل دسته بویایی/طبع/رایحه که می‌توانند هم‌زمان چند مقدار داشته باشند.
  // multi=false: تک‌انتخابی — مثل «نوع» ادکلن (اکستریت/پرفیوم/ادوپرفیوم و ...) که یک محصول فقط یکی از آن‌هاست.
  // در هر دو حالت، کلیک دوباره روی گزینه‌ی از قبل انتخاب‌شده، همان گزینه را از انتخاب خارج می‌کند
  // (برای اصلاح انتخاب اشتباه کاربر).
  function toggleFacet(key, value, multi = true) {
    setActiveFacets((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(value);
      let nextArr;
      if (multi) {
        nextArr = exists ? current.filter((v) => v !== value) : [...current, value];
      } else {
        nextArr = exists ? [] : [value];
      }
      const next = { ...prev };
      if (nextArr.length === 0) delete next[key];
      else next[key] = nextArr;
      return next;
    });
  }

  function closeMenu() {
    setMenuOpen(false);
    setMenuNav(null);
  }

  // زدن روی یک دسته‌ی اصلی توی منوی کشویی: اگر زیرشاخه دارد وارد آن می‌شویم، وگرنه مستقیم فیلتر و بسته می‌شود.
  function onMenuCategoryClick(c) {
    if (c === "all" || !CATEGORIES[c]?.subcategories) {
      selectCategory(c);
      closeMenu();
      replaceNav({ activeCategory: c, categoryPageOpen: c !== "all" });
      return;
    }
    setMenuNav({ category: c });
  }

  // زدن روی یک زیرشاخه توی منو: اگر خودش انواع دارد (مثل صورت/چشم/لب/ابزار یا گروه‌های فیلتر ادکلن)
  // وارد آن می‌شویم، وگرنه فیلتر و بسته می‌شود. همه‌ی زیرشاخه‌های دارای types (شامل ادکلن) یکسان
  // رفتار می‌کنند: وارد صفحه‌ی سوم منو می‌شویم تا کاربر گروه‌های فیلتر را همان‌جا انتخاب کند.
  function onMenuSubcategoryClick(category, subKey) {
    if (subKey === "all") {
      selectCategory(category);
      closeMenu();
      replaceNav({ activeCategory: category, categoryPageOpen: category !== "all" });
      return;
    }
    const types = subcategoryTypes(category, subKey);
    if (types) {
      // با ورود به صفحه‌ی فیلترها (چه ادکلن چه هر زیرشاخه‌ی دیگر با انواع)، بلافاصله دسته/زیرشاخه
      // را روی حالت واقعی سایت تنظیم می‌کنیم (و فیلترهای قبلی پاک می‌شوند) تا از همین‌جا فیلتر کردن
      // زنده باشد؛ منو باز می‌ماند تا کاربر بتواند چند فیلتر را پشت‌سرهم انتخاب کند.
      selectCategory(category);
      selectSubcategory(subKey);
      setMenuNav({ category, subcategory: subKey });
      return;
    }
    selectCategory(category);
    selectSubcategory(subKey);
    closeMenu();
    replaceNav({ activeCategory: category, activeSubcategory: subKey, categoryPageOpen: true });
  }

  // زدن روی یک نوع دقیق محصول (سطح سوم): 
  // برای ادکلن، ۴ گروه فیلتر (دسته بویایی/نوع/طبع/رایحه) اجزای مرتبط و ترکیب‌پذیر یک محصول‌اند —
  // مثلاً یک ادکلن می‌تواند هم‌زمان از دسته‌ی بویایی «شیرین» و از رایحه «گلی» باشد. به همین دلیل
  // با هر کلیک فقط فیلتر toggle می‌شود و منو بسته نمی‌شود، تا کاربر بتواند از چند گروه هم‌زمان
  // انتخاب کند؛ نتیجه هم بلافاصله (چون activeFacets state زنده است) قابل مشاهده است.
  // برای بقیه‌ی شاخه‌ها (تک‌انتخابی) با هر بار انتخاب، صفحه‌ی قبلی جایگزین و منو بسته می‌شود.
  function onMenuTypeClick(category, subKey, typeKey, groupKey, groupMulti) {
    // ادکلن: فقط toggle می‌کنیم و منو باز می‌ماند — دسته/زیرشاخه از قبل (هنگام ورود به این
    // زیرمنو در onMenuSubcategoryClick) تنظیم شده، پس نیازی به بازنشانی یا بستن منو نیست.
    if (category === "perfume" && groupKey && typeKey !== "all") {
      toggleFacet(groupKey, typeKey, groupMulti !== false);
      return;
    }
    selectCategory(category);
    selectSubcategory(subKey);
    if (typeKey !== "all") {
      setActiveType(typeKey);
    }
    closeMenu();
    replaceNav({
      activeCategory: category,
      activeSubcategory: subKey,
      activeType: typeKey !== "all" ? typeKey : "all",
      categoryPageOpen: true,
    });
  }

  const activeSubcategories = activeCategory !== "all" && CATEGORIES[activeCategory]?.subcategories
    ? CATEGORIES[activeCategory].subcategories
    : null;

  // آیا در صفحه‌ی اصلی روی بنر هستیم؟ (برای شناور بودن دکمه‌ها روی بنر، بدون فاصله‌ی هدر)
  const isHomeHero = view === "store" && !categoryPageOpen && !openProductId;
  // بنر صفحه‌ی دسته‌بندی فعلی (در صورت وجود) — یک‌بار همین‌جا محاسبه می‌شود تا هم برای تصمیم
  // «آیا هدر باید مثل صفحه‌ی اصلی شفاف/شناور باشد یا نه» استفاده شود، هم پایین‌تر داخل JSX (بدون
  // محاسبه‌ی دوباره‌ی همان چیز).
  const currentCategoryBanner =
    categoryPageOpen && !searchTerm ? resolveCategoryBanner(categoryBanners, activeCategory, activeSubcategory, activeType) : null;
  // هر صفحه‌ای که بالای خودش یک بنر تمام‌عرض (عکس/ویدیوی صفحه‌ی اصلی یا بنر دسته‌بندی) دارد، هدر
  // باید دقیقاً مثل صفحه‌ی اصلی روی همان بنر شناور و شفاف بماند — نه با یک نوار سفید زیرش که باعث
  // می‌شد پشت هدر یک پس‌زمینه‌ی سفیدِ نامرتبط دیده شود.
  const hasTopBanner = (isHomeHero && heroBanners.length > 0) || !!currentCategoryBanner;

  return (
    <div dir="rtl" lang="fa" className="maison-root min-h-screen">
      <style>{FONTS}</style>

      {/* Announcement marquee */}
      <div ref={marqueeRef} className="sticky top-0 z-40 overflow-hidden" style={{ background: "linear-gradient(90deg, #FF3E8E, #7B5CF6, #00C2CB, #FF3E8E)" }}>
        <div className="marquee-track py-1.5" style={{ color: "#FFFFFF", fontSize: 12, fontWeight: 700 }}>
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex items-center gap-10 px-6">
              <span>✦ ارسال سریع به سراسر ایران</span>
              <span>✦ ضمانت اصالت کالا</span>
              <span>✦ پرداخت امن با درگاه زرین‌پال</span>
              <span>✦ پشتیبانی آنلاین محصولات</span>
            </span>
          ))}
        </div>
      </div>

      {/* نوار شناور دکمه‌ها و لوگو — لوگو سمت چپ صفحه، خوشه‌ی ۴ دکمه (سبد خرید، حساب کاربری،
          جستجو، منو) سمت راست صفحه. */}
      <div className="fixed z-30 w-full" style={{ top: marqueeHeight, pointerEvents: "none" }}>
        <div
          className="flex items-center justify-between px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto"
          style={{ height: "12mm" }}
        >
          {/* لوگوی ویدیویی — سمت چپ صفحه */}
          <div style={{ pointerEvents: "none", flexShrink: 0, order: 2 }}>
            <TrueAlphaVideo
              src="/jordan-logo-alpha.mp4"
              renderWidth={300}
              style={{ height: "9mm", width: "auto", display: "block" }}
            />
          </div>

          {/* خوشه‌ی آیکون‌ها — سبد خرید، حساب کاربری، جستجو، منو — همه کنار هم سمت راست صفحه */}
          <div className="flex items-center gap-3" style={{ pointerEvents: "auto", flexShrink: 0, order: 1 }}>
            <button
              onClick={() => setCartOpen(true)}
              className={`relative flex items-center justify-center ${cartBump ? "cart-bump" : ""}`}
              aria-label="سبد خرید"
              style={{ width: 36, height: 36, order: 4 }}
            >
              <span className="icon-gold-wave" style={{ animationDelay: "5.25s" }}>
                <ShoppingCart size={20} />
              </span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -left-1.5 bg-gold rounded-full text-xs flex items-center justify-center"
                  style={{ width: 18, height: 18, color: "#FFFFFF", fontWeight: 700 }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* دکمه‌ی «حساب کاربری من» — اگر عضو نباشد با کلیک، فرم ثبت‌نام رایگان باز می‌شود؛
                اگر عضو باشد مستقیم به داشبورد شخصی‌اش می‌رود. */}
            <button
              onClick={requestAccountView}
              aria-label="حساب کاربری من"
              title="حساب کاربری من"
              className="flex items-center justify-center"
              style={{ width: 36, height: 36, order: 3 }}
            >
              <span className="icon-gold-wave" style={{ animationDelay: "3.5s" }}>
                <User size={19} />
              </span>
            </button>

            <button
              onClick={() => { setSearchOpen(true); setSearchDraft(searchTerm); }}
              aria-label="جستجوی محصول"
              className="flex items-center justify-center"
              style={{ width: 36, height: 36, order: 2 }}
            >
              <span className="icon-gold-wave" style={{ animationDelay: "1.75s" }}>
                <Search size={19} />
              </span>
            </button>

            <div style={{ position: "relative", order: 1 }}>
              <button
                onClick={() => {
                  if (menuOpen) {
                    window.history.back();
                  } else {
                    setMenuOpen(true);
                    setMenuNav(null);
                    pushNavPreserve({ menuOpen: true });
                  }
                  dismissMenuHint();
                  setMenuTapFxKey((k) => k + 1);
                }}
                aria-label="منو"
                className="flex items-center justify-center"
                style={{
                  position: "relative", zIndex: 2, width: 36, height: 36,
                }}
              >
                <span className="icon-gold-wave">
                  <Menu size={20} />
                </span>
              </button>
              {!menuOpen && (
                <>
                  <span
                    className="menu-hint-glow"
                    style={{
                      position: "absolute", top: "50%", left: "50%", width: 40, height: 40,
                      borderRadius: "50%", pointerEvents: "none", zIndex: 0,
                      background: "radial-gradient(circle, rgba(255,62,142,0.6), rgba(123,92,246,0.4) 55%, transparent 75%)",
                    }}
                  />
                  <span
                    className="menu-hint-ripple"
                    style={{
                      position: "absolute", top: "50%", left: "50%", width: 30, height: 30,
                      borderRadius: "50%", border: "2px solid #FF3E8E", pointerEvents: "none", zIndex: 0,
                    }}
                  />
                  <span
                    className="menu-hint-finger"
                    style={{ position: "absolute", top: "50%", left: "50%", fontSize: 22, pointerEvents: "none", zIndex: 3 }}
                  >
                    👆
                  </span>
                  {/* برچسب «menu» — با همان انیمیشن انگشت، هم‌زمان و هم‌جهت با آن جابه‌جا می‌شود */}
                  <span
                    className="menu-hint-finger"
                    dir="ltr"
                    style={{
                      position: "absolute", top: "calc(50% - 34px)", left: "calc(50% + 2px)",
                      whiteSpace: "nowrap", fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
                      color: "#FFFFFF", background: "linear-gradient(135deg, #FF3E8E, #7B5CF6)",
                      padding: "2px 8px", borderRadius: 999, pointerEvents: "none", zIndex: 3,
                      boxShadow: "0 3px 10px -3px rgba(255,62,142,0.6)",
                    }}
                  >
                    menu
                  </span>
                </>
              )}
              {/* جلوه‌ی «تپش لمس» — هر بار که روی دکمه‌ی منو کلیک می‌شود (نه فقط اولین بار)، کلمه‌ی
                  menu بزرگ و پررنگ ظاهر می‌شود و در دل چند حلقه‌ی موج رنگی محو می‌شود. با تغییر
                  key در هر کلیک، انیمیشن از نو اجرا می‌شود حتی اگر کلیک قبلی هنوز تمام نشده باشد. */}
              {menuTapFxKey > 0 && (
                <span key={menuTapFxKey} style={{ position: "absolute", top: "50%", left: "50%", pointerEvents: "none", zIndex: 6 }}>
                  <span className="menu-tap-ripple" style={{ position: "absolute", top: 0, left: 0, width: 26, height: 26, borderRadius: "50%", border: "2.5px solid #FF3E8E" }} />
                  <span className="menu-tap-ripple" style={{ position: "absolute", top: 0, left: 0, width: 26, height: 26, borderRadius: "50%", border: "2.5px solid #7B5CF6", animationDelay: "0.12s" }} />
                  <span className="menu-tap-ripple" style={{ position: "absolute", top: 0, left: 0, width: 26, height: 26, borderRadius: "50%", border: "2.5px solid #00C2CB", animationDelay: "0.24s" }} />
                  <span
                    className="menu-tap-word"
                    dir="ltr"
                    style={{
                      position: "absolute", top: 0, left: 0, whiteSpace: "nowrap",
                      fontSize: 14, fontWeight: 800, letterSpacing: 0.5, lineHeight: 1,
                      color: "#FFFFFF", background: "linear-gradient(135deg, #FF3E8E, #7B5CF6, #00C2CB)",
                      padding: "6px 14px", borderRadius: 999,
                      boxShadow: "0 4px 14px -2px rgba(123,92,246,0.55)",
                    }}
                  >
                    menu
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

        {menuOpen && (
          <>
            {/* پرده‌ی نیمه‌شفاف روی قسمت دیگر صفحه — لمس آن هم منو را می‌بندد */}
            <div
              className="sm:hidden"
              onClick={() => window.history.back()}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                right: "min(340px, 85vw)",
                zIndex: 45,
                background: "rgba(36,30,61,0.45)",
              }}
            />
            {/* خودِ کشوی منو — چسبیده به دیواره‌ی راست صفحه (متناسب با راست‌چین بودن سایت)،
                فاصله‌ی خالی سمت چپ باقی می‌ماند. زدایش z-index بالاتر از هدر/نوار اعلان تضمین می‌کند
                که ردیف بالای منو (عنوان «منو» + دکمه‌ی بستن ✕) همیشه دیده شود و پشت هدر پنهان نشود. */}
            <div
              className="sm:hidden flex flex-col gap-1 text-sm text-muted menu-drawer"
              style={{
                position: "fixed",
                top: 0,
                bottom: 0,
                right: 0,
                width: "min(340px, 85vw)",
                zIndex: 46,
                background: "#FFFCF7",
                padding: "16px",
                paddingTop: 16,
                overflowY: "auto",
                boxShadow: "-8px 0 24px -8px rgba(36,30,61,0.25)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-display" style={{ fontSize: 16 }}>منو</span>
                <button onClick={() => window.history.back()} aria-label="بستن منو">
                  <X size={22} color="#241E3D" />
                </button>
              </div>
            {menuNav === null && (
              <>
                <button onClick={() => onMenuCategoryClick("all")} className="text-right py-1">
                  همه محصولات
                </button>
                <button
                  onClick={() => { setBrandMenuOpen(true); setMenuOpen(false); replaceNavPreserve({ menuOpen: false }); }}
                  className="text-right py-1 text-gold"
                >
                  انتخاب بر اساس برند
                </button>
                {CATEGORY_ORDER.map((c) => (
                  <button
                    key={c}
                    onClick={() => onMenuCategoryClick(c)}
                    className="text-right py-1 flex items-center justify-between"
                  >
                    <span>{CATEGORY_LABEL[c]}</span>
                    {CATEGORIES[c]?.subcategories && <span className="text-gold">‹</span>}
                  </button>
                ))}
                {isAdmin && (
                  <button onClick={() => { if (view === "admin") { closeMenu(); window.history.back(); } else { setView("admin"); closeMenu(); replaceNav({ view: "admin" }); } }} className="text-right py-1 text-gold">
                    {view === "admin" ? "بازگشت به فروشگاه" : "پنل مدیریت"}
                  </button>
                )}
                {user && (
                  <button
                    onClick={() => { closeMenu(); setView("account"); replaceNav({ view: "account" }); }}
                    className="text-right py-1 text-gold"
                  >
                    حساب کاربری من
                  </button>
                )}
                <button
                  onClick={() => {
                    const wasLoggedIn = !!user;
                    if (wasLoggedIn) { handleLogout(); } else { setAuthOpen(true); }
                    closeMenu();
                    replaceNavPreserve({ menuOpen: false, ...(wasLoggedIn ? { view: "store" } : {}) });
                  }}
                  className="text-right py-1"
                >
                  {user ? `خروج (${user.email})` : "ورود / ثبت‌نام"}
                </button>
              </>
            )}

            {menuNav && !menuNav.subcategory && (
              <>
                <button onClick={() => setMenuNav(null)} className="text-right py-1 text-gold flex items-center gap-1">
                  <span>›</span> بازگشت
                </button>
                <p className="font-display" style={{ fontSize: 15, color: "#241E3D", margin: "4px 0" }}>
                  {CATEGORY_LABEL[menuNav.category]}
                </p>
                <button onClick={() => onMenuSubcategoryClick(menuNav.category, "all")} className="text-right py-1">
                  همه‌ی {CATEGORY_LABEL[menuNav.category]}
                </button>
                {Object.keys(CATEGORIES[menuNav.category].subcategories).map((subKey) => (
                  <button
                    key={subKey}
                    onClick={() => onMenuSubcategoryClick(menuNav.category, subKey)}
                    className="text-right py-1 flex items-center justify-between"
                  >
                    <span>{subcategoryLabel(menuNav.category, subKey)}</span>
                    {subcategoryTypes(menuNav.category, subKey) && <span className="text-gold">‹</span>}
                  </button>
                ))}
              </>
            )}

            {menuNav && menuNav.subcategory && (
              <>
                <button onClick={() => setMenuNav({ category: menuNav.category })} className="text-right py-1 text-gold flex items-center gap-1">
                  <span>›</span> بازگشت
                </button>
                <p className="font-display" style={{ fontSize: 15, color: "#241E3D", margin: "4px 0" }}>
                  {subcategoryLabel(menuNav.category, menuNav.subcategory)}
                </p>
                <button
                  onClick={() => onMenuTypeClick(menuNav.category, menuNav.subcategory, "all")}
                  className="text-right py-1"
                >
                  همه‌ی {subcategoryLabel(menuNav.category, menuNav.subcategory)}
                </button>
                {menuNav.category === "perfume" && Object.keys(activeFacets).length > 0 && (
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      onClick={() => setActiveFacets({})}
                      className="btn-ghost rounded-full px-3 py-1 text-xs"
                      style={{ borderColor: "#FF3E8E", color: "#FF3E8E" }}
                    >
                      پاک کردن همه‌ی فیلترها ✕
                    </button>
                  </div>
                )}
                {isGroupedTypes(subcategoryTypes(menuNav.category, menuNav.subcategory)) ? (
                  subcategoryTypes(menuNav.category, menuNav.subcategory).map((g) => (
                    <div key={g.group} className="mb-2">
                      <p className="text-gold" style={{ fontSize: 12, margin: "6px 0 4px" }}>
                        {g.group}
                        {menuNav.category === "perfume" && (g.multi === false ? " (فقط یک گزینه)" : " (می‌توانی چند مورد انتخاب کنی)")}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {Object.entries(g.options).map(([typeKey, label]) => {
                          const isSelected = menuNav.category === "perfume" && (activeFacets[g.key] || []).includes(typeKey);
                          return (
                            <button
                              key={typeKey}
                              onClick={() => onMenuTypeClick(menuNav.category, menuNav.subcategory, typeKey, g.key, g.multi)}
                              className="btn-ghost text-right rounded-lg px-3 py-1.5 flex items-center justify-between"
                              style={
                                isSelected
                                  ? { fontSize: 13, borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" }
                                  : { fontSize: 13 }
                              }
                            >
                              <span>{label}</span>
                              {isSelected && <Check size={13} color="#2563EB" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {Object.entries(subcategoryTypes(menuNav.category, menuNav.subcategory)).map(([typeKey, label]) => (
                      <button
                        key={typeKey}
                        onClick={() => onMenuTypeClick(menuNav.category, menuNav.subcategory, typeKey)}
                        className="btn-ghost text-right rounded-lg px-3 py-1.5"
                        style={{ fontSize: 13 }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                {menuNav.category === "perfume" && (
                  <button
                    onClick={() => { closeMenu(); replaceNav({ activeCategory: menuNav.category, activeSubcategory: menuNav.subcategory, categoryPageOpen: true }); }}
                    className="btn-gold pulse-glow rounded-full mt-3 self-start relative overflow-hidden flex items-center justify-center"
                    style={{ padding: "16px 40px", fontSize: 16, fontWeight: 800, letterSpacing: 0.3 }}
                  >
                    <span className="glint" />
                    <span style={{ position: "relative", textShadow: "0 1px 0 rgba(255,255,255,0.35), 0 2px 5px rgba(123,92,246,0.55)" }}>
                      نمایش نتایج
                    </span>
                  </button>
                )}
              </>
            )}
            </div>
          </>
        )}

      {/* پنل جستجوی محصول */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4" style={{ background: "rgba(36,30,61,0.45)", paddingTop: "15vh" }} onClick={() => setSearchOpen(false)}>
          <div className="bg-panel-2 rounded-lg p-5 w-full border border-hair" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <form
              onSubmit={(e) => { e.preventDefault(); performSearch(searchDraft); }}
              className="flex items-center gap-2"
            >
              <Search size={18} color="#FF3E8E" />
              <input
                autoFocus
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="نام محصول را جستجو کن..."
                className="bg-panel border border-hair rounded px-3 py-2 text-sm flex-1"
                style={{ color: "#241E3D" }}
              />
              <button type="submit" className="btn-gold rounded px-4 py-2 text-sm">جستجو</button>
              <button type="button" onClick={() => setSearchOpen(false)}><X size={18} color="#241E3D" /></button>
            </form>
          </div>
        </div>
      )}

      {/* پنل انتخاب بر اساس برند — از منوی کشویی باز می‌شود */}
      {brandMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(36,30,61,0.45)" }} onClick={() => setBrandMenuOpen(false)}>
          <div className="bg-panel-2 rounded-lg p-6 w-full border border-hair" style={{ maxWidth: 380, maxHeight: "70vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display" style={{ fontSize: 17 }}>انتخاب بر اساس برند</h3>
              <button onClick={() => setBrandMenuOpen(false)}><X size={18} color="#241E3D" /></button>
            </div>
            {allBrands.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 13 }}>هنوز برندی ثبت نشده است.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {allBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => selectBrand(b)}
                    className="text-right py-2 px-2 rounded hover:bg-panel"
                    style={{ fontSize: 14 }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!hasTopBanner && <div style={{ height: "12mm" }} />}

      {view === "admin" && isAdmin ? (
        <AdminPanel
          products={products}
          onAdd={addProduct}
          onUpdate={updateProduct}
          onRemove={deleteProduct}
          onUploadImage={uploadImage}
          storageError={storageError}
          heroBanners={heroBanners}
          onUpdateHeroBanners={updateHeroBanners}
          globalDiscountPercent={globalDiscountPercent}
          onUpdateGlobalDiscount={updateGlobalDiscount}
          categoryBanners={categoryBanners}
          onUpdateCategoryBanners={updateCategoryBanners}
          onExtractProductInfo={extractProductInfo}
          onSearchPerfume={searchPerfumeByName}
          onGetPerfumeDetails={getPerfumeDetails}
          onTranslatePerfumeText={translatePerfumeText}
          onLookupBarcode={lookupBarcode}
        />
      ) : view === "account" && user ? (
        <AccountPage
          user={user}
          orders={orders}
          loading={ordersLoading}
          error={ordersError}
          onRetry={loadOrders}
          onLogout={handleLogout}
          onBack={() => window.history.back()}
        />
      ) : openProductId ? (
        <ProductDetailPage
          product={products.find((p) => p.id === openProductId)}
          onBack={() => window.history.back()}
          onAdd={addToCart}
          globalDiscountPercent={globalDiscountPercent}
        />
      ) : (
        <>
          {!categoryPageOpen && (
          <>
          {heroBanners.length > 0 && (
            <section className="relative w-full overflow-hidden" style={{ height: "clamp(320px, 62vh, 620px)" }}>
              {(() => {
                const banner = normalizeBanner(heroBanners[bannerIndex]);
                if (banner.type === "video") {
                  return (
                    <video
                      key={bannerIndex}
                      src={banner.url}
                      autoPlay
                      muted
                      loop={heroBanners.length === 1}
                      playsInline
                      className="fade-in-up"
                      style={{ ...productImageStyle(banner), position: "absolute", inset: 0 }}
                      onEnded={() => {
                        if (heroBanners.length > 1) setBannerIndex((i) => (i + 1) % heroBanners.length);
                      }}
                    />
                  );
                }
                return (
                  <img
                    key={bannerIndex}
                    src={banner.url}
                    alt={`بنر تبلیغاتی ${bannerIndex + 1}`}
                    className="fade-in-up"
                    style={{ ...productImageStyle(banner), position: "absolute", inset: 0 }}
                  />
                );
              })()}
              {heroBanners.length > 1 && (
                <div className="absolute flex items-center gap-1.5" style={{ bottom: 14, left: "50%", transform: "translateX(-50%)" }}>
                  {heroBanners.map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: i === bannerIndex ? 18 : 6,
                        height: 6,
                        borderRadius: 999,
                        background: i === bannerIndex ? "#FF3E8E" : "rgba(255,255,255,0.6)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {heroBanners.length === 0 && (
          <>
          {/* Hero */}
          <section className="relative overflow-hidden px-4 sm:px-8 lg:px-12 py-10 sm:py-16 flex flex-col sm:flex-row items-center gap-8 sm:gap-10 max-w-6xl xl:max-w-7xl mx-auto">
            <div className="flex-1 order-2 sm:order-1 text-center sm:text-right" style={{ position: "relative", zIndex: 1 }}>
              <p className="font-latin text-gold" style={{ fontSize: 13, marginBottom: 10 }}>PARFUM · BEAUTY · CARE</p>
              <h1 className="font-display" style={{ fontSize: "clamp(28px,5vw,44px)", lineHeight: 1.35 }}>
                ظرافتی که قبل از دیده شدن،<br />حس می‌شود
              </h1>
              <p className="text-muted mt-4" style={{ fontSize: 15, maxWidth: 440 }}>
                گزیده‌ای از عطرهای اصیل، محصولات آرایشی-بهداشتی و لوازم برقی شخصی؛
                برای لحظه‌هایی که کیفیت را می‌شناسند.
              </p>
              <button
                onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
                className="btn-gold pulse-glow rounded px-6 py-3 mt-6 text-sm font-medium"
              >
                مشاهده محصولات
              </button>
            </div>

            <div className="flex-1 order-1 sm:order-2 flex justify-center" style={{ position: "relative", zIndex: 1 }}>
              <div className="float-slow" style={{ position: "relative", width: 150, height: 200 }}>
                <svg width="150" height="200" viewBox="0 0 150 200" fill="none">
                  <rect x="55" y="10" width="40" height="24" rx="4" fill="#FF3E8E" />
                  <rect x="62" y="0" width="26" height="14" rx="3" fill="#7B5CF6" />
                  <rect x="30" y="34" width="90" height="150" rx="14" fill="url(#bottleGrad)" stroke="#7B5CF6" strokeWidth="1.5" />
                  <rect x="30" y="90" width="90" height="94" rx="14" fill="url(#liquidGrad)" opacity="0.9" />
                  <defs>
                    <linearGradient id="bottleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#FFE1F0" />
                      <stop offset="1" stopColor="#F3E9FF" />
                    </linearGradient>
                    <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#FF7CB3" />
                      <stop offset="1" stopColor="#00C2CB" />
                    </linearGradient>
                  </defs>
                </svg>
                <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 14 }}>
                  <div className="glint" />
                </div>
                <span className="sparkle" style={{ position: "absolute", top: 6, right: -6, width: 6, height: 6, borderRadius: "50%", background: "#FFD23F", boxShadow: "0 0 8px 2px rgba(255,210,63,0.85)" }} />
                <span className="sparkle" style={{ position: "absolute", top: "45%", left: -12, width: 5, height: 5, borderRadius: "50%", background: "#FFD23F", boxShadow: "0 0 8px 2px rgba(255,210,63,0.85)", animationDelay: "0.8s" }} />
                <span className="sparkle" style={{ position: "absolute", bottom: 14, right: 10, width: 4, height: 4, borderRadius: "50%", background: "#FFD23F", boxShadow: "0 0 6px 2px rgba(255,210,63,0.85)", animationDelay: "1.6s" }} />
              </div>
            </div>
          </section>
          </>
          )}

          {/* Category strip */}
          <section className="px-4 sm:px-8 lg:px-12 max-w-6xl xl:max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-4 gap-x-0 mb-12">
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                onClick={() => { selectCategory(c); pushNav({ activeCategory: c, categoryPageOpen: c !== "all" }); }}
                className={`${CATEGORY_CARD_CLASS[c]} category-card rounded-xl p-5 flex items-center gap-4 border border-hair text-right`}
              >
                <CategoryIcon category={c} size={42} />
                <div>
                  <p className="font-display" style={{ fontSize: 16 }}>{CATEGORY_LABEL[c]}</p>
                  <p className="text-muted" style={{ fontSize: 12 }}>
                    {products.filter((p) => p.category === c).length} محصول
                  </p>
                </div>
              </button>
            ))}
          </section>
          </>
          )}

          {categoryPageOpen && (() => {
            const categoryBanner = currentCategoryBanner;
            // مسیر (breadcrumb) دسته/زیرشاخه/نوع — کوچک و کم‌رنگ، دقیقاً مثل مسیر ریز زیر بنر در
            // سایت‌های معتبر فروش آنلاین؛ همیشه در ناحیه‌ی ساده‌ی زیر بنر (نه روی خودِ بنر) می‌آید تا توجه را از محصولات نگیرد.
            const breadcrumbContent = (
              <>
                <span>{CATEGORY_LABEL[activeCategory]}</span>
                {activeSubcategory !== "all" && (
                  <>
                    <span style={{ opacity: 0.6 }}> / </span>
                    <span>{subcategoryLabel(activeCategory, activeSubcategory)}</span>
                  </>
                )}
                {activeCategory !== "perfume" && activeType !== "all" && (
                  <>
                    <span style={{ opacity: 0.6 }}> / </span>
                    <span>{typeLabel(activeCategory, activeSubcategory, activeType)}</span>
                  </>
                )}
              </>
            );
            // عنوان بزرگِ روی بنر همیشه برچسبِ خودِ مقصد نهایی است (نوع اگر انتخاب شده، وگرنه زیرشاخه، وگرنه دسته)
            const destinationLabel =
              (activeCategory !== "perfume" && activeType !== "all" && typeLabel(activeCategory, activeSubcategory, activeType)) ||
              subcategoryLabel(activeCategory, activeSubcategory) ||
              CATEGORY_LABEL[activeCategory];
            return (
              <>
                {categoryBanner && (
                  <section className="relative w-full overflow-hidden" style={{ height: "clamp(240px, 42vh, 420px)" }}>
                    {categoryBanner.type === "video" ? (
                      <video
                        key={categoryBanner.url}
                        src={categoryBanner.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ ...productImageStyle(categoryBanner), position: "absolute", inset: 0 }}
                      />
                    ) : (
                      <img
                        src={categoryBanner.url}
                        alt={destinationLabel}
                        style={{ ...productImageStyle(categoryBanner), position: "absolute", inset: 0 }}
                      />
                    )}
                    <div
                      style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(0deg, rgba(36,30,61,0.6), rgba(36,30,61,0) 55%)",
                      }}
                    />
                    <div style={{ position: "absolute", bottom: 18, insetInlineStart: 18, insetInlineEnd: 18 }}>
                      <h1 className="font-display" style={{ fontSize: 24, color: "#FFFFFF" }}>{destinationLabel}</h1>
                    </div>
                  </section>
                )}
                <div className="px-4 sm:px-8 lg:px-12 max-w-6xl xl:max-w-7xl mx-auto pt-6 pb-2">
                  {searchTerm ? (
                    <h1 className="font-display" style={{ fontSize: 22 }}>نتایج جستجو برای «{searchTerm}»</h1>
                  ) : (
                    <p style={{ fontSize: 11.5, color: "#756E93" }}>{breadcrumbContent}</p>
                  )}
                </div>
              </>
            );
          })()}

          {/* Catalog */}
          <section id="catalog" className="px-4 sm:px-8 lg:px-12 max-w-6xl xl:max-w-7xl mx-auto pb-20">
            {storageError && !loading && (
              <p className="mb-4 rounded p-3" style={{ fontSize: 13, background: "rgba(214,51,108,0.12)", color: "#D6336C" }}>
                اتصال به سرور فروشگاه برقرار نشد. لطفاً چند لحظه صبر کن و صفحه را رفرش کن.
              </p>
            )}
            {!categoryPageOpen && (
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} color="#FF3E8E" />
                <h2 className="font-display" style={{ fontSize: 20 }}>
                  {activeCategory === "all" ? "محصولات منتخب" : CATEGORY_LABEL[activeCategory]}
                </h2>
              </div>
            )}

            {activeSubcategories && !CATEGORIES_WITHOUT_PAGE_SUBCATEGORY_PILLS.includes(activeCategory) && activeSubcategory === "all" && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => selectSubcategory("all")}
                  className="btn-ghost rounded-full px-3 py-1.5 text-xs"
                  style={activeSubcategory === "all" ? { borderColor: "#FF3E8E", color: "#FF3E8E" } : undefined}
                >
                  همه
                </button>
                {Object.keys(activeSubcategories).map((key) => (
                  <button
                    key={key}
                    onClick={() => selectSubcategory(key)}
                    className="btn-ghost rounded-full px-3 py-1.5 text-xs"
                    style={activeSubcategory === key ? { borderColor: "#FF3E8E", color: "#FF3E8E" } : undefined}
                  >
                    {subcategoryLabel(activeCategory, key)}
                  </button>
                ))}
              </div>
            )}

            {categoryPageOpen && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-muted" style={{ fontSize: 12 }}>برند:</span>
                <select
                  value={activeBrand}
                  onChange={(e) => setActiveBrand(e.target.value)}
                  className="bg-panel-2 border border-hair rounded-full px-3 py-1.5 text-xs"
                  style={{ color: "#241E3D" }}
                >
                  <option value="all">همه‌ی برندها</option>
                  {brandsInCategory.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-hair overflow-hidden">
                    <div className="skeleton" style={{ height: 168 }} />
                    <div className="p-4 flex flex-col gap-2">
                      <div className="skeleton" style={{ height: 10, width: "40%", borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 14, width: "70%", borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 10, width: "90%", borderRadius: 4 }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="text-muted">محصولی در این دسته ثبت نشده است.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredProducts.map((p, i) => (
                  <div key={p.id} className="fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}>
                    <ProductCard product={p} onOpen={openProduct} globalDiscountPercent={globalDiscountPercent} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* دکمه‌ی ورود به پنل مدیریت — فقط برای مدیر سایت قابل مشاهده است.
          اگر کاربر لاگین نیست، اول فرم ورود باز می‌شود. */}
      <button
        onClick={requestAdminView}
        title="ورود مدیر"
        className="fixed z-20 flex items-center justify-center rounded-full"
        style={{
          bottom: 20,
          left: 20,
          width: 42,
          height: 42,
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(123,92,246,0.3)",
          boxShadow: "0 4px 14px -4px rgba(123,92,246,0.35)",
        }}
      >
        <Lock size={16} color="#7B5CF6" />
      </button>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end" style={{ background: "rgba(36,30,61,0.45)" }} onClick={() => setCartOpen(false)}>
          <div
            className="cart-drawer bg-panel-2 h-full w-full sm:w-96 p-5 flex flex-col border-hair"
            style={{ borderInlineStart: "1px solid rgba(123,92,246,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display" style={{ fontSize: 18 }}>سبد خرید</h3>
              <button onClick={() => setCartOpen(false)}><X size={20} color="#241E3D" /></button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 14 }}>سبد خرید شما خالی است.</p>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                {cartItems.map((item) => (
                  <div key={item.cartKey} className="flex items-center gap-3 border-b border-hair pb-3">
                    <div className="flex items-center justify-center rounded overflow-hidden" style={{ width: 44, height: 44, background: "#FFFFFF", border: "1px solid rgba(123,92,246,0.15)" }}>
                      {(item.variant && item.variant.image) || item.image ? (
                        <img
                          src={framedProductImageUrl((item.variant && item.variant.image) || item.image)}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : item.variant && item.variant.hex ? (
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: item.variant.hex, border: "1px solid rgba(123,92,246,0.4)" }} />
                      ) : (
                        <CategoryIcon category={item.category} size={22} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: 13 }}>{item.name}</p>
                      {item.variant && (
                        <p className="text-gold" style={{ fontSize: 11 }}>{item.variant.label}</p>
                      )}
                      <p className="text-muted" style={{ fontSize: 11 }}>
                        {item.originalPrice > item.price && (
                          <span style={{ textDecoration: "line-through", marginInlineEnd: 6 }}>{fmtPrice(item.originalPrice)}</span>
                        )}
                        {fmtPrice(item.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => changeQty(item.cartKey, -1)}><Minus size={14} color="#7B5CF6" /></button>
                      <span style={{ fontSize: 13 }}>{item.qty}</span>
                      <button onClick={() => changeQty(item.cartKey, 1)}><Plus size={14} color="#7B5CF6" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.cartKey)}><Trash2 size={15} color="#756E93" /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-hair">
              <div className="flex items-center justify-between mb-4" style={{ fontSize: 14 }}>
                <span className="text-muted">جمع کل</span>
                <span style={{ fontWeight: 700 }}>{fmtPrice(cartTotal)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || checkoutLoading}
                className="btn-gold w-full rounded py-3 text-sm font-medium"
              >
                {checkoutLoading ? "در حال اتصال به درگاه..." : user ? "پرداخت و تکمیل سفارش" : "ورود و پرداخت"}
              </button>
              {checkoutError && (
                <p className="mt-2" style={{ fontSize: 11, color: "#D6336C" }}>{checkoutError}</p>
              )}
              <p className="text-muted mt-2" style={{ fontSize: 10 }}>
                پرداخت از طریق درگاه زرین‌پال انجام می‌شود.
              </p>
            </div>
          </div>
        </div>
      )}

      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(36,30,61,0.45)" }} onClick={() => setAuthOpen(false)}>
          <div className="bg-panel-2 rounded-lg p-6 w-full border border-hair" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display" style={{ fontSize: 17 }}>
                {authMode === "login" ? "ورود به حساب کاربری" : "ساخت حساب کاربری"}
              </h3>
              <button onClick={() => setAuthOpen(false)}><X size={18} color="#241E3D" /></button>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              {authMode === "register" && (
                <input
                  placeholder="نام و نام خانوادگی"
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  className="bg-panel border border-hair rounded px-3 py-2 text-sm"
                  style={{ color: "#241E3D" }}
                />
              )}
              <input
                type="email"
                required
                placeholder="ایمیل"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="bg-panel border border-hair rounded px-3 py-2 text-sm"
                style={{ color: "#241E3D" }}
              />
              <input
                type="password"
                required
                placeholder="رمز عبور (حداقل ۶ کاراکتر)"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="bg-panel border border-hair rounded px-3 py-2 text-sm"
                style={{ color: "#241E3D" }}
              />
              {authError && <p style={{ fontSize: 12, color: "#D6336C" }}>{authError}</p>}
              <button type="submit" disabled={authLoading} className="btn-gold rounded py-2.5 text-sm font-medium">
                {authLoading ? "در حال ارسال..." : authMode === "login" ? "ورود" : "ثبت‌نام"}
              </button>
            </form>

            <button
              onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }}
              className="text-gold mt-4 w-full text-center"
              style={{ fontSize: 12 }}
            >
              {authMode === "login" ? "حساب کاربری نداری؟ ثبت‌نام کن" : "قبلاً ثبت‌نام کردی؟ وارد شو"}
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-hair px-4 sm:px-8 py-8 text-center text-muted" style={{ fontSize: 12 }}>
        © گالری آرایشی، بهداشتی و ادکلن جردن — فروشگاه آنلاین عطر، آرایشی-بهداشتی و لوازم برقی شخصی
      </footer>
    </div>
  );
}

function emptyForm() {
  return { id: null, name: "", nameEn: "", brand: "", barcode: "", category: "perfume", subcategory: "", type: "", facets: {}, price: "", discountPercent: "", description: "", properties: "", ingredients: "", topNotes: "", middleNotes: "", baseNotes: "", longevity: "", sillage: "", perfumer: "", countryOfOrigin: "", yearMade: "", fragranticaRating: "", volume: "", image: "", imageFit: "contain", imagePosX: 50, imagePosY: 50, imageZoom: 1, variantsList: [] };
}

function VariantRowEditor({ variant, onChange, onRemove, onUploadImage }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("فایل انتخاب‌شده تصویر نیست");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const url = await onUploadImage(base64);
      onChange({ ...variant, image: url });
    } catch (err) {
      setError(err.message || "آپلود تصویر ناموفق بود");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-panel-2 border border-hair rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          placeholder="نام/شماره رنگ (مثلاً 999 - قرمز کلاسیک)"
          value={variant.label}
          onChange={(e) => onChange({ ...variant, label: e.target.value })}
          className="bg-panel border border-hair rounded px-2 py-1.5 text-xs flex-1"
          style={{ color: "#241E3D" }}
        />
        <input
          type="color"
          value={variant.hex || "#CCCCCC"}
          onChange={(e) => onChange({ ...variant, hex: e.target.value })}
          title="رنگ پایه (اگه عکس نذاری همین رنگ به‌جای دایره نمایش داده می‌شود)"
          style={{ width: 34, height: 30, padding: 0, border: "1px solid rgba(123,92,246,0.3)", borderRadius: 6, background: "none", flexShrink: 0 }}
        />
        <button type="button" onClick={onRemove} className="btn-ghost rounded px-2 py-1.5 text-xs" style={{ color: "#D6336C", flexShrink: 0 }}>
          حذف
        </button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {variant.image ? (
          <img src={variant.image} alt={variant.label} style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover", border: "1px solid rgba(123,92,246,0.3)" }} />
        ) : (
          <span style={{ width: 34, height: 34, borderRadius: 6, background: variant.hex || "#EEE", border: "1px solid rgba(123,92,246,0.3)" }} />
        )}
        <label
          className="btn-ghost rounded px-3 py-1.5 text-xs flex items-center gap-1.5"
          style={{ cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.6 : 1 }}
        >
          <Upload size={13} />
          {uploading ? "در حال آپلود..." : variant.image ? "تغییر عکس این رنگ" : "افزودن عکس این رنگ"}
          <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: "none" }} />
        </label>
        {variant.image && (
          <button type="button" onClick={() => onChange({ ...variant, image: "" })} className="text-muted" style={{ fontSize: 11 }}>
            حذف عکس
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: 11, color: "#D6336C" }}>{error}</p>}
    </div>
  );
}

function AdminPanel({ products, onAdd, onUpdate, onRemove, onUploadImage, storageError, heroBanners, onUpdateHeroBanners, globalDiscountPercent, onUpdateGlobalDiscount, categoryBanners, onUpdateCategoryBanners, onExtractProductInfo, onSearchPerfume, onGetPerfumeDetails, onTranslatePerfumeText, onLookupBarcode }) {
  const [bannerDrafts, setBannerDrafts] = useState((heroBanners || []).map(normalizeBanner));
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroError, setHeroError] = useState("");
  const [heroSaved, setHeroSaved] = useState(false);
  // بنر اختصاصی هر صفحه‌ی دسته‌بندی — نسخه‌ی محلی قابل‌ویرایش از categoryBanners، تا وقتی «ذخیره» زده شود ارسال نمی‌شود.
  const [catBannerDrafts, setCatBannerDrafts] = useState(categoryBanners || {});
  const [catBannerCategory, setCatBannerCategory] = useState(CATEGORY_ORDER[0]);
  const [catBannerSubcategory, setCatBannerSubcategory] = useState("");
  const [catBannerType, setCatBannerType] = useState("");
  const [catBannerUploading, setCatBannerUploading] = useState(false);
  const [catBannerSaving, setCatBannerSaving] = useState(false);
  const [catBannerError, setCatBannerError] = useState("");
  const [catBannerSaved, setCatBannerSaved] = useState(false);
  const [discountDraft, setDiscountDraft] = useState(String(globalDiscountPercent || ""));
  const [discountSaving, setDiscountSaving] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [discountSaved, setDiscountSaved] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  // نتیجه‌ی آخرین «پیشنهاد خودکار» از روی نت‌ها — برای نمایش خلاصه‌ی اینکه چند نت شناسایی شد
  const [noteSuggestResult, setNoteSuggestResult] = useState(null);

  // ویژگی «جستجوی مشخصات ادکلن بر اساس نام محصول» (fraganty.ai) — جایگزین روش قبلیِ آپلود عکس.
  // مرحله‌ی ۱: مدیر اسم محصول را تایپ می‌کند و لیست کوتاهی از نتایج محتمل نشان داده می‌شود.
  // مرحله‌ی ۲: با انتخاب یکی از نتایج، جزئیات کامل گرفته می‌شود، نت‌ها و برند به فارسی ترجمه
  // می‌شوند (با پایگاه‌دانش خودمان)، و فرم پایین خودکار پر می‌شود — همیشه قابل ویرایش دستی.
  const [perfumeSearchQuery, setPerfumeSearchQuery] = useState("");
  const [perfumeSearchLoading, setPerfumeSearchLoading] = useState(false);
  const [perfumeSearchError, setPerfumeSearchError] = useState("");
  const [perfumeSearchResults, setPerfumeSearchResults] = useState([]);
  const [perfumeDetailsLoading, setPerfumeDetailsLoading] = useState(false);
  const [perfumeTranslating, setPerfumeTranslating] = useState(false);
  const [perfumeFillResult, setPerfumeFillResult] = useState(null);

  // کش ساده‌ی نتایج جستجو و جزئیات عطر در حافظه (فقط طول عمر همین صفحه) — چون سهمیه‌ی رایگان
  // fraganty.ai بسیار محدود است (۲۰ درخواست در ماه، و هر جستجو + هر انتخاب هرکدام یک درخواست
  // حساب می‌شوند)، این کش از هدررفتن سهمیه با جستجو یا انتخاب تکراریِ همون محصول جلوگیری می‌کند.
  const perfumeSearchCacheRef = useRef(new Map());
  const perfumeDetailsCacheRef = useRef(new Map());

  async function handlePerfumeSearch(e) {
    e.preventDefault();
    const q = perfumeSearchQuery.trim();
    if (!q) return;
    setPerfumeSearchError("");
    setPerfumeSearchResults([]);
    setPerfumeFillResult(null);
    const cacheKey = q.toLowerCase();
    const cached = perfumeSearchCacheRef.current.get(cacheKey);
    if (cached) {
      setPerfumeSearchResults(cached);
      if (cached.length === 0) setPerfumeSearchError("چیزی پیدا نشد — نام دیگه‌ای امتحان کن (مثلاً فقط اسم برند یا فقط اسم عطر)");
      return;
    }
    setPerfumeSearchLoading(true);
    try {
      const results = await onSearchPerfume(q);
      perfumeSearchCacheRef.current.set(cacheKey, results);
      setPerfumeSearchResults(results);
      if (results.length === 0) setPerfumeSearchError("چیزی پیدا نشد — نام دیگه‌ای امتحان کن (مثلاً فقط اسم برند یا فقط اسم عطر)");
    } catch (err) {
      setPerfumeSearchError(err.message || "جستجو ناموفق بود");
    } finally {
      setPerfumeSearchLoading(false);
    }
  }

  async function handlePickPerfumeResult(item) {
    setPerfumeSearchError("");
    setPerfumeFillResult(null);
    setPerfumeDetailsLoading(true);
    try {
      let details = perfumeDetailsCacheRef.current.get(item.id);
      if (!details) {
        details = await onGetPerfumeDetails(item.id);
        perfumeDetailsCacheRef.current.set(item.id, details);
      }
      // اگر fraganty.ai برای این شناسه با وضعیت موفق (200) ولی بدون داده‌ی واقعی پاسخ بدهد
      // (مثلاً به‌خاطر شناسه‌ی نامعتبر/قدیمی)، به‌جای پر کردن خاموشِ فرم با مقادیر خالی، خطای
      // روشن نشان می‌دهیم تا مدیر بداند باید نتیجه‌ی دیگری را امتحان کند یا دستی وارد کند.
      if (!details || !details.name) {
        throw new Error("اطلاعات کامل این محصول در fraganty.ai یافت نشد — یک نتیجه‌ی دیگر را امتحان کن یا فیلدها را دستی پر کن.");
      }
      const topFa = translateNotesArrayToFa(details.notes && details.notes.top);
      const middleFa = translateNotesArrayToFa(details.notes && details.notes.middle);
      const baseFa = translateNotesArrayToFa(details.notes && details.notes.base);
      const concKey = mapConcentrationLabelToKey(details.concentration);
      const suggestion = inferPerfumeFacetsFromNotes(topFa, middleFa, baseFa);

      setForm((f) => ({
        ...f,
        nameEn: details.name || f.nameEn,
        brand: translateBrandToFa(details.brand) || f.brand,
        topNotes: topFa || f.topNotes,
        middleNotes: middleFa || f.middleNotes,
        baseNotes: baseFa || f.baseNotes,
        perfumer:
          (Array.isArray(details.perfumers) && details.perfumers.map((p) => (typeof p === "string" ? p : p.name)).filter(Boolean).join("، ")) ||
          f.perfumer,
        yearMade: details.year ? String(details.year) : f.yearMade,
        facets: {
          ...f.facets,
          ...(concKey ? { concentration: [concKey] } : {}),
          scentFamily: suggestion.scentFamily,
          temperament: suggestion.temperament,
          fragranceNote: suggestion.fragranceNote,
        },
      }));
      setNoteSuggestResult(suggestion);
      setPerfumeSearchResults([]);
      setPerfumeSearchQuery("");
      setPerfumeFillResult({ name: details.name, brand: details.brand, translated: null });

      // توضیح کوتاه و ویژگی‌ها را جدا و به‌طور کامل فارسی از هوش مصنوعی می‌گیریم (این درخواست از
      // سهمیه‌ی fraganty.ai نیست، جدا و روی سرویس هوش مصنوعی خودمان است) — اگر ناموفق شد، بقیه‌ی
      // فرم که همین حالا پر شده دست‌نخورده می‌ماند و فقط این دو فیلد را باید دستی نوشت.
      setPerfumeTranslating(true);
      try {
        const translated = await onTranslatePerfumeText({
          name: details.name,
          brand: details.brand,
          description: details.description,
          accords: details.accords,
          seasons: details.seasons,
          dayNight: details.dayNight,
          gender: details.gender,
          rating: details.rating,
        });
        setForm((f) => ({
          ...f,
          description: (translated && translated.description) || f.description,
          properties: (translated && translated.properties) || f.properties,
        }));
        setPerfumeFillResult({ name: details.name, brand: details.brand, translated: true });
      } catch (translateErr) {
        setPerfumeFillResult({ name: details.name, brand: details.brand, translated: false });
      } finally {
        setPerfumeTranslating(false);
      }
    } catch (err) {
      setPerfumeSearchError(err.message || "دریافت جزئیات ناموفق بود");
    } finally {
      setPerfumeDetailsLoading(false);
    }
  }

  // اسکن بارکد — کار می‌کند در همه‌ی دسته‌ها، نه فقط ادکلن.
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeLookupLoading, setBarcodeLookupLoading] = useState(false);
  const [barcodeLookupMessage, setBarcodeLookupMessage] = useState(null); // { type: 'own'|'external'|'none'|'error', text }

  async function handleBarcodeDetected(code) {
    setScannerOpen(false);
    setForm((f) => ({ ...f, barcode: code }));
    setBarcodeLookupMessage(null);
    setBarcodeLookupLoading(true);
    try {
      const result = await onLookupBarcode(code);
      if (result.foundInOwnDb) {
        setBarcodeLookupMessage({
          type: "own",
          text: `این بارکد قبلاً برای «${result.product.name}» ثبت شده — اگه می‌خوای موجودی/قیمتش رو ویرایش کنی، از لیست پایین صفحه پیداش کن.`,
        });
      } else if (result.external && result.external.found) {
        const ext = result.external;
        // پیشنهاد خودکار حس رایحه/طبع/گروه بویایی فقط وقتی معنا دارد که نت‌ها موجود باشند —
        // نت‌ها فقط از لایه‌ی هوش مصنوعی (در صورت فعال بودن) می‌آیند، نه از پایگاه‌ی رایگان.
        const hasNotes = ext.topNotes || ext.middleNotes || ext.baseNotes;
        const suggestion = hasNotes ? inferPerfumeFacetsFromNotes(ext.topNotes, ext.middleNotes, ext.baseNotes) : null;
        const concKey = ext.concentration ? mapConcentrationLabelToKey(ext.concentration) : null;

        setForm((f) => ({
          ...f,
          name: f.name || ext.name || f.name,
          nameEn: f.nameEn || ext.title || f.nameEn,
          brand: f.brand || ext.brand || f.brand,
          image: f.image || ext.image || f.image,
          description: f.description || ext.description || f.description,
          properties: f.properties || ext.properties || f.properties,
          ingredients: f.ingredients || ext.ingredients || f.ingredients,
          volume: f.volume || ext.volume || f.volume,
          topNotes: f.topNotes || ext.topNotes || f.topNotes,
          middleNotes: f.middleNotes || ext.middleNotes || f.middleNotes,
          baseNotes: f.baseNotes || ext.baseNotes || f.baseNotes,
          perfumer: f.perfumer || ext.perfumer || f.perfumer,
          countryOfOrigin: f.countryOfOrigin || ext.countryOfOrigin || f.countryOfOrigin,
          yearMade: f.yearMade || ext.yearMade || f.yearMade,
          facets:
            suggestion
              ? {
                  ...f.facets,
                  ...(concKey ? { concentration: [concKey] } : {}),
                  scentFamily: suggestion.scentFamily,
                  temperament: suggestion.temperament,
                  fragranceNote: suggestion.fragranceNote,
                }
              : f.facets,
        }));
        if (suggestion) setNoteSuggestResult(suggestion);

        const sourceText =
          ext.source === "ai+free"
            ? "پایگاه‌ی باز رایگان + جستجوی هوشمند وب"
            : ext.source === "ai"
              ? "جستجوی هوشمند وب"
              : "پایگاه‌ی باز و رایگان Open Beauty/Food Facts";
        setBarcodeLookupMessage({
          type: "external",
          text: `از طریق ${sourceText} پیدا شد: «${ext.name || ext.title}» — فیلدهای موجود پر شدند؛ لطفاً همه (به‌خصوص نام فارسی و توضیح‌ها اگر پر نشدن) را قبل از ذخیره بازبینی و تکمیل کن.${result.note ? ` ${result.note}` : ""}`,
        });
      } else {
        setBarcodeLookupMessage({
          type: "none",
          text: `این بارکد در پایگاه‌ی باز رایگان پیدا نشد — کد بارکد ذخیره شد، بقیه‌ی فیلدها رو دستی پر کن.${result.note ? ` ${result.note}` : ""}`,
        });
      }
    } catch (err) {
      setBarcodeLookupMessage({ type: "error", text: err.message || "جستجوی بارکد ناموفق بود" });
    } finally {
      setBarcodeLookupLoading(false);
    }
  }

  function applyNoteSuggestion() {
    const result = inferPerfumeFacetsFromNotes(form.topNotes, form.middleNotes, form.baseNotes);
    setForm((f) => ({
      ...f,
      facets: {
        ...f.facets,
        scentFamily: result.scentFamily,
        temperament: result.temperament,
        fragranceNote: result.fragranceNote,
      },
    }));
    setNoteSuggestResult(result);
  }

  async function saveGlobalDiscount() {
    const pct = Number(discountDraft) || 0;
    if (pct < 0 || pct > 90) {
      setDiscountError("درصد تخفیف باید بین ۰ تا ۹۰ باشد");
      return;
    }
    setDiscountError("");
    setDiscountSaved(false);
    setDiscountSaving(true);
    try {
      await onUpdateGlobalDiscount(pct);
      setDiscountSaved(true);
    } catch (err) {
      setDiscountError(err.message || "ذخیره‌سازی ناموفق بود");
    } finally {
      setDiscountSaving(false);
    }
  }

  async function handleImageFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; // برای اینکه بشود دوباره همان فایل را انتخاب کرد
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("فایل انتخاب‌شده تصویر نیست");
      return;
    }
    setFormError("");
    setUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const url = await onUploadImage(base64);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      setFormError(err.message || "آپلود تصویر ناموفق بود");
    } finally {
      setUploading(false);
    }
  }

  async function handleHeroFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setHeroError("فایل انتخاب‌شده باید عکس یا کلیپ ویدئویی باشد");
      return;
    }
    setHeroError("");
    setHeroSaved(false);
    setHeroUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const url = await onUploadImage(base64);
      setBannerDrafts((prev) => [...prev, { type: isVideo ? "video" : "image", url }]);
    } catch (err) {
      setHeroError(err.message || "آپلود ناموفق بود");
    } finally {
      setHeroUploading(false);
    }
  }

  function removeBannerDraft(index) {
    setBannerDrafts((prev) => prev.filter((_, i) => i !== index));
    setHeroSaved(false);
  }

  function moveBannerDraft(index, dir) {
    setBannerDrafts((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return next;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setHeroSaved(false);
  }

  // تنظیمات دستی نمایش یک بنر مشخص از اسلایدر صفحه‌ی اصلی (حالت جاگیری/بزرگ‌نمایی/موقعیت) —
  // پیش‌فرض هر بنر تازه «پر کردن قاب» است (دقیقاً مثل رفتار قبلی)، پس تا وقتی این تنظیمات دستی
  // لمس نشوند، هر عکس یا ویدیوی جدید خودکار و بدون کشیدگی داخل قاب بنر جا می‌گیرد.
  function updateHeroBannerField(index, field, value) {
    setBannerDrafts((prev) => {
      const next = [...prev];
      const normalized = normalizeBanner(next[index]);
      next[index] = { ...normalized, [field]: value };
      return next;
    });
    setHeroSaved(false);
  }

  async function saveHeroBanners() {
    setHeroError("");
    setHeroSaved(false);
    setHeroSaving(true);
    try {
      await onUpdateHeroBanners(bannerDrafts);
      setHeroSaved(true);
    } catch (err) {
      setHeroError(err.message || "ذخیره‌سازی ناموفق بود");
    } finally {
      setHeroSaving(false);
    }
  }

  // نوع (مقصد نهایی) فقط وقتی معنا دارد که زیرشاخه انتخاب‌شده انواع داشته باشد و دسته ادکلن نباشد
  // (ادکلن فیلترهای ترکیب‌پذیر چندگانه دارد، نه یک «نوع» ثابت؛ پس مقصد نهایی‌اش خودِ زیرشاخه است)
  const catBannerTypesRaw = catBannerCategory !== "perfume" && catBannerSubcategory
    ? subcategoryTypes(catBannerCategory, catBannerSubcategory)
    : null;
  const catBannerTypeOptions = catBannerTypesRaw ? flattenTypes(catBannerTypesRaw) : null;

  // کلید تنظیم فعلی در پنل — از خاص به عام: "دسته:زیرشاخه:نوع" (مقصد نهایی، مثل کانسیلر)،
  // یا "دسته:زیرشاخه" (کل زیرشاخه، مثل «همه‌ی صورت»)، یا فقط نام دسته (کل دسته)
  const catBannerKey = catBannerType
    ? `${catBannerCategory}:${catBannerSubcategory}:${catBannerType}`
    : catBannerSubcategory
      ? `${catBannerCategory}:${catBannerSubcategory}`
      : catBannerCategory;
  const catBannerCurrent = catBannerDrafts[catBannerKey] ? normalizeBanner(catBannerDrafts[catBannerKey]) : null;
  const catBannerTargetLabel =
    (catBannerType && catBannerTypeOptions && catBannerTypeOptions[catBannerType]) ||
    (catBannerSubcategory && subcategoryLabel(catBannerCategory, catBannerSubcategory)) ||
    CATEGORY_LABEL[catBannerCategory];

  async function handleCatBannerFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setCatBannerError("فایل انتخاب‌شده باید عکس یا کلیپ ویدئویی باشد");
      return;
    }
    setCatBannerError("");
    setCatBannerSaved(false);
    setCatBannerUploading(true);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const url = await onUploadImage(base64);
      setCatBannerDrafts((prev) => ({ ...prev, [catBannerKey]: { type: isVideo ? "video" : "image", url } }));
    } catch (err) {
      setCatBannerError(err.message || "آپلود ناموفق بود");
    } finally {
      setCatBannerUploading(false);
    }
  }

  function removeCatBanner() {
    setCatBannerDrafts((prev) => {
      const next = { ...prev };
      delete next[catBannerKey];
      return next;
    });
    setCatBannerSaved(false);
  }

  // تنظیمات دستی نمایش بنر فعلی (حالت جاگیری/بزرگ‌نمایی/موقعیت) را روی همان کلید انتخاب‌شده
  // (catBannerKey) ذخیره می‌کند — دقیقاً همان مکانیزمی که برای عکس اصلی محصول استفاده می‌شود.
  function updateCatBannerField(field, value) {
    setCatBannerDrafts((prev) => {
      const existingRaw = prev[catBannerKey];
      if (!existingRaw) return prev;
      const normalized = normalizeBanner(existingRaw);
      return { ...prev, [catBannerKey]: { ...normalized, [field]: value } };
    });
    setCatBannerSaved(false);
  }

  async function saveCatBanners() {
    setCatBannerError("");
    setCatBannerSaved(false);
    setCatBannerSaving(true);
    try {
      await onUpdateCategoryBanners(catBannerDrafts);
      setCatBannerSaved(true);
    } catch (err) {
      setCatBannerError(err.message || "ذخیره‌سازی ناموفق بود");
    } finally {
      setCatBannerSaving(false);
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setFormError("");
    setForm({
      ...p,
      price: String(p.price),
      nameEn: p.nameEn || "",
      discountPercent: p.discountPercent ? String(p.discountPercent) : "",
      variantsList: (p.variants || []).map((v) => ({ ...v })),
      facets: p.facets || {},
      properties: p.properties || "",
      ingredients: p.ingredients || "",
      topNotes: p.topNotes || "",
      middleNotes: p.middleNotes || "",
      baseNotes: p.baseNotes || "",
      longevity: p.longevity || "",
      sillage: p.sillage || "",
      perfumer: p.perfumer || "",
      countryOfOrigin: p.countryOfOrigin || "",
      yearMade: p.yearMade || "",
      fragranticaRating: p.fragranticaRating || "",
      volume: p.volume || "",
      barcode: p.barcode || "",
      imageFit: p.imageFit === "cover" ? "cover" : "contain",
      imagePosX: Number.isFinite(Number(p.imagePosX)) ? Number(p.imagePosX) : 50,
      imagePosY: Number.isFinite(Number(p.imagePosY)) ? Number(p.imagePosY) : 50,
      imageZoom: Number.isFinite(Number(p.imageZoom)) && Number(p.imageZoom) > 0 ? Number(p.imageZoom) : 1,
    });
  }
  function cancelEdit() {
    setEditingId(null);
    setFormError("");
    setForm(emptyForm());
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    setFormError("");
    const priceNum = Number(form.price);
    const discountPercentNum = form.discountPercent ? Number(form.discountPercent) : 0;
    const variants = (form.variantsList || []).filter((v) => v.label && v.label.trim());
    const { variantsList, id, ...rest } = form;
    const payload = {
      ...rest,
      price: priceNum,
      discountPercent: discountPercentNum,
      facets: form.category === "perfume" ? form.facets : {},
      imageFit: form.imageFit === "cover" ? "cover" : "contain",
      imagePosX: Number(form.imagePosX) || 50,
      imagePosY: Number(form.imagePosY) || 50,
      imageZoom: Number(form.imageZoom) || 1,
      ...(variants.length > 0 ? { variants } : { variants: undefined }),
    };
    try {
      if (editingId) {
        await onUpdate(editingId, payload);
      } else {
        await onAdd(payload);
      }
      cancelEdit();
    } catch (err) {
      setFormError(err.message || "ذخیره‌سازی ناموفق بود");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      await onRemove(id);
    } catch (err) {
      setFormError(err.message || "حذف محصول ناموفق بود");
    }
  }

  return (
    <section className="px-4 sm:px-8 max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-1">
        <LayoutDashboard size={18} color="#7B5CF6" />
        <h2 className="font-display" style={{ fontSize: 20 }}>پنل مدیریت محصولات</h2>
      </div>
      <p className="text-muted mb-6" style={{ fontSize: 12 }}>
        محصولات روی سرور فروشگاه ذخیره می‌شوند و برای همه‌ی مشتریان قابل مشاهده‌اند.
      </p>
      {storageError && (
        <p className="mb-4 rounded p-3" style={{ fontSize: 12, background: "rgba(214,51,108,0.12)", color: "#D6336C" }}>
          اتصال به سرور فروشگاه برقرار نشد. لطفاً چند لحظه صبر کن و دوباره صفحه را باز کن.
        </p>
      )}
      {formError && (
        <p className="mb-4 rounded p-3" style={{ fontSize: 12, background: "rgba(214,51,108,0.12)", color: "#D6336C" }}>
          {formError}
        </p>
      )}

      {/* تخفیف همگانی روی همه‌ی محصولات — برای مناسبت‌هایی مثل بلک فرایدی */}
      <div className="bg-panel border border-hair rounded-lg p-4 mb-8">
        <h3 className="font-display mb-1" style={{ fontSize: 15 }}>تخفیف همگانی (مثلاً بلک فرایدی)</h3>
        <p className="text-muted mb-3" style={{ fontSize: 11 }}>
          یک درصد تخفیف برای همه‌ی محصولات فروشگاه وارد کن. اگر محصولی تخفیف اختصاصی خودش رو داشته باشه (پایین‌تر توی فرم محصول)، همون تخفیف اختصاصی به‌جای این عدد اعمال می‌شود.
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="number"
            min="0"
            max="90"
            placeholder="مثلاً 20"
            value={discountDraft}
            onChange={(e) => { setDiscountDraft(e.target.value); setDiscountSaved(false); }}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#241E3D", width: 100 }}
            dir="ltr"
          />
          <span className="text-muted" style={{ fontSize: 13 }}>٪ درصد تخفیف</span>
          <button onClick={saveGlobalDiscount} disabled={discountSaving} type="button" className="btn-gold rounded px-4 py-2 text-sm">
            {discountSaving ? "در حال ذخیره..." : "اعمال روی همه‌ی محصولات"}
          </button>
          {Number(globalDiscountPercent) > 0 && (
            <button
              type="button"
              onClick={async () => { setDiscountDraft("0"); await onUpdateGlobalDiscount(0); setDiscountSaved(true); }}
              className="btn-ghost rounded px-3 py-2 text-xs"
            >
              پایان تخفیف همگانی
            </button>
          )}
        </div>
        {discountSaved && <span className="text-gold" style={{ fontSize: 12 }}>ذخیره شد ✓</span>}
        {discountError && <p style={{ fontSize: 12, color: "#D6336C", marginTop: 6 }}>{discountError}</p>}
        {Number(globalDiscountPercent) > 0 && (
          <p className="text-gold mt-2" style={{ fontSize: 12 }}>
            هم‌اکنون ٪{Number(globalDiscountPercent).toLocaleString("fa-IR")} تخفیف همگانی فعال است.
          </p>
        )}
      </div>

      {/* تنظیمات بنرهای متحرک صفحه‌ی اصلی */}
      <div className="bg-panel border border-hair rounded-lg p-4 mb-8">
        <h3 className="font-display mb-1" style={{ fontSize: 15 }}>بنرهای متحرک صفحه‌ی اصلی</h3>
        <p className="text-muted mb-3" style={{ fontSize: 11 }}>
          چند عکس یا کلیپ ویدئویی تبلیغاتی اضافه کن؛ روی صفحه‌ی اصلی به‌ترتیب نمایش داده می‌شوند (مثل اسلایدر) — بنر عکس هر ۵ ثانیه و بنر ویدیویی بعد از پایان پخش خودش، به بنر بعدی می‌رود. قاب بنر عرضش همیشه کل صفحه است ولی ارتفاعش بسته به گوشی کمی فرق می‌کند (تقریباً بین نسبت ۴:۵ تا ۹:۱۶)، پس یک نسبت ثابت واحد وجود ندارد؛ برای بهترین نتیجه، عکس یا ویدیو را با نسبت تقریبی ۴:۵ (مثلاً ۱۰۸۰×۱۳۵۰ پیکسل) و موضوع اصلی نزدیک وسط کادر آماده کن. با این حال لازم نیست خودت دقیق اندازه بزنی — هر فایلی که آپلود کنی به‌طور خودکار و بدون کشیدگی داخل قاب جا می‌شود («پر کردن قاب»، پیش‌فرض)؛ اگر خواستی جای دقیق‌تری از تصویر دیده شود، از تنظیمات جاگیری/زوم/موقعیت زیر هر بنر استفاده کن.
        </p>

        {bannerDrafts.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {bannerDrafts.map((bannerRaw, i) => {
              const banner = normalizeBanner(bannerRaw);
              return (
                <div key={i} className="bg-panel-2 border border-hair rounded p-2 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {banner.type === "video" ? (
                      <video
                        src={banner.url}
                        muted
                        style={{ width: 56, height: 32, borderRadius: 4, objectFit: "cover", background: "#241E3D" }}
                        onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
                      />
                    ) : (
                      <img
                        src={banner.url}
                        alt={`بنر ${i + 1}`}
                        style={{ width: 56, height: 32, borderRadius: 4, objectFit: "cover" }}
                        onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
                      />
                    )}
                    <span className="text-muted" style={{ fontSize: 11, flex: 1 }}>
                      بنر شماره {i + 1} {banner.type === "video" ? "(ویدیو)" : "(عکس)"}
                    </span>
                    <button type="button" onClick={() => moveBannerDraft(i, -1)} disabled={i === 0} className="btn-ghost rounded px-2 py-1 text-xs">▲</button>
                    <button type="button" onClick={() => moveBannerDraft(i, 1)} disabled={i === bannerDrafts.length - 1} className="btn-ghost rounded px-2 py-1 text-xs">▼</button>
                    <button type="button" onClick={() => removeBannerDraft(i)} className="btn-ghost rounded px-2 py-1 text-xs" style={{ color: "#D6336C" }}>حذف</button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-muted" style={{ fontSize: 10.5 }}>جاگیری:</span>
                    <button
                      type="button"
                      onClick={() => updateHeroBannerField(i, "imageFit", "contain")}
                      className="btn-ghost rounded-full px-2.5 py-0.5 text-xs"
                      style={banner.imageFit !== "cover" ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : undefined}
                    >
                      کامل
                    </button>
                    <button
                      type="button"
                      onClick={() => updateHeroBannerField(i, "imageFit", "cover")}
                      className="btn-ghost rounded-full px-2.5 py-0.5 text-xs"
                      style={banner.imageFit === "cover" ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : undefined}
                    >
                      پر کردن قاب
                    </button>
                    <span className="text-muted" style={{ fontSize: 10.5, marginRight: 6 }}>زوم</span>
                    <input
                      type="range" min="1" max="2.5" step="0.05"
                      value={banner.imageZoom}
                      onChange={(e) => updateHeroBannerField(i, "imageZoom", Number(e.target.value))}
                      style={{ width: 70 }}
                    />
                    <span className="text-muted" style={{ fontSize: 10.5 }}>افقی</span>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={banner.imagePosX}
                      onChange={(e) => updateHeroBannerField(i, "imagePosX", Number(e.target.value))}
                      style={{ width: 70 }}
                    />
                    <span className="text-muted" style={{ fontSize: 10.5 }}>عمودی</span>
                    <input
                      type="range" min="0" max="100" step="1"
                      value={banner.imagePosY}
                      onChange={(e) => updateHeroBannerField(i, "imagePosY", Number(e.target.value))}
                      style={{ width: 70 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap mb-3">
          <label
            className="btn-ghost rounded px-3 py-2 text-xs flex items-center gap-2"
            style={{ cursor: heroUploading ? "default" : "pointer", opacity: heroUploading ? 0.6 : 1 }}
          >
            <Upload size={14} />
            {heroUploading ? "در حال آپلود..." : "افزودن عکس یا کلیپ ویدئویی از گالری"}
            <input type="file" accept="image/*,video/*" onChange={handleHeroFile} disabled={heroUploading} style={{ display: "none" }} />
          </label>
        </div>

        <button
          onClick={saveHeroBanners}
          disabled={heroSaving}
          type="button"
          className="btn-gold rounded px-4 py-2 text-sm"
        >
          {heroSaving ? "در حال ذخیره..." : "ذخیره‌ی بنرهای صفحه‌ی اصلی"}
        </button>
        {heroSaved && <span className="text-gold" style={{ fontSize: 12, marginRight: 10 }}>ذخیره شد ✓</span>}
        {heroError && <p style={{ fontSize: 12, color: "#D6336C", marginTop: 6 }}>{heroError}</p>}
        {bannerDrafts.length === 0 && (
          <p className="text-muted" style={{ fontSize: 11, marginTop: 6 }}>
            اگه هیچ بنری اضافه نکنی، همون طرح گرافیکی پیش‌فرض سایت نمایش داده می‌شود.
          </p>
        )}
      </div>

      {/* بنر اختصاصی هر صفحه‌ی دسته‌بندی — مثل بنر بالای صفحه‌ی هر دسته در سایت‌های معتبر فروش آنلاین */}
      <div className="bg-panel border border-hair rounded-lg p-4 mb-8">
        <h3 className="font-display mb-1" style={{ fontSize: 15 }}>بنر صفحات دسته‌بندی</h3>
        <p className="text-muted mb-3" style={{ fontSize: 11 }}>
          برای «مقصد نهایی» هر مسیر — یعنی همان صفحه‌ای که مشتری با ناوبری در منو نهایتاً به آن می‌رسد و محصولات را می‌بیند و می‌خرد — یک عکس یا کلیپ ویدئویی تبلیغاتی جداگانه تنظیم کن. اگر مسیر انتخاب‌شده «نوع» دارد (مثلاً کانسیلر زیر صورت)، بنر باید همان‌جا تنظیم شود؛ اگر آن نوعِ خاص بنر نداشته باشد، بنر کل زیرشاخه و در نبود آن، بنر کل دسته (در صورت وجود) جایگزین می‌شود. اگر هیچ‌کدام تنظیم نشود، آن صفحه بدون بنر (به همان شکل قبلی) نمایش داده می‌شود.
        </p>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <select
            value={catBannerCategory}
            onChange={(e) => { setCatBannerCategory(e.target.value); setCatBannerSubcategory(""); setCatBannerType(""); setCatBannerSaved(false); }}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#241E3D" }}
          >
            {CATEGORY_ORDER.map((k) => (
              <option key={k} value={k}>{CATEGORY_LABEL[k]}</option>
            ))}
          </select>
          {CATEGORIES[catBannerCategory]?.subcategories && (
            <select
              value={catBannerSubcategory}
              onChange={(e) => { setCatBannerSubcategory(e.target.value); setCatBannerType(""); setCatBannerSaved(false); }}
              className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
              style={{ color: "#241E3D" }}
            >
              <option value="">کل دسته (بدون زیرشاخه‌ی خاص)</option>
              {Object.keys(CATEGORIES[catBannerCategory].subcategories).map((k) => (
                <option key={k} value={k}>{subcategoryLabel(catBannerCategory, k)}</option>
              ))}
            </select>
          )}
          {catBannerTypeOptions && (
            <select
              value={catBannerType}
              onChange={(e) => { setCatBannerType(e.target.value); setCatBannerSaved(false); }}
              className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
              style={{ color: "#241E3D" }}
            >
              <option value="">کل زیرشاخه (بدون نوع خاص)</option>
              {Object.entries(catBannerTypeOptions).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          )}
        </div>

        {catBannerCurrent && (
          <div className="flex items-center gap-2 bg-panel-2 border border-hair rounded p-2 mb-3">
            {catBannerCurrent.type === "video" ? (
              <video
                src={catBannerCurrent.url}
                muted
                style={{ width: 80, height: 44, borderRadius: 4, objectFit: "cover", background: "#241E3D" }}
                onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
              />
            ) : (
              <img
                src={catBannerCurrent.url}
                alt="بنر فعلی"
                style={{ width: 80, height: 44, borderRadius: 4, objectFit: "cover" }}
                onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
              />
            )}
            <span className="text-muted" style={{ fontSize: 11, flex: 1 }}>
              بنر فعلیِ {catBannerTargetLabel} ({catBannerCurrent.type === "video" ? "ویدیو" : "عکس"})
            </span>
            <button type="button" onClick={removeCatBanner} className="btn-ghost rounded px-2 py-1 text-xs" style={{ color: "#D6336C" }}>حذف</button>
          </div>
        )}
        {!catBannerCurrent && (
          <p className="text-muted mb-3" style={{ fontSize: 11 }}>
            فعلاً برای {catBannerTargetLabel} بنری تنظیم نشده.
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap mb-3">
          <label
            className="btn-ghost rounded px-3 py-2 text-xs flex items-center gap-2"
            style={{ cursor: catBannerUploading ? "default" : "pointer", opacity: catBannerUploading ? 0.6 : 1 }}
          >
            <Upload size={14} />
            {catBannerUploading ? "در حال آپلود..." : catBannerCurrent ? "تغییر عکس/ویدیوی این بنر" : "افزودن عکس یا کلیپ ویدئویی از گالری"}
            <input type="file" accept="image/*,video/*" onChange={handleCatBannerFile} disabled={catBannerUploading} style={{ display: "none" }} />
          </label>
        </div>

        {catBannerCurrent && (
          <div className="flex flex-col gap-1 mb-3">
            <p className="text-muted" style={{ fontSize: 11 }}>
              پیش‌نمایش دقیق — دقیقاً همین‌طوری بالای صفحه‌ی دسته‌بندی نمایش داده می‌شود:
            </p>
            <div
              style={{
                height: 168,
                borderRadius: 10,
                border: "1px solid rgba(123,92,246,0.3)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: 320,
                background: "rgba(123,92,246,0.08)",
              }}
            >
              {catBannerCurrent.type === "video" ? (
                <video
                  key={catBannerCurrent.url}
                  src={catBannerCurrent.url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={productImageStyle(catBannerCurrent)}
                />
              ) : (
                <img
                  src={catBannerCurrent.url}
                  alt="پیش‌نمایش بنر"
                  style={productImageStyle(catBannerCurrent)}
                />
              )}
            </div>

            {/* تنظیمات دستی نمایش بنر — همان مکانیزم تنظیمات دستی عکس اصلی محصول: حالت جاگیری، موقعیت و بزرگ‌نمایی */}
            <div className="bg-panel-2 border border-hair rounded-lg p-3 mt-2 flex flex-col gap-3" style={{ maxWidth: 380 }}>
              <div className="flex items-center justify-between">
                <span className="text-muted" style={{ fontSize: 11 }}>تنظیمات دستی بنر</span>
                <button
                  type="button"
                  onClick={() => {
                    updateCatBannerField("imageFit", "cover");
                    updateCatBannerField("imagePosX", 50);
                    updateCatBannerField("imagePosY", 50);
                    updateCatBannerField("imageZoom", 1);
                  }}
                  className="btn-ghost rounded px-2 py-1 text-xs"
                >
                  بازنشانی
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted" style={{ fontSize: 11, minWidth: 60 }}>حالت نمایش</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateCatBannerField("imageFit", "contain")}
                    className="btn-ghost rounded-full px-3 py-1 text-xs"
                    style={catBannerCurrent.imageFit !== "cover" ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : undefined}
                  >
                    کامل (بدون برش)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCatBannerField("imageFit", "cover")}
                    className="btn-ghost rounded-full px-3 py-1 text-xs"
                    style={catBannerCurrent.imageFit === "cover" ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : undefined}
                  >
                    پر کردن قاب
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted" style={{ fontSize: 11, minWidth: 60 }}>بزرگ‌نمایی</span>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={catBannerCurrent.imageZoom}
                  onChange={(e) => updateCatBannerField("imageZoom", Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span className="text-muted" style={{ fontSize: 11, minWidth: 34, textAlign: "left" }} dir="ltr">
                  {Number(catBannerCurrent.imageZoom).toFixed(2)}×
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted" style={{ fontSize: 11, minWidth: 60 }}>موقعیت افقی</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={catBannerCurrent.imagePosX}
                  onChange={(e) => updateCatBannerField("imagePosX", Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span className="text-muted" style={{ fontSize: 11, minWidth: 34, textAlign: "left" }} dir="ltr">
                  {catBannerCurrent.imagePosX}%
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted" style={{ fontSize: 11, minWidth: 60 }}>موقعیت عمودی</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={catBannerCurrent.imagePosY}
                  onChange={(e) => updateCatBannerField("imagePosY", Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <span className="text-muted" style={{ fontSize: 11, minWidth: 34, textAlign: "left" }} dir="ltr">
                  {catBannerCurrent.imagePosY}%
                </span>
              </div>

              <p className="text-muted" style={{ fontSize: 10.5, lineHeight: 1.7 }}>
                «کامل» یعنی کل عکس/ویدیو بدون برش داخل بنر جا می‌شود (ممکن است حاشیه‌ی خالی داشته باشد). «پر کردن قاب» یعنی کل عرض بنر را پر می‌کند (ممکن است بخشی از لبه‌ها برش بخورد) — با بزرگ‌نمایی و موقعیت می‌توانی دقیقاً بخش دلخواه را داخل بنر قاب بگیری.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={saveCatBanners}
          disabled={catBannerSaving}
          type="button"
          className="btn-gold rounded px-4 py-2 text-sm"
        >
          {catBannerSaving ? "در حال ذخیره..." : "ذخیره‌ی بنرهای دسته‌بندی"}
        </button>
        {catBannerSaved && <span className="text-gold" style={{ fontSize: 12, marginRight: 10 }}>ذخیره شد ✓</span>}
        {catBannerError && <p style={{ fontSize: 12, color: "#D6336C", marginTop: 6 }}>{catBannerError}</p>}
      </div>

      <div className="bg-panel border border-hair rounded-lg p-4 mb-4">
        <h3 className="font-display mb-1 flex items-center gap-1.5" style={{ fontSize: 15 }}>
          <Sparkles size={15} color="#7B5CF6" /> جستجوی مشخصات ادکلن بر اساس نام (رایگان)
        </h3>
        <p className="text-muted mb-3" style={{ fontSize: 11 }}>
          اسم عطر (و اگر خواستی برند) رو بنویس — از دیتابیس رایگان fraganty.ai جستجو می‌شود. از میان نتایج، مورد درست را انتخاب کن تا نت‌ها، غلظت، عطار و سال ساخت به‌طور خودکار (و ترجمه‌شده به فارسی از روی پایگاه‌دانش خودمان) در فرم پایین پر شود. نام فارسی محصول باید خودت دستی تایپ کنی چون آوانویسی استاندارد و ثابتی برای همه‌ی اسم‌ها وجود ندارد.
        </p>
        <form onSubmit={handlePerfumeSearch} className="flex items-center gap-2 mb-2">
          <input
            placeholder="مثلاً: Lalique Encre Noire"
            value={perfumeSearchQuery}
            onChange={(e) => setPerfumeSearchQuery(e.target.value)}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm flex-1"
            style={{ color: "#241E3D" }}
            dir="ltr"
          />
          <button type="submit" disabled={perfumeSearchLoading} className="btn-gold rounded px-4 py-2 text-sm flex items-center gap-1.5">
            <Search size={14} /> {perfumeSearchLoading ? "..." : "جستجو"}
          </button>
        </form>

        {perfumeSearchError && <p style={{ fontSize: 12, color: "#D6336C", marginTop: 6 }}>{perfumeSearchError}</p>}

        {perfumeSearchResults.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-2">
            {perfumeSearchResults.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePickPerfumeResult(item)}
                disabled={perfumeDetailsLoading}
                className="btn-ghost rounded-lg px-3 py-2 text-right flex items-center gap-3"
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 32, height: 32, borderRadius: 6, background: "rgba(123,92,246,0.12)", flexShrink: 0 }} />
                )}
                <span className="flex-1" dir="ltr" style={{ fontSize: 12.5, textAlign: "right" }}>
                  {item.name} <span className="text-muted">— {item.brand}{item.year ? ` (${item.year})` : ""}</span>
                </span>
              </button>
            ))}
          </div>
        )}
        {perfumeDetailsLoading && <p className="text-muted" style={{ fontSize: 12, marginTop: 8 }}>در حال دریافت جزئیات...</p>}
        {perfumeFillResult && (
          <p style={{ fontSize: 12, color: "#0EA5A4", marginTop: 8 }}>
            اطلاعات «{perfumeFillResult.name}» ({perfumeFillResult.brand}) در فرم پایین پر شد
            {perfumeTranslating
              ? " — در حال آماده‌سازی توضیح و ویژگی‌های فارسی..."
              : perfumeFillResult.translated === true
                ? " (توضیح کوتاه و ویژگی‌ها هم به فارسی آماده و پر شد)"
                : perfumeFillResult.translated === false
                  ? " — تهیه‌ی خودکار توضیح و ویژگی‌ها ناموفق بود، این دو فیلد را دستی بنویس"
                  : ""}
            {" — لطفاً همه‌ی فیلدها (به‌خصوص نام فارسی) را قبل از ذخیره بازبینی و تکمیل کن."}
          </p>
        )}
      </div>

      <form onSubmit={submit} className="bg-panel border border-hair rounded-lg p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <input
            placeholder="نام محصول (فارسی)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#241E3D" }}
          />
          <input
            placeholder="نام محصول به انگلیسی (اختیاری — اگر خالی بماند در صفحه‌ی محصول نمایش داده نمی‌شود)"
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#241E3D" }}
            dir="ltr"
          />
        </div>
        <input
          placeholder="برند"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
          style={{ color: "#241E3D" }}
        />
        <div className="sm:col-span-2 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <input
              placeholder="بارکد محصول (اختیاری)"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm flex-1"
              style={{ color: "#241E3D" }}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="btn-gold rounded px-3 py-2 text-sm flex items-center gap-1.5 flex-shrink-0"
            >
              <Camera size={14} /> اسکن
            </button>
          </div>
          {barcodeLookupLoading && <p className="text-muted" style={{ fontSize: 11 }}>در حال جستجوی بارکد...</p>}
          {barcodeLookupMessage && (
            <p style={{ fontSize: 11.5, color: barcodeLookupMessage.type === "own" ? "#D97706" : barcodeLookupMessage.type === "external" ? "#0EA5A4" : barcodeLookupMessage.type === "error" ? "#D6336C" : "#756E93" }}>
              {barcodeLookupMessage.text}
            </p>
          )}
        </div>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "", type: "", facets: {} })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
          style={{ color: "#241E3D" }}
        >
          {CATEGORY_ORDER.map((k) => (
            <option key={k} value={k}>{CATEGORY_LABEL[k]}</option>
          ))}
        </select>
        {CATEGORIES[form.category]?.subcategories && (
          <select
            value={form.subcategory}
            onChange={(e) => setForm({ ...form, subcategory: e.target.value, type: "", facets: {} })}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#241E3D" }}
          >
            <option value="">زیرشاخه را انتخاب کن</option>
            {Object.keys(CATEGORIES[form.category].subcategories).map((k) => (
              <option key={k} value={k}>{subcategoryLabel(form.category, k)}</option>
            ))}
          </select>
        )}
        {subcategoryTypes(form.category, form.subcategory) && (
          isGroupedTypes(subcategoryTypes(form.category, form.subcategory)) ? (
            form.category === "perfume" ? (
              <div className="sm:col-span-2 flex flex-col gap-3">
                {subcategoryTypes(form.category, form.subcategory).map((g) => {
                  const selected = (form.facets && form.facets[g.key]) || [];
                  function toggleFormFacet(key) {
                    const has = selected.includes(key);
                    const nextArr = has ? selected.filter((v) => v !== key) : [...selected, key];
                    setForm({ ...form, facets: { ...form.facets, [g.key]: nextArr } });
                  }
                  return (
                    <div key={g.key} className="flex flex-col gap-1">
                      <label className="text-muted" style={{ fontSize: 11 }}>{g.group} (می‌توانی چند مورد انتخاب کنی)</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(g.options).map(([k, v]) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => toggleFormFacet(k)}
                            className="btn-ghost rounded-full px-3 py-1 text-xs"
                            style={selected.includes(k) ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : { opacity: 0.85 }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="sm:col-span-2 flex flex-col gap-3">
                {/* غیر از ادکلن: فقط یک نوع برای هر محصول قابل انتخاب است */}
                {subcategoryTypes(form.category, form.subcategory).map((g) => (
                  <div key={g.key} className="flex flex-col gap-1">
                    <label className="text-muted" style={{ fontSize: 11 }}>{g.group}</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(g.options).map(([k, v]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setForm({ ...form, type: k, facets: {} })}
                          className="btn-ghost rounded-full px-3 py-1 text-xs"
                          style={form.type === k ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : { opacity: 0.85 }}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
              style={{ color: "#241E3D" }}
            >
              <option value="">نوع محصول را انتخاب کن</option>
              {Object.entries(subcategoryTypes(form.category, form.subcategory)).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          )
        )}
        <div className="flex flex-col gap-1">
          <input
            placeholder="قیمت (تومان)"
            type="text"
            inputMode="numeric"
            value={formatPriceInput(form.price)}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/[^\d]/g, "");
              setForm({ ...form, price: digitsOnly });
            }}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#241E3D" }}
            dir="ltr"
          />
          {form.price && Number(form.price) > 0 && (
            <p className="text-gold" style={{ fontSize: 11 }}>
              {numberToPersianWords(form.price)} تومان
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="number"
            min="0"
            max="90"
            placeholder="درصد تخفیف این محصول (اختیاری)"
            value={form.discountPercent}
            onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#241E3D" }}
            dir="ltr"
          />
          {form.price && form.discountPercent && Number(form.discountPercent) > 0 && (
            <p className="text-gold" style={{ fontSize: 11 }}>
              قیمت با تخفیف: {fmtPrice(discountedPrice({ price: Number(form.price), discountPercent: Number(form.discountPercent) }, 0))}
            </p>
          )}
        </div>
        <textarea
          placeholder="توضیح کوتاه"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm sm:col-span-2"
          style={{ color: "#241E3D", minHeight: 60 }}
        />
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className="text-muted" style={{ fontSize: 12 }}>
            ویژگی‌ها و خواص (این متن در صفحه‌ی اختصاصی محصول به مشتری نمایش داده می‌شود)
          </label>
          <textarea
            placeholder={"مثال:\nماندگاری بالا\nمقاوم در برابر آب\nمناسب پوست حساس"}
            value={form.properties}
            onChange={(e) => setForm({ ...form, properties: e.target.value })}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#241E3D", minHeight: 70 }}
          />
        </div>
        {form.category === "perfume" ? (
          <div className="sm:col-span-2 flex flex-col gap-3">
            <label className="text-muted" style={{ fontSize: 12 }}>
              نت‌های رایحه — هر آکورد را با ویرگول جدا از هم بنویس، مثلاً: هل، زعفران، جوز هندی
            </label>
            <div className="flex flex-col gap-1">
              <label className="text-gold" style={{ fontSize: 11.5 }}>Top Notes — نت‌های آغازین</label>
              <input
                placeholder="مثال: هل، عنبر، زعفران، جوز هندی"
                value={form.topNotes}
                onChange={(e) => setForm({ ...form, topNotes: e.target.value })}
                className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
                style={{ color: "#241E3D" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gold" style={{ fontSize: 11.5 }}>Middle Notes — نت‌های میانی</label>
              <input
                placeholder="مثال: چوب گایاک، میوه‌های قرمز، عثمانتوس، یاس، صندل"
                value={form.middleNotes}
                onChange={(e) => setForm({ ...form, middleNotes: e.target.value })}
                className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
                style={{ color: "#241E3D" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-gold" style={{ fontSize: 11.5 }}>Base Notes — نت‌های پایه</label>
              <input
                placeholder="مثال: تنباکو، عنبر، نت‌های بالزامیک، وانیل، سدر"
                value={form.baseNotes}
                onChange={(e) => setForm({ ...form, baseNotes: e.target.value })}
                className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
                style={{ color: "#241E3D" }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={applyNoteSuggestion}
                className="btn-gold rounded-full px-4 py-2 text-xs self-start flex items-center gap-1.5"
              >
                <Sparkles size={13} /> پیشنهاد خودکار حس رایحه / طبع / گروه بویایی از روی نت‌ها
              </button>
              <p className="text-muted" style={{ fontSize: 10.5, lineHeight: 1.7 }}>
                بر اساس نت‌های بالا، سه گروه فیلتر «حس رایحه»، «طبع» و «گروه بویایی» را پایین‌تر همین فرم به‌طور خودکار پر می‌کند —
                نتیجه فقط یک پیشنهاد است و هر گزینه را می‌توانی دستی هم اضافه یا حذف کنی.
              </p>
              {noteSuggestResult && (
                <p style={{ fontSize: 11, color: noteSuggestResult.matchedCount > 0 ? "#0EA5A4" : "#D6336C" }}>
                  {noteSuggestResult.matchedCount} از {noteSuggestResult.totalCount} نت شناسایی شد.
                  {noteSuggestResult.unmatched.length > 0 && (
                    <> نت‌های ناشناخته (برای این‌ها فیلترها را دستی انتخاب کن): {noteSuggestResult.unmatched.join("، ")}</>
                  )}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="sm:col-span-2 flex flex-col gap-1">
            <label className="text-muted" style={{ fontSize: 12 }}>
              ترکیبات (اختیاری — در صفحه‌ی اختصاصی محصول نمایش داده می‌شود)
            </label>
            <textarea
              placeholder="مثال: آب، گلیسیرین، روغن آرگان، ویتامین E ..."
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
              className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
              style={{ color: "#241E3D", minHeight: 70 }}
            />
          </div>
        )}
        {form.category === "perfume" && (
          <div className="sm:col-span-2 flex flex-col gap-3 bg-panel-2 border border-hair rounded-lg p-3">
            <label className="text-muted" style={{ fontSize: 12 }}>مشخصات ادکلن</label>

            <div className="flex flex-col gap-1">
              <label className="text-gold" style={{ fontSize: 11.5 }}>ماندگاری</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PERFUME_LONGEVITY_OPTIONS).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm({ ...form, longevity: form.longevity === k ? "" : k })}
                    className="btn-ghost rounded-full px-3 py-1 text-xs"
                    style={form.longevity === k ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : { opacity: 0.85 }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gold" style={{ fontSize: 11.5 }}>پخش بو</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PERFUME_SILLAGE_OPTIONS).map(([k, v]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm({ ...form, sillage: form.sillage === k ? "" : k })}
                    className="btn-ghost rounded-full px-3 py-1 text-xs"
                    style={form.sillage === k ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : { opacity: 0.85 }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                placeholder="عطار (اختیاری)"
                value={form.perfumer}
                onChange={(e) => setForm({ ...form, perfumer: e.target.value })}
                className="bg-panel border border-hair rounded px-3 py-2 text-sm"
                style={{ color: "#241E3D" }}
              />
              <input
                placeholder="کشور سازنده (اختیاری)"
                value={form.countryOfOrigin}
                onChange={(e) => setForm({ ...form, countryOfOrigin: e.target.value })}
                className="bg-panel border border-hair rounded px-3 py-2 text-sm"
                style={{ color: "#241E3D" }}
              />
              <input
                placeholder="سال ساخت (اختیاری)"
                value={form.yearMade}
                onChange={(e) => setForm({ ...form, yearMade: e.target.value })}
                className="bg-panel border border-hair rounded px-3 py-2 text-sm"
                style={{ color: "#241E3D" }}
                dir="ltr"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="امتیاز فرگرانتیکا (مثلاً 6.3)"
                  value={form.fragranticaRating}
                  onChange={(e) => {
                    const v = e.target.value;
                    const n = Number(v);
                    if (v === "" || (Number.isFinite(n) && n >= 0 && n <= 10)) {
                      setForm({ ...form, fragranticaRating: v });
                    }
                  }}
                  className="bg-panel border border-hair rounded px-3 py-2 text-sm flex-1"
                  style={{ color: "#241E3D" }}
                  dir="ltr"
                />
                <span className="text-muted" style={{ fontSize: 11 }}>از ۱۰</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="حجم (اختیاری)"
                  value={form.volume}
                  onChange={(e) => setForm({ ...form, volume: e.target.value })}
                  className="bg-panel border border-hair rounded px-3 py-2 text-sm flex-1"
                  style={{ color: "#241E3D" }}
                  dir="ltr"
                />
                <span className="text-muted" style={{ fontSize: 11 }}>میل</span>
              </div>
            </div>
          </div>
        )}
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className="text-muted" style={{ fontSize: 12 }}>
            تصویر اصلی محصول
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            <label
              className="btn-ghost rounded px-3 py-2 text-xs flex items-center gap-2"
              style={{ cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.6 : 1 }}
            >
              <Upload size={14} />
              {uploading ? "در حال آپلود..." : "انتخاب از گالری"}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFile}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </label>
            <input
              placeholder="یا لینک عکس را اینجا بچسبان: https://example.com/image.jpg"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm flex-1"
              style={{ color: "#241E3D", minWidth: 200 }}
              dir="ltr"
            />
          </div>
          {form.image && (
            <div className="flex flex-col gap-1 mt-2">
              <p className="text-muted" style={{ fontSize: 11 }}>
                پیش‌نمایش دقیق — دقیقاً همین‌طوری توی کارت محصول نمایش داده می‌شود:
              </p>
              <div
                style={{
                  background: "#FFFFFF",
                  height: 168,
                  borderRadius: 10,
                  border: "1px solid rgba(123,92,246,0.3)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  maxWidth: 260,
                }}
              >
                <img
                  src={framedProductImageUrl(form.image)}
                  alt="پیش‌نمایش"
                  style={productImageStyle({
                    imageFit: form.imageFit,
                    imagePosX: form.imagePosX,
                    imagePosY: form.imagePosY,
                    imageZoom: form.imageZoom,
                  })}
                  onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.dataset.broken = "1"; }}
                  onLoad={(e) => { delete e.currentTarget.parentElement.dataset.broken; e.currentTarget.style.display = "block"; }}
                />
              </div>
              <p className="text-muted" style={{ fontSize: 10.5 }}>
                برش و پس‌زمینه‌ی سفید به‌صورت خودکار روی عکس اعمال می‌شود (فقط برای عکس‌های آپلودشده از گالری یا شناسایی‌شده از بارکد — نه لینک‌های خارجیِ دستی).
              </p>

              {/* تنظیمات دستی نمایش تصویر — حالت جاگیری، موقعیت و بزرگ‌نمایی */}
              <div className="bg-panel-2 border border-hair rounded-lg p-3 mt-2 flex flex-col gap-3" style={{ maxWidth: 380 }}>
                <div className="flex items-center justify-between">
                  <span className="text-muted" style={{ fontSize: 11 }}>تنظیمات دستی عکس</span>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, imageFit: "contain", imagePosX: 50, imagePosY: 50, imageZoom: 1 }))}
                    className="btn-ghost rounded px-2 py-1 text-xs"
                  >
                    بازنشانی
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted" style={{ fontSize: 11, minWidth: 60 }}>حالت نمایش</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageFit: "contain" }))}
                      className="btn-ghost rounded-full px-3 py-1 text-xs"
                      style={form.imageFit !== "cover" ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : undefined}
                    >
                      کامل (بدون برش)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, imageFit: "cover" }))}
                      className="btn-ghost rounded-full px-3 py-1 text-xs"
                      style={form.imageFit === "cover" ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : undefined}
                    >
                      پر کردن قاب
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted" style={{ fontSize: 11, minWidth: 60 }}>بزرگ‌نمایی</span>
                  <input
                    type="range"
                    min="1"
                    max="2.5"
                    step="0.05"
                    value={form.imageZoom}
                    onChange={(e) => setForm((f) => ({ ...f, imageZoom: Number(e.target.value) }))}
                    style={{ flex: 1 }}
                  />
                  <span className="text-muted" style={{ fontSize: 11, minWidth: 34, textAlign: "left" }} dir="ltr">
                    {Number(form.imageZoom).toFixed(2)}×
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted" style={{ fontSize: 11, minWidth: 60 }}>موقعیت افقی</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={form.imagePosX}
                    onChange={(e) => setForm((f) => ({ ...f, imagePosX: Number(e.target.value) }))}
                    style={{ flex: 1 }}
                  />
                  <span className="text-muted" style={{ fontSize: 11, minWidth: 34, textAlign: "left" }} dir="ltr">
                    {form.imagePosX}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted" style={{ fontSize: 11, minWidth: 60 }}>موقعیت عمودی</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={form.imagePosY}
                    onChange={(e) => setForm((f) => ({ ...f, imagePosY: Number(e.target.value) }))}
                    style={{ flex: 1 }}
                  />
                  <span className="text-muted" style={{ fontSize: 11, minWidth: 34, textAlign: "left" }} dir="ltr">
                    {form.imagePosY}%
                  </span>
                </div>

                <p className="text-muted" style={{ fontSize: 10.5, lineHeight: 1.7 }}>
                  «کامل» یعنی کل عکس بدون برش داخل قاب جا می‌شود (ممکن است حاشیه‌ی خالی داشته باشد). «پر کردن قاب» یعنی عکس کل کادر را پر می‌کند (ممکن است بخشی از لبه‌های عکس برش بخورد) — با بزرگ‌نمایی و موقعیت می‌توانی دقیقاً بخش دلخواه از عکس را داخل کادر قاب بگیری.
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="sm:col-span-2 flex flex-col gap-2">
          <label className="text-muted" style={{ fontSize: 12 }}>
            طیف رنگ / شماره‌ها (اختیاری — برای محصولاتی مثل رژلب، سایه و رژگونه که مشتری باید رنگ انتخاب کند)
          </label>
          {(form.variantsList || []).map((v) => (
            <VariantRowEditor
              key={v.id}
              variant={v}
              onChange={(next) => setForm((f) => ({ ...f, variantsList: f.variantsList.map((x) => (x.id === v.id ? next : x)) }))}
              onRemove={() => setForm((f) => ({ ...f, variantsList: f.variantsList.filter((x) => x.id !== v.id) }))}
              onUploadImage={onUploadImage}
            />
          ))}
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({
                ...f,
                variantsList: [...(f.variantsList || []), { id: `v${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: "", hex: "", image: "" }],
              }))
            }
            className="btn-ghost rounded px-3 py-2 text-xs self-start flex items-center gap-1.5"
          >
            <Plus size={13} /> افزودن رنگ / شماره
          </button>
          <p className="text-muted" style={{ fontSize: 11 }}>
            برای هر رنگ، اسم یا شماره‌اش رو بنویس و از دکمه‌ی «افزودن عکس این رنگ» مستقیم از گالری گوشی عکس همون طیف رو آپلود کن — نیازی به لینک عکس از جای دیگه نیست. اگه عکس نذاری، همون رنگ هگز به‌جای عکس نمایش داده می‌شود.
          </p>
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" disabled={saving} className="btn-gold rounded px-4 py-2 text-sm flex items-center gap-2">
            {editingId ? <Check size={14} /> : <Plus size={14} />}
            {editingId ? "ذخیره تغییرات" : "افزودن محصول"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="btn-ghost rounded px-4 py-2 text-sm">
              انصراف
            </button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {products.map((p) => (
          <div key={p.id} className="bg-panel border border-hair rounded-lg p-3 flex items-center gap-3">
            <div className="flex items-center justify-center rounded overflow-hidden" style={{ width: 40, height: 40, background: "#FFFFFF", border: "1px solid rgba(123,92,246,0.15)", flexShrink: 0 }}>
              {p.image ? (
                <img
                  src={framedProductImageUrl(p.image)}
                  alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextSibling.style.display = "flex"; }}
                />
              ) : null}
              <div style={{ display: p.image ? "none" : "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
                <CategoryIcon category={p.category} size={22} />
              </div>
            </div>
            <div className="flex-1">
              <p style={{ fontSize: 14 }}>{p.name} <span className="text-muted" style={{ fontSize: 11 }}>— {p.brand}</span></p>
              <p className="text-muted" style={{ fontSize: 11 }}>
                {CATEGORY_LABEL[p.category]}
                {subcategoryLabel(p.category, p.subcategory) && ` (${subcategoryLabel(p.category, p.subcategory)}${p.type ? " - " + typeLabel(p.category, p.subcategory, p.type) : ""}${p.facets && facetsSummary(p.category, p.subcategory, p.facets) ? " - " + facetsSummary(p.category, p.subcategory, p.facets) : ""})`} · {fmtPrice(p.price)}
                {p.variants && p.variants.length > 0 && (
                  <span className="text-gold"> · {p.variants.length} طیف رنگ</span>
                )}
                {effectiveDiscountPercent(p, globalDiscountPercent) > 0 && (
                  <span className="text-gold"> · ٪{effectiveDiscountPercent(p, globalDiscountPercent).toLocaleString("fa-IR")} تخفیف{p.discountPercent ? "" : " (همگانی)"}</span>
                )}
              </p>
            </div>
            <button onClick={() => startEdit(p)} className="btn-ghost rounded p-2"><Pencil size={14} /></button>
            <button onClick={() => remove(p.id)} className="btn-ghost rounded p-2"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      {scannerOpen && (
        <BarcodeScannerModal
          onDetected={handleBarcodeDetected}
          onClose={() => setScannerOpen(false)}
        />
      )}
    </section>
  );
}
