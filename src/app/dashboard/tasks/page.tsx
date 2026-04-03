"use client";

import { useState, useEffect } from "react";

interface Task {
  id: string;
  userId: string;
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

const translations = {
  en: {
    title: "Tasks",
    subtitle: "Complete sales tasks to earn commissions",
    product: "Product",
    price: "Price",
    commission: "Commission",
    status: "Status",
    accept: "Accept",
    decline: "Decline",
    noTasks: "No tasks available",
    noTasksSub: "Tasks will appear one hour after registration. Please check back later.",
    pending: "Pending",
    accepted: "Accepted",
    declined: "Declined",
    completed: "Completed",
    history: "History",
    total: "Total",
  },
  ar: {
    title: "المهام",
    subtitle: "أكمل مهام البيع لكسب العمولات",
    product: "المنتج",
    price: "السعر",
    commission: "العمولة",
    status: "الحالة",
    accept: "قبول",
    decline: "رفض",
    noTasks: "لا توجد مهام متاحة",
    noTasksSub: "ستظهر المهام بعد ساعة واحدة من التسجيل. يرجى التحقق لاحقاً.",
    pending: "قيد الانتظار",
    accepted: "مقبول",
    declined: "مرفوض",
    completed: "مكتمل",
    history: "السجل",
    total: "الإجمالي",
  },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: "bg-amber-50", text: "text-amber-700" },
  accepted: { bg: "bg-blue-50", text: "text-blue-700" },
  declined: { bg: "bg-red-50", text: "text-red-700" },
  completed: { bg: "bg-green-50", text: "text-green-700" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [lang, setLang] = useState<"en" | "ar">("en");

  const t = translations[lang];

  const statusLabels: Record<string, string> = {
    pending: t.pending,
    accepted: t.accepted,
    declined: t.declined,
    completed: t.completed,
  };

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

  async function handleTask(taskId: string, status: "accepted" | "declined") {
    setProcessing(taskId);
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status }),
      });
      await fetchTasks();
    } catch {
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      </div>
    );
  }

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const processedTasks = tasks.filter((task) => task.status !== "pending");

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 pt-6 pb-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-indigo-100 text-sm mt-1">
              {t.subtitle}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <p className="text-indigo-200 text-xs font-medium">{t.pending}</p>
              <p className="text-xl font-bold">{pendingTasks.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3">
              <p className="text-indigo-200 text-xs font-medium">{t.total}</p>
              <p className="text-xl font-bold">{tasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {tasks.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {t.noTasks}
            </h3>
            <p className="text-gray-500 text-sm">
              {t.noTasksSub}
            </p>
          </div>
        )}

        {pendingTasks.map((task) => {
          const colors = statusColors[task.status];
          return (
            <div
              key={task.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden animate-fade-in"
            >
              <div className={`${colors.bg} px-4 py-2 flex justify-between items-center`}>
                <span className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>
                  {statusLabels[task.status]}
                </span>
                <span className="text-xs text-gray-400">
                  #{task.id.slice(0, 8)}
                </span>
              </div>

              <div className="p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    {task.productImage ? (
                      <img
                        src={task.productImage}
                        alt={task.productName}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <svg
                        className="w-8 h-8 text-indigo-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {task.productName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {t.price}:{" "}
                      <span className="font-medium text-gray-700">
                        ${task.productPrice.toFixed(2)}
                      </span>
                    </p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-xs text-gray-500">
                        {t.commission}:
                      </span>
                      <span className="text-base font-bold text-green-600">
                        ${task.commission.toFixed(2)}
                      </span>
                      <span className="text-xs text-green-600 font-medium">
                        ({task.commissionPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleTask(task.id, "accepted")}
                    disabled={processing === task.id}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 cursor-pointer"
                  >
                    {processing === task.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </span>
                    ) : (
                      t.accept
                    )}
                  </button>
                  <button
                    onClick={() => handleTask(task.id, "declined")}
                    disabled={processing === task.id}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 cursor-pointer"
                  >
                    {t.decline}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {processedTasks.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3 px-1">
              {t.history}
            </h2>
            {processedTasks.map((task) => {
              const colors = statusColors[task.status];
              return (
                <div
                  key={task.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {task.productImage ? (
                        <img
                          src={task.productImage}
                          alt={task.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {task.productName}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">
                          ${task.productPrice.toFixed(2)}
                        </span>
                        <span className="text-xs font-medium text-green-600">
                          +${task.commission.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`badge text-xs px-2.5 py-1 rounded-full font-semibold ${colors.bg} ${colors.text}`}
                    >
                      {statusLabels[task.status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
