import { cn } from "@/lib/utils";
import { useTasks } from "@/hooks/use-tasks";

export function DashboardTabs() {
  const { currentView, setCurrentView, overdueTasks } = useTasks();
  
  const tabs = [
    {
      id: "assigned",
      label: "Assigned to me",
    },
    {
      id: "created",
      label: "Created by me",
    },
    {
      id: "overdue",
      label: "Overdue",
      count: overdueTasks,
    },
  ];
  
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id as any)}
            className={cn(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm",
              currentView === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.label}
            {tab.count ? (
              <span className="ml-2 py-0.5 px-2.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                {tab.count}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </div>
  );
}
