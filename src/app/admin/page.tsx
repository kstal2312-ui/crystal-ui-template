"use client";

import { useState, useEffect } from "react";

const t = {
  en: {
    dashboard: "Dashboard",
    overview: "Overview of platform activity",
    totalUsers: "Total Users",
    pendingDeposits: "Pending Deposits",
    pendingWithdrawals: "Pending Withdrawals",
    pendingReferrals: "Pending Referrals",
    recentDeposits: "Recent Deposits",
    recentWithdrawals: "Recent Withdrawals",
    recentReferrals: "Recent Referrals",
    noRecentActivity: "No recent activity",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    reward: "Reward",
    sendNotification: "Send Notification",
    notificationType: "Type",
    notificationMessage: "Message",
    send: "Send",
    notificationSent: "Notification sent to all users!",
  },
  ar: {
    dashboard: "لوحة التحكم",
    overview: "نظرة عامة على نشاط المنصة",
    totalUsers: "إجمالي المستخدمين",
    pendingDeposits: "الإيداعات المعلقة",
    pendingWithdrawals: "السحوبات المعلقة",
    pendingReferrals: "الإحالات المعلقة",
    recentDeposits: "آخر الإيداعات",
    recentWithdrawals: "آخر السحوبات",
    recentReferrals: "آخر الإحالات",
    noRecentActivity: "لا يوجد نشاط حديث",
    pending: "معلق",
    approved: "موافق عليه",
    rejected: "مرفوض",
    reward: "المكافأة",
    sendNotification: "إرسال إشعار",
    notificationType: "النوع",
    notificationMessage: "الرسالة",
    send: "إرسال",
    notificationSent: "تم إرسال الإشعار لجميع المستخدمين!",
  },
};

interface User {
  id: string;
  phone: string;
  balance: number;
  isSubscribed: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Deposit {
  id: string;
  userPhone: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  userPhone: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface Referral {
  id: string;
  referredPhone: string;
  reward: number;
  status: string;
  createdAt: string;
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${gradient}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const tr = t[lang];
  const isAr = lang === "ar";

  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationType, setNotificationType] = useState<"info" | "welcome">("info");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, depositsRes, withdrawalsRes, referralsRes] =
          await Promise.all([
            fetch("/api/users"),
            fetch("/api/deposits"),
            fetch("/api/withdrawals"),
            fetch("/api/referrals"),
          ]);

        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users || []);
        }
        if (depositsRes.ok) {
          const data = await depositsRes.json();
          setDeposits(data.deposits || []);
        }
        if (withdrawalsRes.ok) {
          const data = await withdrawalsRes.json();
          setWithdrawals(data.withdrawals || []);
        }
        if (referralsRes.ok) {
          const data = await referralsRes.json();
          setReferrals(data.referrals || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const pendingDeposits = deposits.filter((d) => d.status === "pending");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const pendingReferrals = referrals.filter((r) => r.status === "pending");

  const recentDeposits = [...deposits].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
  const recentWithdrawals = [...withdrawals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);
  const recentReferrals = [...referrals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      rejected: "bg-red-50 text-red-700 border border-red-200",
    };
    const labels: Record<string, string> = {
      pending: tr.pending,
      approved: tr.approved,
      rejected: tr.rejected,
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}
      >
        {labels[status] || status}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tr.dashboard}</h1>
        <p className="text-sm text-gray-500 mt-1">{tr.overview}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={tr.totalUsers}
          value={users.length}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label={tr.pendingDeposits}
          value={pendingDeposits.length}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />
        <StatCard
          label={tr.pendingWithdrawals}
          value={pendingWithdrawals.length}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label={tr.pendingReferrals}
          value={pendingReferrals.length}
          gradient="bg-gradient-to-br from-pink-500 to-pink-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              {tr.recentDeposits}
            </h2>
          </div>
          {recentDeposits.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-gray-500">{tr.noRecentActivity}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentDeposits.map((d) => (
                <div key={d.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{d.userPhone}</p>
                    <p className="text-xs text-gray-500">${d.amount.toLocaleString()}</p>
                  </div>
                  {statusBadge(d.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              {tr.recentWithdrawals}
            </h2>
          </div>
          {recentWithdrawals.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-gray-500">{tr.noRecentActivity}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentWithdrawals.map((w) => (
                <div key={w.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{w.userPhone}</p>
                    <p className="text-xs text-gray-500">${w.amount.toLocaleString()}</p>
                  </div>
                  {statusBadge(w.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              {tr.recentReferrals}
            </h2>
          </div>
          {recentReferrals.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-gray-500">{tr.noRecentActivity}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentReferrals.map((r) => (
                <div key={r.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.referredPhone}</p>
                    <p className="text-xs text-gray-500">{tr.reward}: ${r.reward.toLocaleString()}</p>
                  </div>
                  {statusBadge(r.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">{tr.sendNotification}</h2>
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
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSending(true);
            setMessage(null);
            try {
              const res = await fetch("/api/broadcast-notification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: notificationType, message: notificationMessage }),
              });
              if (res.ok) {
                setMessage({ type: "success", text: tr.notificationSent });
                setNotificationMessage("");
              } else {
                setMessage({ type: "error", text: "Failed to send notification" });
              }
            } catch {
              setMessage({ type: "error", text: "Failed to send notification" });
            } finally {
              setSending(false);
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {tr.notificationType}
            </label>
            <select
              value={notificationType}
              onChange={(e) => setNotificationType(e.target.value as "info" | "welcome")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="info">Info</option>
              <option value="welcome">Welcome</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {tr.notificationMessage}
            </label>
            <textarea
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Enter notification message..."
            />
          </div>
          <button
            type="submit"
            disabled={sending || !notificationMessage.trim()}
            className="inline-flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {sending ? "Sending..." : tr.send}
          </button>
        </form>
      </div>
    </div>
  );
}
