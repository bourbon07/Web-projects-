import { useState } from "react";
import { Star, Trash2, MessageSquare, AlertTriangle } from "lucide-react";
import { MOCK_REVIEWS } from "../../data/mockData";
import { motion, AnimatePresence } from "motion/react";

interface Review {
  id: number;
  user: string;
  product: string;
  rating: number;
  comment: string;
  date: string;
}

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setDeleteConfirm(null);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "إجمالي التعليقات", value: reviews.length, color: "#E5233B", bg: "#FFF0F3" },
          { label: "متوسط التقييم", value: `${avgRating} ⭐`, color: "#FFB800", bg: "#FFFBEB" },
          { label: "تعليقات 5 نجوم", value: reviews.filter((r) => r.rating === 5).length, color: "#10B981", bg: "#ECFDF5" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
            <p style={{ fontWeight: 800, fontSize: "22px", color: s.color }}>{s.value}</p>
            <p style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence>
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl"
              style={{ background: "white", border: "1.5px solid #FFDDE4" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                    style={{ background: "#E5233B", fontWeight: 700 }}
                  >
                    {review.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span style={{ fontWeight: 700, fontSize: "14px" }}>{review.user}</span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs"
                        style={{ background: "#FFF0F3", color: "#E5233B", fontWeight: 600 }}
                      >
                        {review.product}
                      </span>
                      <span style={{ color: "#BBB", fontSize: "11px" }}>{review.date}</span>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="w-4 h-4"
                          style={{
                            fill: s <= review.rating ? "#FFB800" : "transparent",
                            color: s <= review.rating ? "#FFB800" : "#DDD",
                          }}
                        />
                      ))}
                      <span className="mr-1" style={{ fontSize: "12px", color: "#888" }}>({review.rating}/5)</span>
                    </div>

                    <p
                      className="p-3 rounded-xl"
                      style={{ background: "#FFF8FA", fontSize: "14px", color: "#333", lineHeight: 1.7, borderRight: "3px solid #FFDDE4" }}
                    >
                      {review.comment}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setDeleteConfirm(review.id)}
                  className="p-2.5 rounded-xl transition hover:bg-red-50"
                  style={{ background: "#FEF2F2", border: "1.5px solid #FFDDE4" }}
                >
                  <Trash2 className="w-4 h-4" style={{ color: "#EF4444" }} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {reviews.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: "#FFF0F3" }}>
              <MessageSquare className="w-8 h-8" style={{ color: "#E5233B" }} />
            </div>
            <p style={{ color: "#888", fontSize: "16px" }}>لا توجد تعليقات</p>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-2xl text-center"
            style={{ background: "white" }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FFFBEB" }}>
              <AlertTriangle className="w-7 h-7" style={{ color: "#F59E0B" }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: "17px", marginBottom: "8px" }}>حذف التعليق</h3>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
              هل أنت متأكد من حذف هذا التعليق؟
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl text-white"
                style={{ background: "#EF4444", fontWeight: 700 }}
              >
                حذف التعليق
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border"
                style={{ borderColor: "#DDD", color: "#666", fontWeight: 600 }}
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
