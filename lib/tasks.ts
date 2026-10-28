import { prisma } from '@/lib/prisma';
import { TaskFormData } from '@/lib/validations';

export async function fetchTasksByUserId(userId: string) {
  return await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function insertTask(userId: string, data: TaskFormData) {
  return await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      userId,
    },
  });
}

export async function updateTaskById(id: string, userId: string, data: TaskFormData) {
  return await prisma.task.updateMany({
    where: { id, userId },
    data: {
      title: data.title,
      description: data.description,
    },
  });
}

export async function updateTaskStatusById(id: string, userId: string, completed: boolean) {
  return await prisma.task.updateMany({
    where: { id, userId },
    data: { completed },
  });
}

export async function deleteTaskById(id: string, userId: string) {
  return await prisma.task.deleteMany({
    where: { id, userId },
  });
}