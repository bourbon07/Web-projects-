import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { User, Mail, Phone, MapPin, CheckCircle, ShoppingBag, ArrowRight, Banknote, Smartphone, CreditCard, Wallet, ArrowLeft } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { CustomSelect } from "../components/ui/CustomSelect";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import api from "../../api/axiosConfig";
import { useEffect } from "react";

type PaymentMethod = "Cash" | "Visa" | "PayPal" | "Zain Cash";

export function Checkout() {
  const { lang, cart, placeOrder, deliveryFee, serviceFee, currentUser, updateUserProfile } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    address: "",
    city: "",
    payment: "Cash" as PaymentMethod,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);

  // Dynamic Cities
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCityFee, setSelectedCityFee] = useState<number | null>(null);

  useEffect(() => {
    api.get("/cities").then((res: any) => setCities(res.data));
  }, []);

  const handleCityChange = (cityName: string) => {
    const city = cities.find(c => c.name_ar === cityName || c.name_en === cityName);
    setForm({ ...form, city: cityName });
    if (city) {
      setSelectedCityFee(Number(city.delivery_fee));
    } else {
      setSelectedCityFee(null);
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = (deliveryFee && deliveryFee > 0) ? deliveryFee : (selectedCityFee !== null ? selectedCityFee : 0);
  const total = subtotal + (subtotal > 0 ? shipping + serviceFee : 0);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("الاسم مطلوب", "Name is required");
    if (!form.email.includes("@")) errs.email = t("بريد إلكتروني غير صالح", "Invalid email");
    if (!form.phone.trim() || form.phone.length < 8) errs.phone = t("رقم هاتف غير صالح", "Invalid phone number");
    if (!form.address.trim()) errs.address = t("العنوان مطلوب", "Address is required");
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      setStockError(null);
      
      // Auto-sync phone number with profile if changed
      if (currentUser && form.phone !== currentUser.phone) {
        try {
          await updateUserProfile({ phone: form.phone });
        } catch (profileErr: any) {
          console.error("Failed to sync phone with profile:", profileErr);
          const msg = profileErr.response?.data?.errors?.phone?.[0] || profileErr.response?.data?.message;
          setStockError(lang === 'ar' ? `فشل تحديث رقم الهاتف: ${msg || 'الرقم قد يكون مستخدماً'}` : `Failed to update phone: ${msg || 'Already in use'}`);
          setLoading(false);
          return;
        }
      }

      await placeOrder({ 
        name: form.name, 
        email: form.email, 
        phone: form.phone, 
        address: `${form.address}, ${form.city}`, 
        payment: form.payment 
      }, {
        delivery_fee: shipping,
        service_fee: serviceFee
      });
      setSuccess(true);
      setTimeout(() => navigate("/orders"), 2500);
    } catch (err: any) {
      console.error("Order failed", err);
      if (err.response?.status === 422 && err.response?.data?.message) {
        setStockError(err.response.data.message);
      } else {
        setStockError(t("فشل إتمام الطلب، يرجى المحاولة مرة أخرى", "Failed to place order, please try again"));
      }
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: c.bg }} dir={lang === "ar" ? "rtl" : "ltr"}>
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
          <h2 style={{ fontWeight: 900, fontSize: "24px", color: c.text, fontFamily: "'Cairo', sans-serif" }}>
            {t("تم تقديم طلبك بنجاح! 🎉", "Order Placed Successfully! 🎉")}
          </h2>
          <p style={{ color: c.muted, marginTop: "8px", fontFamily: "'Cairo', sans-serif" }}>
            {t("سيتم التواصل معك قريباً على", "We'll contact you shortly at")} {form.email}
          </p>
          <p style={{ color: c.light, fontSize: "13px", marginTop: "4px", fontFamily: "'Cairo', sans-serif" }}>
            {t("جاري التحويل إلى طلباتك...", "Redirecting to your orders...")}
          </p>
        </motion.div>
      </div>
    );
  }

  if (cart.length === 0 && !success) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: c.bg }}>
          <div className="text-center">
            <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("سلتك فارغة", "Your cart is empty")}</h2>
            <Link to="/" className="text-red-500 font-bold hover:underline">
              {t("العودة للتسوق", "Go back to shopping")}
            </Link>
          </div>
        </div>
      );
  }

  return (
    <div
      className="min-h-screen py-8 px-4"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/cart" className="p-2 rounded-full hover:shadow-sm bg-white transition shadow-pink-100">
            <ArrowLeft className="w-5 h-5" style={{ color: "#E5233B" }} />
          </Link>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: "26px", color: c.text }}>
              {t("إتمام الطلب", "Complete Your Purchase")}
            </h1>
            <p style={{ color: c.muted, marginTop: "2px", fontSize: "14px" }}>
              {t("أدخل بياناتك لإتمام عملية الشراء", "Enter your details to complete the purchase")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info */}
              <div className="rounded-3xl p-6 space-y-5 shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
                <h3 className="flex items-center gap-2" style={{ fontWeight: 800, color: c.text, fontSize: "17px" }}>
                  <User className="w-5 h-5 text-red-500" />
                  {t("البيانات الشخصية", "Personal Information")}
                </h3>

                <div className="space-y-4">
                    <div>
                    <label className="block mb-1.5 text-sm" style={{ fontWeight: 700, color: c.text2 }}>
                        {t("الاسم الكامل", "Full Name")} *
                    </label>
                    <div className="relative">
                        <User className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                        <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "40px" }}
                        placeholder={t("اسمك الكامل", "Your full name")}
                        />
                    </div>
                    {errors.name && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-1.5 text-sm" style={{ fontWeight: 700, color: c.text2 }}>
                        {t("البريد الإلكتروني", "Email")} *
                        </label>
                        <div className="relative">
                        <Mail className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "40px" }}
                            placeholder="email@example.com"
                        />
                        </div>
                        {errors.email && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block mb-1.5 text-sm" style={{ fontWeight: 700, color: c.text2 }}>
                        {t("رقم الهاتف", "Phone Number")} *
                        </label>
                        <div className="relative">
                        <Phone className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "40px" }}
                            placeholder={t("07X XXX XXXX", "07X XXX XXXX")}
                            dir="ltr"
                        />
                        </div>
                        {errors.phone && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.phone}</p>}
                    </div>
                    </div>
                </div>
              </div>

              {/* Address */}
              <div className="rounded-3xl p-6 space-y-5 shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
                <h3 className="flex items-center gap-2" style={{ fontWeight: 800, color: c.text, fontSize: "17px" }}>
                  <MapPin className="w-5 h-5 text-red-500" />
                  {t("عنوان التوصيل", "Delivery Address")}
                </h3>

                <div className="space-y-4">
                    <div>
                        <label className="block mb-1.5 text-sm" style={{ fontWeight: 700, color: c.text2 }}>
                            {t("العنوان التفصيلي", "Detailed Address")} *
                        </label>
                        <div className="relative">
                            <MapPin className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                            <input
                            type="text"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "40px" }}
                            placeholder={t("الشارع، الحي، رقم المبنى", "Street, neighborhood, building")}
                            />
                        </div>
                        {errors.address && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.address}</p>}
                    </div>

                    <div>
                        <label className="block mb-1.5 text-sm" style={{ fontWeight: 700, color: c.text2 }}>
                            {t("المدينة", "City")}
                        </label>
                        <CustomSelect
                            value={form.city}
                            onChange={handleCityChange}
                            dir={lang === "ar" ? "rtl" : "ltr"}
                            placeholder={t("اختر المدينة", "Select City")}
                            options={cities.map(city => ({
                                value: t(city.name_ar, city.name_en),
                                label: `${city.name_ar} / ${city.name_en}`,
                                icon: "🏙️"
                            }))}
                            icon={<MapPin className="w-4 h-4" style={{ color: "#E5233B" }} />}
                        />
                    </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-3xl p-6 shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
                <h3 className="flex items-center gap-2" style={{ fontWeight: 800, color: c.text, fontSize: "17px", marginBottom: "20px" }}>
                  <Banknote className="w-5 h-5 text-red-500" />
                  {t("طريقة الدفع", "Payment Method")}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "Cash" as PaymentMethod, icon: <Banknote className="w-5 h-5" />, ar: "الدفع عند الاستلام", en: "Cash on Delivery", color: "#16a34a" },
                    { key: "Visa" as PaymentMethod, icon: <CreditCard className="w-5 h-5" />, ar: "فيزا / بطاقة", en: "Visa / Card", color: "#1e40af" },
                    { key: "PayPal" as PaymentMethod, icon: <Wallet className="w-5 h-5" />, ar: "PayPal", en: "PayPal", color: "#0070ba" },
                    { key: "Zain Cash" as PaymentMethod, icon: <Smartphone className="w-5 h-5" />, ar: "Zain Cash", en: "Zain Cash", color: "#cc0033" },
                  ].map((opt) => {
                    const isSelected = form.payment === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setForm({ ...form, payment: opt.key })}
                        className="p-4 rounded-2xl flex items-center gap-3 transition-all group"
                        style={{
                          border: `2px solid ${isSelected ? "#E5233B" : c.border}`,
                          background: isSelected ? c.surface3 : c.surface2,
                        }}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                          style={{ background: isSelected ? "#E5233B" : c.surface }}>
                          <span style={{ color: isSelected ? "white" : opt.color }}>{opt.icon}</span>
                        </div>
                        <span style={{ fontFamily: "'Cairo', sans-serif", fontSize: "14px", fontWeight: isSelected ? 700 : 700, color: isSelected ? "#E5233B" : c.text, textAlign: "start" }}>
                          {lang === "ar" ? opt.ar : opt.en}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              {stockError && (
                <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
                  <span style={{ fontSize: "13.5px", color: "#EF4444", fontWeight: 700 }}>⚠ {stockError}</span>
                </div>
              )}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 rounded-2xl text-white flex items-center justify-center gap-3 shadow-lg shadow-red-100"
                style={{ background: loading ? "#FFB3BF" : "linear-gradient(135deg, #E5233B, #FF6B8A)", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "17px" }}
              >
                {loading ? (
                  <div className="w-6 h-6 rounded-full border-3 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t("إتمام الطلب", "Confirm Order")}
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 rounded-3xl overflow-hidden shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
              <div className="px-6 py-4" style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)" }}>
                <p className="text-white flex items-center gap-2" style={{ fontWeight: 800, fontSize: "16px" }}>
                    <ShoppingBag className="w-5 h-5" />
                    {t("ملخص الطلب", "Order Summary")}
                </p>
              </div>
              <div className="p-5">
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-pink-50">
                            <img src={item.image_url} alt={lang === 'ar' ? item.name?.ar : item.name?.en} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate" style={{ fontSize: "14px", fontWeight: 700, color: c.text, fontFamily: "'Cairo', sans-serif" }}>
                              {lang === "ar" ? item.name?.ar : item.name?.en}
                          </p>
                          <p style={{ fontSize: "12px", color: c.muted, fontWeight: 600 }}>×{item.quantity}</p>
                        </div>
                        <p style={{ fontSize: "15px", fontWeight: 900, color: "#E5233B", fontFamily: "'Cairo', sans-serif" }}>{(item.price * item.quantity).toFixed(2)} {currency}</p>
                      </div>
                    ))}
                    <div className="pt-4 space-y-2.5" style={{ borderTop: `1.5px dashed ${c.border}` }}>
                      <div className="flex justify-between"><span style={{ fontSize: "14px", color: c.muted, fontWeight: 600 }}>{t("المجموع الفرعي", "Subtotal")}</span><span style={{ fontSize: "14px", fontWeight: 700, color: c.text }}>{subtotal.toFixed(2)} {currency}</span></div>
                      <div className="flex justify-between">
                          <span style={{ fontSize: "14px", color: c.muted, fontWeight: 600 }}>{t("التوصيل", "Delivery")}</span>
                          <span style={{ fontSize: "14px", fontWeight: 700, color: shipping === 0 ? "#16a34a" : c.text }}>
                              {shipping === 0 ? t("مجاني", "Free") : `${shipping.toFixed(2)} ${currency}`}
                          </span>
                      </div>
                      <div className="flex justify-between"><span style={{ fontSize: "14px", color: c.muted, fontWeight: 600 }}>{t("رسوم الخدمة", "Service Fee")}</span><span style={{ fontSize: "14px", fontWeight: 700, color: c.text }}>{serviceFee.toFixed(2)} {currency}</span></div>
                      
                      <div className="flex justify-between pt-4 mt-2" style={{ borderTop: `1.5px solid ${c.border}` }}>
                        <span style={{ fontWeight: 800, fontSize: "18px", fontFamily: "'Cairo', sans-serif", color: c.text }}>{t("الإجمالي", "Total")}</span>
                        <span style={{ fontWeight: 900, fontSize: "22px", color: "#E5233B", fontFamily: "'Cairo', sans-serif" }}>{total.toFixed(2)} {currency}</span>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}