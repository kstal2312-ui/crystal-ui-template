import { NextResponse } from "next/server";
import { getStores, updateStore } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const stores = getStores();
  return NextResponse.json({ stores });
}

export async function PUT(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const { id, ...data } = body;
  const store = updateStore(id, data);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, store });
}
