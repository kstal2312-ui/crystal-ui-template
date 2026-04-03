"use client";

import { useState, useEffect, useCallback } from "react";

const t = {
  en: {
    withdrawalsManagement: "Withdrawals Management",
    reviewAndProcess: "Review and process withdrawal requests",
    filter: "Filter:",
    all: "All",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    userPhone: "User Phone",
    amount: "Amount",
    paymentPhone: "Payment Phone",
    status: "Status",
    date: "Date",
    actions: "Actions",
    adminNotes: "Admin Notes",
    noWithdrawals: "No withdrawals found",
    approve: "Approve",
    reject: "Reject",
    notesPlaceholder: "Add notes...",
    saveNote: "Save Note",
    saving: "Saving...",
    confirmApprove: "Are you sure you want to approve this withdrawal?",
    confirmReject: "Are you sure you want to reject this withdrawal?",
  },
  ar: {
    withdrawalsManagement: "إدارة السحوبات",
    reviewAndProcess: "مراجعة ومعالجة طلبات السحب",
    filter: "تصفية:",
    all: "الكل",
    pending: "معلق",
    approved: "موافق عليه",
    rejected: "مرفوض",
    userPhone: "هاتف المستخدم",
    amount: "المبلغ",
    paymentPhone: "هاتف الدفع",
    status: "الحالة",
    date: "التاريخ",
    actions: "الإجراءات",
    adminNotes: "ملاحظات الإدارة",
    noWithdrawals: "لا توجد سحوبات",
    approve: "موافقة",
    reject: "رفض",
    notesPlaceholder: "إضافة ملاحظات...",
    saveNote: "حفظ الملاحظة",
    saving: "جاري الحفظ...",
    confirmApprove: "هل أنت متأكد أنك تريد الموافقة على هذا السحب؟",
    confirmReject: "هل أنت متأكد أنك تريد رفض هذا السحب؟",
  },
};

interface Withdrawal {
  id: string;
  userId: string;
  userPhone: string;
  amount: number;
  paymentPhone: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt: string | null;
  adminNotes?: string;
}

export default function AdminWithdrawalsPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const tr = t[lang];
  const isAr = lang === "ar";

  const statusLabels: Record<string, string> = {
    pending: tr.pending,
    approved: tr.approved,
    rejected: tr.rejected,
  };

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const res = await fetch("/api/withdrawals");
      if (res.ok) {
        const data = await res.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  async function handleStatusUpdate(id: string, status: "approved" | "rejected") {
    const message =
      status === "approved"
        ? tr.confirmApprove
        : tr.confirmReject;
    if (!confirm(message)) return;

    setUpdating(id);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await fetchWithdrawals();
      }
    } catch {
    } finally {
      setUpdating(null);
    }
  }

  async function handleSaveNote(id: string) {
    setSavingNote(id);
    try {
      const res = await fetch("/api/withdrawals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminNotes: noteInputs[id] || "" }),
      });
      if (res.ok) {
        await fetchWithdrawals();
      }
    } catch {
    } finally {
      setSavingNote(null);
    }
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      rejected: "bg-red-50 text-red-700 border border-red-200",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          styles[status] || styles.pending
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  }

  const filtered =
    filter === "all"
      ? withdrawals
      : withdrawals.filter((w) => w.status === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr.withdrawalsManagement}</h1>
          <p className="text-sm text-gray-500 mt-1">{tr.reviewAndProcess}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">{tr.filter}</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">{tr.all}</option>
            <option value="pending">{tr.pending}</option>
            <option value="approved">{tr.approved}</option>
            <option value="rejected">{tr.rejected}</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {sorted.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500">{tr.noWithdrawals}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.userPhone}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.amount}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.paymentPhone}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.status}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.date}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.adminNotes}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50 transition-colors">
                    <td className={`px-6 py-4 text-sm font-medium text-gray-900 ${isAr ? "text-right" : "text-left"}`}>
                      {w.userPhone}
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-900 font-semibold ${isAr ? "text-right" : "text-left"}`}>
                      ${w.amount.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-600 ${isAr ? "text-right" : "text-left"}`}>
                      {w.paymentPhone}
                    </td>
                    <td className={`px-6 py-4 ${isAr ? "text-right" : "text-left"}`}>{statusBadge(w.status)}</td>
                    <td className={`px-6 py-4 text-sm text-gray-500 ${isAr ? "text-right" : "text-left"}`}>
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 ${isAr ? "text-right" : "text-left"}`}>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={noteInputs[w.id] ?? w.adminNotes ?? ""}
                          onChange={(e) =>
                            setNoteInputs((prev) => ({
                              ...prev,
                              [w.id]: e.target.value,
                            }))
                          }
                          placeholder={tr.notesPlaceholder}
                          className="w-32 px-2 py-1 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-xs"
                        />
                        <button
                          onClick={() => handleSaveNote(w.id)}
                          disabled={savingNote === w.id}
                          className="px-2 py-1 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                        >
                          {savingNote === w.id ? tr.saving : tr.saveNote}
                        </button>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isAr ? "text-right" : "text-left"}`}>
                      {w.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusUpdate(w.id, "approved")}
                            disabled={updating === w.id}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            {tr.approve}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(w.id, "rejected")}
                            disabled={updating === w.id}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {tr.reject}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
