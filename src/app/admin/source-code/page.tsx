"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface FileEntry { path: string; size: number; type: string; }
interface FileContent { file: string; content: string; size: number; lines: number; }

export default function SourceCodePage() {
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingFile, setLoadingFile] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const isAr = lang === "ar";

  const guide = isAr ? {
    guideTitle: "دليل إنشاء التطبيق بالتفصيل",
    guideSubtitle: "خطوة بخطوة لجمع الملفات وإنشاء التطبيق وتشغيله",
    section1Title: "القسم الأول: جمع الملفات",
    section1Desc: "يحتوي التطبيق على 46 ملفاً مصدرياً موزعة على 4 لغات برمجة. إليك كيفية جمعها:",
    s1step1: "الملفات الرئيسية (.tsx): 23 ملفاً تحتوي على واجهات المستخدم والصفحات",
    s1step2: "ملفات المنطق (.ts): 22 ملفاً تحتوي على واجهات API وطبقة البيانات والمصادقة",
    s1step3: "ملفات الأنماط (.css): ملف واحد يحتوي على جميع الأنماط",
    s1step4: "ملفات الإعدادات (.json/.mjs): 5 ملفات تحتوي على إعدادات المشروع",
    s1tip: "اضغط على 'تحميل التطبيق الكامل' أعلاه للحصول على جميع الملفات مرة واحدة",
    section2Title: "القسم الثاني: هيكل الملفات",
    section2Desc: "بعد تحميل الملف المضغوط، ستجد الهيكل التالي:",
    structure: [
      { name: "src/app/", desc: "جميع صفحات الواجهة ومسارات API" },
      { name: "src/app/admin/", desc: "صفحات لوحة تحكم المسؤول (11 صفحة)" },
      { name: "src/app/dashboard/", desc: "صفحات لوحة تحكم المستخدم (7 صفحات)" },
      { name: "src/app/api/", desc: "واجهات API الخلفية (15 واجهة)" },
      { name: "src/lib/", desc: "المكتبات المساعدة (الأنواع، البيانات، المصادقة)" },
      { name: "src/app/globals.css", desc: "الأنماط العامة للتطبيق" },
      { name: "package.json", desc: "قائمة المكتبات المطلوبة" },
      { name: "next.config.ts", desc: "إعدادات Next.js" },
      { name: "tsconfig.json", desc: "إعدادات TypeScript" },
      { name: "tailwind.config.ts", desc: "إعدادات Tailwind CSS" },
      { name: "install.sh", desc: "ملف التثبيت التلقائي لأندرويد" },
    ],
    section3Title: "القسم الثالث: إنشاء التطبيق على الكمبيوتر",
    section3Desc: "لإنشاء التطبيق على جهاز الكمبيوتر، اتبع هذه الخطوات:",
    s3step1: "1. تأكد من تثبيت Node.js (الإصدار 18 أو أحدث)",
    s3cmd1: "node --version",
    s3step2: "2. استخرج ملف ZIP المحمل",
    s3cmd2: "unzip CrystalOne-Android.zip",
    s3step3: "3. ادخل إلى مجلد التطبيق",
    s3cmd3: "cd src",
    s3step4: "4. ثبّت المكتبات المطلوبة",
    s3cmd4: "npm install",
    s3step5: "5. بنِ التطبيق للإنتاج",
    s3cmd5: "npm run build",
    s3step6: "6. شغّل التطبيق",
    s3cmd6: "npm start",
    s3step7: "7. افتح المتصفح واذهب إلى",
    s3cmd7: "http://localhost:3000",
    section4Title: "القسم الرابع: إنشاء التطبيق على أندرويد",
    section4Desc: "لتشغيل التطبيق على هاتف أندرويد:",
    s4step1: "1. حمّل تطبيق Termux من f-droid.org",
    s4step2: "2. افتح Termux وثبّت Node.js",
    s4cmd2: "pkg install nodejs",
    s4step3: "3. امنح إذن الوصول للتخزين",
    s4cmd3: "termux-setup-storage",
    s4step4: "4. انسخ الملفات المحملة إلى Termux",
    s4cmd4: "cp ~/storage/downloads/CrystalOne-Android.zip ~/",
    s4step5: "5. استخرج الملفات",
    s4cmd5: "unzip CrystalOne-Android.zip && cd src",
    s4step6: "6. ثبّت المكتبات",
    s4cmd6: "npm install",
    s4step7: "7. بنِ التطبيق",
    s4cmd7: "npm run build",
    s4step8: "8. شغّل التطبيق",
    s4cmd8: "npm start",
    s4step9: "9. افتح المتصفح على هاتفك",
    s4cmd9: "http://localhost:3000",
    s4tip: "أو شغّل ملف install.sh للتثبيت التلقائي: bash install.sh",
    section5Title: "القسم الخامس: دليل الملفات بلغة البرمجة",
    section5Desc: "إليك تفاصيل كل ملف مصنف بلغته:",
    copyCode: "نسخ الكود",
    downloadFile: "تحميل",
    downloadAll: "تحميل الكل",
    downloadApp: "تحميل التطبيق الكامل",
    downloadAppDesc: "تحميل جميع ملفات التطبيق كملف مضغوط",
    copied: "تم النسخ!",
    loading: "جاري التحميل...",
    loadingFile: "جاري تحميل الملف...",
    noFiles: "لا توجد ملفات",
    all: "الكل",
    app: "الواجهات",
    api: "API",
    lib: "المكتبات",
    search: "بحث...",
    selectFile: "اختر ملفاً لعرض الكود",
    selectFileDesc: "انقر على أي ملف من القائمة",
  } : {
    guideTitle: "Complete Application Creation Guide",
    guideSubtitle: "Step-by-step instructions for collecting files, creating, and running the application",
    section1Title: "Part 1: Collecting the Files",
    section1Desc: "The application contains 46 source files across 4 programming languages. Here is how to collect them:",
    s1step1: "Main Files (.tsx): 23 files containing UI interfaces and pages",
    s1step2: "Logic Files (.ts): 22 files containing API routes, data layer, and authentication",
    s1step3: "Style Files (.css): 1 file containing all styles",
    s1step4: "Config Files (.json/.mjs): 5 files containing project settings",
    s1tip: "Click 'Download Full Application' above to get all files at once",
    section2Title: "Part 2: File Structure",
    section2Desc: "After downloading the compressed file, you will find this structure:",
    structure: [
      { name: "src/app/", desc: "All UI pages and API routes" },
      { name: "src/app/admin/", desc: "Admin control panel pages (11 pages)" },
      { name: "src/app/dashboard/", desc: "User dashboard pages (7 pages)" },
      { name: "src/app/api/", desc: "Backend API routes (15 routes)" },
      { name: "src/lib/", desc: "Helper libraries (types, data, auth)" },
      { name: "src/app/globals.css", desc: "Global application styles" },
      { name: "package.json", desc: "Required library list" },
      { name: "next.config.ts", desc: "Next.js configuration" },
      { name: "tsconfig.json", desc: "TypeScript configuration" },
      { name: "tailwind.config.ts", desc: "Tailwind CSS configuration" },
      { name: "install.sh", desc: "Auto-install script for Android" },
    ],
    section3Title: "Part 3: Creating the Application on Computer",
    section3Desc: "To create the application on a computer, follow these steps:",
    s3step1: "1. Make sure Node.js is installed (version 18 or later)",
    s3cmd1: "node --version",
    s3step2: "2. Extract the downloaded ZIP file",
    s3cmd2: "unzip CrystalOne-Android.zip",
    s3step3: "3. Enter the application folder",
    s3cmd3: "cd src",
    s3step4: "4. Install required libraries",
    s3cmd4: "npm install",
    s3step5: "5. Build the application for production",
    s3cmd5: "npm run build",
    s3step6: "6. Start the application",
    s3cmd6: "npm start",
    s3step7: "7. Open browser and go to",
    s3cmd7: "http://localhost:3000",
    section4Title: "Part 4: Creating the Application on Android",
    section4Desc: "To run the application on an Android phone:",
    s4step1: "1. Download Termux app from f-droid.org",
    s4step2: "2. Open Termux and install Node.js",
    s4cmd2: "pkg install nodejs",
    s4step3: "3. Grant storage permission",
    s4cmd3: "termux-setup-storage",
    s4step4: "4. Copy downloaded files to Termux",
    s4cmd4: "cp ~/storage/downloads/CrystalOne-Android.zip ~/",
    s4step5: "5. Extract files",
    s4cmd5: "unzip CrystalOne-Android.zip && cd src",
    s4step6: "6. Install libraries",
    s4cmd6: "npm install",
    s4step7: "7. Build the application",
    s4cmd7: "npm run build",
    s4step8: "8. Start the application",
    s4cmd8: "npm start",
    s4step9: "9. Open browser on your phone",
    s4cmd9: "http://localhost:3000",
    s4tip: "Or run install.sh for automatic installation: bash install.sh",
    section5Title: "Part 5: Files by Programming Language",
    section5Desc: "Here are details of each file organized by language:",
    copyCode: "Copy Code",
    downloadFile: "Download",
    downloadAll: "Download All",
    downloadApp: "Download Full Application",
    downloadAppDesc: "Download all application files as compressed package",
    copied: "Copied!",
    loading: "Loading...",
    loadingFile: "Loading file...",
    noFiles: "No files found",
    all: "All",
    app: "Pages",
    api: "API",
    lib: "Libraries",
    search: "Search...",
    selectFile: "Select a file to view code",
    selectFileDesc: "Click any file from the list",
  };

  const langGroups = isAr ? [
    {
      title: "TypeScript React (.tsx) - واجهات المستخدم",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      files: [
        { name: "page.tsx", desc: "الصفحة الرئيسية مع واجهة الترحيب وأزرار تسجيل الدخول" },
        { name: "layout.tsx", desc: "التخطيط الرئيسي للتطبيق مع إعدادات الصفحة" },
        { name: "login/page.tsx", desc: "صفحة تسجيل الدخول برقم الهاتف وكلمة المرور" },
        { name: "register/page.tsx", desc: "صفحة إنشاء الحساب مع الاسم ورمز البلد والدعوة" },
        { name: "dashboard/layout.tsx", desc: "تخطيط لوحة المستخدم مع القائمة الجانبية" },
        { name: "dashboard/page.tsx", desc: "الصفحة الرئيسية مع الإحصائيات والأرباح" },
        { name: "dashboard/stores/page.tsx", desc: "صفحة المتاجر العشرة والاشتراك" },
        { name: "dashboard/tasks/page.tsx", desc: "صفحة المهام وقبول/رفض طلبات البيع" },
        { name: "dashboard/profile/page.tsx", desc: "الملف الشخصي ورمز الدعوة" },
        { name: "dashboard/deposit/page.tsx", desc: "طلب الإيداع مع رفع الصورة" },
        { name: "dashboard/withdraw/page.tsx", desc: "طلب السحب بدون صورة" },
        { name: "dashboard/notifications/page.tsx", desc: "الإشعارات مع تحديث تلقائي كل 7 دقائق" },
        { name: "admin/layout.tsx", desc: "تخطيط لوحة المسؤول مع القائمة الداكنة" },
        { name: "admin/page.tsx", desc: "لوحة تحكم المسؤول مع الإحصائيات" },
        { name: "admin/users/page.tsx", desc: "إدارة المستخدمين (عرض/تعديل/حذف)" },
        { name: "admin/products/page.tsx", desc: "إدارة المنتجات وهامش الربح" },
        { name: "admin/tasks/page.tsx", desc: "إدارة المهام" },
        { name: "admin/deposits/page.tsx", desc: "إدارة الإيداعات (قبول/رفض)" },
        { name: "admin/withdrawals/page.tsx", desc: "إدارة السحوبات (قبول/رفض)" },
        { name: "admin/referrals/page.tsx", desc: "إدارة الإحالات (قبول/رفض)" },
        { name: "admin/settings/page.tsx", desc: "إعدادات الموقع والمتاجر" },
        { name: "admin/source-code/page.tsx", desc: "عرض الكود المصدري" },
        { name: "admin/download/page.tsx", desc: "صفحة تحميل التطبيق" },
      ],
    },
    {
      title: "TypeScript (.ts) - منطق التطبيق",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      files: [
        { name: "lib/types.ts", desc: "تعريفات TypeScript لجميع الكيانات (User, Product, Task, Deposit, Withdrawal, Referral, Notification, Settings)" },
        { name: "lib/data.ts", desc: "طبقة البيانات - قراءة وكتابة ملفات JSON للتخزين الدائم" },
        { name: "lib/auth.ts", desc: "المصادقة وجلب المستخدم الحالي والتحقق من رقم الهاتف" },
        { name: "lib/i18n.ts", desc: "الترجمة العربية والإنجليزية" },
        { name: "api/auth/login/route.ts", desc: "تسجيل الدخول - يتحقق من المسؤول أولاً ثم المستخدم" },
        { name: "api/auth/register/route.ts", desc: "إنشاء حساب - يتحقق من رقم الهاتف الفريد ورمز الدعوة" },
        { name: "api/auth/logout/route.ts", desc: "تسجيل الخروج وحذف الجلسة" },
        { name: "api/auth/me/route.ts", desc: "جلب بيانات المستخدم الحالي من الجلسة" },
        { name: "api/users/route.ts", desc: "واجهة CRUD للمستخدمين (للمسؤول فقط)" },
        { name: "api/stores/route.ts", desc: "واجهة المتاجر العشرة" },
        { name: "api/products/route.ts", desc: "واجهة المنتجات مع رفع الصور" },
        { name: "api/tasks/route.ts", desc: "واجهة المهام مع الجدولة" },
        { name: "api/deposits/route.ts", desc: "واجهة طلبات الإيداع" },
        { name: "api/withdrawals/route.ts", desc: "واجهة طلبات السحب" },
        { name: "api/referrals/route.ts", desc: "واجهة الإحالات ومكافأة 10$" },
        { name: "api/notifications/route.ts", desc: "واجهة الإشعارات" },
        { name: "api/settings/route.ts", desc: "واجهة إعدادات الموقع" },
        { name: "api/subscribe/route.ts", desc: "واجهة الاشتراك في المتاجر" },
        { name: "api/upload/route.ts", desc: "واجهة رفع الملفات والصور" },
        { name: "api/source-code/route.ts", desc: "واجهة قراءة ملفات الكود المصدري" },
        { name: "api/download-source/route.ts", desc: "واجهة إنشاء ملف ZIP للتحميل" },
        { name: "api/seed/route.ts", desc: "تعبئة المنتجات الأولية (12 منتج عناية بالبشرة)" },
      ],
    },
    {
      title: "CSS (.css) - الأنماط",
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      files: [
        { name: "globals.css", desc: "الأنماط العامة: الأزرار (.btn)، حقول الإدخال (.input-field)، البطاقات (.card)، الجداول، الشارات (.badge)، الرسوم المتحركة" },
      ],
    },
    {
      title: "Config (.json/.mjs) - ملفات الإعداد",
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      files: [
        { name: "package.json", desc: "المكتبات: Next.js 16, React 19, Tailwind CSS 4, uuid" },
        { name: "tsconfig.json", desc: "إعدادات TypeScript مع المسارات المخصصة (@/)" },
        { name: "next.config.ts", desc: "إعدادات Next.js للتطبيق" },
        { name: "tailwind.config.ts", desc: "إعدادات Tailwind CSS" },
        { name: "postcss.config.mjs", desc: "إعدادات PostCSS لمعالجة الأنماط" },
      ],
    },
  ] : [
    {
      title: "TypeScript React (.tsx) - User Interfaces",
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      files: [
        { name: "page.tsx", desc: "Landing page with welcome interface and login/register buttons" },
        { name: "layout.tsx", desc: "Root application layout with page metadata" },
        { name: "login/page.tsx", desc: "Login page with phone number and password" },
        { name: "register/page.tsx", desc: "Registration with name, country code, phone, password, invitation code" },
        { name: "dashboard/layout.tsx", desc: "User dashboard layout with sidebar navigation" },
        { name: "dashboard/page.tsx", desc: "Dashboard main page with stats and profits" },
        { name: "dashboard/stores/page.tsx", desc: "10 store levels with subscription" },
        { name: "dashboard/tasks/page.tsx", desc: "Sales tasks with accept/decline" },
        { name: "dashboard/profile/page.tsx", desc: "Profile with invitation code and referral stats" },
        { name: "dashboard/deposit/page.tsx", desc: "Deposit request with image upload" },
        { name: "dashboard/withdraw/page.tsx", desc: "Withdrawal request (no image)" },
        { name: "dashboard/notifications/page.tsx", desc: "Notifications with 7-minute auto-refresh" },
        { name: "admin/layout.tsx", desc: "Admin layout with dark sidebar" },
        { name: "admin/page.tsx", desc: "Admin dashboard with overview stats" },
        { name: "admin/users/page.tsx", desc: "User management (view/edit/delete)" },
        { name: "admin/products/page.tsx", desc: "Product management with profit margins" },
        { name: "admin/tasks/page.tsx", desc: "Task management" },
        { name: "admin/deposits/page.tsx", desc: "Deposit approve/reject" },
        { name: "admin/withdrawals/page.tsx", desc: "Withdrawal approve/reject" },
        { name: "admin/referrals/page.tsx", desc: "Referral approve/reject" },
        { name: "admin/settings/page.tsx", desc: "Site settings and store controls" },
        { name: "admin/source-code/page.tsx", desc: "Source code viewer" },
        { name: "admin/download/page.tsx", desc: "App download page" },
      ],
    },
    {
      title: "TypeScript (.ts) - Application Logic",
      color: "bg-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      files: [
        { name: "lib/types.ts", desc: "TypeScript definitions for all entities (User, Product, Task, Deposit, Withdrawal, Referral, Notification, Settings)" },
        { name: "lib/data.ts", desc: "Data layer - read/write JSON files for persistent storage" },
        { name: "lib/auth.ts", desc: "Authentication, get current user, phone validation" },
        { name: "lib/i18n.ts", desc: "Arabic/English translations" },
        { name: "api/auth/login/route.ts", desc: "Login API - checks admin first, then user" },
        { name: "api/auth/register/route.ts", desc: "Registration - checks unique phone and invitation code" },
        { name: "api/auth/logout/route.ts", desc: "Logout and delete session" },
        { name: "api/auth/me/route.ts", desc: "Get current user data from session" },
        { name: "api/users/route.ts", desc: "User CRUD API (admin only)" },
        { name: "api/stores/route.ts", desc: "10 store levels API" },
        { name: "api/products/route.ts", desc: "Products API with image upload" },
        { name: "api/tasks/route.ts", desc: "Tasks API with scheduling" },
        { name: "api/deposits/route.ts", desc: "Deposit requests API" },
        { name: "api/withdrawals/route.ts", desc: "Withdrawal requests API" },
        { name: "api/referrals/route.ts", desc: "Referrals API with $10 reward" },
        { name: "api/notifications/route.ts", desc: "Notifications API" },
        { name: "api/settings/route.ts", desc: "Site settings API" },
        { name: "api/subscribe/route.ts", desc: "Store subscription API" },
        { name: "api/upload/route.ts", desc: "File and image upload API" },
        { name: "api/source-code/route.ts", desc: "Read source code files API" },
        { name: "api/download-source/route.ts", desc: "Create ZIP download API" },
        { name: "api/seed/route.ts", desc: "Seed initial products (12 skincare items)" },
      ],
    },
    {
      title: "CSS (.css) - Styles",
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      files: [
        { name: "globals.css", desc: "Global styles: Buttons (.btn), Inputs (.input-field), Cards (.card), Tables, Badges (.badge), Animations" },
      ],
    },
    {
      title: "Config (.json/.mjs) - Settings",
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      files: [
        { name: "package.json", desc: "Libraries: Next.js 16, React 19, Tailwind CSS 4, uuid" },
        { name: "tsconfig.json", desc: "TypeScript settings with custom paths (@/)" },
        { name: "next.config.ts", desc: "Next.js application configuration" },
        { name: "tailwind.config.ts", desc: "Tailwind CSS configuration" },
        { name: "postcss.config.mjs", desc: "PostCSS config for style processing" },
      ],
    },
  ];

  useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) { router.push("/login"); return; }
        const data = await res.json();
        if (!data.isAdmin) router.push("/login");
      } catch { router.push("/login"); }
    }
    checkAdmin();
  }, [router]);

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch("/api/source-code");
        if (res.ok) {
          const data = await res.json();
          setFiles(data.files || []);
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    }
    fetchFiles();
  }, []);

  const loadFile = useCallback(async (filePath: string) => {
    setLoadingFile(true);
    try {
      const res = await fetch(`/api/source-code?file=${encodeURIComponent(filePath)}`);
      if (res.ok) { setSelectedFile(await res.json()); }
    } catch { /* silent */ }
    finally { setLoadingFile(false); }
  }, []);

  function copyCode() {
    if (selectedFile) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function downloadFile() {
    if (!selectedFile) return;
    const blob = new Blob([selectedFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile.file.split("/").pop() || "file.ts";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function downloadFullApp() {
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
      }
    } catch { /* silent */ }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case ".tsx": return "bg-blue-100 text-blue-700";
      case ".ts": return "bg-green-100 text-green-700";
      case ".css": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  function getCategory(filePath: string) {
    if (filePath.includes("/api/")) return "api";
    if (filePath.includes("/lib/")) return "lib";
    return "app";
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.path.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || getCategory(f.path) === filter;
    return matchesSearch && matchesFilter;
  });

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" dir={isAr ? "rtl" : "ltr"}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{guide.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isAr ? "الكود المصدري" : "Source Code"}</h1>
          <p className="text-sm text-gray-500 mt-1">{isAr ? "تصفح جميع ملفات التطبيق مع دليل الإنشاء" : "Browse all files with creation guide"}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2 text-sm">
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-medium">{files.length} {isAr ? "ملف" : "files"}</span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg font-medium">{formatSize(totalSize)}</span>
          </div>
          <button onClick={() => setShowGuide(!showGuide)} className="px-3 py-2 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition">
            {showGuide ? (isAr ? "إخفاء الدليل" : "Hide Guide") : (isAr ? "إظهار الدليل" : "Show Guide")}
          </button>
          <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="px-3 py-2 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition">
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold mb-1">{guide.downloadApp}</h2>
            <p className="text-indigo-100 text-sm">{guide.downloadAppDesc}</p>
          </div>
          <button onClick={downloadFullApp} className="flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-white text-indigo-700 hover:bg-indigo-50 transition shadow-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {guide.downloadApp}
          </button>
        </div>
      </div>

      {showGuide && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">{guide.guideTitle}</h2>
            <p className="text-sm text-gray-500">{guide.guideSubtitle}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">{guide.section1Title}</h3>
            <p className="text-sm text-gray-600 mb-4">{guide.section1Desc}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[guide.s1step1, guide.s1step2, guide.s1step3, guide.s1step4].map((step, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-xs text-gray-700">{step}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-indigo-600 mt-3 font-medium">{guide.s1tip}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">{guide.section2Title}</h3>
            <p className="text-sm text-gray-600 mb-4">{guide.section2Desc}</p>
            <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm border border-gray-200">
              {guide.structure.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-1.5 border-b border-gray-200 last:border-0">
                  <span className="text-indigo-600 font-semibold whitespace-nowrap">{item.name}</span>
                  <span className="text-gray-500 text-xs">- {item.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">{guide.section3Title}</h3>
            <p className="text-sm text-gray-600 mb-4">{guide.section3Desc}</p>
            <div className="space-y-3">
              {[
                { step: guide.s3step1, cmd: guide.s3cmd1, color: "bg-blue-500" },
                { step: guide.s3step2, cmd: guide.s3cmd2, color: "bg-blue-500" },
                { step: guide.s3step3, cmd: guide.s3cmd3, color: "bg-blue-500" },
                { step: guide.s3step4, cmd: guide.s3cmd4, color: "bg-green-500" },
                { step: guide.s3step5, cmd: guide.s3cmd5, color: "bg-green-500" },
                { step: guide.s3step6, cmd: guide.s3cmd6, color: "bg-green-500" },
                { step: guide.s3step7, cmd: guide.s3cmd7, color: "bg-emerald-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full ${item.color} text-white flex items-center justify-center flex-shrink-0 text-xs font-bold`}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{item.step}</p>
                    <code className="block mt-1 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-800 border border-gray-200">{item.cmd}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">{guide.section4Title}</h3>
            <p className="text-sm text-gray-600 mb-4">{guide.section4Desc}</p>
            <div className="space-y-3">
              {[
                { step: guide.s4step1, cmd: null, color: "bg-purple-500" },
                { step: guide.s4step2, cmd: guide.s4cmd2, color: "bg-purple-500" },
                { step: guide.s4step3, cmd: guide.s4cmd3, color: "bg-indigo-500" },
                { step: guide.s4step4, cmd: guide.s4cmd4, color: "bg-indigo-500" },
                { step: guide.s4step5, cmd: guide.s4cmd5, color: "bg-indigo-500" },
                { step: guide.s4step6, cmd: guide.s4cmd6, color: "bg-green-500" },
                { step: guide.s4step7, cmd: guide.s4cmd7, color: "bg-green-500" },
                { step: guide.s4step8, cmd: guide.s4cmd8, color: "bg-green-500" },
                { step: guide.s4step9, cmd: guide.s4cmd9, color: "bg-emerald-500" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full ${item.color} text-white flex items-center justify-center flex-shrink-0 text-xs font-bold`}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{item.step}</p>
                    {item.cmd && <code className="block mt-1 bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-800 border border-gray-200">{item.cmd}</code>}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-indigo-600 mt-3 font-medium">{guide.s4tip}</p>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">{guide.section5Title}</h3>
            <p className="text-sm text-gray-500 mb-4">{guide.section5Desc}</p>
            <div className="space-y-4">
              {langGroups.map((group, gi) => (
                <div key={gi} className={`${group.bgColor} border ${group.borderColor} rounded-2xl p-5`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${group.color} text-white flex items-center justify-center text-xs font-bold`}>{group.files.length}</div>
                    <div>
                      <p className={`text-sm font-bold ${group.textColor}`}>{group.title}</p>
                      <p className="text-xs text-gray-500">{group.files.length} {isAr ? "ملف" : "files"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {group.files.map((file, fi) => (
                      <div key={fi} className="bg-white/70 rounded-lg px-3 py-2 border border-gray-200/50">
                        <p className="text-xs font-mono font-semibold text-gray-800">{file.name}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{file.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 h-[500px]">
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <input type="text" placeholder={guide.search} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none" dir="ltr" />
            <div className="flex gap-1 mt-2 flex-wrap">
              {["all", "app", "api", "lib"].map((cat) => (
                <button key={cat} onClick={() => setFilter(cat)} className={`px-2 py-1 rounded text-xs font-medium transition ${filter === cat ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {guide[cat as keyof typeof guide] as string}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {filteredFiles.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">{guide.noFiles}</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredFiles.map((file) => (
                  <button key={file.path} onClick={() => loadFile(file.path)} className={`w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors ${selectedFile?.file === file.path ? "bg-indigo-50 border-e-2 border-indigo-500" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getTypeColor(file.type)}`}>{file.type}</span>
                      <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mt-1 truncate" dir="ltr">{file.path}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col min-w-0">
          {loadingFile ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 text-sm">{guide.loadingFile}</p>
              </div>
            </div>
          ) : selectedFile ? (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800" dir="ltr">{selectedFile.file}</p>
                  <p className="text-xs text-gray-400">{selectedFile.lines} {isAr ? "سطر" : "lines"} - {formatSize(selectedFile.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={copyCode} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition">{copied ? guide.copied : guide.copyCode}</button>
                  <button onClick={downloadFile} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {guide.downloadFile}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <pre className="p-4 text-sm font-mono text-gray-800 whitespace-pre leading-relaxed" dir="ltr"><code>{selectedFile.content}</code></pre>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                </div>
                <p className="text-sm font-semibold text-gray-700 mb-1">{guide.selectFile}</p>
                <p className="text-xs text-gray-400">{guide.selectFileDesc}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
