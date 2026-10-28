'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { taskSchema, TaskFormData } from '@/lib/validations';
import {
  fetchTasksByUserId,
  insertTask,
  updateTaskById,
  updateTaskStatusById,
  deleteTaskById,
} from '@/lib/tasks';

/**
 * Chamada diretamente no Server Component (app/page.tsx)
 */
export async function getTasks() {
  const { userId } = await auth();
  if (!userId) return [];

  return await fetchTasksByUserId(userId);
}

export async function createTask(data: TaskFormData) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Usuário não autenticado.' };

  const validation = taskSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Dados inválidos.',
    };
  }

  try {
    const task = await insertTask(userId, validation.data);
    revalidatePath('/');
    return { success: true, data: task };
  } catch (error) {
    return { success: false, error: 'Erro ao criar a tarefa.' };
  }
}

export async function updateTask(id: string, data: TaskFormData) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Usuário não autenticado.' };

  const validation = taskSchema.safeParse(data);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || 'Dados inválidos.',
    };
  }

  try {
    const result = await updateTaskById(id, userId, validation.data);
    if (result.count === 0) {
      return { success: false, error: 'Tarefa não encontrada ou não autorizada.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao atualizar a tarefa.' };
  }
}

export async function toggleTaskStatus(id: string, completed: boolean) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Usuário não autenticado.' };

  try {
    const result = await updateTaskStatusById(id, userId, completed);
    if (result.count === 0) {
      return { success: false, error: 'Tarefa não encontrada ou não autorizada.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao alterar status da tarefa.' };
  }
}

export async function deleteTask(id: string) {
  const { userId } = await auth();
  if (!userId) return { success: false, error: 'Usuário não autenticado.' };

  try {
    const result = await deleteTaskById(id, userId);
    if (result.count === 0) {
      return { success: false, error: 'Tarefa não encontrada ou não autorizada.' };
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erro ao excluir a tarefa.' };
  }
}