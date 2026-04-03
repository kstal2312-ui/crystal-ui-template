import { NextResponse } from "next/server";
import {
  getTasks,
  getTasksByUser,
  updateTask,
  updateUser,
  getUserById,
  getProducts,
  createTask,
} from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const { user, isAdmin } = await getCurrentUser();
  if (isAdmin) {
    const tasks = getTasks();
    return NextResponse.json({ tasks });
  }
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const now = new Date();
  const userTasks = getTasksByUser(user.id).filter(
    (t) => new Date(t.scheduledFor) <= now
  );
  return NextResponse.json({ tasks: userTasks });
}

export async function PUT(request: Request) {
  const { user, isAdmin } = await getCurrentUser();
  if (!user && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const { id, status } = body;

  const task = updateTask(id, {
    status,
    completedAt: status === "completed" ? new Date().toISOString() : null,
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (status === "accepted" || status === "completed") {
    const taskUser = getUserById(task.userId);
    if (taskUser) {
      updateUser(taskUser.id, {
        profits: taskUser.profits + task.commission,
        balance: taskUser.balance + task.commission,
        totalEarned: taskUser.totalEarned + task.commission,
      });
    }

    const products = getProducts();
    if (products.length > 0) {
      const user2 = getUserById(task.userId);
      if (user2 && user2.isSubscribed) {
        const lastTask = user2.lastTaskTime
          ? new Date(user2.lastTaskTime)
          : new Date(user2.createdAt);
        const nextTaskDelay = Math.floor(Math.random() * 180 + 60);
        const scheduledFor = new Date(
          lastTask.getTime() + nextTaskDelay * 60 * 1000
        );

        const randomProduct =
          products[Math.floor(Math.random() * products.length)];
        const commissionPercent = randomProduct.profitMargin || (Math.floor(Math.random() * 10) + 1);
        const commission =
          (randomProduct.price * commissionPercent) / 100;

        createTask({
          userId: task.userId,
          productId: randomProduct.id,
          productName: randomProduct.name,
          productImage: randomProduct.image,
          productPrice: randomProduct.price,
          commission,
          commissionPercent,
          status: "pending",
          scheduledFor: scheduledFor.toISOString(),
        });

        updateUser(task.userId, {
          lastTaskTime: new Date().toISOString(),
        });
      }
    }
  }

  return NextResponse.json({ success: true, task });
}
