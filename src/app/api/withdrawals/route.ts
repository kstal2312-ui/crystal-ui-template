import { NextResponse } from "next/server";
import { getWithdrawals, createWithdrawal, updateWithdrawal, updateUser, getUserById } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const { user, isAdmin } = await getCurrentUser();
  if (isAdmin) {
    return NextResponse.json({ withdrawals: getWithdrawals() });
  }
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ withdrawals: getWithdrawals().filter((w) => w.userId === user.id) });
}

export async function POST(request: Request) {
  const { user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (body.amount > user.balance) {
    return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
  }
  const withdrawal = createWithdrawal({
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    amount: body.amount,
    paymentPhone: body.paymentPhone,
    adminNotes: "",
    status: "pending",
  });
  return NextResponse.json({ success: true, withdrawal });
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
  const withdrawal = updateWithdrawal(id, updateData);
  if (!withdrawal) {
    return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
  }
  if (status === "approved") {
    const wUser = getUserById(withdrawal.userId);
    if (wUser) {
      updateUser(wUser.id, {
        balance: Math.max(0, wUser.balance - withdrawal.amount),
      });
    }
  }
  return NextResponse.json({ success: true, withdrawal });
}
