"use client";

import { useState, useEffect, useRef } from "react";

interface Deposit {
  id: string;
  recipientPhone: string;
  senderPhone: string;
  transferNumber: string;
  amount: number;
  image: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};

const translations = {
  en: {
    deposit: "Deposit",
    subtitle: "Add funds to your account",
    recipientPhone: "Recipient Phone",
    senderPhone: "Your Phone Number",
    transferNumber: "Transfer Number",
    amount: "Amount (USD)",
    attachImage: "Attach Payment Screenshot",
    changeImage: "Change Image",
    remove: "Remove",
    submitDeposit: "Submit Deposit",
    submitting: "Submitting...",
    depositHistory: "Deposit History",
    noDeposits: "No deposits yet",
    noDepositsDesc: "Your deposit history will appear here after you make your first deposit.",
    loading: "Loading...",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    selectRecipient: "Select recipient phone",
    enterPhone: "Enter your phone number",
    enterAmount: "Enter amount",
    successMsg: "Deposit submitted successfully!",
    errorRecipient: "Please select a recipient phone",
    errorPhone: "Phone number is required",
    errorAmount: "Amount is required",
    errorUpload: "Image upload failed - deposit will be submitted without image",
    errorSubmit: "Failed to submit deposit",
    adminNotes: "Admin Notes",
  },
  ar: {
    deposit: "الإيداع",
    subtitle: "أضف أموالاً إلى حسابك",
    recipientPhone: "هاتف المستلم",
    senderPhone: "رقم هاتفك",
    transferNumber: "رقم التحويل",
    amount: "المبلغ (دولار)",
    attachImage: "إرفاق لشاشة الدفع",
    changeImage: "تغيير الصورة",
    remove: "إزالة",
    submitDeposit: "تقديم الإيداع",
    submitting: "جاري التقديم...",
    depositHistory: "سجل الإيداعات",
    noDeposits: "لا توجد إيداعات بعد",
    noDepositsDesc: "سيظهر سجل إيداعاتك هنا بعد إجراء أول إيداع.",
    loading: "جاري التحميل...",
    pending: "قيد الانتظار",
    approved: "مقبول",
    rejected: "مرفوض",
    selectRecipient: "اختر هاتف المستلم",
    enterPhone: "أدخل رقم هاتفك",
    enterAmount: "أدخل المبلغ",
    successMsg: "تم تقديم الإيداع بنجاح!",
    errorRecipient: "يرجى اختيار هاتف المستلم",
    errorPhone: "رقم الهاتف مطلوب",
    errorAmount: "المبلغ مطلوب",
    errorUpload: "فشل تحميل الصورة - سيتم تقديم الإيداع بدون صورة",
    errorSubmit: "فشل في تقديم الإيداع",
    adminNotes: "ملاحظات المسؤول",
  },
};

export default function DepositPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [depositPhones, setDepositPhones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");

  const t = translations[lang];

  const [recipientPhone, setRecipientPhone] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusLabels: Record<string, string> = {
    pending: t.pending,
    approved: t.approved,
    rejected: t.rejected,
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, depositsRes] = await Promise.all([
          fetch("/api/settings"),
          fetch("/api/deposits"),
        ]);

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setDepositPhones(settingsData.depositPhones || []);
          if ((settingsData.depositPhones || []).length > 0) {
            setRecipientPhone(settingsData.depositPhones[0]);
          }
        }

        if (depositsRes.ok) {
          const depData = await depositsRes.json();
          setDeposits(depData.deposits || []);
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function toggleLang() {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!recipientPhone) {
      setMessage({ type: "error", text: t.errorRecipient });
      return;
    }
    if (!senderPhone.trim()) {
      setMessage({ type: "error", text: t.errorPhone });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setMessage({ type: "error", text: t.errorAmount });
      return;
    }

    setSubmitting(true);

    let imageUrl: string | null = null;

    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        } else {
          setMessage({ type: "error", text: t.errorUpload });
        }
      } catch {
        setMessage({ type: "error", text: t.errorUpload });
      }
    }

    try {
      const res = await fetch("/api/deposits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPhone,
          senderPhone: senderPhone.trim(),
          transferNumber: "",
          amount: Number(amount),
          image: imageUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDeposits((prev) => [data.deposit, ...prev]);
        setAmount("");
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setMessage({ type: "success", text: t.successMsg });
      } else {
        setMessage({ type: "error", text: t.errorSubmit });
      }
    } catch {
      setMessage({ type: "error", text: t.errorSubmit });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 pt-6 pb-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.deposit}</h1>
            <p className="text-indigo-100 text-sm mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={toggleLang}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 space-y-5">
        {/* Deposit Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {message && (
            <div
              className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-4">
            {/* Recipient Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t.recipientPhone}
              </label>
              {depositPhones.length > 0 ? (
                <select
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm bg-white"
                >
                  {depositPhones.map((phone) => (
                    <option key={phone} value={phone}>
                      {phone}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder={t.selectRecipient}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
                />
              )}
            </div>

            {/* Sender Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t.senderPhone}
              </label>
              <input
                type="text"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder={t.enterPhone}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t.amount}
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t.enterAmount}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t.attachImage}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      {t.changeImage}
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      {t.remove}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
                >
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">{t.attachImage}</span>
                </button>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.submitting}
                </span>
              ) : (
                t.submitDeposit
              )}
            </button>
          </div>
        </form>

        {/* Deposit History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">{t.depositHistory}</h2>
          </div>

          {deposits.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{t.noDeposits}</p>
              <p className="text-xs text-gray-500">{t.noDepositsDesc}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          ${deposit.amount.toLocaleString()}
                        </p>
                        {deposit.transferNumber && (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            #{deposit.transferNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {deposit.senderPhone} &rarr; {deposit.recipientPhone}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(deposit.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[deposit.status]}`}>
                      {statusLabels[deposit.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
