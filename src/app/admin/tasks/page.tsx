"use client";

import { useState, useEffect } from "react";

const t = {
  en: {
    taskManagement: "Task Management",
    viewAndManage: "View and manage all user tasks",
    userPhone: "User Phone",
    product: "Product",
    price: "Price",
    commission: "Commission",
    status: "Status",
    created: "Created",
    actions: "Actions",
    noTasks: "No tasks found",
    pending: "Pending",
    accepted: "Accepted",
    declined: "Declined",
    completed: "Completed",
    loading: "Loading tasks...",
  },
  ar: {
    taskManagement: "إدارة المهام",
    viewAndManage: "عرض وإدارة جميع مهام المستخدمين",
    userPhone: "هاتف المستخدم",
    product: "المنتج",
    price: "السعر",
    commission: "العمولة",
    status: "الحالة",
    created: "تاريخ الإنشاء",
    actions: "الإجراءات",
    noTasks: "لا توجد مهام",
    pending: "معلق",
    accepted: "مقبول",
    declined: "مرفوض",
    completed: "مكتمل",
    loading: "جاري تحميل المهام...",
  },
};

interface Task {
  id: string;
  userId: string;
  userPhone: string;
  productId: string;
  productName: string;
  productImage: string;
  productPrice: number;
  commission: number;
  commissionPercent: number;
  status: "pending" | "accepted" | "declined" | "completed";
  createdAt: string;
  completedAt: string | null;
  scheduledFor: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  accepted: "bg-blue-50 text-blue-700 border border-blue-200",
  declined: "bg-red-50 text-red-700 border border-red-200",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

export default function AdminTasksPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const tr = t[lang];
  const isAr = lang === "ar";

  const statusLabels: Record<string, string> = {
    pending: tr.pending,
    accepted: tr.accepted,
    declined: tr.declined,
    completed: tr.completed,
  };

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, status: string) {
    setSaving(taskId);
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status }),
      });
      await fetchTasks();
    } catch {
    } finally {
      setSaving(null);
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">{tr.taskManagement}</h1>
          <p className="text-sm text-gray-500 mt-1">{tr.viewAndManage}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {(["pending", "accepted", "completed", "declined"] as const).map(
              (s) => {
                const count = tasks.filter((t) => t.status === s).length;
                return (
                  <span
                    key={s}
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[s]}`}
                  >
                    {statusLabels[s]}: {count}
                  </span>
                );
              }
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.userPhone}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.product}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.price}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.commission}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.status}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.created}</th>
                <th className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-semibold text-gray-600 whitespace-nowrap`}>{tr.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    {tr.noTasks}
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 font-medium text-gray-900 whitespace-nowrap`}>
                      {task.userPhone || task.userId.slice(0, 8)}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      <div className="flex items-center gap-3">
                        {task.productImage ? (
                          <img
                            src={task.productImage}
                            alt={task.productName}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-indigo-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          </div>
                        )}
                        <span className="text-gray-900 font-medium">
                          {task.productName}
                        </span>
                      </div>
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 text-gray-600 whitespace-nowrap`}>
                      ${task.productPrice.toFixed(2)}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      <span className="font-semibold text-green-600">
                        ${task.commission.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 ms-1">
                        ({task.commissionPercent}%)
                      </span>
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[task.status]}`}
                      >
                        {statusLabels[task.status]}
                      </span>
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 text-gray-500 whitespace-nowrap text-xs`}>
                      {new Date(task.createdAt).toLocaleString("en-US")}
                    </td>
                    <td className={`${isAr ? "text-right" : "text-left"} px-4 py-3 whitespace-nowrap`}>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          handleStatusChange(task.id, e.target.value)
                        }
                        disabled={saving === task.id}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-xs font-medium bg-white disabled:opacity-50 cursor-pointer"
                      >
                        <option value="pending">{tr.pending}</option>
                        <option value="accepted">{tr.accepted}</option>
                        <option value="completed">{tr.completed}</option>
                        <option value="declined">{tr.declined}</option>
                      </select>
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
