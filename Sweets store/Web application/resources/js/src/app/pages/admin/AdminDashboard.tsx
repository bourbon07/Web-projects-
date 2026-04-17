import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Users, Star, ArrowUp, ArrowDown, Truck, DollarSign, Save, CheckCircle, Pencil, Trash2, Plus, Minus } from "lucide-react";
import { QuantityInput } from "../../components/ui/QuantityInput";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useApp, useEPTheme } from "../../context/AppContext";
import api from "../../../api/axiosConfig";

const SALES_DATA = [
  { monthAr: "يناير", monthEn: "Jan", sales: 4200, orders: 38 },
  { monthAr: "فبراير", monthEn: "Feb", sales: 5800, orders: 52 },
  { monthAr: "مارس", monthEn: "Mar", sales: 7200, orders: 65 },
  { monthAr: "أبريل", monthEn: "Apr", sales: 6100, orders: 55 },
  { monthAr: "مايو", monthEn: "May", sales: 8900, orders: 78 },
  { monthAr: "يونيو", monthEn: "Jun", sales: 11200, orders: 95 },
];

const CATEGORY_DATA = [
  { nameAr: "أدوات التزيين", nameEn: "Decoration Tools", value: 35, color: "#E5233B" },
  { nameAr: "قوالب الخبز", nameEn: "Baking Molds", value: 25, color: "#FF6B8A" },
  { nameAr: "أجهزة المطبخ", nameEn: "Appliances", value: 22, color: "#FFDDE4" },
  { nameAr: "أدوات الخبز", nameEn: "Baking Tools", value: 18, color: "#FFB3BF" },
];

const RECENT_ORDERS_MOCK = [
  { id: "ORD-001", user: "أحمد محمد", nameEn: "Ahmed Mohammed", total: 285, status: "delivered", timeAr: "منذ ساعتين", timeEn: "2h ago" },
  { id: "ORD-002", user: "سارة عبدالله", nameEn: "Sara Abdullah", total: 980, status: "pending", timeAr: "منذ 4 ساعات", timeEn: "4h ago" },
  { id: "ORD-003", user: "نورا خالد", nameEn: "Nora Khaled", total: 199, status: "pending", timeAr: "منذ 5 ساعات", timeEn: "5h ago" },
  { id: "ORD-004", user: "عمر حسن", nameEn: "Omar Hassan", total: 549, status: "approved", timeAr: "أمس", timeEn: "Yesterday" },
];

const STATUS_STYLE: Record<string, { labelAr: string; labelEn: string; bg: string; color: string }> = {
  pending: { labelAr: "قيد الانتظار", labelEn: "Pending", bg: "#FFFBEB", color: "#F59E0B" },
  approved: { labelAr: "مقبول", labelEn: "Approved", bg: "#ECFDF5", color: "#10B981" },
  rejected: { labelAr: "مرفوض", labelEn: "Rejected", bg: "#FEF2F2", color: "#EF4444" },
  delivered: { labelAr: "مُسلّم", labelEn: "Delivered", bg: "#EFF6FF", color: "#3B82F6" },
};

export function AdminDashboard() {
  const { lang, deliveryFee, serviceFee, setDeliveryFee, setServiceFee } = useApp();
  const c = useEPTheme();
  
  const isRTL = lang === "ar";
  const t = (ar: string, en: string) => (isRTL ? ar : en);
  const currency = t("د.أ", "JOD");

  const [tempDelivery, setTempDelivery] = useState(deliveryFee);
  const [tempService, setTempService] = useState(serviceFee);
  const [feesSaved, setFeesSaved] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [salesChart, setSalesChart] = useState<any[]>([]);
  const [categoryChart, setCategoryChart] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  
  // Cities State
  const [cities, setCities] = useState<any[]>([]);
  const [cityForm, setCityForm] = useState({ name_ar: "", name_en: "", delivery_fee: 0 });
  const [editingCityId, setEditingCityId] = useState<number | null>(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => {
      setStats(res.data.stats);
      setSalesChart(res.data.sales_chart || []);
      setCategoryChart(res.data.category_chart || []);
      if (res.data.recent_orders?.length > 0) {
          setRecentOrders(res.data.recent_orders.map((o: any) => ({
              id: `#${o.id}`,
              user: o.user?.name || "User",
              nameEn: o.user?.name || "User",
              total: o.total_price,
              status: (o.status || "pending").toLowerCase(),
              timeAr: "مؤخراً",
              timeEn: "Recently"
          })));
      }
    });
    fetchCities();
  }, []);

  const fetchCities = () => {
    api.get("/cities").then((res) => setCities(res.data));
  };

  const handleSaveCity = () => {
    if (editingCityId) {
      api.put(`/admin/cities/${editingCityId}`, cityForm).then(() => {
        fetchCities();
        setEditingCityId(null);
        setCityForm({ name_ar: "", name_en: "", delivery_fee: 0 });
      });
    } else {
      api.post("/admin/cities", cityForm).then(() => {
        fetchCities();
        setCityForm({ name_ar: "", name_en: "", delivery_fee: 0 });
      });
    }
  };

  const handleDeleteCity = (id: number) => {
    if (confirm(t("هل أنت متأكد من حذف هذه المدينة؟", "Are you sure you want to delete this city?"))) {
      api.delete(`/admin/cities/${id}`).then(() => fetchCities());
    }
  };

  const uiStats = [
    { label: t("إجمالي المبيعات", "Total Sales"), value: `${stats?.total_sales || 0} ${currency}`, change: "+18%", up: true, icon: TrendingUp, color: "#E5233B" },
    { label: t("الطلبات الكلية", "Total Orders"), value: stats?.total_orders || 0, change: "+12%", up: true, icon: ShoppingBag, color: "#FF6B8A" },
    { label: t("المستخدمون", "Users"), value: stats?.total_users || 0, change: "+8%", up: true, icon: Users, color: "#E5233B" },
    { label: t("إجمالي المنتجات", "Total Products"), value: stats?.total_products || 0, change: t("حالياً", "Current"), up: true, icon: Star, color: "#FFB800" },
  ];

  const handleSaveFees = () => {
    setDeliveryFee(tempDelivery);
    setServiceFee(tempService);
    setFeesSaved(true);
    setTimeout(() => setFeesSaved(false), 2500);
  };

  const inputStyle = {
    color: c.text,
    width: "100%",
  };

  return (
    <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", color: c.text }}>
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {uiStats.map((s: any) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="p-5 rounded-2xl" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.surface3 }}>
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
              <p style={{ fontWeight: 800, fontSize: "22px", color: c.text }}>{s.value}</p>
              <p style={{ color: c.muted, fontSize: "12px", marginTop: "2px" }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Fee Management */}
      <div className="p-6 rounded-2xl shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.surface3 }}>
            <DollarSign className="w-5 h-5" style={{ color: "#E5233B" }} />
          </div>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: "16px", color: c.text }}>
              {t("إدارة الرسوم", "Fee Management")}
            </h3>
            <p style={{ fontSize: "12px", color: c.muted }}>
              {t("تحديد رسوم التوصيل وخدمة الطلبات", "Define delivery and service fees")} ({currency})
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <QuantityInput
              value={tempDelivery}
              onChange={setTempDelivery}
              step={0.5}
              label={t("رسوم التوصيل", "Delivery Fee") + ` (${currency})`}
            />
          </div>
          <div className="space-y-2">
            <QuantityInput
              value={tempService}
              onChange={setTempService}
              step={0.1}
              label={t("رسوم الخدمة", "Service Fee") + ` (${currency})`}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSaveFees}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all transform active:scale-95 shadow-lg"
            style={{ background: feesSaved ? "#10B981" : "#E5233B", fontWeight: 700, fontSize: "13px" }}
          >
            {feesSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {feesSaved ? t("تم الحفظ ✓", "Saved ✓") : t("حفظ الرسوم العامة", "Save General Fees")}
          </button>
          <p style={{ fontSize: "12px", color: c.muted }}>
            {t("التوصيل الافتراضي:", "Default Delivery:")} <span style={{ color: "#E5233B", fontWeight: 700 }}>{deliveryFee} {currency}</span> · 
            {t("الخدمة الافتراضية:", "Default Service:")} <span style={{ color: "#E5233B", fontWeight: 700 }}>{serviceFee} {currency}</span>
          </p>
        </div>

        {/* City Management Sub-section */}
        <div className="mt-10 pt-10 border-t" style={{ borderColor: c.border }}>
            <div className="flex items-center gap-3 mb-6">
                <Truck className="w-5 h-5" style={{ color: "#E5233B" }} />
                <h4 style={{ fontWeight: 800, fontSize: "15px", color: c.text }}>{t("إدارة رسوم المدن", "City Fee Management")}</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="p-5 rounded-2xl space-y-4" style={{ background: c.surface2, border: `1.5px solid ${c.border}` }}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1.5 text-[10px] font-bold uppercase" style={{ color: c.text2 }}>{t("الاسم بالعربية", "Name (Arabic)")}</label>
                            <input value={cityForm.name_ar} onChange={(e) => setCityForm({ ...cityForm, name_ar: e.target.value })} style={inputStyle} placeholder="عمان" className="p-3 rounded-xl outline-none" />
                        </div>
                        <div>
                            <label className="block mb-1.5 text-[10px] font-bold uppercase" style={{ color: c.text2 }}>{t("الاسم بالإنجليزية", "Name (English)")}</label>
                            <input value={cityForm.name_en} onChange={(e) => setCityForm({ ...cityForm, name_en: e.target.value })} style={inputStyle} placeholder="Amman" className="p-3 rounded-xl outline-none" />
                        </div>
                    </div>
                    <div>
                        <QuantityInput
                            value={cityForm.delivery_fee}
                            onChange={(v) => setCityForm({ ...cityForm, delivery_fee: v })}
                            step={0.5}
                            label={t("رسوم التوصيل", "Delivery Fee") + ` (${currency})`}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSaveCity} className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-all transform active:scale-95 shadow-md" style={{ background: "#E5233B", fontWeight: 700, fontSize: "13px" }}>
                            <Save className="w-4 h-4" />
                            {editingCityId ? t("تعديل المدينة", "Update City") : t("إضافة المدينة", "Add City")}
                        </button>
                        {editingCityId && (
                            <button onClick={() => { setEditingCityId(null); setCityForm({ name_ar: "", name_en: "", delivery_fee: 0 }); }} className="px-4 py-3 rounded-xl border transition-all text-xs" style={{ borderColor: c.border, color: c.text2 }}>{t("إلغاء", "Cancel")}</button>
                        )}
                    </div>
                </div>

                {/* List */}
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {cities.map((city) => (
                        <div key={city.id} className="flex items-center justify-between p-3 rounded-xl border transition-all hover:border-red-200" style={{ background: c.surface, borderColor: c.border }}>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: "13px", color: c.text }}>{t(city.name_ar, city.name_en)}</p>
                                <p style={{ fontSize: "11px", color: c.muted }}>{city.delivery_fee} {currency}</p>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => { setEditingCityId(city.id); setCityForm({ name_ar: city.name_ar, name_en: city.name_en, delivery_fee: city.delivery_fee }); }} className="p-1.5 rounded-lg hover:bg-black/5"><Pencil className="w-3.5 h-3.5" style={{ color: "#3B82F6" }} /></button>
                                <button onClick={() => handleDeleteCity(city.id)} className="p-1.5 rounded-lg hover:bg-black/5"><Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} /></button>
                            </div>
                        </div>
                    ))}
                    {cities.length === 0 && <p className="text-center py-10 opacity-50 text-xs">{t("لا توجد مدن", "No cities")}</p>}
                </div>
            </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sales Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          <h3 className="mb-6" style={{ fontWeight: 800, fontSize: "16px", color: c.text }}>
            {t("المبيعات الشهرية", "Monthly Sales")} ({currency})
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
              <XAxis dataKey={isRTL ? "monthAr" : "monthEn"} tick={{ fontSize: 11, fontFamily: "'Cairo', sans-serif", fill: c.muted }} />
              <YAxis tick={{ fontSize: 11, fontFamily: "'Cairo', sans-serif", fill: c.muted }} />
              <Tooltip
                contentStyle={{ fontFamily: "'Cairo', sans-serif", borderRadius: "12px", background: c.surface, border: `1.5px solid ${c.border}` }}
                itemStyle={{ color: c.text, fontSize: '13px', fontWeight: 600 }}
                labelStyle={{ color: c.muted, fontSize: '12px', marginBottom: '4px' }}
                formatter={(val: number) => [`${val} ${currency}`, t("المبيعات", "Sales")]}
              />
              <Bar dataKey="sales" fill="#E5233B" radius={[6, 6, 0, 0]} name={t("المبيعات", "Sales")} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="p-6 rounded-2xl shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          <h3 className="mb-6" style={{ fontWeight: 800, fontSize: "16px", color: c.text }}>
            {t("توزيع الفئات", "Category Distribution")}
          </h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={categoryChart} dataKey="value" nameKey={isRTL ? "nameAr" : "nameEn"} cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {categoryChart.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ fontFamily: "'Cairo', sans-serif", borderRadius: "12px", background: c.surface, border: `1px solid ${c.border}` }} 
                itemStyle={{ color: c.text, fontSize: '13px', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {categoryChart.map((cat) => (
              <div key={cat.nameAr} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                  <span style={{ color: c.text2 }}>{t(cat.nameAr, cat.nameEn)}</span>
                </div>
                <span style={{ fontWeight: 900, color: c.text }}>{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Orders Line Chart */}
        <div className="p-6 rounded-2xl shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          <h3 className="mb-6" style={{ fontWeight: 800, fontSize: "16px", color: c.text }}>
            {t("الطلبات الشهرية", "Monthly Orders")}
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={salesChart}>
              <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
              <XAxis dataKey={isRTL ? "monthAr" : "monthEn"} tick={{ fontSize: 11, fontFamily: "'Cairo', sans-serif", fill: c.muted }} />
              <YAxis tick={{ fontSize: 11, fill: c.muted }} />
              <Tooltip 
                contentStyle={{ fontFamily: "'Cairo', sans-serif", borderRadius: "12px", background: c.surface, border: `1.5px solid ${c.border}` }} 
                itemStyle={{ color: c.text, fontSize: '13px', fontWeight: 600 }}
                labelStyle={{ color: c.muted, fontSize: '12px', marginBottom: '4px' }}
                formatter={(val: number) => [val, t("عدد الطلبات", "Orders count")]}
              />
              <Line type="monotone" dataKey="orders" stroke="#E5233B" strokeWidth={2.5} dot={{ fill: "#E5233B", r: 4 }} name={t("الطلبات", "Orders")} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="p-6 rounded-2xl shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
          <h3 className="mb-6" style={{ fontWeight: 800, fontSize: "16px", color: c.text }}>
            {t("أحدث الطلبات", "Recent Orders")}
          </h3>
          <div className="space-y-4">
            {recentOrders.map((order: any) => {
              const st = STATUS_STYLE[order.status];
              return (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-md" style={{ background: c.surface2, border: `1px solid ${c.border}` }}>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "14px", color: c.text }}>{order.id}</p>
                    <p style={{ fontSize: "12px", color: c.muted }}>
                      {t(order.user, order.nameEn || order.user)} · {t(order.timeAr, order.timeEn)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="px-3 py-1 rounded-full text-[11px]"
                      style={{ background: c.dark ? "rgba(0,0,0,0.2)" : st.bg, color: st.color, fontWeight: 700, border: `1px solid ${st.color}20` }}
                    >
                      {t(st.labelAr, st.labelEn)}
                    </span>
                    <span style={{ fontWeight: 900, color: "#E5233B", fontSize: "15px" }}>{order.total} {currency}</span>
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
