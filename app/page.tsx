import { getTasks } from '@/app/actions/task-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function Page() {
  const tasks = await getTasks();

  return (
    <main className="flex min-h-svh justify-center p-6 bg-background">
      <div className="flex w-full max-w-2xl flex-col gap-6 text-sm">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Minhas Tarefas</h1>
            <p className="text-muted-foreground">Gerencie suas atividades diárias.</p>
          </div>
          {/* Botão que abrirá o modal/formulário de criação no client-side */}
          <Button>Nova Tarefa</Button>
        </div>

        {/* Lista de Tarefas */}
        <div className="flex flex-col gap-3">
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhuma tarefa encontrada. Crie sua primeira tarefa!
              </CardContent>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="transition-all hover:shadow-sm">
                <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                  <CardTitle className={`text-base font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </CardTitle>
                  <Badge variant={task.completed ? 'secondary' : 'default'}>
                    {task.completed ? 'Concluída' : 'Pendente'}
                  </Badge>
                </CardHeader>

                {task.description && (
                  <CardContent className="p-4 pt-0 text-muted-foreground text-xs">
                    {task.description}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

      </div>
    </main>
  );
}