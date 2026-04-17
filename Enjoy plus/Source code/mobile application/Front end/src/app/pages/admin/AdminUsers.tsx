import { useState } from "react";
import { Ban, CheckCircle, Search, Users, Shield } from "lucide-react";
import { MOCK_USERS } from "../../data/mockData";
import { motion } from "motion/react";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  age: number;
  gender: string;
  status: "active" | "banned";
  orders: number;
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>(MOCK_USERS as AdminUser[]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "banned">("all");

  const filtered = users.filter((u) => {
    const matchFilter = filter === "all" || u.status === filter;
    const matchSearch = u.name.includes(search) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleBan = (id: number) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "banned" as const } : u)));

  const handleUnban = (id: number) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active" as const } : u)));

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "إجمالي المستخدمين", value: users.length, icon: Users, color: "#E5233B", bg: "#FFF0F3" },
          { label: "المستخدمون النشطون", value: users.filter((u) => u.status === "active").length, icon: CheckCircle, color: "#10B981", bg: "#ECFDF5" },
          { label: "المحظورون", value: users.filter((u) => u.status === "banned").length, icon: Ban, color: "#EF4444", bg: "#FEF2F2" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-4 rounded-2xl" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <Icon className="w-4.5 h-4.5" style={{ color: s.color, width: "18px", height: "18px" }} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: "20px", color: "#1a1a1a" }}>{s.value}</p>
                  <p style={{ fontSize: "11px", color: "#888" }}>{s.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[
          { key: "all", label: "الكل" },
          { key: "active", label: "نشط" },
          { key: "banned", label: "محظور" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as "all" | "active" | "banned")}
            className="px-4 py-2 rounded-xl"
            style={{
              background: filter === tab.key ? "#E5233B" : "white",
              color: filter === tab.key ? "white" : "#666",
              border: `1.5px solid ${filter === tab.key ? "#E5233B" : "#FFDDE4"}`,
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        ))}
        <div className="mr-auto flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
          <Search className="w-4 h-4" style={{ color: "#E5233B" }} />
          <input
            type="text"
            placeholder="بحث بالاسم أو الإيميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none bg-transparent text-sm"
            style={{ fontFamily: "'Cairo', sans-serif", width: "180px" }}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#FFF0F3", borderBottom: "1.5px solid #FFDDE4" }}>
                {["المستخدم", "البريد الإلكتروني", "العمر", "الجنس", "الطلبات", "الحالة", "الإجراءات"].map((h) => (
                  <th key={h} className="px-4 py-3 text-right" style={{ fontSize: "12px", fontWeight: 700, color: "#E5233B" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b hover:bg-pink-50/30 transition"
                  style={{ borderColor: "#FFF0F3" }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white"
                        style={{
                          background: user.status === "banned"
                            ? "#EF4444"
                            : `hsl(${(user.id * 60) % 360}, 60%, 50%)`,
                          fontWeight: 700,
                          fontSize: "14px",
                        }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "13px" }}>{user.name}</p>
                        {user.status === "banned" && (
                          <span className="flex items-center gap-1" style={{ fontSize: "10px", color: "#EF4444" }}>
                            <Shield className="w-3 h-3" />
                            محظور
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: "12px", color: "#666" }}>{user.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: "13px" }}>{user.age}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontSize: "13px" }}>{user.gender}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: "#FFF0F3", color: "#E5233B", fontWeight: 700 }}
                    >
                      {user.orders} طلبات
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs"
                      style={{
                        background: user.status === "active" ? "#ECFDF5" : "#FEF2F2",
                        color: user.status === "active" ? "#10B981" : "#EF4444",
                        fontWeight: 700,
                      }}
                    >
                      {user.status === "active" ? "نشط" : "محظور"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.status === "active" ? (
                      <button
                        onClick={() => handleBan(user.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs"
                        style={{ background: "#EF4444", fontWeight: 700 }}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        حظر
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnban(user.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs"
                        style={{ background: "#10B981", fontWeight: 700 }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        رفع الحظر
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
