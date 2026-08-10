import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth, useAuthReady, signOut, dashboardPathFor } from "@/lib/auth";
import type { Role } from "@/api/types";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationsBell } from "./NotificationsBell";
import { ThemeToggle } from "./ThemeToggle";
import { PageTransition } from "./PageTransition";
import { PwaInstallPrompt } from "./PwaInstallPrompt";
import { motion } from "framer-motion";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

interface Props {
  nav: NavItem[];
  roleLabel: string;
  allowedRole?: Role;
}

export const AppShell = ({ nav, roleLabel, allowedRole }: Props) => {
  const user = useAuth();
  const ready = useAuthReady();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (allowedRole && user.role !== allowedRole) {
      navigate(dashboardPathFor(user.role), { replace: true });
    }
  }, [user, ready, allowedRole, navigate]);

  if (!ready || !user || (allowedRole && user.role !== allowedRole)) {
    return (
      <div className="min-h-screen grid place-items-center bg-surface">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-background flex flex-col md:flex-row">
      {/* Desktop Sidebar (md:flex) */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-card shadow-sm">
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <Logo />
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{roleLabel}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="active-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r bg-teal-600 dark:bg-teal-400"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <n.icon className={cn("h-4 w-4 transition-transform group-hover:scale-105", isActive ? "text-teal-600 dark:text-teal-400" : "text-muted-foreground")} />
                  {n.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 m-3 bg-surface-2 dark:bg-surface rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-teal text-white grid place-items-center font-bold text-sm shadow-sm">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold truncate text-foreground">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <button
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-card"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar (md:hidden) with Notch Safe Padding */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-card/90 backdrop-blur shadow-sm pt-safe">
        <div className="flex items-center justify-between px-4 py-3 gap-2">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationsBell />
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl p-2"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 md:pt-0 pt-16 pb-24 md:pb-8">
        {/* Desktop Top Bar */}
        <div className="hidden md:flex items-center justify-end gap-3 px-8 py-4 sticky top-0 z-30 bg-surface/80 dark:bg-background/80 backdrop-blur">
          <ThemeToggle />
          <NotificationsBell />
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-8">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>

      {/* Native Mobile PWA Bottom Navigation Bar (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-md shadow-elevated border-t border-border/40 pb-safe">
        <div className="flex items-center justify-around px-2 py-2">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 min-w-[56px]",
                  isActive
                    ? "text-teal-600 dark:text-teal-400 font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn("p-1 rounded-xl transition-colors", isActive ? "bg-teal-500/10" : "")}>
                    <n.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[70px]">{n.label.split(" ")[0]}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* PWA Home Screen Install Banner */}
      <PwaInstallPrompt />
    </div>
  );
};
