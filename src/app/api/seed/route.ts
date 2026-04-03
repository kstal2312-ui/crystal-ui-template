import { NextResponse } from "next/server";
import {
  getProducts,
  createProduct,
  getSettings,
  updateSettings,
} from "@/lib/data";

export async function POST() {
  const settings = getSettings();
  const products = getProducts();

  if (products.length === 0) {
    const skincareProducts = [
      { name: "Vitamin C Serum", price: 25, profitMargin: 5, storeId: 1, description: "Brightening vitamin C facial serum for radiant skin", image: "", isActive: true },
      { name: "Hyaluronic Acid Moisturizer", price: 30, profitMargin: 7, storeId: 1, description: "Deep hydrating face moisturizer with hyaluronic acid", image: "", isActive: true },
      { name: "Retinol Night Cream", price: 35, profitMargin: 6, storeId: 1, description: "Anti-aging retinol cream for overnight skin renewal", image: "", isActive: true },
      { name: "SPF 50 Sunscreen", price: 18, profitMargin: 4, storeId: 1, description: "Broad spectrum UV protection sunscreen lotion", image: "", isActive: true },
      { name: "Charcoal Face Mask", price: 12, profitMargin: 8, storeId: 1, description: "Deep cleansing charcoal face mask for pores", image: "", isActive: true },
      { name: "Rose Hip Oil", price: 22, profitMargin: 6, storeId: 1, description: "Organic rosehip oil for skin nourishment and scars", image: "", isActive: true },
      { name: "LED Face Therapy Device", price: 85, profitMargin: 3, storeId: 1, description: "Red and blue light therapy device for skin treatment", image: "", isActive: true },
      { name: "Facial Steamer", price: 45, profitMargin: 5, storeId: 1, description: "Nano ionic facial steamer for deep pore cleansing", image: "", isActive: true },
      { name: "Derma Roller Set", price: 15, profitMargin: 10, storeId: 1, description: "Microneedle derma roller for skin rejuvenation", image: "", isActive: true },
      { name: "Eye Cream Anti-Wrinkle", price: 28, profitMargin: 7, storeId: 1, description: "Collagen eye cream for dark circles and wrinkles", image: "", isActive: true },
      { name: "Niacinamide Serum", price: 20, profitMargin: 8, storeId: 1, description: "Pore minimizing serum with 10% niacinamide", image: "", isActive: true },
      { name: "Cleansing Brush Device", price: 55, profitMargin: 4, storeId: 1, description: "Electric facial cleansing brush with silicone head", image: "", isActive: true },
    ];

    for (const p of skincareProducts) {
      createProduct(p);
    }
  }

  if (!settings.depositPhones || settings.depositPhones.length === 0) {
    updateSettings({
      depositPhones: ["01026541250"],
    });
  }

  return NextResponse.json({ success: true, message: "Database seeded with skincare products" });
}
