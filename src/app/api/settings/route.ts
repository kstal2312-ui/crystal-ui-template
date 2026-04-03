import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const settings = getSettings();
  return NextResponse.json({
    siteName: settings.siteName,
    logo: settings.logo,
    welcomeMessage: settings.welcomeMessage,
    adminMessage: settings.adminMessage,
    adminPhone: settings.adminPhone,
    adminPassword: settings.adminPassword,
    depositPhones: settings.depositPhones,
    storePrices: settings.storePrices,
    storeProfits: settings.storeProfits,
  });
}

export async function PUT(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await request.json();
  const { updateSettings } = await import("@/lib/data");
  const settings = updateSettings(body);
  return NextResponse.json({ success: true, settings });
}
