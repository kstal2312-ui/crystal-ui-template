"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const translations = {
  en: {
    title: "Create New Account",
    subtitle: "Fill in your details to get started",
    name: "Name",
    namePlaceholder: "Enter your full name",
    phone: "Phone Number",
    phonePlaceholder: "e.g. 01012345678",
    password: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    invitationCode: "Invitation Code (Optional)",
    invitationCodePlaceholder: "Enter invitation code (optional)",
    register: "Create Account",
    registering: "Creating account...",
    hasAccount: "Already have an account?",
    loginLink: "Sign In",
    phoneNote: "Egyptian, Saudi, Emirati, Kuwaiti, or Libyan numbers only",
    passwordMismatch: "Passwords do not match",
    passwordTooShort: "Password must be at least 6 characters",
    errorDefault: "An error occurred",
    langToggle: "العربية",
    countryCode: "Country Code",
    autoSaveMessage: "💾 Your information is automatically saved as you type",
    countries: [
      { label: "Egypt (+20)", value: "+20" },
      { label: "Saudi Arabia (+966)", value: "+966" },
      { label: "Libya (+218)", value: "+218" },
    ],
  },
  ar: {
    title: "إنشاء حساب جديد",
    subtitle: "املأ بياناتك للبدء",
    name: "الاسم",
    namePlaceholder: "أدخل اسمك الكامل",
    phone: "رقم الهاتف",
    phonePlaceholder: "مثال: 01012345678",
    password: "كلمة المرور",
    passwordPlaceholder: "6 أحرف على الأقل",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordPlaceholder: "أعد إدخال كلمة المرور",
    invitationCode: "رمز الدعوة (اختياري)",
    invitationCodePlaceholder: "أدخل رمز الدعوة (اختياري)",
    register: "إنشاء حساب",
    registering: "جاري إنشاء الحساب...",
    hasAccount: "لديك حساب بالفعل؟",
    loginLink: "تسجيل الدخول",
    phoneNote: "أرقام مصرية أو سعودية أو إماراتية أو كويتية أو ليبية فقط",
    passwordMismatch: "كلمات المرور غير متطابقة",
    passwordTooShort: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
    errorDefault: "حدث خطأ",
    langToggle: "English",
    countryCode: "رمز البلد",
    autoSaveMessage: "💾 معلوماتك محفوظة تلقائياً أثناء الكتابة",
    countries: [
      { label: "مصر (+20)", value: "+20" },
      { label: "السعودية (+966)", value: "+966" },
      { label: "ليبيا (+218)", value: "+218" },
    ],
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const t = translations[lang];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+20");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load saved registration data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("registrationDraft");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setName(parsed.name || "");
        setPhone(parsed.phone || "");
        setCountryCode(parsed.countryCode || "+20");
        setPassword(parsed.password || "");
        setConfirmPassword(parsed.confirmPassword || "");
        setInvitationCode(parsed.invitationCode || "");
      } catch (e) {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Auto-save registration data to localStorage whenever form fields change
  useEffect(() => {
    const registrationData = {
      name,
      phone,
      countryCode,
      password,
      confirmPassword,
      invitationCode,
    };
    localStorage.setItem("registrationDraft", JSON.stringify(registrationData));
  }, [name, phone, countryCode, password, confirmPassword, invitationCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, countryCode, password, confirmPassword, invitationCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.errorDefault);
        setLoading(false);
        return;
      }

      // Clear saved registration data after successful registration
      localStorage.removeItem("registrationDraft");

      router.push("/dashboard");
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
                <linearGradient id="crystalBodyR" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c4b5fd" />
                  <stop offset="30%" stopColor="#a78bfa" />
                  <stop offset="60%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#6d28d9" />
                </linearGradient>
                <linearGradient id="crystalLeftR" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#4c1d95" />
                </linearGradient>
                <linearGradient id="crystalRightR" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#5b21b6" />
                </linearGradient>
                <filter id="glowR">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <polygon points="60,8 20,48 28,118 60,125" fill="url(#crystalLeftR)" />
              <polygon points="60,8 100,48 92,118 60,125" fill="url(#crystalRightR)" />
              <polygon points="60,8 20,48 42,42" fill="url(#crystalBodyR)" opacity="0.9" />
              <polygon points="60,8 100,48 78,42" fill="url(#crystalBodyR)" opacity="0.85" />
              <polygon points="42,42 78,42 60,125" fill="url(#crystalBodyR)" opacity="0.7" />
              <polygon points="20,48 42,42 60,125 28,118" fill="url(#crystalLeftR)" opacity="0.8" />
              <polygon points="100,48 78,42 60,125 92,118" fill="url(#crystalRightR)" opacity="0.75" />
              <line x1="60" y1="8" x2="20" y2="48" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="60" y1="8" x2="100" y2="48" stroke="white" strokeWidth="1" opacity="0.5" />
              <line x1="60" y1="8" x2="42" y2="42" stroke="white" strokeWidth="0.8" opacity="0.4" />
              <line x1="60" y1="8" x2="78" y2="42" stroke="white" strokeWidth="0.8" opacity="0.4" />
              <line x1="42" y1="42" x2="78" y2="42" stroke="white" strokeWidth="0.8" opacity="0.3" />
              <polygon points="60,12 48,38 55,35" fill="white" opacity="0.45" />
              <polygon points="60,12 72,38 65,35" fill="white" opacity="0.35" />
              <circle cx="52" cy="30" r="1.5" fill="white" opacity="0.8" filter="url(#glowR)" />
              <circle cx="73" cy="55" r="1" fill="white" opacity="0.6" filter="url(#glowR)" />
              <ellipse cx="60" cy="128" rx="25" ry="3" fill="url(#crystalBodyR)" opacity="0.15" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-purple-200">{t.subtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">{t.name}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder={t.namePlaceholder}
                required
              />
            </div>

            <div>
              <label className="label">{t.countryCode}</label>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="input-field"
              >
                {t.countries.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

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
              <p className="text-xs text-gray-400 mt-1">{t.phoneNote}</p>
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
                minLength={6}
              />
            </div>

            <div>
              <label className="label">{t.confirmPassword}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder={t.confirmPasswordPlaceholder}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="label">{t.invitationCode}</label>
              <input
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                className="input-field"
                placeholder={t.invitationCodePlaceholder}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base"
            >
              {loading ? t.registering : t.register}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              {t.autoSaveMessage}
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              {t.hasAccount}{" "}
              <a
                href="/login"
                className="text-indigo-600 font-semibold hover:text-indigo-800"
              >
                {t.loginLink}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
