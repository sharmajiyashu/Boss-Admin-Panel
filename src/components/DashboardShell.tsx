"use client";

import React, { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  IconChevronDown,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconLogout,
  IconSearch,
  IconMaximize,
  IconBell,
  IconMail,
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
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
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
          "h-full overflow-hidden border-r border-slate-200 bg-white transition-all duration-500",
          sidebarOpen ? "w-[280px]" : "w-[80px]"
        )}>
          <DashboardSidebar isCollapsed={!sidebarOpen && !isMobile} />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 sm:px-8 transition-all shadow-sm">
          <div className="flex items-center gap-6 flex-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95 outline-none"
              aria-label={sidebarOpen ? t("common.hideSidebar") : t("common.showSidebar")}
            >
              <IconLayoutSidebarLeftExpand className="h-5 w-5" />
            </button>
            
            <div className="hidden lg:flex items-center gap-3 flex-1 max-w-md">
               <IconSearch size={16} className="text-slate-300" />
               <input 
                  type="text" 
                  placeholder="Search projects" 
                  className="bg-transparent border-none outline-none text-[13px] font-bold text-slate-600 placeholder:text-slate-300 w-full"
               />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            {/* Global Actions */}
            <div className="hidden sm:flex items-center gap-5 mr-4 border-r border-slate-100 pr-6">
               <button className="text-slate-400 hover:text-slate-900 transition-colors">
                  <IconMaximize size={18} />
               </button>
               <button className="text-slate-400 hover:text-slate-900 transition-colors relative">
                  <IconMail size={18} />
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#ffbf96] border-2 border-white" />
               </button>
               <button className="text-slate-400 hover:text-slate-900 transition-colors relative">
                  <IconBell size={18} />
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#fe7096] border-2 border-white" />
               </button>
            </div>

            {/* User Profile Dropdown */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger
                className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-2 py-1.5 text-[13px] font-bold text-slate-700 transition-all hover:bg-slate-50 outline-none active:scale-95 group"
              >
                <div className="h-8 w-8 rounded-full ring-2 ring-slate-100 shadow-sm overflow-hidden flex items-center justify-center bg-slate-50">
                  <img src={authUser?.clinic?.clinicLogo?.url || "https://i.pravatar.cc/150"} alt="" className="h-full w-full object-cover" />
                </div>
                <span className="hidden md:block max-w-[120px] truncate leading-none">
                  {authUser?.name || "David Greym..."}
                </span>
                <IconChevronDown className="h-3.5 w-3.5 shrink-0 opacity-20 group-hover:opacity-100 transition-opacity" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[240px] rounded-[24px] border-0 bg-white p-2 shadow-2xl shadow-slate-200 ring-1 ring-slate-200 animate-in zoom-in-95 slide-in-from-top-2 fade-in duration-300 z-[100]"
                  sideOffset={8}
                  align="end"
                >
                  <div className="px-4 py-4 mb-2 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div className="text-[14px] font-black text-slate-900 truncate">
                      {displayName(authUser)}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate font-semibold">
                      {authUser?.email}
                    </div>
                  </div>
                  <DropdownMenu.Item
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-[12px] font-bold text-slate-600 outline-none hover:bg-red-50 hover:text-red-600 transition-colors"
                    onSelect={() => {
                      clearToken();
                      router.push("/login");
                    }}
                  >
                    <IconLogout className="h-4 w-4" />
                    {t("common.logOut")}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>

        <main
          ref={mainRef}
          className="min-h-0 flex-1 overflow-auto p-4 sm:p-10 scroll-smooth no-scrollbar"
        >
          <div
            key={pathname}
            className="mx-auto max-w-[1600px] animate-in fade-in slide-in-from-bottom-2 duration-700"
          >
            {children}
          </div>
        </main>
        <footer className="shrink-0 border-t border-slate-100 bg-white/80 px-4 py-4 backdrop-blur-xl sm:px-8" role="contentinfo">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">
            <span className="w-full text-center">© {new Date().getFullYear()} {t("app.name")} — System Command Center</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
