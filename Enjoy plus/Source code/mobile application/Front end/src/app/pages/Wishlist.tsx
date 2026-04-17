import { Link } from "react-router";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

export function Wishlist() {
  const { lang, wishlist, toggleWishlist, addToCart } = useApp();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");

  return (
    <div
      className="min-h-screen py-8 px-4 max-w-7xl mx-auto"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="p-2 rounded-full hover:bg-pink-50 transition">
          <ArrowLeft className="w-5 h-5" style={{ color: "#E5233B" }} />
        </Link>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: "#1a1a1a" }}>
          {t("المفضلة", "Wishlist")}
          {wishlist.length > 0 && (
            <span className="mx-2 px-2 py-0.5 rounded-full text-white text-sm" style={{ background: "#E5233B" }}>
              {wishlist.length}
            </span>
          )}
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6" style={{ background: "#FFF0F3" }}>
            <Heart className="w-12 h-12" style={{ color: "#E5233B" }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "22px", color: "#1a1a1a" }}>
            {t("قائمة مفضلتك فارغة!", "Your Wishlist is Empty!")}
          </h2>
          <p style={{ color: "#888", marginTop: "8px", fontSize: "15px" }}>
            {t("احفظ المنتجات التي تريدها لاحقاً", "Save products you want for later")}
          </p>
          <Link
            to="/"
            className="mt-6 px-8 py-3 rounded-xl text-white"
            style={{ background: "#E5233B", fontWeight: 700 }}
          >
            {t("تصفح المنتجات", "Browse Products")}
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {wishlist.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1.5px solid #FFDDE4" }}
              >
                <div className="relative" style={{ height: "180px", background: "#FFF0F3" }}>
                  <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                  <button
                    onClick={() => toggleWishlist(item)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                    style={{ background: "#E5233B" }}
                  >
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </button>
                </div>
                <div className="p-4">
                  <p style={{ fontSize: "11px", color: "#FF6B8A", fontWeight: 600 }}>{item.brand}</p>
                  <h3 className="mb-2" style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a" }}>
                    {lang === "ar" ? item.nameAr : item.nameEn}
                  </h3>
                  <p style={{ fontWeight: 800, fontSize: "18px", color: "#E5233B" }}>
                    {item.price} {currency}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 py-2 rounded-xl text-white flex items-center justify-center gap-1.5"
                      style={{ background: "#E5233B", fontSize: "12px", fontWeight: 700 }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {t("أضف للسلة", "Add to Cart")}
                    </button>
                    <button
                      onClick={() => toggleWishlist(item)}
                      className="p-2 rounded-xl hover:bg-red-50 transition"
                      style={{ border: "1.5px solid #FFDDE4" }}
                    >
                      <Trash2 className="w-4 h-4" style={{ color: "#E5233B" }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}