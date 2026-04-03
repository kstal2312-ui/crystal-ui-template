"use client";

import { useState, useEffect } from "react";

interface Store {
  id: number;
  name: string;
  price: number;
  dailyProfit: number;
  category: string;
  isActive: boolean;
}

interface User {
  id: string;
  phone: string;
  balance: number;
  profits: number;
  subscriptionLevel: number;
  isSubscribed: boolean;
  subscriptionPaid: boolean;
  subscriptionAccepted: boolean;
}

const storeNames = [
  "Free Store",
  "Silver Store",
  "Gold Store",
  "Platinum Store",
  "Diamond Store",
  "Ruby Store",
  "Emerald Store",
  "Sapphire Store",
  "Elite Store",
  "Premium Store",
];

const storeNamesAr = [
  "المتجر المجاني",
  "المتجر الفضي",
  "المتجر الذهبي",
  "المتجر البلاتيني",
  "المتجر الماسي",
  "المتجر الياقوتي",
  "المتجر الزمردي",
  "المتجر الياقوتي الأزرق",
  "المتجر النخبة",
  "المتجر المميز",
];

const translations = {
  en: {
    title: "Stores",
    subtitle: "Subscribe to a store to start earning daily profits",
    balance: "Balance",
    subscriptionLevel: "Subscription Level",
    dailyProfit: "Daily Profit",
    category: "Category",
    price: "Price",
    free: "FREE",
    freeStore: "Free Store",
    subscribe: "Subscribe",
    subscribed: "Subscribed",
    pending: "Pending Approval",
    level: "Level",
    paymentInfo: "After subscribing, please send the payment to the admin. Your subscription will be approved once the admin confirms the payment.",
    close: "Close",
    subscribeTo: "Subscribe to",
    storeLevel: "Store Level",
  },
  ar: {
    title: "المتاجر",
    subtitle: "اشترك في متجر للبدء في كسب الأرباح اليومية",
    balance: "الرصيد",
    subscriptionLevel: "مستوى الاشتراك",
    dailyProfit: "الربح اليومي",
    category: "الفئة",
    price: "السعر",
    free: "مجاني",
    freeStore: "المتجر المجاني",
    subscribe: "اشترك",
    subscribed: "مشترك",
    pending: "في انتظار الموافقة",
    level: "المستوى",
    paymentInfo: "بعد الاشتراك، يرجى إرسال الدفع للمسؤول. سيتم الموافقة على اشتراكك بمجرد تأكيد الدفع.",
    close: "إغلاق",
    subscribeTo: "اشترك في",
    storeLevel: "مستوى المتجر",
  },
};

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState({ siteName: "Crystal One", welcomeMessage: "", adminMessage: "" });
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
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
    let intervalId: NodeJS.Timeout | null = null;

    async function fetchData() {
      try {
        const [storesRes, userRes, settingsRes] = await Promise.all([
          fetch("/api/stores"),
          fetch("/api/auth/me"),
          fetch("/api/settings"),
        ]);
        const storesData = await storesRes.json();
        const userData = await userRes.json();
        setStores(storesData.stores || []);
        setUser(userData.user);

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings({
            siteName: settingsData.siteName || "Crystal One",
            welcomeMessage: settingsData.welcomeMessage || "",
            adminMessage: settingsData.adminMessage || "",
          });
        }
      } catch {
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

  async function handleSubscribe(store: Store) {
    setSubscribing(store.id);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeLevel: store.id }),
      });
      if (res.ok) {
        if (store.id === 1) {
          const meRes = await fetch("/api/auth/me");
          const meData = await meRes.json();
          setUser(meData.user);
        } else {
          setSelectedStore(store);
          setShowPaymentModal(true);
          const meRes = await fetch("/api/auth/me");
          const meData = await meRes.json();
          setUser(meData.user);
        }
      }
    } catch {
    } finally {
      setSubscribing(null);
    }
  }

  function isSubscribedToLevel(level: number): boolean {
    if (!user) return false;
    return user.isSubscribed && user.subscriptionLevel === level;
  }

  function hasLowerSubscription(level: number): boolean {
    if (!user) return false;
    return user.isSubscribed && user.subscriptionLevel >= level;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading stores...</p>
        </div>
      </div>
    );
  }

  const names = lang === "ar" ? storeNamesAr : storeNames;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 pt-6 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-indigo-100 text-sm mt-1">
              {t.subtitle}
            </p>
            {(settings.adminMessage || settings.welcomeMessage) && (
              <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm text-blue-700">
                {settings.adminMessage || settings.welcomeMessage}
              </div>
            )}
          </div>

          {user && (
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex gap-6">
              <div>
                <p className="text-indigo-200 text-xs font-medium">{t.balance}</p>
                <p className="text-xl font-bold">${user.balance.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-medium">
                  {t.subscriptionLevel}
                </p>
                <p className="text-xl font-bold">
                  {user.isSubscribed ? `LV ${user.subscriptionLevel}` : "-"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((store) => {
            const price = store.price;
            const isFree = store.id === 1;
            const alreadySubscribed = isSubscribedToLevel(store.id);
            const hasSub = hasLowerSubscription(store.id);

            return (
              <div
                key={store.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition hover:shadow-md ${isFree
                    ? "border-indigo-300 ring-2 ring-indigo-100"
                    : "border-gray-100"
                  }`}
              >
                <div
                  className={`px-4 py-2 text-center ${isFree
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                      : "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                    }`}
                >
                  <span className="text-sm font-bold">
                    {t.level} {store.id}
                  </span>
                  {isFree && (
                    <span className="ms-2 bg-white/20 text-xs px-2 py-0.5 rounded-full font-semibold">
                      {t.freeStore}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {names[store.id - 1] || store.name}
                  </h3>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-xs text-gray-500 font-medium">
                      {t.price}:
                    </span>
                    <span
                      className={`text-lg font-bold ${isFree ? "text-green-600" : "text-indigo-600"
                        }`}
                    >
                      {isFree ? t.free : `$${price}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-xs text-gray-500 font-medium">
                      {t.dailyProfit}:
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      ${store.dailyProfit.toFixed(2)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <span className="text-xs text-gray-400">
                      {t.category}
                    </span>
                  </div>

                  {alreadySubscribed ? (
                    <div className="bg-green-50 text-green-700 text-center py-2.5 rounded-lg text-sm font-semibold">
                      {lang === "ar" ? `${t.subscribed} ✓` : `✓ ${t.subscribed}`}
                    </div>
                  ) : hasSub ? (
                    <div className="bg-gray-50 text-gray-500 text-center py-2.5 rounded-lg text-sm font-medium">
                      {t.subscribed}
                    </div>
                  ) : user?.subscriptionPaid && user?.subscriptionLevel === store.id && !user?.subscriptionAccepted ? (
                    <div className="bg-amber-50 text-amber-700 text-center py-2.5 rounded-lg text-sm font-semibold">
                      {t.pending}
                    </div>
                  ) : user?.subscriptionPaid && !user?.subscriptionAccepted ? (
                    <div className="bg-gray-50 text-gray-400 text-center py-2.5 rounded-lg text-sm font-medium">
                      {t.pending}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(store)}
                      disabled={subscribing === store.id || (user?.subscriptionPaid && !user?.subscriptionAccepted)}
                      className="w-full py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {subscribing === store.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ...
                        </span>
                      ) : (
                        `${t.subscribe}${isFree ? "" : ` - $${price}`}`
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showPaymentModal && selectedStore && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {t.subscribeTo} {names[selectedStore.id - 1] || selectedStore.name}
            </h3>

            <div className="bg-indigo-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{t.storeLevel}</span>
                <span className="font-bold text-indigo-600">
                  {selectedStore.id}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{t.price}</span>
                <span className="font-bold text-indigo-600">
                  ${selectedStore.price}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t.dailyProfit}</span>
                <span className="font-bold text-green-600">
                  ${selectedStore.dailyProfit.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                {t.paymentInfo}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
