import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import {
  ChefHat,
  LayoutDashboard,
  Package,
  Grid3X3,
  ShoppingBag,
  ClipboardList,
  Users,
  MessageSquare,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Settings as SettingsIcon,
} from "lucide-react";
import { useApp, useEPTheme } from "../../context/AppContext";
import { Header } from "../../components/Header";

const NAV_ITEMS = [
  { path: "/admin", icon: LayoutDashboard, label: "لوحة الإحصائيات", labelEn: "Dashboard" },
  { path: "/admin/products", icon: Package, label: "إدارة المنتجات", labelEn: "Products" },
  { path: "/admin/categories", icon: Grid3X3, label: "إدارة الفئات", labelEn: "Categories" },
  { path: "/admin/packages", icon: ShoppingBag, label: "إدارة الباقات", labelEn: "Packages" },
  { path: "/admin/brands", icon: ShieldAlert, label: "إدارة العلامات", labelEn: "Brands" },
  { path: "/admin/orders", icon: ClipboardList, label: "إدارة الطلبات", labelEn: "Orders" },
  { path: "/admin/users", icon: Users, label: "إدارة المستخدمين", labelEn: "Users" },
  { path: "/admin/reviews", icon: MessageSquare, label: "التعليقات والتقييمات", labelEn: "Reviews" },
  { path: "/admin/settings", icon: SettingsIcon, label: "إعدادات المتجر", labelEn: "Settings" },
];

export function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { lang, isLoggedIn, currentUser } = useApp();
  const c = useEPTheme();
  
  const isRTL = lang === "ar";
  const t = (ar: string, en: string) => (isRTL ? ar : en);

  // Redirect if not admin
  if (!isLoggedIn || !currentUser?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }} dir={isRTL ? "rtl" : "ltr"}>
        <div className="text-center p-10 rounded-3xl shadow-xl w-full max-w-sm" style={{ background: c.surface, border: `2px solid ${c.border}` }}>
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: c.surface3 }}>
            <ShieldAlert className="w-12 h-12" style={{ color: "#E5233B" }} />
          </div>
          <h2 style={{ fontWeight: 900, fontSize: "22px", color: c.text, marginBottom: "12px" }}>
            {t("غير مصرح بالدخول", "Access Denied")}
          </h2>
          <p style={{ color: c.text2, fontSize: "15px", marginBottom: "28px", lineHeight: 1.6 }}>
            {t("يجب تسجيل الدخول كمدير للوصول للوحة التحكم.", "You must be logged in as an admin to access the dashboard.")}
          </p>
          <div className="p-4 rounded-xl mb-6" style={{ background: c.surface2, border: `1px solid ${c.border}` }}>
             <p style={{ color: c.muted, fontSize: "13px" }}>
                {t("للدخول كأدمين:", "Admin access:")} <span style={{ color: "#E5233B", fontWeight: 700 }}>admin@enjoyplus.com</span>
             </p>
          </div>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-2xl text-white transition-transform active:scale-95"
            style={{ background: "#E5233B", fontWeight: 800, fontSize: "16px", boxShadow: "0 10px 15px -3px rgba(229, 35, 59, 0.2)" }}
          >
            {t("تسجيل الدخول", "Login")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: c.bg, fontFamily: "'Cairo', sans-serif" }} dir={isRTL ? "rtl" : "ltr"}>
      <Header />
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${sidebarOpen ? "w-64" : "w-16"} shrink-0 transition-all duration-300 relative shadow-lg z-20`}
          style={{ 
            background: c.surface, 
            [isRTL ? "borderLeft" : "borderRight"]: `2px solid ${c.border}`, 
            height: "calc(100vh - 72px)" 
          }}
        >
          {/* Dashboard Header */}
          <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: c.border }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.surface3 }}>
              <LayoutDashboard className="w-4 h-4" style={{ color: "#E5233B" }} />
            </div>
            {sidebarOpen && (
              <div>
                <p style={{ fontWeight: 800, color: c.text, fontSize: "14px" }}>
                  {t("نظام الإدارة", "Admin System")}
                </p>
                <p style={{ fontSize: "9px", color: c.muted }}>
                  {t("لوحة التحكم الرئيسية", "Main Dashboard")}
                </p>
              </div>
            )}
          </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-16 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10"
          style={{ 
            background: "#E5233B",
            [isRTL ? "left" : "right"]: "-12px"
          }}
        >
          <ChevronRight className={`w-3.5 h-3.5 text-white transition-transform ${sidebarOpen ? (isRTL ? "" : "rotate-180") : (isRTL ? "rotate-180" : "")}`} />
        </button>

        {/* Nav */}
        <nav className="p-3 space-y-1 mt-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                style={{
                  background: isActive ? c.surface2 : "transparent",
                  color: isActive ? "#E5233B" : c.text2,
                }}
              >
                <Icon
                  className="w-4.5 h-4.5 shrink-0"
                  style={{ color: isActive ? "#E5233B" : c.muted, width: "18px", height: "18px" }}
                />
                {sidebarOpen && (
                  <span style={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? "#E5233B" : c.text }}>
                    {t(item.label, item.labelEn)}
                  </span>
                )}
                {isActive && sidebarOpen && (
                  <div className={`${isRTL ? "mr-auto" : "ml-auto"} w-1.5 h-1.5 rounded-full`} style={{ background: "#E5233B" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: c.border }}>
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-xl w-full transition ${isRTL ? "text-right" : "text-left"}`}
              style={{ color: "#E5233B", fontSize: "13px", fontWeight: 600, background: "transparent" }}
            >
              <LogOut className={`w-4 h-4 ${isRTL ? "" : "rotate-180"}`} />
              {t("العودة للمتجر", "Back to Store")}
            </Link>
          </div>
        )}
      </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Content Header (Sub-bar) */}
          <div
             className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 shadow-sm transition-all"
             style={{ background: c.surface, borderBottom: `1.5px solid ${c.border}`, opacity: 0.98, backdropFilter: 'blur(8px)' }}
          >
            <div className="flex items-center gap-3">
              <button
                className={`p-2 rounded-lg hover:bg-opacity-10 transition-colors lg:hidden`}
                style={{ background: c.surface3 }}
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" style={{ color: "#E5233B" }} />
              </button>
              <div className="flex items-center gap-2 text-xs" style={{ color: c.muted }}>
                 <span>{t("الرئيسية", "Home")}</span>
                 <ChevronRight className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
                 <span style={{ color: "#E5233B", fontWeight: 700 }}>
                    {(() => {
                      const item = NAV_ITEMS.find((n) => n.path === location.pathname);
                      return item ? t(item.label, item.labelEn) : t("لوحة التحكم", "Dashboard");
                    })()}
                 </span>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}