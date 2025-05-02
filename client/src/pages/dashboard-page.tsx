import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs";
import { SearchFilters } from "@/components/dashboard/search-filters";
import { TaskList } from "@/components/dashboard/task-list";
import { TaskDialog } from "@/components/dashboard/task-dialog";
import { TasksProvider } from "@/hooks/use-tasks";
import { FileSpreadsheet } from "lucide-react";

export default function DashboardPage() {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  
  return (
    <TasksProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar - Hidden on mobile */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          {/* Mobile header */}
          <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white border-b border-gray-200">
            <button type="button" className="h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Dashboard content */}
          <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none pb-16 md:pb-0">
            {/* Page header */}
            <div className="bg-white shadow">
              <div className="px-4 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8">
                <div className="py-6 md:flex md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Dashboard</h2>
                  </div>
                  <div className="mt-4 flex md:mt-0 md:ml-4">
                    <Button variant="outline" className="hidden sm:inline-flex">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      onClick={() => setIsTaskDialogOpen(true)}
                      className="ml-3"
                    >
                      Create Task
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Dashboard tabs and content */}
            <div className="mt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              {/* Tabs */}
              <DashboardTabs />
              
              {/* Search and Filters */}
              <SearchFilters />
              
              {/* Task List */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Tasks</h3>
                </div>
                <TaskList />
              </div>
            </div>
          </main>
          
          {/* Mobile bottom nav */}
          <MobileNav onCreateTask={() => setIsTaskDialogOpen(true)} />
          
          {/* Task creation dialog */}
          <TaskDialog
            isOpen={isTaskDialogOpen}
            onClose={() => setIsTaskDialogOpen(false)}
            mode="create"
          />
        </div>
      </div>
    </TasksProvider>
  );
}
