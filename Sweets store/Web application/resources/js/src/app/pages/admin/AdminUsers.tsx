import { useState, useEffect } from "react";
import { Ban, CheckCircle, Search, Users, Shield, Loader2, Calendar } from "lucide-react";
import { adminService } from "../../../api/admin";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useEPTheme } from "../../context/AppContext";

export function AdminUsers() {
  const { lang } = useApp();
  const c = useEPTheme();
  
  const isRTL = lang === "ar";
  const t = (ar: string, en: string) => (isRTL ? ar : en);

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "banned">("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Fetch users failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = users.filter((u) => {
    const status = u.is_banned ? "banned" : "active";
    const matchFilter = filter === "all" || status === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                      u.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleToggleBan = async (id: number) => {
    try {
      await adminService.toggleUserBan(id);
      fetchData();
    } catch (err: any) {
        alert(err.response?.data?.message || "Failed to toggle ban");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20" style={{ color: c.text }}>
        <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: "#E5233B" }} />
        <p style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>{t("جاري تحميل المستخدمين...", "Loading users...")}</p>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", color: c.text }}>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { labelAr: "إجمالي المستخدمين", labelEn: "Total Users", value: users.length, icon: Users, color: "#E5233B", bg: "#FFF0F3" },
          { labelAr: "المستخدمون النشطون", labelEn: "Active Users", value: users.filter((u) => !u.is_banned).length, icon: CheckCircle, color: "#10B981", bg: "#ECFDF5" },
          { labelAr: "المحظورون", labelEn: "Banned Users", value: users.filter((u) => u.is_banned).length, icon: Ban, color: "#EF4444", bg: "#FEF2F2" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.labelAr} className="p-4 rounded-2xl shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.dark ? "rgba(229, 35, 59, 0.1)" : s.bg }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: s.color, width: "18px", height: "18px" }} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: "20px", color: c.text }}>{s.value}</p>
                  <p style={{ fontSize: "11px", color: c.muted }}>{t(s.labelAr, s.labelEn)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { key: "all", label: t("الكل", "All") },
            { key: "active", label: t("نشط", "Active") },
            { key: "banned", label: t("محظور", "Banned") },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as "all" | "active" | "banned")}
              className="px-4 py-2 rounded-xl transition-all shadow-sm"
              style={{
                background: filter === tab.key ? "#E5233B" : c.surface,
                color: filter === tab.key ? "white" : c.text,
                border: `1.5px solid ${filter === tab.key ? "#E5233B" : c.border}`,
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {tab.label}
            </button>
          ))}
          <div className={`${isRTL ? "mr-auto" : "ml-auto"} flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all shadow-sm`} 
               style={{ background: c.surface, borderColor: c.border }}>
            <Search className="w-4 h-4" style={{ color: "#E5233B" }} />
            <input
              type="text"
              placeholder={t("بحث باسم أو إيميل...", "Search by name or email...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent text-sm"
              style={{ fontFamily: "'Cairo', sans-serif", width: "220px", color: c.text }}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: c.surface2, borderBottom: `1.5px solid ${c.border}` }}>
                  {[
                    { ar: "المستخدم", en: "User" },
                    { ar: "البريد الإلكتروني", en: "Email" },
                    { ar: "تاريخ الانضمام", en: "Joined Date" },
                    { ar: "الحالة", en: "Status" },
                    { ar: "الإجراءات", en: "Actions" }
                  ].map((h) => (
                    <th key={h.en} className={`px-4 py-4 ${isRTL ? "text-right" : "text-left"}`} style={{ fontSize: "12px", fontWeight: 700, color: "#E5233B" }}>
                      {t(h.ar, h.en)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                    {filtered.map((user, i) => (
                    <motion.tr
                        key={user.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b transition-colors hover:bg-black/5"
                        style={{ borderColor: c.border }}
                    >
                        <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                            <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm border-2 border-white/20"
                            style={{
                                background: user.is_banned
                                ? "#EF4444"
                                : `hsl(${(user.id * 137) % 360}, 65%, 55%)`,
                                fontWeight: 800,
                                fontSize: "15px",
                            }}
                            >
                            {user.name.charAt(0)}
                            </div>
                            <div>
                            <p style={{ fontWeight: 800, fontSize: "14px", color: c.text }}>{user.name}</p>
                            <div className="flex items-center gap-1.5 opacity-60">
                                <Shield className={`w-3 h-3 ${user.isAdmin ? "text-amber-500" : ""}`} />
                                <span style={{ fontSize: "10px" }}>{user.role}</span>
                            </div>
                            </div>
                        </div>
                        </td>
                        <td className="px-4 py-4">
                        <span style={{ fontSize: "13px", color: c.text }}>{user.email}</span>
                        </td>
                        <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 opacity-60">
                                <Calendar className="w-3.5 h-3.5" />
                                <span style={{ fontSize: "12px" }}>
                                    {new Date(user.created_at).toLocaleDateString(isRTL ? "ar-JO" : "en-US", {
                                        month: "short",
                                        year: "numeric"
                                    })}
                                </span>
                            </div>
                        </td>
                        <td className="px-4 py-4">
                        <span
                            className="px-2.5 py-1 rounded-full text-[11px]"
                            style={{
                            background: !user.is_banned ? (c.dark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5") : (c.dark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2"),
                            color: !user.is_banned ? "#10B981" : "#EF4444",
                            fontWeight: 700,
                            border: `1px solid ${!user.is_banned ? "#10B98120" : "#EF444420"}`
                            }}
                        >
                            {!user.is_banned ? t("نشط", "Active") : t("محظور", "Banned")}
                        </span>
                        </td>
                    <td className="px-4 py-4">
                        {!user.isAdmin && (
                            <button
                                onClick={() => handleToggleBan(user.id)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs transition-all active:scale-95 shadow-sm hover:brightness-110"
                                style={{ 
                                    background: user.is_banned ? "#10B981" : "#EF4444", 
                                    fontWeight: 800 
                                }}
                            >
                                {user.is_banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                {user.is_banned ? t("رفع الحظر", "Unban User") : t("حظر المستخدم", "Ban User")}
                            </button>
                        )}
                        {user.isAdmin && (
                            <span style={{ fontSize: "12px", opacity: 0.5, fontStyle: "italic" }}>—</span>
                        )}
                    </td>
                    </motion.tr>
                    ))}
                </AnimatePresence>
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
