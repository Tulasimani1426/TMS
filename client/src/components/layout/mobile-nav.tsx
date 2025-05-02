import { useLocation } from "wouter";
import { LayoutDashboard, CheckSquare, Users, PlusCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface MobileNavProps {
  onCreateTask: () => void;
}

export function MobileNav({ onCreateTask }: MobileNavProps) {
  const [location] = useLocation();
  
  const navItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-6 h-6" />,
    },
    {
      href: "/tasks",
      label: "My Tasks",
      icon: <CheckSquare className="w-6 h-6" />,
    },
    {
      href: "#create",
      label: "Create",
      icon: <PlusCircle className="w-6 h-6" />,
      onClick: onCreateTask,
    },
    {
      href: "/team",
      label: "Team",
      icon: <Users className="w-6 h-6" />,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="w-6 h-6" />,
    },
  ];
  
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex justify-between z-10">
      {navItems.map((item) => (
        item.onClick ? (
          <button
            key={item.href}
            onClick={item.onClick}
            className="flex-1 inline-flex flex-col items-center justify-center py-3 px-2 text-sm font-medium text-gray-500 hover:text-primary"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ) : (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex-1 inline-flex flex-col items-center justify-center py-3 px-2 text-sm font-medium",
                location === item.href
                  ? "text-primary border-t-2 border-primary"
                  : "text-gray-500"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          </Link>
        )
      ))}
    </div>
  );
}
