import { useState } from "react";
import { Star, ShoppingCart, Heart, Tag } from "lucide-react";
import { Link } from "react-router";
import { useApp, useEPTheme } from "../context/AppContext";
import { Product } from "../../types";
import { motion } from "motion/react";

export function ProductCard({ product: p, index = 0 }: { product: Product; index?: number }) {
  const { lang, addToCart, toggleWishlist, isInWishlist } = useApp();
  const c = useEPTheme();
  const [addedAnim, setAddedAnim] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inWish = isInWishlist(p.id);
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");
  const discount = 0; // Backend products don't have originalPrice in the resource yet

  const handleAddToCart = () => {
    setError(null);
    addToCart(p).then((ok) => {
      if (ok) {
        setAddedAnim(true);
        setTimeout(() => setAddedAnim(false), 1000);
      } else {
        setError(lang === 'ar' ? "نفذ" : "Out");
      }
    });
  };

  return (
    <Link to={`/products/${p.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07, duration: 0.4 }}
        className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
        style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: "190px", background: c.surface3 }}>
          <img src={p.image_url} alt={p.current_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

          {/* Badges */}
          <div className="absolute top-2.5 start-2.5 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="px-2.5 py-1 rounded-full text-white" style={{ background: "#E5233B", fontSize: "11px", fontWeight: 700 }}>
                -{discount}%
              </span>
            )}
            {p.stock <= 0 && (
              <span className="px-2.5 py-1 rounded-full text-white" style={{ background: "#888", fontSize: "11px", fontWeight: 700 }}>
                {t("نفذ", "Out of Stock")}
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(p);
            }}
            className="absolute top-2.5 end-2.5 w-9 h-9 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all"
            style={{ background: inWish ? "#E5233B" : c.surface }}
          >
            <Heart className="w-4 h-4" style={{ color: inWish ? "white" : "#E5233B", fill: inWish ? "white" : "none" }} />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p style={{ fontSize: "11px", color: "#E5233B", fontWeight: 700, marginBottom: "3px" }}>{p.brand}</p>
          <h3 className="hover:text-red-500 transition-colors line-clamp-2 mb-2" style={{ fontWeight: 700, fontSize: "14px", color: c.text, lineHeight: 1.5 }}>
            {lang === "ar" ? p?.name?.ar : p?.name?.en}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5" style={{ fill: s <= Math.floor(p.average_rating) ? "#FFB800" : "transparent", color: s <= Math.floor(p.average_rating) ? "#FFB800" : c.light }} />
              ))}
            </div>
            <span style={{ fontSize: "12px", color: c.muted }}>(5)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontWeight: 900, fontSize: "18px", color: "#E5233B" }}>
              {p.price.toFixed(2)} {currency}
            </span>
            {discount > 0 && (
              <span style={{ fontSize: "12px", textDecoration: "line-through", color: c.light }}>
                {p.original_price?.toFixed(2)}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <motion.button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            animate={addedAnim ? { scale: [1, 1.06, 1] } : {}}
            className="w-full py-2.5 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
            style={{
              background: p.stock <= 0 ? c.light : addedAnim ? "#16a34a" : "#E5233B",
              fontFamily: "'Cairo', sans-serif",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            {p.stock <= 0 ? t("غير متوفر", "Out of Stock") : addedAnim ? t("أضيف ✓", "Added ✓") : t("أضف للسلة", "Add to Cart")}
          </motion.button>
          {error && (
             <p className="mt-2 text-center" style={{ color: "#EF4444", fontSize: "11px", fontWeight: 700 }}>
               ⚠ {t("غير متوفر بالكمية المطلوبة", "Stock Unavailable")}
             </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}