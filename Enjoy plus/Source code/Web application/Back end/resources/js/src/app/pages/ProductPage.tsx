import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router";
import { Star, ShoppingCart, Heart, ArrowLeft, Package, Trash2, MessageCircle, Shield, ChefHat } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { Product } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import axiosConfig from "../../api/axiosConfig";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const { lang, addToCart, toggleWishlist, isInWishlist, productReviews, addProductReview, deleteProductReview, currentUser, isLoggedIn } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedAnim, setAddedAnim] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axiosConfig.get(`/products/${id}`);
        setProduct(data.data || data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!loading && product && location.hash) {
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
  }, [loading, product, location.hash]);

  const reviews = product?.reviews || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.bg }}>
        <div className="w-12 h-12 border-4 border-t-[#E5233B] border-[#E5233B22] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: c.surface3 }}>
            <Package className="w-8 h-8" style={{ color: "#E5233B" }} />
          </div>
          <p style={{ color: c.muted, fontSize: "16px" }}>{t("المنتج غير موجود", "Product not found")}</p>
          <button onClick={() => navigate("/")} className="mt-4 px-6 py-2.5 rounded-xl text-white" style={{ background: "#E5233B" }}>
            {t("العودة للرئيسية", "Back to Home")}
          </button>
        </div>
      </div>
    );
  }

  const inWish = isInWishlist(product.id);
  const discount = product.original_price ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;
  const currency = t("د.أ", "JOD");
  const isAdmin = currentUser?.role === "Admin";

  const handleAddToCart = () => {
    setError(null);
    addToCart(product, quantity).then((ok) => {
      if (ok) {
        setAddedAnim(true);
        setTimeout(() => setAddedAnim(false), 1200);
      } else {
        setError(lang === 'ar' ? `الكمية المطلوبة غير متوفرة في المخزون` : `The requested quantity is not available in stock`);
      }
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    try {
      const newReview = await addProductReview(product.id, reviewRating, reviewText);
      setProduct({
        ...product,
        reviews: [newReview, ...(product.reviews || [])]
      });
      setReviewText("");
      setReviewRating(5);
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product.average_rating.toFixed(1);

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
          <span style={{ color: c.muted, fontSize: "13px" }}>{product.category}</span>
          <span style={{ color: c.light }}>›</span>
          <span style={{ color: c.text2, fontSize: "13px", fontWeight: 600 }} className="line-clamp-1">{lang === "ar" ? product?.name?.ar : product?.name?.en}</span>
        </div>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: lang === "ar" ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ height: "420px", background: c.surface3 }}>
              <img src={product.image_url} alt={lang === "ar" ? product?.name?.ar : product?.name?.en} className="w-full h-full object-cover" />

              {/* Badges */}
              {discount > 0 && (
                <span
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-white"
                  style={{ background: "#E5233B", fontSize: "13px", fontWeight: 700 }}
                >
                  -{discount}%
                </span>
              )}
              {product.stock <= 0 && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}>
                  <span className="px-5 py-2.5 rounded-full text-white" style={{ background: "#E5233B", fontWeight: 700, fontSize: "16px" }}>
                    {t("نفذ المخزون", "Out of Stock")}
                  </span>
                </div>
              )}
              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
                style={{ background: inWish ? "#E5233B" : c.surface }}
              >
                <Heart className="w-5 h-5" style={{ color: inWish ? "white" : "#E5233B", fill: inWish ? "white" : "none" }} />
              </button>
            </div>

            {/* Thumbnail row */}
            <div className="flex gap-3 mt-3">
              {[product.image_url, product.image_url, product.image_url].map((img, i) => (
                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2" style={{ borderColor: i === 0 ? "#E5233B" : c.border }}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: lang === "ar" ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            {/* Brand */}
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 rounded-full" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                <span style={{ color: "#E5233B", fontWeight: 700, fontSize: "12px" }}>{product.brand}</span>
              </div>
              <div className="px-3 py-1 rounded-full" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                <span style={{ color: c.muted, fontSize: "12px" }}>{product.category}</span>
              </div>
            </div>

            {/* Name */}
            <h1 className="mb-3" style={{ fontWeight: 900, color: c.text, fontSize: "clamp(20px, 3vw, 28px)", lineHeight: 1.4 }}>
              {lang === "ar" ? product?.name?.ar : product?.name?.en}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5" style={{ fill: star <= Math.floor(product.average_rating) ? "#FFB800" : "transparent", color: star <= Math.floor(product.average_rating) ? "#FFB800" : c.light }} />
                ))}
              </div>
              <span style={{ fontWeight: 700, color: "#FFB800", fontSize: "16px" }}>{avgRating}</span>
              <span style={{ color: c.muted, fontSize: "13px" }}>({reviews.length} {t("تقييم", "reviews")})</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-5">
              <span style={{ fontSize: "34px", fontWeight: 900, color: "#E5233B", lineHeight: 1 }}>
                {product.price.toFixed(2)} {currency}
              </span>
              {product.original_price && product.original_price > product.price && (
                <div>
                  <span style={{ fontSize: "16px", textDecoration: "line-through", color: c.light }}>{product.original_price.toFixed(2)} {currency}</span>
                  <p style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                    {t(`توفير ${(product.original_price - product.price).toFixed(2)} ${currency}`, `Save ${(product.original_price - product.price).toFixed(2)} ${currency}`)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="mb-6" style={{ color: c.text2, fontSize: "15px", lineHeight: 1.8 }}>
              {lang === "ar" ? product?.description?.ar : product?.description?.en}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: "🚚", text: t("شحن سريع للأردن", "Fast Jordan Delivery") },
                { icon: "🔄", text: t("إرجاع خلال 30 يوم", "30-Day Returns") },
                { icon: "✅", text: t("منتج أصلي مضمون", "Authentic Product") },
                { icon: "🔒", text: t("دفع آمن ومشفر", "Secure Payment") },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: "16px" }}>{f.icon}</span>
                  <span style={{ fontSize: "11px", color: c.text2, fontWeight: 600 }}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
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
                  background: addedAnim ? "#16a34a" : product.stock > 0 ? "linear-gradient(135deg, #E5233B, #FF6B8A)" : "#ccc",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                {product.stock <= 0 ? t("غير متوفر", "Out of Stock") : addedAnim ? t("تمت الإضافة ✓", "Added ✓") : t("أضف للسلة", "Add to Cart")}
              </motion.button>

              <button
                onClick={() => toggleWishlist(product)}
                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all hover:scale-105"
                style={{ background: inWish ? "#E5233B" : c.surface, border: `2px solid ${c.border}` }}
              >
                <Heart className="w-5 h-5" style={{ color: inWish ? "white" : "#E5233B", fill: inWish ? "white" : "none" }} />
              </button>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-400"}`} />
              <span style={{ fontSize: "13px", color: product.stock > 0 ? "#16a34a" : "#E5233B", fontWeight: 600 }}>
                {product.stock > 0 ? t("متوفر في المخزون", "In Stock") : t("نفذ المخزون", "Out of Stock")}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: `1.5px solid ${c.border}`, background: c.surface2 }}>
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" style={{ color: "#E5233B" }} />
              <h2 style={{ fontWeight: 800, color: c.text, fontSize: "18px" }}>
                {t("التقييمات والمراجعات", "Ratings & Reviews")}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full" style={{ background: "#E5233B", color: "white", fontSize: "12px", fontWeight: 700 }}>
                {reviews.length}
              </span>
            </div>
            {/* Summary */}
            <div className="hidden md:flex items-center gap-2">
              <span style={{ fontSize: "28px", fontWeight: 900, color: "#E5233B" }}>{avgRating}</span>
              <div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4" style={{ fill: s <= Math.round(Number(avgRating)) ? "#FFB800" : "transparent", color: s <= Math.round(Number(avgRating)) ? "#FFB800" : c.light }} />
                  ))}
                </div>
                <p style={{ fontSize: "11px", color: c.muted }}>{reviews.length} {t("مراجعة", "reviews")}</p>
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
                  style={{ 
                    background: c.surface2, 
                    border: `1px solid ${c.border}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
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

                    {/* Admin Delete Button */}
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

          {/* Add Review Form */}
          <div className="px-5 pb-5">
            <div className="p-4 rounded-2xl" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
              <h3 className="mb-4 flex items-center gap-2" style={{ fontWeight: 700, color: c.text, fontSize: "15px" }}>
                <Shield className="w-4 h-4" style={{ color: "#E5233B" }} />
                {t("اكتب مراجعتك", "Write Your Review")}
              </h3>

              <form onSubmit={handleSubmitReview}>
                {/* Star Rating Input */}
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
                  placeholder={t(
                    isLoggedIn ? "شارك تجربتك مع هذا المنتج..." : "تسجيل الدخول مطلوب للكتابة، لكن يمكنك المشاركة كزائر...",
                    isLoggedIn ? "Share your experience with this product..." : "Login required to post, but you can share as a guest..."
                  )}
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