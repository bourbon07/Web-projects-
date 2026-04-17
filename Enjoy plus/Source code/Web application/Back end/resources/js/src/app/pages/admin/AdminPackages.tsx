import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ShoppingBag, Save, X, Star, Minus } from "lucide-react";
import { QuantityInput } from "../../components/ui/QuantityInput";
import { packageService } from "../../../api/packages";
import { productService } from "../../../api/products";
import { Package, Product } from "../../../types";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useEPTheme } from "../../context/AppContext";

export function AdminPackages() {
  const { lang } = useApp();
  const c = useEPTheme();
  
  const isRTL = lang === "ar";
  const t = (ar: string, en: string) => (isRTL ? ar : en);
  const currency = t("د.أ", "JOD");

  const [bundles, setBundles] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    price: 0,
    original_price: 0,
    image_url: "",
    image: null as File | null,
    stock_quantity: 0,
    product_ids: [] as number[],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgs, prods] = await Promise.all([
        packageService.getPackages(),
        productService.getProducts(),
      ]);
      setBundles(pkgs);
      setProducts(prods.data);
    } catch (err) {
      console.error("Fetch failed", err);
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

  const handleEdit = (b: Package) => {
    setForm({
      name_ar: b.name.ar,
      name_en: b.name.en,
      description_ar: b.description?.ar || "",
      description_en: b.description?.en || "",
      price: b.price,
      original_price: b.original_price || b.price,
      image_url: b.image_url || "",
      image: null,
      stock_quantity: (b as any).stock_quantity || 0,
      product_ids: b.products?.map((p: Product) => p.id) || [],
    });
    setEditingId(b.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const submitData = {
        ...form,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        stock_quantity: Number(form.stock_quantity),
        image_url: form.image_url?.trim() || null,
      };

      let payload: any = submitData;
      if (form.image instanceof File) {
        payload = new FormData();
        Object.entries(submitData).forEach(([k, v]) => {
          if (v !== null && v !== undefined && k !== 'image' && k !== 'product_ids') {
            payload.append(k, String(v));
          }
        });
        if (form.product_ids && form.product_ids.length > 0) {
          form.product_ids.forEach((id: number, idx: number) => {
             payload.append(`product_ids[${idx}]`, String(id));
          });
        }
        payload.append("image", form.image);
      } else {
         payload = {...submitData, product_ids: form.product_ids};
      }

      if (editingId) {
        await packageService.adminUpdatePackage(editingId, payload);
      } else {
        await packageService.adminCreatePackage(payload);
      }
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      console.error("Save failure", err.response?.data);
      const msg = err.response?.data?.message || "Failed to save package";
      const errors = err.response?.data?.errors;
      const errorStr = errors ? Object.values(errors).flat().join("\n") : "";
      alert(`${msg}\n${errorStr}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await packageService.adminDeletePackage(id);
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      alert("Failed to delete package");
    }
  };  const inputStyle = {
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
            <ShoppingBag className="w-5 h-5" style={{ color: "#E5233B" }} />
          </div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "18px", color: c.text }}>
              {t("إدارة الباقات", "Package Management")}
            </h2>
            <p style={{ fontSize: "12px", color: c.muted }}>
              {bundles.length} {t("باقات", "Packages")}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-transform active:scale-95 shadow-sm"
          style={{ background: "#E5233B", fontWeight: 700, fontSize: "13px" }}
        >
          <Plus className="w-4 h-4" />
          {t("إضافة باقة", "Add Package")}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <AnimatePresence>
          {bundles.map((bundle, i) => {
            const op = bundle.original_price || bundle.price;
            const discount = Math.round(((op - bundle.price) / op) * 100);
            return (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                style={{ background: c.surface, border: `1.5px solid ${c.border}` }}
              >
                <div className="relative" style={{ height: "160px" }}>
                  <img src={bundle.image_url} alt={bundle.name.ar} className="w-full h-full object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)" }} />
                  {discount > 0 && (
                    <span
                      className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-white text-xs"
                      style={{ background: "#E5233B", fontWeight: 700 }}
                    >
                      {t(`خصم ${discount}%`, `${discount}% OFF`)}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="mb-1" style={{ fontWeight: 800, fontSize: "16px", color: c.text }}>
                    {isRTL ? bundle.name.ar : bundle.name.en}
                  </h3>
                  <p className="mb-3" style={{ fontSize: "12px", color: c.muted }}>
                    {isRTL ? bundle.name.en : bundle.name.ar}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {bundle.products?.map((p: Product) => (
                      <span key={p.id} className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: c.surface2, color: "#E5233B", border: `1px solid ${c.border}` }}>
                        {p.current_name || p.name.ar}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3" style={{ fill: s <= Math.floor(bundle.average_rating) ? "#FFB800" : "transparent", color: "#FFB800" }} />
                    ))}
                    <span style={{ fontSize: "11px", color: c.muted }}>({bundle.average_rating})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span style={{ fontWeight: 900, color: "#E5233B", fontSize: "18px" }}>{bundle.price} {currency}</span>
                      {bundle.original_price && bundle.original_price > bundle.price && (
                        <span className="mx-1.5" style={{ textDecoration: "line-through", color: c.muted, fontSize: "13px" }}>{bundle.original_price} {currency}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleEdit(bundle)} className="p-2 rounded-xl transition-all" style={{ background: c.dark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF" }}>
                        <Pencil className="w-4 h-4" style={{ color: "#3B82F6" }} />
                      </button>
                      <button onClick={() => setDeleteConfirm(bundle.id)} className="p-2 rounded-xl transition-all" style={{ background: c.dark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2" }}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowForm(false)}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ background: c.surface, border: `2px solid ${c.border}` }}
          >
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-inherit" style={{ borderColor: c.border }}>
              <h3 style={{ fontWeight: 800, fontSize: "17px", color: c.text }}>{editingId ? t("تعديل الباقة", "Edit Package") : t("إضافة باقة جديدة", "Add New Package")}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg transition-colors hover:bg-opacity-10"><X className="w-5 h-5" style={{ color: "#E5233B" }} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الاسم بالعربية", "Name (Arabic)")}</label>
                <input value={form.name_ar || ""} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} style={inputStyle} placeholder={t("اسم الباقة", "Package Name")} />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الاسم بالإنجليزية", "Name (English)")}</label>
                <input value={form.name_en || ""} onChange={(e) => setForm({ ...form, name_en: e.target.value })} style={inputStyle} placeholder="Package Name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <QuantityInput
                    value={form.price || 0}
                    onChange={(v) => setForm({ ...form, price: v })}
                    step={0.5}
                    label={t("السعر", "Price") + ` (${currency})`}
                />
                <QuantityInput
                    value={form.stock_quantity || 0}
                    onChange={(v) => setForm({ ...form, stock_quantity: v })}
                    label={t("الكمية", "Stock")}
                />
              </div>
              <div>
                 <QuantityInput
                    value={form.original_price || 0}
                    onChange={(v) => setForm({ ...form, original_price: v })}
                    step={0.5}
                    label={t("السعر الأصلي", "Original Price") + ` (${currency})`}
                />
              </div>
              <div>
                <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("صورة الباقة", "Package Image")}</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setForm({ ...form, image: e.target.files[0], image_url: "" });
                      }
                    }}
                    className="w-full p-2 rounded-xl text-sm"
                    style={{ border: `1px solid ${c.border}`, background: c.surface2, color: c.text }}
                  />
                </div>
                {(form.image || form.image_url) && (
                  <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden" style={{ border: `1px solid ${c.border}` }}>
                    <img src={form.image ? URL.createObjectURL(form.image) : form.image_url} alt="preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                   <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الوصف (عربي)", "Description (Arabic)")}</label>
                   <textarea
                     value={form.description_ar || ""}
                     onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                     rows={3}
                     style={{ ...inputStyle, resize: "vertical" }}
                     placeholder={t("وصف الباقة بالعربي...", "Package description in Arabic...")}
                   />
                </div>
                <div>
                   <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الوصف (إنجليزي)", "Description (English)")}</label>
                   <textarea
                     value={form.description_en || ""}
                     onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                     rows={3}
                     style={{ ...inputStyle, resize: "vertical" }}
                     placeholder={t("Package description in English...", "Package description in English...")}
                   />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-xs font-semibold" style={{ color: c.text2 }}>{t("المنتجات في الباقة", "Products in Package")}</label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {form.product_ids?.map((id: number) => {
                        const p = products.find(x => x.id === id);
                        if (!p) return null;
                        return (
                            <div key={id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all" style={{ background: c.surface2, border: `1.5px solid ${c.border}` }}>
                                <span className="text-xs" style={{ fontWeight: 700, color: c.text }}>{t(p.name?.ar, p.name?.en)}</span>
                                <button
                                    onClick={() => {
                                        const newIds = form.product_ids.filter((x: number) => x !== id);
                                        setForm({...form, product_ids: newIds});
                                    }}
                                    className="p-1 rounded-lg transition-colors hover:bg-red-50"
                                >
                                    <X className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                                </button>
                            </div>
                        );
                    })}
                </div>
                
                <div className="relative">
                    <select 
                        key={form.product_ids?.length}
                        className="w-full rounded-xl p-2.5 transition-all outline-none"
                        style={{ ...inputStyle, background: c.surface2 }}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val && !form.product_ids.includes(val)) {
                                setForm({ ...form, product_ids: [...form.product_ids, val] });
                            }
                            e.target.value = "";
                        }}
                    >
                        <option value="">{t("+ إضافة منتج", "+ Add Product")}</option>
                        {products.filter(p => !form.product_ids.includes(p.id)).map(p => (
                            <option key={p.id} value={p.id}>{t(p.name?.ar, p.name?.en)}</option>
                        ))}
                    </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg" style={{ background: "#E5233B", fontWeight: 700 }}>
                  <Save className="w-4 h-4" />
                  {editingId ? t("حفظ التعديلات", "Save Changes") : t("إضافة الباقة", "Add Package")}
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
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-sm:p-6 p-10 rounded-2xl text-center shadow-2xl" style={{ background: c.surface, border: `2px solid ${c.border}`, maxWidth: "400px" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: c.dark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2" }}>
              <Trash2 className="w-10 h-10" style={{ color: "#EF4444" }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: "19px", marginBottom: "12px", color: c.text }}>{t("حذف الباقة", "Delete Package")}</h3>
            <p style={{ color: c.muted, fontSize: "15px", marginBottom: "28px", lineHeight: 1.6 }}>{t("هل تريد حذف هذه الباقة؟", "Are you sure you want to delete this package?")}</p>
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