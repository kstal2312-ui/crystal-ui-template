"use client";

import { useState, useEffect, useRef } from "react";

const t = {
  en: {
    productManagement: "Product Management",
    addEditManage: "Add, edit, and manage products",
    searchPlaceholder: "Search products...",
    addProduct: "Add Product",
    name: "Name",
    description: "Description",
    price: "Price",
    profitMargin: "Profit Margin %",
    profitMarginDesc: "Commission percentage for this product (1-100%)",
    store: "Store",
    selectStore: "Select Store",
    productImage: "Product Image",
    uploadImage: "Upload Image",
    change: "Change",
    remove: "Remove",
    creating: "Creating...",
    createProduct: "Create Product",
    cancel: "Cancel",
    noProducts: "No products found",
    active: "Active",
    inactive: "Inactive",
    edit: "Edit",
    toggleStatus: "Toggle Status",
    delete: "Delete",
    save: "Save",
    loading: "Loading products...",
    confirmDelete: "Are you sure you want to delete this product?",
  },
  ar: {
    productManagement: "إدارة المنتجات",
    addEditManage: "إضافة وتعديل وإدارة المنتجات",
    searchPlaceholder: "بحث عن المنتجات...",
    addProduct: "إضافة منتج",
    name: "الاسم",
    description: "الوصف",
    price: "السعر",
    profitMargin: "هامش الربح %",
    profitMarginDesc: "نسبة العمولة لهذا المنتج (1-100%)",
    store: "المتجر",
    selectStore: "اختر المتجر",
    productImage: "صورة المنتج",
    uploadImage: "رفع صورة",
    change: "تغيير",
    remove: "إزالة",
    creating: "جاري الإنشاء...",
    createProduct: "إنشاء منتج",
    cancel: "إلغاء",
    noProducts: "لا توجد منتجات",
    active: "نشط",
    inactive: "غير نشط",
    edit: "تعديل",
    toggleStatus: "تبديل الحالة",
    delete: "حذف",
    save: "حفظ",
    loading: "جاري تحميل المنتجات...",
    confirmDelete: "هل أنت متأكد أنك تريد حذف هذا المنتج؟",
  },
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  profitMargin: number;
  storeId: number;
  image: string;
  isActive: boolean;
  createdAt: string;
}

interface Store {
  id: number;
  name: string;
}

export default function AdminProductsPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const tr = t[lang];
  const isAr = lang === "ar";

  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [profitMargin, setProfitMargin] = useState("5");
  const [storeId, setStoreId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [editPrice, setEditPrice] = useState("");
  const [editProfitMargin, setEditProfitMargin] = useState("5");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [productsRes, storesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/stores"),
      ]);
      const productsData = await productsRes.json();
      const storesData = await storesRes.json();
      setProducts(productsData.products || []);
      setStores(storesData.stores || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setProfitMargin("5");
    setStoreId("");
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowForm(false);
    setEditingId(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    let imageUrl = "";
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("file", imageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      } catch {
      }
    }

    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          profitMargin: Number(profitMargin) || 5,
          storeId: Number(storeId),
          image: imageUrl,
          isActive: true,
        }),
      });
      await fetchData();
      resetForm();
    } catch {
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSave(id: string) {
    setSaving(id);
    try {
      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          price: Number(editPrice),
          profitMargin: Number(editProfitMargin) || 5,
          name: editName,
          description: editDescription,
        }),
      });
      await fetchData();
      setEditingId(null);
    } catch {
    } finally {
      setSaving(null);
    }
  }

  async function handleToggleActive(product: Product) {
    setSaving(product.id);
    try {
      await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isActive: !product.isActive }),
      });
      await fetchData();
    } catch {
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(tr.confirmDelete)) return;
    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
    }
  }

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditPrice(String(product.price));
    setEditProfitMargin(String(product.profitMargin || 5));
    setEditName(product.name);
    setEditDescription(product.description);
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-gray-900">{tr.productManagement}</h1>
          <p className="text-sm text-gray-500 mt-1">{tr.addEditManage}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={tr.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm w-48"
          />
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition cursor-pointer"
          >
            {tr.addProduct}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {tr.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {tr.description}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {tr.price}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {tr.profitMargin}
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">{tr.profitMarginDesc}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {tr.store}
              </label>
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-sm bg-white"
              >
                <option value="">{tr.selectStore}</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {tr.productImage}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-gray-200"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    {tr.change}
                  </button>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                  >
                    {tr.remove}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer"
              >
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm text-gray-500">{tr.uploadImage}</span>
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {tr.creating}
                </span>
              ) : (
                tr.createProduct
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
            >
              {tr.cancel}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">{tr.noProducts}</p>
          </div>
        ) : (
          filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-indigo-300"
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
              <div className="p-4 space-y-3">
                {editingId === product.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm"
                      placeholder={tr.name}
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm"
                      placeholder={tr.description}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm"
                      placeholder={tr.price}
                    />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editProfitMargin}
                      onChange={(e) => setEditProfitMargin(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 focus:border-indigo-500 outline-none text-sm"
                      placeholder={tr.profitMargin}
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleSave(product.id)}
                        disabled={saving === product.id}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50 cursor-pointer"
                      >
                        {saving === product.id ? "..." : tr.save}
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                      >
                        {tr.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {product.description}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          product.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {product.isActive ? tr.active : tr.inactive}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-indigo-600">
                        ${product.price.toFixed(2)}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        {product.profitMargin || 5}% {tr.profitMargin.split(" ")[0]}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(product)}
                        className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
                      >
                        {tr.edit}
                      </button>
                      <button
                        onClick={() => handleToggleActive(product)}
                        disabled={saving === product.id}
                        className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer ${
                          product.isActive
                            ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                            : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        }`}
                      >
                        {tr.toggleStatus}
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition cursor-pointer"
                      >
                        {tr.delete}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
