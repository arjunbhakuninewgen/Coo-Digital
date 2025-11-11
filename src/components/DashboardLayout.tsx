
import React, { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Clock,
  User,
  Briefcase,
  BadgeIndianRupee
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon: Icon, label, href, active, onClick }: NavItemProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(href);
    if (onClick) onClick();
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md w-full transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="hidden md:inline">{label}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="md:hidden">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Get navigation items based on user role
  const getNavItems = () => {
    // For employee role, only show time tracking and profile
    if (user?.role === "employee") {
      return [
        { icon: Clock, label: "Time Tracking", href: "/time-tracking" },
        { icon: User, label: "My Profile", href: "/employee-profile" }
      ];
    }
    
    // For team lead role, show relevant menu items
    if (user?.role === "teamlead") {
      return [
        { icon: Clock, label: "Time Tracking", href: "/time-tracking" },
        { icon: User, label: "My Profile", href: "/employee-profile" }
        // Add any additional items specific to team leads if needed
      ];
    }
    
    // For admin and manager roles, show all items
    const items = [
      { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
      { icon: Briefcase, label: "Projects", href: "/projects" },
      { icon: BadgeIndianRupee, label: "Finance", href: "/finance" },
      { icon: Users, label: "Clients", href: "/clients" },
    ];
    
    // Only add these items for admin and management roles
    if (user?.role === "admin" || user?.role === "manager") {
      items.push(
        { icon: User, label: "Employees", href: "/employees" },
        { icon: BarChart3, label: "Reports", href: "/reports" }
      );
    }
    
    if (user?.role === "admin") {
      items.push({ icon: Settings, label: "Settings", href: "/settings" });
    }
    
    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-sidebar flex items-center justify-between p-4 text-sidebar-foreground">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="mr-2">
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-bold">Agency Command Centre</h1>
        </div>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground flex-shrink-0 fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold">
              <span className="hidden md:inline">Agency Command Centre</span>
              <span className="md:hidden">ACC</span>
            </h1>
            <button onClick={toggleSidebar} className="md:hidden">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <Separator className="bg-sidebar-border" />

          {/* User Info */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-sidebar-foreground/70 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-sidebar-border" />

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={currentPath.startsWith(item.href)}
                  onClick={() => {
                    setCurrentPath(item.href);
                    if (window.innerWidth < 768) setSidebarOpen(false);
                  }}
                />
              ))}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between border-b bg-card p-4">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="mr-4">
              <Menu className="h-5 w-5" />
            </button>
            {title && <h1 className="text-xl font-bold">{title}</h1>}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.name}</span>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="animate-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
