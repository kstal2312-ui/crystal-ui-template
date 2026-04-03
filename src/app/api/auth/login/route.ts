import { NextResponse } from "next/server";
import { getUserByPhone, createSession, getSettings } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 }
      );
    }

    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, "");

    const user = getUserByPhone(cleanedPhone);
    if (!user || user.password !== password) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      );
    }

    const token = createSession(user.id, false);
    const response = NextResponse.json({ success: true, isAdmin: false, userId: user.id });
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
