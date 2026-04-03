"use client";

import { useState, useEffect } from "react";

const t = {
  en: {
    depositManagement: "Deposit Management",
    reviewAndProcess: "Review and process deposit requests",
    userPhone: "User Phone",
    recipient: "Recipient",
    sender: "Sender",
    amount: "Amount",
    image: "Image",
    status: "Status",
    date: "Date",
    actions: "Actions",
    adminNotes: "Admin Notes",
    transferNumber: "Receipt Number",
    noDeposits: "No deposits found",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    viewImage: "View Image",
    approve: "Approve",
    reject: "Reject",
    depositScreenshot: "Deposit Screenshot",
    close: "Close",
    loading: "Loading deposits...",
    notesPlaceholder: "Add notes or receipt number...",
    saveNote: "Save Note",
    saving: "Saving...",
    receiptPlaceholder: "Enter receipt number...",
  },
  ar: {
    depositManagement: "إدارة الإيداعات",
    reviewAndProcess: "مراجعة ومعالجة طلبات الإيداع",
    userPhone: "هاتف المستخدم",
    recipient: "المستلم",
    sender: "المُرسِل",
    amount: "المبلغ",
    image: "الصورة",
    status: "الحالة",
    date: "التاريخ",
    actions: "الإجراءات",
    adminNotes: "ملاحظات الإدارة",
    transferNumber: "رقم الإيصال",
    noDeposits: "لا توجد إيداعات",
    pending: "معلق",
    approved: "موافق عليه",
    rejected: "مرفوض",
    viewImage: "عرض الصورة",
    approve: "موافقة",
    reject: "رفض",
    depositScreenshot: "لقطة شاشة الإيداع",
    close: "إغلاق",
    loading: "جاري تحميل الإيداعات...",
    notesPlaceholder: "إضافة ملاحظات أو رقم إيصال...",
    saveNote: "حفظ الملاحظة",
    saving: "جاري الحفظ...",
    receiptPlaceholder: "أدخل رقم الإيصال...",
  },
};

interface Deposit {
  id: string;
  userId: string;
  userPhone: string;
  recipientPhone: string;
  senderPhone: string;
  transferNumber: string;
  amount: number;
  image: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  processedAt: string | null;
  adminNotes?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};

export default function AdminDepositsPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const tr = t[lang];
  const isAr = lang === "ar";

  const statusLabels: Record<string, string> = {
    pending: tr.pending,
    approved: tr.approved,
    rejected: tr.rejected,
  };

  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
  const [savingNote, setSavingNote] = useState<string | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  async function fetchDeposits() {
    try {
      const res = await fetch("/api/deposits");
      const data = await res.json();
      setDeposits(data.deposits || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleStatus(id: string, status: "approved" | "rejected") {
    setSaving(id);
    try {
      await fetch("/api/deposits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await fetchDeposits();
    } catch {
    } finally {
      setSaving(null);
    }
  }

  async function handleSaveNote(id: string) {
    setSavingNote(id);
    try {
      await fetch("/api/deposits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, adminNotes: noteInputs[id] || "" }),
      });
      await fetchDeposits();
    } catch {
    } finally {
      setSavingNote(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{tr.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr.depositManagement}</h1>
          <p className="text-sm text-gray-500 mt-1">{tr.reviewAndProcess}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {(["pending", "approved", "rejected"] as const).map((s) => {
              const count = deposits.filter((d) => d.status === s).length;
              return (
                <span
                  key={s}
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[s]}`}
                >
                  {statusLabels[s]}: {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.userPhone}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.recipient}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.sender}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.amount}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.image}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.status}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.date}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.adminNotes}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deposits.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-500">
                    {tr.noDeposits}
                  </td>
                </tr>
              ) : (
                deposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50 transition-colors">
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-medium text-gray-900 whitespace-nowrap`}>
                      {deposit.userPhone}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 text-gray-600 whitespace-nowrap`}>
                      {deposit.recipientPhone}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 text-gray-600 whitespace-nowrap`}>
                      {deposit.senderPhone}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-900 whitespace-nowrap`}>
                      ${deposit.amount.toLocaleString()}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      {deposit.image ? (
                        <button
                          onClick={() => setPreviewImage(deposit.image)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold cursor-pointer"
                        >
                          {tr.viewImage}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[deposit.status]}`}
                      >
                        {statusLabels[deposit.status]}
                      </span>
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 text-gray-500 whitespace-nowrap text-xs`}>
                      {new Date(deposit.createdAt).toLocaleString("en-US")}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={noteInputs[deposit.id] ?? deposit.adminNotes ?? ""}
                            onChange={(e) =>
                              setNoteInputs((prev) => ({
                                ...prev,
                                [deposit.id]: e.target.value,
                              }))
                            }
                            placeholder={tr.notesPlaceholder}
                            className="w-40 px-2 py-1 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-xs"
                          />
                          <button
                            onClick={() => handleSaveNote(deposit.id)}
                            disabled={savingNote === deposit.id}
                            className="px-2 py-1 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                          >
                            {savingNote === deposit.id ? tr.saving : tr.saveNote}
                          </button>
                        </div>
                        {deposit.transferNumber && (
                          <p className="text-[10px] text-gray-500">
                            {tr.transferNumber}: <span className="font-mono font-semibold">{deposit.transferNumber}</span>
                          </p>
                        )}
                      </div>
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      {deposit.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleStatus(deposit.id, "approved")
                            }
                            disabled={saving === deposit.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                          >
                            {saving === deposit.id ? "..." : tr.approve}
                          </button>
                          <button
                            onClick={() =>
                              handleStatus(deposit.id, "rejected")
                            }
                            disabled={saving === deposit.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
                          >
                            {saving === deposit.id ? "..." : tr.reject}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white rounded-2xl p-4 max-w-lg w-full animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">
                {tr.depositScreenshot}
              </h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <img
              src={previewImage}
              alt="Deposit screenshot"
              className="w-full rounded-xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
            >
              {tr.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
