import { useState } from "react";
import { CheckCircle, XCircle, Clock, Truck, Search, Filter } from "lucide-react";
import { MOCK_ORDERS_ADMIN } from "../../data/mockData";
import { motion } from "motion/react";

type OrderStatus = "pending" | "approved" | "rejected" | "delivered";

interface AdminOrder {
  id: string;
  user: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: number;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; color: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }> = {
  pending: { label: "قيد الانتظار", bg: "#FFFBEB", color: "#F59E0B", icon: Clock },
  approved: { label: "مقبول", bg: "#ECFDF5", color: "#10B981", icon: CheckCircle },
  rejected: { label: "مرفوض", bg: "#FEF2F2", color: "#EF4444", icon: XCircle },
  delivered: { label: "مُسلّم", bg: "#EFF6FF", color: "#3B82F6", icon: Truck },
};

export function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>(MOCK_ORDERS_ADMIN as AdminOrder[]);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "all" || o.status === filter;
    const matchSearch = o.id.includes(search) || o.user.includes(search);
    return matchFilter && matchSearch;
  });

  const handleApprove = (id: string) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "approved" as OrderStatus } : o)));

  const handleReject = (id: string) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "rejected" as OrderStatus } : o)));

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    approved: orders.filter((o) => o.status === "approved").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: `الكل (${counts.all})` },
          { key: "pending", label: `انتظار (${counts.pending})` },
          { key: "approved", label: `مقبول (${counts.approved})` },
          { key: "rejected", label: `مرفوض (${counts.rejected})` },
          { key: "delivered", label: `مُسلّم (${counts.delivered})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as "all" | OrderStatus)}
            className="px-4 py-2 rounded-xl transition-all"
            style={{
              background: filter === tab.key ? "#E5233B" : "white",
              color: filter === tab.key ? "white" : "#666",
              border: `1.5px solid ${filter === tab.key ? "#E5233B" : "#FFDDE4"}`,
              fontFamily: "'Cairo', sans-serif",
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
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none bg-transparent text-sm"
            style={{ fontFamily: "'Cairo', sans-serif", width: "120px" }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#FFF0F3", borderBottom: "1.5px solid #FFDDE4" }}>
                {["رقم الطلب", "العميل", "التاريخ", "المنتجات", "الإجمالي", "الحالة", "الإجراءات"].map((h) => (
                  <th key={h} className="px-4 py-3 text-right" style={{ fontSize: "12px", fontWeight: 700, color: "#E5233B" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => {
                const cfg = STATUS_CONFIG[order.status];
                const Icon = cfg.icon;
                return (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b hover:bg-pink-50/30 transition"
                    style={{ borderColor: "#FFF0F3" }}
                  >
                    <td className="px-4 py-3">
                      <span style={{ fontWeight: 700, fontSize: "13px", color: "#E5233B" }}>{order.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ background: "#E5233B", fontWeight: 700 }}
                        >
                          {order.user.charAt(0)}
                        </div>
                        <span style={{ fontSize: "13px" }}>{order.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontSize: "12px", color: "#888" }}>{order.date}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#FFF0F3", color: "#E5233B", fontWeight: 600 }}>
                        {order.items} منتجات
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontWeight: 800, color: "#E5233B", fontSize: "14px" }}>{order.total} ج.م</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full w-fit text-xs"
                        style={{ background: cfg.bg, color: cfg.color, fontWeight: 700 }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {order.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs"
                            style={{ background: "#10B981", fontWeight: 700 }}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            قبول
                          </button>
                          <button
                            onClick={() => handleReject(order.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs"
                            style={{ background: "#EF4444", fontWeight: 700 }}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            رفض
                          </button>
                        </div>
                      )}
                      {order.status !== "pending" && (
                        <span style={{ color: "#BBB", fontSize: "12px" }}>—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
