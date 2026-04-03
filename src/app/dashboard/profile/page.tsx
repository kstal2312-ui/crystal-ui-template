"use client";

import { useState, useEffect } from "react";

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
  createdAt: string;
}

interface Referral {
  id: string;
  referredPhone: string;
  status: "pending" | "approved" | "rejected";
  reward: number;
  createdAt: string;
}

interface Transfers {
  accepted: number;
  rejected: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
};

const translations = {
  en: {
    profile: "Profile",
    subtitle: "Your account details and referral info",
    yourInvitationCode: "Your Invitation Code",
    copied: "Copied!",
    copy: "Copy",
    shareCode: "Share this code with friends to earn rewards",
    personalInfo: "Personal Information",
    phone: "Phone Number",
    memberSince: "Member Since",
    balance: "Balance",
    profits: "Profits",
    totalEarned: "Total Earned",
    referralStats: "Referral Statistics",
    peopleInvited: "People Invited",
    referralEarnings: "Referral Earnings",
    transfers: "Transfers",
    acceptedTransfers: "Accepted Transfers",
    rejectedTransfers: "Rejected Transfers",
    referrals: "Referrals",
    noReferrals: "No referrals yet",
    noReferralsDesc: "Share your invitation code to invite friends and earn rewards.",
    loading: "Loading profile...",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  },
  ar: {
    profile: "الملف الشخصي",
    subtitle: "تفاصيل حسابك ومعلومات الإحالة",
    yourInvitationCode: "رمز الدعوة الخاص بك",
    copied: "تم النسخ!",
    copy: "نسخ",
    shareCode: "شارك هذا الرمز مع الأصدقاء للحصول على مكافآت",
    personalInfo: "المعلومات الشخصية",
    phone: "رقم الهاتف",
    memberSince: "عضو منذ",
    balance: "الرصيد",
    profits: "الأرباح",
    totalEarned: "إجمالي الأرباح",
    referralStats: "إحصائيات الإحالة",
    peopleInvited: "الأشخاص المدعوون",
    referralEarnings: "أرباح الإحالة",
    transfers: "التحويلات",
    acceptedTransfers: "التحويلات المقبولة",
    rejectedTransfers: "التحويلات المرفوضة",
    referrals: "الإحالات",
    noReferrals: "لا توجد إحالات بعد",
    noReferralsDesc: "شارك رمز الدعوة لدعوة الأصدقاء وكسب المكافآت.",
    loading: "جاري تحميل الملف الشخصي...",
    pending: "قيد الانتظار",
    approved: "مقبول",
    rejected: "مرفوض",
  },
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [settings, setSettings] = useState({ siteName: "Crystal One", welcomeMessage: "", adminMessage: "" });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [transfers, setTransfers] = useState<Transfers>({ accepted: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<"en" | "ar">("en");

  const t = translations[lang];

  const statusLabels: Record<string, string> = {
    pending: t.pending,
    approved: t.approved,
    rejected: t.rejected,
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    async function fetchData() {
      try {
        const [meRes, referralsRes, depositsRes, withdrawalsRes, settingsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/referrals"),
          fetch("/api/deposits"),
          fetch("/api/withdrawals"),
          fetch("/api/settings"),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.user) setUser(meData.user);
        }

        if (referralsRes.ok) {
          const refData = await referralsRes.json();
          setReferrals(refData.referrals || []);
        }

        if (depositsRes.ok && withdrawalsRes.ok) {
          const depData = await depositsRes.json();
          const wdData = await withdrawalsRes.json();
          const allDeposits = depData.deposits || [];
          const allWithdrawals = wdData.withdrawals || [];
          const accepted =
            allDeposits.filter((d: { status: string }) => d.status === "approved").length +
            allWithdrawals.filter((w: { status: string }) => w.status === "approved").length;
          const rejected =
            allDeposits.filter((d: { status: string }) => d.status === "rejected").length +
            allWithdrawals.filter((w: { status: string }) => w.status === "rejected").length;
          setTransfers({ accepted, rejected });
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings({
            siteName: settingsData.siteName || "Crystal One",
            welcomeMessage: settingsData.welcomeMessage || "",
            adminMessage: settingsData.adminMessage || "",
          });
        }
      } catch {
        // Handle error silently
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    intervalId = setInterval(fetchData, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  function handleCopy() {
    if (!user) return;
    navigator.clipboard.writeText(user.invitationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleLang() {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }

  const approvedReferrals = referrals.filter((r) => r.status === "approved");
  const referralEarnings = approvedReferrals.reduce((sum, r) => sum + r.reward, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 pt-6 pb-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.profile}</h1>
            <p className="text-indigo-100 text-sm mt-1">{t.subtitle}</p>
          </div>
          <button
            onClick={toggleLang}
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors cursor-pointer"
          >
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>
      </div>

      {(settings.adminMessage || settings.welcomeMessage) && (
        <div className="max-w-3xl mx-auto px-4 -mt-4">
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm text-blue-700">
            {settings.adminMessage || settings.welcomeMessage}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 -mt-6 space-y-5">
        {/* Invitation Code Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <p className="text-indigo-100 text-xs font-semibold uppercase tracking-wider mb-2">
            {t.yourInvitationCode}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white/15 backdrop-blur rounded-xl px-5 py-4">
              <p className="text-3xl font-bold tracking-[0.3em] font-mono">
                {user?.invitationCode || "--------"}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-5 py-4 rounded-xl text-sm font-bold transition-colors flex flex-col items-center gap-1 min-w-[80px]"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {t.copied}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {t.copy}
                </>
              )}
            </button>
          </div>
          <p className="text-indigo-200 text-xs mt-3">{t.shareCode}</p>
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t.personalInfo}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">{t.phone}</p>
              <p className="text-base font-semibold text-gray-900">
                {user?.phone}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 font-medium mb-1">{t.memberSince}</p>
              <p className="text-base font-semibold text-gray-900">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "-"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
              <p className="text-xs text-indigo-600 font-medium mb-1">{t.balance}</p>
              <p className="text-xl font-bold text-indigo-700">
                ${(user?.balance ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4">
              <p className="text-xs text-emerald-600 font-medium mb-1">{t.profits}</p>
              <p className="text-xl font-bold text-emerald-700">
                ${(user?.profits ?? 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 sm:col-span-2">
              <p className="text-xs text-purple-600 font-medium mb-1">{t.totalEarned}</p>
              <p className="text-xl font-bold text-purple-700">
                ${(user?.totalEarned ?? 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Referral Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t.referralStats}</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-indigo-700">{user?.referralCount ?? 0}</p>
              <p className="text-xs text-indigo-600 font-medium mt-1">{t.peopleInvited}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-emerald-700">${referralEarnings.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">{t.referralEarnings}</p>
            </div>
          </div>

          {/* Transfers Stats */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">{t.transfers}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-700">{transfers.accepted}</p>
                <p className="text-xs text-emerald-600">{t.acceptedTransfers}</p>
              </div>
            </div>
            <div className="bg-red-50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-bold text-red-700">{transfers.rejected}</p>
                <p className="text-xs text-red-600">{t.rejectedTransfers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Referral List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">{t.referrals}</h2>
          </div>

          {referrals.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{t.noReferrals}</p>
              <p className="text-xs text-gray-500">{t.noReferralsDesc}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {referral.referredPhone}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(referral.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}
                    </p>
                  </div>
                  {referral.reward > 0 && (
                    <span className="text-sm font-semibold text-emerald-600">
                      +${referral.reward}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[referral.status]}`}>
                    {statusLabels[referral.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
