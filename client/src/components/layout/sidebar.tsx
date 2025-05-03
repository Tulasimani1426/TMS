import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, CheckSquare, Users, Calendar, Settings } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const links = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="mr-3 h-6 w-6" />,
    },
    {
      href: "/my-tasks",
      label: "My Tasks",
      icon: <CheckSquare className="mr-3 h-6 w-6" />,
    },
    {
      href: "/team-page",
      label: "Team",
      icon: <Users className="mr-3 h-6 w-6" />,
    },
    {
      href: "/calendar",
      label: "Calendar",
      icon: <Calendar className="mr-3 h-6 w-6" />,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="mr-3 h-6 w-6" />,
    },
  ];
  
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <svg className="w-8 h-8 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
            </svg>
            <h1 className="text-xl font-semibold text-gray-800">TaskFlow</h1>
          </div>
          <div className="mt-6 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1 bg-white">
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                      location === link.href
                        ? "bg-gray-100 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                </Link>
              ))}
            </nav>
          </div>
          
          {/* User profile */}
          <div className="flex items-center p-4 border-t border-gray-200">
            <AvatarWithFallback 
              src={user?.avatar} 
              alt={user?.name || "User"} 
              className="h-8 w-8" 
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500">{user?.role || "Team Member"}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto" 
              onClick={handleLogout}
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5 text-gray-400 hover:text-gray-500" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
