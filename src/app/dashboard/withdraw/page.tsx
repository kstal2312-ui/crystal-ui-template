"use client";

import { useState, useEffect } from "react";

interface UserData {
  id: string;
  phone: string;
  balance: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  paymentPhone: string;
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
    withdraw: "Withdraw",
    subtitle: "Withdraw funds from your account",
    currentBalance: "Current Balance",
    amount: "Amount (USD)",
    paymentPhone: "Payment Phone Number",
    enterAmount: "Enter amount",
    enterPhone: "Enter phone number to receive payment",
    submitWithdrawal: "Submit Withdrawal",
    submitting: "Submitting...",
    withdrawalHistory: "Withdrawal History",
    noWithdrawals: "No withdrawals yet",
    noWithdrawalsDesc: "Your withdrawal history will appear here after you make your first withdrawal.",
    loading: "Loading...",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    errorAmount: "Amount is required",
    errorPhone: "Phone number is required",
    errorInsufficient: "Insufficient balance",
    successMsg: "Withdrawal submitted successfully!",
    errorSubmit: "Failed to submit withdrawal",
  },
  ar: {
    withdraw: "السحب",
    subtitle: "اسحب أموالاً من حسابك",
    currentBalance: "الرصيد الحالي",
    amount: "المبلغ (دولار)",
    paymentPhone: "رقم هاتف الدفع",
    enterAmount: "أدخل المبلغ",
    enterPhone: "أدخل رقم الهاتف لاستلام الدفع",
    submitWithdrawal: "تقديم طلب السحب",
    submitting: "جاري التقديم...",
    withdrawalHistory: "سجل السحوبات",
    noWithdrawals: "لا توجد سحوبات بعد",
    noWithdrawalsDesc: "سيظهر سجل سحوباتك هنا بعد إجراء أول سحب.",
    loading: "جاري التحميل...",
    pending: "قيد الانتظار",
    approved: "مقبول",
    rejected: "مرفوض",
    errorAmount: "المبلغ مطلوب",
    errorPhone: "رقم الهاتف مطلوب",
    errorInsufficient: "الرصيد غير كافٍ",
    successMsg: "تم تقديم طلب السحب بنجاح!",
    errorSubmit: "فشل في تقديم طلب السحب",
  },
};

export default function WithdrawPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");

  const t = translations[lang];

  const [amount, setAmount] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const statusLabels: Record<string, string> = {
    pending: t.pending,
    approved: t.approved,
    rejected: t.rejected,
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, withdrawalsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/withdrawals"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) setUser(meData.user);
        }

        if (withdrawalsRes.ok) {
          const wdData = await withdrawalsRes.json();
          setWithdrawals(wdData.withdrawals || []);
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function toggleLang() {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const numAmount = Number(amount);

    if (!amount || numAmount <= 0) {
      setMessage({ type: "error", text: t.errorAmount });
      return;
    }
    if (!paymentPhone.trim()) {
      setMessage({ type: "error", text: t.errorPhone });
      return;
    }
    if (user && numAmount > user.balance) {
      setMessage({ type: "error", text: t.errorInsufficient });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          paymentPhone: paymentPhone.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWithdrawals((prev) => [data.withdrawal, ...prev]);
        setAmount("");
        setPaymentPhone("");
        setMessage({ type: "success", text: t.successMsg });
      } else {
        const errData = await res.json();
        setMessage({ type: "error", text: errData.error || t.errorSubmit });
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
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{t.withdraw}</h1>
              <p className="text-indigo-100 text-sm mt-1">{t.subtitle}</p>
            </div>
            <button
              onClick={toggleLang}
              className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              {lang === "en" ? "العربية" : "English"}
            </button>
          </div>
          <div className="mt-4 bg-white/10 backdrop-blur rounded-xl px-5 py-3 inline-block">
            <p className="text-indigo-200 text-xs font-medium">{t.currentBalance}</p>
            <p className="text-2xl font-bold">${(user?.balance ?? 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 space-y-5">
        {/* Withdraw Form */}
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
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t.amount}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={user?.balance ?? undefined}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t.enterAmount}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
                />
                {user && user.balance > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(String(user.balance))}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md"
                  >
                    Max: ${user.balance.toLocaleString()}
                  </button>
                )}
              </div>
            </div>

            {/* Payment Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t.paymentPhone}
              </label>
              <input
                type="text"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder={t.enterPhone}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
              />
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
                t.submitWithdrawal
              )}
            </button>
          </div>
        </form>

        {/* Withdrawal History */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">{t.withdrawalHistory}</h2>
          </div>

          {withdrawals.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{t.noWithdrawals}</p>
              <p className="text-xs text-gray-500">{t.noWithdrawalsDesc}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        ${withdrawal.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {withdrawal.paymentPhone}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(withdrawal.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[withdrawal.status]}`}>
                      {statusLabels[withdrawal.status]}
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
