import { NextResponse } from "next/server";
import { getUsers, updateUser, deleteUser, getSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const users = getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    password: u.password,
    invitationCode: u.invitationCode,
    balance: u.balance,
    profits: u.profits,
    totalEarned: u.totalEarned,
    referralCount: u.referralCount,
    subscriptionLevel: u.subscriptionLevel,
    isSubscribed: u.isSubscribed,
    subscriptionPaid: u.subscriptionPaid,
    subscriptionAccepted: u.subscriptionAccepted,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));
  return NextResponse.json({ users });
}

export async function PUT(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const { id, ...data } = body;
  const user = updateUser(id, data);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
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
  deleteUser(id);
  return NextResponse.json({ success: true });
}
