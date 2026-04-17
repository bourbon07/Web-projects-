import { useState } from "react";
import { Plus, Pencil, Trash2, ShoppingBag, Save, X, Star } from "lucide-react";
import { BUNDLES } from "../../data/mockData";
import { motion, AnimatePresence } from "motion/react";

interface Bundle {
  id: number;
  nameAr: string;
  nameEn: string;
  price: number;
  originalPrice: number;
  image: string;
  items: string[];
  itemsEn: string[];
  rating: number;
  reviews: number;
}

export function AdminPackages() {
  const [bundles, setBundles] = useState<Bundle[]>(BUNDLES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({
    nameAr: "",
    nameEn: "",
    price: 0,
    originalPrice: 0,
    image: "",
    items: "",
  });

  const inputStyle = {
    border: "1.5px solid #FFDDE4",
    background: "#FFF8FA",
    fontFamily: "'Cairo', sans-serif",
    fontSize: "13px",
    borderRadius: "10px",
    padding: "10px 12px",
    width: "100%",
    outline: "none",
    color: "#333",
  };

  const handleEdit = (b: Bundle) => {
    setForm({
      nameAr: b.nameAr,
      nameEn: b.nameEn,
      price: b.price,
      originalPrice: b.originalPrice,
      image: b.image,
      items: b.items.join("، "),
    });
    setEditingId(b.id);
    setShowForm(true);
  };

  const handleSave = () => {
    const itemsArray = form.items.split(/[،,]/).map((s) => s.trim()).filter(Boolean);
    if (editingId) {
      setBundles((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? { ...b, nameAr: form.nameAr, nameEn: form.nameEn, price: form.price, originalPrice: form.originalPrice, image: form.image, items: itemsArray, itemsEn: itemsArray }
            : b
        )
      );
    } else {
      setBundles((prev) => [
        ...prev,
        {
          id: Date.now(),
          nameAr: form.nameAr,
          nameEn: form.nameEn,
          price: form.price,
          originalPrice: form.originalPrice,
          image: form.image || "https://images.unsplash.com/photo-1661551428492-3a0b7ba0c7f7?w=400",
          items: itemsArray,
          itemsEn: itemsArray,
          rating: 4.5,
          reviews: 0,
        },
      ]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ nameAr: "", nameEn: "", price: 0, originalPrice: 0, image: "", items: "" });
  };

  const handleDelete = (id: number) => {
    setBundles((prev) => prev.filter((b) => b.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF0F3" }}>
            <ShoppingBag className="w-5 h-5" style={{ color: "#E5233B" }} />
          </div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "18px" }}>إدارة الباقات</h2>
            <p style={{ fontSize: "12px", color: "#888" }}>{bundles.length} باقات</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white"
          style={{ background: "#E5233B", fontWeight: 700, fontSize: "13px" }}
        >
          <Plus className="w-4 h-4" />
          إضافة باقة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence>
          {bundles.map((bundle, i) => {
            const discount = Math.round(((bundle.originalPrice - bundle.price) / bundle.originalPrice) * 100);
            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1.5px solid #FFDDE4" }}
              >
                <div className="relative" style={{ height: "160px" }}>
                  <img src={bundle.image} alt={bundle.nameAr} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }} />
                  <span
                    className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs"
                    style={{ background: "#E5233B", fontWeight: 700 }}
                  >
                    خصم {discount}%
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="mb-1" style={{ fontWeight: 700, fontSize: "16px" }}>{bundle.nameAr}</h3>
                  <p className="mb-3" style={{ fontSize: "12px", color: "#888" }}>{bundle.nameEn}</p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {bundle.items.map((item) => (
                      <span key={item} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#FFF0F3", color: "#E5233B", border: "1px solid #FFDDE4" }}>
                        {item}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3" style={{ fill: s <= Math.floor(bundle.rating) ? "#FFB800" : "transparent", color: "#FFB800" }} />
                    ))}
                    <span style={{ fontSize: "11px", color: "#888" }}>({bundle.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span style={{ fontWeight: 800, color: "#E5233B", fontSize: "18px" }}>{bundle.price} د.أ</span>
                      <span className="mx-1.5" style={{ textDecoration: "line-through", color: "#BBB", fontSize: "13px" }}>{bundle.originalPrice}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(bundle)} className="p-2 rounded-xl" style={{ background: "#EFF6FF" }}>
                        <Pencil className="w-4 h-4" style={{ color: "#3B82F6" }} />
                      </button>
                      <button onClick={() => setDeleteConfirm(bundle.id)} className="p-2 rounded-xl" style={{ background: "#FEF2F2" }}>
                        <Trash2 className="w-4 h-4" style={{ color: "#EF4444" }} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: "white" }}
          >
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white" style={{ borderColor: "#FFDDE4" }}>
              <h3 style={{ fontWeight: 800, fontSize: "17px" }}>{editingId ? "تعديل الباقة" : "إضافة باقة جديدة"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" style={{ color: "#E5233B" }} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600">الاسم بالعربية</label>
                <input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} style={inputStyle} placeholder="اسم الباقة" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600">الاسم بالإنجليزية</label>
                <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} style={inputStyle} placeholder="Package Name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-600">السعر (د.أ)</label>
                  <input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} style={inputStyle} />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-600">السعر الأصلي (د.أ)</label>
                  <input type="number" value={form.originalPrice || ""} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600">رابط الصورة (Cloudinary / URL مباشر)</label>
                <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} style={inputStyle} placeholder="https://res.cloudinary.com/... أو أي رابط مباشر" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600">محتويات الباقة (مفصولة بفاصلة)</label>
                <textarea value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="أكياس تزيين، قوالب سيليكون، ملاعق قياس" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2" style={{ background: "#E5233B", fontWeight: 700 }}>
                  <Save className="w-4 h-4" />
                  {editingId ? "حفظ التعديلات" : "إضافة الباقة"}
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border" style={{ borderColor: "#FFDDE4", color: "#666", fontWeight: 600 }}>
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm p-6 rounded-2xl text-center" style={{ background: "white" }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FEF2F2" }}>
              <Trash2 className="w-7 h-7" style={{ color: "#EF4444" }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: "17px", marginBottom: "8px" }}>حذف الباقة</h3>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>هل تريد حذف هذه الباقة؟</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl text-white" style={{ background: "#EF4444", fontWeight: 700 }}>حذف</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border" style={{ borderColor: "#DDD", color: "#666", fontWeight: 600 }}>إلغاء</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}