import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag, X, Plus, Minus, Trash2, LayoutDashboard,
  Store, Pencil, Check, Menu, Sparkles, User, LogOut
} from "lucide-react";

// آدرس بک‌اندی که راه‌اندازی کردی را اینجا جایگزین کن
// (بعد از دیپلوی سرور در پوشه‌ی backend، مثلاً: "https://jordan-gallery-shop-backend.onrender.com")
const API_BASE_URL = "https://jordan-gallery-shop-backend.onrender.com";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap');

  .maison-root {
    font-family: 'Vazirmatn', sans-serif;
    background: #1B1420;
    color: #F3EDE4;
  }
  .font-latin { font-family: 'Cormorant Garamond', serif; letter-spacing: 0.18em; }
  .font-display { font-family: 'Vazirmatn', sans-serif; font-weight: 800; }

  .bg-panel { background: #241A29; }
  .bg-panel-2 { background: #2C2032; }
  .border-hair { border-color: rgba(216, 191, 158, 0.16); }
  .text-gold { color: #C9A876; }
  .text-muted { color: #A99BB0; }
  .bg-gold { background: #B08D57; }
  .bg-gold-grad { background: linear-gradient(135deg, #D4AF7A, #9C7A45); }
  .btn-gold {
    background: linear-gradient(135deg, #D4AF7A, #A9824C);
    color: #1B1420;
  }
  .btn-gold:hover { filter: brightness(1.08); }
  .btn-ghost {
    border: 1px solid rgba(216, 191, 158, 0.35);
    color: #F3EDE4;
  }
  .btn-ghost:hover { border-color: #D4AF7A; color: #D4AF7A; }

  .card-perfume { background: linear-gradient(160deg, #3B2440, #241A29); }
  .card-beauty { background: linear-gradient(160deg, #402637, #241A29); }
  .card-electronics { background: linear-gradient(160deg, #24303F, #1B1420); }

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

  .cart-drawer { transition: transform 0.35s cubic-bezier(.2,.8,.2,1); }

  @media (prefers-reduced-motion: reduce) {
    .glint, .float-slow { animation: none; }
  }
`;

const CATEGORY_LABEL = {
  perfume: "عطر و ادکلن",
  beauty: "آرایشی و بهداشتی",
  electronics: "لوازم برقی شخصی",
};

const CATEGORY_CARD_CLASS = {
  perfume: "card-perfume",
  beauty: "card-beauty",
  electronics: "card-electronics",
};

function fmtPrice(n) {
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
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
  if (category === "beauty") {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="20" r="10" stroke={stroke} strokeWidth="1.6" />
        <path d="M24 30v12M18 42h12" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="24" cy="20" r="4" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
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
      const [label, hex] = line.split(",").map((s) => s && s.trim());
      return { id: `v${i}-${Date.now()}`, label: label || line, hex: hex || "" };
    });
}

function variantsToText(variants) {
  if (!variants || variants.length === 0) return "";
  return variants.map((v) => (v.hex ? `${v.label}, ${v.hex}` : v.label)).join("\n");
}

const SEED_PRODUCTS = [
  { id: "p1", name: "بلور شب", brand: "خانه میسان", category: "perfume", price: 2450000, description: "رایحه‌ای شرقی و گرم با نت‌های عود و وانیل، مناسب شب." },
  { id: "p2", name: "باغ سپید", brand: "خانه میسان", category: "perfume", price: 1980000, description: "ترکیبی تازه از یاس و مرکبات برای روزهای بهاری." },
  { id: "p3", name: "سرم درخشش طلایی", brand: "اطلس", category: "beauty", price: 890000, description: "سرم آبرسان با عصاره طلا، مناسب پوست‌های خشک و بی‌روح." },
  { id: "p4", name: "پالت آرایش صدف", brand: "اطلس", category: "beauty", price: 1250000, description: "پالت سایه و رژ با پیگمنت بالا و بافت مخملی." },
  {
    id: "p7",
    name: "رژ لب مخملی",
    brand: "اطلس",
    category: "beauty",
    price: 620000,
    description: "بافت مخملی و ماندگاری بالا، با طیف گسترده‌ی رنگ — رنگ و شماره را انتخاب کن.",
    variants: [
      { id: "v1", label: "شماره ۱ - قرمز کلاسیک", hex: "#B0202E" },
      { id: "v2", label: "شماره ۲ - صورتی ملایم", hex: "#D98CA0" },
      { id: "v3", label: "شماره ۳ - نارنجی مرجانی", hex: "#E06B4E" },
      { id: "v4", label: "شماره ۴ - بژ خاکی", hex: "#B98567" },
      { id: "v5", label: "شماره ۵ - قرمز آجری", hex: "#8C3A2B" },
      { id: "v6", label: "شماره ۶ - زرشکی تیره", hex: "#5C1A2E" },
    ],
  },
  { id: "p5", name: "سشوار حرفه‌ای یون‌دار", brand: "ولوره", category: "electronics", price: 3200000, description: "قدرت ۲۲۰۰ وات، فناوری یونیزه برای کاهش وز مو." },
  { id: "p6", name: "اپیلاتور بی‌سیم", brand: "ولوره", category: "electronics", price: 2100000, description: "طراحی مینیمال، شارژ سریع و کاربرد ملایم روی پوست." },
];

function ProductCard({ product, onAdd }) {
  const hasVariants = product.variants && product.variants.length > 0;
  const [variantId, setVariantId] = useState("");
  const selectedVariant = hasVariants ? product.variants.find((v) => v.id === variantId) : null;

  return (
    <div className={`${CATEGORY_CARD_CLASS[product.category]} rounded-lg border border-hair overflow-hidden flex flex-col`}>
      <div className="flex items-center justify-center py-8" style={{ background: "rgba(0,0,0,0.15)" }}>
        <CategoryIcon category={product.category} size={54} />
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <span className="text-gold" style={{ fontSize: 11 }}>{product.brand}</span>
        <h3 className="font-display" style={{ fontSize: 16 }}>{product.name}</h3>
        <p className="text-muted" style={{ fontSize: 12, minHeight: 32 }}>{product.description}</p>

        {hasVariants && (
          <div className="flex items-center gap-2 mt-1">
            {selectedVariant && selectedVariant.hex && (
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
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState({}); // id -> qty
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState(false);

  // احراز هویت و پرداخت (توکن فقط در حافظه‌ی نشست نگه داشته می‌شود، با رفرش صفحه پاک می‌شود)
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ email: "", password: "", fullName: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("catalog:products", true);
        if (res && res.value) {
          setProducts(JSON.parse(res.value));
        } else {
          await window.storage.set("catalog:products", JSON.stringify(SEED_PRODUCTS), true);
          setProducts(SEED_PRODUCTS);
        }
      } catch (e) {
        setProducts(SEED_PRODUCTS);
        setStorageError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(next) {
    setProducts(next);
    try {
      await window.storage.set("catalog:products", JSON.stringify(next), true);
    } catch (e) {
      setStorageError(true);
    }
  }

  function addToCart(product, variantId) {
    if (product.variants && product.variants.length > 0 && !variantId) {
      return; // باید رنگ/شماره انتخاب شود
    }
    const key = variantId ? `${product.id}::${variantId}` : product.id;
    setCart((c) => ({ ...c, [key]: (c[key] || 0) + 1 }));
    setCartOpen(true);
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

  const filteredProducts =
    activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div dir="rtl" lang="fa" className="maison-root min-h-screen">
      <style>{FONTS}</style>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-panel border-b border-hair" style={{ backdropFilter: "blur(6px)" }}>
        <div className="flex items-center justify-between px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button className="sm:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="منو">
              <Menu size={22} color="#F3EDE4" />
            </button>
            <div className="flex flex-col leading-none">
              <span className="font-latin text-gold" style={{ fontSize: 13 }}>MAISON</span>
              <span className="font-display" style={{ fontSize: 20 }}>میسان</span>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted">
            {["all", "perfume", "beauty", "electronics"].map((c) => (
              <button
                key={c}
                onClick={() => { setActiveCategory(c); setView("store"); }}
                style={{ color: activeCategory === c && view === "store" ? "#D4AF7A" : undefined }}
                className="hover:text-gold"
              >
                {c === "all" ? "همه محصولات" : CATEGORY_LABEL[c]}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setView(view === "admin" ? "store" : "admin")}
              className="btn-ghost hidden sm:flex items-center gap-2 px-3 py-2 rounded text-xs"
            >
              <LayoutDashboard size={15} />
              {view === "admin" ? "بازگشت به فروشگاه" : "پنل مدیریت"}
            </button>
            <button onClick={() => setCartOpen(true)} className="relative" aria-label="سبد خرید">
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
            {["all", "perfume", "beauty", "electronics"].map((c) => (
              <button
                key={c}
                onClick={() => { setActiveCategory(c); setView("store"); setMenuOpen(false); }}
                className="text-right py-1"
              >
                {c === "all" ? "همه محصولات" : CATEGORY_LABEL[c]}
              </button>
            ))}
            <button onClick={() => { setView(view === "admin" ? "store" : "admin"); setMenuOpen(false); }} className="text-right py-1 text-gold">
              {view === "admin" ? "بازگشت به فروشگاه" : "پنل مدیریت"}
            </button>
            <button
              onClick={() => { user ? handleLogout() : setAuthOpen(true); setMenuOpen(false); }}
              className="text-right py-1"
            >
              {user ? `خروج (${user.email})` : "ورود / ثبت‌نام"}
            </button>
          </div>
        )}
      </header>

      {view === "store" ? (
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
                className="btn-gold rounded px-6 py-3 mt-6 text-sm font-medium"
              >
                مشاهده محصولات
              </button>
            </div>

            <div className="flex-1 order-1 sm:order-2 flex justify-center">
              <div className="float-slow" style={{ position: "relative", width: 150, height: 200 }}>
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
                <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 14 }}>
                  <div className="glint" />
                </div>
              </div>
            </div>
          </section>

          {/* Category strip */}
          <section className="px-4 sm:px-8 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {["perfume", "beauty", "electronics"].map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`${CATEGORY_CARD_CLASS[c]} rounded-lg p-5 flex items-center gap-4 border border-hair text-right`}
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
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} color="#D4AF7A" />
              <h2 className="font-display" style={{ fontSize: 20 }}>
                {activeCategory === "all" ? "محصولات منتخب" : CATEGORY_LABEL[activeCategory]}
              </h2>
            </div>

            {loading ? (
              <p className="text-muted">در حال بارگذاری محصولات...</p>
            ) : filteredProducts.length === 0 ? (
              <p className="text-muted">محصولی در این دسته ثبت نشده است.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <AdminPanel products={products} onSave={persist} storageError={storageError} />
      )}

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
                    <div className="flex items-center justify-center rounded" style={{ width: 44, height: 44, background: "rgba(255,255,255,0.05)" }}>
                      {item.variant && item.variant.hex ? (
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
        © میسان — فروشگاه آنلاین عطر، آرایشی-بهداشتی و لوازم برقی شخصی
      </footer>
    </div>
  );
}

function emptyForm() {
  return { id: null, name: "", brand: "", category: "perfume", price: "", description: "", variantsText: "" };
}

function AdminPanel({ products, onSave, storageError }) {
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function startEdit(p) {
    setEditingId(p.id);
    setForm({ ...p, price: String(p.price), variantsText: variantsToText(p.variants) });
  }
  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name || !form.price) return;
    setSaving(true);
    const priceNum = Number(form.price);
    const variants = parseVariantsText(form.variantsText);
    const { variantsText, ...rest } = form;
    const payload = { ...rest, price: priceNum, ...(variants.length > 0 ? { variants } : { variants: undefined }) };
    let next;
    if (editingId) {
      next = products.map((p) => (p.id === editingId ? { ...payload, id: editingId } : p));
    } else {
      const id = "p" + Date.now();
      next = [...products, { ...payload, id }];
    }
    await onSave(next);
    setSaving(false);
    cancelEdit();
  }

  async function remove(id) {
    await onSave(products.filter((p) => p.id !== id));
  }

  return (
    <section className="px-4 sm:px-8 max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-2 mb-1">
        <LayoutDashboard size={18} color="#D4AF7A" />
        <h2 className="font-display" style={{ fontSize: 20 }}>پنل مدیریت محصولات</h2>
      </div>
      <p className="text-muted mb-6" style={{ fontSize: 12 }}>
        داده‌های این پنل به‌صورت مشترک ذخیره می‌شوند و برای همه‌ی بازدیدکنندگان این صفحه قابل مشاهده‌اند.
      </p>
      {storageError && (
        <p className="mb-4 rounded p-3" style={{ fontSize: 12, background: "rgba(180,80,80,0.15)", color: "#E3A9A9" }}>
          اتصال به حافظه‌ی ذخیره‌سازی برقرار نشد؛ تغییرات فقط در همین نشست نمایش داده می‌شوند.
        </p>
      )}

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
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
          style={{ color: "#F3EDE4" }}
        >
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
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
            طیف رنگی / شماره‌ها (اختیاری — برای محصولاتی مثل رژلب که مشتری باید رنگ انتخاب کند)
          </label>
          <textarea
            placeholder={"هر خط یک رنگ، به‌صورت: نام رنگ, کدهگز (اختیاری)\nمثال:\nشماره ۱ - قرمز کلاسیک, #B0202E\nشماره ۲ - صورتی ملایم, #D98CA0"}
            value={form.variantsText}
            onChange={(e) => setForm({ ...form, variantsText: e.target.value })}
            className="bg-panel-2 border border-hair rounded px-3 py-2 text-sm"
            style={{ color: "#F3EDE4", minHeight: 110, fontFamily: "monospace", fontSize: 12 }}
          />
          <p className="text-muted" style={{ fontSize: 11 }}>
            می‌توانی صدها خط رنگ را یک‌جا کپی/پیست کنی — هر خط یک شماره و نام رنگ می‌شود. کدهگز اختیاری است ولی برای نمایش دایره‌ی رنگ لازم است.
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
            <CategoryIcon category={p.category} size={26} />
            <div className="flex-1">
              <p style={{ fontSize: 14 }}>{p.name} <span className="text-muted" style={{ fontSize: 11 }}>— {p.brand}</span></p>
              <p className="text-muted" style={{ fontSize: 11 }}>
                {CATEGORY_LABEL[p.category]} · {fmtPrice(p.price)}
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
