import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Phone, Lock, ArrowLeft, ArrowRight, ShieldAlert } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { authService } from "../../api/auth";
import { motion } from "motion/react";

const getInputStyle = (c: any) => ({
  border: `1.5px solid ${c.border}`,
  background: c.inputBg,
  fontFamily: "'Cairo', sans-serif",
  fontSize: "14px",
  color: c.text,
});

export function ForgotPassword() {
  const { lang } = useApp();
  const c = useEPTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isGoogleMessage, setIsGoogleMessage] = useState(false);
  const [googleText, setGoogleText] = useState("");

  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const inputBase = "w-full px-4 py-3 rounded-xl outline-none transition-all";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t("البريد الإلكتروني مطلوب", "Email is required"));
      return;
    }
    setLoading(true);
    setError("");
    setIsGoogleMessage(false);

    try {
      await authService.forgotPasswordVerify({ email });
      setSuccess(true);
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.status === 'google_managed') {
        setIsGoogleMessage(true);
        setGoogleText(lang === "ar" ? err.response?.data?.message : err.response?.data?.message_en);
      } else {
        setError(lang === "ar" ? err.response?.data?.message : err.response?.data?.message_en || t("حدث خطأ ما.", "Something went wrong."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" dir={lang === "ar" ? "rtl" : "ltr"} style={{ background: c.bg, fontFamily: "'Cairo', sans-serif" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl shadow-xl relative"
        style={{ background: c.surface, border: `1px solid ${c.border}` }}
      >
        <Link to="/login" className="absolute top-6 start-6 p-2 rounded-full transition-all hover:bg-black/5" style={{ color: "#E5233B" }}>
          {lang === "ar" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </Link>

        <div className="text-center mb-8 mt-2">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: c.surface3 }}>
            <Mail className="w-8 h-8" style={{ color: "#E5233B" }} />
          </div>
          <h2 style={{ fontWeight: 800, color: c.text, fontSize: "24px", marginBottom: "8px" }}>
            {t("استعادة كلمة المرور", "Reset Password")}
          </h2>
          <p style={{ color: c.muted, fontSize: "14px" }}>
            {success 
              ? t("لقد أرسلنا رابط الاستعادة إلى بريدك الإلكتروني.", "We've sent a reset link to your email.")
              : t("أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة حسابك.", "Enter your email and we'll send you a link to recover your account.")
            }
          </p>
        </div>

        {isGoogleMessage ? (
          <div className="text-center">
            <div className="p-4 rounded-xl mb-6" style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE" }}>
              <ShieldAlert className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p style={{ color: "#1E3A8A", fontSize: "14px", fontWeight: 700 }}>
                {googleText}
              </p>
            </div>
            <Link to="/login" className="w-full block py-3 rounded-xl text-white font-bold" style={{ background: "#E5233B" }}>
              {t("العودة لتسجيل الدخول", "Return to Login")}
            </Link>
          </div>
        ) : success ? (
          <div className="text-center space-y-4">
             <div className="p-4 rounded-xl" style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", color: "#166534" }}>
                <p style={{ fontSize: "14px", fontWeight: 600 }}>
                  {t("تفقد صندوق الوارد الخاص بك (والبريد العشوائي أيضاً).", "Check your inbox (and spam folder too).")}
                </p>
             </div>
             <Link to="/login" className="w-full block py-3 rounded-xl text-white font-bold" style={{ background: "#E5233B" }}>
              {t("العودة لتسجيل الدخول", "Back to Login")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-500 text-sm text-center border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block mb-1.5" style={{ fontSize: "13px", fontWeight: 600, color: c.text2 }}>
                {t("البريد الإلكتروني", "Email Address")} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className={`absolute top-3.5 ${lang === "ar" ? "right-3" : "left-3"} w-4 h-4`} style={{ color: "#E5233B" }} />
                <input
                  type="email"
                  required
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputBase}
                  style={{ ...getInputStyle(c), [lang === "ar" ? "paddingRight" : "paddingLeft"]: "36px" }}
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 mt-2 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: loading ? "#FFB3BF" : "#E5233B", fontWeight: 700, fontSize: "15px" }}
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                t("إرسال رابط الاستعادة", "Send Reset Link")
              )}
            </motion.button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
