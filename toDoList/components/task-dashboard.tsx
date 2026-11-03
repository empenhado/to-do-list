"use client";

import { useState, useTransition } from "react";
import type { Task } from "@prisma/client";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Container } from "@/components/ui/container";
import { createTask, updateTask, toggleTask, deleteTask } from "@/app/actions/task-actions";

export function TaskDashboard({ tasks }: { tasks: Task[] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createTask({ title, description });
      if (res.success) {
        toast.success("Tarefa criada!");
        setTitle("");
        setDescription("");
      } else {
        setError(res.error);
        toast.error(res.error);
      }
    });
  }

  return (
    <Container>
      <h1 className="text-3xl font-bold text-center">Minhas tarefas</h1>

      <form onSubmit={handleCreate} className="space-y-3 rounded-lg border p-4">
        <Input
          placeholder="Título da tarefa"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
        />
        <Textarea
          placeholder="Descrição (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? "Salvando..." : "Adicionar tarefa"}
        </Button>
      </form>

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
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description ?? "");
  const [editError, setEditError] = useState<string | null>(null);

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

  function handleSave() {
    setEditError(null);
    startTransition(async () => {
      const res = await updateTask(task.id, {
        title: editTitle,
        description: editDescription,
      });
      if (res.success) {
        toast.success("Tarefa atualizada!");
        setEditOpen(false);
      } else {
        setEditError(res.error);
      }
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
          <div className="space-y-3">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              maxLength={100}
            />
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              maxLength={500}
            />
            {editError && <p className="text-sm text-red-600">{editError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  );
}