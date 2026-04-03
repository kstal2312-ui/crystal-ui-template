"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
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

const translations = {
  en: {
    dashboard: "Dashboard",
    stores: "Stores",
    tasks: "Tasks",
    profile: "Profile",
    deposit: "Deposit",
    withdraw: "Withdraw",
    notifications: "Notifications",
    balance: "Balance",
    logout: "Logout",
    phone: "Phone",
    level: "Level",
    crystalOne: "Crystal One",
  },
  ar: {
    dashboard: "لوحة التحكم",
    stores: "المتاجر",
    tasks: "المهام",
    profile: "الملف الشخصي",
    deposit: "إيداع",
    withdraw: "سحب",
    notifications: "الإشعارات",
    balance: "الرصيد",
    logout: "تسجيل الخروج",
    phone: "الهاتف",
    level: "المستوى",
    crystalOne: "كريستال ون",
  },
};

function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function StoresIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function TasksIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function DepositIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  );
}

function WithdrawIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function NotificationsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"en" | "ar">("en");

  const t = translations[lang];

  const navItems = [
    { href: "/dashboard", label: t.dashboard, icon: DashboardIcon },
    { href: "/dashboard/stores", label: t.stores, icon: StoresIcon },
    { href: "/dashboard/tasks", label: t.tasks, icon: TasksIcon },
    { href: "/dashboard/profile", label: t.profile, icon: ProfileIcon },
    { href: "/dashboard/deposit", label: t.deposit, icon: DepositIcon },
    { href: "/dashboard/withdraw", label: t.withdraw, icon: WithdrawIcon },
    { href: "/dashboard/notifications", label: t.notifications, icon: NotificationsIcon },
  ];

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  };

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-[var(--color-text-muted)] text-sm font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isRtl = lang === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen flex bg-[var(--color-bg)]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 h-full w-72 bg-white border-e border-[var(--color-border)] z-40 transform transition-transform duration-300 lg:translate-x-0 ${
          isRtl ? "right-0" : "left-0"
        } ${
          sidebarOpen
            ? "translate-x-0"
            : isRtl
              ? "translate-x-full"
              : "-translate-x-full"
        } lg:static lg:z-auto`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-6 h-6" viewBox="0 0 120 130" fill="none">
                    <polygon points="60,8 20,48 28,118 60,125" fill="#4c1d95" />
                    <polygon points="60,8 100,48 92,118 60,125" fill="#5b21b6" />
                    <polygon points="60,8 20,48 42,42" fill="#a78bfa" opacity="0.9" />
                    <polygon points="60,8 100,48 78,42" fill="#8b5cf6" opacity="0.85" />
                    <polygon points="42,42 78,42 60,125" fill="#8b5cf6" opacity="0.7" />
                    <polygon points="20,48 42,42 60,125 28,118" fill="#7c3aed" opacity="0.8" />
                    <polygon points="100,48 78,42 60,125 92,118" fill="#6d28d9" opacity="0.75" />
                    <line x1="60" y1="8" x2="20" y2="48" stroke="white" strokeWidth="2" opacity="0.5" />
                    <line x1="60" y1="8" x2="100" y2="48" stroke="white" strokeWidth="2" opacity="0.5" />
                    <line x1="42" y1="42" x2="78" y2="42" stroke="white" strokeWidth="1.5" opacity="0.3" />
                    <polygon points="60,12 48,38 55,35" fill="white" opacity="0.5" />
                    <polygon points="60,12 72,38 65,35" fill="white" opacity="0.4" />
                    <circle cx="52" cy="30" r="2.5" fill="white" opacity="0.8" />
                    <circle cx="73" cy="55" r="1.5" fill="white" opacity="0.6" />
                  </svg>
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {t.crystalOne}
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-[var(--color-border)]">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
              <p className="text-xs text-[var(--color-text-muted)] font-medium mb-1">
                {t.phone}
              </p>
              <p className="text-sm font-semibold text-[var(--color-text)] mb-3">
                {user.phone}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] font-medium mb-1">
                {t.balance}
              </p>
              <p className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                ${user.balance.toLocaleString()}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">
                  {t.level}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                  {user.subscriptionLevel}
                </span>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`sidebar-link ${isActive ? "active" : ""}`}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-[var(--color-border)]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {t.logout}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[var(--color-border)]">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <MenuIcon />
            </button>

            <div className="hidden lg:block" />

            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              {lang === "en" ? "العربية" : "English"}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
