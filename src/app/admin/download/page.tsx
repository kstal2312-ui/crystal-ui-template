"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface FileEntry { path: string; size: number; type: string; }
interface LangGroup { lang: string; ext: string; color: string; bgColor: string; borderColor: string; textColor: string; files: { name: string; desc: string }[]; }

export default function DownloadPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAr = lang === "ar";

  const langGroups: LangGroup[] = [
    {
      lang: "TypeScript React (.tsx)",
      ext: ".tsx",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      files: [
        { name: "src/app/page.tsx", desc: isAr ? "الصفحة الرئيسية - واجهة الترحيب" : "Landing page with welcome interface" },
        { name: "src/app/layout.tsx", desc: isAr ? "التخطيط الرئيسي للتطبيق" : "Root layout with metadata" },
        { name: "src/app/login/page.tsx", desc: isAr ? "صفحة تسجيل الدخول" : "Login page with phone/password" },
        { name: "src/app/register/page.tsx", desc: isAr ? "صفحة إنشاء الحساب" : "Registration with name, phone, country code" },
        { name: "src/app/dashboard/layout.tsx", desc: isAr ? "تخطيط لوحة تحكم المستخدم" : "User dashboard layout with sidebar" },
        { name: "src/app/dashboard/page.tsx", desc: isAr ? "الصفحة الرئيسية للوحة التحكم" : "Dashboard main page with stats" },
        { name: "src/app/dashboard/stores/page.tsx", desc: isAr ? "صفحة المتاجر والاشتراك" : "Store subscription page (10 levels)" },
        { name: "src/app/dashboard/tasks/page.tsx", desc: isAr ? "صفحة المهام والمبيعات" : "Sales tasks accept/decline" },
        { name: "src/app/dashboard/profile/page.tsx", desc: isAr ? "الملف الشخصي ورمز الدعوة" : "Profile with invitation code" },
        { name: "src/app/dashboard/deposit/page.tsx", desc: isAr ? "صفحة طلب الإيداع" : "Deposit request with image upload" },
        { name: "src/app/dashboard/withdraw/page.tsx", desc: isAr ? "صفحة طلب السحب" : "Withdrawal request page" },
        { name: "src/app/dashboard/notifications/page.tsx", desc: isAr ? "صفحة الإشعارات" : "Notifications feed (7min refresh)" },
        { name: "src/app/admin/layout.tsx", desc: isAr ? "تخطيط لوحة الإدارة" : "Admin layout with dark sidebar" },
        { name: "src/app/admin/page.tsx", desc: isAr ? "لوحة تحكم الإدارة" : "Admin dashboard with stats" },
        { name: "src/app/admin/users/page.tsx", desc: isAr ? "إدارة المستخدمين" : "User management (view/edit/delete)" },
        { name: "src/app/admin/products/page.tsx", desc: isAr ? "إدارة المنتجات" : "Product management with images" },
        { name: "src/app/admin/tasks/page.tsx", desc: isAr ? "إدارة المهام" : "Task management" },
        { name: "src/app/admin/deposits/page.tsx", desc: isAr ? "إدارة الإيداعات" : "Deposit approve/reject" },
        { name: "src/app/admin/withdrawals/page.tsx", desc: isAr ? "إدارة السحوبات" : "Withdrawal approve/reject" },
        { name: "src/app/admin/referrals/page.tsx", desc: isAr ? "إدارة الإحالات" : "Referral approve/reject" },
        { name: "src/app/admin/settings/page.tsx", desc: isAr ? "إعدادات الموقع والمتاجر" : "Site settings & store controls" },
        { name: "src/app/admin/source-code/page.tsx", desc: isAr ? "عرض الكود المصدري" : "Source code viewer" },
        { name: "src/app/admin/download/page.tsx", desc: isAr ? "صفحة تحميل التطبيق" : "App download page" },
      ],
    },
    {
      lang: "TypeScript (.ts)",
      ext: ".ts",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      files: [
        { name: "src/lib/types.ts", desc: isAr ? "تعريفات TypeScript لجميع الكيانات" : "Type definitions for User, Product, Task, etc." },
        { name: "src/lib/data.ts", desc: isAr ? "طبقة البيانات - قراءة/كتابة JSON" : "Data layer with JSON file persistence" },
        { name: "src/lib/auth.ts", desc: isAr ? "المصادقة وتحقق رقم الهاتف" : "Auth helpers & phone validation" },
        { name: "src/lib/i18n.ts", desc: isAr ? "الترجمة العربية والإنجليزية" : "Arabic/English translations" },
        { name: "src/app/api/auth/login/route.ts", desc: isAr ? "تسجيل الدخول - مسؤول أو مستخدم" : "Login API - admin or user" },
        { name: "src/app/api/auth/register/route.ts", desc: isAr ? "إنشاء حساب جديد" : "Registration API with phone check" },
        { name: "src/app/api/auth/logout/route.ts", desc: isAr ? "تسجيل الخروج" : "Logout API" },
        { name: "src/app/api/auth/me/route.ts", desc: isAr ? "جلب بيانات المستخدم الحالي" : "Get current user data" },
        { name: "src/app/api/users/route.ts", desc: isAr ? "واجهة إدارة المستخدمين" : "User CRUD API" },
        { name: "src/app/api/stores/route.ts", desc: isAr ? "واجهة المتاجر" : "Stores API" },
        { name: "src/app/api/products/route.ts", desc: isAr ? "واجهة المنتجات" : "Products CRUD API" },
        { name: "src/app/api/tasks/route.ts", desc: isAr ? "واجهة المهام" : "Tasks API with scheduling" },
        { name: "src/app/api/deposits/route.ts", desc: isAr ? "واجهة الإيداعات" : "Deposits API" },
        { name: "src/app/api/withdrawals/route.ts", desc: isAr ? "واجهة السحوبات" : "Withdrawals API" },
        { name: "src/app/api/referrals/route.ts", desc: isAr ? "واجهة الإحالات" : "Referrals API ($10 reward)" },
        { name: "src/app/api/notifications/route.ts", desc: isAr ? "واجهة الإشعارات" : "Notifications API" },
        { name: "src/app/api/settings/route.ts", desc: isAr ? "واجهة إعدادات الموقع" : "Site settings API" },
        { name: "src/app/api/subscribe/route.ts", desc: isAr ? "واجهة الاشتراك في المتاجر" : "Store subscription API" },
        { name: "src/app/api/upload/route.ts", desc: isAr ? "واجهة رفع الملفات" : "File upload API" },
        { name: "src/app/api/source-code/route.ts", desc: isAr ? "واجهة الكود المصدري" : "Source code API" },
        { name: "src/app/api/download-source/route.ts", desc: isAr ? "واجهة تحميل التطبيق كـ ZIP" : "ZIP download API" },
        { name: "src/app/api/seed/route.ts", desc: isAr ? "تعبئة المنتجات الأولية" : "Seed skincare products" },
      ],
    },
    {
      lang: "CSS Styles",
      ext: ".css",
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      files: [
        { name: "src/app/globals.css", desc: isAr ? "الأنماط العامة - أزرار، حقول إدخال، بطاقات، جداول" : "Global styles - buttons, inputs, cards, tables, badges" },
      ],
    },
    {
      lang: "Config Files",
      ext: ".json/.mjs",
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      files: [
        { name: "package.json", desc: isAr ? "تبعيات المشروع - Next.js, React, Tailwind" : "Project dependencies - Next.js, React, Tailwind" },
        { name: "tsconfig.json", desc: isAr ? "إعدادات TypeScript" : "TypeScript configuration" },
        { name: "next.config.ts", desc: isAr ? "إعدادات Next.js" : "Next.js configuration" },
        { name: "tailwind.config.ts", desc: isAr ? "إعدادات Tailwind CSS" : "Tailwind CSS configuration" },
        { name: "postcss.config.mjs", desc: isAr ? "إعدادات PostCSS لمعالجة الأنماط" : "PostCSS config for style processing" },
      ],
    },
  ];

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) { router.push("/login"); return; }
        const d = await res.json();
        if (!d.isAdmin) router.push("/login");
      } catch { router.push("/login"); }
    }
    check();
  }, [router]);

  async function handleDownload() {
    setDownloading(true);
    setDownloaded(false);
    try {
      const res = await fetch("/api/download-source");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "CrystalOne-Android.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloaded(true);
      }
    } catch { /* silent */ }
    finally { setDownloading(false); }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    setUploading(true);
    setUploadMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        setUploadMsg(isAr ? "تم رفع الملف بنجاح!" : "File uploaded successfully!");
        setUploadError(false);
      } else {
        setUploadMsg(isAr ? "فشل الرفع. حاول مرة أخرى." : "Upload failed. Please try again.");
        setUploadError(true);
      }
    } catch {
      setUploadMsg(isAr ? "فشل الرفع. حاول مرة أخرى." : "Upload failed.");
      setUploadError(true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const totalFiles = langGroups.reduce((sum, g) => sum + g.files.length, 0);

  return (
    <div className="animate-fade-in space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isAr ? "تحميل التطبيق" : "Download Application"}</h1>
          <p className="text-sm text-gray-500">{isAr ? "تحميل وبناء وتشغيل كريستال وان على أي جهاز أندرويد" : "Download, build, and run Crystal One on any Android device"}</p>
        </div>
        <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
          {lang === "en" ? "العربية" : "English"}
        </button>
      </div>

      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-10 text-white text-center shadow-2xl">
        <svg className="w-24 h-24 mx-auto mb-6 drop-shadow-2xl" viewBox="0 0 120 130" fill="none">
          <polygon points="60,8 20,48 28,118 60,125" fill="#4c1d95" /><polygon points="60,8 100,48 92,118 60,125" fill="#5b21b6" />
          <polygon points="60,8 20,48 42,42" fill="white" opacity="0.3" /><polygon points="60,8 100,48 78,42" fill="white" opacity="0.25" />
          <polygon points="42,42 78,42 60,125" fill="white" opacity="0.15" />
          <line x1="60" y1="8" x2="20" y2="48" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="60" y1="8" x2="100" y2="48" stroke="white" strokeWidth="2" opacity="0.5" />
          <polygon points="60,12 48,38 55,35" fill="white" opacity="0.5" /><polygon points="60,12 72,38 65,35" fill="white" opacity="0.4" />
          <circle cx="52" cy="30" r="2.5" fill="white" opacity="0.8" /><circle cx="73" cy="55" r="1.5" fill="white" opacity="0.6" />
        </svg>
        <h2 className="text-3xl font-bold mb-2">Crystal One</h2>
        <p className="text-indigo-100 mb-2">{totalFiles} {isAr ? "ملف في" : "files in"} {langGroups.length} {isAr ? "لغات برمجة" : "languages"}</p>
        <p className="text-indigo-100 mb-8 max-w-md mx-auto">{isAr ? "التطبيق الكامل لأندرويد. حمّل، استخرج، وثبّت بأمر واحد." : "Complete application for Android. Download, extract, and install with one command."}</p>
        <button onClick={handleDownload} disabled={downloading} className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-xl font-bold bg-white text-indigo-700 hover:bg-indigo-50 transition shadow-xl disabled:opacity-60 cursor-pointer">
          {downloading ? <><div className="w-7 h-7 border-3 border-indigo-300 border-t-indigo-700 rounded-full animate-spin" />{isAr ? "جاري التحضير..." : "Preparing..."}</>
            : downloaded ? <><svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>{isAr ? "تم التحميل!" : "Downloaded!"}</>
            : <><svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>{isAr ? "تحميل لأندرويد" : "Download for Android"}</>}
        </button>
        <p className="text-xs text-indigo-200 mt-4">{isAr ? "يعمل على أندرويد 8 وأعلى. الإنترنت مطلوب فقط للتثبيت الأول." : "Works on Android 8+. Internet needed only for first install."}</p>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">{isAr ? "ملفات التطبيق مصنفة حسب لغة البرمجة" : "Application Files by Programming Language"}</h2>
        <p className="text-sm text-gray-500 mb-4">{isAr ? "هذه هي جميع الملفات المكونة للتطبيق" : "These are all the files that make up the application"}</p>
        <div className="space-y-4">
          {langGroups.map((group) => (
            <div key={group.ext} className={`${group.bgColor} border ${group.borderColor} rounded-2xl p-5`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg ${group.color} text-white flex items-center justify-center text-xs font-bold`}>{group.ext}</div>
                <div>
                  <p className={`text-base font-bold ${group.textColor}`}>{group.lang}</p>
                  <p className="text-xs text-gray-500">{group.files.length} {isAr ? "ملف" : "files"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {group.files.map((file) => (
                  <div key={file.name} className="flex items-start gap-2 bg-white/60 rounded-lg px-3 py-2 border border-gray-200/50">
                    <code className="text-xs font-mono text-gray-800 font-semibold whitespace-nowrap">{file.name.split("/").pop()}</code>
                    <span className="text-[11px] text-gray-500 flex-1">{file.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{isAr ? "رفع حزمة التطبيق" : "Upload Application Package"}</h3>
        <p className="text-sm text-gray-500 mb-5">{isAr ? "ارفع ملف ZIP مضغوط لاستبدال الكود المصدري الحالي" : "Upload a compressed ZIP file to replace current source code"}</p>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept=".zip" onChange={handleUpload} className="hidden" id="zip-upload" />
          <label htmlFor="zip-upload" className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition border border-gray-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            {isAr ? "اختر ملف ZIP" : "Choose ZIP File"}
          </label>
          <span className="text-sm text-gray-500">{selectedFileName || (isAr ? "لم يتم اختيار ملف" : "No file selected")}</span>
          {uploading && <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
        </div>
        {uploadMsg && (
          <div className={`mt-3 px-4 py-2.5 rounded-lg text-sm font-medium ${uploadError ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>{uploadMsg}</div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-5">{isAr ? "كيفية التثبيت على أندرويد" : "How to Install on Android"}</h3>
        <div className="space-y-4">
          {[
            { step: "1", title: isAr ? "تحميل الملف" : "Download the file", desc: isAr ? 'اضغط على "تحميل لأندرويد" أعلاه' : 'Click "Download for Android" above', color: "bg-blue-500" },
            { step: "2", title: isAr ? "استخراج الملف" : "Extract the file", desc: isAr ? "استخدم أي مدير ملفات لاستخراج ملف ZIP على هاتفك" : "Use any file manager to extract the ZIP on your phone", color: "bg-purple-500" },
            { step: "3", title: isAr ? "تثبيت Termux" : "Install Termux", desc: isAr ? "حمّل Termux من f-droid.org (مجاني)" : "Download Termux from f-droid.org (free)", color: "bg-indigo-500" },
            { step: "4", title: isAr ? "تشغيل المثبت" : "Run installer", desc: isAr ? "اكتب هذا الأمر في Termux:" : "Type this command in Termux:", cmd: "bash install.sh", color: "bg-green-500" },
            { step: "5", title: isAr ? "فتح التطبيق" : "Open app", desc: isAr ? "افتح المتصفح واذهب إلى:" : "Open browser and go to:", cmd: "http://localhost:3000", color: "bg-emerald-500" },
          ].map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className={`w-8 h-8 rounded-full ${s.color} text-white flex items-center justify-center flex-shrink-0 text-sm font-bold`}>{s.step}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                {s.cmd && <code className="block mt-2 bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono text-gray-800 border border-gray-200">{s.cmd}</code>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">{isAr ? "بعد التثبيت، فقط اكتب" : "After install, just type"}</p>
          <code className="bg-green-100 px-3 py-1.5 rounded-lg text-sm font-mono text-green-800 inline-block">crystal</code>
          <p className="text-xs text-green-700 mt-2">{isAr ? "في Termux لتشغيل التطبيق" : "in Termux to start the app"}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-800 mb-2">{isAr ? "بيانات المسؤول" : "Admin Login"}</p>
          <p className="text-xs text-blue-700">Phone: 01026541250</p>
          <p className="text-xs text-blue-700">Password: abdallah</p>
        </div>
      </div>
    </div>
  );
}
