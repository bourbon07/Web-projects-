import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { User, Camera, Save, ArrowLeft, Mail, Phone, Calendar, Users, CheckCircle, Edit3 } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { motion } from "motion/react";

export function Profile() {
  const { lang, currentUser, setCurrentUser, isLoggedIn } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    avatarUrl: currentUser?.avatar || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarMode, setAvatarMode] = useState<"url" | "upload">("url");
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="text-center">
          <p style={{ color: "#888", fontFamily: "'Cairo', sans-serif" }}>
            {t("يجب تسجيل الدخول للوصول للملف الشخصي", "Please login to access your profile")}
          </p>
          <Link to="/login" className="mt-4 inline-block px-6 py-2.5 rounded-xl text-white" style={{ background: "#E5233B", fontFamily: "'Cairo', sans-serif" }}>
            {t("تسجيل الدخول", "Login")}
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setCurrentUser({
        ...currentUser,
        name: form.name,
        email: form.email,
        phone: form.phone,
        avatar: form.avatarUrl || undefined,
      });
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm({ ...form, avatarUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const avatarLetter = form.name.charAt(0).toUpperCase() || "U";

  const inputStyle = {
    border: `1.5px solid ${c.border}`,
    background: c.inputBg,
    fontFamily: "'Cairo', sans-serif",
    fontSize: "14px",
    color: c.text,
    borderRadius: "14px",
    padding: "12px 16px",
    width: "100%",
    outline: "none",
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
          <Link to="/" className="p-2 rounded-full" style={{ background: c.surface3 }}>
            <ArrowLeft className="w-5 h-5" style={{ color: "#E5233B" }} />
          </Link>
          <h1 style={{ fontWeight: 800, fontSize: "22px", color: c.text }}>
            {t("الملف الشخصي", "My Profile")}
          </h1>
        </div>

        {/* Avatar + Info Card */}
        <div className="rounded-2xl p-6 mb-5 text-center" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          <div className="relative inline-block mb-4">
            {form.avatarUrl ? (
              <img
                src={form.avatarUrl}
                alt={form.name}
                className="w-28 h-28 rounded-full object-cover mx-auto"
                style={{ border: "4px solid #FFDDE4" }}
                onError={() => setForm({ ...form, avatarUrl: "" })}
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center mx-auto"
                style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)", border: "4px solid #FFDDE4", fontSize: "40px", fontWeight: 700, color: "white" }}
              >
                {avatarLetter}
              </div>
            )}
            <button
              onClick={() => { if (avatarMode === "upload") fileRef.current?.click(); }}
              className="absolute bottom-1 end-1 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: "#E5233B" }}
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          <p style={{ fontWeight: 700, fontSize: "18px", color: c.text }}>{form.name}</p>
          <p style={{ color: c.muted, fontSize: "13px" }}>{form.email}</p>

          {/* Avatar Input Method Toggle */}
          <div className="flex justify-center gap-2 mt-4">
            {[
              { key: "url", label: t("رابط الصورة", "Image URL") },
              { key: "upload", label: t("رفع من الجهاز", "Upload File") },
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => setAvatarMode(mode.key as "url" | "upload")}
                className="px-3 py-1.5 rounded-full text-xs transition-all"
                style={{
                  background: avatarMode === mode.key ? "#E5233B" : "#FFF0F3",
                  color: avatarMode === mode.key ? "white" : "#E5233B",
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 600,
                  border: "1px solid #FFDDE4",
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {avatarMode === "url" ? (
            <div className="mt-3">
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                style={{ ...inputStyle, textAlign: "left" }}
                placeholder={t("أدخل رابط الصورة (Cloudinary, URL...)", "Enter image URL (Cloudinary, URL...)")}
                dir="ltr"
              />
              <p style={{ fontSize: "11px", color: "#BBB", marginTop: "4px" }}>
                {t("يدعم روابط Cloudinary والروابط المباشرة للصور", "Supports Cloudinary and direct image URLs")}
              </p>
            </div>
          ) : (
            <div className="mt-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => fileRef.current?.click()}
                className="px-5 py-2.5 rounded-xl border-2 border-dashed transition-all hover:bg-pink-50"
                style={{ borderColor: "#FFDDE4", color: "#E5233B", fontFamily: "'Cairo', sans-serif", fontSize: "13px", fontWeight: 600 }}
              >
                📁 {t("اختر صورة من جهازك", "Choose image from device")}
              </button>
              <p style={{ fontSize: "11px", color: "#BBB", marginTop: "4px" }}>
                {t("PNG, JPG, GIF حتى 5MB", "PNG, JPG, GIF up to 5MB")}
              </p>
            </div>
          )}
        </div>

        {/* Edit Form */}
        <div className="rounded-2xl p-6 mb-5 space-y-4" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          <h3 style={{ fontWeight: 800, color: c.text, fontSize: "16px" }}>
            {t("تعديل البيانات", "Edit Information")}
          </h3>

          <div>
            <label className="block mb-1.5 text-sm" style={{ fontWeight: 600, color: c.text2 }}>
              {t("الاسم الكامل", "Full Name")}
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
          </div>

          <div>
            <label className="block mb-1.5 text-sm" style={{ fontWeight: 600, color: c.text2 }}>
              {t("البريد الإلكتروني", "Email Address")}
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
          </div>

          <div>
            <label className="block mb-1.5 text-sm" style={{ fontWeight: 600, color: c.text2 }}>
              {t("رقم الهاتف", "Phone Number")}
            </label>
            <div className="relative">
              <Phone className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={{ ...inputStyle, [lang === "ar" ? "paddingRight" : "paddingLeft"]: "36px" }}
                placeholder="07X XXX XXXX"
                dir="ltr"
              />
            </div>
          </div>

          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
            style={{ background: saved ? "#16a34a" : saving ? "#FFB3BF" : "#E5233B", fontWeight: 700, fontSize: "15px", fontFamily: "'Cairo', sans-serif" }}
          >
            {saving ? (
              <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                {t("تم الحفظ ✓", "Saved ✓")}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t("حفظ التغييرات", "Save Changes")}
              </>
            )}
          </motion.button>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/orders"
            className="p-4 rounded-2xl flex items-center gap-3 transition-all hover:shadow-md"
            style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.surface3 }}>
              <span style={{ fontSize: "20px" }}>📦</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: "13px", color: c.text, fontFamily: "'Cairo', sans-serif" }}>
              {t("طلباتي", "My Orders")}
            </span>
          </Link>
          <Link
            to="/settings"
            className="p-4 rounded-2xl flex items-center gap-3 transition-all hover:shadow-md"
            style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.surface3 }}>
              <span style={{ fontSize: "20px" }}>⚙️</span>
            </div>
            <span style={{ fontWeight: 600, fontSize: "13px", color: c.text, fontFamily: "'Cairo', sans-serif" }}>
              {t("الإعدادات", "Settings")}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}