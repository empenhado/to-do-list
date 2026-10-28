import { z } from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório")
    .max(100, "O título não pode ter mais de 100 caracteres"),
  description: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
