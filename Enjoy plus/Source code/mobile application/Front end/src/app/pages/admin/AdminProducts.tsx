import { useState } from "react";
import { Plus, Pencil, Trash2, X, Save, Package, Search } from "lucide-react";
import { PRODUCTS as INITIAL_PRODUCTS } from "../../data/mockData";
import { Product } from "../../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Product & { nameAr: string; nameEn: string }>>({
    nameAr: "",
    nameEn: "",
    brand: "",
    price: 0,
    originalPrice: 0,
    category: "",
    categoryAr: "",
    rating: 4.5,
    reviews: 0,
    inStock: true,
    image: "",
    descriptionAr: "",
  });

  const filtered = products.filter(
    (p) =>
      p.nameAr.includes(search) ||
      p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (p: Product) => {
    setForm(p);
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingId) {
      setProducts((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...form } as Product : p))
      );
    } else {
      const newProduct: Product = {
        ...(form as Product),
        id: Date.now(),
      };
      setProducts((prev) => [newProduct, ...prev]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ nameAr: "", nameEn: "", brand: "", price: 0, originalPrice: 0, category: "", categoryAr: "", rating: 4.5, reviews: 0, inStock: true, image: "", descriptionAr: "" });
  };

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

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

  return (
    <div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#FFF0F3" }}>
            <Package className="w-5 h-5" style={{ color: "#E5233B" }} />
          </div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "18px" }}>إدارة المنتجات</h2>
            <p style={{ fontSize: "12px", color: "#888" }}>{products.length} منتج</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
            <Search className="w-4 h-4" style={{ color: "#E5233B" }} />
            <input
              type="text"
              placeholder="بحث..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent text-sm"
              style={{ fontFamily: "'Cairo', sans-serif", width: "150px" }}
            />
          </div>
          <button
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white"
            style={{ background: "#E5233B", fontWeight: 700, fontSize: "13px" }}
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1.5px solid #FFDDE4" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#FFF0F3", borderBottom: "1.5px solid #FFDDE4" }}>
                {["المنتج", "الماركة", "السعر", "المخزون", "الفئة", "الإجراءات"].map((h) => (
                  <th key={h} className="px-4 py-3 text-right" style={{ fontSize: "12px", fontWeight: 700, color: "#E5233B" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b"
                    style={{ borderColor: "#FFF0F3" }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: "#FFF0F3" }}>
                          <img src={p.image} alt={p.nameAr} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "13px" }}>{p.nameAr}</p>
                          <p style={{ fontSize: "11px", color: "#888" }}>{p.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: "#FFF0F3", color: "#E5233B", fontWeight: 600 }}>
                        {p.brand}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p style={{ fontWeight: 800, color: "#E5233B", fontSize: "14px" }}>{p.price} د.أ</p>
                        <p style={{ textDecoration: "line-through", color: "#BBB", fontSize: "11px" }}>{p.originalPrice}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{
                          background: p.inStock ? "#ECFDF5" : "#FEF2F2",
                          color: p.inStock ? "#10B981" : "#EF4444",
                          fontWeight: 700,
                        }}
                      >
                        {p.inStock ? "متوفر" : "نفذ"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontSize: "12px", color: "#666" }}>{p.categoryAr}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 rounded-lg hover:bg-blue-50 transition"
                          style={{ background: "#EFF6FF" }}
                        >
                          <Pencil className="w-4 h-4" style={{ color: "#3B82F6" }} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="p-2 rounded-lg transition"
                          style={{ background: "#FEF2F2" }}
                        >
                          <Trash2 className="w-4 h-4" style={{ color: "#EF4444" }} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: "white" }}
          >
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white" style={{ borderColor: "#FFDDE4" }}>
              <h3 style={{ fontWeight: 800, fontSize: "17px" }}>
                {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-pink-50">
                <X className="w-5 h-5" style={{ color: "#E5233B" }} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-600">الاسم بالعربية</label>
                  <input value={form.nameAr || ""} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} style={inputStyle} placeholder="اسم المنتج" />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-600">الاسم بالإنجليزية</label>
                  <input value={form.nameEn || ""} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} style={inputStyle} placeholder="Product Name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-600">الماركة</label>
                  <input value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} style={inputStyle} placeholder="Wilton" />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-600">الفئة</label>
                  <select value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    <option value="">اختر الفئة</option>
                    <option value="decoration">أدوات التزيين</option>
                    <option value="molds">قوالب الخبز</option>
                    <option value="tools">أدوات الخبز</option>
                    <option value="appliances">أجهزة المطبخ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-600">السعر (د.أ)</label>
                  <input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} style={inputStyle} placeholder="0" />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold text-gray-600">السعر الأصلي (د.أ)</label>
                  <input type="number" value={form.originalPrice || ""} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} style={inputStyle} placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600">رابط الصورة (Cloudinary / URL مباشر)</label>
                <input value={form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} style={inputStyle} placeholder="https://res.cloudinary.com/... أو أي رابط مباشر" />
                {form.image && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden" style={{ border: "1px solid #FFDDE4" }}>
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold text-gray-600">الوصف</label>
                <textarea
                  value={form.descriptionAr || ""}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="وصف المنتج..."
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="w-10 h-5 rounded-full relative transition-colors"
                    style={{ background: form.inStock ? "#E5233B" : "#DDD" }}
                    onClick={() => setForm({ ...form, inStock: !form.inStock })}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ right: form.inStock ? "2px" : "auto", left: form.inStock ? "auto" : "2px" }}
                    />
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>متوفر في المخزون</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2"
                  style={{ background: "#E5233B", fontWeight: 700 }}
                >
                  <Save className="w-4 h-4" />
                  {editingId ? "حفظ التعديلات" : "إضافة المنتج"}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl border"
                  style={{ borderColor: "#FFDDE4", color: "#666", fontWeight: 600 }}
                >
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-2xl text-center"
            style={{ background: "white" }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#FEF2F2" }}>
              <Trash2 className="w-7 h-7" style={{ color: "#EF4444" }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: "17px", marginBottom: "8px" }}>حذف المنتج</h3>
            <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
              هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-xl text-white"
                style={{ background: "#EF4444", fontWeight: 700 }}
              >
                حذف
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border"
                style={{ borderColor: "#DDD", color: "#666", fontWeight: 600 }}
              >
                إلغاء
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}