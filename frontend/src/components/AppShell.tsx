import type { ComponentType, SVGProps } from 'react';
type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth, useAuthReady, signOut, dashboardPathFor } from "@/lib/auth";
import type { Role } from "@/api/types";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  UserIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NotificationsBell } from "./NotificationsBell";
import { PageTransition } from "./PageTransition";
import { PwaInstallPrompt } from "./PwaInstallPrompt";
import { HexBadge } from "./HexBadge";
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
  const location = useLocation();

  // Navigation track refs for continuous fluid 70% underline
  const navContainerRef = useRef<HTMLDivElement>(null);
  const navItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  const activeIndex = nav.findIndex((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  useLayoutEffect(() => {
    const validIndex = activeIndex >= 0 ? activeIndex : 0;
    const targetEl = navItemRefs.current[validIndex];
    const containerEl = navContainerRef.current;

    if (targetEl && containerEl) {
      const containerRect = containerEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();

      // Starts at the icon and spans 80% of the active item width
      const fullWidth = targetRect.width;
      const strokeWidth = fullWidth;
      const strokeLeft = targetRect.left - containerRect.left;

      setIndicator({
        left: strokeLeft,
        width: strokeWidth,
      });
    }
  }, [activeIndex, location.pathname]);

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
      <div className="min-h-screen grid place-items-center bg-surface dark:bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  const settingsPath = user.role === 'brand' ? '/brand/settings' : '/creator/settings';
  const profilePath = user.role === 'brand' ? '/brand/discover' : '/creator/profile';
  const walletPath = user.role === 'brand' ? '/brand/budget' : '/creator/wallet';

  return (
    <div className="min-h-screen w-full bg-white dark:bg-background text-foreground flex flex-col antialiased">

      {/* ── Desktop Main Navigation Header (Independent above workspace well) ── */}
      <header className="hidden md:block w-full bg-transparent border-0 pt-2 transition-colors">
        <div className="max-w-[1400px] w-full mx-auto px-6 pt-3 pb-1 md:px-8 flex items-end justify-between gap-8 h-18">

          {/* Left: Clean Brand Logo Wordmark */}
          <div className="flex items-center pb-3.5 shrink-0">
            <NavLink to={user.role === 'brand' ? '/brand' : '/creator'} className="flex items-center group">
              <Logo size="sm" showWordmark={true} />
            </NavLink>
          </div>

          {/* Center: Baseline-Anchored Cohere Navigation (Items rest right on the bottom baseline) */}
          <div className="flex-1 flex justify-center self-end">
            <nav
              ref={navContainerRef}
              className="relative flex items-center gap-9 -mb-px"
            >
              {nav.map((item, idx) => {
                const isActive = item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    ref={(el) => { navItemRefs.current[idx] = el; }}
                    className={cn(
                      "relative pb-3.5 pt-2 flex items-center gap-2 text-sm font-medium transition-colors duration-200 group select-none",
                      isActive
                        ? "text-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {/* ── Reverted Fluid Spring Underline (Resting directly on the baseline, 70% width, close to text) ── */}
              {indicator.width > 0 && (
                <motion.div
                  className="absolute bottom-2 h-[2.5px] bg-teal-600 dark:bg-teal-400 rounded-full shadow-2xs pointer-events-none"
                  initial={false}
                  animate={{
                    left: indicator.left,
                    width: indicator.width,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 30,
                    mass: 0.75,
                  }}
                />
              )}
            </nav>
          </div>

          {/* Right Action Island: Non-blocking Notification Dropdown + Circle Avatar with GitHub-style Perched Badge */}
          <div className="flex items-center gap-3.5 pb-2.5 shrink-0">

            {/* Non-blocking Popover Dropdown Notification */}
            <NotificationsBell />

            {/* Circular Profile Avatar with Badge positioned like GitHub status badge */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="User Account and Settings"
                  className="relative group p-0 bg-transparent border-0 focus:outline-none cursor-pointer flex items-center justify-center"
                >
                  {/* Clean Circle Avatar */}
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-extrabold text-xs grid place-items-center shadow-xs ring-2 ring-border/40 group-hover:ring-primary/40 transition-all">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* 3D Hexagonal Badge: Cleanly perched on top-right circumference without circular ring artifact */}
                  <div className="absolute -top-1 -right-1.5 pointer-events-none transform group-hover:scale-105 transition-transform duration-150">
                    <HexBadge role={user.role as "brand" | "creator"} size="sm" />
                  </div>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56 p-1 rounded-md shadow-elevated border-border/40 bg-card/95 backdrop-blur-xl z-50"
              >
                <div className="px-3 py-2">
                  <div className="text-xs font-bold text-foreground truncate">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground capitalize mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 inline-block" />
                    {user.role} Verified Workspace
                  </div>
                </div>

                <DropdownMenuSeparator className="my-1 bg-border/40" />

                <DropdownMenuItem
                  onClick={() => navigate(profilePath)}
                  className="rounded-sm text-xs py-1.5 cursor-pointer font-medium"
                >
                  <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  Public Profile & Bio
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate(walletPath)}
                  className="rounded-sm text-xs py-1.5 cursor-pointer font-medium"
                >
                  <BanknotesIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  Payout Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate(settingsPath)}
                  className="rounded-sm text-xs py-1.5 cursor-pointer font-medium"
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  Account Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-border/40" />

                <DropdownMenuItem
                  onClick={async () => { await signOut(); navigate("/"); }}
                  className="rounded-sm text-xs py-1.5 cursor-pointer text-destructive focus:text-destructive font-medium"
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </header>

      {/* ── Mobile Top Bar (md:hidden) with Notch Safe Padding ──────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-surface/95 dark:bg-background/95 backdrop-blur-md border-b border-border/40 pt-safe">
        <div className="flex items-center justify-between px-4 h-14 gap-2">
          <Logo size="sm" showWordmark={false} />

          <div className="flex items-center gap-2">
            <NotificationsBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-0 bg-transparent border-0 focus:outline-none">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-600 to-teal-500 text-white font-extrabold text-xs grid place-items-center shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -top-1 -right-1 pointer-events-none">
                    <HexBadge role={user.role as "brand" | "creator"} size="sm" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-md shadow-elevated p-1.5 border-border/40">
                <div className="px-3 py-2">
                  <div className="text-xs font-bold text-foreground truncate">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{user.role} Account</div>
                </div>
                <DropdownMenuSeparator className="my-1 bg-border/40" />
                <DropdownMenuItem onClick={() => navigate(profilePath)} className="rounded-sm text-xs py-1.5 cursor-pointer font-medium">
                  <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(settingsPath)} className="rounded-sm text-xs py-1.5 cursor-pointer font-medium">
                  <Cog6ToothIcon className="h-4 w-4 mr-2 text-muted-foreground" /> Account Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-border/40" />

                <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }} className="rounded-sm text-xs py-1.5 cursor-pointer text-destructive focus:text-destructive font-medium">
                  <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── Main Content Area: Gumloop Machined Workspace Well (Continuous Bottom) ── */}
      <main className="flex-1 w-full min-w-0 bg-transparent flex flex-col">
        <div className="w-full px-4 md:px-6 lg:px-8 pb-20 md:pb-0 pt-16 md:pt-2 flex-1 flex flex-col">
          <div className="max-w-[1400px] w-full mx-auto md:bg-white md:dark:bg-card md:border-t md:border-x md:border-b-0 md:border-border/40 md:dark:border-border/30 md:rounded-t-md md:rounded-b-none shadow-none md:shadow-none p-0 md:px-8 md:pt-8 md:pb-24 lg:px-10 lg:pt-10 lg:pb-28 min-h-full flex-1 [box-shadow:none]">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </div>
      </main>

      {/* ── Native Mobile PWA Bottom Navigation Bar (md:hidden) ─────────────── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 dark:bg-background/95 backdrop-blur-md border-t border-border/40 pb-safe">
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
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn("p-1 rounded-lg transition-colors", isActive ? "bg-primary/10" : "")}>
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
