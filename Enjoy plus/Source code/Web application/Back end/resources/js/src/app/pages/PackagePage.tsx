import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router";
import {
  Star, ShoppingCart, Heart, ArrowLeft, Package as PackageIcon, Trash2, MessageCircle,
  Shield, CheckCircle, Tag, ChefHat
} from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import axiosConfig from "../../api/axiosConfig";
import { ProductCard } from "../components/ProductCard";
import { Package } from "../../types";

export function PackagePage() {
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();
  const { lang, addToCart, toggleWishlist, isInWishlist, productReviews, addProductReview, addPackageReview, deleteProductReview, currentUser, isLoggedIn } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");

  const [bundle, setBundle] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedAnim, setAddedAnim] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const { data } = await axiosConfig.get(`/packages/${id}`);
        setBundle(data.data || data);
      } catch (error) {
        console.error("Failed to fetch package:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [id]);

  useEffect(() => {
    if (!loading && bundle && location.hash) {
      setTimeout(() => {
        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.style.background = "#fff0f0";
          element.style.borderColor = "#E5233B";
          element.style.transform = "scale(1.02)";
          setTimeout(() => {
            if (element) {
              element.style.background = c.surface2;
              element.style.borderColor = c.border;
              element.style.transform = "scale(1)";
            }
          }, 3000);
        }
      }, 800);
    }
  }, [loading, bundle, location.hash]);

  const reviews = bundle?.reviews || [];

  // Get included products
  const includedProducts = bundle?.products || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.bg }}>
        <div className="w-12 h-12 border-4 border-t-[#E5233B] border-[#E5233B22] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: c.surface3 }}>
            <PackageIcon className="w-8 h-8" style={{ color: "#E5233B" }} />
          </div>
          <p style={{ color: c.muted, fontSize: "16px" }}>{t("الباقة غير موجودة", "Bundle not found")}</p>
          <button onClick={() => navigate("/")} className="mt-4 px-6 py-2.5 rounded-xl text-white" style={{ background: "#E5233B" }}>
            {t("العودة للرئيسية", "Back to Home")}
          </button>
        </div>
      </div>
    );
  }

  const inWish = isInWishlist(bundle.id);
  const discount = bundle.original_price ? Math.round(((bundle.original_price - bundle.price) / bundle.original_price) * 100) : 0;
  const isAdmin = currentUser?.role === "Admin";
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : bundle.average_rating.toFixed(1);

  const handleAddToCart = () => {
    setError(null);
    addToCart({
      ...bundle,
      brand: "Enjoy Plus",
      category: "bundles",
      is_package: true,
    } as any).then((ok) => {
      if (ok) {
        setAddedAnim(true);
        setTimeout(() => setAddedAnim(false), 1200);
      } else {
        setError(lang === 'ar' ? `هذه الباقة غير متوفرة حالياً بالكمية المطلوبة` : `This bundle is currently unavailable in the requested quantity`);
      }
    });
  };

  const handleWishlist = () => {
    toggleWishlist({
      id: bundle.id,
      name: bundle.name,
      description: bundle.description,
      brand: "Enjoy Plus",
      price: bundle.price,
      original_price: bundle.original_price,
      currency: "JOD",
      stock: bundle.stock,
      image_url: bundle.image_url,
      category: "bundles",
      average_rating: bundle.average_rating,
    } as any);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      const newReview = await addPackageReview(bundle.id, reviewRating, reviewText);
      setBundle({
        ...bundle,
        reviews: [newReview, ...(bundle.reviews || [])]
      });
      setReviewText("");
      setReviewRating(5);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  return (
    <div
      className="min-h-screen"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/" className="flex items-center gap-1.5 hover:opacity-70 transition">
            <ArrowLeft className="w-4 h-4" style={{ color: "#E5233B" }} />
            <span style={{ color: "#E5233B", fontWeight: 600, fontSize: "13px" }}>{t("الرئيسية", "Home")}</span>
          </Link>
          <span style={{ color: c.light }}>›</span>
          <span style={{ color: c.muted, fontSize: "13px" }}>{t("الباقات المجمعة", "Bundle Packages")}</span>
          <span style={{ color: c.light }}>›</span>
          <span style={{ color: c.text2, fontSize: "13px", fontWeight: 600 }} className="line-clamp-1">
            {lang === "ar" ? bundle?.name?.ar : bundle?.name?.en}
          </span>
        </div>

        {/* Bundle Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: lang === "ar" ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ height: "420px", background: c.surface3 }}>
              <img src={bundle.image_url} alt={lang === "ar" ? bundle?.name?.ar : bundle?.name?.en} className="w-full h-full object-cover" />

              {/* Discount Badge */}
              {discount > 0 && (
                <span
                  className="absolute top-4 start-4 px-3 py-1.5 rounded-full text-white"
                  style={{ background: "#E5233B", fontSize: "13px", fontWeight: 700 }}
                >
                  -{discount}%
                </span>
              )}
              {bundle.stock <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
                  <span className="px-5 py-2.5 rounded-full text-white" style={{ background: "#E5233B", fontWeight: 700, fontSize: "16px" }}>
                    {t("نفذ المخزون", "Out of Stock")}
                  </span>
                </div>
              )}

              {/* Save badge */}
              <div className="absolute bottom-4 start-4 end-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
                  <Tag className="w-4 h-4 text-white" />
                  <span className="text-white" style={{ fontSize: "13px", fontWeight: 700 }}>
                    {bundle.original_price && t(`وفّر ${(bundle.original_price - bundle.price).toFixed(2)} ${currency}`, `Save ${(bundle.original_price - bundle.price).toFixed(2)} ${currency}`)}
                  </span>
                </div>
              </div>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className="absolute top-4 end-4 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                style={{ background: inWish ? "#E5233B" : c.surface }}
              >
                <Heart className="w-5 h-5" style={{ color: inWish ? "white" : "#E5233B", fill: inWish ? "white" : "none" }} />
              </button>
            </div>

            {/* Item tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {includedProducts.map((p, i) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: c.surface3, color: "#E5233B", fontSize: "12px", fontWeight: 600, border: `1px solid ${c.border}` }}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {lang === "ar" ? p?.name?.ar : p?.name?.en}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: lang === "ar" ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            {/* Badge */}
            <div className="flex items-center gap-2 mb-3">
              <div className="px-3 py-1 rounded-full" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                <span style={{ color: "#E5233B", fontWeight: 700, fontSize: "12px" }}>Enjoy Plus</span>
              </div>
              <div className="px-3 py-1 rounded-full" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                <span style={{ color: c.muted, fontSize: "12px" }}>{t("باقة مجمعة", "Bundle Package")}</span>
              </div>
            </div>

            {/* Name */}
            <h1 className="mb-4" style={{ fontWeight: 900, color: c.text, fontSize: "clamp(24px, 4vw, 36px)", lineHeight: 1.2 }}>
              {lang === "ar" ? bundle?.name?.ar : bundle?.name?.en}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5" style={{ fill: star <= Math.floor(bundle.average_rating) ? "#FFB800" : "transparent", color: star <= Math.floor(bundle.average_rating) ? "#FFB800" : c.light }} />
                ))}
              </div>
              <span style={{ fontWeight: 700, color: "#FFB800", fontSize: "16px" }}>{avgRating}</span>
              <span style={{ color: c.muted, fontSize: "13px" }}>({reviews.length} {t("تقييم", "reviews")})</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-4">
              <span style={{ fontSize: "34px", fontWeight: 900, color: "#E5233B", lineHeight: 1 }}>
                {bundle.price.toFixed(2)} {currency}
              </span>
              {bundle.original_price && bundle.original_price > bundle.price && (
                <div>
                  <span style={{ fontSize: "16px", textDecoration: "line-through", color: c.light }}>{bundle.original_price.toFixed(2)} {currency}</span>
                  <p style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                    {t(`توفير ${(bundle.original_price - bundle.price).toFixed(2)} ${currency}`, `Save ${(bundle.original_price - bundle.price).toFixed(2)} ${currency}`)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="mb-8" style={{ color: c.text2, fontSize: "16px", lineHeight: 1.8 }}>
              {lang === "ar" ? bundle?.description?.ar : bundle?.description?.en}
            </p>

            {/* Perks */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: "💰", text: t(`خصم ${discount}% على السعر الأصلي`, `${discount}% off original price`) },
                { icon: "🚚", text: t("توصيل سريع للأردن", "Fast Jordan Delivery") },
                { icon: "✅", text: t("منتجات أصلية ضمانة 100%", "100% Authentic Products") },
                { icon: "🔒", text: t("دفع آمن ومشفر", "Secure Encrypted Payment") },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: "16px" }}>{f.icon}</span>
                  <span style={{ fontSize: "11px", color: c.text2, fontWeight: 600 }}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            {error && (
               <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
                 <span style={{ fontSize: "13.5px", color: "#EF4444", fontWeight: 700 }}>⚠ {error}</span>
               </div>
            )}
            <div className="flex gap-3">
              <motion.button
                onClick={handleAddToCart}
                animate={addedAnim ? { scale: [1, 1.05, 1] } : {}}
                whileHover={{ scale: 1.02 }}
                className="flex-1 py-3.5 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: addedAnim ? "#16a34a" : bundle.stock > 0 ? "linear-gradient(135deg, #E5233B, #FF6B8A)" : "#ccc",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                {bundle.stock <= 0 ? t("نفذ المخزون", "Out of Stock") : addedAnim ? t("تمت الإضافة ✓", "Added ✓") : t("أضف الباقة للسلة", "Add Bundle to Cart")}
              </motion.button>

              <button
                onClick={handleWishlist}
                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all hover:scale-105"
                style={{ background: inWish ? "#E5233B" : c.surface, border: `2px solid ${c.border}` }}
              >
                <Heart className="w-5 h-5" style={{ color: inWish ? "white" : "#E5233B", fill: inWish ? "white" : "none" }} />
              </button>
            </div>

            {/* Package includes count */}
            <div className="flex items-center gap-2 mt-4 px-4 py-3 rounded-xl" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
              <PackageIcon className="w-4 h-4" style={{ color: "#E5233B" }} />
              <span style={{ fontSize: "13px", color: c.text2, fontWeight: 600 }}>
                {t(`الباقة تحتوي على ${includedProducts.length} منتجات`, `Bundle includes ${includedProducts.length} products`)}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Included Products */}
        {includedProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#E5233B" }}>
                <PackageIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 style={{ fontWeight: 800, color: c.text, fontSize: "20px" }}>
                  {t("المنتجات المضمّنة في الباقة", "Products Included in Bundle")}
                </h2>
                <p style={{ color: c.muted, fontSize: "13px" }}>
                  {t("يمكنك شراء هذه المنتجات بشكل منفرد أو بالباقة بسعر أقل", "Buy these products individually or save more with the bundle")}
                </p>
              </div>
            </div>

            {/* Savings comparison banner */}
            <div
              className="flex items-center justify-between p-4 rounded-2xl mb-6"
              style={{ background: "linear-gradient(135deg, #E5233B15, #FF6B8A15)", border: `1.5px solid ${c.border}` }}
            >
              <div>
                <p style={{ fontWeight: 700, color: c.text, fontSize: "14px" }}>
                  {t("سعر المنتجات منفردة:", "Individual products price:")}
                  <span className="mx-2" style={{ textDecoration: "line-through", color: c.muted }}>
                    {bundle.original_price?.toFixed(2)} {currency}
                  </span>
                </p>
                <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "13px" }}>
                  {bundle.original_price && t(`وفّر ${(bundle.original_price - bundle.price).toFixed(2)} ${currency} بشراء الباقة!`, `Save ${(bundle.original_price - bundle.price).toFixed(2)} ${currency} with the bundle!`)}
                </p>
              </div>
              <div className="text-center">
                <p style={{ fontWeight: 900, fontSize: "24px", color: "#E5233B" }}>{bundle.price} {currency}</p>
                <p style={{ fontSize: "11px", color: c.muted }}>{t("سعر الباقة", "Bundle price")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {includedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          {/* Header */}
          <div
            className="px-6 py-5 flex items-center justify-between"
            style={{ borderBottom: `1.5px solid ${c.border}`, background: c.surface2 }}
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" style={{ color: "#E5233B" }} />
              <h2 style={{ fontWeight: 800, color: c.text, fontSize: "18px" }}>
                {t("التقييمات والمراجعات", "Ratings & Reviews")}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full" style={{ background: "#E5233B", color: "white", fontSize: "12px", fontWeight: 700 }}>
                {reviews.length}
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span style={{ fontSize: "28px", fontWeight: 900, color: "#E5233B" }}>{avgRating}</span>
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4" style={{ fill: s <= Math.round(Number(avgRating)) ? "#FFB800" : "transparent", color: s <= Math.round(Number(avgRating)) ? "#FFB800" : c.light }} />
                  ))}
                </div>
                <p style={{ fontSize: "11px", color: c.muted }}>{reviews.length} {t("تقييم", "reviews")}</p>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="p-5 space-y-4">
            <AnimatePresence>
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  id={`review-${review.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: lang === "ar" ? 30 : -30 }}
                  className="p-4 rounded-2xl transition-all duration-1000"
                  style={{ background: c.surface2, border: `1px solid ${c.border}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)" }}>
                        <ChefHat className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{ fontWeight: 700, fontSize: "14px", color: c.text }}>{review.user}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3.5 h-3.5" style={{ fill: s <= review.rating ? "#FFB800" : "transparent", color: s <= review.rating ? "#FFB800" : c.light }} />
                            ))}
                          </div>
                          <span className="px-2 py-0.5 rounded-full" style={{ background: c.surface3, color: "#E5233B", fontSize: "10px", fontWeight: 700, border: `1px solid ${c.border}` }}>
                            {review.rating}/5
                          </span>
                        </div>
                        <p style={{ color: c.text2, fontSize: "13px", lineHeight: 1.7, marginTop: "6px" }}>{review.comment}</p>
                        <p style={{ color: c.light, fontSize: "11px", marginTop: "4px" }}>{review.date}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteProductReview(review.id)}
                        className="p-2 rounded-lg transition shrink-0"
                        style={{ background: c.surface3 }}
                        title={t("حذف المراجعة", "Delete Review")}
                      >
                        <Trash2 className="w-4 h-4" style={{ color: "#E5233B" }} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {reviews.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="w-10 h-10 mx-auto mb-2" style={{ color: c.border }} />
                <p style={{ color: c.light, fontSize: "13px" }}>{t("لا توجد مراجعات بعد. كن أول من يكتب!", "No reviews yet. Be the first to write one!")}</p>
              </div>
            )}
          </div>

          {/* Add Review */}
          <div className="px-5 pb-5">
            <div className="p-4 rounded-2xl" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
              <h3 className="mb-4 flex items-center gap-2" style={{ fontWeight: 700, color: c.text, fontSize: "15px" }}>
                <Shield className="w-4 h-4" style={{ color: "#E5233B" }} />
                {t("اكتب مراجعتك", "Write Your Review")}
              </h3>
              <form onSubmit={handleSubmitReview}>
                <div className="flex items-center gap-1 mb-4">
                  <span style={{ fontSize: "13px", color: c.text2, marginInlineEnd: "8px" }}>{t("تقييمك:", "Your Rating:")}</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className="w-6 h-6 transition-all"
                        style={{
                          fill: star <= (hoverRating || reviewRating) ? "#FFB800" : "transparent",
                          color: star <= (hoverRating || reviewRating) ? "#FFB800" : c.light,
                          transform: star <= (hoverRating || reviewRating) ? "scale(1.1)" : "scale(1)",
                        }}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder={t("شارك تجربتك مع هذه الباقة...", "Share your experience with this bundle...")}
                  rows={3}
                  className="w-full rounded-xl outline-none resize-none mb-3"
                  style={{ background: c.surface, border: `1.5px solid ${c.border}`, padding: "12px", fontFamily: "'Cairo', sans-serif", fontSize: "13px", color: c.text }}
                />
                <button
                  type="submit"
                  disabled={!reviewText.trim()}
                  className="px-6 py-2.5 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "#E5233B", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "13px" }}
                >
                  {t("نشر المراجعة", "Post Review")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
