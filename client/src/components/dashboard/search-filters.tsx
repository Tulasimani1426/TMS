import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks } from "@/hooks/use-tasks";

export function SearchFilters() {
  const { 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter, 
    priorityFilter, 
    setPriorityFilter, 
    dueDateFilter, 
    setDueDateFilter 
  } = useTasks();
  
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-6">
      <div className="sm:col-span-3">
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="sm:col-span-1">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Status</SelectItem>
            <SelectItem value="to-do">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-1">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-1">
        <Select value={dueDateFilter} onValueChange={setDueDateFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Due Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Due Date</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this-week">This week</SelectItem>
            <SelectItem value="next-week">Next week</SelectItem>
            <SelectItem value="this-month">This month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
