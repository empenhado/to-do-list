"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { Task } from "@prisma/client";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  createTask,
  deleteTask,
  toggleTask,
  updateTask,
} from "@/app/actions/task-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Container } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { taskSchema, type TaskFormData } from "@/lib/validations";

export function TaskDashboard({ tasks }: { tasks: Task[] }) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  function handleCreate(data: TaskFormData) {
    startTransition(async () => {
      const res = await createTask(data);

      if (res.success) {
        toast.success("Tarefa criada!");
        form.reset();
        return;
      }

      form.setError("root", { message: res.error });
      toast.error(res.error);
    });
  }

  return (
    <Container className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Minhas tarefas</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleCreate)}
          className="space-y-4 rounded-lg border p-4 shadow-sm"
        >
          {form.formState.errors.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título da tarefa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descrição (opcional)"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? "Salvando..." : "Adicionar tarefa"}
          </Button>
        </form>
      </Form>

      {tasks.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Você ainda não tem tarefas. Crie a primeira acima.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </Container>
  );
}

function TaskItem({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  function handleToggle(checked: boolean) {
    startTransition(async () => {
      const res = await toggleTask(task.id, checked);

      if (res.success) {
        toast.success(checked ? "Tarefa concluída!" : "Tarefa reaberta!");
        return;
      }

      toast.error(res.error);
    });
  }

  function handleDelete() {
    if (!confirm("Excluir esta tarefa?")) return;

    startTransition(async () => {
      const res = await deleteTask(task.id);

      if (res.success) {
        toast.success("Tarefa excluída!");
        return;
      }

      toast.error(res.error);
    });
  }

  return (
    <li>
      <Card className={`h-full py-0 ${isPending ? "opacity-60" : ""}`}>
        <CardContent className="flex items-start gap-3 p-4">
          <Checkbox
            className="mt-1 border-primary"
            checked={task.completed}
            disabled={isPending}
            onCheckedChange={(value) => handleToggle(value === true)}
          />

          <div className="min-w-0 flex-1">
            <p
              className={
                task.completed
                  ? "break-words font-medium text-muted-foreground line-through"
                  : "break-words font-medium"
              }
            >
              {task.title}
            </p>

            {task.description && (
              <p className="mt-1 break-words text-sm text-muted-foreground">
                {task.description}
              </p>
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              Criada em {new Date(task.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              aria-label="Editar"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
              aria-label="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditTaskDialog task={task} open={editOpen} onOpenChange={setEditOpen} />
    </li>
  );
}

function EditTaskDialog({
  task,
  open,
  onOpenChange,
}: {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    values: {
      title: task.title,
      description: task.description ?? "",
    },
  });

  function handleSave(data: TaskFormData) {
    startTransition(async () => {
      const res = await updateTask(task.id, data);

      if (res.success) {
        toast.success("Tarefa atualizada!");
        onOpenChange(false);
        return;
      }

      form.setError("root", { message: res.error });
      toast.error(res.error);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            {form.formState.errors.root && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
