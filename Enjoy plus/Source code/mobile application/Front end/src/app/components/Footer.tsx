import { ChefHat, Phone, Mail, MapPin } from "lucide-react";
import { useApp } from "../context/AppContext";

export function Footer() {
  const { lang } = useApp();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  return (
    <footer
      className="mt-16"
      style={{ background: "linear-gradient(135deg, #E5233B 0%, #C41C30 100%)", direction: lang === "ar" ? "rtl" : "ltr" }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <div>
                <p style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 800, color: "white", fontSize: "22px" }}>Enjoy Plus</p>
                <p style={{ fontFamily: "'Cairo', sans-serif", color: "rgba(255,255,255,0.7)", fontSize: "12px" }}>
                  {t("متجر الحلويات والخبيز", "Pastry & Baking Supplies")}
                </p>
              </div>
            </div>
            <p style={{ fontFamily: "'Cairo', sans-serif", color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: 1.8 }}>
              {t(
                "متجرك الأول في عالم الحلويات والخبيز. نقدم أفضل الأدوات والمعدات من أشهر الماركات العالمية بأسعار تنافسية.",
                "Your premier destination for pastry and baking supplies. We offer the best tools from top global brands at competitive prices."
              )}
            </p>

            {/* Social Links */}
            <div className="flex gap-3 mt-5">
              <a
                href="https://wa.me/201234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "#25D366" }}
              >
                <svg className="w-5 h-5 text-white fill-white" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.852L.057 23.886a.75.75 0 0 0 .959.96l6.126-1.485A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.523-5.205-1.431l-.373-.226-3.874.938.955-3.794-.244-.391A9.969 9.969 0 0 1 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/enjoyplus"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://facebook.com/enjoyplus"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: "#1877F2" }}
              >
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-white" style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "16px" }}>
              {t("روابط سريعة", "Quick Links")}
            </h4>
            <ul className="space-y-2">
              {[
                t("الصفحة الرئيسية", "Home"),
                t("المنتجات", "Products"),
                t("الباقات المجمعة", "Bundle Packages"),
                t("طلباتي", "My Orders"),
                t("المفضلة", "Wishlist"),
              ].map((link) => (
                <li key={link}>
                  <a href="#" className="flex items-center gap-2 transition-all hover:opacity-70"
                    style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'Cairo', sans-serif", fontSize: "14px" }}>
                    <span style={{ color: "#FFDDE4" }}>›</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-white" style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700, fontSize: "16px" }}>
              {t("تواصل معنا", "Contact Us")}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" style={{ color: "#FFDDE4" }} />
                <span style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'Cairo', sans-serif", fontSize: "13px" }}>
                  +20 123 456 7890
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" style={{ color: "#FFDDE4" }} />
                <span style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'Cairo', sans-serif", fontSize: "13px" }}>
                  info@enjoyplus.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#FFDDE4" }} />
                <span style={{ color: "rgba(255,255,255,0.8)", fontFamily: "'Cairo', sans-serif", fontSize: "13px" }}>
                  {t("عمّان، الأردن", "Amman, Jordan")}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Cairo', sans-serif", fontSize: "13px" }}>
            © 2024 Enjoy Plus. {t("جميع الحقوق محفوظة | الأردن", "All rights reserved | Jordan")}
          </p>
          <div className="flex gap-4">
            {[t("سياسة الخصوصية", "Privacy Policy"), t("الشروط والأحكام", "Terms & Conditions")].map((link) => (
              <a key={link} href="#" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "'Cairo', sans-serif", fontSize: "12px" }} className="hover:text-white transition">
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}