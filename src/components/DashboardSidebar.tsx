"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChevronDown, IconLogout, IconUser } from "@tabler/icons-react";
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
    <aside className="flex h-full w-full flex-col bg-white border-r border-border/80 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.03)] z-50">
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
                      ? "bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white shadow-lg shadow-[#B5651D]/20"
                      : "text-muted-foreground/60 hover:bg-muted/10 hover:text-foreground"
                  )}
                >
                  {Icon && (
                    <Icon
                      className={twMerge(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-muted-foreground/30 group-hover:text-foreground"
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

      <div className="mt-auto p-5 border-t border-border/50 bg-muted/[0.02]">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-border shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/10 text-primary border border-border/50">
            <IconUser className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-black text-foreground uppercase tracking-tight">
              {authUser?.name || "Admin User"}
            </p>
            <p className="truncate text-[9px] font-bold text-muted-foreground uppercase opacity-40">
              {authUser?.email || "Super Admin"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100 shrink-0"
            title={t("common.logOut")}
          >
            <IconLogout className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
