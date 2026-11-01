"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/ui/container";

type DemoTask = { id: string; title: string; completed: boolean };

const initial: DemoTask[] = [
  { id: "1", title: "Estudar Next.js", completed: false },
  { id: "2", title: "Entregar o trabalho de WEB", completed: false },
  { id: "3", title: "Configurar o Prisma", completed: false },
];

export function DemoList() {
  const [tasks, setTasks] = useState<DemoTask[]>(initial);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();

    if (!value) {
      setError("Digite um título para a tarefa.");
      return;
    }

    setTasks([{ id: crypto.randomUUID(), title: value, completed: false }, ...tasks]);
    setTitle("");
    setError(null);
  }

  return (
    <Container>
      <div className="rounded-md border bg-muted p-4">
        Entre ou crie uma conta para gerenciar suas próprias tarefas.
      </div>

      <hr />

      <section className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Demonstração de Tarefas</h1>
      </section>

      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Nova tarefa..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            maxLength={100}
          />
          <Button type="submit">
            <Plus className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>

      <ul className="grid gap-3 md:grid-cols-2">
        {tasks.map((t) => (
          <li key={t.id}>
            <Card className="h-full py-0">
              <CardContent className="flex items-center gap-3 p-4">
                <Checkbox
                  checked={t.completed}
                  onCheckedChange={(v) =>
                    setTasks(tasks.map((x) => (x.id === t.id ? { ...x, completed: v === true } : x)))
                  }
                />
                <span
                  className={
                    t.completed
                      ? "flex-1 break-words text-muted-foreground line-through"
                      : "flex-1 break-words"
                  }
                >
                  {t.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Excluir
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </Container>
  );
}