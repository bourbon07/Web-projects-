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
} from "lucide-react";
import { useApp, useEPTheme } from "../../context/AppContext";

const NAV_ITEMS = [
  { path: "/admin", icon: LayoutDashboard, label: "لوحة الإحصائيات", labelEn: "Dashboard" },
  { path: "/admin/products", icon: Package, label: "إدارة المنتجات", labelEn: "Products" },
  { path: "/admin/categories", icon: Grid3X3, label: "إدارة الفئات", labelEn: "Categories" },
  { path: "/admin/packages", icon: ShoppingBag, label: "إدارة الباقات", labelEn: "Packages" },
  { path: "/admin/orders", icon: ClipboardList, label: "إدارة الطلبات", labelEn: "Orders" },
  { path: "/admin/users", icon: Users, label: "إدارة المستخدمين", labelEn: "Users" },
  { path: "/admin/reviews", icon: MessageSquare, label: "التعليقات والتقييمات", labelEn: "Reviews" },
];

export function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isLoggedIn, currentUser } = useApp();
  const c = useEPTheme();

  // Redirect if not admin
  if (!isLoggedIn || !currentUser?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ fontFamily: "'Cairo', sans-serif", background: "#FAFAFA" }} dir="rtl">
        <div className="text-center p-8 rounded-2xl" style={{ background: "white", border: "1.5px solid #FFDDE4", maxWidth: "400px" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FFF0F3" }}>
            <ShieldAlert className="w-10 h-10" style={{ color: "#E5233B" }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "20px", color: "#1a1a1a", marginBottom: "8px" }}>غير مصرح بالدخول</h2>
          <p style={{ color: "#888", fontSize: "14px", marginBottom: "20px" }}>
            يجب تسجيل الدخول كمدير للوصول للوحة التحكم.
          </p>
          <p style={{ color: "#BBB", fontSize: "12px", marginBottom: "20px" }}>
            للدخول كأدمين: admin@enjoyplus.com
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white"
            style={{ background: "#E5233B", fontWeight: 700 }}
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: c.bg, fontFamily: "'Cairo', sans-serif" }} dir="rtl">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} shrink-0 transition-all duration-300 relative`}
        style={{ background: c.surface, borderLeft: `2px solid ${c.border}`, minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: c.border }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#E5233B" }}>
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <p style={{ fontWeight: 800, color: "#E5233B", fontSize: "15px" }}>Enjoy Plus</p>
              <p style={{ fontSize: "10px", color: "#FF6B8A" }}>لوحة التحكم</p>
            </div>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -left-3 top-16 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10"
          style={{ background: "#E5233B" }}
        >
          {sidebarOpen ? (
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-white rotate-180" />
          )}
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
                    {item.label}
                  </span>
                )}
                {isActive && sidebarOpen && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full" style={{ background: "#E5233B" }} />
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
              className="flex items-center gap-2 px-3 py-2 rounded-xl w-full text-left transition"
              style={{ color: "#E5233B", fontSize: "13px", fontWeight: 600, background: "transparent" }}
            >
              <LogOut className="w-4 h-4" />
              العودة للمتجر
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: c.surface, borderBottom: `1.5px solid ${c.border}` }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" style={{ color: "#E5233B" }} />
            </button>
            <h2 style={{ fontWeight: 700, color: c.text, fontSize: "16px" }}>
              {NAV_ITEMS.find((n) => n.path === location.pathname)?.label || "لوحة التحكم"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: c.surface2 }}>
              <Users className="w-4 h-4" style={{ color: "#E5233B" }} />
            </div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>مدير النظام</span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}