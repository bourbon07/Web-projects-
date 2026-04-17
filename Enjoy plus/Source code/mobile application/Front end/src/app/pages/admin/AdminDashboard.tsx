import { useState } from "react";
import { TrendingUp, ShoppingBag, Users, Star, ArrowUp, ArrowDown, Truck, DollarSign, Save, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useApp } from "../../context/AppContext";

const SALES_DATA = [
  { month: "يناير", sales: 4200, orders: 38 },
  { month: "فبراير", sales: 5800, orders: 52 },
  { month: "مارس", sales: 7200, orders: 65 },
  { month: "أبريل", sales: 6100, orders: 55 },
  { month: "مايو", sales: 8900, orders: 78 },
  { month: "يونيو", sales: 11200, orders: 95 },
];

const CATEGORY_DATA = [
  { name: "أدوات التزيين", value: 35, color: "#E5233B" },
  { name: "قوالب الخبز", value: 25, color: "#FF6B8A" },
  { name: "أجهزة المطبخ", value: 22, color: "#FFDDE4" },
  { name: "أدوات الخبز", value: 18, color: "#FFB3BF" },
];

const STATS = [
  { label: "إجمالي المبيعات", value: "43,400 د.أ", change: "+18%", up: true, icon: TrendingUp, color: "#E5233B" },
  { label: "الطلبات الكلية", value: "383", change: "+12%", up: true, icon: ShoppingBag, color: "#FF6B8A" },
  { label: "المستخدمون", value: "1,247", change: "+8%", up: true, icon: Users, color: "#E5233B" },
  { label: "تقييم المتجر", value: "4.8 ⭐", change: "+0.2", up: true, icon: Star, color: "#FFB800" },
];

const RECENT_ORDERS = [
  { id: "ORD-001", user: "أحمد محمد", total: 285, status: "delivered", time: "منذ ساعتين" },
  { id: "ORD-002", user: "سارة عبدالله", total: 980, status: "pending", time: "منذ 4 ساعات" },
  { id: "ORD-003", user: "نورا خالد", total: 199, status: "pending", time: "منذ 5 ساعات" },
  { id: "ORD-004", user: "عمر حسن", total: 549, status: "approved", time: "أمس" },
];

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  pending: { label: "قيد الانتظار", bg: "#FFFBEB", color: "#F59E0B" },
  approved: { label: "مقبول", bg: "#ECFDF5", color: "#10B981" },
  rejected: { label: "مرفوض", bg: "#FEF2F2", color: "#EF4444" },
  delivered: { label: "مُسلّم", bg: "#EFF6FF", color: "#3B82F6" },
};

export function AdminDashboard() {
  const { deliveryFee, serviceFee, setDeliveryFee, setServiceFee } = useApp();
  const [tempDelivery, setTempDelivery] = useState(deliveryFee);
  const [tempService, setTempService] = useState(serviceFee);
  const [feesSaved, setFeesSaved] = useState(false);

  const handleSaveFees = () => {
    setDeliveryFee(tempDelivery);
    setServiceFee(tempService);
    setFeesSaved(true);
    setTimeout(() => setFeesSaved(false), 2500);
  };

  const inputStyle = {
    border: "1.5px solid #FFDDE4",
    background: "#FFF8FA",
    fontFamily: "'Cairo', sans-serif",
    fontSize: "14px",
    borderRadius: "10px",
    padding: "10px 12px",
    outline: "none",
    color: "#333",
    width: "100%",
  };

  return (
    <div className="space-y-6" dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 rounded-2xl" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF0F3" }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <span
                  className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: s.up ? "#ECFDF5" : "#FEF2F2", color: s.up ? "#10B981" : "#EF4444", fontWeight: 700 }}
                >
                  {s.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {s.change}
                </span>
              </div>
              <p style={{ fontWeight: 800, fontSize: "22px", color: "#1a1a1a" }}>{s.value}</p>
              <p style={{ color: "#888", fontSize: "12px", marginTop: "2px" }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Fee Management */}
      <div className="p-5 rounded-2xl" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FFF0F3" }}>
            <DollarSign className="w-4 h-4" style={{ color: "#E5233B" }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: "15px" }}>إدارة الرسوم</h3>
            <p style={{ fontSize: "11px", color: "#888" }}>تحديد رسوم التوصيل وخدمة الطلبات (د.أ)</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-xs" style={{ fontWeight: 600, color: "#555" }}>
              رسوم التوصيل (دينار أردني)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Truck className="absolute right-3 top-2.5 w-4 h-4" style={{ color: "#E5233B" }} />
                <input
                  type="number"
                  value={tempDelivery}
                  onChange={(e) => setTempDelivery(Number(e.target.value))}
                  style={{ ...inputStyle, paddingRight: "32px" }}
                  step="0.5"
                  min="0"
                />
              </div>
              <span style={{ color: "#888", fontSize: "12px", whiteSpace: "nowrap" }}>د.أ</span>
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-xs" style={{ fontWeight: 600, color: "#555" }}>
              رسوم الخدمة (دينار أردني)
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <ShoppingBag className="absolute right-3 top-2.5 w-4 h-4" style={{ color: "#E5233B" }} />
                <input
                  type="number"
                  value={tempService}
                  onChange={(e) => setTempService(Number(e.target.value))}
                  style={{ ...inputStyle, paddingRight: "32px" }}
                  step="0.1"
                  min="0"
                />
              </div>
              <span style={{ color: "#888", fontSize: "12px", whiteSpace: "nowrap" }}>د.أ</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSaveFees}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all"
            style={{ background: feesSaved ? "#16a34a" : "#E5233B", fontWeight: 700, fontSize: "13px" }}
          >
            {feesSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {feesSaved ? "تم الحفظ ✓" : "حفظ الرسوم"}
          </button>
          <p style={{ fontSize: "12px", color: "#888" }}>
            التوصيل الحالي: <span style={{ color: "#E5233B", fontWeight: 700 }}>{deliveryFee} د.أ</span> · 
            الخدمة: <span style={{ color: "#E5233B", fontWeight: 700 }}>{serviceFee} د.أ</span>
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
          <h3 className="mb-5" style={{ fontWeight: 700, fontSize: "15px" }}>المبيعات الشهرية (د.أ)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SALES_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFF0F3" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "'Cairo', sans-serif", fill: "#888" }} />
              <YAxis tick={{ fontSize: 11, fontFamily: "'Cairo', sans-serif", fill: "#888" }} />
              <Tooltip
                contentStyle={{ fontFamily: "'Cairo', sans-serif", borderRadius: "12px", border: "1px solid #FFDDE4" }}
              />
              <Bar dataKey="sales" fill="#E5233B" radius={[6, 6, 0, 0]} name="المبيعات (د.أ)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="p-5 rounded-2xl" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
          <h3 className="mb-5" style={{ fontWeight: 700, fontSize: "15px" }}>توزيع الفئات</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CATEGORY_DATA} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {CATEGORY_DATA.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontFamily: "'Cairo', sans-serif", borderRadius: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {CATEGORY_DATA.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  <span style={{ color: "#555" }}>{c.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: "#333" }}>{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Orders Line Chart */}
        <div className="p-5 rounded-2xl" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
          <h3 className="mb-5" style={{ fontWeight: 700, fontSize: "15px" }}>الطلبات الشهرية</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={SALES_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#FFF0F3" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "'Cairo', sans-serif", fill: "#888" }} />
              <YAxis tick={{ fontSize: 11, fill: "#888" }} />
              <Tooltip contentStyle={{ fontFamily: "'Cairo', sans-serif", borderRadius: "12px" }} />
              <Line type="monotone" dataKey="orders" stroke="#E5233B" strokeWidth={2.5} dot={{ fill: "#E5233B", r: 4 }} name="الطلبات" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="p-5 rounded-2xl" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
          <h3 className="mb-4" style={{ fontWeight: 700, fontSize: "15px" }}>أحدث الطلبات</h3>
          <div className="space-y-3">
            {RECENT_ORDERS.map((order) => {
              const st = STATUS_STYLE[order.status];
              return (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#FFF8FA" }}>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "13px", color: "#1a1a1a" }}>{order.id}</p>
                    <p style={{ fontSize: "11px", color: "#888" }}>{order.user} · {order.time}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ background: st.bg, color: st.color, fontWeight: 700 }}
                    >
                      {st.label}
                    </span>
                    <span style={{ fontWeight: 800, color: "#E5233B", fontSize: "14px" }}>{order.total} د.أ</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
