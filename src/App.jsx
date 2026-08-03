import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag, X, Plus, Minus, Trash2, LayoutDashboard,
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

  /* تاج صفحه‌ی اصلی: کلمات رقصان که از دو طرف به لوگو می‌رسند و برمی‌گردند */
  .crest-section { position: relative; overflow: hidden; }
  .crest-word {
    display: inline-block;
    font-family: 'Baloo 2', 'Vazirmatn', sans-serif;
    font-weight: 800;
    white-space: nowrap;
    font-size: clamp(14px, 2.6vw, 25px);
    letter-spacing: 0.2px;
  }
  .crest-fly-right { animation: crestFlyRight 6.5s ease-in-out infinite; }
  .crest-fly-left { animation: crestFlyLeft 6.5s ease-in-out infinite; }
  @keyframes crestFlyRight {
    0%, 100% { transform: translateX(64vw) rotate(6deg) scale(0.8); opacity: 0; }
    16% { opacity: 1; }
    46%, 58% { transform: translateX(0) rotate(-2deg) scale(1.04); opacity: 1; }
    84% { opacity: 1; }
  }
  @keyframes crestFlyLeft {
    0%, 100% { transform: translateX(-64vw) rotate(-6deg) scale(0.8); opacity: 0; }
    16% { opacity: 1; }
    46%, 58% { transform: translateX(0) rotate(2deg) scale(1.04); opacity: 1; }
    84% { opacity: 1; }
  }
  .crest-dot {
    position: absolute;
    border-radius: 50%;
    box-shadow: 0 0 8px 2px currentColor;
  }
  @media (prefers-reduced-motion: reduce) {
    .crest-fly-right, .crest-fly-left { animation: none; opacity: 1; transform: none; }
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
function ChromaKeyVideo({ src, style, className, renderWidth = 240 }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    let rafId;
    let cancelled = false;

    const THRESH = 20 * 20; // شعاع کاملاً شفاف (فاصله‌ی رنگی تا مشکی، به‌توان دو برای پرهیز از جذر گرفتن)
    const FEATHER = 45; // پهنای گذار نرم بین شفاف و کدر

    function draw() {
      if (cancelled) return;
      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (canvas.width === 0) {
          canvas.width = renderWidth;
          canvas.height = Math.round((video.videoHeight / video.videoWidth) * renderWidth);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = frame.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const distSq = r * r + g * g + b * b;
          if (distSq < THRESH) {
            data[i + 3] = 0;
          } else {
            const dist = Math.sqrt(distSq);
            const featherStart = Math.sqrt(THRESH);
            if (dist < featherStart + FEATHER) {
              data[i + 3] = Math.round(255 * ((dist - featherStart) / FEATHER));
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

// کامپوننت کروماکی نوع دوم: برای ویدیوهایی که پس‌زمینه‌شان رنگ یک‌دست نیست (مثلاً بافت/گرادیان خاکستری) —
// به‌جای مقایسه با یک رنگ ثابت، هر فریم را با یک «نمونه‌ی پاکِ پس‌زمینه» (که از میانگین ده‌ها فریم واقعی
// این ویدیو ساخته شده) مقایسه می‌کند؛ هرجا فرقی نداشت یعنی پس‌زمینه است و شفاف می‌شود.
const LOGO2_BG_PLATE_B64 =
  "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";

function DifferenceKeyVideo({ src, style, className, renderWidth = 300, threshold = 26, feather = 30 }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const bgDataRef = React.useRef(null);

  React.useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    let rafId;
    let cancelled = false;

    const bgImg = new Image();
    bgImg.src = `data:image/jpeg;base64,${LOGO2_BG_PLATE_B64}`;

    function ensureReady() {
      if (canvas.width === 0 && video.videoWidth > 0 && bgImg.complete) {
        canvas.width = renderWidth;
        canvas.height = Math.round((video.videoHeight / video.videoWidth) * renderWidth);
        const bgCanvas = document.createElement("canvas");
        bgCanvas.width = canvas.width;
        bgCanvas.height = canvas.height;
        const bgCtx = bgCanvas.getContext("2d");
        bgCtx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        bgDataRef.current = bgCtx.getImageData(0, 0, canvas.width, canvas.height).data;
      }
    }

    function draw() {
      if (cancelled) return;
      if (video.readyState >= 2 && video.videoWidth > 0) {
        ensureReady();
        if (bgDataRef.current) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = frame.data;
          const bgData = bgDataRef.current;
          for (let i = 0; i < data.length; i += 4) {
            const dr = data[i] - bgData[i];
            const dg = data[i + 1] - bgData[i + 1];
            const db = data[i + 2] - bgData[i + 2];
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);
            if (dist < threshold) {
              data[i + 3] = 0;
            } else if (dist < threshold + feather) {
              data[i + 3] = Math.round(255 * ((dist - threshold) / feather));
            }
          }
          ctx.putImageData(frame, 0, 0);
        }
      }
      rafId = requestAnimationFrame(draw);
    }

    video.play().catch(() => {});
    rafId = requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [src, renderWidth, threshold, feather]);

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
      return;
    }
    setMenuNav({ category: c });
  }

  // زدن روی یک زیرشاخه توی منو: اگر خودش انواع دارد (مثل صورت/چشم/لب/ابزار) وارد آن می‌شویم، وگرنه فیلتر و بسته می‌شود.
  function onMenuSubcategoryClick(category, subKey) {
    if (subKey === "all") {
      selectCategory(category);
      closeMenu();
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
  }

  const activeSubcategories = activeCategory !== "all" && CATEGORIES[activeCategory]?.subcategories
    ? CATEGORIES[activeCategory].subcategories
    : null;

  const activeTypes = activeSubcategory !== "all" ? subcategoryTypes(activeCategory, activeSubcategory) : null;

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
        <div className="flex items-center justify-between px-4 py-3 sm:px-8 lg:px-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-3" style={{ minWidth: 0, flex: "1 1 auto" }}>
            <button className="sm:hidden" onClick={() => { setMenuOpen((v) => !v); setMenuNav(null); }} aria-label="منو">
              {menuOpen ? <X size={22} color="#241E3D" /> : <Menu size={22} color="#241E3D" />}
            </button>
          </div>

          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted">
            {["all", ...CATEGORY_ORDER].map((c) => (
              <button
                key={c}
                onClick={() => selectCategory(c)}
                className={`nav-link hover:text-gold ${activeCategory === c && view === "store" ? "active text-gold" : ""}`}
              >
                {c === "all" ? "همه محصولات" : CATEGORY_LABEL[c]}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setView(view === "admin" ? "store" : "admin")}
                className="btn-ghost hidden sm:flex items-center gap-2 px-3 py-2 rounded text-xs"
              >
                <LayoutDashboard size={15} />
                {view === "admin" ? "بازگشت به فروشگاه" : "پنل مدیریت"}
              </button>
            )}
            <button onClick={() => { setSearchOpen(true); setSearchDraft(searchTerm); }} aria-label="جستجوی محصول">
              <Search size={21} color="#241E3D" />
            </button>
            <button onClick={() => setCartOpen(true)} className={`relative ${cartBump ? "cart-bump" : ""}`} aria-label="سبد خرید">
              <ShoppingBag size={22} color="#241E3D" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -left-2 bg-gold rounded-full text-xs flex items-center justify-center"
                  style={{ width: 18, height: 18, color: "#FFFFFF", fontWeight: 700 }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <button onClick={handleLogout} className="btn-ghost hidden sm:flex items-center gap-2 px-3 py-2 rounded text-xs" title="خروج">
                <User size={14} />
                {user.email}
                <LogOut size={13} />
              </button>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="btn-ghost hidden sm:flex items-center gap-2 px-3 py-2 rounded text-xs">
                <User size={14} />
                ورود / ثبت‌نام
              </button>
            )}
          </div>
        </div>

      </header>

        {menuOpen && (
          <div
            className="sm:hidden flex flex-col gap-1 text-sm text-muted"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 50,
              background: "#FFFCF7",
              padding: "16px",
              paddingTop: 20,
              overflowY: "auto",
            }}
          >
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
                  <button onClick={() => { setView(view === "admin" ? "store" : "admin"); closeMenu(); }} className="text-right py-1 text-gold">
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
          onBack={closeProduct}
          onAdd={addToCart}
          globalDiscountPercent={globalDiscountPercent}
        />
      ) : (
        <>
          {!categoryPageOpen && (
          <>
          {/* تاج صفحه‌ی اصلی: لوگوی جدید در وسط، کلمات دسته‌ها از دو طرف با رقص به آن می‌رسند */}
          <section className="crest-section w-full flex items-center justify-center" style={{ height: "clamp(210px, 34vw, 340px)" }}>
            <div style={{ position: "absolute", top: "34%", right: "50%", marginRight: 8 }}>
              <span className="crest-word crest-fly-right" style={{ color: "#FF3E8E", animationDelay: "0s" }}>آرایشی</span>
            </div>
            <div style={{ position: "absolute", top: "58%", right: "50%", marginRight: 8 }}>
              <span className="crest-word crest-fly-right" style={{ color: "#7B5CF6", animationDelay: "1.4s" }}>بهداشتی</span>
            </div>
            <div style={{ position: "absolute", top: "34%", left: "50%", marginLeft: 8 }}>
              <span className="crest-word crest-fly-left" style={{ color: "#00A9A1", animationDelay: "0.7s" }}>ادکلن</span>
            </div>
            <div style={{ position: "absolute", top: "58%", left: "50%", marginLeft: 8 }}>
              <span className="crest-word crest-fly-left" style={{ color: "#D97706", animationDelay: "2.1s" }}>ابزار برقی</span>
            </div>
            {[
              { side: "right", top: "28%", offset: "16%", size: 5, color: "#FF3E8E", delay: "0.2s" },
              { side: "right", top: "46%", offset: "28%", size: 4, color: "#7B5CF6", delay: "1.1s" },
              { side: "right", top: "66%", offset: "20%", size: 6, color: "#FFD23F", delay: "0.6s" },
              { side: "left", top: "28%", offset: "16%", size: 5, color: "#00A9A1", delay: "0.4s" },
              { side: "left", top: "46%", offset: "28%", size: 4, color: "#D97706", delay: "1.6s" },
              { side: "left", top: "66%", offset: "20%", size: 6, color: "#FF3E8E", delay: "0.9s" },
            ].map((d, i) => (
              <span
                key={i}
                className="crest-dot sparkle"
                style={{
                  top: d.top,
                  [d.side]: d.offset,
                  width: d.size,
                  height: d.size,
                  background: d.color,
                  color: d.color,
                  animationDelay: d.delay,
                }}
              />
            ))}
            <div style={{ position: "relative", zIndex: 2 }}>
              <DifferenceKeyVideo
                src="/jordan-logo-new.mp4"
                style={{ width: "min(400px, 66vw)", height: "auto", display: "block" }}
              />
            </div>
          </section>
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
                onClick={() => selectCategory(c)}
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
              <button onClick={backToStore} className="btn-ghost rounded-full px-3 py-1.5 text-xs flex items-center gap-1 mb-3">
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
