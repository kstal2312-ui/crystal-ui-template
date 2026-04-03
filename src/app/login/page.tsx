"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const translations = {
  en: {
    title: "Sign In to Your Account",
    subtitle: "Enter your phone number and password",
    phone: "Phone Number",
    phonePlaceholder: "e.g. 01012345678",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    login: "Sign In",
    loggingIn: "Signing in...",
    noAccount: "Don't have an account?",
    registerLink: "Create Account",
    adminAccess: "Admin Access",
    errorDefault: "Invalid phone number or password",
    langToggle: "العربية",
  },
  ar: {
    title: "تسجيل الدخول إلى حسابك",
    subtitle: "أدخل رقم هاتفك وكلمة المرور",
    phone: "رقم الهاتف",
    phonePlaceholder: "مثال: 01012345678",
    password: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    login: "تسجيل الدخول",
    loggingIn: "جاري تسجيل الدخول...",
    noAccount: "ليس لديك حساب؟",
    registerLink: "إنشاء حساب",
    adminAccess: "دخول المسؤول",
    errorDefault: "رقم الهاتف أو كلمة المرور غير صحيحة",
    langToggle: "English",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const t = translations[lang];
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.errorDefault);
        setLoading(false);
        return;
      }

      if (data.isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError(t.errorDefault);
      setLoading(false);
    }
  }

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center p-4"
    >
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
        >
          {t.langToggle}
        </button>
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto drop-shadow-2xl" viewBox="0 0 120 130" fill="none">
              <defs>
                <linearGradient id="crystalBodyL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="30%" stopColor="#a78bfa" />
                  <stop offset="60%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
                <linearGradient id="crystalLeftL" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
                <linearGradient id="crystalRightL" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#5b21b6" />
                </linearGradient>
                <filter id="glowL">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <polygon points="60,8 20,48 28,118 60,125" fill="url(#crystalLeftL)" />
              <polygon points="60,8 100,48 92,118 60,125" fill="url(#crystalRightL)" />
              <polygon points="60,8 20,48 42,42" fill="url(#crystalBodyL)" opacity="0.9" />
              <polygon points="60,8 100,48 78,42" fill="url(#crystalBodyL)" opacity="0.85" />
              <polygon points="42,42 78,42 60,125" fill="url(#crystalBodyL)" opacity="0.7" />
              <polygon points="20,48 42,42 60,125 28,118" fill="url(#crystalLeftL)" opacity="0.8" />
              <polygon points="100,48 78,42 60,125 92,118" fill="url(#crystalRightL)" opacity="0.75" />
              <line x1="60" y1="8" x2="20" y2="48" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="60" y1="8" x2="100" y2="48" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="60" y1="8" x2="42" y2="42" stroke="white" strokeWidth="0.8" opacity="0.4" />
              <line x1="60" y1="8" x2="78" y2="42" stroke="white" strokeWidth="0.8" opacity="0.4" />
              <line x1="42" y1="42" x2="78" y2="42" stroke="white" strokeWidth="0.8" opacity="0.3" />
              <polygon points="60,12 48,38 55,35" fill="white" opacity="0.45" />
              <polygon points="60,12 72,38 65,35" fill="white" opacity="0.35" />
              <circle cx="52" cy="30" r="1.5" fill="white" opacity="0.8" filter="url(#glowL)" />
              <circle cx="73" cy="55" r="1" fill="white" opacity="0.6" filter="url(#glowL)" />
              <ellipse cx="60" cy="128" rx="25" ry="3" fill="url(#crystalBodyL)" opacity="0.15" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-purple-200">{t.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">{t.phone}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder={t.phonePlaceholder}
                required
              />
            </div>

            <div>
              <label className="label">{t.password}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder={t.passwordPlaceholder}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base"
            >
              {loading ? t.loggingIn : t.login}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-gray-500 text-sm">
              {t.noAccount}{" "}
              <a
                href="/register"
                className="text-indigo-600 font-semibold hover:text-indigo-800"
              >
                {t.registerLink}
              </a>
            </p>
            <div className="border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setPhone("01026541250");
                  setPassword("abdallah");
                }}
                className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
              >
                {t.adminAccess}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
