import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Star, Trash2, MessageSquare, AlertTriangle, Loader2 } from "lucide-react";
import { adminService } from "../../../api/admin";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useEPTheme } from "../../context/AppContext";

export function AdminReviews() {
  const { lang } = useApp();
  const c = useEPTheme();
  
  const isRTL = lang === "ar";
  const t = (ar: string, en: string) => (isRTL ? ar : en);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReviews();
      setReviews(data);
    } catch (err) {
      console.error("Fetch reviews failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDeleteConfirm(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20" style={{ color: c.text }}>
        <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: "#E5233B" }} />
        <p style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>{t("جاري تحميل التعليقات...", "Loading reviews...")}</p>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", color: c.text }}>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { labelAr: "إجمالي التعليقات", labelEn: "Total Reviews", value: reviews.length, color: "#E5233B", bg: c.surface2 },
          { labelAr: "متوسط التقييم", labelEn: "Average Rating", value: `${avgRating} ⭐`, color: "#FFB800", bg: c.surface2 },
          { labelAr: "تعليقات 5 نجوم", labelEn: "5-Star Reviews", value: reviews.filter((r) => r.rating === 5).length, color: "#10B981", bg: c.surface2 },
        ].map((s) => (
          <div key={s.labelAr} className="p-4 rounded-2xl shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
            <p style={{ fontWeight: 800, fontSize: "22px", color: s.color }}>{s.value}</p>
            <p style={{ fontSize: "12px", color: c.muted, marginTop: "2px" }}>{t(s.labelAr, s.labelEn)}</p>
          </div>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
              style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 border-2 border-white/20 shadow-sm"
                    style={{ background: `hsl(${(review.id * 137) % 360}, 65%, 55%)`, fontWeight: 800 }}
                  >
                    {(review.user || "G").charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1.5">
                      <span style={{ fontWeight: 800, fontSize: "16px", color: c.text }}>{review.user || "Guest"}</span>
                      <Link
                        to={review.product_id ? `/products/${review.product_id}#review-${review.id}` : `/packages/${review.package_id}#review-${review.id}`}
                        className="px-3 py-1 rounded-full text-[10px] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 hover:brightness-110 no-underline shadow-sm"
                        style={{ background: c.surface2, color: "#E5233B", fontWeight: 800, border: `1.5px solid ${c.border}` }}
                      >
                        <Star className="w-3 h-3 fill-current" />
                        {review.item_name || "Unknown Item"}
                      </Link>
                      <span style={{ color: c.muted, fontSize: "11px" }}>
                        {new Date(review.date).toLocaleDateString(isRTL ? "ar-JO" : "en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                        })}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-2.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="w-4 h-4"
                          style={{
                            fill: s <= review.rating ? "#FFB800" : "transparent",
                            color: s <= review.rating ? "#FFB800" : c.light,
                          }}
                        />
                      ))}
                      <span className="mr-1.5" style={{ fontSize: "12px", color: c.muted, fontWeight: 700 }}>({review.rating}/5)</span>
                    </div>

                    <p
                      className="p-4 rounded-xl shadow-inner-sm"
                      style={{ background: c.surface2, fontSize: "14px", color: c.text, lineHeight: 1.8 }}
                    >
                      {review.comment}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDeleteConfirm(review.id)}
                  className="p-3 rounded-xl transition-all hover:bg-red-50 group shrink-0"
                  style={{ border: `1px solid ${c.border}` }}
                >
                  <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {reviews.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-sm" style={{ background: c.surface2 }}>
              <MessageSquare className="w-10 h-10" style={{ color: "#E5233B" }} />
            </div>
            <p style={{ color: c.muted, fontSize: "17px", fontWeight: 700 }}>{t("لا توجد تعليقات حتى الآن", "No reviews yet")}</p>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setDeleteConfirm(null)}>
            <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md p-10 rounded-3xl text-center shadow-2xl"
                style={{ background: c.surface, border: `2px solid ${c.border}` }}
            >
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/20" style={{ background: c.dark ? "rgba(245, 158, 11, 0.15)" : "#FFFBEB" }}>
                <AlertTriangle className="w-12 h-12" style={{ color: "#F59E0B" }} />
                </div>
                <h3 style={{ fontWeight: 900, fontSize: "22px", marginBottom: "12px", color: c.text }}>{t("حذف التعليق", "Delete Comment")}</h3>
                <p style={{ color: c.muted, fontSize: "16px", marginBottom: "32px", lineHeight: 1.6 }}>
                {t("هل أنت متأكد من حذف هذا التعليق بصورة نهائية؟ لا يمكن التراجع عن هذا الإجراء.", "Are you sure you want to delete this comment permanently? This action cannot be undone.")}
                </p>
                <div className="flex gap-4">
                <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 py-4 rounded-2xl text-white shadow-xl shadow-red-500/20 transition-all active:scale-95 hover:brightness-110"
                    style={{ background: "#EF4444", fontWeight: 800, fontSize: "15px" }}
                >
                    {t("نعم، احذف", "Yes, Delete")}
                </button>
                <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-4 rounded-2xl border-2 transition-all shadow-sm active:scale-95"
                    style={{ borderColor: c.border, color: c.text, background: c.surface2, fontWeight: 700, fontSize: "15px" }}
                >
                    {t("إلغاء", "Cancel")}
                </button>
                </div>
            </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}
