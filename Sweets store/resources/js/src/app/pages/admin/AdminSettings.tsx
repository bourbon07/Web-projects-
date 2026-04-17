import { useState, useEffect } from "react";
import { 
  Settings as SettingsIcon, 
  Upload, 
  Save, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Globe, 
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { useApp, useEPTheme } from "../../context/AppContext";
import axiosConfig from "../../../api/axiosConfig";

export function AdminSettings() {
  const { lang, setSiteName: setGlobalName, setSiteLogo: setGlobalLogo } = useApp();
  const c = useEPTheme();
  
  const isRTL = lang === "ar";
  const t = (ar: string, en: string) => (isRTL ? ar : en);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [siteName, setSiteName] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoDeleted, setLogoDeleted] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axiosConfig.get("/settings");
      setSiteName(res.data.site_name || "");
      setLogoPreview(res.data.site_logo || null);
    } catch (err) {
      console.error("Failed to fetch settings", err);
      setStatus({ type: 'error', message: t("فشل في تحميل الإعدادات", "Failed to load settings") });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoDeleted(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("site_name", siteName);
    if (logoDeleted) {
      formData.append("remove_logo", "1");
    } else if (logoFile) {
      formData.append("site_logo", logoFile);
    }

    try {
      const res = await axiosConfig.post("/admin/settings", formData);
      setSiteName(res.data.site_name);
      setLogoPreview(res.data.site_logo);
      setLogoFile(null);
      setLogoDeleted(false);

      // Instant global update
      setGlobalName(res.data.site_name);
      setGlobalLogo(res.data.site_logo);
      
      setStatus({ type: 'success', message: t("تم حفظ الإعدادات بنجاح", "Settings saved successfully") });
    } catch (err) {
      console.error("Save failed", err);
      const msg = (err as any).response?.data?.message || t("حدث خطأ أثناء الحفظ", "Error occurred while saving");
      setStatus({ type: 'error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#E5233B" }} />
        <p style={{ color: c.muted, fontSize: "14px" }}>{t("جاري تحميل الإعدادات...", "Loading settings...")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: "#E5233B" }}>
          <SettingsIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: 900, color: c.text }}>{t("إعدادات المتجر", "Store Settings")}</h1>
          <p style={{ color: c.muted, fontSize: "14px" }}>{t("تخصيص هوية المتجر والاسم والشعار الخاص بك.", "Customize your store identity, name, and logo.")}</p>
        </div>
      </div>

      {status && (
        <div 
          className={`p-4 rounded-2xl mb-8 flex items-center gap-3 animate-in fade-in slide-in-from-top-4`}
          style={{ 
            background: status.type === 'success' ? '#10B98115' : '#EF444415',
            border: `1.5px solid ${status.type === 'success' ? '#10B98130' : '#EF444430'}`,
            color: status.type === 'success' ? '#10B981' : '#EF4444'
          }}
        >
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p style={{ fontWeight: 600, fontSize: "14px" }}>{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info Card */}
        <div className="p-8 rounded-3xl shadow-sm border transition-all hover:shadow-md" style={{ background: c.surface, borderColor: c.border }}>
          <div className="flex items-center gap-2 mb-6">
            <Globe className="w-5 h-5" style={{ color: "#E5233B" }} />
            <h3 style={{ fontWeight: 800, color: c.text, fontSize: "18px" }}>{t("المعلومات الأساسية", "Basic Information")}</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: c.text2, marginBottom: '8px' }}>
                {t("اسم المتجر", "Store Name")}
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl transition-all border outline-none focus:ring-4"
                style={{ 
                  background: c.surface2, 
                  borderColor: c.border,
                  color: c.text,
                  ['--tw-ring-color' as any]: "#E5233B20"
                }}
                placeholder={t("ادخل اسم المتجر هنا...", "Enter store name here...")}
                required
              />
            </div>
          </div>
        </div>

        {/* Branding Card */}
        <div className="p-8 rounded-3xl shadow-sm border transition-all hover:shadow-md" style={{ background: c.surface, borderColor: c.border }}>
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5" style={{ color: "#E5233B" }} />
            <h3 style={{ fontWeight: 800, color: c.text, fontSize: "18px" }}>{t("الهوية البصرية", "Visual Identity")}</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10">
             {/* Logo Preview */}
             <div className="relative group">
                <div 
                  className="w-48 h-48 rounded-3xl flex items-center justify-center p-4 border-2 border-dashed overflow-hidden" 
                  style={{ background: c.surface2, borderColor: c.border }}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      <p style={{ fontSize: '11px', color: c.muted }}>{t("لا يوجد شعار", "No logo")}</p>
                    </div>
                  )}
                </div>
                {logoPreview && (
                   <button 
                    type="button"
                    onClick={() => { setLogoPreview(null); setLogoFile(null); setLogoDeleted(true); }}
                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                )}
             </div>

             {/* Upload Area */}
             <div className="flex-1 w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-3xl cursor-pointer hover:bg-opacity-50 transition-all group"
                  style={{ background: c.surface2, borderColor: c.border }}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" style={{ color: "#E5233B" }} />
                    </div>
                    <p className="mb-2 text-sm" style={{ color: c.text }}>
                      <span className="font-bold">{t("انقر للرفع", "Click to upload")}</span> {t("أو اسحب وافلت", "or drag and drop")}
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, SVG (Max. 2MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-3 px-10 py-5 rounded-2xl text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
            style={{ 
              background: "#E5233B", 
              fontWeight: 800, 
              fontSize: "16px",
              boxShadow: "0 15px 30px -5px rgba(229, 35, 59, 0.4)"
            }}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("جاري الحفظ...", "Saving...")}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t("حفظ الإعدادات", "Save Settings")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
