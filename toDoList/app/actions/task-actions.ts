"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  taskSchema,
  taskIdSchema,
  toggleTaskSchema,
  TaskFormData,
} from "@/lib/validations";

type Result = { success: true } | { success: false; error: string };

async function requireUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autorizado");
  return userId;
}

// 1. CREATE
export async function createTask(data: TaskFormData): Promise<Result> {
  try {
    const userId = await requireUserId();

    const parsed = taskSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        userId,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao criar tarefa.",
    };
  }
}

// 2. UPDATE
export async function updateTask(
  id: string,
  data: TaskFormData,
): Promise<Result> {
  try {
    const userId = await requireUserId();

    const idParsed = taskIdSchema.safeParse(id);
    const dataParsed = taskSchema.safeParse(data);

    if (!idParsed.success) {
      return { success: false, error: idParsed.error.issues[0].message };
    }
    if (!dataParsed.success) {
      return { success: false, error: dataParsed.error.issues[0].message };
    }

    const result = await prisma.task.updateMany({
      where: { id: idParsed.data, userId },
      data: {
        title: dataParsed.data.title,
        description: dataParsed.data.description,
      },
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Tarefa não encontrada ou sem permissão.",
      };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro ao atualizar tarefa.",
    };
  }
}

// 3. TOGGLE
export async function toggleTask(
  id: string,
  completed: boolean,
): Promise<Result> {
  try {
    const userId = await requireUserId();

    const parsed = toggleTaskSchema.safeParse({ id, completed });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const result = await prisma.task.updateMany({
      where: { id: parsed.data.id, userId },
      data: { completed: parsed.data.completed },
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Tarefa não encontrada ou sem permissão.",
      };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao alterar status.",
    };
  }
}

// 4. DELETE
export async function deleteTask(id: string): Promise<Result> {
  try {
    const userId = await requireUserId();

    const parsed = taskIdSchema.safeParse(id);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const result = await prisma.task.deleteMany({
      where: { id: parsed.data, userId },
    });

    if (result.count === 0) {
      return {
        success: false,
        error: "Tarefa não encontrada ou sem permissão.",
      };
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro ao excluir tarefa.",
    };
  }
}
