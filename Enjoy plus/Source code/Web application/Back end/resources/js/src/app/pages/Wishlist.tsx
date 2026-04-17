import { Link } from "react-router";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

export function Wishlist() {
  const { lang, wishlist, toggleWishlist, addToCart } = useApp();
  const c = useEPTheme();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");

  return (
    <div
      className="min-h-screen py-8 px-4 max-w-7xl mx-auto"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}
    >
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="p-2 rounded-full transition" style={{ background: c.surface2 }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#E5233B" }} />
        </Link>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: c.text }}>
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
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6" style={{ background: c.surface3 }}>
            <Heart className="w-12 h-12" style={{ color: "#E5233B" }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "22px", color: c.text }}>
            {t("قائمة مفضلتك فارغة!", "Your Wishlist is Empty!")}
          </h2>
          <p style={{ color: c.muted, marginTop: "8px", fontSize: "15px" }}>
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
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
              >
                <div className="relative" style={{ height: "180px", background: c.surface3 }}>
                   <Link to={item.is_package ? `/packages/${item.id}` : `/products/${item.id}`} className="block w-full h-full">
                     <img src={item?.image_url} alt={lang === "ar" ? item?.name?.ar : item?.name?.en} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                     {item.stock <= 0 && (
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: "rgba(0,0,0,0.4)" }}>
                         <span className="px-3 py-1 rounded-full text-white text-xs" style={{ background: "#E5233B", fontWeight: 700 }}>
                           {t("نفذ المخزون", "Out of Stock")}
                         </span>
                       </div>
                     )}
                   </Link>
                   <button
                    onClick={() => toggleWishlist(item)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md z-10"
                    style={{ background: "#E5233B" }}
                  >
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </button>
                </div>
                <div className="p-4">
                  <Link to={item.is_package ? `/packages/${item.id}` : `/products/${item.id}`} className="block group">
                    <p className="group-hover:text-red-400 transition-colors" style={{ fontSize: "11px", color: "#FF6B8A", fontWeight: 600 }}>{item?.brand}</p>
                    <h3 className="mb-2 group-hover:text-red-500 transition-colors" style={{ fontWeight: 700, fontSize: "14px", color: c.text }}>
                      {lang === "ar" ? item?.name?.ar : item?.name?.en}
                    </h3>
                  </Link>
                  <p style={{ fontWeight: 800, fontSize: "18px", color: "#E5233B" }}>
                    {item.price} {currency}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.stock <= 0}
                      className="flex-1 py-2 rounded-xl text-white flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: item.stock <= 0 ? "#888" : "#E5233B", fontSize: "12px", fontWeight: 700 }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {item.stock <= 0 ? t("غير متوفر", "Out of Stock") : t("أضف للسلة", "Add to Cart")}
                    </button>
                    <button
                      onClick={() => toggleWishlist(item)}
                      className="p-2 rounded-xl transition"
                      style={{ border: `1.5px solid ${c.border}`, background: c.surface2 }}
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