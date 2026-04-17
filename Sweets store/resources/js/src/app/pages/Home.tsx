import { useState, useEffect } from "react";
import { Star, Package, Sparkles, Tag, ShoppingCart, Heart, ChevronDown, X, SlidersHorizontal, ArrowRight } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { useApp, useEPTheme } from "../context/AppContext";
import { productService } from "../../api/products";
import { packageService } from "../../api/packages";
import { Product, Package as PackageType } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, Link, useNavigate } from "react-router";

type SortOption = "top-rated" | "price-asc" | "price-desc" | "newest" | "most-reviewed";

export function Home() {
  const { lang, addToCart, toggleWishlist, isInWishlist } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("top-rated");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceMax, setPriceMax] = useState(1200);
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [categories, setCategories] = useState<any[]>([{ id: "all", name: { ar: "الكل", en: "All" } }]);
  const [brands, setBrands] = useState<any[]>([]); // Changed to any[] to hold brand objects
  const [stats, setStats] = useState({ products_count: 0, brands_count: 0, customers_count: 0 });
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const location = useLocation();

  const HERO_IMAGES = [
    "/AZ2BkdpLZSf9DoWpeemM5w-AZ2BkdpL-Y7Agk4vXdv-FQ.jpg",
    "/AZ2BkdpLZSf9DoWpeemM5w-AZ2BkdpL5hAp_ujoUdPKEg.jpg",
    "/AZ2BkdpLZSf9DoWpeemM5w-AZ2BkdpLdWqyuBSNqpE6Ag.jpg",
    "/AZ2BkdpLZSf9DoWpeemM5w-AZ2BkdpLyG3SbHcj2v0cvg.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");
  const [searchQuery, setSearchQuery] = useState(new URLSearchParams(location.search).get("search") || "");

  const sortOptions: { key: SortOption; ar: string; en: string }[] = [
    { key: "top-rated", ar: "الأعلى تقييماً", en: "Top Rated" },
    { key: "price-asc", ar: "السعر: من الأقل", en: "Price: Low to High" },
    { key: "price-desc", ar: "السعر: من الأعلى", en: "Price: High to Low" },
    { key: "newest", ar: "الأحدث", en: "Newest" },
    { key: "most-reviewed", ar: "الأكثر تقييماً", en: "Most Reviewed" },
  ];

  // Sync URL changes to local state
  useEffect(() => {
    setSearchQuery(new URLSearchParams(location.search).get("search") || "");
  }, [location.search]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const [cData, bData] = await Promise.all([
          productService.getCategories(),
          productService.getBrands()
        ]);
        if (cData) setCategories([{ id: "all", name: { ar: "الكل", en: "All" } }, ...cData]);
        if (bData) setBrands([{ id: "all", name: t("الكل", "All") }, ...bData.map((b: any) => ({ id: b.id, name: b.name }))]);

        const sData = await productService.getStats();
        if (sData) setStats(sData);
      } catch (e) { console.error(e); }
    };
    fetchCats();
  }, [lang]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (searchQuery.trim() !== "") {
          const res = await productService.searchStore(searchQuery);
          setProducts(res.products || []);
          setPackages(res.packages || []);
        } else {
          const [prodRes, packRes] = await Promise.all([
            productService.getProducts(),
            packageService.getPackages(),
          ]);
          setProducts(prodRes.data || []);
          setPackages(packRes || []);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setFilterOpen(false);
        setSortOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, location.hash]);

  const filteredAndSorted = products
    .filter((p) => {
      const catMatch = activeCategory === "all" || p.category_id === Number(activeCategory);
      const brandMatch = activeBrand === "all" || p.brand_id === Number(activeBrand);
      const priceMatch = p.price <= priceMax;
      return catMatch && brandMatch && priceMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "top-rated": return b.average_rating - a.average_rating;
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "newest": return b.id - a.id;
        // case "most-reviewed": return b.reviews - a.reviews; // Adjust if needed
        default: return 0;
      }
    });

  const formatNumber = (num: number) => {
    if (num >= 1000) return `+${(num / 1000).toFixed(1)}K`;
    return num > 0 ? `${num}` : "...";
  };

  const activeSortLabel = sortOptions.find((s) => s.key === sortBy);
  const activeFiltersCount = (activeCategory !== "all" ? 1 : 0) + (activeBrand !== "all" ? 1 : 0) + (priceMax < 1200 ? 1 : 0);

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[520px] flex items-center">
        {/* Full Screen Background Carousel */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence>
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0 }}
              className="absolute inset-0"
            >
              <img src={HERO_IMAGES[heroIndex]} className="w-full h-full object-cover" alt="Background" />
              {/* Blended Overlay for Readability & Smooth Transition */}
              <div 
                className="absolute inset-0" 
                style={{ 
                  background: `linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 70%, ${c.bg} 100%)` 
                }} 
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10 w-full">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, x: lang === "ar" ? 40 : -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <h1 className="text-white mb-6" style={{ fontSize: "clamp(30px, 6vw, 56px)", fontWeight: 900, lineHeight: 1.2 }}>
                {t("كل ما تحتاجه لصنع الحلويات والخبيز", "Everything You Need for Pastry & Baking")}
              </h1>
              <p className="mb-9" style={{ color: "rgba(255,255,255,0.9)", fontSize: "17px", lineHeight: 1.8 }}>
                {t(
                  "أفضل الأدوات والمعدات من أشهر الماركات العالمية بأسعار لا تُقاوم - التوصيل لكل الأردن",
                  "Best tools & equipment from top global brands at unbeatable prices - Delivering across Jordan"
                )}
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-full shadow-2xl flex items-center gap-2"
                  style={{ background: "#E5233B", color: "white", fontSize: "15px", fontWeight: 800 }}
                  onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {t("تسوق الآن", "Shop Now")}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-full shadow-2xl border-2 border-white text-white"
                  style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", fontSize: "15px", fontWeight: 800 }}
                  onClick={() => document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" })}
                >
                  {t("الباقات المجمعة", "Bundle Packages")}
                </motion.button>
              </div>

            </motion.div>
          </div>

          {/* New Pagination Dots as Overlay Control */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 pb-8">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{ 
                  background: heroIndex === i ? "#E5233B" : "rgba(255,255,255,0.3)",
                  width: heroIndex === i ? "40px" : "15px"
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="py-6 px-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat, i) => {
            return (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className="shrink-0 px-5 py-2.5 rounded-full transition-all flex items-center gap-2"
                style={{
                  background: activeCategory === cat.id ? "#E5233B" : c.surface,
                  color: activeCategory === cat.id ? "white" : c.text,
                  border: `2px solid ${activeCategory === cat.id ? "#E5233B" : c.border}`,
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: "13px",
                  fontWeight: 700,
                  boxShadow: activeCategory === cat.id ? "0 4px 12px rgba(229, 35, 59, 0.2)" : "none",
                }}
              >
                {cat.id === 'all' ? t("الكل", "All") : (lang === "ar" ? cat.name.ar : cat.name.en)}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="px-4 max-w-7xl mx-auto pb-16">
        {/* Top Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          <div className="flex-1">
            <span style={{ fontWeight: 800, color: c.text, fontSize: "16px" }}>
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:opacity-80"
              style={{
                borderColor: c.border,
                background: c.surface,
                fontFamily: "'Cairo', sans-serif",
                fontSize: "13px",
                color: c.text2,
              }}
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
                      {brands.map((b) => {
                        const isActive = activeBrand === String(b.id);
                        return (
                          <button
                            key={b.id}
                            onClick={() => setActiveBrand(String(b.id))}
                            className="px-3 py-1.5 rounded-full text-xs transition-all"
                            style={{
                              background: isActive ? "#E5233B" : c.surface2,
                              color: isActive ? "white" : "#E5233B",
                              border: `1.5px solid ${isActive ? "#E5233B" : c.border}`,
                              fontFamily: "'Cairo', sans-serif",
                              fontWeight: 600,
                            }}
                          >
                            {b.name}
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:opacity-80"
              style={{
                borderColor: c.border,
                background: c.surface,
                fontFamily: "'Cairo', sans-serif",
                fontSize: "13px",
                color: c.text2,
              }}
            >
              <span style={{ color: "#E5233B", fontWeight: 700 }}>
                {t(activeSortLabel?.ar || "الترتيب", activeSortLabel?.en || "Sort")}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortOpen ? "rotate-180" : ""}`} style={{ color: c.muted }} />
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
                    background: c.surface,
                    border: `1.5px solid ${c.border}`,
                    [lang === "ar" ? "left" : "right"]: 0,
                  }}
                >
                  <div className="p-2">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          fontSize: "13px",
                          fontWeight: sortBy === opt.key ? 700 : 500,
                          color: sortBy === opt.key ? "#E5233B" : c.text,
                          background: sortBy === opt.key ? c.surface3 : "transparent",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = c.surface2)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = sortBy === opt.key ? c.surface3 : "transparent")}
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
                {brands.find(b => String(b.id) === activeBrand)?.name || activeBrand}
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
      <section id="packages" className="py-14 px-4" style={{ background: c.surface3 }}>
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
            {packages.map((bundle, i) => {
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
                      <img src={bundle.image_url} alt={bundle?.name?.ar} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
                      {bundle.stock <= 0 ? (
                        <div className="absolute top-3 start-3">
                          <span className="px-3 py-1.5 rounded-full text-white" style={{ background: "#888", fontSize: "12px", fontWeight: 700 }}>
                            {t(`نفذت الباقة`, `Out of Stock`)}
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-3 start-3">
                          <span className="px-3 py-1.5 rounded-full text-white" style={{ background: "#E5233B", fontSize: "12px", fontWeight: 700 }}>
                            {t(`عرض الباقة`, `View Bundle`)}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Simplified toggle for bundle
                        }}
                        className="absolute top-3 end-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: inWish ? "#E5233B" : "white" }}
                      >
                        <Heart className="w-4 h-4" style={{ color: inWish ? "white" : "#E5233B", fill: inWish ? "white" : "none" }} />
                      </button>
                    </div>

                    <div className="p-5">
                      <h3 className="mb-2" style={{ fontWeight: 800, fontSize: "17px", color: c.text }}>
                        {lang === "ar" ? bundle?.name?.ar : bundle?.name?.en}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {bundle.description?.en && (
                          <span className="px-2.5 py-1 rounded-full" style={{ background: c.surface3, color: "#E5233B", fontSize: "11px", fontWeight: 600, border: `1px solid ${c.border}` }}>
                            {lang === "ar" ? bundle?.description?.ar : bundle?.description?.en}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-3.5 h-3.5" style={{ fill: s <= 4 ? "#FFB800" : "transparent", color: s <= 4 ? "#FFB800" : c.light }} />
                          ))}
                        </div>
                        <span style={{ fontSize: "12px", color: c.muted }}>(5)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span style={{ fontSize: "22px", fontWeight: 900, color: "#E5233B" }}>
                            {bundle.price} {t("د.أ", "JOD")}
                          </span>
                        </div>
                         <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToCart({ ...bundle, is_package: true } as any);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white transition-opacity"
                          style={{ background: bundle.stock > 0 ? "#E5233B" : "#888", fontSize: "12px", fontWeight: 700 }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {bundle.stock <= 0 ? t("نفذ", "Out") : t("أضف", "Add")}
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
      {/* <section className="py-12 px-4 max-w-7xl mx-auto">
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
      </section> */}

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