import { auth } from "@clerk/nextjs/server";
import { getTasks } from "@/lib/tasks";
import { DemoList } from "@/components/demo-list";
import { TaskDashboard } from "@/components/task-dashboard";

export default async function Home() {
  const { userId } = await auth();

  if (!userId) return <DemoList />; 

  const tasks = await getTasks(userId); 
  return <TaskDashboard tasks={tasks} />;
}