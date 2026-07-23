import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag, X, Plus, Minus, Trash2, LayoutDashboard,
  Store, Pencil, Check, Menu, Sparkles, User, LogOut, Lock, Upload
} from "lucide-react";

// آدرس بک‌اندی که راه‌اندازی کردی را اینجا جایگزین کن
// (بعد از دیپلوی سرور در پوشه‌ی backend، مثلاً: "https://jordan-gallery-shop-backend.onrender.com")
const API_BASE_URL = "https://jordan-gallery-shop-backend.onrender.com";


// فقط کاربری با همین ایمیل اجازه‌ی دسترسی به پنل مدیریت را دارد.
// تشخیص نهایی مدیر بودن باید سمت سرور (بک‌اند) هم بررسی شود؛ این فقط لایه‌ی نمایش در فرانت‌اند است.
const ADMIN_EMAIL = "rezajordan2012@gmail.com";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&display=swap');

  .maison-root {
    font-family: 'Vazirmatn', sans-serif;
    background:
      radial-gradient(1200px 600px at 15% -10%, rgba(212,175,122,0.10), transparent 60%),
      radial-gradient(900px 500px at 100% 0%, rgba(148,90,150,0.14), transparent 55%),
      #17111C;
    color: #F3EDE4;
    -webkit-font-smoothing: antialiased;
  }
  .font-latin { font-family: 'Cormorant Garamond', serif; letter-spacing: 0.2em; }
  .font-display { font-family: 'Vazirmatn', sans-serif; font-weight: 800; letter-spacing: -0.01em; }

  ::selection { background: rgba(212,175,122,0.35); color: #1B1420; }

  .bg-panel { background: #211823; }
  .bg-panel-2 { background: #2A1F2E; }
  .border-hair { border-color: rgba(216, 191, 158, 0.14); }
  .text-gold { color: #DCB77E; }
  .text-muted { color: #A99BB0; }
  .bg-gold { background: #B08D57; }
  .bg-gold-grad { background: linear-gradient(135deg, #D4AF7A, #9C7A45); }

  .btn-gold {
    background: linear-gradient(135deg, #E4C08C, #B98A4C);
    color: #1B1420;
    box-shadow: 0 6px 20px -6px rgba(212,175,122,0.45);
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
  }
  .btn-gold:hover { filter: brightness(1.06); transform: translateY(-1px); box-shadow: 0 10px 24px -6px rgba(212,175,122,0.55); }
  .btn-gold:active { transform: translateY(0); }

  .btn-ghost {
    border: 1px solid rgba(216, 191, 158, 0.3);
    color: #F3EDE4;
    background: rgba(255,255,255,0.02);
    transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
  }
  .btn-ghost:hover { border-color: #DCB77E; color: #DCB77E; background: rgba(220,183,126,0.06); }

  .card-perfume { background: linear-gradient(160deg, #3B2440, #211823); }
  .card-beauty { background: linear-gradient(160deg, #402637, #211823); }
  .card-hygiene { background: linear-gradient(160deg, #2E3A34, #17111C); }
  .card-electronics { background: linear-gradient(160deg, #24303F, #17111C); }

  .product-card {
    transition: transform 0.28s cubic-bezier(.2,.8,.2,1), box-shadow 0.28s ease, border-color 0.28s ease;
    box-shadow: 0 1px 0 rgba(255,255,255,0.03) inset, 0 12px 24px -18px rgba(0,0,0,0.6);
  }
  .product-card:hover {
    transform: translateY(-4px);
    border-color: rgba(220,183,126,0.4);
    box-shadow: 0 18px 34px -16px rgba(0,0,0,0.65), 0 0 0 1px rgba(220,183,126,0.12);
  }
  .product-card img { transition: transform 0.5s ease; }
  .product-card:hover img { transform: scale(1.045); }

  .category-card {
    transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
  }
  .category-card:hover {
    transform: translateY(-3px);
    border-color: rgba(220,183,126,0.45);
    box-shadow: 0 16px 30px -18px rgba(0,0,0,0.6);
  }

  .glint {
    position: absolute; top: 0; left: -60%; width: 40%; height: 100%;
    background: linear-gradient(100deg, transparent, rgba(255,255,255,0.18), transparent);
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
    background: repeating-conic-gradient(from 0deg, rgba(228,192,140,0.16) 0deg 4deg, transparent 4deg 18deg);
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
    background: radial-gradient(circle, rgba(228,192,140,0.35), rgba(148,90,150,0.16) 55%, transparent 75%);
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
    content: ""; position: absolute; right: 0; bottom: 0; height: 1px; width: 0;
    background: #DCB77E; transition: width 0.25s ease;
  }
  .nav-link.active::after, .nav-link:hover::after { width: 100%; }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: rgba(220,183,126,0.55) !important;
    box-shadow: 0 0 0 3px rgba(220,183,126,0.12);
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
    background: linear-gradient(100deg, #241a29 30%, #33253a 50%, #241a29 70%);
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

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(220,183,126,0.4); }
    50% { box-shadow: 0 0 0 6px rgba(220,183,126,0); }
  }
  .pulse-glow { animation: pulseGlow 2.2s ease-in-out infinite; }

  @media (prefers-reduced-motion: reduce) {
    .glint, .float-slow, .fade-in-up { animation: none; }
    .product-card, .product-card img, .category-card { transition: none; }
    .marquee-track, .cart-bump, .skeleton, .sparkle, .pulse-glow { animation: none; }
    .ray-burst, .hero-halo { animation: none; }
  }
`;

const CATEGORIES = {
  perfume: {
    label: "ادکلن",
    subcategories: {
      menPerfume: "عطر مردانه",
      womenPerfume: "عطر زنانه",
      sample: "سمپل",
      tester: "تستر",
      miniature: "مینیاتوری",
      giftSet: "گیفت ست",
      decant: "دکانت (دست‌ریز)",
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
        types: {
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
      eye: {
        label: "چشم",
        types: {
          eyebrow: "ابرو",
          eyeshadow: "سایه چشم",
          glitter: "اکلیل",
          mascara: "ریمل",
          eyeliner: "خط چشم",
        },
      },
      lip: {
        label: "لب",
        types: {
          lipstick: "رژ لب",
          gloss: "برق لب",
          liner: "خط لب",
          liquidLipstick: "رژ لب مایع",
          tint: "رنگ لب",
          lipCare: "مراقبت از لب",
          lipSet: "ست لب",
        },
      },
      accessory: {
        label: "ابزارهای زیبایی",
        types: {
          brushes: "برس‌ها",
          spongeTools: "اسفنج و ابزار",
          lashes: "مژه‌ها",
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
      faceSkin: "مراقبت از پوست صورت",
      bodySkin: "مراقبت از پوست بدن",
      oral: "مراقبت از دهان و دندان",
      feminine: "بهداشت شخصی بانوان",
      masculine: "مراقبت شخصی آقایان",
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

function typeLabel(category, subcategory, type) {
  const types = subcategoryTypes(category, subcategory);
  if (!types || !type) return "";
  return types[type] || "";
}

function fmtPrice(n) {
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

function isAdminUser(user) {
  return !!user && typeof user.email === "string" && user.email.toLowerCase() === ADMIN_EMAIL;
}

function CategoryIcon({ category, size = 34 }) {
  const stroke = "#D4AF7A";
  if (category === "perfume") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <rect x="16" y="6" width="6" height="6" rx="1" stroke={stroke} strokeWidth="1.6" />
        <path d="M14 16h20a2 2 0 0 1 2 2v20a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V18a2 2 0 0 1 2-2Z" stroke={stroke} strokeWidth="1.6" />
        <path d="M14 26h20" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
      </svg>
    );
  }
  if (category === "makeup") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="20" r="10" stroke={stroke} strokeWidth="1.6" />
        <path d="M24 30v12M18 42h12" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="24" cy="20" r="4" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
      </svg>
    );
  }
  if (category === "hygiene") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <path d="M24 6c8 10 12 16.5 12 22a12 12 0 1 1-24 0c0-5.5 4-12 12-22Z" stroke={stroke} strokeWidth="1.6" />
        <path d="M18 30a6 6 0 0 0 6 6" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="10" y="14" width="28" height="18" rx="3" stroke={stroke} strokeWidth="1.6" />
      <path d="M18 32v4M30 32v4M16 40h16" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 20h16" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
    </svg>
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
  { id: "p1", name: "بلور شب", brand: "خانه میسان", category: "perfume", subcategory: "womenPerfume", price: 2450000, description: "رایحه‌ای شرقی و گرم با نت‌های عود و وانیل، مناسب شب.", image: "" },
  { id: "p2", name: "باغ سپید", brand: "خانه میسان", category: "perfume", subcategory: "menPerfume", price: 1980000, description: "ترکیبی تازه از یاس و مرکبات برای روزهای بهاری.", image: "" },
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
  { id: "p10", name: "لوسیون آبرسان بدن", brand: "ولوره", category: "hygiene", subcategory: "bodySkin", price: 420000, description: "لوسیون سبک و سریع‌جذب برای آبرسانی روزانه‌ی پوست.", image: "" },
  { id: "p5", name: "سشوار حرفه‌ای یون‌دار", brand: "ولوره", category: "electronics", subcategory: "hair", price: 3200000, description: "قدرت ۲۲۰۰ وات، فناوری یونیزه برای کاهش وز مو.", image: "" },
  { id: "p6", name: "اپیلاتور بی‌سیم", brand: "ولوره", category: "electronics", subcategory: "body", price: 2100000, description: "طراحی مینیمال، شارژ سریع و کاربرد ملایم روی پوست.", image: "" },
  { id: "p11", name: "دستگاه پاکسازی صورت", brand: "ولوره", category: "electronics", subcategory: "face", price: 1650000, description: "برس سونیک برای پاکسازی عمیق منافذ پوست صورت.", image: "" },
];

function ProductCard({ product, onAdd }) {
  const hasVariants = product.variants && product.variants.length > 0;
  const [variantId, setVariantId] = useState("");
  const selectedVariant = hasVariants ? product.variants.find((v) => v.id === variantId) : null;

  const displayImage = (selectedVariant && selectedVariant.image) || product.image || "";

  return (
    <div className={`${CATEGORY_CARD_CLASS[product.category]} product-card rounded-xl border border-hair overflow-hidden flex flex-col`}>
      <div className="flex items-center justify-center" style={{ background: "rgba(0,0,0,0.15)", height: 220, overflow: "hidden" }}>
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
            <span className="text-muted" style={{ fontSize: 10, border: "1px solid rgba(216,191,158,0.25)", borderRadius: 999, padding: "2px 8px" }}>
              {subcategoryLabel(product.category, product.subcategory)}
              {product.type && ` · ${typeLabel(product.category, product.subcategory, product.type)}`}
            </span>
          )}
        </div>
        <h3 className="font-display" style={{ fontSize: 16 }}>{product.name}</h3>
        <p className="text-muted" style={{ fontSize: 12, minHeight: 32 }}>{product.description}</p>

        {hasVariants && (
          <div className="flex items-center gap-2 mt-1">
            {selectedVariant && selectedVariant.image ? (
              <img
                src={selectedVariant.image}
                alt={selectedVariant.label}
                style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.4)", flexShrink: 0 }}
              />
            ) : (
              selectedVariant && selectedVariant.hex && (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: selectedVariant.hex,
                    border: "1px solid rgba(255,255,255,0.4)",
                    flexShrink: 0,
                  }}
                />
              )
            )}
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="bg-panel-2 border border-hair rounded px-2 py-1.5 text-xs flex-1"
              style={{ color: "#F3EDE4" }}
            >
              <option value="">انتخاب رنگ / شماره ({product.variants.length} طیف)</option>
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <span style={{ fontSize: 14, fontWeight: 600 }}>{fmtPrice(product.price)}</span>
          <button
            onClick={() => onAdd(product, variantId || undefined)}
            disabled={hasVariants && !variantId}
            className="btn-gold rounded px-3 py-2 text-xs"
            style={hasVariants && !variantId ? { opacity: 0.5 } : undefined}
          >
            افزودن
          </button>
        </div>
        {hasVariants && !variantId && (
          <p style={{ fontSize: 10, color: "#A99BB0" }}>برای افزودن به سبد، رنگ را انتخاب کن.</p>
        )}
      </div>
    </div>
  );
}

export default function MaisonStore() {
  const [view, setView] = useState("store"); // store | admin
  const [menuOpen, setMenuOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [menuNav, setMenuNav] = useState(null); // null | { category } | { category, subcategory }
  const [cartOpen, setCartOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubcategory, setActiveSubcategory] = useState("all");
  const [activeType, setActiveType] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");
  const [cart, setCart] = useState({}); // id -> qty
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const [heroImage, setHeroImage] = useState(null);

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
      const res = await fetch(`${API_BASE_URL}/api/products`);
      if (!res.ok) throw new Error("bad response");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : SEED_PRODUCTS);
      setStorageError(false);
    } catch (e) {
      // اگر اتصال به سرور برقرار نشد، محصولات نمونه نمایش داده می‌شوند
      // ولی هشدار داده می‌شود که این‌ها موقتی‌اند و از سرور نیامده‌اند.
      setProducts(SEED_PRODUCTS);
      setStorageError(true);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.heroImage) setHeroImage(data.heroImage);
    } catch (e) {
      // اگر سرور در دسترس نبود، همان تصویر پیش‌فرض نمایش داده می‌شود.
    }
  };

  useEffect(() => {
    loadProducts();
    loadSettings();
  }, []);

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

  async function updateHeroImage(url) {
    const res = await fetch(`${API_BASE_URL}/api/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ heroImage: url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "ذخیره‌ی تصویر ناموفق بود");
    setHeroImage(url);
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
          return { ...product, cartKey: key, qty, variant };
        })
        .filter(Boolean),
    [cart, products]
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
    setBrandMenuOpen(false);
    setMenuOpen(false);
    setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  const brandsInCategory = useMemo(() => {
    const scoped = activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);
    return Array.from(new Set(scoped.map((p) => p.brand).filter(Boolean))).sort((a, b) => a.localeCompare(b, "fa"));
  }, [products, activeCategory]);

  const filteredProducts = products.filter((p) => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (activeCategory !== "all" && activeSubcategory !== "all" && (p.subcategory || "") !== activeSubcategory) return false;
    if (activeSubcategory !== "all" && activeType !== "all" && (p.type || "") !== activeType) return false;
    if (activeBrand !== "all" && p.brand !== activeBrand) return false;
    return true;
  });

  function selectCategory(c) {
    setActiveCategory(c);
    setActiveSubcategory("all");
    setActiveType("all");
    setActiveBrand("all");
    setView("store");
  }

  function selectSubcategory(key) {
    setActiveSubcategory(key);
    setActiveType("all");
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
    if (subcategoryTypes(category, subKey)) {
      setMenuNav({ category, subcategory: subKey });
      return;
    }
    selectCategory(category);
    selectSubcategory(subKey);
    closeMenu();
  }

  // زدن روی یک نوع دقیق محصول (سطح سوم): فیلتر نهایی اعمال و منو بسته می‌شود.
  function onMenuTypeClick(category, subKey, typeKey) {
    selectCategory(category);
    selectSubcategory(subKey);
    if (typeKey !== "all") setActiveType(typeKey);
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
      <div className="sticky top-0 z-40 overflow-hidden" style={{ background: "linear-gradient(90deg, #B98A4C, #E4C08C, #B98A4C)" }}>
        <div className="marquee-track py-1.5" style={{ color: "#1B1420", fontSize: 12, fontWeight: 600 }}>
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
        <div className="flex items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button className="sm:hidden" onClick={() => { setMenuOpen((v) => !v); setMenuNav(null); }} aria-label="منو">
              <Menu size={22} color="#F3EDE4" />
            </button>
            <div className="flex flex-col leading-none">
              <span className="font-latin text-gold" style={{ fontSize: 13 }}>JORDAN</span>
              <span className="font-display" style={{ fontSize: 20 }}>گالری جردن</span>
            </div>
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
            <button onClick={() => setCartOpen(true)} className={`relative ${cartBump ? "cart-bump" : ""}`} aria-label="سبد خرید">
              <ShoppingBag size={22} color="#F3EDE4" />
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -left-2 bg-gold rounded-full text-xs flex items-center justify-center"
                  style={{ width: 18, height: 18, color: "#1B1420", fontWeight: 700 }}
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

        {menuOpen && (
          <div className="sm:hidden flex flex-col gap-1 px-4 pb-3 text-sm text-muted">
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
                <p className="font-display" style={{ fontSize: 15, color: "#F3EDE4", margin: "4px 0" }}>
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
                <p className="font-display" style={{ fontSize: 15, color: "#F3EDE4", margin: "4px 0" }}>
                  {subcategoryLabel(menuNav.category, menuNav.subcategory)}
                </p>
                <button onClick={() => onMenuTypeClick(menuNav.category, menuNav.subcategory, "all")} className="text-right py-1">
                  همه‌ی {subcategoryLabel(menuNav.category, menuNav.subcategory)}
                </button>
                {Object.entries(subcategoryTypes(menuNav.category, menuNav.subcategory)).map(([typeKey, label]) => (
                  <button
                    key={typeKey}
                    onClick={() => onMenuTypeClick(menuNav.category, menuNav.subcategory, typeKey)}
                    className="text-right py-1"
                  >
                    {label}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </header>

      {/* پنل انتخاب بر اساس برند — از منوی کشویی باز می‌شود */}
      {brandMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setBrandMenuOpen(false)}>
          <div className="bg-panel-2 rounded-lg p-6 w-full border border-hair" style={{ maxWidth: 380, maxHeight: "70vh", overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display" style={{ fontSize: 17 }}>انتخاب بر اساس برند</h3>
              <button onClick={() => setBrandMenuOpen(false)}><X size={18} color="#F3EDE4" /></button>
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
          heroImage={heroImage}
          onUpdateHeroImage={updateHeroImage}
        />
      ) : (
        <>
          {/* Hero */}
          <section className="px-4 sm:px-8 py-10 sm:py-16 flex flex-col sm:flex-row items-center gap-8 sm:gap-4 max-w-6xl mx-auto">
            <div className="flex-1 order-2 sm:order-1 text-center sm:text-right">
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

            <div className="flex-1 order-1 sm:order-2 flex justify-center">
              <div className="float-slow" style={{ position: "relative", width: 150, height: 200 }}>
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt="عطر جردن"
                    style={{ width: 150, height: 200, objectFit: "contain", filter: "drop-shadow(0 14px 24px rgba(0,0,0,0.5))" }}
                  />
                ) : (
                  <svg width="150" height="200" viewBox="0 0 150 200" fill="none">
                    <rect x="55" y="10" width="40" height="24" rx="4" fill="#B08D57" />
                    <rect x="62" y="0" width="26" height="14" rx="3" fill="#D4AF7A" />
                    <rect x="30" y="34" width="90" height="150" rx="14" fill="url(#bottleGrad)" stroke="#9C7A45" strokeWidth="1.5" />
                    <rect x="30" y="90" width="90" height="94" rx="14" fill="url(#liquidGrad)" opacity="0.85" />
                    <defs>
                      <linearGradient id="bottleGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#3B2440" />
                        <stop offset="1" stopColor="#241A29" />
                      </linearGradient>
                      <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="#D4AF7A" />
                        <stop offset="1" stopColor="#8A6A3E" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
                <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 14 }}>
                  <div className="glint" />
                </div>
                <span className="sparkle" style={{ position: "absolute", top: 6, right: -6, width: 6, height: 6, borderRadius: "50%", background: "#F3D9A8", boxShadow: "0 0 8px 2px rgba(243,217,168,0.8)" }} />
                <span className="sparkle" style={{ position: "absolute", top: "45%", left: -12, width: 5, height: 5, borderRadius: "50%", background: "#F3D9A8", boxShadow: "0 0 8px 2px rgba(243,217,168,0.8)", animationDelay: "0.8s" }} />
                <span className="sparkle" style={{ position: "absolute", bottom: 14, right: 10, width: 4, height: 4, borderRadius: "50%", background: "#F3D9A8", boxShadow: "0 0 6px 2px rgba(243,217,168,0.8)", animationDelay: "1.6s" }} />
              </div>
            </div>
          </section>

          {/* Category strip */}
          <section className="px-4 sm:px-8 max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                onClick={() => selectCategory(c)}
                className={`${CATEGORY_CARD_CLASS[c]} category-card rounded-xl p-5 flex items-center gap-4 border border-hair text-right`}
              >
                <CategoryIcon category={c} />
                <div>
                  <p className="font-display" style={{ fontSize: 16 }}>{CATEGORY_LABEL[c]}</p>
                  <p className="text-muted" style={{ fontSize: 12 }}>
                    {products.filter((p) => p.category === c).length} محصول
                  </p>
                </div>
              </button>
            ))}
          </section>

          {/* Catalog */}
          <section id="catalog" className="px-4 sm:px-8 max-w-6xl mx-auto pb-20">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} color="#D4AF7A" />
              <h2 className="font-display" style={{ fontSize: 20 }}>
                {activeCategory === "all" ? "محصولات منتخب" : CATEGORY_LABEL[activeCategory]}
              </h2>
            </div>

            {activeSubcategories && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => selectSubcategory("all")}
                  className="btn-ghost rounded-full px-3 py-1.5 text-xs"
                  style={activeSubcategory === "all" ? { borderColor: "#DCB77E", color: "#DCB77E" } : undefined}
                >
                  همه
                </button>
                {Object.keys(activeSubcategories).map((key) => (
                  <button
                    key={key}
                    onClick={() => selectSubcategory(key)}
                    className="btn-ghost rounded-full px-3 py-1.5 text-xs"
                    style={activeSubcategory === key ? { borderColor: "#DCB77E", color: "#DCB77E" } : undefined}
                  >
                    {subcategoryLabel(activeCategory, key)}
                  </button>
                ))}
              </div>
            )}

            {activeTypes && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveType("all")}
                  className="btn-ghost rounded-full px-3 py-1 text-xs"
                  style={activeType === "all" ? { borderColor: "#DCB77E", color: "#DCB77E" } : { opacity: 0.85 }}
                >
                  همه‌ی انواع
                </button>
                {Object.entries(activeTypes).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveType(key)}
                    className="btn-ghost rounded-full px-3 py-1 text-xs"
                    style={activeType === key ? { borderColor: "#DCB77E", color: "#DCB77E" } : { opacity: 0.85 }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {brandsInCategory.length > 1 && (
              <div className="flex items-center gap-2 mb-6">
                <span className="text-muted" style={{ fontSize: 12 }}>برند:</span>
                <select
                  value={activeBrand}
                  onChange={(e) => setActiveBrand(e.target.value)}
                  className="bg-panel-2 border border-hair rounded-full px-3 py-1.5 text-xs"
                  style={{ color: "#F3EDE4" }}
                >
                  <option value="all">همه‌ی برندها</option>
                  {brandsInCategory.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-hair overflow-hidden">
                    <div className="skeleton" style={{ height: 220 }} />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((p, i) => (
                  <div key={p.id} className="fade-in-up" style={{ animationDelay: `${Math.min(i, 8) * 0.06}s` }}>
                    <ProductCard product={p} onAdd={addToCart} />
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
          background: "rgba(36,26,41,0.85)",
          border: "1px solid rgba(216,191,158,0.25)",
        }}
      >
        <Lock size={16} color="#D4AF7A" />
      </button>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-40 flex justify-end" style={{ background: "rgba(0,0,0,0.55)" }} onClick={() => setCartOpen(false)}>
          <div
            className="cart-drawer bg-panel-2 h-full w-full sm:w-96 p-5 flex flex-col border-hair"
            style={{ borderInlineStart: "1px solid rgba(216,191,158,0.16)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display" style={{ fontSize: 18 }}>سبد خرید</h3>
              <button onClick={() => setCartOpen(false)}><X size={20} color="#F3EDE4" /></button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-muted" style={{ fontSize: 14 }}>سبد خرید شما خالی است.</p>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col gap-4">
                {cartItems.map((item) => (
                  <div key={item.cartKey} className="flex items-center gap-3 border-b border-hair pb-3">
                    <div className="flex items-center justify-center rounded overflow-hidden" style={{ width: 44, height: 44, background: "rgba(255,255,255,0.05)" }}>
                      {(item.variant && item.variant.image) || item.image ? (
                        <img
                          src={(item.variant && item.variant.image) || item.image}
                          alt={item.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : item.variant && item.variant.hex ? (
                        <span style={{ width: 20, height: 20, borderRadius: "50%", background: item.variant.hex, border: "1px solid rgba(255,255,255,0.4)" }} />
                      ) : (
                        <CategoryIcon category={item.category} size={22} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: 13 }}>{item.name}</p>
                      {item.variant && (
                        <p className="text-gold" style={{ fontSize: 11 }}>{item.variant.label}</p>
                      )}
                      <p className="text-muted" style={{ fontSize: 11 }}>{fmtPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => changeQty(item.cartKey, -1)}><Minus size={14} color="#D4AF7A" /></button>
                      <span style={{ fontSize: 13 }}>{item.qty}</span>
                      <button onClick={() => changeQty(item.cartKey, 1)}><Plus size={14} color="#D4AF7A" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.cartKey)}><Trash2 size={15} color="#A99BB0" /></button>
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
                <p className="mt-2" style={{ fontSize: 11, color: "#E3A9A9" }}>{checkoutError}</p>
              )}
              <p className="text-muted mt-2" style={{ fontSize: 10 }}>
                پرداخت از طریق درگاه زرین‌پال انجام می‌شود.
              </p>
            </div>
          </div>
        </div>
      )}

      {authOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setAuthOpen(false)}>
          <div className="bg-panel-2 rounded-lg p-6 w-full border border-hair" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display" style={{ fontSize: 17 }}>
                {authMode === "login" ? "ورود به حساب کاربری" : "ساخت حساب کاربری"}
              </h3>
              <button onClick={() => setAuthOpen(false)}><X size={18} color="#F3EDE4" /></button>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
              {authMode === "register" && (
                <input
                  placeholder="نام و نام خانوادگی"
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  className="bg-panel border border-hair rounded px-3 py-2 text-sm"
                  style={{ color: "#F3EDE4" }}
                />
              )}
              <input
                type="email"
                required
                placeholder="ایمیل"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="bg-panel border border-hair rounded px-3 py-2 text-sm"
                style={{ color: "#F3EDE4" }}
              />
              <input
                type="password"
                required
                placeholder="رمز عبور (حداقل ۶ کاراکتر)"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="bg-panel border border-hair rounded px-3 py-2 text-sm"
                style={{ color: "#F3EDE4" }}
              />
              {authError && <p style={{ fontSize: 12, color: "#E3A9A9" }}>{authError}</p>}
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
  return { id: null, name: "", brand: "", category: "perfume", subcategory: "", type: "", price: "", description: "", image: "", variantsText: "" };
}

function AdminPanel({ products, onAdd, onUpdate, onRemove, onUploadImage, storageError, heroImage, onUpdateHeroImage }) {
  const [heroUrlDraft, setHeroUrlDraft] = useState(heroImage || "");
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroError, setHeroError] = useState("");
  const [heroSaved, setHeroSaved] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);

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
      setHeroUrlDraft(url);
    } catch (err) {
      setHeroError(err.message || "آپلود تصویر ناموفق بود");
    } finally {
      setHeroUploading(false);
    }
  }

  async function saveHeroImage() {
    if (!heroUrlDraft) return;
    setHeroError("");
    setHeroSaved(false);
    setHeroSaving(true);
    try {
      await onUpdateHeroImage(heroUrlDraft);
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
    setForm({ ...p, price: String(p.price), variantsText: variantsToText(p.variants) });
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
    const variants = parseVariantsText(form.variantsText);
    const { variantsText, id, ...rest } = form;
    const payload = { ...rest, price: priceNum, ...(variants.length > 0 ? { variants } : { variants: undefined }) };
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
        <LayoutDashboard size={18} color="#D4AF7A" />
        <h2 className="font-display" style={{ fontSize: 20 }}>پنل مدیریت محصولات</h2>
      </div>
      <p className="text-muted mb-6" style={{ fontSize: 12 }}>
        محصولات روی سرور فروشگاه ذخیره می‌شوند و برای همه‌ی مشتریان قابل مشاهده‌اند.
      </p>
      {storageError && (
        <p className="mb-4 rounded p-3" style={{ fontSize: 12, background: "rgba(180,80,80,0.15)", color: "#E3A9A9" }}>
          اتصال به سرور فروشگاه برقرار نشد؛ محصولات نمونه نمایش داده شده‌اند و تغییرات ذخیره نمی‌شوند. دوباره صفحه را باز کن.
        </p>
      )}
      {formError && (
        <p className="mb-4 rounded p-3" style={{ fontSize: 12, background: "rgba(180,80,80,0.15)", color: "#E3A9A9" }}>
          {formError}
        </p>
      )}

      {/* تنظیمات تصویر Hero صفحه‌ی اصلی */}
      <div className="bg-panel border border-hair rounded-lg p-4 mb-8">
        <h3 className="font-display mb-1" style={{ fontSize: 15 }}>تصویر صفحه‌ی اصلی (Hero)</h3>
        <p className="text-muted mb-3" style={{ fontSize: 11 }}>
          این عکس همان تصویری است که بالای صفحه‌ی اصلی سایت، کنار متن معرفی، نمایش داده می‌شود.
        </p>
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <label
            className="btn-ghost rounded px-3 py-2 text-xs flex items-center gap-2"
            style={{ cursor: heroUploading ? "default" : "pointer", opacity: heroUploading ? 0.6 : 1 }}
          >
            <Upload size={14} />
            {heroUploading ? "در حال آپلود..." : "انتخاب از گالری"}
            <input type="file" accept="image/*" onChange={handleHeroFile} disabled={heroUploading} style={{ display: "none" }} />
          </label>
          <input
            placeholder="یا لینک عکس را اینجا بچسبان"
            value={heroUrlDraft}
            onChange={(e) => { setHeroUrlDraft(e.target.value); setHeroSaved(false); }}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm flex-1"
            style={{ color: "#F3EDE4", minWidth: 200 }}
            dir="ltr"
          />
          {heroUrlDraft && (
            <img
              src={heroUrlDraft}
              alt="پیش‌نمایش"
              style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", border: "1px solid rgba(216,191,158,0.25)" }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
        </div>
        <button
          onClick={saveHeroImage}
          disabled={heroSaving || !heroUrlDraft}
          type="button"
          className="btn-gold rounded px-4 py-2 text-sm"
        >
          {heroSaving ? "در حال ذخیره..." : "ذخیره‌ی تصویر صفحه‌ی اصلی"}
        </button>
        {heroSaved && <span className="text-gold" style={{ fontSize: 12, marginRight: 10 }}>ذخیره شد ✓</span>}
        {heroError && <p style={{ fontSize: 12, color: "#E3A9A9", marginTop: 6 }}>{heroError}</p>}
      </div>

      <form onSubmit={submit} className="bg-panel border border-hair rounded-lg p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          placeholder="نام محصول"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
          style={{ color: "#F3EDE4" }}
        />
        <input
          placeholder="برند"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
          style={{ color: "#F3EDE4" }}
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "", type: "" })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
          style={{ color: "#F3EDE4" }}
        >
          {CATEGORY_ORDER.map((k) => (
            <option key={k} value={k}>{CATEGORY_LABEL[k]}</option>
          ))}
        </select>
        {CATEGORIES[form.category]?.subcategories && (
          <select
            value={form.subcategory}
            onChange={(e) => setForm({ ...form, subcategory: e.target.value, type: "" })}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#F3EDE4" }}
          >
            <option value="">زیرشاخه را انتخاب کن</option>
            {Object.keys(CATEGORIES[form.category].subcategories).map((k) => (
              <option key={k} value={k}>{subcategoryLabel(form.category, k)}</option>
            ))}
          </select>
        )}
        {subcategoryTypes(form.category, form.subcategory) && (
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#F3EDE4" }}
          >
            <option value="">نوع محصول را انتخاب کن</option>
            {Object.entries(subcategoryTypes(form.category, form.subcategory)).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        )}
        <input
          placeholder="قیمت (تومان)"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
          style={{ color: "#F3EDE4" }}
        />
        <textarea
          placeholder="توضیح کوتاه"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm sm:col-span-2"
          style={{ color: "#F3EDE4", minHeight: 60 }}
        />
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
              style={{ color: "#F3EDE4", minWidth: 200 }}
              dir="ltr"
            />
            {form.image && (
              <img
                src={form.image}
                alt="پیش‌نمایش"
                style={{ width: 44, height: 44, borderRadius: 6, objectFit: "cover", border: "1px solid rgba(216,191,158,0.25)" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
          </div>
        </div>
        <div className="sm:col-span-2 flex flex-col gap-1">
          <label className="text-muted" style={{ fontSize: 12 }}>
            طیف رنگی / شماره‌ها (اختیاری — برای محصولاتی مثل رژلب و سایه و رژگونه که مشتری باید رنگ انتخاب کند)
          </label>
          <textarea
            placeholder={"هر خط یک رنگ، به‌صورت: نام رنگ, کدهگز (اختیاری), لینک عکس آن رنگ (اختیاری)\nمثال:\nشماره ۱ - قرمز کلاسیک, #B0202E, https://example.com/red.jpg\nشماره ۲ - صورتی ملایم, #D98CA0, https://example.com/pink.jpg"}
            value={form.variantsText}
            onChange={(e) => setForm({ ...form, variantsText: e.target.value })}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#F3EDE4", minHeight: 110, fontFamily: "monospace", fontSize: 12 }}
            dir="ltr"
          />
          <p className="text-muted" style={{ fontSize: 11 }}>
            می‌توانی صدها خط رنگ را یک‌جا کپی/پیست کنی — هر خط یک شماره، نام رنگ، کدهگز و (در صورت تمایل) لینک عکس دقیق همان رنگ می‌شود. اگر لینک عکس بدهی، همان عکس به‌جای دایره‌ی رنگ نمایش داده می‌شود.
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
            <div className="flex items-center justify-center rounded overflow-hidden" style={{ width: 40, height: 40, background: "rgba(255,255,255,0.05)", flexShrink: 0 }}>
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
                {p.subcategory && ` (${subcategoryLabel(p.category, p.subcategory)}${p.type ? " - " + typeLabel(p.category, p.subcategory, p.type) : ""})`} · {fmtPrice(p.price)}
                {p.variants && p.variants.length > 0 && (
                  <span className="text-gold"> · {p.variants.length} طیف رنگ</span>
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
