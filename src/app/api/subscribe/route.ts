import { NextResponse } from "next/server";
import { updateUser, getUserById, createTask, getProducts } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  const { user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { storeLevel } = body;

  if (!storeLevel || storeLevel < 1 || storeLevel > 10) {
    return NextResponse.json({ error: "Invalid store level" }, { status: 400 });
  }

  if (storeLevel === 1) {
    const updatedUser = updateUser(user.id, {
      isSubscribed: true,
      subscriptionLevel: 1,
      subscriptionPaid: true,
      subscriptionAccepted: true,
    });

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

    return NextResponse.json({ success: true, user: updatedUser });
  }

  const updatedUser = updateUser(user.id, {
    subscriptionPaid: true,
    subscriptionAccepted: false,
    subscriptionLevel: storeLevel,
  });

  return NextResponse.json({
    success: true,
    user: updatedUser,
    message: "Subscription request submitted. Waiting for admin approval.",
  });
}

export async function PUT(request: Request) {
  const { isAdmin } = await getCurrentUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, action } = body;

  if (!userId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const targetUser = getUserById(userId);
  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (action === "approve") {
    const updatedUser = updateUser(userId, {
      isSubscribed: true,
      subscriptionAccepted: true,
    });

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
          userId: userId,
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
      updateUser(userId, { lastTaskTime: new Date(currentTime).toISOString() });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  }

  if (action === "reject") {
    const updatedUser = updateUser(userId, {
      subscriptionPaid: false,
      subscriptionAccepted: false,
      subscriptionLevel: 0,
    });
    return NextResponse.json({ success: true, user: updatedUser });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
