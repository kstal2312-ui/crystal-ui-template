"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface UserData {
  id: string;
  phone: string;
  invitationCode: string;
  balance: number;
  profits: number;
  totalEarned: number;
  referralCount: number;
  subscriptionLevel: number;
  isSubscribed: boolean;
  subscriptionPaid: boolean;
  subscriptionAccepted: boolean;
  createdAt: string;
}

interface Task {
  id: string;
  productName: string;
  productImage: string;
  productPrice: number;
  commission: number;
  commissionPercent: number;
  status: "pending" | "accepted" | "declined" | "completed";
  createdAt: string;
  scheduledFor: string;
}

const translations = {
  en: {
    welcomeBack: "Welcome back",
    totalBalance: "Total Balance",
    totalProfits: "Total Profits",
    totalEarned: "Total Earned",
    referrals: "Referrals",
    subscriptionLevel: "Subscription Level",
    recentTasks: "Recent Tasks",
    viewAll: "View All",
    noTasks: "No tasks available yet",
    noTasksSub: "Tasks will appear here once your subscription is active.",
    commission: "Commission",
    subscribed: "Subscribed",
    pendingApproval: "Pending Approval",
    notSubscribed: "Not Subscribed",
    subscriptionStatus: "Subscription Status",
    pending: "Pending",
    completed: "Completed",
    accepted: "Accepted",
    declined: "Declined",
  },
  ar: {
    welcomeBack: "مرحباً بعودتك",
    totalBalance: "إجمالي الرصيد",
    totalProfits: "إجمالي الأرباح",
    totalEarned: "إجمالي المكتسبات",
    referrals: "الإحالات",
    subscriptionLevel: "مستوى الاشتراك",
    recentTasks: "المهام الأخيرة",
    viewAll: "عرض الكل",
    noTasks: "لا توجد مهام حتى الآن",
    noTasksSub: "ستظهر المهام هنا بمجرد تفعيل اشتراكك.",
    commission: "العمولة",
    subscribed: "مشترك",
    pendingApproval: "في انتظار الموافقة",
    notSubscribed: "غير مشترك",
    subscriptionStatus: "حالة الاشتراك",
    pending: "قيد الانتظار",
    completed: "مكتمل",
    accepted: "مقبول",
    declined: "مرفوض",
  },
};

function StatusBadge({ status, t }: { status: string; t: Record<string, string> }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    accepted: "bg-blue-50 text-blue-700 border border-blue-200",
    declined: "bg-red-50 text-red-700 border border-red-200",
  };

  const labels: Record<string, string> = {
    pending: t.pending,
    completed: t.completed,
    accepted: t.accepted,
    declined: t.declined,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}
    >
      {labels[status] || status}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--color-border)] hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
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

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "ar">("en");

  const t = translations[lang];

  useEffect(() => {
    const dir = document.documentElement.dir;
    setLang(dir === "ar" ? "ar" : "en");

    const observer = new MutationObserver(() => {
      const newDir = document.documentElement.dir;
      setLang(newDir === "ar" ? "ar" : "en");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, tasksRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/tasks"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) setUser(meData.user);
        }

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData.tasks || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const recentTasks = tasks.slice(0, 3);

  const getSubscriptionLabel = () => {
    if (!user) return t.notSubscribed;
    if (user.isSubscribed && user.subscriptionAccepted) return t.subscribed;
    if (user.subscriptionPaid && !user.subscriptionAccepted) return t.pendingApproval;
    return t.notSubscribed;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {t.welcomeBack}
          </h1>
          {user && (
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {user.phone}
            </p>
          )}
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium text-indigo-700">
            {t.subscriptionStatus}: {getSubscriptionLabel()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label={t.totalBalance}
          value={`$${(user?.balance ?? 0).toLocaleString()}`}
          gradient="bg-gradient-to-br from-indigo-500 to-indigo-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label={t.totalProfits}
          value={`$${(user?.profits ?? 0).toLocaleString()}`}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          label={t.totalEarned}
          value={`$${(user?.totalEarned ?? 0).toLocaleString()}`}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatCard
          label={t.referrals}
          value={`${user?.referralCount ?? 0}`}
          gradient="bg-gradient-to-br from-pink-500 to-pink-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <StatCard
          label={t.subscriptionLevel}
          value={`LV ${user?.subscriptionLevel ?? 0}`}
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
          icon={
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-border)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-bold text-[var(--color-text)]">
            {t.recentTasks}
          </h2>
          <Link
            href="/dashboard/tasks"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            {t.viewAll}
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[var(--color-text)] mb-1">
              {t.noTasks}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {t.noTasksSub}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {task.productImage ? (
                  <img
                    src={task.productImage}
                    alt={task.productName}
                    className="w-12 h-12 rounded-xl object-cover border border-[var(--color-border)]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate">
                    {task.productName}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    ${task.productPrice.toLocaleString()} &middot; {t.commission}: {task.commissionPercent}% (${task.commission.toFixed(2)})
                  </p>
                </div>
                <StatusBadge status={task.status} t={t} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
