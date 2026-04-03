"use client";

import { useState, useEffect, useCallback } from "react";

const t = {
  en: {
    referralsManagement: "Referrals Management",
    reviewAndProcess: "Review and process referral rewards",
    filter: "Filter:",
    all: "All",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    referrerPhone: "Referrer Phone",
    referredPhone: "Referred Phone",
    rewardAmount: "Reward Amount",
    status: "Status",
    date: "Date",
    actions: "Actions",
    noReferrals: "No referrals found",
    approve: "Approve",
    reject: "Reject",
    confirmApprove: "Are you sure you want to approve this referral?",
    confirmReject: "Are you sure you want to reject this referral?",
  },
  ar: {
    referralsManagement: "إدارة الإحالات",
    reviewAndProcess: "مراجعة ومعالجة مكافآت الإحالات",
    filter: "تصفية:",
    all: "الكل",
    pending: "معلق",
    approved: "موافق عليه",
    rejected: "مرفوض",
    referrerPhone: "هاتف المُحيل",
    referredPhone: "هاتف المُحال",
    rewardAmount: "مبلغ المكافأة",
    status: "الحالة",
    date: "التاريخ",
    actions: "الإجراءات",
    noReferrals: "لا توجد إحالات",
    approve: "موافقة",
    reject: "رفض",
    confirmApprove: "هل أنت متأكد أنك تريد الموافقة على هذه الإحالة؟",
    confirmReject: "هل أنت متأكد أنك تريد رفض هذه الإحالة؟",
  },
};

interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredPhone: string;
  status: "pending" | "approved" | "rejected";
  reward: number;
  createdAt: string;
  processedAt: string | null;
}

interface User {
  id: string;
  phone: string;
}

export default function AdminReferralsPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const tr = t[lang];
  const isAr = lang === "ar";

  const statusLabels: Record<string, string> = {
    pending: tr.pending,
    approved: tr.approved,
    rejected: tr.rejected,
  };

  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [referralsRes, usersRes] = await Promise.all([
        fetch("/api/referrals"),
        fetch("/api/users"),
      ]);
      if (referralsRes.ok) {
        const data = await referralsRes.json();
        setReferrals(data.referrals || []);
      }
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function getUserPhone(userId: string): string {
    const user = users.find((u) => u.id === userId);
    return user?.phone || userId;
  }

  async function handleStatusUpdate(id: string, status: "approved" | "rejected") {
    const message =
      status === "approved"
        ? tr.confirmApprove
        : tr.confirmReject;
    if (!confirm(message)) return;

    setUpdating(id);
    try {
      const res = await fetch("/api/referrals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch {
    } finally {
      setUpdating(null);
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
      ? referrals
      : referrals.filter((r) => r.status === filter);

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
          <h1 className="text-2xl font-bold text-gray-900">{tr.referralsManagement}</h1>
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
            <p className="text-sm text-gray-500">{tr.noReferrals}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.referrerPhone}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.referredPhone}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.rewardAmount}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.status}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.date}
                  </th>
                  <th className={`px-6 py-3 ${isAr ? "text-right" : "text-left"} text-xs font-bold text-gray-500 uppercase tracking-wider`}>
                    {tr.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className={`px-6 py-4 text-sm font-medium text-gray-900 ${isAr ? "text-right" : "text-left"}`}>
                      {getUserPhone(r.referrerId)}
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-600 ${isAr ? "text-right" : "text-left"}`}>
                      {r.referredPhone}
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-900 font-semibold ${isAr ? "text-right" : "text-left"}`}>
                      ${r.reward.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 ${isAr ? "text-right" : "text-left"}`}>{statusBadge(r.status)}</td>
                    <td className={`px-6 py-4 text-sm text-gray-500 ${isAr ? "text-right" : "text-left"}`}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 ${isAr ? "text-right" : "text-left"}`}>
                      {r.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusUpdate(r.id, "approved")}
                            disabled={updating === r.id}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            {tr.approve}
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(r.id, "rejected")}
                            disabled={updating === r.id}
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
