import { NextResponse } from "next/server";
import { getReferrals, updateReferral, updateUser, getUserById, createNotification } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const { user, isAdmin } = await getCurrentUser();
  if (isAdmin) {
    return NextResponse.json({ referrals: getReferrals() });
  }
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ referrals: getReferrals().filter((r) => r.referrerId === user.id) });
}

export async function PUT(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const { id, status } = body;
  const referral = updateReferral(id, {
    status,
    processedAt: new Date().toISOString(),
  });
  if (!referral) {
    return NextResponse.json({ error: "Referral not found" }, { status: 404 });
  }
  if (status === "approved") {
    const referrer = getUserById(referral.referrerId);
    if (referrer) {
      updateUser(referrer.id, {
        balance: referrer.balance + referral.reward,
        totalEarned: referrer.totalEarned + referral.reward,
      });

      createNotification({
        type: "reward",
        message: `${referrer.name || referrer.phone} received a $${referral.reward} referral reward`,
        messageAr: `${referrer.name || referrer.phone} تلقى مكافأة إحالة بقيمة $${referral.reward}`,
        userName: referrer.name || referrer.phone,
        amount: referral.reward,
      });
    }
  }
  return NextResponse.json({ success: true, referral });
}
