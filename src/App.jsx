import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag, ShoppingCart, ChevronRight, X, Plus, Minus, Trash2, LayoutDashboard,
  Store, Pencil, Check, Menu, Sparkles, User, LogOut, Lock, Upload, Search
} from "lucide-react";

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
    background:
      radial-gradient(1100px 550px at 12% -8%, rgba(255,62,142,0.16), transparent 60%),
      radial-gradient(900px 500px at 100% 0%, rgba(123,92,246,0.16), transparent 55%),
      radial-gradient(900px 500px at 50% 105%, rgba(0,209,178,0.14), transparent 55%),
      #FFFCF7;
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

  /* تاج صفحه‌ی اصلی: فقط لوگوی ویدیویی، وسط صفحه */

  @keyframes drawerSlideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  .menu-drawer { animation: drawerSlideIn 0.25s ease-out; }
  @media (prefers-reduced-motion: reduce) {
    .menu-drawer { animation: none; }
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
    group: "دسته بویایی",
    options: { bitter: "تلخ", sharp: "تند", sweet: "شیرین", sour: "ترش" },
  },
  {
    key: "concentration",
    group: "نوع",
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
    group: "رایحه",
    options: {
      woody: "چوبی",
      floral: "گلی",
      citrusy1: "مرکباتی",
      citrusy2: "سیتروسی",
      aldehydic: "آلدهیدی",
      tobacco: "تنباکویی",
      oud: "عودی",
      vanilla: "وانیلی",
      spicy: "ادویه‌ای",
      greenMossy: "سبز و خزه‌ای",
      aquatic: "آکوآتیک",
      resinous: "رزینی",
      scentStick: "سنستیک",
    },
  },
];

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

const CATEGORY_LABEL = Object.fromEntries(
  Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])
);

const CATEGORY_ORDER = Object.keys(CATEGORIES);

const CATEGORY_CARD_CLASS = {
  perfume: "card-perfume",
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

function discountedPrice(product, globalDiscountPercent) {
  const pct = effectiveDiscountPercent(product, globalDiscountPercent);
  if (pct <= 0) return product.price;
  return Math.round((product.price * (1 - pct / 100)) / 10) * 10;
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
      <div className="flex items-center justify-center" style={{ background: "rgba(123,92,246,0.08)", height: 168, overflow: "hidden" }}>
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
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
          {product.subcategory && (
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
        <button onClick={onBack} className="btn-ghost rounded-full px-4 py-2 text-sm">بازگشت</button>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-8 lg:px-12 max-w-3xl lg:max-w-5xl mx-auto py-6 pb-24">
      <button onClick={onBack} className="btn-ghost rounded-full px-3 py-1.5 text-xs flex items-center gap-1 mb-4">
        <span>›</span> بازگشت
      </button>

      <div className="lg:flex lg:items-start lg:gap-10">
        <div
          className={`${CATEGORY_CARD_CLASS[product.category]} rounded-2xl border border-hair overflow-hidden flex items-center justify-center mb-5 lg:mb-0 lg:sticky lg:top-24 h-80 lg:h-[440px] lg:w-[380px] lg:flex-shrink-0`}
        >
          {displayImage ? (
            <img src={displayImage} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <CategoryIcon category={product.category} size={80} />
          )}
        </div>

        <div className="lg:flex-1 lg:min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gold" style={{ fontSize: 12 }}>{product.brand}</span>
            {product.subcategory && (
              <span className="text-muted" style={{ fontSize: 10, border: "1px solid rgba(123,92,246,0.3)", borderRadius: 999, padding: "2px 8px" }}>
                {subcategoryLabel(product.category, product.subcategory)}
                {product.type && ` · ${typeLabel(product.category, product.subcategory, product.type)}`}
                {product.facets && facetsSummary(product.category, product.subcategory, product.facets) && ` · ${facetsSummary(product.category, product.subcategory, product.facets)}`}
              </span>
            )}
          </div>
          <h1 className="font-display" style={{ fontSize: 24, marginBottom: 6 }}>{product.name}</h1>
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

          {product.description && (
            <div className="mb-5">
              <h2 className="font-display" style={{ fontSize: 14, marginBottom: 5 }}>معرفی محصول</h2>
              <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-line" }}>{product.description}</p>
            </div>
          )}
          {product.properties && (
            <div className="mb-5">
              <h2 className="font-display" style={{ fontSize: 14, marginBottom: 5 }}>ویژگی‌ها و خواص</h2>
              <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-line" }}>{product.properties}</p>
            </div>
          )}
          {product.ingredients && (
            <div className="mb-7">
              <h2 className="font-display" style={{ fontSize: 14, marginBottom: 5 }}>ترکیبات</h2>
              <p className="text-muted" style={{ fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-line" }}>{product.ingredients}</p>
            </div>
          )}

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

export default function MaisonStore() {
  const [view, setView] = useState("store"); // store | admin
  const [menuOpen, setMenuOpen] = useState(false);
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
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners]);

  // اگر کاربر خارج شد یا کاربر دیگری وارد شد، در صورتی که در پنل مدیریت بود، به فروشگاه برگردد.
  useEffect(() => {
    if (view === "admin" && !isAdmin) {
      setView("store");
    }
  }, [isAdmin, view]);

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
    pushNav({ activeBrand: brand });
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

  function toggleFacet(key, value) {
    setActiveFacets((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(value);
      const nextArr = exists ? current.filter((v) => v !== value) : [...current, value];
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
      pushNav({ activeCategory: c, categoryPageOpen: c !== "all" });
      return;
    }
    setMenuNav({ category: c });
  }

  // زدن روی یک زیرشاخه توی منو: اگر خودش انواع دارد (مثل صورت/چشم/لب/ابزار) وارد آن می‌شویم، وگرنه فیلتر و بسته می‌شود.
  function onMenuSubcategoryClick(category, subKey) {
    if (subKey === "all") {
      selectCategory(category);
      closeMenu();
      pushNav({ activeCategory: category, categoryPageOpen: category !== "all" });
      return;
    }
    const types = subcategoryTypes(category, subKey);
    if (types && !(isGroupedTypes(types) && category === "perfume")) {
      setMenuNav({ category, subcategory: subKey });
      return;
    }
    // فقط ادکلن با گروه‌های موازی: مستقیم به صفحه‌ی اختصاصی همان زیرشاخه می‌رویم
    // تا مشتری از همان‌جا بتواند هم‌زمان از چند گروه (طبع، رایحه، نوع و ...) انتخاب کند.
    selectCategory(category);
    selectSubcategory(subKey);
    closeMenu();
    pushNav({ activeCategory: category, activeSubcategory: subKey, categoryPageOpen: true });
  }

  // زدن روی یک نوع دقیق محصول (سطح سوم): فیلتر نهایی اعمال و منو بسته می‌شود.
  // برای ادکلن (چندانتخابی، groupKey مشخص است) یک فیلتر به مجموعه‌ی فیلترهای فعال اضافه می‌شود؛
  // برای بقیه‌ی شاخه‌ها (تک‌انتخابی) با هر بار انتخاب، صفحه‌ی قبلی جایگزین می‌شود.
  function onMenuTypeClick(category, subKey, typeKey, groupKey) {
    selectCategory(category);
    selectSubcategory(subKey);
    if (typeKey !== "all") {
      if (category === "perfume" && groupKey) {
        toggleFacet(groupKey, typeKey);
      } else {
        setActiveType(typeKey);
      }
    }
    closeMenu();
    pushNav({
      activeCategory: category,
      activeSubcategory: subKey,
      activeType: category === "perfume" ? "all" : (typeKey !== "all" ? typeKey : "all"),
      categoryPageOpen: true,
    });
  }

  const activeSubcategories = activeCategory !== "all" && CATEGORIES[activeCategory]?.subcategories
    ? CATEGORIES[activeCategory].subcategories
    : null;

  const activeTypes = activeSubcategory !== "all" ? subcategoryTypes(activeCategory, activeSubcategory) : null;

  // مشخص می‌کند که آیا کاربر از صفحه‌ی اصلی فاصله گرفته تا فلش برگشت در هدر نمایش داده شود
  const showBackButton = view === "admin" || categoryPageOpen || !!openProductId || menuOpen;

  return (
    <div dir="rtl" lang="fa" className="maison-root min-h-screen">
      <style>{FONTS}</style>

      {/* Announcement marquee */}
      <div className="sticky top-0 z-40 overflow-hidden" style={{ background: "linear-gradient(90deg, #FF3E8E, #7B5CF6, #00C2CB, #FF3E8E)" }}>
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

      {/* Header */}
      <header className="sticky z-30 bg-panel border-b border-hair" style={{ top: 28, backdropFilter: "blur(6px)" }}>
        <div
          className="flex items-center justify-between px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto"
          style={{ height: "12mm", position: "relative" }}
        >
          <div className="flex items-center gap-3" style={{ minWidth: 0, flex: "1 1 auto" }}>
            {showBackButton && (
              <button onClick={() => window.history.back()} aria-label="بازگشت">
                <ChevronRight size={24} color="#241E3D" />
              </button>
            )}
            <button
              onClick={() => {
                if (menuOpen) {
                  window.history.back();
                } else {
                  setMenuOpen(true);
                  setMenuNav(null);
                  pushNavPreserve({ menuOpen: true });
                }
              }}
              aria-label="منو"
            >
              <Menu size={22} color="#241E3D" />
            </button>
          </div>

          {/* لوگوی ویدیویی — دقیقاً وسط نوار ۱۲ میلی‌متری هدر */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <ChromaKeyVideo
              src="/jordan-logo-new.mp4"
              keyColor={[120, 111, 103]}
              threshold={45}
              feather={30}
              renderWidth={300}
              style={{ height: "9mm", width: "auto", display: "block" }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => { setSearchOpen(true); setSearchDraft(searchTerm); }} aria-label="جستجوی محصول">
              <Search size={21} color="#241E3D" />
            </button>
            <button onClick={() => setCartOpen(true)} className={`relative ${cartBump ? "cart-bump" : ""}`} aria-label="سبد خرید">
              <ShoppingCart size={22} color="#241E3D" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -left-2 bg-gold rounded-full text-xs flex items-center justify-center"
                  style={{ width: 18, height: 18, color: "#FFFFFF", fontWeight: 700 }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

      </header>

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
                <button
                  onClick={() => { setBrandMenuOpen(true); setMenuOpen(false); }}
                  className="text-right py-1 text-gold"
                >
                  انتخاب بر اساس برند
                </button>
                {isAdmin && (
                  <button onClick={() => { if (view === "admin") { closeMenu(); window.history.back(); } else { setView("admin"); closeMenu(); pushNav({ view: "admin" }); } }} className="text-right py-1 text-gold">
                    {view === "admin" ? "بازگشت به فروشگاه" : "پنل مدیریت"}
                  </button>
                )}
                <button
                  onClick={() => { user ? handleLogout() : setAuthOpen(true); closeMenu(); }}
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
                <button onClick={() => onMenuTypeClick(menuNav.category, menuNav.subcategory, "all")} className="text-right py-1">
                  همه‌ی {subcategoryLabel(menuNav.category, menuNav.subcategory)}
                </button>
                {isGroupedTypes(subcategoryTypes(menuNav.category, menuNav.subcategory)) ? (
                  subcategoryTypes(menuNav.category, menuNav.subcategory).map((g) => (
                    <div key={g.group} className="mb-2">
                      <p className="text-gold" style={{ fontSize: 12, margin: "6px 0 4px" }}>{g.group}</p>
                      <div className="flex flex-col gap-1.5">
                        {Object.entries(g.options).map(([typeKey, label]) => (
                          <button
                            key={typeKey}
                            onClick={() => onMenuTypeClick(menuNav.category, menuNav.subcategory, typeKey, g.key)}
                            className="btn-ghost text-right rounded-lg px-3 py-1.5"
                            style={{ fontSize: 13 }}
                          >
                            {label}
                          </button>
                        ))}
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
              <img
                key={bannerIndex}
                src={heroBanners[bannerIndex]}
                alt={`بنر تبلیغاتی ${bannerIndex + 1}`}
                className="fade-in-up"
                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
              />
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
          <section className="px-4 sm:px-8 lg:px-12 max-w-6xl xl:max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
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

          {categoryPageOpen && (
            <div className="px-4 sm:px-8 lg:px-12 max-w-6xl xl:max-w-7xl mx-auto pt-6 pb-2">
              <button onClick={() => window.history.back()} className="btn-ghost rounded-full px-3 py-1.5 text-xs flex items-center gap-1 mb-3">
                <span>›</span> بازگشت به فروشگاه
              </button>
              <h1 className="font-display" style={{ fontSize: 22 }}>
                {searchTerm ? (
                  <>نتایج جستجو برای «{searchTerm}»</>
                ) : (
                  <>
                    <span style={{ color: "#7B5CF6" }}>{CATEGORY_LABEL[activeCategory]}</span>
                    {activeSubcategory !== "all" && (
                      <>
                        <span className="text-muted"> / </span>
                        <span style={{ color: "#FF3E8E" }}>{subcategoryLabel(activeCategory, activeSubcategory)}</span>
                      </>
                    )}
                    {activeCategory !== "perfume" && activeType !== "all" && (
                      <>
                        <span className="text-muted"> / </span>
                        <span style={{ color: "#00A9A1" }}>{typeLabel(activeCategory, activeSubcategory, activeType)}</span>
                      </>
                    )}
                  </>
                )}
              </h1>
            </div>
          )}

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

            {activeSubcategories && (
              (activeCategory === "perfume" && activeSubcategory === "all") ||
              (activeCategory !== "perfume" && activeType === "all")
            ) && (
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

            {activeTypes && activeCategory === "perfume" && (
              <div className="mb-4">
                {isGroupedTypes(activeTypes) && activeCategory === "perfume" ? (
                  <>
                    {Object.keys(activeFacets).length > 0 && (
                      <button
                        onClick={() => setActiveFacets({})}
                        className="btn-ghost rounded-full px-3 py-1 text-xs mb-2"
                        style={{ borderColor: "#FF3E8E", color: "#FF3E8E" }}
                      >
                        پاک کردن همه‌ی فیلترها ✕
                      </button>
                    )}
                    {activeTypes.map((g) => (
                      <div key={g.key} className="mb-2">
                        <p className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>{g.group}</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(g.options).map(([key, label]) => (
                            <button
                              key={key}
                              onClick={() => toggleFacet(g.key, key)}
                              className="btn-ghost rounded-full px-3 py-1 text-xs"
                              style={(activeFacets[g.key] || []).includes(key) ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : { opacity: 0.85 }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : isGroupedTypes(activeTypes) ? (
                  <>
                    {/* غیر از ادکلن: فقط یک نوع قابل انتخاب است — با انتخاب نوع جدید، صفحه‌ی قبلی جایگزین می‌شود نه اینکه کنارش اضافه شود */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <button
                        onClick={() => setActiveType("all")}
                        className="btn-ghost rounded-full px-3 py-1 text-xs"
                        style={activeType === "all" ? { borderColor: "#FF3E8E", color: "#FF3E8E" } : { opacity: 0.85 }}
                      >
                        همه‌ی انواع
                      </button>
                    </div>
                    {activeTypes.map((g) => (
                      <div key={g.key} className="mb-2">
                        <p className="text-muted" style={{ fontSize: 11, marginBottom: 4 }}>{g.group}</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(g.options).map(([key, label]) => (
                            <button
                              key={key}
                              onClick={() => setActiveType(key)}
                              className="btn-ghost rounded-full px-3 py-1 text-xs"
                              style={activeType === key ? { borderColor: "#FF3E8E", color: "#FF3E8E", background: "rgba(255,62,142,0.12)" } : { opacity: 0.85 }}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <button
                        onClick={() => setActiveType("all")}
                        className="btn-ghost rounded-full px-3 py-1 text-xs"
                        style={activeType === "all" ? { borderColor: "#FF3E8E", color: "#FF3E8E" } : { opacity: 0.85 }}
                      >
                        همه‌ی انواع
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(activeTypes).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setActiveType(key)}
                          className="btn-ghost rounded-full px-3 py-1 text-xs"
                          style={activeType === key ? { borderColor: "#FF3E8E", color: "#FF3E8E" } : { opacity: 0.85 }}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {brandsInCategory.length > 1 && (
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
                    <div className="flex items-center justify-center rounded overflow-hidden" style={{ width: 44, height: 44, background: "rgba(123,92,246,0.08)" }}>
                      {(item.variant && item.variant.image) || item.image ? (
                        <img
                          src={(item.variant && item.variant.image) || item.image}
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
  return { id: null, name: "", brand: "", category: "perfume", subcategory: "", type: "", facets: {}, price: "", discountPercent: "", description: "", properties: "", ingredients: "", image: "", variantsList: [] };
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

function AdminPanel({ products, onAdd, onUpdate, onRemove, onUploadImage, storageError, heroBanners, onUpdateHeroBanners, globalDiscountPercent, onUpdateGlobalDiscount }) {
  const [bannerDrafts, setBannerDrafts] = useState(heroBanners || []);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroError, setHeroError] = useState("");
  const [heroSaved, setHeroSaved] = useState(false);
  const [discountDraft, setDiscountDraft] = useState(String(globalDiscountPercent || ""));
  const [discountSaving, setDiscountSaving] = useState(false);
  const [discountError, setDiscountError] = useState("");
  const [discountSaved, setDiscountSaved] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);

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
    if (!file.type.startsWith("image/")) {
      setHeroError("فایل انتخاب‌شده تصویر نیست");
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
      setBannerDrafts((prev) => [...prev, url]);
    } catch (err) {
      setHeroError(err.message || "آپلود تصویر ناموفق بود");
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

  function startEdit(p) {
    setEditingId(p.id);
    setFormError("");
    setForm({ ...p, price: String(p.price), discountPercent: p.discountPercent ? String(p.discountPercent) : "", variantsList: (p.variants || []).map((v) => ({ ...v })), facets: p.facets || {}, properties: p.properties || "", ingredients: p.ingredients || "" });
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
    const payload = { ...rest, price: priceNum, discountPercent: discountPercentNum, facets: form.category === "perfume" ? form.facets : {}, ...(variants.length > 0 ? { variants } : { variants: undefined }) };
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
          چند عکس تبلیغاتی اضافه کن؛ روی صفحه‌ی اصلی هر ۵ ثانیه یکی بعد از دیگری نمایش داده می‌شوند (مثل اسلایدر).
        </p>

        {bannerDrafts.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {bannerDrafts.map((url, i) => (
              <div key={i} className="flex items-center gap-2 bg-panel-2 border border-hair rounded p-2">
                <img
                  src={url}
                  alt={`بنر ${i + 1}`}
                  style={{ width: 56, height: 32, borderRadius: 4, objectFit: "cover" }}
                  onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
                />
                <span className="text-muted" style={{ fontSize: 11, flex: 1 }}>بنر شماره {i + 1}</span>
                <button type="button" onClick={() => moveBannerDraft(i, -1)} disabled={i === 0} className="btn-ghost rounded px-2 py-1 text-xs">▲</button>
                <button type="button" onClick={() => moveBannerDraft(i, 1)} disabled={i === bannerDrafts.length - 1} className="btn-ghost rounded px-2 py-1 text-xs">▼</button>
                <button type="button" onClick={() => removeBannerDraft(i)} className="btn-ghost rounded px-2 py-1 text-xs" style={{ color: "#D6336C" }}>حذف</button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap mb-3">
          <label
            className="btn-ghost rounded px-3 py-2 text-xs flex items-center gap-2"
            style={{ cursor: heroUploading ? "default" : "pointer", opacity: heroUploading ? 0.6 : 1 }}
          >
            <Upload size={14} />
            {heroUploading ? "در حال آپلود..." : "افزودن عکس از گالری"}
            <input type="file" accept="image/*" onChange={handleHeroFile} disabled={heroUploading} style={{ display: "none" }} />
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

      <form onSubmit={submit} className="bg-panel border border-hair rounded-lg p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          placeholder="نام محصول"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
          style={{ color: "#241E3D" }}
        />
        <input
          placeholder="برند"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
          style={{ color: "#241E3D" }}
        />
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
                پیش‌نمایش دقیق — دقیقاً همین‌طوری توی کارت محصول نمایش داده می‌شود (کادر خودش با هر سایز عکس هماهنگ می‌شود و چیزی از عکس بریده نمی‌شود):
              </p>
              <div
                className={CATEGORY_CARD_CLASS[form.category]}
                style={{
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
                  src={form.image}
                  alt="پیش‌نمایش"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.dataset.broken = "1"; }}
                  onLoad={(e) => { delete e.currentTarget.parentElement.dataset.broken; e.currentTarget.style.display = "block"; }}
                />
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
            <div className="flex items-center justify-center rounded overflow-hidden" style={{ width: 40, height: 40, background: "rgba(123,92,246,0.08)", flexShrink: 0 }}>
              {p.image ? (
                <img
                  src={p.image}
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
                {p.subcategory && ` (${subcategoryLabel(p.category, p.subcategory)}${p.type ? " - " + typeLabel(p.category, p.subcategory, p.type) : ""}${p.facets && facetsSummary(p.category, p.subcategory, p.facets) ? " - " + facetsSummary(p.category, p.subcategory, p.facets) : ""})`} · {fmtPrice(p.price)}
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
    </section>
  );
}
