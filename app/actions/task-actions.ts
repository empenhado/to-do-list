"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type Result = { success: true } | { success: false; error: string };

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autorizado");
  return userId;
}

function validate(title: string, description?: string): string | null {
  if (!title.trim()) return "O título é obrigatório.";
  if (title.trim().length > 100) return "O título deve ter no máximo 100 caracteres.";
  if (description && description.length > 500)
    return "A descrição deve ter no máximo 500 caracteres.";
  return null;
}

export async function createTask(data: {
  title: string;
  description?: string;
}): Promise<Result> {
  const userId = await requireUserId();
  const error = validate(data.title, data.description);
  if (error) return { success: false, error };

  await prisma.task.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      userId, 
    },
  });
  revalidatePath("/");
  return { success: true };
}

export async function updateTask(
  id: string,
  data: { title: string; description?: string }
): Promise<Result> {
  const userId = await requireUserId();
  const error = validate(data.title, data.description);
  if (error) return { success: false, error };

  const result = await prisma.task.updateMany({
    where: { id, userId }, 
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
    },
  });
  if (result.count === 0) return { success: false, error: "Tarefa não encontrada." };
  revalidatePath("/");
  return { success: true };
}

export async function toggleTask(id: string, completed: boolean): Promise<Result> {
  const userId = await requireUserId();
  const result = await prisma.task.updateMany({
    where: { id, userId },
    data: { completed },
  });
  if (result.count === 0) return { success: false, error: "Tarefa não encontrada." };
  revalidatePath("/");
  return { success: true };
}

export async function deleteTask(id: string): Promise<Result> {
  const userId = await requireUserId();
  const result = await prisma.task.deleteMany({ where: { id, userId } });
  if (result.count === 0) return { success: false, error: "Tarefa não encontrada." };
  revalidatePath("/");
  return { success: true };
}