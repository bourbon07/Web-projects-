import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Mail, Phone, MapPin, CheckCircle, ShoppingBag, ArrowRight, Banknote, Smartphone, CreditCard, Wallet } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { CustomSelect } from "../components/ui/CustomSelect";
import { motion, AnimatePresence } from "motion/react";

type PaymentMethod = "cash" | "visa" | "paypal" | "zaincash";

export function GuestCheckout() {
  const { lang, cart, placeOrder, deliveryFee, serviceFee } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    payment: "cash" as PaymentMethod,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + (subtotal > 0 ? deliveryFee + serviceFee : 0);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("الاسم مطلوب", "Name is required");
    if (!form.email.includes("@")) errs.email = t("بريد إلكتروني غير صالح", "Invalid email");
    if (form.phone.length < 8) errs.phone = t("رقم هاتف غير صالح", "Invalid phone number");
    if (!form.address.trim()) errs.address = t("العنوان مطلوب", "Address is required");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      placeOrder({ name: form.name, email: form.email, phone: form.phone, address: `${form.address}, ${form.city}`, payment: form.payment });
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/orders"), 2500);
    }, 1800);
  };

  const inputStyle = {
    border: `1.5px solid ${c.border}`,
    background: c.inputBg,
    fontFamily: "'Cairo', sans-serif",
    fontSize: "14px",
    color: c.text,
    borderRadius: "12px",
    padding: "12px 16px",
    width: "100%",
    outline: "none",
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#FAFAFA" }} dir={lang === "ar" ? "rtl" : "ltr"}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)" }}
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          <h2 style={{ fontWeight: 900, fontSize: "24px", color: "#1a1a1a", fontFamily: "'Cairo', sans-serif" }}>
            {t("تم تقديم طلبك بنجاح! 🎉", "Order Placed Successfully! 🎉")}
          </h2>
          <p style={{ color: "#888", marginTop: "8px", fontFamily: "'Cairo', sans-serif" }}>
            {t("سيتم التواصل معك قريباً على", "We'll contact you shortly at")} {form.email}
          </p>
          <p style={{ color: "#BBB", fontSize: "13px", marginTop: "4px", fontFamily: "'Cairo', sans-serif" }}>
            {t("جاري التحويل إلى طلباتك...", "Redirecting to your orders...")}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-8 px-4"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
            <ShoppingBag className="w-4 h-4" style={{ color: "#E5233B" }} />
            <span style={{ color: "#E5233B", fontSize: "13px", fontWeight: 700 }}>{t("طلب كزائر", "Guest Order")}</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "26px", color: c.text }}>
            {t("إتمام الطلب", "Complete Your Order")}
          </h1>
          <p style={{ color: c.muted, marginTop: "6px", fontSize: "14px" }}>
            {t("أدخل بياناتك لإتمام عملية الشراء", "Enter your details to complete the purchase")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Info */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
                <h3 style={{ fontWeight: 800, color: c.text, fontSize: "16px" }}>
                  {t("البيانات الشخصية", "Personal Information")}
                </h3>

                <div>
                  <label className="block mb-1.5 text-sm" style={{ fontWeight: 600, color: c.text2 }}>
                    {t("الاسم الكامل", "Full Name")} *
                  </label>
                  <div className="relative">
                    <User className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "36px" }}
                      placeholder={t("اسمك الكامل", "Your full name")}
                    />
                  </div>
                  {errors.name && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 text-sm" style={{ fontWeight: 600, color: c.text2 }}>
                      {t("البريد الإلكتروني", "Email")} *
                    </label>
                    <div className="relative">
                      <Mail className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "36px" }}
                        placeholder="email@example.com"
                      />
                    </div>
                    {errors.email && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block mb-1.5 text-sm" style={{ fontWeight: 600, color: c.text2 }}>
                      {t("رقم الهاتف", "Phone Number")} *
                    </label>
                    <div className="relative">
                      <Phone className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "36px" }}
                        placeholder={t("07X XXX XXXX", "07X XXX XXXX")}
                        dir="ltr"
                      />
                    </div>
                    {errors.phone && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="rounded-2xl p-5 space-y-4" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
                <h3 style={{ fontWeight: 800, color: c.text, fontSize: "16px" }}>
                  {t("عنوان التوصيل", "Delivery Address")}
                </h3>

                <div>
                  <label className="block mb-1.5 text-sm" style={{ fontWeight: 600, color: c.text2 }}>
                    {t("العنوان التفصيلي", "Detailed Address")} *
                  </label>
                  <div className="relative">
                    <MapPin className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "36px" }}
                      placeholder={t("الشارع، الحي، رقم المبنى", "Street, neighborhood, building")}
                    />
                  </div>
                  {errors.address && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.address}</p>}
                </div>

                <div>
                  <label className="block mb-1.5 text-sm" style={{ fontWeight: 600, color: c.text2 }}>
                    {t("المدينة", "City")}
                  </label>
                  <CustomSelect
                    value={form.city}
                    onChange={(v) => setForm({ ...form, city: v })}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    placeholder={t("اختر المدينة", "Select City")}
                    options={[
                      { value: "عمّان", label: "عمّان / Amman", icon: "🏙️" },
                      { value: "إربد", label: "إربد / Irbid", icon: "🌆" },
                      { value: "الزرقاء", label: "الزرقاء / Zarqa", icon: "🏘️" },
                      { value: "العقبة", label: "العقبة / Aqaba", icon: "🌊" },
                      { value: "السلط", label: "السلط / Salt", icon: "🏔️" },
                      { value: "مادبا", label: "مادبا / Madaba", icon: "🗺️" },
                      { value: "الكرك", label: "الكرك / Karak", icon: "🏰" },
                      { value: "جرش", label: "جرش / Jerash", icon: "🏛️" },
                      { value: "عجلون", label: "عجلون / Ajloun", icon: "🌿" },
                      { value: "المفرق", label: "المفرق / Mafraq", icon: "🌾" },
                    ]}
                    icon={<MapPin className="w-4 h-4" style={{ color: "#E5233B" }} />}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl p-5" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
                <h3 style={{ fontWeight: 800, color: c.text, fontSize: "16px", marginBottom: "16px" }}>
                  {t("طريقة الدفع", "Payment Method")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "cash" as PaymentMethod, icon: <Banknote className="w-5 h-5" />, ar: "الدفع عند الاستلام", en: "Cash on Delivery", color: "#16a34a" },
                    { key: "visa" as PaymentMethod, icon: <CreditCard className="w-5 h-5" />, ar: "فيزا / بطاقة", en: "Visa / Card", color: "#1e40af" },
                    { key: "paypal" as PaymentMethod, icon: <Wallet className="w-5 h-5" />, ar: "PayPal", en: "PayPal", color: "#0070ba" },
                    { key: "zaincash" as PaymentMethod, icon: <Smartphone className="w-5 h-5" />, ar: "Zain Cash", en: "Zain Cash", color: "#cc0033" },
                  ].map((opt) => {
                    const isSelected = form.payment === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setForm({ ...form, payment: opt.key })}
                        className="p-4 rounded-xl flex items-center gap-3 transition-all"
                        style={{
                          border: `2px solid ${isSelected ? "#E5233B" : c.border}`,
                          background: isSelected ? c.surface3 : c.surface2,
                        }}
                      >
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: isSelected ? "#E5233B" : c.surface }}>
                          <span style={{ color: isSelected ? "white" : opt.color }}>{opt.icon}</span>
                        </div>
                        <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: "12px", fontWeight: isSelected ? 700 : 500, color: isSelected ? "#E5233B" : c.text2, textAlign: "start" }}>
                          {lang === "ar" ? opt.ar : opt.en}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-xl text-white flex items-center justify-center gap-2"
                style={{ background: loading ? "#FFB3BF" : "linear-gradient(135deg, #E5233B, #FF6B8A)", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "15px" }}
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    {t("تأكيد الطلب", "Confirm Order")}
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-2xl overflow-hidden" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
              <div className="px-5 py-4" style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)" }}>
                <p className="text-white" style={{ fontWeight: 700, fontSize: "15px" }}>{t("ملخص الطلب", "Order Summary")}</p>
              </div>
              <div className="p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-2" style={{ color: c.border }} />
                    <p style={{ color: c.muted, fontSize: "13px", fontFamily: "'Cairo', sans-serif" }}>{t("السلة فارغة", "Cart is empty")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0"><img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate" style={{ fontSize: "12px", fontWeight: 600, color: c.text, fontFamily: "'Cairo', sans-serif" }}>{lang === "ar" ? item.nameAr : item.nameEn}</p>
                          <p style={{ fontSize: "11px", color: c.muted }}>×{item.quantity}</p>
                        </div>
                        <p style={{ fontSize: "13px", fontWeight: 700, color: "#E5233B", fontFamily: "'Cairo', sans-serif" }}>{(item.price * item.quantity).toFixed(2)} {currency}</p>
                      </div>
                    ))}
                    <div className="pt-3 space-y-2" style={{ borderTop: `1px solid ${c.border}` }}>
                      <div className="flex justify-between"><span style={{ fontSize: "13px", color: c.muted }}>{t("المجموع", "Subtotal")}</span><span style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>{subtotal.toFixed(2)} {currency}</span></div>
                      <div className="flex justify-between"><span style={{ fontSize: "13px", color: c.muted }}>{t("التوصيل", "Delivery")}</span><span style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>{deliveryFee.toFixed(2)} {currency}</span></div>
                      <div className="flex justify-between"><span style={{ fontSize: "13px", color: c.muted }}>{t("رسوم الخدمة", "Service Fee")}</span><span style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>{serviceFee.toFixed(2)} {currency}</span></div>
                      <div className="flex justify-between pt-2" style={{ borderTop: `1px solid ${c.border}` }}>
                        <span style={{ fontWeight: 800, fontSize: "15px", fontFamily: "'Cairo', sans-serif", color: c.text }}>{t("الإجمالي", "Total")}</span>
                        <span style={{ fontWeight: 900, fontSize: "18px", color: "#E5233B", fontFamily: "'Cairo', sans-serif" }}>{total.toFixed(2)} {currency}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}