"use client";

import { useState, useEffect } from "react";

const t = {
  en: {
    userManagement: "User Management",
    viewAndManage: "View and manage all registered users",
    searchPlaceholder: "Search by phone...",
    phone: "Phone",
    password: "Password",
    invCode: "Inv Code",
    balance: "Balance",
    profits: "Profits",
    totalEarned: "Total Earned",
    referrals: "Referrals",
    subscription: "Subscription",
    active: "Active",
    inactive: "Inactive",
    actions: "Actions",
    noUsers: "No users found",
    subscribed: "Subscribed",
    notSubscribed: "Not Subscribed",
    pendingSub: "Pending",
    approve: "Approve",
    reject: "Reject",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    activate: "Activate",
    deactivate: "Deactivate",
    delete: "Delete",
    loading: "Loading users...",
    confirmDelete: "Are you sure you want to delete this user?",
  },
  ar: {
    userManagement: "إدارة المستخدمين",
    viewAndManage: "عرض وإدارة جميع المستخدمين المسجلين",
    searchPlaceholder: "بحث برقم الهاتف...",
    phone: "الهاتف",
    password: "كلمة المرور",
    invCode: "رمز الدعوة",
    balance: "الرصيد",
    profits: "الأرباح",
    totalEarned: "إجمالي الأرباح",
    referrals: "الإحالات",
    subscription: "الاشتراك",
    active: "نشط",
    inactive: "غير نشط",
    actions: "الإجراءات",
    noUsers: "لا يوجد مستخدمين",
    subscribed: "مشترك",
    notSubscribed: "غير مشترك",
    pendingSub: "معلق",
    approve: "موافقة",
    reject: "رفض",
    save: "حفظ",
    cancel: "إلغاء",
    edit: "تعديل",
    activate: "تفعيل",
    deactivate: "إلغاء التفعيل",
    delete: "حذف",
    loading: "جاري تحميل المستخدمين...",
    confirmDelete: "هل أنت متأكد أنك تريد حذف هذا المستخدم؟",
  },
};

interface User {
  id: string;
  phone: string;
  password: string;
  invitationCode: string;
  balance: number;
  profits: number;
  totalEarned: number;
  referralCount: number;
  subscriptionLevel: number;
  isSubscribed: boolean;
  subscriptionPaid: boolean;
  subscriptionAccepted: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const tr = t[lang];
  const isAr = lang === "ar";

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(userId: string) {
    setSaving(userId);
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, balance: Number(editBalance) }),
      });
      await fetchUsers();
      setEditingId(null);
    } catch {
    } finally {
      setSaving(null);
    }
  }

  async function handleToggleActive(user: User) {
    setSaving(user.id);
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
      });
      await fetchUsers();
    } catch {
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(userId: string) {
    if (!confirm(tr.confirmDelete)) return;
    try {
      await fetch(`/api/users?id=${userId}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {
    }
  }

  async function handleApproveSubscription(userId: string) {
    setSaving(userId);
    try {
      await fetch("/api/subscribe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "approve" }),
      });
      await fetchUsers();
    } catch {
    } finally {
      setSaving(null);
    }
  }

  async function handleRejectSubscription(userId: string) {
    setSaving(userId);
    try {
      await fetch("/api/subscribe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "reject" }),
      });
      await fetchUsers();
    } catch {
    } finally {
      setSaving(null);
    }
  }

  function startEdit(user: User) {
    setEditingId(user.id);
    setEditBalance(String(user.balance));
  }

  const filtered = users.filter((u) =>
    u.phone.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{tr.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div dir={isAr ? "rtl" : "ltr"} className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr.userManagement}</h1>
          <p className="text-sm text-gray-500 mt-1">{tr.viewAndManage}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={tr.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.phone}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.password}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.invCode}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.balance}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.profits}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.totalEarned}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.referrals}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.subscription}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.active}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-500">
                    {tr.noUsers}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-medium text-gray-900 whitespace-nowrap`}>
                      {user.phone}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 text-gray-600 whitespace-nowrap font-mono text-xs`}>
                      {user.password}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 text-gray-600 whitespace-nowrap`}>
                      {user.invitationCode}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      {editingId === user.id ? (
                        <input
                          type="number"
                          value={editBalance}
                          onChange={(e) => setEditBalance(e.target.value)}
                          className="w-24 px-2 py-1 rounded-lg border border-indigo-300 focus:border-indigo-500 outline-none text-sm"
                        />
                      ) : (
                        <span className="font-semibold text-gray-900">
                          ${user.balance.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 text-gray-600 whitespace-nowrap`}>
                      ${user.profits.toFixed(2)}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 text-gray-600 whitespace-nowrap`}>
                      ${user.totalEarned.toFixed(2)}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 text-gray-600 whitespace-nowrap`}>
                      {user.referralCount}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      {user.isSubscribed && user.subscriptionAccepted ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {tr.subscribed} LV{user.subscriptionLevel}
                        </span>
                      ) : user.subscriptionPaid && !user.subscriptionAccepted ? (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            LV{user.subscriptionLevel} {tr.pendingSub}
                          </span>
                          <button
                            onClick={() => handleApproveSubscription(user.id)}
                            disabled={saving === user.id}
                            className="px-2 py-0.5 rounded text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 cursor-pointer"
                          >
                            {tr.approve}
                          </button>
                          <button
                            onClick={() => handleRejectSubscription(user.id)}
                            disabled={saving === user.id}
                            className="px-2 py-0.5 rounded text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
                          >
                            {tr.reject}
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                          {tr.notSubscribed}
                        </span>
                      )}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {user.isActive ? tr.active : tr.inactive}
                      </span>
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      <div className="flex items-center gap-2">
                        {editingId === user.id ? (
                          <>
                            <button
                              onClick={() => handleSave(user.id)}
                              disabled={saving === user.id}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                            >
                              {saving === user.id ? "..." : tr.save}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                            >
                              {tr.cancel}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(user)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
                            >
                              {tr.edit}
                            </button>
                            <button
                              onClick={() => handleToggleActive(user)}
                              disabled={saving === user.id}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer ${
                                user.isActive
                                  ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                                  : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                              }`}
                            >
                              {user.isActive ? tr.deactivate : tr.activate}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
                            >
                              {tr.delete}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
