import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeft, Eye, EyeOff, CreditCard, Trash2,
  Lock, Shield, CheckCircle, Smartphone, Banknote, Wallet
} from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";
import axiosConfig from "../../api/axiosConfig";

type PaymentKey = "cash" | "visa" | "paypal" | "zaincash";

interface PaymentDetails {
  cash: { address: string; notes: string };
  visa: { cardNumber: string; expiry: string; cvv: string; name: string };
  paypal: { email: string; phone: string };
  zaincash: { phone: string; name: string };
}

const inp = (c: any, extra?: React.CSSProperties): React.CSSProperties => ({
  border: `1.5px solid ${c.border}`,
  background: c.inputBg,
  fontFamily: "'Cairo', sans-serif",
  fontSize: "14px",
  color: c.text,
  borderRadius: "12px",
  padding: "12px 16px",
  width: "100%",
  outline: "none",
  ...extra,
});

const Field = ({ label, children, c }: { label: string; children: React.ReactNode; c: any }) => (
  <div>
    <label className="block mb-1.5" style={{ fontSize: "12px", fontWeight: 600, color: c.text2, fontFamily: "'Cairo', sans-serif" }}>
      {label}
    </label>
    {children}
  </div>
);

const SettingsSection = ({ title, icon, children, c }: { title: string; icon: React.ReactNode; children: React.ReactNode; c: any }) => (
  <div className="rounded-2xl p-5 mb-4" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.surface3 }}>
        <span style={{ color: "#E5233B" }}>{icon}</span>
      </div>
      <h3 style={{ fontWeight: 800, color: c.text, fontSize: "15px", fontFamily: "'Cairo', sans-serif" }}>{title}</h3>
    </div>
    {children}
  </div>
);

const PAYMENT_OPTIONS: { key: PaymentKey; icon: React.ReactNode; ar: string; en: string }[] = [
  { key: "cash", icon: <Banknote className="w-5 h-5" />, ar: "الدفع عند الاستلام", en: "Cash on Delivery" },
  { key: "visa", icon: <CreditCard className="w-5 h-5" />, ar: "فيزا / بطاقة بنكية", en: "Visa / Bank Card" },
  { key: "paypal", icon: <Wallet className="w-5 h-5" />, ar: "PayPal", en: "PayPal" },
  { key: "zaincash", icon: <Smartphone className="w-5 h-5" />, ar: "Zain Cash", en: "Zain Cash" },
];

export function Settings() {
  const { lang, currentUser, setCurrentUser, setIsLoggedIn } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  // Profile/Email
  const [email, setEmail] = useState(currentUser?.email || "");
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState("");
  
  // Password
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passSaved, setPassSaved] = useState(false);
  const [passError, setPassError] = useState("");

  // Payment
  const [activePayment, setActivePayment] = useState<PaymentKey>("cash");
  const [paymentSaved, setPaymentSaved] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    cash: { address: "", notes: "" },
    visa: { cardNumber: "", expiry: "", cvv: "", name: "" },
    paypal: { email: "", phone: "" },
    zaincash: { phone: "", name: "" },
  });

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handlePasswordSave = async () => {
    setPassError("");
    if (newPass.length < 6) {
      setPassError(t("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "Password must be at least 6 characters"));
      return;
    }
    if (newPass !== confirmPass) {
      setPassError(t("كلمة المرور غير متطابقة", "Passwords do not match"));
      return;
    }

    try {
      const { data } = await axiosConfig.put("/user/profile", {
        name: currentUser?.name,
        email: currentUser?.email,
        current_password: currentUser?.password_set ? currentPass : undefined,
        new_password: newPass,
        new_password_confirmation: confirmPass
      });
      
      const updatedUser = data.user.data || data.user;
      setCurrentUser(updatedUser);
      localStorage.setItem("current_user", JSON.stringify(updatedUser));
      
      setPassSaved(true);
      setCurrentPass(""); setNewPass(""); setConfirmPass("");
      setTimeout(() => setPassSaved(false), 2500);
    } catch (error: any) {
      setPassError(error.response?.data?.message || t("فشل تحديث كلمة المرور", "Failed to update password"));
    }
  };

  const handleEmailUpdate = async () => {
    setEmailError("");
    try {
      const { data } = await axiosConfig.put("/user/profile", {
        name: currentUser?.name,
        email: email,
      });
      const updatedUser = data.user.data || data.user;
      setCurrentUser(updatedUser);
      localStorage.setItem("current_user", JSON.stringify(updatedUser));
      setEmailSaved(true);
      setTimeout(() => setEmailSaved(false), 2500);
    } catch (error: any) {
      setEmailError(error.response?.data?.errors?.email?.[0] || t("فشل تحديث البريد", "Failed to update email"));
    }
  };

  const handlePaymentSave = () => {
    setPaymentSaved(true);
    setTimeout(() => setPaymentSaved(false), 2500);
  };

  const handleDeleteAccount = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    navigate("/login");
  };

  const patchVisa = (k: keyof PaymentDetails["visa"], v: string) =>
    setPaymentDetails((d) => ({ ...d, visa: { ...d.visa, [k]: v } }));
  const patchCash = (k: keyof PaymentDetails["cash"], v: string) =>
    setPaymentDetails((d) => ({ ...d, cash: { ...d.cash, [k]: v } }));
  const patchPaypal = (k: keyof PaymentDetails["paypal"], v: string) =>
    setPaymentDetails((d) => ({ ...d, paypal: { ...d.paypal, [k]: v } }));
  const patchZain = (k: keyof PaymentDetails["zaincash"], v: string) =>
    setPaymentDetails((d) => ({ ...d, zaincash: { ...d.zaincash, [k]: v } }));

  // Format card number with spaces
  const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  };





  return (
    <div
      className="min-h-screen py-8 px-4"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/profile" className="p-2 rounded-full transition hover:opacity-70" style={{ background: c.surface3 }}>
            <ArrowLeft className="w-5 h-5" style={{ color: "#E5233B" }} />
          </Link>
          <h1 style={{ fontWeight: 800, fontSize: "22px", color: c.text }}>
            {t("الإعدادات", "Settings")}
          </h1>
        </div>


        <SettingsSection c={c} title={t("حسابي والبريد", "Account & Email")} icon={<Shield className="w-5 h-5" />}>
          <div className="space-y-3">
             {currentUser?.google_id && (
               <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl" style={{ background: "#F0F7FF", border: "1.5px solid #D1E9FF" }}>
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#1967D2" }}>
                    {t("مرتبط بحساب Google", "Linked to Google Account")}
                  </span>
               </div>
             )}
             <Field c={c} label={t("البريد الإلكتروني", "Email Address")}>
               <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={inp(c)} 
                placeholder="email@example.com" 
               />
             </Field>
             {emailError && <p style={{ color: "#E5233B", fontSize: "12px" }}>{emailError}</p>}
             <motion.button
              onClick={handleEmailUpdate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-white flex items-center justify-center gap-2"
              style={{ background: emailSaved ? "#16a34a" : "#E5233B", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "14px" }}
            >
              {emailSaved ? <><CheckCircle className="w-4 h-4" /> {t("تم التحديث ✓", "Updated ✓")}</> : t("حفظ البريد الإلكتروني", "Update Email")}
            </motion.button>
          </div>
        </SettingsSection>

        <SettingsSection c={c} title={t("تغيير كلمة المرور", "Change Password")} icon={<Lock className="w-5 h-5" />}>
          <div className="space-y-3">
            {currentUser?.google_id && !currentUser?.password_set && (
              <div className="p-3 rounded-xl mb-4" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                <p style={{ fontSize: "12.5px", color: "#E5233B", lineHeight: 1.6, fontWeight: 700 }}>
                  💡 {t("أنت تستخدم حساب Google. يمكنك تعيين كلمة مرور لأول مرة هنا لتتمكن من تسجيل الدخول يدوياً لاحقاً.", "You're using a Google account. You can set a password here for the first time to enable manual login later.")}
                </p>
              </div>
            )}
            
            <div className="space-y-3">
            {[
              { label: t("كلمة المرور الحالية", "Current Password"), value: currentPass, setter: setCurrentPass, key: "current" as const, hide: !currentUser?.password_set },
              { label: t("كلمة المرور الجديدة", "New Password"), value: newPass, setter: setNewPass, key: "new" as const },
              { label: t("تأكيد كلمة المرور", "Confirm Password"), value: confirmPass, setter: setConfirmPass, key: "confirm" as const },
            ].filter(f => !f.hide).map((f) => (
              <div key={f.key}>
                <label className="block mb-1.5" style={{ fontSize: "12px", fontWeight: 600, color: c.text2 }}>{f.label}</label>
                <div className="relative">
                  <input
                    type={showPass[f.key] ? "text" : "password"}
                    value={f.value}
                    onChange={(e) => f.setter(e.target.value)}
                    style={{ ...inp(c), [lang === "ar" ? "paddingLeft" : "paddingRight"]: "44px" }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => ({ ...p, [f.key]: !p[f.key] }))}
                    className={`absolute top-3.5 ${lang === "ar" ? "left-3" : "right-3"}`}
                    style={{ color: c.muted }}
                  >
                    {showPass[f.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            </div>

            {passError && <p style={{ color: "#E5233B", fontSize: "12px" }}>{passError}</p>}

            <motion.button
              onClick={handlePasswordSave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl text-white flex items-center justify-center gap-2"
              style={{ background: passSaved ? "#16a34a" : "#E5233B", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "14px" }}
            >
              {passSaved ? <><CheckCircle className="w-4 h-4" /> {t("تم التغيير ✓", "Changed ✓")}</> : t("تغيير كلمة المرور", "Change Password")}
            </motion.button>
          </div>
        </SettingsSection>

        {/* === PAYMENT METHODS === */}
        <SettingsSection c={c} title={t("طرق الدفع", "Payment Methods")} icon={<CreditCard className="w-5 h-5" />}>
          {/* Method Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
            {PAYMENT_OPTIONS.map((opt) => {
              const active = activePayment === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setActivePayment(opt.key)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all"
                  style={{
                    border: `2px solid ${active ? "#E5233B" : c.border}`,
                    background: active ? c.surface3 : c.surface2,
                  }}
                >
                  <span style={{ color: active ? "#E5233B" : c.muted }}>{opt.icon}</span>
                  <span style={{ fontSize: "11px", fontWeight: active ? 700 : 500, color: active ? "#E5233B" : c.text2, fontFamily: "'Cairo', sans-serif", textAlign: "center" }}>
                    {lang === "ar" ? opt.ar : opt.en}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Payment Detail Forms */}
          <AnimatePresence mode="wait">
            {activePayment === "cash" && (
              <motion.div key="cash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: "20px" }}>💵</span>
                  <p style={{ fontSize: "12px", color: c.muted }}>{t("ادفع عند استلام طلبك مباشرةً من المندوب", "Pay when you receive your order directly from the delivery agent")}</p>
                </div>
                <Field c={c} label={t("عنوان التوصيل", "Delivery Address")}>
                  <input value={paymentDetails.cash.address} onChange={(e) => patchCash("address", e.target.value)}
                    style={inp(c)} placeholder={t("أدخل عنوانك التفصيلي", "Enter your detailed address")} />
                </Field>
                <Field c={c} label={t("ملاحظات للمندوب (اختياري)", "Notes for delivery agent (optional)")}>
                  <textarea value={paymentDetails.cash.notes} onChange={(e) => patchCash("notes", e.target.value)}
                    rows={2} style={{ ...inp(c), resize: "none" }} placeholder={t("أي تعليمات خاصة...", "Any special instructions...")} />
                </Field>
              </motion.div>
            )}

            {activePayment === "visa" && (
              <motion.div key="visa" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: "20px" }}>💳</span>
                  <p style={{ fontSize: "12px", color: c.muted }}>{t("بياناتك محمية بتشفير SSL 256-bit", "Your data is protected with SSL 256-bit encryption")}</p>
                </div>
                <Field c={c} label={t("اسم حامل البطاقة", "Cardholder Name")}>
                  <input value={paymentDetails.visa.name} onChange={(e) => patchVisa("name", e.target.value.toUpperCase())}
                    style={{ ...inp(c) }} placeholder="JOHN DOE" dir="ltr" />
                </Field>
                <Field c={c} label={t("رقم البطاقة", "Card Number")}>
                  <div className="relative">
                    <input
                      value={paymentDetails.visa.cardNumber}
                      onChange={(e) => patchVisa("cardNumber", formatCard(e.target.value))}
                      style={{ ...inp(c), letterSpacing: "2px" }}
                      placeholder="0000 0000 0000 0000"
                      dir="ltr"
                      maxLength={19}
                    />
                    <span className="absolute top-3.5 end-3" style={{ fontSize: "18px" }}>
                      {paymentDetails.visa.cardNumber.startsWith("4") ? "💳" : paymentDetails.visa.cardNumber.startsWith("5") ? "💜" : "🏦"}
                    </span>
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field c={c} label={t("تاريخ الانتهاء", "Expiry Date")}>
                    <input
                      value={paymentDetails.visa.expiry}
                      onChange={(e) => patchVisa("expiry", formatExpiry(e.target.value))}
                      style={inp(c)} placeholder="MM/YY" dir="ltr" maxLength={5}
                    />
                  </Field>
                  <Field c={c} label={t("الرمز السري (CVV)", "Security Code (CVV)")}>
                    <div className="relative">
                      <input
                        value={paymentDetails.visa.cvv}
                        onChange={(e) => patchVisa("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                        type="password"
                        style={inp(c)}
                        placeholder="•••"
                        dir="ltr"
                        maxLength={4}
                      />
                      <span className="absolute top-3.5 end-3" style={{ fontSize: "14px" }}>🔒</span>
                    </div>
                  </Field>
                </div>
                {/* Card visual preview */}
                <div
                  className="rounded-2xl p-4 mt-2"
                  style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)", minHeight: "90px", position: "relative" }}
                >
                  <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px", fontFamily: "monospace" }}>CARD PREVIEW</p>
                  <p style={{ color: "white", fontSize: "16px", letterSpacing: "3px", fontFamily: "monospace", marginTop: "8px" }}>
                    {paymentDetails.visa.cardNumber || "0000 0000 0000 0000"}
                  </p>
                  <div className="flex justify-between mt-2">
                    <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "11px", fontFamily: "monospace" }}>
                      {paymentDetails.visa.name || "CARDHOLDER NAME"}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "11px", fontFamily: "monospace" }}>
                      {paymentDetails.visa.expiry || "MM/YY"}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activePayment === "paypal" && (
              <motion.div key="paypal" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: "20px" }}>🅿️</span>
                  <p style={{ fontSize: "12px", color: c.muted }}>{t("سيتم تحويلك لتسجيل الدخول إلى PayPal عند الدفع", "You'll be redirected to PayPal login during checkout")}</p>
                </div>
                <Field c={c} label={t("البريد الإلكتروني لـ PayPal", "PayPal Email")}>
                  <input value={paymentDetails.paypal.email} onChange={(e) => patchPaypal("email", e.target.value)}
                    style={inp(c)} placeholder="paypal@example.com" dir="ltr" type="email" />
                </Field>
                <Field c={c} label={t("رقم الهاتف المرتبط بالحساب (اختياري)", "Phone linked to account (optional)")}>
                  <input value={paymentDetails.paypal.phone} onChange={(e) => patchPaypal("phone", e.target.value)}
                    style={inp(c)} placeholder="+962 7X XXX XXXX" dir="ltr" />
                </Field>
              </motion.div>
            )}

            {activePayment === "zaincash" && (
              <motion.div key="zaincash" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-xl mb-3" style={{ background: c.surface3, border: `1px solid ${c.border}` }}>
                  <span style={{ fontSize: "20px" }}>📱</span>
                  <p style={{ fontSize: "12px", color: c.muted }}>{t("خدمة Zain Cash المحفظة الإلكترونية الأردنية", "Zain Cash – Jordan's electronic wallet service")}</p>
                </div>
                <Field c={c} label={t("رقم هاتف Zain Cash", "Zain Cash Phone Number")}>
                  <div className="relative">
                    <input
                      value={paymentDetails.zaincash.phone}
                      onChange={(e) => patchZain("phone", e.target.value)}
                      style={inp(c)}
                      placeholder="07XX XXX XXX"
                      dir="ltr"
                    />
                    <span className="absolute top-3.5 end-3" style={{ fontSize: "14px" }}>📱</span>
                  </div>
                </Field>
                <Field c={c} label={t("الاسم المسجل في Zain Cash", "Name registered in Zain Cash")}>
                  <input value={paymentDetails.zaincash.name} onChange={(e) => patchZain("name", e.target.value)}
                    style={inp(c)} placeholder={t("اسمك الكامل كما في التطبيق", "Full name as in the app")} />
                </Field>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handlePaymentSave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 w-full py-3 rounded-xl text-white flex items-center justify-center gap-2"
            style={{ background: paymentSaved ? "#16a34a" : "#E5233B", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "14px" }}
          >
            {paymentSaved ? <><CheckCircle className="w-4 h-4" /> {t("تم الحفظ ✓", "Saved ✓")}</> : t("حفظ بيانات الدفع", "Save Payment Details")}
          </motion.button>
        </SettingsSection>

        {/* === DANGER ZONE === */}
        <div className="rounded-2xl p-5" style={{ background: c.surface, border: "1.5px solid #FECACA" }}>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FEF2F2" }}>
              <Shield className="w-5 h-5" style={{ color: "#EF4444" }} />
            </div>
            <h3 style={{ fontWeight: 800, color: "#EF4444", fontSize: "15px", fontFamily: "'Cairo', sans-serif" }}>
              {t("منطقة الخطر", "Danger Zone")}
            </h3>
          </div>
          <p style={{ fontSize: "13px", color: c.muted, marginBottom: "16px" }}>
            {t("حذف الحساب إجراء دائم لا يمكن التراجع عنه.", "Deleting your account is permanent and cannot be undone.")}
          </p>

          <AnimatePresence>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 transition-all"
                style={{ borderColor: "#EF4444", color: "#EF4444", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "13px" }}
              >
                <Trash2 className="w-4 h-4" />
                {t("حذف الحساب", "Delete Account")}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl"
                style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}
              >
                <p style={{ fontWeight: 700, color: "#EF4444", fontSize: "13px", marginBottom: "12px" }}>
                  {t("هل أنت متأكد تمامًا؟", "Are you absolutely sure?")}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 rounded-xl text-white"
                    style={{ background: "#EF4444", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "13px" }}
                  >
                    {t("نعم، احذف حسابي", "Yes, Delete")}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-4 py-2 rounded-xl"
                    style={{ background: c.surface2, border: `1.5px solid ${c.border}`, fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: "13px", color: c.text2 }}
                  >
                    {t("إلغاء", "Cancel")}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}