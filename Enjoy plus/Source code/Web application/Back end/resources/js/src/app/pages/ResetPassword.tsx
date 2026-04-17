import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { authService } from "../../api/auth";
import { motion } from "motion/react";

const inp = (c: any, lang: string): React.CSSProperties => ({
  border: `1.5px solid ${c.border}`,
  background: c.inputBg,
  fontFamily: "'Cairo', sans-serif",
  fontSize: "14px",
  color: c.text,
  borderRadius: "12px",
  padding: "12px 16px",
  width: "100%",
  outline: "none",
  [lang === "ar" ? "paddingLeft" : "paddingRight"]: "44px",
});

export function ResetPassword() {
  const { lang } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string; token?: string };

  // Use URL search params if state is empty (coming from email link)
  const query = new URLSearchParams(location.search);
  const email = state?.email || query.get("email") || "";
  const token = state?.token || query.get("token") || "";

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  useEffect(() => {
    if (!email || !token) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, token, navigate]);

  if (!email || !token) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPass.length < 6) {
      setError(t("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "Password must be at least 6 characters"));
      return;
    }
    if (newPass !== confirmPass) {
      setError(t("كلمة المرور غير متطابقة", "Passwords do not match"));
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email,
        token,
        password: newPass,
        password_confirmation: confirmPass
      });
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 3000);
    } catch (err: any) {
      setError(lang === "ar" ? err.response?.data?.message : err.response?.data?.message_en || t("فشل إعادة تعيين كلمة المرور", "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" dir={lang === "ar" ? "rtl" : "ltr"} style={{ background: c.bg, fontFamily: "'Cairo', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-3xl shadow-xl"
        style={{ background: c.surface, border: `1px solid ${c.border}` }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: c.surface3 }}>
            <Lock className="w-8 h-8" style={{ color: "#E5233B" }} />
          </div>
          <h2 style={{ fontWeight: 800, color: c.text, fontSize: "24px", marginBottom: "8px", fontFamily: "var(--ep-font)" }}>
            {t("تعيين كلمة مرور جديدة", "Set New Password")}
          </h2>
          <p style={{ color: c.muted, fontSize: "14px", fontFamily: "'Cairo', sans-serif" }}>
            {t("قم بإنشاء كلمة مرور قوية لتأمين حسابك", "Create a strong password to secure your account")}
          </p>
        </div>

        {success ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center p-6 rounded-2xl" style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0" }}>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 style={{ color: "#166534", fontWeight: 800, fontSize: "18px", marginBottom: "8px" }}>
              {t("تم إعادة التعيين بنجاح!", "Reset Successful!")}
            </h3>
            <p style={{ color: "#15803D", fontSize: "14px", marginBottom: "16px" }}>
              {t("جاري تحويلك لتسجيل الدخول...", "Redirecting to login...")}
            </p>
            <div className="w-6 h-6 rounded-full border-2 border-green-500 border-t-transparent animate-spin mx-auto" />
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", color: "#EF4444" }}>
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span style={{ fontSize: "13px", fontWeight: 600 }}>{error}</span>
              </div>
            )}

            <div>
              <label className="block mb-1.5" style={{ fontSize: "12px", fontWeight: 600, color: c.text2 }}>
                {t("كلمة المرور الجديدة", "New Password")}
              </label>
              <div className="relative">
                <input
                  type={showPass.new ? "text" : "password"}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  style={inp(c, lang)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => ({ ...p, new: !p.new }))}
                  className={`absolute top-3.5 ${lang === "ar" ? "left-3" : "right-3"}`}
                  style={{ color: c.muted }}
                >
                  {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-1.5" style={{ fontSize: "12px", fontWeight: 600, color: c.text2 }}>
                {t("تأكيد كلمة المرور", "Confirm Password")}
              </label>
              <div className="relative">
                <input
                  type={showPass.confirm ? "text" : "password"}
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  style={inp(c, lang)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => ({ ...p, confirm: !p.confirm }))}
                  className={`absolute top-3.5 ${lang === "ar" ? "left-3" : "right-3"}`}
                  style={{ color: c.muted }}
                >
                  {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 py-3.5 rounded-xl text-white flex items-center justify-center gap-2"
              style={{ background: loading ? "#FFB3BF" : "#E5233B", fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "15px" }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                t("احفظ التغييرات", "Save Changes")
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
