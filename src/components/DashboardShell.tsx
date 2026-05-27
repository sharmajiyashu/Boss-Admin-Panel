"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  IconChevronDown,
  IconLayoutSidebarLeftExpand,
  IconLayoutSidebarLeftCollapse,
  IconLogout,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getAuthUser, type AuthUser } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { twMerge } from "tailwind-merge";

/** Display name for auth user (VendorUser from login has name, email). */
function displayName(user: AuthUser | null): string {
  if (!user) return "—";
  return user.name ?? user.email ?? "—";
}

function displayRole(user: AuthUser | null): string | null {
  const role =
    user?.roleName ??
    (typeof user?.role === "string" ? user.role : user?.role?.name);
  if (!role) return null;
  const cleaned = String(role).trim();
  return cleaned.length > 0 ? cleaned : null;
}

export function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const mainRef = React.useRef<HTMLElement>(null);
  const roleLabel = displayRole(authUser);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // Initialize
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const user = getAuthUser();
    queueMicrotask(() => setAuthUserState(user));
  }, []);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    // Close sidebar on route change on mobile
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={twMerge(
          "fixed inset-y-0 left-0 z-[70] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:relative lg:z-0",
          sidebarOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-0 lg:w-[80px] lg:translate-x-0"
        )}
      >
        <div className={twMerge(
          "h-full overflow-hidden border-r border-sidebar-border bg-sidebar transition-all duration-500",
          sidebarOpen ? "w-[280px]" : "w-[80px]"
        )}>
          <DashboardSidebar isCollapsed={!sidebarOpen && !isMobile} />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 sm:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label={sidebarOpen ? t("common.hideSidebar") : t("common.showSidebar")}
            >
              {sidebarOpen ? (
                <IconLayoutSidebarLeftCollapse className="h-5 w-5" aria-hidden />
              ) : (
                <IconLayoutSidebarLeftExpand className="h-5 w-5" aria-hidden />
              )}
            </button>
          </div>

          <div className="flex items-center">
            {/* User Profile Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-card-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-muted"
                aria-label={t("header.userMenu")}
              >
                <span className="max-w-[140px] truncate sm:max-w-[180px]">
                  {displayName(authUser)}
                </span>
                <IconChevronDown className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[180px] rounded-lg border border-border bg-background p-1 shadow-lg z-[100]"
                  sideOffset={6}
                  align="end"
                >
                  <div className="px-2 py-2">
                    <div className="text-sm font-medium text-foreground">
                      {displayName(authUser)}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {authUser?.email}
                    </div>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-border" />
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                    onSelect={() => {
                      clearToken();
                      router.push("/login");
                    }}
                  >
                    <IconLogout className="h-4 w-4" aria-hidden />
                    {t("common.logOut")}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>

        <main
          ref={mainRef}
          className="min-h-0 flex-1 overflow-auto p-6"
          id="main-content"
        >
          <div
            key={pathname}
            className="mx-auto max-w-7xl animate-in fade-in duration-200"
          >
            {children}
          </div>
        </main>
        <footer className="shrink-0 border-t border-border bg-card px-4 py-3 sm:px-6" role="contentinfo">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} {t("app.name")}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
