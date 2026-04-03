import { NextResponse } from "next/server";
import { getRecentNotifications, createNotification } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const notifications = getRecentNotifications(30);
  return NextResponse.json({ notifications });
}

export async function POST(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const notification = createNotification(body);
  return NextResponse.json({ success: true, notification });
}
