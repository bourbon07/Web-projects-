import { useState, useEffect } from "react";
import {
  CheckCircle, XCircle, Clock, Truck, Search, Loader2, Trash2,
  RotateCcw, Eye, X, Mail, Phone, MapPin, Package, User, Hash,
  CreditCard, ChevronDown
} from "lucide-react";
import { orderService } from "../../../api/order";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useEPTheme } from "../../context/AppContext";

type OrderStatus = "pending" | "approved" | "rejected" | "delivered";

const STATUS_CONFIG: Record<OrderStatus, {
  labelAr: string; labelEn: string; bg: string; color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}> = {
  pending:   { labelAr: "قيد الانتظار", labelEn: "Pending",   bg: "#FFFBEB", color: "#F59E0B", icon: Clock },
  approved:  { labelAr: "مقبول",       labelEn: "Approved",   bg: "#ECFDF5", color: "#10B981", icon: CheckCircle },
  rejected:  { labelAr: "مرفوض",       labelEn: "Rejected",   bg: "#FEF2F2", color: "#EF4444", icon: XCircle },
  delivered: { labelAr: "مُسلّم",      labelEn: "Delivered",  bg: "#EFF6FF", color: "#3B82F6", icon: Truck },
};

const PAYMENT_LABELS: Record<string, { ar: string; en: string }> = {
  cash:     { ar: "الدفع نقدًا",   en: "Cash on Delivery" },
  visa:     { ar: "فيزا",          en: "Visa" },
  paypal:   { ar: "باي بال",       en: "PayPal" },
  zaincash: { ar: "زين كاش",       en: "Zain Cash" },
};

function DetailModal({ order, onClose, lang, c, onStatusChange }: {
  order: any; onClose: () => void; lang: string; c: any;
  onStatusChange: (id: number, status: OrderStatus) => void;
}) {
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;
  const currency = t("د.أ", "JOD");
  const statusKey = (order.status as OrderStatus) || "pending";
  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  const statusFlow: OrderStatus[] = ["pending", "approved", "delivered"];
  const currentIdx = statusFlow.indexOf(statusKey);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: c.surface, border: `1.5px solid ${c.border}`, maxHeight: "90vh", overflowY: "auto" }}
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: c.border }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FEF2F2" }}>
              <Package className="w-5 h-5" style={{ color: "#E5233B" }} />
            </div>
            <div>
              <h2 style={{ fontWeight: 800, fontSize: "18px", color: c.text }}>
                {t("تفاصيل الطلب", "Order Details")}
              </h2>
              <p style={{ fontSize: "13px", color: "#E5233B", fontWeight: 700 }}>#{order.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl transition-colors hover:bg-black/5" style={{ color: c.muted }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Pipeline */}
          {statusKey !== "rejected" && (
            <div>
              <p style={{ fontSize: "12px", fontWeight: 700, color: c.muted, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {t("مسار الطلب", "Order Progress")}
              </p>
              <div className="flex items-center gap-0">
                {statusFlow.map((s, i) => {
                  const done = i <= currentIdx;
                  const scfg = STATUS_CONFIG[s];
                  const SIcon = scfg.icon;
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all" style={{
                          background: done ? "#E5233B" : c.surface2,
                          border: `2px solid ${done ? "#E5233B" : c.border}`
                        }}>
                          <SIcon className="w-4 h-4" style={{ color: done ? "white" : c.muted }} />
                        </div>
                        <span style={{ fontSize: "11px", color: done ? "#E5233B" : c.muted, fontWeight: done ? 700 : 500 }}>
                          {t(scfg.labelAr, scfg.labelEn)}
                        </span>
                      </div>
                      {i < statusFlow.length - 1 && (
                        <div className="h-0.5 flex-1 mb-5" style={{ background: i < currentIdx ? "#E5233B" : c.border }} />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Action button based on status */}
              <div className="flex gap-2 mt-3">
                {statusKey === "pending" && (
                  <>
                    <button
                      onClick={() => { onStatusChange(order.id, "approved"); onClose(); }}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                      style={{ background: "#10B981", fontWeight: 700 }}
                    >
                      <CheckCircle className="w-4 h-4" /> {t("قبول الطلب", "Approve Order")}
                    </button>
                    <button
                      onClick={() => { onStatusChange(order.id, "rejected"); onClose(); }}
                      className="flex-1 py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                      style={{ background: "#EF4444", fontWeight: 700 }}
                    >
                      <XCircle className="w-4 h-4" /> {t("رفض الطلب", "Reject Order")}
                    </button>
                  </>
                )}
                {statusKey === "approved" && (
                  <button
                    onClick={() => { onStatusChange(order.id, "delivered"); onClose(); }}
                    className="flex-1 py-2.5 rounded-xl text-white text-sm flex items-center justify-center gap-2"
                    style={{ background: "#3B82F6", fontWeight: 700 }}
                  >
                    <Truck className="w-4 h-4" /> {t("تأكيد التسليم", "Confirm Delivery")}
                  </button>
                )}
              </div>
            </div>
          )}

          {statusKey === "rejected" && (
            <div className="p-4 rounded-2xl flex items-center gap-3" style={{ background: "#FEF2F2", border: "1.5px solid #FECACA" }}>
              <XCircle className="w-5 h-5 flex-shrink-0" style={{ color: "#EF4444" }} />
              <div>
                <p style={{ color: "#EF4444", fontWeight: 700, fontSize: "14px" }}>{t("هذا الطلب مرفوض", "This order was rejected")}</p>
                <button
                  onClick={() => { onStatusChange(order.id, "pending"); onClose(); }}
                  className="text-xs mt-1 underline"
                  style={{ color: "#EF4444" }}
                >
                  {t("إعادة للانتظار", "Move back to Pending")}
                </button>
              </div>
            </div>
          )}

          {/* Customer Info */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: c.surface2, border: `1.5px solid ${c.border}` }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {t("معلومات العميل", "Customer Information")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: User, label: t("الاسم", "Name"), value: order.customer_name || "—" },
                { icon: Hash, label: t("رقم المستخدم", "User ID"), value: order.user_id ? `#${order.user_id}` : t("زائر", "Guest") },
                { icon: Mail, label: t("البريد الإلكتروني", "Email"), value: order.customer_email || "—" },
                { icon: Phone, label: t("رقم الهاتف", "Phone"), value: order.customer_phone || "—" },
              ].map(({ icon: FieldIcon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: c.surface }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#FEF2F2" }}>
                    <FieldIcon className="w-4 h-4" style={{ color: "#E5233B" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "11px", color: c.muted, fontWeight: 600 }}>{label}</p>
                    <p style={{ fontSize: "13px", color: c.text, fontWeight: 700 }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {order.shipping_address && (
              <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: c.surface }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#FEF2F2" }}>
                  <MapPin className="w-4 h-4" style={{ color: "#E5233B" }} />
                </div>
                <div>
                  <p style={{ fontSize: "11px", color: c.muted, fontWeight: 600 }}>{t("عنوان التوصيل", "Shipping Address")}</p>
                  <p style={{ fontSize: "13px", color: c.text, fontWeight: 600 }}>{order.shipping_address}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>
              {t("المنتجات المطلوبة", "Ordered Items")} ({order.items?.length || 0})
            </p>
            <div className="space-y-2">
              {(order.items || []).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: c.surface2, border: `1px solid ${c.border}` }}>
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#FEF2F2" }}>
                      <Package className="w-6 h-6" style={{ color: "#E5233B" }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: "13px", color: c.text, fontWeight: 700 }} className="truncate">
                      {lang === "ar" ? item.name?.ar : item.name?.en}
                    </p>
                    <p style={{ fontSize: "11px", color: c.muted }}>
                      {item.is_package ? t("باقة", "Bundle") : item.brand} · {t("الكمية", "Qty")}: {item.quantity}
                    </p>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <p style={{ fontSize: "13px", color: "#E5233B", fontWeight: 800 }}>
                      {(item.price * item.quantity).toFixed(2)} {lang === "ar" ? "د.أ" : "JOD"}
                    </p>
                    <p style={{ fontSize: "11px", color: c.muted }}>
                      {item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: c.surface2, border: `1.5px solid ${c.border}` }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: c.muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              {t("ملخص المدفوعات", "Payment Summary")}
            </p>
            {[
              { label: t("المجموع الفرعي", "Subtotal"), value: ((order.total_price || 0) - (order.delivery_fee || 0) - (order.service_fee || 0)).toFixed(2) },
              { label: t("رسوم التوصيل", "Delivery Fee"), value: (order.delivery_fee || 0).toFixed(2) },
              { label: t("رسوم الخدمة", "Service Fee"), value: (order.service_fee || 0).toFixed(2) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span style={{ fontSize: "13px", color: c.muted }}>{label}</span>
                <span style={{ fontSize: "13px", color: c.text, fontWeight: 600 }}>{value} {currency}</span>
              </div>
            ))}
            <div className="h-px my-1" style={{ background: c.border }} />
            <div className="flex justify-between items-center">
              <span style={{ fontSize: "15px", color: c.text, fontWeight: 800 }}>{t("الإجمالي", "Total")}</span>
              <span style={{ fontSize: "17px", color: "#E5233B", fontWeight: 900 }}>{(order.total_price || 0).toFixed(2)} {currency}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CreditCard className="w-4 h-4" style={{ color: c.muted }} />
              <span style={{ fontSize: "12px", color: c.muted }}>
                {order.payment_method
                  ? (lang === "ar"
                    ? (PAYMENT_LABELS[order.payment_method]?.ar ?? order.payment_method)
                    : (PAYMENT_LABELS[order.payment_method]?.en ?? order.payment_method))
                  : "—"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function AdminOrders() {
  const { lang } = useApp();
  const c = useEPTheme();

  const isRTL = lang === "ar";
  const t = (ar: string, en: string) => (isRTL ? ar : en);
  const currency = t("د.أ", "JOD");

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<"name" | "uid">("name");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await orderService.adminGetOrders();
      setOrders(data);
    } catch (err) {
      console.error("Fetch orders failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedOrder(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleViewOrder = async (orderId: number) => {
    setLoadingDetail(true);
    try {
      const detail = await orderService.adminGetOrder(orderId);
      setSelectedOrder(detail);
    } catch (e) {
      // fallback: find from local list
      setSelectedOrder(orders.find(o => o.id === orderId) ?? null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "all" || String(o.status) === filter;
    const q = search.toLowerCase().trim();
    if (!q) return matchFilter;
    const matchSearch = searchType === "uid"
      ? String(o.user_id || "").includes(q) || String(o.id).includes(q)
      : String(o.customer_name || "").toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const handleUpdateStatus = async (id: number, status: OrderStatus) => {
    try {
      await orderService.adminUpdateOrderStatus(id, status);
      fetchData();
    } catch {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("هل أنت متأكد من حذف هذا الطلب؟", "Are you sure you want to delete this order?"))) return;
    try {
      await orderService.adminDeleteOrder(id);
      fetchData();
    } catch {
      alert("Failed to delete order");
    }
  };

  const counts = {
    all: orders.length,
    pending:   orders.filter(o => o.status === "pending").length,
    approved:  orders.filter(o => o.status === "approved").length,
    rejected:  orders.filter(o => o.status === "rejected").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20" style={{ color: c.text }}>
        <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: "#E5233B" }} />
        <p style={{ fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}>{t("جاري تحميل الطلبات...", "Loading orders...")}</p>
      </div>
    );
  }

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", color: c.text }}>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          { key: "all",       label: `${t("الكل", "All")} (${counts.all})` },
          { key: "pending",   label: `${t("انتظار", "Pending")} (${counts.pending})` },
          { key: "approved",  label: `${t("مقبول", "Approved")} (${counts.approved})` },
          { key: "rejected",  label: `${t("مرفوض", "Rejected")} (${counts.rejected})` },
          { key: "delivered", label: `${t("مُسلّم", "Delivered")} (${counts.delivered})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as "all" | OrderStatus)}
            className="px-4 py-2 rounded-xl transition-all shadow-sm"
            style={{
              background: filter === tab.key ? "#E5233B" : c.surface,
              color:      filter === tab.key ? "white"    : c.text,
              border:     `1.5px solid ${filter === tab.key ? "#E5233B" : c.border}`,
              fontSize: "13px", fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        {/* Search Type Toggle */}
        <div className="relative">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as "name" | "uid")}
            className="appearance-none h-full px-4 pr-8 rounded-xl border-2 text-sm outline-none"
            style={{
              background: c.surface, borderColor: c.border, color: c.text,
              fontFamily: "'Cairo', sans-serif", fontWeight: 600, cursor: "pointer"
            }}
          >
            <option value="name">{t("بالاسم", "By Name")}</option>
            <option value="uid">{t("برقم المستخدم", "By User ID")}</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ [isRTL ? "left" : "right"]: "8px", color: c.muted }} />
        </div>

        <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all"
          style={{ background: c.surface, borderColor: c.border }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#E5233B" }} />
          <input
            type="text"
            placeholder={searchType === "name"
              ? t("ابحث باسم العميل...", "Search by customer name...")
              : t("ابحث برقم المستخدم أو الطلب...", "Search by user ID or order ID...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none bg-transparent text-sm flex-1"
            style={{ fontFamily: "'Cairo', sans-serif", color: c.text }}
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ color: c.muted }}>
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: c.surface2, borderBottom: `1.5px solid ${c.border}` }}>
                {[
                  { ar: "رقم الطلب", en: "Order ID" },
                  { ar: "العميل",    en: "Customer" },
                  { ar: "التاريخ",   en: "Date" },
                  { ar: "الإجمالي", en: "Total" },
                  { ar: "الحالة",   en: "Status" },
                  { ar: "الإجراءات", en: "Actions" },
                ].map((h) => (
                  <th key={h.en} className={`px-4 py-4 ${isRTL ? "text-right" : "text-left"}`}
                    style={{ fontSize: "12px", fontWeight: 700, color: "#E5233B" }}>
                    {t(h.ar, h.en)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Package className="w-10 h-10 mx-auto mb-3" style={{ color: c.muted, opacity: 0.4 }} />
                      <p style={{ color: c.muted, fontSize: "14px" }}>{t("لا توجد نتائج", "No results found")}</p>
                    </td>
                  </tr>
                )}
                {filtered.map((order, i) => {
                  const statusKey = (order.status as OrderStatus) || "pending";
                  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
                  const Icon = cfg.icon;

                  return (
                    <motion.tr
                      key={order.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b transition-colors hover:bg-black/[0.02]"
                      style={{ borderColor: c.border }}
                    >
                      <td className="px-4 py-4">
                        <span style={{ fontWeight: 700, fontSize: "13px", color: "#E5233B" }}>#{order.id}</span>
                        {order.user_id && (
                          <p style={{ fontSize: "11px", color: c.muted }}>UID: {order.user_id}</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#E5233B,#FF6B8A)", fontWeight: 800 }}>
                            {(order.customer_name || "G").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: "13px", color: c.text, fontWeight: 700 }}>{order.customer_name || "Guest"}</p>
                            {order.customer_phone && (
                              <p style={{ fontSize: "11px", color: c.muted }}>{order.customer_phone}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span style={{ fontSize: "12px", color: c.muted }}>
                          {new Date(order.created_at).toLocaleDateString(isRTL ? "ar-JO" : "en-US", {
                            month: "short", day: "numeric", year: "numeric"
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span style={{ fontWeight: 800, color: "#E5233B", fontSize: "14px" }}>
                          {(order.total_price || 0).toFixed(2)} {currency}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] w-fit"
                            style={{ background: cfg.bg, color: cfg.color, fontWeight: 700, border: `1px solid ${cfg.color}30` }}>
                            <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                            {t(cfg.labelAr, cfg.labelEn)}
                          </span>
                          {order.status !== "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "pending")}
                              className="p-1.5 rounded-lg opacity-40 hover:opacity-100 transition-all hover:bg-gray-100"
                              title={t("إعادة للانتظار", "Back to Pending")}
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {/* View Detail */}
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            disabled={loadingDetail}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs transition-transform active:scale-95"
                            style={{ background: "#6366F1", fontWeight: 700 }}
                            title={t("عرض التفاصيل", "View Details")}
                          >
                            {loadingDetail
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Eye className="w-3.5 h-3.5" />}
                            {t("تفاصيل", "Details")}
                          </button>

                          {/* Quick Status Actions */}
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(order.id, "approved")}
                                className="p-2 rounded-lg text-white text-xs transition-transform active:scale-95"
                                style={{ background: "#10B981" }}
                                title={t("قبول", "Approve")}
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(order.id, "rejected")}
                                className="p-2 rounded-lg text-white text-xs transition-transform active:scale-95"
                                style={{ background: "#EF4444" }}
                                title={t("رفض", "Reject")}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {order.status === "approved" && (
                            <button
                              onClick={() => handleUpdateStatus(order.id, "delivered")}
                              className="p-2 rounded-lg text-white text-xs transition-transform active:scale-95"
                              style={{ background: "#3B82F6" }}
                              title={t("تم التوصيل", "Mark Delivered")}
                            >
                              <Truck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-2 rounded-lg transition-colors hover:bg-red-50 group"
                            title={t("حذف الطلب", "Delete Order")}
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <DetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            lang={lang}
            c={c}
            onStatusChange={handleUpdateStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
