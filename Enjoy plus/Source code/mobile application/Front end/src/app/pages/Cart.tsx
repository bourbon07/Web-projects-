import { Link, useNavigate } from "react-router";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Tag } from "lucide-react";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

export function Cart() {
  const { lang, cart, removeFromCart, updateQuantity, placeOrder, isLoggedIn, deliveryFee, serviceFee } = useApp();
  const navigate = useNavigate();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal > 30 ? 0 : deliveryFee;
  const total = subtotal + (subtotal > 0 ? shipping + serviceFee : 0);

  const handleCheckout = () => {
    if (isLoggedIn) {
      placeOrder();
      navigate("/orders");
    } else {
      navigate("/checkout/guest");
    }
  };

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
          {t("سلة التسوق", "Shopping Cart")}
          {cart.length > 0 && (
            <span className="mx-2 px-2 py-0.5 rounded-full text-white text-sm" style={{ background: "#E5233B" }}>
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
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6" style={{ background: "#FFF0F3" }}>
            <ShoppingBag className="w-12 h-12" style={{ color: "#E5233B" }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "22px", color: "#1a1a1a" }}>
            {t("سلتك فارغة!", "Your Cart is Empty!")}
          </h2>
          <p style={{ color: "#888", marginTop: "8px", fontSize: "15px" }}>
            {t("أضف منتجات رائعة لسلتك الآن", "Add amazing products to your cart now")}
          </p>
          <Link
            to="/"
            className="mt-6 px-8 py-3 rounded-xl text-white"
            style={{ background: "#E5233B", fontWeight: 700 }}
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
                  style={{ background: "white", border: "1.5px solid #FFDDE4" }}
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0" style={{ background: "#FFF0F3" }}>
                    <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p style={{ fontSize: "11px", color: "#FF6B8A", fontWeight: 600 }}>{item.brand}</p>
                        <h3 style={{ fontWeight: 700, fontSize: "15px", color: "#1a1a1a" }}>
                          {lang === "ar" ? item.nameAr : item.nameEn}
                        </h3>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: "#E5233B" }} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-2 rounded-xl border" style={{ borderColor: "#FFDDE4" }}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-pink-50 transition"
                        >
                          <Minus className="w-3.5 h-3.5" style={{ color: "#E5233B" }} />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: "15px", minWidth: "24px", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-pink-50 transition"
                        >
                          <Plus className="w-3.5 h-3.5" style={{ color: "#E5233B" }} />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p style={{ fontWeight: 800, fontSize: "18px", color: "#E5233B" }}>
                          {(item.price * item.quantity).toFixed(2)} {currency}
                        </p>
                        {item.quantity > 1 && (
                          <p style={{ fontSize: "11px", color: "#999" }}>
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
            <div className="rounded-2xl p-6 sticky top-24" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
              <h3 className="mb-6" style={{ fontWeight: 800, fontSize: "18px" }}>
                {t("ملخص الطلب", "Order Summary")}
              </h3>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span style={{ color: "#666", fontSize: "14px" }}>{t("المجموع الفرعي", "Subtotal")}</span>
                  <span style={{ fontWeight: 600 }}>{subtotal.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#666", fontSize: "14px" }}>{t("التوصيل", "Delivery")}</span>
                  <span style={{ fontWeight: 600, color: shipping === 0 ? "#16a34a" : "#333" }}>
                    {shipping === 0 ? t("مجاني", "Free") : `${shipping.toFixed(2)} ${currency}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "#666", fontSize: "14px" }}>{t("رسوم الخدمة", "Service Fee")}</span>
                  <span style={{ fontWeight: 600 }}>{serviceFee.toFixed(2)} {currency}</span>
                </div>
                {shipping > 0 && (
                  <p style={{ fontSize: "12px", color: "#FF6B8A" }}>
                    {t(`أضف ${30 - subtotal} ج.م للحصول على شحن مجاني`, `Add ${30 - subtotal} EGP for free shipping`)}
                  </p>
                )}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4 p-3 rounded-xl" style={{ background: "#FFF0F3" }}>
                <Tag className="w-4 h-4 shrink-0 mt-1" style={{ color: "#E5233B" }} />
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t("أدخل كود الخصم", "Enter discount code")}
                    className="w-full bg-transparent outline-none"
                    style={{ fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}
                  />
                </div>
                <button
                  className="px-3 py-1 rounded-lg text-white text-xs"
                  style={{ background: "#E5233B", fontWeight: 700 }}
                >
                  {t("تطبيق", "Apply")}
                </button>
              </div>

              <div className="py-4 border-t border-b mb-5" style={{ borderColor: "#FFDDE4" }}>
                <div className="flex justify-between">
                  <span style={{ fontWeight: 800, fontSize: "17px" }}>{t("الإجمالي", "Total")}</span>
                  <span style={{ fontWeight: 900, fontSize: "20px", color: "#E5233B" }}>
                    {total.toFixed(2)} {currency}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2"
                style={{ background: "#E5233B", fontWeight: 700, fontSize: "16px" }}
              >
                <ShoppingBag className="w-5 h-5" />
                {t("إتمام الطلب", "Place Order")}
              </motion.button>

              <p className="text-center mt-3" style={{ fontSize: "12px", color: "#999" }}>
                🔒 {t("دفع آمن ومضمون", "Secure & Guaranteed Payment")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}