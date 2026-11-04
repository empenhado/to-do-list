"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { taskSchema, TaskInput } from "@/lib/validations";

type Result = { success: true } | { success: false; error: string };

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autorizado");
  return userId;
}

export async function createTask(data: TaskInput): Promise<Result> {
  const userId = await requireUserId();

  // Validação com Zod
  const validation = taskSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { title, description } = validation.data;

  await prisma.task.create({
    data: {
      title,
      description: description || null,
      userId,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateTask(id: string, data: TaskInput): Promise<Result> {
  const userId = await requireUserId();

  // Validação com Zod
  const validation = taskSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  const { title, description } = validation.data;

  const result = await prisma.task.updateMany({
    where: { id, userId },
    data: {
      title,
      description: description || null,
    },
  });

  if (result.count === 0)
    return { success: false, error: "Tarefa não encontrada." };

  revalidatePath("/");
  return { success: true };
}

export async function toggleTask(
  id: string,
  completed: boolean,
): Promise<Result> {
  const userId = await requireUserId();
  const result = await prisma.task.updateMany({
    where: { id, userId },
    data: { completed },
  });

  if (result.count === 0)
    return { success: false, error: "Tarefa não encontrada." };

  revalidatePath("/");
  return { success: true };
}

export async function deleteTask(id: string): Promise<Result> {
  const userId = await requireUserId();
  const result = await prisma.task.deleteMany({ where: { id, userId } });

  if (result.count === 0)
    return { success: false, error: "Tarefa não encontrada." };

  revalidatePath("/");
  return { success: true };
}
