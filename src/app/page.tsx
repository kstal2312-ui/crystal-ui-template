"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const translations = {
  en: {
    welcome: "Welcome to Crystal One",
    subtitle: "Your trusted shopping and earning platform",
    description:
      "Join thousands of users earning daily profits through our innovative store system. Subscribe to stores, complete sales tasks, and earn commissions.",
    login: "Sign In",
    register: "Create Account",
    adminLogin: "Admin Login",
    features: [
      { title: "10 Store Levels", desc: "From free to premium, choose your level" },
      { title: "Daily Tasks", desc: "Complete sales tasks and earn commissions" },
      { title: "Referral Rewards", desc: "Earn $10 for each friend you invite" },
      { title: "Secure Payments", desc: "Safe and reliable payment system" },
    ],
    langToggle: "العربية",
  },
  ar: {
    welcome: "مرحباً بكم في كريستال وان",
    subtitle: "منصتك الموثوقة للتسوق والربح",
    description:
      "انضم إلى آلاف المستخدمين الذين يحققون أرباحاً يومية من خلال نظام المتاجر المبتكر. اشترك في المتاجر، وأكمل مهام البيع، واحصل على عمولاتك.",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    adminLogin: "دخول المسؤول",
    features: [
      { title: "10 مستويات متاجر", desc: "من المجاني إلى المميز، اختر مستواك" },
      { title: "مهام يومية", desc: "أكمل مهام البيع واحصل على العمولات" },
      { title: "مكافآت الإحالة", desc: "احصل على 10$ لكل صديق تدعوه" },
      { title: "مدفوعات آمنة", desc: "نظام دفع آمن وموثوق" },
    ],
    langToggle: "English",
  },
};

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const t = translations[lang];

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.isAdmin) {
          router.replace("/admin");
        } else if (data.user) {
          router.replace("/dashboard");
        }
      } catch {
        // Not logged in, show landing page
      }
    }
    checkAuth();
  }, [router]);

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800"
    >
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <a
          href="/login"
          className="bg-white/10 backdrop-blur-sm text-white/70 px-3 py-2 rounded-lg text-xs font-medium hover:bg-white/20 hover:text-white transition-colors border border-white/10"
        >
          {t.adminLogin}
        </a>
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
        >
          {t.langToggle}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-3xl animate-fade-in">
          <div className="mb-6">
            <svg className="w-24 h-24 mx-auto drop-shadow-2xl" viewBox="0 0 120 130" fill="none">
              <defs>
                <linearGradient id="crystalBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="30%" stopColor="#a78bfa" />
                  <stop offset="60%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
                <linearGradient id="crystalLeft" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
                <linearGradient id="crystalRight" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#5b21b6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <polygon points="60,8 20,48 28,118 60,125" fill="url(#crystalLeft)" />
              <polygon points="60,8 100,48 92,118 60,125" fill="url(#crystalRight)" />
              <polygon points="60,8 20,48 42,42" fill="url(#crystalBody)" opacity="0.9" />
              <polygon points="60,8 100,48 78,42" fill="url(#crystalBody)" opacity="0.85" />
              <polygon points="42,42 78,42 60,125" fill="url(#crystalBody)" opacity="0.7" />
              <polygon points="20,48 42,42 60,125 28,118" fill="url(#crystalLeft)" opacity="0.8" />
              <polygon points="100,48 78,42 60,125 92,118" fill="url(#crystalRight)" opacity="0.75" />
              <line x1="60" y1="8" x2="20" y2="48" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="60" y1="8" x2="100" y2="48" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="60" y1="8" x2="42" y2="42" stroke="white" strokeWidth="0.8" opacity="0.4" />
              <line x1="60" y1="8" x2="78" y2="42" stroke="white" strokeWidth="0.8" opacity="0.4" />
              <line x1="42" y1="42" x2="78" y2="42" stroke="white" strokeWidth="0.8" opacity="0.3" />
              <line x1="20" y1="48" x2="28" y2="118" stroke="white" strokeWidth="0.5" opacity="0.2" />
              <line x1="100" y1="48" x2="92" y2="118" stroke="white" strokeWidth="0.5" opacity="0.2" />
              <line x1="28" y1="118" x2="60" y2="125" stroke="white" strokeWidth="0.5" opacity="0.15" />
              <line x1="92" y1="118" x2="60" y2="125" stroke="white" strokeWidth="0.5" opacity="0.15" />
              <polygon points="60,12 48,38 55,35" fill="white" opacity="0.45" />
              <polygon points="60,12 72,38 65,35" fill="white" opacity="0.35" />
              <circle cx="52" cy="30" r="1.5" fill="white" opacity="0.8" filter="url(#glow)" />
              <circle cx="73" cy="55" r="1" fill="white" opacity="0.6" filter="url(#glow)" />
              <circle cx="38" cy="65" r="1.2" fill="white" opacity="0.5" filter="url(#glow)" />
              <ellipse cx="60" cy="128" rx="25" ry="3" fill="url(#crystalBody)" opacity="0.15" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            {t.welcome}
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 mb-4">
            {t.subtitle}
          </p>
          <p className="text-base text-purple-300 mb-10 max-w-xl mx-auto">
            {t.description}
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <a
              href="/login"
              className="btn btn-primary text-lg px-8 py-3 rounded-xl"
            >
              {t.login}
            </a>
            <a
              href="/register"
              className="btn bg-white text-indigo-700 hover:bg-gray-100 text-lg px-8 py-3 rounded-xl"
            >
              {t.register}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {t.features.map((f, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white"
              >
                <h3 className="font-bold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-purple-200">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
