import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, ChefHat, Mail, Lock, User, Calendar, Users, ArrowRight, UserCheck } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { CustomSelect } from "../components/ui/CustomSelect";
import { motion } from "motion/react";

export function Login() {
  const { lang, setIsLoggedIn, setCurrentUser } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (mode === "register" && !form.name.trim()) newErrors.name = t("الاسم مطلوب", "Name is required");
    if (!form.email.includes("@")) newErrors.email = t("بريد إلكتروني غير صالح", "Invalid email");
    if (form.password.length < 6) newErrors.password = t("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "Password must be at least 6 characters");
    if (mode === "register" && !form.age) newErrors.age = t("العمر مطلوب", "Age is required");
    if (mode === "register" && !form.gender) newErrors.gender = t("الجنس مطلوب", "Gender is required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      // Check if admin (demo: admin@enjoyplus.com)
      const isAdmin = form.email === "admin@enjoyplus.com";
      setIsLoggedIn(true);
      setCurrentUser({
        name: form.name || "مستخدم",
        email: form.email,
        isAdmin,
        age: form.age,
        gender: form.gender,
      });
      setLoading(false);
      navigate("/");
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setCurrentUser({ name: "مستخدم Google", email: "user@gmail.com", isAdmin: false });
      setLoading(false);
      navigate("/");
    }, 1200);
  };

  const handleGuestContinue = () => {
    navigate("/checkout/guest");
  };

  const inputBase = "w-full px-4 py-3 rounded-xl outline-none transition-all";
  const inputStyle = {
    border: `1.5px solid ${c.border}`,
    background: c.inputBg,
    fontFamily: "'Cairo', sans-serif",
    fontSize: "14px",
    color: c.text,
  };

  return (
    <div
      className="min-h-screen flex"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}
    >
      {/* Left/Right Decorative Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #E5233B 0%, #FF6B8A 60%, #FFDDE4 100%)" }}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 80 + 20}px`,
                height: `${Math.random() * 80 + 20}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: "white",
              }}
            />
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
            <ChefHat className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-white mb-2" style={{ fontWeight: 900, fontSize: "36px" }}>Enjoy Plus</h1>
          <p className="text-white/80 mb-2" style={{ fontSize: "14px" }}>🇯🇴 {t("متجر الحلويات الأول في الأردن", "Jordan's #1 Pastry & Baking Store")}</p>
          <p className="text-white/70 mb-8" style={{ fontSize: "13px" }}>
            {t("العملة: دينار أردني (JOD)", "Currency: Jordanian Dinar (JOD)")}
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {[
              { icon: "🎂", text: t("أدوات التزيين", "Decoration Tools") },
              { icon: "🍞", text: t("معدات الخبيز", "Baking Equipment") },
              { icon: "🧁", text: t("قوالب متنوعة", "Various Molds") },
              { icon: "✨", text: t("جودة عالية", "High Quality") },
            ].map((f) => (
              <div key={f.text} className="px-4 py-3 rounded-xl bg-white/20 text-center">
                <span className="text-2xl">{f.icon}</span>
                <p className="text-white mt-1" style={{ fontSize: "12px", fontWeight: 600 }}>{f.text}</p>
              </div>
            ))}
          </div>

          {/* Admin hint */}
          <div className="mt-8 px-4 py-3 rounded-xl bg-white/10 text-white/70 text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>
            {t("للدخول كأدمين: admin@enjoyplus.com", "Admin login: admin@enjoyplus.com")}
          </div>
        </motion.div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto" style={{ background: c.bg }}>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#E5233B" }}>
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span style={{ fontWeight: 800, color: "#E5233B", fontSize: "22px" }}>Enjoy Plus</span>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-2xl p-1 mb-6" style={{ background: "#FFF0F3" }}>
            {[
              { key: "login", label: t("تسجيل الدخول", "Login") },
              { key: "register", label: t("إنشاء حساب", "Register") },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setMode(m.key as "login" | "register")}
                className="flex-1 py-2.5 rounded-xl transition-all"
                style={{
                  background: mode === m.key ? "#E5233B" : "transparent",
                  color: mode === m.key ? "white" : "#888",
                  fontWeight: 700,
                  fontSize: "14px",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          <h2 className="mb-5" style={{ fontWeight: 800, color: "#1a1a1a", fontSize: "22px" }}>
            {mode === "login" ? t("أهلاً بعودتك! 👋", "Welcome Back! 👋") : t("انضم لعائلة Enjoy Plus 🎉", "Join Enjoy Plus Family 🎉")}
          </h2>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-3 mb-4 transition-all hover:shadow-md"
            style={{ border: "1.5px solid #FFDDE4", background: "white" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: "14px", color: "#333" }}>
              {t("الدخول بحساب Google", "Continue with Google")}
            </span>
          </button>

          {/* Guest Button */}
          <button
            onClick={handleGuestContinue}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-3 mb-5 transition-all hover:shadow-md"
            style={{ border: "1.5px solid #FFDDE4", background: "#FFF8FA" }}
          >
            <UserCheck className="w-5 h-5" style={{ color: "#FF6B8A" }} />
            <span style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 600, fontSize: "14px", color: "#555" }}>
              {t("المتابعة كزائر", "Continue as Guest")}
            </span>
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "#FFDDE4" }} />
            <span style={{ color: "#BBB", fontSize: "13px" }}>{t("أو", "or")}</span>
            <div className="flex-1 h-px" style={{ background: "#FFDDE4" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>
                  {t("الاسم الكامل", "Full Name")}
                </label>
                <div className="relative">
                  <User className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputBase}
                    style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "36px" }}
                    placeholder={t("أدخل اسمك الكامل", "Enter your full name")}
                  />
                </div>
                {errors.name && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>
                {t("البريد الإلكتروني", "Email Address")}
              </label>
              <div className="relative">
                <Mail className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputBase}
                  style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "36px" }}
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.email}</p>}
            </div>

            <div>
              <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>
                {t("كلمة المرور", "Password")}
              </label>
              <div className="relative">
                <Lock className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputBase}
                  style={{
                    ...inputStyle,
                    [lang === "ar" ? "paddingRight" : "paddingLeft"]: "36px",
                    [lang === "ar" ? "paddingLeft" : "paddingRight"]: "40px",
                  }}
                  placeholder={t("أدخل كلمة المرور", "Enter your password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className={`absolute top-3.5 ${lang === "ar" ? "left-3" : "right-3"}`}
                  style={{ color: "#BBB" }}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p style={{ color: "#E5233B", fontSize: "12px", marginTop: "4px" }}>{errors.password}</p>}
            </div>

            {mode === "register" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>
                    {t("العمر", "Age")}
                  </label>
                  <div className="relative">
                    <Calendar className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      className={inputBase}
                      style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "36px" }}
                      placeholder={t("عمرك", "Your age")}
                      min={13}
                      max={100}
                    />
                  </div>
                  {errors.age && <p style={{ color: "#E5233B", fontSize: "11px", marginTop: "4px" }}>{errors.age}</p>}
                </div>
                <div>
                  <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 600, color: c.text2 }}>
                    {t("الجنس", "Gender")}
                  </label>
                  <CustomSelect
                    value={form.gender}
                    onChange={(v) => setForm({ ...form, gender: v })}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    placeholder={t("اختر الجنس", "Select Gender")}
                    options={[
                      { value: "ذكر", label: t("ذكر", "Male"), icon: "👨" },
                      { value: "أنثى", label: t("أنثى", "Female"), icon: "👩" },
                    ]}
                    icon={<Users className="w-4 h-4" style={{ color: "#E5233B" }} />}
                  />
                  {errors.gender && <p style={{ color: "#E5233B", fontSize: "11px", marginTop: "4px" }}>{errors.gender}</p>}
                </div>
              </div>
            )}

            {mode === "login" && (
              <div className={lang === "ar" ? "text-left" : "text-right"}>
                <a href="#" style={{ color: "#E5233B", fontSize: "13px" }}>
                  {t("نسيت كلمة المرور؟", "Forgot Password?")}
                </a>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: loading ? "#FFB3BF" : "#E5233B", fontWeight: 700, fontSize: "15px", fontFamily: "'Cairo', sans-serif" }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  {mode === "login" ? t("تسجيل الدخول", "Login") : t("إنشاء الحساب", "Create Account")}
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center mt-5" style={{ fontSize: "13px", color: "#888" }}>
            {mode === "login" ? t("ليس لديك حساب؟", "Don't have an account?") : t("لديك حساب بالفعل؟", "Already have an account?")}
            {" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{ color: "#E5233B", fontWeight: 700, fontFamily: "'Cairo', sans-serif" }}
            >
              {mode === "login" ? t("إنشاء حساب جديد", "Create Account") : t("تسجيل الدخول", "Login")}
            </button>
          </p>

          <p className="text-center mt-3" style={{ fontSize: "12px", color: "#BBB" }}>
            {t("بالمتابعة، أنت توافق على", "By continuing, you agree to our")}{" "}
            <a href="#" style={{ color: "#E5233B" }}>{t("الشروط والأحكام", "Terms & Conditions")}</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}