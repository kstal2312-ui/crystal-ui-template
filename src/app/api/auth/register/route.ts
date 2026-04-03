import { NextResponse } from "next/server";
import {
  getUserByPhone,
  getUserByInvitationCode,
  createUser,
  createReferral,
  updateUser,
  createSession,
  createTask,
  getProducts,
  createNotification,
} from "@/lib/data";
import { isValidEgyptianPhone } from "@/lib/auth";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const { name, phone, countryCode, password, confirmPassword, invitationCode } = body;

    if (!name || !phone || !password || !confirmPassword) {
      return NextResponse.json(
        { error: "Name, phone, password, and confirmation are required" },
        { status: 400 }
      );
    }

    const cleanedPhone = phone.replace(/[\s\-\(\)]/g, "");

    if (!isValidEgyptianPhone(cleanedPhone)) {
      return NextResponse.json(
        { error: "Invalid phone number. Use Egyptian, Saudi, Emirati, Kuwaiti, or Libyan numbers only" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (getUserByPhone(cleanedPhone)) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    let referrer = null;
    if (invitationCode && invitationCode.trim()) {
      referrer = getUserByInvitationCode(invitationCode.trim());
      if (!referrer) {
        return NextResponse.json(
          { error: "Invalid invitation code" },
          { status: 400 }
        );
      }
    }

    const user = createUser({
      name,
      phone: cleanedPhone,
      countryCode: countryCode || "+20",
      password,
      referredBy: referrer ? referrer.id : null,
    });

    if (referrer) {
      updateUser(referrer.id, {
        referralCount: referrer.referralCount + 1,
      });

      createReferral({
        referrerId: referrer.id,
        referredId: user.id,
        referredPhone: user.phone,
        status: "pending",
        reward: 10,
      });
    }

    const products = getProducts();
    if (products.length > 0) {
      const now = new Date();
      let currentTime = now.getTime() + 60 * 60 * 1000;

      for (let i = 0; i < 8; i++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const commissionPercent = randomProduct.profitMargin || (Math.floor(Math.random() * 10) + 1);
        const commission = (randomProduct.price * commissionPercent) / 100;
        const delayMinutes = i === 0 ? 60 : Math.floor(Math.random() * 120 + 60);
        currentTime += delayMinutes * 60 * 1000;

        if (currentTime > now.getTime() + 24 * 60 * 60 * 1000) break;

        createTask({
          userId: user.id,
          productId: randomProduct.id,
          productName: randomProduct.name,
          productImage: randomProduct.image,
          productPrice: randomProduct.price,
          commission,
          commissionPercent,
          status: "pending",
          scheduledFor: new Date(currentTime).toISOString(),
        });
      }
      updateUser(user.id, { lastTaskTime: new Date(currentTime).toISOString() });
    }

    // Notify admin of new registration
    try {
      createNotification({
        type: "info",
        message: `New user registered: ${user.name} (${user.phone})`,
        messageAr: `مستخدم جديد مسجل: ${user.name} (${user.phone})`,
        userName: "System",
        amount: 0,
      });
    } catch {
      // Silently handle notification error
    }

    const token = createSession(user.id, false);
    const response = NextResponse.json({
      success: true,
      userId: user.id,
      invitationCode: user.invitationCode,
    });
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
