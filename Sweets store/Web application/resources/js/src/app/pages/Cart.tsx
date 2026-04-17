import { Link, useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

export function Cart() {
  const { lang, cart, removeFromCart, updateQuantity, deliveryFee, serviceFee } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 30 ? 0 : deliveryFee;
  const total = subtotal + (subtotal > 0 ? shipping + serviceFee : 0);

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div
      className="min-h-screen py-8 px-4 max-w-7xl mx-auto"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}
    >
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="p-2 rounded-full transition" style={{ background: c.surface3 }}>
          <ArrowLeft className="w-5 h-5" style={{ color: c.red }} />
        </Link>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: c.text }}>
          {t("سلة التسوق", "Shopping Cart")}
          {cart.length > 0 && (
            <span className="mx-2 px-2 py-0.5 rounded-full text-white text-sm" style={{ background: c.red }}>
              {cart.length}
            </span>
          )}
        </h1>
      </div>

      {cart.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6" style={{ background: c.surface3 }}>
            <ShoppingBag className="w-12 h-12" style={{ color: c.red }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "22px", color: c.text }}>
            {t("سلتك فارغة!", "Your Cart is Empty!")}
          </h2>
          <p style={{ color: c.muted, marginTop: "8px", fontSize: "15px" }}>
            {t("أضف منتجات رائعة لسلتك الآن", "Add amazing products to your cart now")}
          </p>
          <Link
            to="/"
            className="mt-6 px-8 py-3 rounded-xl text-white shadow-lg"
            style={{ background: c.red, fontWeight: 700 }}
          >
            {t("ابدأ التسوق", "Start Shopping")}
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="flex gap-4 p-4 rounded-2xl"
                  style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0" style={{ background: c.surface3 }}>
                    <img src={item?.image_url} alt={lang === "ar" ? item?.name?.ar : item?.name?.en} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <p style={{ fontSize: "11px", color: c.pink, fontWeight: 600 }}>{item?.brand}</p>
                        <h3 style={{ fontWeight: 700, fontSize: "15px", color: c.text }}>
                          {lang === "ar" ? item?.name?.ar : item?.name?.en}
                        </h3>
                        {/* Stock Warning */}
                        {typeof (item as any).stock !== 'undefined' && item.quantity > (item as any).stock && (
                          <div className="mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-lg w-fit" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <p style={{ fontSize: "11px", color: "#EF4444", fontWeight: 700 }}>
                              {t("المخزون غير كافي", "Insufficient Stock")}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg transition"
                        style={{ background: c.surface3 }}
                      >
                        <Trash2 className="w-4 h-4" style={{ color: c.red }} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-2 rounded-xl border" style={{ borderColor: c.border, background: c.surface }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition hover:opacity-80"
                          style={{ background: c.surface3 }}
                        >
                          <Minus className="w-3.5 h-3.5" style={{ color: c.red }} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: "15px", minWidth: "24px", textAlign: "center", color: c.text }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl transition hover:opacity-80"
                          style={{ background: c.surface3 }}
                        >
                          <Plus className="w-3.5 h-3.5" style={{ color: c.red }} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p style={{ fontWeight: 800, fontSize: "18px", color: c.red }}>
                          {(item.price * item.quantity).toFixed(2)} {currency}
                        </p>
                        {item.quantity > 1 && (
                          <p style={{ fontSize: "11px", color: c.muted }}>
                            {item.price} × {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-6 sticky top-24" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
              <h3 className="mb-6" style={{ fontWeight: 800, fontSize: "18px", color: c.text }}>
                {t("ملخص الطلب", "Order Summary")}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span style={{ color: c.text2, fontSize: "14px" }}>{t("المجموع الفرعي", "Subtotal")}</span>
                  <span style={{ fontWeight: 600, color: c.text }}>{subtotal.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: c.text2, fontSize: "14px" }}>{t("التوصيل", "Delivery")}</span>
                  <span style={{ fontWeight: 600, color: shipping === 0 ? "#16a34a" : c.text }}>
                    {shipping === 0 ? t("مجاني", "Free") : `${shipping.toFixed(2)} ${currency}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: c.text2, fontSize: "14px" }}>{t("رسوم الخدمة", "Service Fee")}</span>
                  <span style={{ fontWeight: 600, color: c.text }}>{serviceFee.toFixed(2)} {currency}</span>
                </div>
                {shipping > 0 && (
                  <p style={{ fontSize: "12px", color: c.pink }}>
                    {t(`أضف ${30 - subtotal} ج.م للحصول على شحن مجاني`, `Add ${30 - subtotal} EGP for free shipping`)}
                  </p>
                )}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4 p-3 rounded-xl" style={{ background: c.surface3 }}>
                <Tag className="w-4 h-4 shrink-0 mt-1" style={{ color: c.red }} />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t("أدخل كود الخصم", "Enter discount code")}
                    className="w-full bg-transparent outline-none"
                    style={{ fontSize: "13px", fontFamily: "'Cairo', sans-serif", color: c.text }}
                  />
                </div>
                <button
                  className="px-3 py-1 rounded-lg text-white text-xs shadow-md"
                  style={{ background: c.red, fontWeight: 700 }}
                >
                  {t("تطبيق", "Apply")}
                </button>
              </div>

              <div className="py-4 border-t border-b mb-5" style={{ borderColor: c.border }}>
                <div className="flex justify-between">
                  <span style={{ fontWeight: 800, fontSize: "17px", color: c.text }}>{t("الإجمالي", "Total")}</span>
                  <span style={{ fontWeight: 900, fontSize: "20px", color: c.red }}>
                    {total.toFixed(2)} {currency}
                  </span>
                </div>
              </div>

              {/* Checkout Button Logic */}
              {(() => {
                const hasProblem = cart.some(i => typeof (i as any).stock !== 'undefined' && i.quantity > (i as any).stock);
                return (
                  <>
                    {hasProblem && (
                      <p className="text-center mb-3 px-2 py-1 rounded-lg" style={{ background: "#FEF2F2", color: "#EF4444", fontSize: "11px", fontWeight: 700, border: "1px solid #FECACA" }}>
                        {t("بعض الأصناف غير متوفرة بالكمية المطلوبة", "Some items are not available in the required quantity")}
                      </p>
                    )}
                    <motion.button
                      whileHover={!hasProblem ? { scale: 1.02 } : {}}
                      whileTap={!hasProblem ? { scale: 0.98 } : {}}
                      onClick={!hasProblem ? handleCheckout : undefined}
                      disabled={hasProblem}
                      className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:grayscale transition-all"
                      style={{ background: hasProblem ? "#888" : c.red, fontWeight: 700, fontSize: "16px", cursor: hasProblem ? "not-allowed" : "pointer" }}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {t("إتمام الطلب", "Place Order")}
                    </motion.button>
                  </>
                );
              })()}

              <p className="text-center mt-3" style={{ fontSize: "12px", color: c.muted }}>
                🔒 {t("دفع آمن ومضمون", "Secure & Guaranteed Payment")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}