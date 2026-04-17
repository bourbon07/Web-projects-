import { useState, useEffect } from "react";
import { Star, Package, Sparkles, Tag, ShoppingCart, Heart, ChevronDown, X, SlidersHorizontal, ArrowRight } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { useApp, useEPTheme } from "../context/AppContext";
import { PRODUCTS, CATEGORIES, BRANDS, BUNDLES } from "../data/mockData";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, Link } from "react-router";

type SortOption = "top-rated" | "price-asc" | "price-desc" | "newest" | "most-reviewed";

export function Home() {
  const { lang, addToCart, toggleWishlist, isInWishlist } = useApp();
  const c = useEPTheme();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("top-rated");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceMax, setPriceMax] = useState(1200);
  const location = useLocation();

  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");

  // Get search query from URL
  const searchQuery = new URLSearchParams(location.search).get("search") || "";

  const sortOptions: { key: SortOption; ar: string; en: string }[] = [
    { key: "top-rated", ar: "الأعلى تقييماً", en: "Top Rated" },
    { key: "price-asc", ar: "السعر: من الأقل", en: "Price: Low to High" },
    { key: "price-desc", ar: "السعر: من الأعلى", en: "Price: High to Low" },
    { key: "newest", ar: "الأحدث", en: "Newest" },
    { key: "most-reviewed", ar: "الأكثر تقييماً", en: "Most Reviewed" },
  ];

  const filteredAndSorted = PRODUCTS
    .filter((p) => {
      const catMatch = activeCategory === "all" || p.category === activeCategory;
      const brandMatch = activeBrand === "all" || p.brand === activeBrand;
      const priceMatch = p.price <= priceMax;
      const searchMatch = !searchQuery ||
        p.nameAr.includes(searchQuery) ||
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return catMatch && brandMatch && priceMatch && searchMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "top-rated": return b.rating - a.rating;
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "newest": return b.id - a.id;
        case "most-reviewed": return b.reviews - a.reviews;
        default: return 0;
      }
    });

  const activeSortLabel = sortOptions.find((s) => s.key === sortBy);
  const activeFiltersCount = (activeCategory !== "all" ? 1 : 0) + (activeBrand !== "all" ? 1 : 0) + (priceMax < 1200 ? 1 : 0);

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #E5233B 0%, #FF6B8A 50%, #FFDDE4 100%)", minHeight: "460px" }}
      >
        <div className="absolute inset-0" style={{ background: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.06\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"20\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />

        <div className="max-w-7xl mx-auto px-4 py-14 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, x: lang === "ar" ? 40 : -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5" style={{ background: "rgba(255,255,255,0.2)" }}>
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-white" style={{ fontSize: "13px", fontWeight: 600 }}>
                  {t("عروض حصرية لفترة محدودة 🎉", "Exclusive Limited Time Offers 🎉")}
                </span>
              </div>
              <h1 className="text-white mb-4" style={{ fontSize: "clamp(26px, 5vw, 46px)", fontWeight: 900, lineHeight: 1.3 }}>
                {t("كل ما تحتاجه لصنع الحلويات والخبيز", "Everything You Need for Pastry & Baking")}
              </h1>
              <p className="mb-7" style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", lineHeight: 1.8 }}>
                {t(
                  "أفضل الأدوات والمعدات من أشهر الماركات العالمية بأسعار لا تُقاوم - التوصيل لكل الأردن",
                  "Best tools & equipment from top global brands at unbeatable prices - Delivering across Jordan"
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-7 py-3 rounded-full text-white shadow-lg flex items-center gap-2"
                  style={{ background: "#1a1a1a", fontSize: "14px", fontWeight: 700 }}
                  onClick={() => document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <ShoppingCart className="w-4 h-4" />
                  {t("تسوق الآن", "Shop Now")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-7 py-3 rounded-full shadow-lg"
                  style={{ background: "white", color: "#E5233B", fontSize: "14px", fontWeight: 700 }}
                  onClick={() => document.getElementById("bundles-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {t("الباقات المجمعة", "Bundle Packages")}
                </motion.button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 mt-9">
                {[
                  { num: "500+", label: t("منتج", "Products") },
                  { num: "50+", label: t("ماركة", "Brands") },
                  { num: "10K+", label: t("عميل سعيد", "Happy Customers") },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-white" style={{ fontWeight: 800, fontSize: "22px" }}>{s.num}</p>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "12px" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Hero Images */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden md:grid grid-cols-2 gap-3"
            >
              {[
                { img: "https://images.unsplash.com/photo-1631827561806-18c59d7fde38?w=300&q=80", label: t("أدوات التزيين", "Decoration Tools") },
                { img: "https://images.unsplash.com/photo-1578845425669-b6562f83b11e?w=300&q=80", label: t("أجهزة المطبخ", "Kitchen Appliances") },
                { img: "https://images.unsplash.com/photo-1625207336348-1d1c31a6bd36?w=300&q=80", label: t("قوالب السيليكون", "Silicone Molds") },
                { img: "https://images.unsplash.com/photo-1712723246766-3eaea22e52ff?w=300&q=80", label: t("الحلويات", "Pastries") },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  className="rounded-2xl overflow-hidden shadow-xl relative"
                  style={{ height: "155px" }}
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55), transparent)" }} />
                  <span className="absolute bottom-2 left-2 right-2 text-center text-white" style={{ fontSize: "11px", fontWeight: 700 }}>
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-6 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              className="shrink-0 px-5 py-2 rounded-full transition-all"
              style={{
                background: activeCategory === cat.id ? "#E5233B" : "white",
                color: activeCategory === cat.id ? "white" : "#666",
                border: `2px solid ${activeCategory === cat.id ? "#E5233B" : "#FFDDE4"}`,
                fontFamily: "'Cairo', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {lang === "ar" ? cat.nameAr : cat.nameEn}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="px-4 max-w-7xl mx-auto pb-16">
        {/* Top Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          {/* Results count */}
          <div className="flex-1">
            <span style={{ fontWeight: 800, color: "#1a1a1a", fontSize: "16px" }}>
              {t("المنتجات", "Products")}
            </span>
            <span className="mx-2 px-2.5 py-0.5 rounded-full text-white" style={{ background: "#E5233B", fontSize: "12px", fontWeight: 700 }}>
              {filteredAndSorted.length}
            </span>
            {searchQuery && (
              <span style={{ color: "#888", fontSize: "13px" }}>
                {t(`نتائج البحث عن: "${searchQuery}"`, `Results for: "${searchQuery}"`)}
              </span>
            )}
          </div>

          {/* Brand Filter Dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:bg-pink-50"
              style={{ borderColor: "#FFDDE4", fontFamily: "'Cairo', sans-serif", fontSize: "13px", color: "#555" }}
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <SlidersHorizontal className="w-4 h-4" style={{ color: "#E5233B" }} />
              {t("الفلاتر", "Filters")}
              {activeFiltersCount > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-white flex items-center justify-center"
                  style={{ background: "#E5233B", fontSize: "10px", fontWeight: 700 }}
                >
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filterOpen ? "rotate-180" : ""}`} style={{ color: "#999" }} />
            </button>

            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute mt-2 w-72 rounded-2xl shadow-xl overflow-hidden z-30"
                  style={{
                    background: c.surface,
                    border: `1.5px solid ${c.border}`,
                    [lang === "ar" ? "left" : "right"]: 0,
                  }}
                >
                  <div className="p-4">
                    {/* Brand */}
                    <p className="mb-3" style={{ fontWeight: 700, color: "#E5233B", fontSize: "13px" }}>
                      {t("الماركة / المصنّع", "Brand / Manufacturer")}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {["all", ...BRANDS.filter((b) => b !== "الكل")].map((b) => {
                        const label = b === "all" ? t("الكل", "All") : b;
                        const isActive = activeBrand === b;
                        return (
                          <button
                            key={b}
                            onClick={() => setActiveBrand(b)}
                            className="px-3 py-1.5 rounded-full text-xs transition-all"
                            style={{
                              background: isActive ? "#E5233B" : c.surface2,
                              color: isActive ? "white" : "#E5233B",
                              border: `1.5px solid ${isActive ? "#E5233B" : c.border}`,
                              fontFamily: "'Cairo', sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Price Range */}
                    <p className="mb-2" style={{ fontWeight: 700, color: "#E5233B", fontSize: "13px" }}>
                      {t("السعر الأقصى", "Max Price")}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span style={{ color: "#E5233B", fontWeight: 700, fontSize: "14px" }}>
                        {priceMax} {currency}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1200}
                      step={50}
                      value={priceMax}
                      onChange={(e) => setPriceMax(Number(e.target.value))}
                      className="w-full"
                      style={{ accentColor: "#E5233B" }}
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: c.muted }}>
                      <span>0</span>
                      <span>1200 {currency}</span>
                    </div>

                    {/* Clear Filters */}
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={() => { setActiveBrand("all"); setPriceMax(1200); setFilterOpen(false); }}
                        className="mt-3 w-full py-2 rounded-xl flex items-center justify-center gap-2"
                        style={{ background: c.surface2, color: "#E5233B", fontFamily: "'Cairo', sans-serif", fontSize: "13px", fontWeight: 700 }}
                      >
                        <X className="w-3.5 h-3.5" />
                        {t("مسح الفلاتر", "Clear Filters")}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:bg-pink-50"
              style={{ borderColor: "#FFDDE4", fontFamily: "'Cairo', sans-serif", fontSize: "13px", color: "#555" }}
            >
              <span style={{ color: "#E5233B", fontWeight: 700 }}>
                {t(activeSortLabel?.ar || "الترتيب", activeSortLabel?.en || "Sort")}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} style={{ color: "#999" }} />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute mt-2 w-52 rounded-2xl shadow-xl overflow-hidden z-30"
                  style={{
                    background: "white",
                    border: "1.5px solid #FFDDE4",
                    [lang === "ar" ? "left" : "right"]: 0,
                  }}
                >
                  <div className="p-2">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-pink-50"
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          fontSize: "13px",
                          fontWeight: sortBy === opt.key ? 700 : 500,
                          color: sortBy === opt.key ? "#E5233B" : "#555",
                          background: sortBy === opt.key ? "#FFF0F3" : "transparent",
                        }}
                      >
                        {sortBy === opt.key && (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#E5233B" }} />
                        )}
                        {lang === "ar" ? opt.ar : opt.en}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Active Filter Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeBrand !== "all" && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                style={{ background: "#E5233B", color: "white", fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}
              >
                {activeBrand}
                <button onClick={() => setActiveBrand("all")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {priceMax < 1200 && (
              <span
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                style={{ background: "#E5233B", color: "white", fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}
              >
                {t(`حتى ${priceMax} ${currency}`, `Up to ${priceMax} ${currency}`)}
                <button onClick={() => setPriceMax(1200)}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid */}
        {filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAndSorted.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: c.surface3 }}>
              <Package className="w-8 h-8" style={{ color: "#E5233B" }} />
            </div>
            <p style={{ color: c.muted, fontFamily: "'Cairo', sans-serif", fontSize: "16px" }}>
              {t("لا توجد منتجات مطابقة", "No matching products found")}
            </p>
            <button
              onClick={() => { setActiveCategory("all"); setActiveBrand("all"); setPriceMax(1200); }}
              className="mt-4 px-6 py-2.5 rounded-xl text-white"
              style={{ background: "#E5233B", fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
            >
              {t("عرض جميع المنتجات", "Show All Products")}
            </button>
          </div>
        )}
      </section>

      {/* Bundle Packages */}
      <section id="bundles-section" className="py-14 px-4" style={{ background: c.surface3 }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-3" style={{ background: c.pinkLight }}>
              <Package className="w-4 h-4" style={{ color: "#E5233B" }} />
              <span style={{ color: "#E5233B", fontWeight: 700, fontSize: "13px" }}>{t("وفّر أكثر", "Save More")}</span>
            </div>
            <h2 style={{ fontWeight: 900, color: c.text, fontSize: "26px" }}>
              {t("الباقات المجمعة", "Bundle Packages")}
            </h2>
            <p style={{ color: c.muted, marginTop: "8px", fontSize: "14px" }}>
              {t("باقات مصممة بعناية لتوفير أفضل تجربة خبيز", "Carefully curated bundles for the best baking experience")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BUNDLES.map((bundle, i) => {
              const inWish = isInWishlist(bundle.id);
              return (
                <Link key={bundle.id} to={`/packages/${bundle.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="rounded-2xl overflow-hidden shadow-lg group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                    style={{ background: c.surface, border: `2px solid ${c.border}` }}
                  >
                    <div className="relative overflow-hidden" style={{ height: "220px" }}>
                      <img src={bundle.image} alt={bundle.nameAr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                      <div className="absolute top-3 start-3">
                        <span className="px-3 py-1.5 rounded-full text-white" style={{ background: "#E5233B", fontSize: "12px", fontWeight: 700 }}>
                          {t(`وفر ${Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}%`, `Save ${Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100)}%`)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist({ ...bundle, nameEn: bundle.nameEn, categoryAr: "باقات مجمعة", category: "bundles", inStock: true, description: bundle.nameEn, descriptionAr: bundle.nameAr });
                        }}
                        className="absolute top-3 end-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: inWish ? "#E5233B" : "white" }}
                      >
                        <Heart className="w-4 h-4" style={{ color: inWish ? "white" : "#E5233B", fill: inWish ? "white" : "none" }} />
                      </button>
                    </div>

                    <div className="p-5">
                      <h3 className="mb-2" style={{ fontWeight: 800, fontSize: "17px", color: c.text }}>
                        {lang === "ar" ? bundle.nameAr : bundle.nameEn}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {(lang === "ar" ? bundle.items : bundle.itemsEn).map((item) => (
                          <span key={item} className="px-2.5 py-1 rounded-full" style={{ background: c.surface3, color: "#E5233B", fontSize: "11px", fontWeight: 600, border: `1px solid ${c.border}` }}>
                            {item}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3.5 h-3.5" style={{ fill: s <= Math.floor(bundle.rating) ? "#FFB800" : "transparent", color: s <= 4 ? "#FFB800" : c.light }} />
                          ))}
                        </div>
                        <span style={{ fontSize: "12px", color: c.muted }}>({bundle.reviews})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span style={{ fontSize: "22px", fontWeight: 900, color: "#E5233B" }}>
                            {bundle.price} {t("د.أ", "JOD")}
                          </span>
                          <span className="mx-2" style={{ fontSize: "14px", textDecoration: "line-through", color: c.light }}>
                            {bundle.originalPrice}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart({ id: bundle.id, nameAr: bundle.nameAr, nameEn: bundle.nameEn, brand: "Enjoy Plus", price: bundle.price, originalPrice: bundle.originalPrice, rating: bundle.rating, reviews: bundle.reviews, image: bundle.image, category: "bundles", categoryAr: "باقات مجمعة", inStock: true });
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white"
                          style={{ background: "#E5233B", fontSize: "12px", fontWeight: 700 }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {t("أضف", "Add")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-12 px-4 max-w-7xl mx-auto">
        <h2 className="text-center mb-8" style={{ fontWeight: 800, color: c.text, fontSize: "22px" }}>
          {t("أشهر الماركات", "Top Brands")}
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {["Wilton", "KitchenAid", "Nordic Ware", "Ateco", "Cuisinart"].map((brand) => (
            <motion.button
              key={brand}
              whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(229,35,59,0.15)" }}
              onClick={() => {
                setActiveBrand(brand);
                document.getElementById("products-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-7 py-4 rounded-2xl text-center transition-all"
              style={{ background: c.surface, border: `2px solid ${c.border}`, minWidth: "125px" }}
            >
              <p style={{ fontWeight: 800, color: "#E5233B", fontSize: "15px" }}>{brand}</p>
              <p style={{ color: c.muted, fontSize: "11px", marginTop: "2px" }}>{t("عرض المنتجات", "View Products")}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-10 px-4" style={{ background: c.surface3 }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: "🚚", title: t("شحن سريع", "Fast Delivery"), desc: t("توصيل خلال 24-48 ساعة لكل الأردن", "Delivery within 24-48h across Jordan") },
            { icon: "🔄", title: t("إرجاع مجاني", "Free Returns"), desc: t("إرجاع مجاني خلال 30 يوم", "Free returns within 30 days") },
            { icon: "🔒", title: t("دفع آمن", "Secure Payment"), desc: t("حماية كاملة لبياناتك", "Full data protection") },
            { icon: "⭐", title: t("ضمان الجودة", "Quality Guarantee"), desc: t("منتجات أصلية معتمدة", "Original certified products") },
          ].map((f) => (
            <div key={f.title} className="text-center p-5 rounded-2xl" style={{ background: c.surface }}>
              <span style={{ fontSize: "30px" }}>{f.icon}</span>
              <p className="mt-2" style={{ fontWeight: 700, color: c.text, fontSize: "13px" }}>{f.title}</p>
              <p style={{ color: c.muted, fontSize: "11px", marginTop: "4px" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}