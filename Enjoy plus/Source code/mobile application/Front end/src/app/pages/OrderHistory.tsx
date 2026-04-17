import { Link } from "react-router";
import { Package, RefreshCw, ArrowLeft, CheckCircle, Clock, XCircle, Truck, ShoppingBag } from "lucide-react";
import { useApp, useEPTheme } from "../context/AppContext";
import { motion } from "motion/react";

const STATUS_CONFIG = {
  pending: { icon: Clock, color: "#F59E0B", bg: "#FFFBEB", bgDark: "#3f2f0b", label: { ar: "قيد الانتظار", en: "Pending" } },
  approved: { icon: CheckCircle, color: "#10B981", bg: "#ECFDF5", bgDark: "#0d2f1f", label: { ar: "تم القبول", en: "Approved" } },
  rejected: { icon: XCircle, color: "#EF4444", bg: "#FEF2F2", bgDark: "#3f1414", label: { ar: "مرفوض", en: "Rejected" } },
  delivered: { icon: Truck, color: "#3B82F6", bg: "#EFF6FF", bgDark: "#172a3f", label: { ar: "تم التوصيل", en: "Delivered" } },
};

export function OrderHistory() {
  const { lang, orders, addToCart, setCartOpen } = useApp();
  const c = useEPTheme();
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);
  const currency = t("د.أ", "JOD");

  const handleReorder = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      order.items.forEach((item) => addToCart(item));
      setCartOpen(true);
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-4 max-w-5xl mx-auto"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ fontFamily: "'Cairo', sans-serif", background: c.bg }}
    >
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="p-2 rounded-full transition" style={{ background: c.surface2 }}>
          <ArrowLeft className="w-5 h-5" style={{ color: "#E5233B" }} />
        </Link>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "22px", color: c.text }}>
            {t("سجل الطلبات", "Order History")}
          </h1>
          <p style={{ fontSize: "13px", color: c.muted }}>
            {orders.length} {t("طلب", "orders")}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-28 h-28 rounded-full flex items-center justify-center mb-6" style={{ background: c.surface2 }}>
            <Package className="w-12 h-12" style={{ color: "#E5233B" }} />
          </div>
          <h2 style={{ fontWeight: 800, fontSize: "20px", color: c.text }}>{t("لا توجد طلبات بعد", "No Orders Yet")}</h2>
          <p style={{ color: c.muted, fontSize: "14px", marginTop: "8px" }}>
            {t("تسوق الآن واستمتع بتجربة شراء رائعة", "Shop now and enjoy a great buying experience")}
          </p>
          <Link to="/" className="mt-6 px-8 py-3 rounded-xl text-white inline-flex items-center gap-2" style={{ background: "#E5233B", fontWeight: 700 }}>
            <ShoppingBag className="w-4 h-4" />
            {t("ابدأ التسوق", "Start Shopping")}
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-5">
          {orders.map((order, i) => {
            const statusCfg = STATUS_CONFIG[order.status];
            const StatusIcon = statusCfg.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-5" style={{ borderBottom: `1px solid ${c.border}`, background: c.surface2 }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: c.surface3 }}>
                      <Package className="w-5 h-5" style={{ color: "#E5233B" }} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: c.text, fontSize: "14px" }}>{order.id}</p>
                      <p style={{ color: c.muted, fontSize: "12px" }}>{order.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Status Badge */}
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                      style={{ background: statusCfg.bg, color: statusCfg.color, fontSize: "12px", fontWeight: 700 }}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {lang === "ar" ? statusCfg.label.ar : statusCfg.label.en}
                    </span>

                    {/* Reorder Button */}
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleReorder(order.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                      style={{ background: "#E5233B", fontSize: "12px", fontWeight: 700 }}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      {t("إعادة الطلب", "Reorder")}
                    </motion.button>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="flex flex-wrap gap-3 mb-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: c.surface2, border: `1px solid ${c.border}` }}>
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                          <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "13px", color: c.text }}>
                            {lang === "ar" ? item.nameAr : item.nameEn}
                          </p>
                          <p style={{ fontSize: "11px", color: c.muted }}>
                            {item.quantity} × {item.price} {currency}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4" style={{ borderTop: `1px solid ${c.border}` }}>
                    <span style={{ color: c.muted, fontSize: "13px" }}>{t("إجمالي الطلب", "Order Total")}</span>
                    <span style={{ fontWeight: 900, fontSize: "20px", color: "#E5233B", fontFamily: "'Cairo', sans-serif" }}>
                      {order.total.toFixed(2)} {currency}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}