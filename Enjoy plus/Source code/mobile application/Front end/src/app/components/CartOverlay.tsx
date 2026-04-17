import { X, ShoppingCart, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useApp, useEPTheme } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

export function CartOverlay() {
  const { lang, cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, isLoggedIn, deliveryFee, serviceFee } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + (subtotal > 0 ? deliveryFee + serviceFee : 0);

  const handleCheckout = () => {
    setCartOpen(false);
    if (isLoggedIn) {
      navigate("/orders");
    } else {
      navigate("/checkout/guest");
    }
  };

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-40"
            style={{ background: c.overlayBg }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: lang === "ar" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: lang === "ar" ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="fixed top-0 z-50 h-full w-full max-w-sm flex flex-col shadow-2xl"
            style={{
              [lang === "ar" ? "left" : "right"]: 0,
              background: c.surface,
              borderInlineStart: lang === "ar" ? "none" : `2px solid ${c.border}`,
              borderInlineEnd: lang === "ar" ? `2px solid ${c.border}` : "none",
            }}
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)", color: "white" }}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <h2 style={{ fontWeight: 800, fontSize: "17px", fontFamily: "'Cairo', sans-serif" }}>
                  {t("السلة", "Cart")}
                </h2>
                {cart.length > 0 && (
                  <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center" style={{ fontSize: "12px", fontWeight: 700 }}>
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: c.surface3 }}>
                    <ShoppingBag className="w-8 h-8" style={{ color: c.border }} />
                  </div>
                  <p style={{ fontWeight: 700, color: c.text, fontSize: "16px", fontFamily: "'Cairo', sans-serif" }}>
                    {t("السلة فارغة", "Cart is Empty")}
                  </p>
                  <p style={{ color: c.muted, fontSize: "13px", marginTop: "6px", fontFamily: "'Cairo', sans-serif" }}>
                    {t("ابدأ التسوق الآن", "Start shopping now")}
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="mt-4 px-6 py-2.5 rounded-xl text-white"
                    style={{ background: "#E5233B", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "13px" }}
                  >
                    {t("تسوق الآن", "Shop Now")}
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: lang === "ar" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: lang === "ar" ? -20 : 20 }}
                    className="flex items-start gap-3 p-3 rounded-2xl"
                    style={{ background: c.surface2, border: `1px solid ${c.border}` }}
                  >
                    <img src={item.image} alt={lang === "ar" ? item.nameAr : item.nameEn}
                      className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="truncate" style={{ fontWeight: 700, fontSize: "13px", color: c.text, fontFamily: "'Cairo', sans-serif" }}>
                        {lang === "ar" ? item.nameAr : item.nameEn}
                      </p>
                      <p style={{ fontSize: "11px", color: "#E5233B", fontWeight: 600 }}>{item.brand}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition"
                            style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
                          >
                            <Minus className="w-3 h-3" style={{ color: "#E5233B" }} />
                          </button>
                          <span style={{ fontWeight: 700, fontSize: "14px", color: c.text, minWidth: "20px", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center transition"
                            style={{ background: "#E5233B" }}
                          >
                            <Plus className="w-3 h-3 text-white" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 800, fontSize: "14px", color: "#E5233B" }}>
                            {(item.price * item.quantity).toFixed(2)} {currency}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 rounded-lg transition"
                            style={{ background: "#FEF2F2" }}
                          >
                            <Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="shrink-0 p-4 space-y-3" style={{ borderTop: `1.5px solid ${c.border}`, background: c.surface }}>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ fontSize: "13px", color: c.muted, fontFamily: "'Cairo', sans-serif" }}>{t("المجموع الفرعي", "Subtotal")}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>{subtotal.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: "13px", color: c.muted, fontFamily: "'Cairo', sans-serif" }}>{t("التوصيل", "Delivery")}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>{deliveryFee.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ fontSize: "13px", color: c.muted, fontFamily: "'Cairo', sans-serif" }}>{t("رسوم الخدمة", "Service Fee")}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>{serviceFee.toFixed(2)} {currency}</span>
                  </div>
                  <div className="flex justify-between pt-2" style={{ borderTop: `1px solid ${c.border}` }}>
                    <span style={{ fontWeight: 800, fontSize: "15px", fontFamily: "'Cairo', sans-serif", color: c.text }}>{t("الإجمالي", "Total")}</span>
                    <span style={{ fontWeight: 900, fontSize: "18px", color: "#E5233B" }}>{total.toFixed(2)} {currency}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "14px" }}
                >
                  <ArrowRight className="w-4 h-4" />
                  {t("إتمام الطلب", "Proceed to Checkout")}
                </button>
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all"
                  style={{ border: `1.5px solid ${c.border}`, color: c.text2, fontFamily: "'Cairo', sans-serif", fontSize: "13px", fontWeight: 600 }}
                >
                  <ShoppingCart className="w-4 h-4" style={{ color: "#E5233B" }} />
                  {t("عرض السلة كاملة", "View Full Cart")}
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}