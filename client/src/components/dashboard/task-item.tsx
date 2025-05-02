import { useState } from "react";
import { Task } from "@shared/schema";
import { useTasks } from "@/hooks/use-tasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Clock, Calendar } from "lucide-react";
import { cn, formatDate, getStatusClass, getPriorityClass, estimatedTimeToString, getStatusLabel } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { TaskDialog } from "./task-dialog";
import { useToast } from "@/hooks/use-toast";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { updateTask } = useTasks();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get user data for the assigned user
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ["/api/users"],
  });
  
  const assignedUser = users.find(user => user.id === task.assignedToId);
  
  const handleCheckboxChange = async (checked: boolean) => {
    try {
      // Update task status to completed or to-do based on checkbox
      await updateTask(task.id, { 
        status: checked ? "completed" : "to-do" 
      });
      
      // Show notification
      toast({
        title: checked ? "Task completed" : "Task reopened",
        description: checked ? "Task marked as completed" : "Task marked as to-do"
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };
  
  return (
    <>
      <li className={cn("animate-fadeIn", getPriorityClass(task.priority))} data-task-id={task.id}>
        <div 
          className="px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer"
          onClick={() => setIsDialogOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox 
                id={`task-${task.id}`}
                checked={task.status === "completed"}
                onCheckedChange={handleCheckboxChange}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label 
                htmlFor={`task-${task.id}`} 
                className={cn(
                  "ml-3 text-sm font-medium truncate",
                  task.status === "completed" ? "text-gray-500 line-through" : "text-gray-900"
                )}
              >
                {task.title}
              </label>
            </div>
            <div className="ml-2 flex-shrink-0 flex">
              <Badge 
                variant="outline"
                className={cn(
                  "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                  getStatusClass(task.status)
                )}
              >
                {getStatusLabel(task.status)}
              </Badge>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm text-gray-500">
                <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                Due: {formatDate(task.dueDate)}
              </p>
              {task.estimatedHours && (
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                  <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {estimatedTimeToString(task.estimatedHours)}
                </p>
              )}
            </div>
            {assignedUser && (
              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                <AvatarWithFallback
                  src={assignedUser.avatar} 
                  alt={assignedUser.name} 
                  className="h-8 w-8"
                />
                <span className="ml-2">{assignedUser.name}</span>
              </div>
            )}
          </div>
        </div>
      </li>
      
      <TaskDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        taskId={task.id}
        mode="edit"
      />
    </>
  );
}
