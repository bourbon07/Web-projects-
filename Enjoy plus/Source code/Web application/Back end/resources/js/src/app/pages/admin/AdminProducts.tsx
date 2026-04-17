import { useState, useEffect, useRef } from "react";
import { Search, Plus, ListFilter, MoreVertical, Edit2, Trash2, Package, Star, AlertCircle, CheckCircle, Save, Minus, Pencil, X, FileUp, Download } from "lucide-react";
import { QuantityInput } from "../../components/ui/QuantityInput";
import { productService, categoryService, brandService } from "../../../api/products";
import axiosConfig from "../../../api/axiosConfig";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Product } from "../../../types";
import { motion, AnimatePresence } from "motion/react";
import { useApp, useEPTheme } from "../../context/AppContext";
import BulkProductImport from "../../components/admin/BulkProductImport";

export function AdminProducts() {
  const { lang } = useApp();
  const c = useEPTheme();

  const isRTL = lang === "ar";
  const t = (ar: string, en: string) => (isRTL ? ar : en);
  const currency = t("د.أ", "JOD");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    name_ar: "",
    name_en: "",
    description_ar: "",
    description_en: "",
    price: 0,
    original_price: 0,
    stock_quantity: 0,
    category_id: "",
    brand_id: "",
    image_url: "",
    image: null as File | null,
  });
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      const inStock = products.filter(p => p.stock > 0).length;
      const outStock = products.filter(p => p.stock === 0).length;

      // Build rows HTML
      const rowsHtml = products.map((p, i) => {
        const cat = categories.find((c: any) => c.id === p.category_id);
        const brand = brands.find((b: any) => b.id === p.brand_id);
        const bg = i % 2 === 0 ? '#fff' : '#faf5f5';
        return `<tr style="background:${bg}">
          <td style="padding:8px 6px;border-bottom:1px solid #eee">${p.name?.en || ''}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;direction:rtl;text-align:right">${p.name?.ar || ''}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee">${p.price} JOD</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee">${p.stock}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee;direction:rtl;text-align:right">${p.description?.ar || ''}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee">${(cat as any)?.name_en || (cat as any)?.name?.en || ''}</td>
          <td style="padding:8px 6px;border-bottom:1px solid #eee">${(brand as any)?.name || ''}</td>
        </tr>`;
      }).join('');

      // Create hidden container
      const container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:0;width:1100px;background:#fff;font-family:Cairo,Arial,sans-serif;padding:30px;color:#1a1a1a;';
      container.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #E5233B;padding-bottom:15px;margin-bottom:20px">
          <h1 style="font-size:22px;color:#E5233B;margin:0">Enjoy Plus - Inventory Report</h1>
          <span style="font-size:13px;color:#666">${dateStr}</span>
        </div>
        <div style="display:flex;gap:16px;margin-bottom:18px">
          <div style="background:#f8f8f8;padding:8px 16px;border-radius:8px;border:1px solid #eee;font-size:13px">Total: <strong style="color:#E5233B">${products.length}</strong></div>
          <div style="background:#f8f8f8;padding:8px 16px;border-radius:8px;border:1px solid #eee;font-size:13px">In Stock: <strong style="color:#E5233B">${inStock}</strong></div>
          <div style="background:#f8f8f8;padding:8px 16px;border-radius:8px;border:1px solid #eee;font-size:13px">Out of Stock: <strong style="color:#E5233B">${outStock}</strong></div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr>
              <th style="background:#E5233B;color:#fff;padding:10px 6px;text-align:left;font-weight:700">Name (EN)</th>
              <th style="background:#E5233B;color:#fff;padding:10px 6px;text-align:right;font-weight:700">الاسم (AR)</th>
              <th style="background:#E5233B;color:#fff;padding:10px 6px;text-align:left;font-weight:700">Price</th>
              <th style="background:#E5233B;color:#fff;padding:10px 6px;text-align:left;font-weight:700">Stock</th>
              <th style="background:#E5233B;color:#fff;padding:10px 6px;text-align:right;font-weight:700">الوصف (AR)</th>
              <th style="background:#E5233B;color:#fff;padding:10px 6px;text-align:left;font-weight:700">Category</th>
              <th style="background:#E5233B;color:#fff;padding:10px 6px;text-align:left;font-weight:700">Brand</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div style="margin-top:20px;text-align:center;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:10px">
          Generated by Enjoy Plus Admin Panel — ${dateStr}
        </div>
      `;
      document.body.appendChild(container);

      // Wait for fonts to load
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 200));

      // Render to canvas
      const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
      document.body.removeChild(container);

      // Calculate PDF dimensions
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = 297; // A4 landscape width in mm
      const pdfHeight = 210; // A4 landscape height in mm
      const margin = 10;
      const contentWidth = pdfWidth - margin * 2;
      const imgAspect = canvas.height / canvas.width;
      const scaledHeight = contentWidth * imgAspect;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // If content fits in one page
      if (scaledHeight <= pdfHeight - margin * 2) {
        doc.addImage(imgData, 'JPEG', margin, margin, contentWidth, scaledHeight);
      } else {
        // Multi-page: slice the canvas into pages
        const pageContentHeight = pdfHeight - margin * 2;
        const totalPages = Math.ceil(scaledHeight / pageContentHeight);
        for (let page = 0; page < totalPages; page++) {
          if (page > 0) doc.addPage();
          const srcY = (page * pageContentHeight / scaledHeight) * canvas.height;
          const srcH = (pageContentHeight / scaledHeight) * canvas.height;
          
          // Create a cropped canvas for this page
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.min(srcH, canvas.height - srcY);
          const ctx = pageCanvas.getContext('2d')!;
          ctx.drawImage(canvas, 0, srcY, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
          const pageImg = pageCanvas.toDataURL('image/jpeg', 0.95);
          const drawH = (pageCanvas.height / canvas.width) * contentWidth;
          doc.addImage(pageImg, 'JPEG', margin, margin, contentWidth, drawH);
        }
      }

      doc.save(`enjoy_plus_inventory_${dateStr}.pdf`);
    } catch (err) {
      console.error("Export failed", err);
      alert(t("فشل تصدير الملف", "Failed to export PDF"));
    } finally {
      setIsExporting(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pData, cData, bData] = await Promise.all([
        productService.getProducts(),
        categoryService.getCategories(),
        brandService.getBrands(),
      ]);
      setProducts(pData.data);
      setCategories(cData);
      setBrands(bData);
    } catch (err) {
      console.error("Failed to fetch products", err);
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

  const filtered = products.filter(
    (p) =>
      p?.name?.ar?.toLowerCase()?.includes(search.toLowerCase()) ||
      p?.name?.en?.toLowerCase()?.includes(search.toLowerCase())
  );

  const handleEdit = (p: Product) => {
    setForm({
      name_ar: p.name.ar,
      name_en: p.name.en,
      description_ar: p.description?.ar || "",
      description_en: p.description?.en || "",
      price: p.price,
      original_price: p.original_price,
      stock_quantity: p.stock || 0,
      category_id: (p as any).category_id || "",
      brand_id: (p as any).brand_id || "",
      image_url: p.image_url,
      image: null,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const submitData = {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        stock_quantity: Number(form.stock_quantity),
        image_url: form.image_url?.trim() || null,
        description_en: form.description_en?.trim() || null,
        description_ar: form.description_ar?.trim() || null,
      };
      
      let payload: any = submitData;
      if (form.image instanceof File) {
        payload = new FormData();
        Object.entries(submitData).forEach(([k, v]) => {
          if (v !== null && v !== undefined && k !== 'image') {
            payload.append(k, String(v));
          }
        });
        payload.append("image", form.image);
      }

      if (editingId) {
        await productService.adminUpdateProduct(editingId, payload);
      } else {
        await productService.adminCreateProduct(payload);
      }
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      console.error("Save failure", err.response?.data);
      const msg = err.response?.data?.message || "Failed to save product";
      const errors = err.response?.data?.errors;
      const errorStr = errors ? Object.values(errors).flat().join("\n") : "";
      alert(`${msg}\n${errorStr}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productService.adminDeleteProduct(id);
      setDeleteConfirm(null);
      fetchData();
    } catch (err) {
      alert("Failed to delete product");
    }
  };

  const inputStyle = {
    color: c.text,
    width: "100%",
  };

  return (
    <div dir={isRTL ? "rtl" : "ltr"} style={{ fontFamily: "'Cairo', sans-serif", color: c.text }}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: c.surface3 }}>
            <Package className="w-5 h-5" style={{ color: "#E5233B" }} />
          </div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "18px", color: c.text }}>
              {t("إدارة المنتجات", "Product Management")}
            </h2>
            <p style={{ fontSize: "12px", color: c.muted }}>
              {products.length} {t("منتج", "Products")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 flex-1">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
            <Search className="w-4 h-4" style={{ color: "#E5233B" }} />
            <input
              type="text"
              placeholder={t("بحث...", "Search...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none bg-transparent text-sm"
              style={{ fontFamily: "'Cairo', sans-serif", width: "150px" }}
            />
          </div>
          <button
            type="button"
            onClick={() => { setEditingId(null); setShowForm(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white transition-all transform active:scale-95"
            style={{ background: "#E5233B", fontWeight: 700, fontSize: "13px" }}
          >
            <Plus className="w-4 h-4" />
            {t("إضافة منتج", "Add Product")}
          </button>
          
          <button
            type="button"
            onClick={() => setShowBulkImport(!showBulkImport)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all transform active:scale-95"
            style={{ background: showBulkImport ? c.surface2 : c.surface3, border: `1.5px solid ${c.border}`, fontWeight: 700, fontSize: "13px", color: c.text }}
          >
            <FileUp className="w-4 h-4" style={{ color: "#E5233B" }} />
            {t("استيراد مجمع", "Bulk Import")}
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all transform active:scale-95 disabled:opacity-50"
            style={{ background: c.surface3, border: `1.5px solid ${c.border}`, fontWeight: 700, fontSize: "13px", color: c.text }}
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} style={{ color: "#E5233B" }} />
            {isExporting ? t("جاري التصدير...", "Exporting...") : t("تصدير PDF", "Export PDF")}
          </button>
        </div>
      </div>

      {/* Bulk Import Zone */}
      {showBulkImport && (
        <div className="mb-6">
          <BulkProductImport onImportSuccess={() => {
            fetchData();
          }} />
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: c.surface, border: `1.5px solid ${c.border}` }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: c.surface2, borderBottom: `1.5px solid ${c.border}` }}>
                {([
                  { ar: "المنتج", en: "Product" },
                  { ar: "الماركة", en: "Brand" },
                  { ar: "السعر", en: "Price" },
                  { ar: "المخزون", en: "Stock" },
                  { ar: "الفئة", en: "Category" },
                  { ar: "الإجراءات", en: "Actions" }
                ]).map((h) => (
                  <th key={h.en} className={`px-4 py-3 ${isRTL ? "text-right" : "text-left"}`} style={{ fontSize: "12px", fontWeight: 700, color: "#E5233B" }}>
                    {t(h.ar, h.en)}
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
                    className="border-b transition-colors"
                    style={{ borderColor: c.border }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0" style={{ background: c.surface3 }}>
                          <img src={p.image_url} alt={p?.name?.ar} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "13px", color: c.text }}>{isRTL ? p.name.ar : p.name.en}</p>
                          <p style={{ fontSize: "11px", color: c.muted }}>{isRTL ? p.name.en : p.name.ar}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: c.surface3, color: "#E5233B", fontWeight: 600 }}>
                        {p.brand}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p style={{ fontWeight: 800, color: "#E5233B", fontSize: "14px" }}>{p.price} {currency}</p>
                        {p.original_price && (
                          <p style={{ textDecoration: "line-through", color: c.muted, fontSize: "11px" }}>{p.original_price} {currency}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{
                          background: p.stock > 0 ? (c.dark ? "rgba(16, 185, 129, 0.1)" : "#ECFDF5") : (c.dark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2"),
                          color: p.stock > 0 ? "#10B981" : "#EF4444",
                          fontWeight: 700,
                        }}
                      >
                        {p.stock > 0 ? `${t("متوفر", "Available")} (${p.stock})` : t("نفذ", "Out of stock")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ fontSize: "12px", color: c.text2 }}>{p.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 rounded-lg transition-all"
                          style={{ background: c.dark ? "rgba(59, 130, 246, 0.15)" : "#EFF6FF" }}
                        >
                          <Pencil className="w-4 h-4" style={{ color: "#3B82F6" }} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="p-2 rounded-lg transition-all"
                          style={{ background: c.dark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2" }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setShowForm(false)}>
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: c.surface, border: `2px solid ${c.border}` }}
          >
            <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-inherit" style={{ borderColor: c.border }}>
              <h3 style={{ fontWeight: 800, fontSize: "17px", color: c.text }}>
                {editingId ? t("تعديل المنتج", "Edit Product") : t("إضافة منتج جديد", "Add New Product")}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg transition-colors hover:bg-opacity-10" style={{ background: "transparent" }}>
                <X className="w-5 h-5" style={{ color: "#E5233B" }} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الاسم بالعربية", "Name (Arabic)")}</label>
                  <input value={form.name_ar || ""} onChange={(e) => setForm({ ...form, name_ar: e.target.value })} style={inputStyle} placeholder={t("اسم المنتج", "Product Name")} />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الاسم بالإنجليزية", "Name (English)")}</label>
                  <input value={form.name_en || ""} onChange={(e) => setForm({ ...form, name_en: e.target.value })} style={inputStyle} placeholder="Product Name" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الماركة", "Brand")}</label>
                  <select value={form.brand_id || ""} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} style={inputStyle}>
                    <option value="">{t("اختر الماركة", "Select Brand")}</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الفئة", "Category")}</label>
                  <select value={form.category_id || ""} onChange={(e) => setForm({ ...form, category_id: e.target.value })} style={inputStyle}>
                    <option value="">{t("اختر الفئة", "Select Category")}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{t(cat.name?.ar, cat.name?.en)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <QuantityInput
                  value={form.price || 0}
                  onChange={(v) => setForm({ ...form, price: v })}
                  step={0.5}
                  label={t("السعر", "Price") + ` (${currency})`}
                />
                <QuantityInput
                  value={form.original_price || 0}
                  onChange={(v) => setForm({ ...form, original_price: v })}
                  step={0.5}
                  label={t("السعر الأصلي", "Original Price") + ` (${currency})`}
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("صورة المنتج", "Product Image")}</label>
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
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder={t("وصف المنتج بالأردني...", "Product description in Arabic...")}
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-xs font-semibold" style={{ color: c.text2 }}>{t("الوصف (إنجليزي)", "Description (English)")}</label>
                  <textarea
                    value={form.description_en || ""}
                    onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                    rows={2}
                    style={{ ...inputStyle, resize: "vertical" }}
                    placeholder={t("وصف المنتج بالإنجليزية...", "Product description in English...")}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <div
                    className="w-10 h-5 rounded-full relative transition-colors"
                    style={{ background: (form.stock || 0) > 0 ? "#E5233B" : c.muted }}
                    onClick={() => setForm({ ...form, stock: (form.stock || 0) > 0 ? 0 : 10 })}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                      style={{ right: (form.stock || 0) > 0 ? "2px" : "auto", left: (form.stock || 0) > 0 ? "auto" : "2px" }}
                    />
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: c.text }}>{t("متوفر في المخزون", "In Stock")}</span>
                </label>
                <QuantityInput
                  value={form.stock_quantity || 0}
                  onChange={(v) => setForm({ ...form, stock_quantity: v })}
                  label={t("الكمية المتوفرة", "Stock Quantity")}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
                  style={{ background: "#E5233B", fontWeight: 700 }}
                >
                  <Save className="w-4 h-4" />
                  {editingId ? t("حفظ التعديلات", "Save Changes") : t("إضافة المنتج", "Add Product")}
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 rounded-xl border transition-all"
                  style={{ borderColor: c.border, color: c.text2, background: c.surface2, fontWeight: 600 }}
                >
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
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-sm:p-6 p-10 rounded-2xl text-center shadow-2xl"
            style={{ background: c.surface, border: `2px solid ${c.border}`, maxWidth: "400px" }}
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: c.dark ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2" }}>
              <Trash2 className="w-10 h-10" style={{ color: "#EF4444" }} />
            </div>
            <h3 style={{ fontWeight: 800, fontSize: "19px", marginBottom: "12px", color: c.text }}>{t("حذف المنتج", "Delete Product")}</h3>
            <p style={{ color: c.muted, fontSize: "15px", marginBottom: "28px", lineHeight: 1.6 }}>
              {t("هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.", "Are you sure you want to delete this product? This action cannot be undone.")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-3 rounded-xl text-white shadow-lg transition-transform active:scale-95"
                style={{ background: "#EF4444", fontWeight: 700 }}
              >
                {t("حذف", "Delete")}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border transition-all"
                style={{ borderColor: c.border, color: c.text2, fontWeight: 600 }}
              >
                {t("إلغاء", "Cancel")}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}