import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth, clearAdminAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import {
  Square3Stack3DIcon,
  UsersIcon,
  MegaphoneIcon,
  BanknotesIcon,
  DocumentMagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { toast } from "sonner";

// Sidebar toggle icon matching Image 2 (panel rectangle with vertical partition)
const SidebarToggleIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="3" />
    <path d="M15 3v18" />
  </svg>
);

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Overview", path: "/", icon: Square3Stack3DIcon },
  { label: "Users", path: "/users", icon: UsersIcon },
  { label: "Campaigns", path: "/campaigns", icon: MegaphoneIcon },
  { label: "Payments", path: "/payments", icon: BanknotesIcon },
  { label: "Audit Log", path: "/audit", icon: DocumentMagnifyingGlassIcon },
];

export const AdminShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Collapsible sidebar state with local storage persistence
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    return localStorage.getItem("yard_admin_sidebar_collapsed") === "true";
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("yard_admin_sidebar_collapsed", String(next));
      return next;
    });
  };

  const [isDark, setIsDark] = React.useState(() => {
    return (
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("yard_theme") === "dark"
    );
  });

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("yard_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("yard_theme", "light");
    }
  };

  const handleLogout = () => {
    clearAdminAuth();
    toast.success("Signed out");
    navigate("/login");
  };

  return (
    <div className="h-screen w-full bg-surface dark:bg-background text-foreground flex overflow-hidden antialiased">
      {/* ── Fixed Desktop Sidebar Navigation (Slim & Compact) ── */}
      <aside
        className={cn(
          "h-screen sticky top-0 border-r border-border/40 dark:border-border/30 bg-surface/95 dark:bg-background/95 backdrop-blur-md shrink-0 hidden md:flex flex-col justify-between select-none z-30 transition-all duration-200",
          isCollapsed ? "w-16" : "w-56"
        )}
      >
        <div className={cn("space-y-4", isCollapsed ? "p-2.5" : "p-3.5")}>
          {/* Brand Logo & Sidebar Toggle Icon */}
          <div className="flex items-center justify-between gap-1.5 min-h-8">
            {isCollapsed ? (
              <div className="w-full flex flex-col items-center gap-2.5">
                <Link to="/" className="flex items-center justify-center">
                  <Logo size="xs" showWordmark={false} />
                </Link>
                <button
                  onClick={toggleCollapse}
                  aria-label="Toggle sidebar"
                  title="Toggle sidebar"
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <SidebarToggleIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/" className="flex items-center">
                  <Logo size="xs" showWordmark={true} />
                </Link>

                <button
                  onClick={toggleCollapse}
                  aria-label="Toggle sidebar"
                  title="Toggle sidebar"
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-2 transition-colors shrink-0 cursor-pointer"
                >
                  <SidebarToggleIcon className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={cn(
                    "relative flex items-center rounded-md text-xs transition-all duration-150 group select-none",
                    isCollapsed
                      ? "justify-center p-2"
                      : "gap-2.5 px-3 py-2 font-medium",
                    active
                      ? "bg-teal-500/10 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-2/60"
                  )}
                >
                  {/* Toned teal vertical accent bar */}
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-teal-600 dark:bg-teal-400 rounded-r-full" />
                  )}

                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      active
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />

                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Footer Card: Compact Colored Gradient Style ── */}
        <div className={cn(isCollapsed ? "p-2" : "p-2.5")}>
          {isCollapsed ? (
            /* Compact Collapsed Card */
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 text-white p-2 flex flex-col items-center gap-2 shadow-sm border border-teal-600/30">
              <div
                className="h-7 w-7 rounded-md bg-white text-teal-800 flex items-center justify-center font-extrabold text-[11px] shadow-2xs cursor-default shrink-0"
                title={user?.email || "Admin"}
              >
                {(user?.email || "A").charAt(0).toUpperCase()}
              </div>

              <button
                onClick={toggleTheme}
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-teal-100 hover:text-white transition-colors cursor-pointer"
                title="Toggle theme"
              >
                {isDark ? <SunIcon className="h-3.5 w-3.5" /> : <MoonIcon className="h-3.5 w-3.5" />}
              </button>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold transition-all shadow-2xs cursor-pointer"
                title="Sign out"
              >
                <ArrowRightOnRectangleIcon className="h-3.5 w-3.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            /* Compact Expanded Card */
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-teal-700 via-teal-800 to-teal-950 text-white p-3 space-y-2.5 shadow-sm border border-teal-600/30">
              {/* Subtle decorative dot-matrix texture in top right corner */}
              <div
                className="absolute top-0 right-0 w-16 h-16 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                  backgroundSize: "6px 6px",
                }}
              />

              {/* Profile top row: compact white avatar tile & theme toggle */}
              <div className="flex items-center justify-between gap-2 relative z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-md bg-white text-teal-800 flex items-center justify-center font-extrabold text-[11px] shadow-2xs shrink-0">
                    {(user?.email || "A").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <div className="text-xs font-bold truncate text-white">
                      {user?.email ? user.email.split("@")[0] : "Admin"}
                    </div>
                    <div className="text-[9px] text-teal-100/75 truncate">
                      Platform Admin
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleTheme}
                  className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-teal-100 hover:text-white transition-colors shrink-0 cursor-pointer"
                  title="Toggle theme"
                >
                  {isDark ? <SunIcon className="h-3.5 w-3.5" /> : <MoonIcon className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Compact Teal Pill Action Button */}
              <button
                onClick={handleLogout}
                className="relative z-10 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold text-xs transition-all shadow-2xs cursor-pointer"
              >
                <ArrowRightOnRectangleIcon className="h-3 w-3 stroke-[2.5]" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Scrollable Workspace Viewport ── */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <header className="md:hidden border-b border-border/40 dark:border-border/30 px-4 py-3 bg-surface/95 dark:bg-background/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <Logo size="xs" showWordmark={false} />
            <span className="font-bold text-sm font-display">Yard Admin</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-surface-2 text-muted-foreground"
            >
              {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-muted-foreground hover:bg-surface-2"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ── Workspace Well (Continuous Scrollable Body) ── */}
        <main className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-8 flex-1 flex flex-col">
          <div className="max-w-[1400px] w-full mx-auto md:bg-white md:dark:bg-card md:border md:border-border/40 md:dark:border-border/30 md:rounded-md shadow-2xs p-6 sm:p-8 lg:p-10 min-h-full flex-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
