import * as z from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "O título é obrigatório")
    .max(20, "O título deve ter no máximo 100 caracteres."),
  description: z.string().optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;
