import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { Star, ShoppingCart, Heart, ArrowLeft, Package, Trash2, MessageCircle, Shield, ChefHat } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PRODUCTS } from "../data/mockData";
import { motion, AnimatePresence } from "motion/react";

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { lang, addToCart, toggleWishlist, isInWishlist, productReviews, addProductReview, deleteProductReview, currentUser, isLoggedIn } = useApp();
  const navigate = useNavigate();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const product = PRODUCTS.find((p) => p.id === Number(id));
  const [addedAnim, setAddedAnim] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  const reviews = productReviews.filter((r) => r.productId === Number(id));

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FFF0F3" }}>
            <Package className="w-8 h-8" style={{ color: "#E5233B" }} />
          </div>
          <p style={{ color: "#888", fontSize: "16px" }}>{t("المنتج غير موجود", "Product not found")}</p>
          <button onClick={() => navigate("/")} className="mt-4 px-6 py-2.5 rounded-xl text-white" style={{ background: "#E5233B" }}>
            {t("العودة للرئيسية", "Back to Home")}
          </button>
        </div>
      </div>
    );
  }

  const inWish = isInWishlist(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const currency = t("د.أ", "JOD");
  const isAdmin = currentUser?.isAdmin;

  const handleAddToCart = () => {
    addToCart(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    addProductReview({
      productId: product.id,
      user: currentUser?.name || t("زائر", "Guest"),
      rating: reviewRating,
      comment: reviewText,
    });
    setReviewText("");
    setReviewRating(5);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating.toFixed(1);

  return (
    <div
      className="min-h-screen"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif", background: "#FAFAFA" }}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link to="/" className="flex items-center gap-1.5 hover:opacity-70 transition">
            <ArrowLeft className="w-4 h-4" style={{ color: "#E5233B" }} />
            <span style={{ color: "#E5233B", fontWeight: 600, fontSize: "13px" }}>{t("الرئيسية", "Home")}</span>
          </Link>
          <span style={{ color: "#CCC" }}>›</span>
          <span style={{ color: "#999", fontSize: "13px" }}>{lang === "ar" ? product.categoryAr : product.category}</span>
          <span style={{ color: "#CCC" }}>›</span>
          <span style={{ color: "#555", fontSize: "13px", fontWeight: 600 }} className="line-clamp-1">{lang === "ar" ? product.nameAr : product.nameEn}</span>
        </div>

        {/* Product Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: lang === "ar" ? 30 : -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ height: "420px", background: "#FFF0F3" }}>
              <img src={product.image} alt={lang === "ar" ? product.nameAr : product.nameEn} className="w-full h-full object-cover" />

              {/* Badges */}
              {discount > 0 && (
                <span
                  className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-white"
                  style={{ background: "#E5233B", fontSize: "13px", fontWeight: 700 }}
                >
                  -{discount}%
                </span>
              )}
              {!product.inStock && (
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
                style={{ background: inWish ? "#E5233B" : "white" }}
              >
                <Heart className="w-5 h-5" style={{ color: inWish ? "white" : "#E5233B", fill: inWish ? "white" : "none" }} />
              </button>
            </div>

            {/* Thumbnail row */}
            <div className="flex gap-3 mt-3">
              {[product.image, product.image, product.image].map((img, i) => (
                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2" style={{ borderColor: i === 0 ? "#E5233B" : "#FFDDE4" }}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: lang === "ar" ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            {/* Brand */}
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-1 rounded-full" style={{ background: "#FFF0F3", border: "1px solid #FFDDE4" }}>
                <span style={{ color: "#E5233B", fontWeight: 700, fontSize: "12px" }}>{product.brand}</span>
              </div>
              <div className="px-3 py-1 rounded-full" style={{ background: "#FFF0F3", border: "1px solid #FFDDE4" }}>
                <span style={{ color: "#888", fontSize: "12px" }}>{lang === "ar" ? product.categoryAr : product.category}</span>
              </div>
            </div>

            {/* Name */}
            <h1 className="mb-3" style={{ fontWeight: 900, color: "#1a1a1a", fontSize: "clamp(20px, 3vw, 28px)", lineHeight: 1.4 }}>
              {lang === "ar" ? product.nameAr : product.nameEn}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5" style={{ fill: star <= Math.floor(product.rating) ? "#FFB800" : "transparent", color: star <= Math.floor(product.rating) ? "#FFB800" : "#DDD" }} />
                ))}
              </div>
              <span style={{ fontWeight: 700, color: "#FFB800", fontSize: "16px" }}>{avgRating}</span>
              <span style={{ color: "#999", fontSize: "13px" }}>({reviews.length + product.reviews} {t("تقييم", "reviews")})</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-5">
              <span style={{ fontSize: "34px", fontWeight: 900, color: "#E5233B", lineHeight: 1 }}>
                {product.price.toFixed(2)} {currency}
              </span>
              {product.originalPrice > product.price && (
                <div>
                  <span style={{ fontSize: "16px", textDecoration: "line-through", color: "#BBB" }}>{product.originalPrice.toFixed(2)} {currency}</span>
                  <p style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                    {t(`توفير ${(product.originalPrice - product.price).toFixed(2)} ${currency}`, `Save ${(product.originalPrice - product.price).toFixed(2)} ${currency}`)}
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="mb-6" style={{ color: "#555", fontSize: "14px", lineHeight: 1.9, borderRight: lang === "ar" ? "3px solid #E5233B" : "none", borderLeft: lang === "en" ? "3px solid #E5233B" : "none", paddingRight: lang === "ar" ? "12px" : 0, paddingLeft: lang === "en" ? "12px" : 0 }}>
              {lang === "ar" ? product.descriptionAr : product.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: "🚚", text: t("شحن سريع للأردن", "Fast Jordan Delivery") },
                { icon: "🔄", text: t("إرجاع خلال 30 يوم", "30-Day Returns") },
                { icon: "✅", text: t("منتج أصلي مضمون", "Authentic Product") },
                { icon: "🔒", text: t("دفع آمن ومشفر", "Secure Payment") },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: "#FFF0F3", border: "1px solid #FFDDE4" }}>
                  <span style={{ fontSize: "16px" }}>{f.icon}</span>
                  <span style={{ fontSize: "11px", color: "#555", fontWeight: 600 }}>{f.text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                animate={addedAnim ? { scale: [1, 1.05, 1] } : {}}
                whileHover={{ scale: 1.02 }}
                className="flex-1 py-3.5 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
                style={{
                  background: addedAnim ? "#16a34a" : product.inStock ? "linear-gradient(135deg, #E5233B, #FF6B8A)" : "#ccc",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                <ShoppingCart className="w-5 h-5" />
                {addedAnim ? t("تمت الإضافة ✓", "Added ✓") : t("أضف للسلة", "Add to Cart")}
              </motion.button>

              <button
                onClick={() => toggleWishlist(product)}
                className="w-12 h-12 flex items-center justify-center rounded-xl transition-all hover:scale-105"
                style={{ background: inWish ? "#E5233B" : "white", border: "2px solid #FFDDE4" }}
              >
                <Heart className="w-5 h-5" style={{ color: inWish ? "white" : "#E5233B", fill: inWish ? "white" : "none" }} />
              </button>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2 mt-4">
              <div className={`w-2.5 h-2.5 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-400"}`} />
              <span style={{ fontSize: "13px", color: product.inStock ? "#16a34a" : "#E5233B", fontWeight: 600 }}>
                {product.inStock ? t("متوفر في المخزون", "In Stock") : t("نفذ المخزون", "Out of Stock")}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
          {/* Header */}
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1.5px solid #FFDDE4", background: "linear-gradient(135deg, #FFF0F3, #FFF8FA)" }}>
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5" style={{ color: "#E5233B" }} />
              <h2 style={{ fontWeight: 800, color: "#1a1a1a", fontSize: "18px" }}>
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
                    <Star key={s} className="w-4 h-4" style={{ fill: s <= Math.round(Number(avgRating)) ? "#FFB800" : "transparent", color: s <= Math.round(Number(avgRating)) ? "#FFB800" : "#DDD" }} />
                  ))}
                </div>
                <p style={{ fontSize: "11px", color: "#999" }}>{reviews.length} {t("مراجعة", "reviews")}</p>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="p-5 space-y-4">
            <AnimatePresence>
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: lang === "ar" ? 30 : -30 }}
                  className="p-4 rounded-2xl"
                  style={{ background: "#FFF8FA", border: "1px solid #FFDDE4" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)" }}>
                        <ChefHat className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a" }}>{review.user}</span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3.5 h-3.5" style={{ fill: s <= review.rating ? "#FFB800" : "transparent", color: s <= review.rating ? "#FFB800" : "#DDD" }} />
                            ))}
                          </div>
                          <span className="px-2 py-0.5 rounded-full" style={{ background: "#FFF0F3", color: "#E5233B", fontSize: "10px", fontWeight: 700, border: "1px solid #FFDDE4" }}>
                            {review.rating}/5
                          </span>
                        </div>
                        <p style={{ color: "#555", fontSize: "13px", lineHeight: 1.7, marginTop: "6px" }}>{review.comment}</p>
                        <p style={{ color: "#BBB", fontSize: "11px", marginTop: "4px" }}>{review.date}</p>
                      </div>
                    </div>

                    {/* Admin Delete Button */}
                    {isAdmin && (
                      <button
                        onClick={() => deleteProductReview(review.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition shrink-0"
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
                <MessageCircle className="w-10 h-10 mx-auto mb-2" style={{ color: "#FFDDE4" }} />
                <p style={{ color: "#BBB", fontSize: "13px" }}>{t("لا توجد مراجعات بعد. كن أول من يكتب!", "No reviews yet. Be the first to write one!")}</p>
              </div>
            )}
          </div>

          {/* Add Review Form */}
          <div className="px-5 pb-5">
            <div className="p-4 rounded-2xl" style={{ background: "#FFF0F3", border: "1px solid #FFDDE4" }}>
              <h3 className="mb-4 flex items-center gap-2" style={{ fontWeight: 700, color: "#1a1a1a", fontSize: "15px" }}>
                <Shield className="w-4 h-4" style={{ color: "#E5233B" }} />
                {t("اكتب مراجعتك", "Write Your Review")}
              </h3>

              <form onSubmit={handleSubmitReview}>
                {/* Star Rating Input */}
                <div className="flex items-center gap-1 mb-4">
                  <span style={{ fontSize: "13px", color: "#555", marginInlineEnd: "8px" }}>{t("تقييمك:", "Your Rating:")}</span>
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
                          color: star <= (hoverRating || reviewRating) ? "#FFB800" : "#DDD",
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
                  style={{ background: "white", border: "1.5px solid #FFDDE4", padding: "12px", fontFamily: "'Cairo', sans-serif", fontSize: "13px", color: "#333" }}
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