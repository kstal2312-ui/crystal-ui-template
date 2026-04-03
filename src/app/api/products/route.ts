import { NextResponse } from "next/server";
import {
  getProducts,
  getProductsByStore,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");
  if (storeId) {
    const products = getProductsByStore(parseInt(storeId));
    return NextResponse.json({ products });
  }
  const products = getProducts();
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const product = createProduct(body);
  return NextResponse.json({ success: true, product });
}

export async function PUT(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const { id, ...data } = body;
  const product = updateProduct(id, data);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, product });
}

export async function DELETE(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }
  deleteProduct(id);
  return NextResponse.json({ success: true });
}
