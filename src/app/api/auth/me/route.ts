import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const { user, isAdmin, session } = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null, isAdmin: false }, { status: 401 });
  }
  if (isAdmin) {
    return NextResponse.json({ user: null, isAdmin: true });
  }
  return NextResponse.json({
    user: user
      ? {
          id: user.id,
          name: user.name,
          phone: user.phone,
          countryCode: user.countryCode,
          invitationCode: user.invitationCode,
          balance: user.balance,
          profits: user.profits,
          totalEarned: user.totalEarned,
          referralCount: user.referralCount,
          subscriptionLevel: user.subscriptionLevel,
          isSubscribed: user.isSubscribed,
          subscriptionPaid: user.subscriptionPaid,
          subscriptionAccepted: user.subscriptionAccepted,
          createdAt: user.createdAt,
        }
      : null,
    isAdmin: false,
  });
}
