import { NextResponse } from "next/server";
import { getDeposits, createDeposit, updateDeposit } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const { user, isAdmin } = await getCurrentUser();
  if (isAdmin) {
    return NextResponse.json({ deposits: getDeposits() });
  }
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ deposits: getDeposits().filter((d) => d.userId === user.id) });
}

export async function POST(request: Request) {
  const { user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const deposit = createDeposit({
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    recipientPhone: body.recipientPhone,
    senderPhone: body.senderPhone,
    amount: body.amount,
    transferNumber: body.transferNumber || "",
    image: body.image || null,
    adminNotes: "",
    status: "pending",
  });
  return NextResponse.json({ success: true, deposit });
}

export async function PUT(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const { id, status, adminNotes } = body;
  const updateData: Record<string, unknown> = {
    status,
    processedAt: new Date().toISOString(),
  };
  if (adminNotes !== undefined) {
    updateData.adminNotes = adminNotes;
  }
  const deposit = updateDeposit(id, updateData);
  if (!deposit) {
    return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, deposit });
}
