import { useTasks } from "@/hooks/use-tasks";
import { Loader2 } from "lucide-react";
import { TaskItem } from "./task-item";

export function TaskList() {
  const { filteredTasks, isLoading, currentView } = useTasks();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md py-8">
        <div className="text-center">
          <p className="text-gray-500">
            {currentView === "assigned" && "No tasks assigned to you"}
            {currentView === "created" && "You haven't created any tasks yet"}
            {currentView === "overdue" && "No overdue tasks"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {filteredTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}
      </ul>
    </div>
  );
}
