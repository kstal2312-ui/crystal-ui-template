"use client";

import { useState, useEffect, useRef } from "react";

const t = {
  en: {
    siteSettings: "Site Settings",
    manageConfig: "Manage platform configuration",
    siteName: "Site Name",
    welcomeMessage: "Welcome Message",
    adminPhone: "Admin Phone",
    adminPassword: "Admin Password",
    logoUrl: "Logo URL",
    logoPlaceholder: "/uploads/logo.png",
    uploading: "Uploading...",
    uploadLogo: "Upload Logo",
    logoPreview: "Logo Preview",
    noLogoSet: "No logo set",
    depositPhoneNumbers: "Deposit Phone Numbers",
    newPhoneNumber: "New phone number",
    add: "Add",
    storeManagement: "Store Management",
    storeManagementDesc: "Set the price and daily profit for each store level",
    storeLevel: "Level",
    storePrice: "Price ($)",
    storeProfit: "Daily Profit ($)",
    saving: "Saving...",
    saveSettings: "Save Settings",
    successSaved: "Settings saved successfully!",
    failedSave: "Failed to save settings",
    successLogo: "Logo uploaded successfully!",
    failedLogo: "Failed to upload logo",
  },
  ar: {
    siteSettings: "إعدادات الموقع",
    manageConfig: "إدارة تكوين المنصة",
    siteName: "اسم الموقع",
    welcomeMessage: "رسالة الترحيب",
    adminPhone: "هاتف المسؤول",
    adminPassword: "كلمة مرور المسؤول",
    logoUrl: "رابط الشعار",
    logoPlaceholder: "/uploads/logo.png",
    uploading: "جاري الرفع...",
    uploadLogo: "رفع الشعار",
    logoPreview: "معاينة الشعار",
    noLogoSet: "لم يتم تعيين شعار",
    depositPhoneNumbers: "أرقام هواتف الإيداع",
    newPhoneNumber: "رقم هاتف جديد",
    add: "إضافة",
    storeManagement: "إدارة المتاجر",
    storeManagementDesc: "تعيين سعر وربح يومي لكل مستوى متجر",
    storeLevel: "المستوى",
    storePrice: "السعر ($)",
    storeProfit: "الربح اليومي ($)",
    saving: "جاري الحفظ...",
    saveSettings: "حفظ الإعدادات",
    successSaved: "تم حفظ الإعدادات بنجاح!",
    failedSave: "فشل في حفظ الإعدادات",
    successLogo: "تم رفع الشعار بنجاح!",
    failedLogo: "فشل في رفع الشعار",
  },
};

interface Settings {
  siteName: string;
  welcomeMessage: string;
  adminPhone: string;
  adminPassword: string;
  logo: string;
  depositPhones: string[];
  storePrices?: number[];
  storeProfits?: number[];
}

export default function AdminSettingsPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const tr = t[lang];
  const isAr = lang === "ar";

  const [settings, setSettings] = useState<Settings>({
    siteName: "",
    welcomeMessage: "",
    adminPhone: "",
    adminPassword: "",
    logo: "",
    depositPhones: [],
    storePrices: [0, 80, 200, 400, 800, 1600, 3200, 6400, 12800, 25600],
    storeProfits: [2, 4, 10, 20, 40, 80, 160, 320, 640, 1280],
  });
  const [newPhone, setNewPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings({
            siteName: data.siteName || "",
            welcomeMessage: data.welcomeMessage || "",
            adminPhone: data.adminPhone || "",
            adminPassword: data.adminPassword || "",
            logo: data.logo || "",
            depositPhones: data.depositPhones || [],
            storePrices: data.storePrices || [0, 80, 200, 400, 800, 1600, 3200, 6400, 12800, 25600],
            storeProfits: data.storeProfits || [2, 4, 10, 20, 40, 80, 160, 320, 640, 1280],
          });
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  function handleChange(field: keyof Settings, value: string | number) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  function addPhone() {
    const trimmed = newPhone.trim();
    if (trimmed && !settings.depositPhones.includes(trimmed)) {
      setSettings((prev) => ({
        ...prev,
        depositPhones: [...prev.depositPhones, trimmed],
      }));
      setNewPhone("");
    }
  }

  function removePhone(phone: string) {
    setSettings((prev) => ({
      ...prev,
      depositPhones: prev.depositPhones.filter((p) => p !== phone),
    }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setSettings((prev) => ({ ...prev, logo: data.url }));
        setMessage({ type: "success", text: tr.successLogo });
      } else {
        setMessage({ type: "error", text: tr.failedLogo });
      }
    } catch {
      setMessage({ type: "error", text: tr.failedLogo });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage({ type: "success", text: tr.successSaved });
      } else {
        setMessage({ type: "error", text: tr.failedSave });
      }
    } catch {
      setMessage({ type: "error", text: tr.failedSave });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="animate-fade-in space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tr.siteSettings}</h1>
        <p className="text-sm text-gray-500 mt-1">{tr.manageConfig}</p>
      </div>

      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${message.type === "success"
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-red-50 text-red-700 border border-red-200"
            }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {tr.siteName}
          </label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => handleChange("siteName", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {tr.welcomeMessage}
          </label>
          <textarea
            value={settings.welcomeMessage}
            onChange={(e) => handleChange("welcomeMessage", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {tr.adminPhone}
          </label>
          <input
            type="text"
            value={settings.adminPhone}
            onChange={(e) => handleChange("adminPhone", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {tr.adminPassword}
          </label>
          <input
            type="password"
            value={settings.adminPassword}
            onChange={(e) => handleChange("adminPassword", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {tr.logoUrl}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={settings.logo}
              onChange={(e) => handleChange("logo", e.target.value)}
              placeholder={tr.logoPlaceholder}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {uploading ? tr.uploading : tr.uploadLogo}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            {tr.logoPreview}
          </label>
          <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
            {settings.logo ? (
              <img
                src={settings.logo}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-xs text-gray-400">{tr.noLogoSet}</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          {tr.depositPhoneNumbers}
        </h2>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addPhone()}
            placeholder={tr.newPhoneNumber}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={addPhone}
            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            {tr.add}
          </button>
        </div>

        {settings.depositPhones.length === 0 ? (
          <p className="text-sm text-gray-400">—</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {settings.depositPhones.map((phone) => (
              <span
                key={phone}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700"
              >
                {phone}
                <button
                  onClick={() => removePhone(phone)}
                  className="text-red-500 hover:text-red-700 font-bold text-xs"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            {tr.storeManagement}
          </h2>
          <p className="text-xs text-gray-500 mt-1">{tr.storeManagementDesc}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 10 }, (_, i) => {
            const level = i + 1;
            const storePrices = settings.storePrices || [0, 80, 200, 400, 800, 1600, 3200, 6400, 12800, 25600];
            const storeProfits = settings.storeProfits || [2, 4, 10, 20, 40, 80, 160, 320, 640, 1280];
            return (
              <div key={level} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {level}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-600">{tr.storeLevel} {level}</p>
                  <div className="flex gap-2 mt-1">
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400">{tr.storePrice}</label>
                      <input
                        type="number"
                        min="0"
                        value={storePrices[i] ?? 0}
                        onChange={(e) => {
                          const newPrices = [...storePrices];
                          newPrices[i] = Number(e.target.value);
                          setSettings((prev) => ({ ...prev, storePrices: newPrices }));
                        }}
                        className="w-full px-2 py-1 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400">{tr.storeProfit}</label>
                      <input
                        type="number"
                        min="0"
                        value={storeProfits[i] ?? 0}
                        onChange={(e) => {
                          const newProfits = [...storeProfits];
                          newProfits[i] = Number(e.target.value);
                          setSettings((prev) => ({ ...prev, storeProfits: newProfits }));
                        }}
                        className="w-full px-2 py-1 rounded border border-gray-300 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {saving ? tr.saving : tr.saveSettings}
        </button>
      </div>
    </div>
  );
}
