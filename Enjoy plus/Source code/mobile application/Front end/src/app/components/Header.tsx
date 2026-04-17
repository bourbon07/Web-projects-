import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ShoppingCart, Heart, Search, ChefHat, Menu, X, Globe, User, LogOut, Settings, ClipboardList, ShieldCheck } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { CartOverlay } from "./CartOverlay";
import { motion, AnimatePresence } from "motion/react";

export function Header() {
  const {
    lang, setLang, cartCount, wishlistCount, isLoggedIn,
    setIsLoggedIn, currentUser, setCurrentUser, cartOpen, setCartOpen
  } = useApp();
  const c = useEPTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const isRTL = lang === "ar";

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const avatarLetter = currentUser?.name?.charAt(0).toUpperCase() || "U";

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full shadow-sm"
        style={{ background: c.headerBg, borderBottom: `2px solid ${c.border}` }}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)" }}
              >
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="leading-none" style={{ fontSize: "17px", fontWeight: 800, color: "#E5233B", fontFamily: "'Cairo', sans-serif" }}>
                  Enjoy Plus
                </p>
                <p className="leading-none" style={{ fontSize: "10px", color: "#FF6B8A", fontFamily: "'Cairo', sans-serif" }}>
                  {t("متجر الحلويات", "Pastry Store")}
                </p>
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative max-w-xl mx-auto hidden md:block">
              <div className="flex items-center rounded-full border-2 overflow-hidden" style={{ borderColor: c.border, background: c.surface2 }}>
                <input
                  type="text"
                  placeholder={t("ابحث عن منتجات الحلويات والخبيز...", "Search pastry & baking products...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-transparent outline-none"
                  style={{ fontFamily: "'Cairo', sans-serif", fontSize: "14px", color: c.text }}
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 flex items-center justify-center"
                  style={{ background: "#E5233B" }}
                >
                  <Search className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2.5">
              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                style={{ borderColor: c.border, color: "#E5233B", background: c.surface }}
              >
                <Globe className="w-4 h-4" />
                <span style={{ fontSize: "13px", fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}>
                  {lang === "ar" ? "EN" : "عر"}
                </span>
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2 rounded-full transition-all hover:scale-110" style={{ background: c.surface3 }}>
                <Heart className="w-5 h-5" style={{ color: "#E5233B" }} />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center"
                    style={{ background: "#E5233B", fontSize: "10px", fontWeight: 700 }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="relative p-2 rounded-full transition-all hover:scale-110"
                style={{ background: cartOpen ? "#E5233B" : c.surface3 }}
              >
                <ShoppingCart className="w-5 h-5" style={{ color: cartOpen ? "white" : "#E5233B" }} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white flex items-center justify-center"
                    style={{ background: cartOpen ? "#FF6B8A" : "#E5233B", fontSize: "10px", fontWeight: 700 }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              {isLoggedIn && currentUser ? (
                <div className="relative hidden md:block" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-full transition-all hover:scale-105"
                    style={{ background: c.surface3, border: `1.5px solid ${c.border}` }}
                  >
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)", fontSize: "12px", fontWeight: 700 }}
                      >
                        {avatarLetter}
                      </div>
                    )}
                    <span style={{ fontSize: "13px", color: "#E5233B", fontFamily: "'Cairo', sans-serif", fontWeight: 600 }}>
                      {currentUser.name.split(" ")[0]}
                    </span>
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute mt-2 w-48 rounded-2xl shadow-xl overflow-hidden z-50"
                        style={{
                          background: c.surface,
                          border: `1.5px solid ${c.border}`,
                          [isRTL ? "right" : "left"]: 0,
                        }}
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        <div className="px-4 py-3" style={{ background: c.surface2, borderBottom: `1px solid ${c.border}` }}>
                          <p style={{ fontWeight: 700, fontSize: "13px", color: c.text, fontFamily: "'Cairo', sans-serif" }}>
                            {currentUser.name}
                          </p>
                          <p style={{ fontSize: "11px", color: c.muted, fontFamily: "'Cairo', sans-serif" }}>{currentUser.email}</p>
                        </div>
                        <div className="p-2 space-y-0.5">
                          {[
                            { to: "/profile", icon: User, label: t("الملف الشخصي", "My Profile") },
                            { to: "/orders", icon: ClipboardList, label: t("طلباتي", "My Orders") },
                            { to: "/settings", icon: Settings, label: t("الإعدادات", "Settings") },
                            ...(currentUser.isAdmin ? [{ to: "/admin", icon: ShieldCheck, label: t("لوحة التحكم", "Admin Panel") }] : []),
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                              style={{ color: c.text2, fontFamily: "'Cairo', sans-serif", fontSize: "13px" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = c.surface3)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              <item.icon className="w-4 h-4" style={{ color: "#E5233B" }} />
                              {item.label}
                            </Link>
                          ))}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                            style={{ color: "#E5233B", fontFamily: "'Cairo', sans-serif", fontSize: "13px" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <LogOut className="w-4 h-4" />
                            {t("تسجيل الخروج", "Logout")}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full text-white transition-all hover:opacity-90"
                  style={{ background: "#E5233B", fontFamily: "'Cairo', sans-serif", fontSize: "13px", fontWeight: 600 }}
                >
                  <User className="w-4 h-4" />
                  {t("دخول", "Login")}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-full"
                style={{ background: c.surface3 }}
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? (
                  <X className="w-5 h-5" style={{ color: "#E5233B" }} />
                ) : (
                  <Menu className="w-5 h-5" style={{ color: "#E5233B" }} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="mt-3 md:hidden">
            <div className="flex items-center rounded-full border-2 overflow-hidden" style={{ borderColor: c.border, background: c.surface2 }}>
              <input
                type="text"
                placeholder={t("ابحث...", "Search...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 bg-transparent outline-none"
                style={{ fontFamily: "'Cairo', sans-serif", fontSize: "14px", color: c.text }}
              />
              <button type="submit" className="px-4 py-2" style={{ background: "#E5233B" }}>
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </form>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden border-t mt-3"
                style={{ borderColor: c.border }}
              >
                <div className="py-3 space-y-1">
                  {isLoggedIn && currentUser && (
                    <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-2xl" style={{ background: c.surface3 }}>
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{ background: "linear-gradient(135deg, #E5233B, #FF6B8A)", fontSize: "14px", fontWeight: 700 }}
                        >
                          {avatarLetter}
                        </div>
                      )}
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "14px", color: c.text, fontFamily: "'Cairo', sans-serif" }}>{currentUser.name}</p>
                        <p style={{ fontSize: "11px", color: c.muted, fontFamily: "'Cairo', sans-serif" }}>{currentUser.email}</p>
                      </div>
                    </div>
                  )}

                  {isLoggedIn && currentUser ? (
                    <>
                      {[
                        { to: "/profile", icon: User, label: t("الملف الشخصي", "My Profile") },
                        { to: "/orders", icon: ClipboardList, label: t("طلباتي", "My Orders") },
                        { to: "/wishlist", icon: Heart, label: t("المفضلة", "Wishlist") },
                        { to: "/settings", icon: Settings, label: t("الإعدادات", "Settings") },
                        ...(currentUser.isAdmin ? [{ to: "/admin", icon: ShieldCheck, label: t("لوحة التحكم", "Admin Panel") }] : []),
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all"
                          style={{ color: c.text2, fontFamily: "'Cairo', sans-serif", fontSize: "14px", fontWeight: 500 }}
                        >
                          <item.icon className="w-4 h-4" style={{ color: "#E5233B" }} />
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mt-1"
                        style={{ color: "#E5233B", fontFamily: "'Cairo', sans-serif", fontSize: "14px", fontWeight: 600, background: c.surface3 }}
                      >
                        <LogOut className="w-4 h-4" />
                        {t("تسجيل الخروج", "Logout")}
                      </button>
                    </>
                  ) : (
                    <>
                      {[
                        { to: "/wishlist", icon: Heart, label: t("المفضلة", "Wishlist") },
                        { to: "/orders", icon: ClipboardList, label: t("الطلبات", "Orders") },
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                          style={{ color: c.text2, fontFamily: "'Cairo', sans-serif", fontSize: "14px" }}
                        >
                          <item.icon className="w-4 h-4" style={{ color: "#E5233B" }} />
                          {item.label}
                        </Link>
                      ))}
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white mt-1"
                        style={{ background: "#E5233B", fontFamily: "'Cairo', sans-serif", fontSize: "14px", fontWeight: 700 }}
                      >
                        <User className="w-4 h-4" />
                        {t("تسجيل الدخول", "Login / Register")}
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      <CartOverlay />
    </>
  );
}