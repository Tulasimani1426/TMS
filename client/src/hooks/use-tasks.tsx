import { createContext, ReactNode, useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, InsertTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type TaskView = "assigned" | "created" | "overdue";

type TasksContextType = {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  createTask: (task: Omit<InsertTask, "createdById">) => Promise<Task>;
  updateTask: (id: number, task: Partial<InsertTask>) => Promise<Task>;
  deleteTask: (id: number) => Promise<void>;
  currentView: TaskView;
  setCurrentView: (view: TaskView) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  dueDateFilter: string;
  setDueDateFilter: (dueDate: string) => void;
  filteredTasks: Task[];
  overdueTasks: number;
};

export const TasksContext = createContext<TasksContextType | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for filters and current view
  const [currentView, setCurrentView] = useState<TaskView>("assigned");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");

  // Query key based on current view
  const getQueryKey = () => {
    switch (currentView) {
      case "assigned":
        return "/api/tasks/assigned";
      case "created":
        return "/api/tasks/created";
      case "overdue":
        return "/api/tasks/overdue";
      default:
        return "/api/tasks/assigned";
    }
  };

  // Fetch tasks based on current view
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery<Task[], Error>({
    queryKey: [getQueryKey()],
    staleTime: 10000, // 10 seconds
  });
  
  // Fetch overdue tasks count
  const { data: overdueTasks = [] } = useQuery<Task[], Error>({
    queryKey: ["/api/tasks/overdue"],
    staleTime: 10000, // 10 seconds
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: Omit<InsertTask, "createdById">) => {
      const res = await apiRequest("POST", "/api/tasks", task);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/assigned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/created"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
      toast({
        title: "Task created",
        description: "Your task has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, task }: { id: number; task: Partial<InsertTask> }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, task);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/assigned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/created"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/assigned"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/created"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/overdue"] });
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter tasks based on search term and filters
  const filteredTasks = tasks.filter((task) => {
    // Search by title or description
    const matchesSearch =
      searchTerm === "" ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by status
    const matchesStatus = statusFilter === "" || task.status === statusFilter;

    // Filter by priority
    const matchesPriority = priorityFilter === "" || task.priority === priorityFilter;

    // Filter by due date
    let matchesDueDate = dueDateFilter === "";
    
    if (dueDateFilter && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      
      switch (dueDateFilter) {
        case "today":
          matchesDueDate = taskDate >= today && taskDate < tomorrow;
          break;
        case "this-week":
          matchesDueDate = taskDate >= today && taskDate < nextWeek;
          break;
        case "next-week":
          matchesDueDate = taskDate >= nextWeek && taskDate < nextMonth;
          break;
        case "this-month":
          matchesDueDate = taskDate >= today && taskDate < nextMonth;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesDueDate;
  });

  // Helper functions wrapped around mutations
  const createTask = async (task: Omit<InsertTask, "createdById">) => {
    return await createTaskMutation.mutateAsync(task);
  };

  const updateTask = async (id: number, task: Partial<InsertTask>) => {
    return await updateTaskMutation.mutateAsync({ id, task });
  };

  const deleteTask = async (id: number) => {
    await deleteTaskMutation.mutateAsync(id);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        isLoading,
        error,
        createTask,
        updateTask,
        deleteTask,
        currentView,
        setCurrentView,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        dueDateFilter,
        setDueDateFilter,
        filteredTasks,
        overdueTasks: overdueTasks.length,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
