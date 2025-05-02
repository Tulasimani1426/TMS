import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isBefore, isToday, addDays, isAfter } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "No due date";
  
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isToday(dateObj)) {
    return "Today";
  }
  
  // Check if it's tomorrow
  const tomorrow = addDays(today, 1);
  if (isToday(addDays(dateObj, -1))) {
    return "Tomorrow";
  }
  
  // Check if it's yesterday
  const yesterday = addDays(today, -1);
  if (isToday(addDays(dateObj, 1))) {
    return "Yesterday";
  }
  
  // Check if overdue
  if (isBefore(dateObj, today)) {
    return `Overdue: ${format(dateObj, "MMM d, yyyy")}`;
  }
  
  // If within the next 7 days
  const nextWeek = addDays(today, 7);
  if (isBefore(dateObj, nextWeek)) {
    return format(dateObj, "EEEE"); // Day of week
  }
  
  // Default format for dates beyond a week
  return format(dateObj, "MMM d, yyyy");
}

export function getStatusClass(status: string): string {
  switch (status) {
    case "to-do":
      return "bg-gray-100 text-gray-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    case "completed":
      return "bg-green-100 text-green-800";
    case "blocked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getPriorityClass(priority: string): string {
  switch (priority) {
    case "high":
      return "border-l-4 border-red-500";
    case "medium":
      return "border-l-4 border-amber-500";
    case "low":
      return "border-l-4 border-green-500";
    default:
      return "";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "to-do":
      return "To Do";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "blocked":
      return "Blocked";
    default:
      return status;
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return priority;
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function estimatedTimeToString(hours: number | null | undefined): string {
  if (!hours) return "";
  
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }
  
  if (hours === 1) {
    return "1 hour";
  }
  
  return `${hours} hours`;
}
