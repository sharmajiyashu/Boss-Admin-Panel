"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLogout, IconUser } from "@tabler/icons-react";
import { sidebarNav, isNavSection } from "@/lib/sidebar-nav";
import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useTranslations } from "@/contexts/LanguageContext";
import { getAuthUser, clearToken, type AuthUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslations();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [openSections, setOpenSections] = React.useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setAuthUser(getAuthUser());
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <aside className="z-50 flex h-full w-full flex-col bg-sidebar text-sidebar-foreground shadow-[4px_0_24px_-12px_rgba(0,0,0,0.06)]">
      <div className="flex shrink-0 items-center justify-center px-6 py-10">
        <Link
          href="/dashboard"
          className="w-full flex justify-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <img src="/logo.svg" alt="BOSS" className="h-10 w-auto max-w-full object-contain" />
        </Link>
      </div>

      <nav className="flex-1 space-y-4 px-5 py-2 overflow-y-auto scrollbar-none">
        <div className="space-y-1.5 font-sans">
          {sidebarNav.map((item) => {
            const hasItems = isNavSection(item);
            const Icon = item.icon;
            const href = item.href;
            const titleKey = item.titleKey;

            if (!hasItems) {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={twMerge(
                    "group flex items-center gap-3 rounded-[16px] px-4 py-3.5 text-[12px] font-black uppercase tracking-wider transition-all duration-300",
                    isActive
                      ? "bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white shadow-md shadow-[#B5651D]/15"
                      : "text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  {Icon && (
                    <Icon
                      className={twMerge(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-sidebar-foreground/35 group-hover:text-sidebar-foreground"
                      )}
                    />
                  )}
                  <span>{t(titleKey)}</span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-sidebar-border/50 bg-sidebar-accent/20 p-5">
        <div className="flex items-center gap-3 rounded-2xl bg-card/70 p-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-primary ring-1 ring-black/[0.05]">
            <IconUser className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-black uppercase tracking-tight text-sidebar-foreground">
              {authUser?.name || "Admin User"}
            </p>
            <p className="truncate text-[9px] font-bold uppercase text-sidebar-foreground/45">
              {authUser?.email || "Super Admin"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-all hover:bg-red-500/10 hover:text-red-600"
            title={t("common.logOut")}
          >
            <IconLogout className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
