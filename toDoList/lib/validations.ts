import { z } from "zod";

// Esquema para criação e edição do conteúdo da tarefa
export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "O título é obrigatório.")
    .max(100, "O título deve ter no máximo 100 caracteres."),
  description: z
    .string()
    .trim()
    .max(500, "A descrição deve ter no máximo 500 caracteres.")
    .optional()
    .transform((val) => val || null),
});

// Esquema para validação de ID em formato string
export const taskIdSchema = z.string().trim().min(1, "ID inválido.");

// Esquema para alteração de status (Toggle)
export const toggleTaskSchema = z.object({
  id: taskIdSchema,
  completed: z.boolean({ required_error: "Status é obrigatório." }),
});

export type TaskFormData = z.infer<typeof taskSchema>;
