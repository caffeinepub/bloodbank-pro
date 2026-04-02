import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Droplets,
  GitPullRequest,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useState } from "react";
import { useDashboard } from "../hooks/useQueries";
import { clearAuth, getStoredRole } from "../utils/auth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/donors", label: "Donors", icon: Users },
  { to: "/collections", label: "Collections", icon: Droplets },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/patients", label: "Patients", icon: UserCheck },
  { to: "/requests", label: "Blood Requests", icon: GitPullRequest },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

interface Props {
  children: ReactNode;
  pageTitle?: string;
}

export function AppLayout({ children, pageTitle }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: summary } = useDashboard();

  const role = getStoredRole();
  const displayName = role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const pendingCount = summary ? Number(summary.pendingRequests) : 0;

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary/90 flex items-center justify-center shrink-0">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground leading-tight">
            Blood Bank
          </p>
          <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">
            Management System
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active =
            location.pathname === to ||
            (to !== "/" && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? "nav-item-active"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
              data-ocid={`nav.${label.toLowerCase().replace(/ /g, "_")}.link`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  active
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80"
                }`}
              />
              <span className="flex-1">{label}</span>
              {label === "Blood Requests" && pendingCount > 0 && (
                <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-4 min-w-4">
                  {pendingCount}
                </Badge>
              )}
              {active && (
                <ChevronRight className="w-3 h-3 text-sidebar-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border mx-3" />

      <div className="px-3 py-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent/50">
          <Avatar className="w-8 h-8 shrink-0">
            <AvatarFallback className="bg-primary/20 text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">
              {displayName}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 capitalize">
              {role ?? "staff"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 shrink-0"
            onClick={handleLogout}
            data-ocid="nav.logout.button"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden lg:flex lg:flex-col w-60 bg-sidebar border-r border-sidebar-border shrink-0">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-60 bg-sidebar border-r border-sidebar-border lg:hidden"
            >
              <div className="flex items-center justify-end px-3 pt-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 text-sidebar-foreground/50"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-14 px-4 lg:px-6 bg-card border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden w-8 h-8"
              onClick={() => setSidebarOpen(true)}
              data-ocid="nav.menu.button"
            >
              <Menu className="w-4 h-4" />
            </Button>
            {pageTitle && (
              <h2 className="text-sm font-semibold text-foreground hidden sm:block">
                {pageTitle}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 relative"
              data-ocid="nav.notifications.button"
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              )}
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-muted-foreground hover:text-destructive"
              onClick={handleLogout}
              title="Logout"
              data-ocid="nav.header_logout.button"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}
