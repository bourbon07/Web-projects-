import { useState } from "react";
import { Plus, Pencil, Trash2, Grid3X3, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Category {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  count: number;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: "decoration", nameAr: "أدوات التزيين", nameEn: "Decoration Tools", icon: "🎨", count: 24 },
  { id: "molds", nameAr: "قوالب الخبز", nameEn: "Baking Molds", icon: "🍰", count: 18 },
  { id: "tools", nameAr: "أدوات الخبز", nameEn: "Baking Tools", icon: "🥄", count: 32 },
  { id: "appliances", nameAr: "أجهزة المطبخ", nameEn: "Kitchen Appliances", icon: "⚡", count: 15 },
  { id: "ingredients", nameAr: "مكونات الخبيز", nameEn: "Baking Ingredients", icon: "🌾", count: 42 },
];

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ nameAr: "", nameEn: "", icon: "📦" });

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

  const handleEdit = (cat: Category) => {
    setForm({ nameAr: cat.nameAr, nameEn: cat.nameEn, icon: cat.icon });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingId) {
      setCategories((prev) => prev.map((c) => (c.id === editingId ? { ...c, ...form } : c)));
    } else {
      setCategories((prev) => [...prev, { id: Date.now().toString(), ...form, count: 0 }]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ nameAr: "", nameEn: "", icon: "📦" });
  };

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteConfirm(null);
  };

  const EMOJI_OPTIONS = ["🎨", "🍰", "🥄", "⚡", "🌾", "🧁", "🍞", "🥐", "🎂", "🍫", "📦", "🛠️"];

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF0F3" }}>
            <Grid3X3 className="w-5 h-5" style={{ color: "#E5233B" }} />
          </div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "18px" }}>إدارة الفئات</h2>
            <p style={{ fontSize: "12px", color: "#888" }}>{categories.length} فئات</p>
          </div>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white"
          style={{ background: "#E5233B", fontWeight: 700, fontSize: "13px" }}
        >
          <Plus className="w-4 h-4" />
          إضافة فئة
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.07 }}
              className="p-5 rounded-2xl group relative"
              style={{ background: "white", border: "1.5px solid #FFDDE4" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: "15px" }}>{cat.nameAr}</h3>
                    <p style={{ fontSize: "12px", color: "#888" }}>{cat.nameEn}</p>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-xs"
                  style={{ background: "#FFF0F3", color: "#E5233B", fontWeight: 700 }}
                >
                  {cat.count} منتج
                </span>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(cat)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs"
                  style={{ background: "#EFF6FF", color: "#3B82F6", fontWeight: 700, border: "1px solid #DBEAFE" }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  تعديل
                </button>
                <button
                  onClick={() => setDeleteConfirm(cat.id)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs"
                  style={{ background: "#FEF2F2", color: "#EF4444", fontWeight: 700, border: "1px solid #FEE2E2" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: "white" }}
          >
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "#FFDDE4" }}>
              <h3 style={{ fontWeight: 800, fontSize: "17px" }}>
                {editingId ? "تعديل الفئة" : "إضافة فئة جديدة"}
              </h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" style={{ color: "#E5233B" }} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600">الاسم بالعربية</label>
                <input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} style={inputStyle} placeholder="اسم الفئة" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600">الاسم بالإنجليزية</label>
                <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} style={inputStyle} placeholder="Category Name" />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600">الأيقونة</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setForm({ ...form, icon: emoji })}
                      className="w-10 h-10 rounded-xl text-xl flex items-center justify-center transition"
                      style={{
                        border: form.icon === emoji ? "2px solid #E5233B" : "1.5px solid #FFDDE4",
                        background: form.icon === emoji ? "#FFF0F3" : "white",
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2" style={{ background: "#E5233B", fontWeight: 700 }}>
                  <Save className="w-4 h-4" />
                  {editingId ? "حفظ" : "إضافة"}
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
            <h3 style={{ fontWeight: 800, fontSize: "17px", marginBottom: "8px" }}>حذف الفئة</h3>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>هل تريد حذف هذه الفئة؟</p>
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
