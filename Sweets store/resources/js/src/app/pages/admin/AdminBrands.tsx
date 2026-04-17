import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Shield, Save, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useEPTheme } from "../../context/AppContext";
import { brandService } from "../../../api/products";

export function AdminBrands() {
  const { lang } = useApp();
  const c = useEPTheme();
  
  const isRTL = lang === "ar";
  const t = (ar: string, en: string) => (isRTL ? ar : en);

  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", logo: null as File | null, logo_url: "" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await brandService.getBrands();
      setBrands(data);
    } catch (err) {
      console.error("Fetch brands failed", err);
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
        setShowForm(false);
        setDeleteConfirm(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleEdit = (brand: any) => {
    setForm({ 
        name: brand.name, 
        description: brand.description || "", 
        logo: null, 
        logo_url: brand.logo || "" 
    });
    setEditingId(brand.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      if (form.logo) {
          formData.append("logo", form.logo);
      }

      if (editingId) {
        await brandService.adminUpdateBrand(editingId, formData);
      } else {
        await brandService.adminCreateBrand(formData);
      }
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert("Failed to save brand");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await brandService.adminDeleteBrand(id);
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      alert("Failed to delete brand");
    }
  };

  const inputStyle = {
    border: `1.5px solid ${c.border}`,
    background: c.surface2,
    fontFamily: "'Cairo', sans-serif",
    fontSize: "13px",
    borderRadius: "10px",
    padding: "10px 12px",
    width: "100%",
    outline: "none",
    color: c.text,
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", color: c.text }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.surface3 }}>
            <Shield className="w-5 h-5" style={{ color: "#E5233B" }} />
          </div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "18px", color: c.text }}>
              {t("إدارة العلامات التجارية", "Brand Management")}
            </h2>
            <p style={{ fontSize: "12px", color: c.muted }}>
              {brands.length} {t("علامة تجارية", "Brands")}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditingId(null); setForm({ name: "", description: "", logo: null, logo_url: "" }); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all transform active:scale-95 shadow-sm"
          style={{ background: "#E5233B", fontWeight: 700, fontSize: "13px" }}
        >
          <Plus className="w-4 h-4" />
          {t("إضافة علامة", "Add Brand")}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.07 }}
              className="p-5 rounded-2xl group relative shadow-sm hover:shadow-md transition-all"
              style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                      {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                      ) : (
                          <Shield className="w-8 h-8 text-gray-200" />
                      )}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: "15px", color: c.text }}>{brand.name}</h3>
                    <p className="line-clamp-1" style={{ fontSize: "12px", color: c.muted, maxWidth: "150px" }}>{brand.description || t("لا يوجد وصف", "No description")}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleEdit(brand)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors"
                  style={{ background: c.dark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF", color: "#3B82F6", fontWeight: 700, border: `1px solid ${c.dark ? "rgba(59, 130, 246, 0.2)" : "#DBEAFE"}` }}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t("تعديل", "Edit")}
                </button>
                <button
                  onClick={() => setDeleteConfirm(brand.id)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs transition-colors"
                  style={{ background: c.dark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2", color: "#EF4444", fontWeight: 700, border: `1px solid ${c.dark ? "rgba(239, 68, 68, 0.2)" : "#FEE2E2"}` }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t("حذف", "Delete")}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowForm(false)}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: c.surface, border: `2px solid ${c.border}` }}
          >
            <div className="flex items-center justify-between p-5 border-b bg-inherit" style={{ borderColor: c.border }}>
              <h3 style={{ fontWeight: 800, fontSize: "17px", color: c.text }}>
                {editingId ? t("تعديل العلامة", "Edit Brand") : t("إضافة علامة جديدة", "Add New Brand")}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg transition-colors hover:bg-opacity-10"><X className="w-5 h-5" style={{ color: "#E5233B" }} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("اسم العلامة", "Brand Name")}</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder={t("اسم العلامة التجارية", "Brand Name")} />
              </div>
              
              <div>
                <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الوصف", "Description")}</label>
                <textarea 
                    value={form.description} 
                    onChange={(e) => setForm({ ...form, description: e.target.value })} 
                    style={{ ...inputStyle, minHeight: "80px", resize: "none" }} 
                    placeholder={t("وصف مختصر للعلامة...", "Short description...")} 
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الشعار", "Logo")}</label>
                <div 
                    className="relative group cursor-pointer border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all"
                    style={{ borderColor: c.border, background: c.surface2 }}
                    onClick={() => document.getElementById("brand-logo-upload")?.click()}
                >
                    <input 
                        id="brand-logo-upload"
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setForm({ ...form, logo: file, logo_url: URL.createObjectURL(file) });
                            }
                        }}
                    />
                    
                    {form.logo_url ? (
                        <div className="relative w-20 h-20">
                            <img src={form.logo_url} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-all">
                                <Plus className="text-white w-6 h-6" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                            <p style={{ fontSize: "11px", color: c.muted }}>{t("اضغط لرفع الشعار", "Click to upload logo")}</p>
                        </>
                    )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg" style={{ background: "#E5233B", fontWeight: 700 }}>
                  <Save className="w-4 h-4" />
                  {editingId ? t("حفظ التغييرات", "Save Changes") : t("إضافة العلامة", "Add Brand")}
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border transition-all" style={{ borderColor: c.border, color: c.text2, background: c.surface2, fontWeight: 600 }}>
                  {t("إلغاء", "Cancel")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setDeleteConfirm(null)}>
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm p-10 rounded-2xl text-center shadow-2xl" style={{ background: c.surface, border: `2px solid ${c.border}` }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: c.dark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2" }}>
              <Trash2 className="w-10 h-10" style={{ color: "#EF4444" }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: "19px", marginBottom: "12px", color: c.text }}>{t("حذف العلامة", "Delete Brand")}</h3>
            <p style={{ color: c.muted, fontSize: "15px", marginBottom: "28px", lineHeight: 1.6 }}>{t("هل تريد حذف هذه العلامة التجارية؟", "Are you sure you want to delete this brand?")}</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-3 rounded-xl text-white transition-transform active:scale-95 shadow-lg" style={{ background: "#EF4444", fontWeight: 700 }}>{t("حذف", "Delete")}</button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl border transition-all" style={{ borderColor: c.border, color: c.text2, background: c.surface2, fontWeight: 600 }}>{t("إلغاء", "Cancel")}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
