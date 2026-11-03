"use client";

import { useState, useTransition } from "react";
import type { Task } from "@prisma/client";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Container } from "@/components/ui/container";
import { TaskForm } from "@/components/task-form";
import { createTask, updateTask, toggleTask, deleteTask } from "@/app/actions/task-actions";

export function TaskDashboard({ tasks }: { tasks: Task[] }) {
  return (
    <Container>
      <h1 className="text-center text-3xl font-bold">Minhas tarefas</h1>

      <Card>
        <CardHeader>
          <CardTitle>Nova tarefa</CardTitle>
          <CardDescription>Adicione uma tarefa à sua lista.</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm
            submitLabel="Adicionar tarefa"
            successMessage="Tarefa criada!"
            onSubmit={createTask}
            resetOnSuccess
          />
        </CardContent>
      </Card>

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
      if (res.success) toast.success(checked ? "Tarefa concluída!" : "Tarefa reaberta!");
      else toast.error(res.error);
    });
  }

  function handleDelete() {
    if (!confirm("Excluir esta tarefa?")) return;
    startTransition(async () => {
      const res = await deleteTask(task.id);
      if (res.success) toast.success("Tarefa excluída!");
      else toast.error(res.error);
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
            onCheckedChange={(v) => handleToggle(v === true)}
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

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar tarefa</DialogTitle>
          </DialogHeader>
          <TaskForm
            defaultValues={{ title: task.title, description: task.description ?? "" }}
            submitLabel="Salvar"
            successMessage="Tarefa atualizada!"
            onSubmit={(data) => updateTask(task.id, data)}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </li>
  );
}