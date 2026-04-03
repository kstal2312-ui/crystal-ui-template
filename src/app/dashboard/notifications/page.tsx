"use client";

import { useState, useEffect, useCallback } from "react";

interface Notification {
  id: string;
  type: "withdrawal" | "reward" | "prize";
  message: string;
  messageAr: string;
  userName: string;
  amount: number;
  createdAt: string;
}

const translations = {
  en: {
    notifications: "Notifications",
    subtitle: "Live activity feed",
    autoRefresh: "Auto-refreshes every 7 min",
    noNotifications: "No notifications yet",
    noNotificationsDesc: "Activity will appear here as it happens.",
    withdrawal: "Withdrawal",
    reward: "Reward",
    prize: "Prize",
    loading: "Loading...",
    justNow: "just now",
    minAgo: "min ago",
    hAgo: "h ago",
    dAgo: "d ago",
  },
  ar: {
    notifications: "الإشعارات",
    subtitle: "موجة النشاط المباشر",
    autoRefresh: "يتم التحديث تلقائياً كل 7 دقائق",
    noNotifications: "لا توجد إشعارات بعد",
    noNotificationsDesc: "سيظهر النشاط هنا فور حدوثه.",
    withdrawal: "سحب",
    reward: "مكافأة",
    prize: "جائزة",
    loading: "جاري التحميل...",
    justNow: "الآن",
    minAgo: "دقيقة مضت",
    hAgo: "ساعة مضت",
    dAgo: "يوم مضى",
  },
};

function WithdrawalIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function RewardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PrizeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function timeAgo(dateStr: string, t: typeof translations.en): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return t.justNow;
  if (diffMin < 60) return `${diffMin} ${t.minAgo}`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} ${t.hAgo}`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} ${t.dAgo}`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "ar">("en");

  const t = translations[lang];

  const typeConfig: Record<string, { bg: string; ring: string; text: string; icon: React.ReactNode; label: string }> = {
    withdrawal: {
      bg: "bg-blue-50",
      ring: "ring-blue-200",
      text: "text-blue-600",
      icon: <WithdrawalIcon />,
      label: t.withdrawal,
    },
    reward: {
      bg: "bg-emerald-50",
      ring: "ring-emerald-200",
      text: "text-emerald-600",
      icon: <RewardIcon />,
      label: t.reward,
    },
    prize: {
      bg: "bg-amber-50",
      ring: "ring-amber-200",
      text: "text-amber-600",
      icon: <PrizeIcon />,
      label: t.prize,
    },
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 7 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  function toggleLang() {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t.notifications}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer border border-indigo-100"
          >
            {lang === "en" ? "العربية" : "English"}
          </button>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-100">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-indigo-700">
              {t.autoRefresh}
            </span>
          </div>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            {t.noNotifications}
          </p>
          <p className="text-xs text-gray-500">
            {t.noNotificationsDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const config = typeConfig[notif.type] || typeConfig.reward;

            return (
              <div
                key={notif.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${config.bg} ring-1 ${config.ring} ${config.text} flex items-center justify-center flex-shrink-0`}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {notif.userName}
                      </p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {lang === "ar" ? notif.messageAr : notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        ${notif.amount.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {timeAgo(notif.createdAt, t)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
