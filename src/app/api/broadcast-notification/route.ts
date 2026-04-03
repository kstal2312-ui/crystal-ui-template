import { NextResponse } from "next/server";
import { getUsers, createNotification } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
    const { isAdmin } = await getCurrentUser();
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { type, message } = body;

        if (!message || !message.trim()) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const users = getUsers();
        let sentCount = 0;

        for (const user of users) {
            if (user.isActive) {
                createNotification({
                    type: type || "info",
                    message,
                    messageAr: message,
                    userName: user.name || user.phone,
                    amount: 0,
                });
                sentCount++;
            }
        }

        return NextResponse.json({ success: true, sentCount });
    } catch {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}