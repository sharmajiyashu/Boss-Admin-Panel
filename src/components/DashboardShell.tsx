"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  IconChevronDown,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, getAuthUser, type AuthUser } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [authUser, setAuthUserState] = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const mainRef = React.useRef<HTMLElement>(null);
  const roleLabel = displayRole(authUser);

  useEffect(() => {
    const user = getAuthUser();
    queueMicrotask(() => setAuthUserState(user));
  }, []);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className={`shrink-0 overflow-hidden transition-[width] duration-500 ease-out ${sidebarOpen ? "w-64" : "w-0"
          }`}
      >
        <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
          <DashboardSidebar />
        </div>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card/80 px-4 shadow-sm sm:px-6 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSidebarOpen((o: boolean) => !o)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95 outline-none"
            aria-label={sidebarOpen ? t("common.hideSidebar") : t("common.showSidebar")}
          >
            {sidebarOpen ? (
              <IconLayoutSidebarLeftCollapse
                className="h-4 w-4"
                aria-hidden
              />
            ) : (
              <IconLayoutSidebarLeftExpand
                className="h-4 w-4"
                aria-hidden
              />
            )}
          </button>
          <div className="flex flex-1 items-center justify-end gap-3">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-card-foreground transition-all hover:bg-muted outline-none active:scale-95 data-[state=open]:bg-muted"
                aria-label={t("header.userMenu")}
              >
                <span className="max-w-[140px] truncate sm:max-w-[180px]">
                  {authUser?.name}
                </span>
                <IconChevronDown className="h-3.5 w-3.5 shrink-0 opacity-40" aria-hidden />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[180px] rounded-xl border border-border bg-background p-1.5 shadow-xl animate-in zoom-in-95 fade-in duration-200"
                  sideOffset={6}
                  align="end"
                >
                  <div className="px-2 py-2">
                    <div className="text-[13px] font-bold text-foreground truncate">
                      {displayName(authUser) || "Admin"}
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 truncate font-medium">
                      {authUser?.email}
                    </div>
                    {roleLabel && (
                      <div className="mt-2 inline-flex items-center rounded-lg bg-[#5A2A13]/5 px-2 py-0.5 text-[10px] font-bold text-[#5A2A13] ring-1 ring-[#5A2A13]/10">
                        {roleLabel}
                      </div>
                    )}
                  </div>
                  <DropdownMenu.Separator className="my-1.5 h-px bg-border/50" />
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground"
                    onSelect={() => {
                      clearToken();
                      router.push("/login");
                    }}
                  >
                    <IconLogout className="h-3.5 w-3.5" aria-hidden />
                    {t("common.logOut")}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>
        <main
          ref={mainRef}
          className="min-h-0 flex-1 overflow-auto p-4 sm:p-6"
          id="main-content"
        >
          <div
            key={pathname}
            className="mx-auto max-w-7xl animate-in fade-in duration-200"
          >
            {children}
          </div>
        </main>
        <footer className="shrink-0 border-t border-border bg-card px-4 py-2 sm:px-6" role="contentinfo">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 text-[10px] font-medium text-muted-foreground/40 text-center">
            <span className="w-full text-center">© {new Date().getFullYear()} {t("app.name")}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
