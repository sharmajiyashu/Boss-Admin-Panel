"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLogout, IconUser, IconChevronRight, IconGridDots } from "@tabler/icons-react";
import { sidebarNav, isNavSection } from "@/lib/sidebar-nav";
import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthUser, clearToken, type AuthUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { dashboardService, type DashboardStats } from "@/lib/services/dashboardService";

export function DashboardSidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
   const pathname = usePathname();
   const router = useRouter();
   const { t } = useLanguage();
   const [authUser, setAuthUser] = useState<AuthUser | null>(null);

   useEffect(() => {
      setAuthUser(getAuthUser());
   }, []);

   const handleLogout = () => {
      clearToken();
      router.push("/login");
   };

   // Fetch live dashboard stats for sidebar badges
   const { data: stats } = useQuery<DashboardStats>({
      queryKey: ["dashboard-stats"],
      queryFn: dashboardService.getStats,
      staleTime: 30_000, // Cache for 30s to avoid excessive requests
   });

   // Map nav hrefs to live badge counts from the API
   const badgeCounts: Record<string, number | undefined> = {
      "/categories": stats?.categories?.total,
      "/subcategories": stats?.subcategories?.total,
      "/products": stats?.products?.total,
      "/users": stats?.users?.total,
   };

   // Pending products need attention — show as a warning badge
   const pendingBadge: Record<string, number | undefined> = {
      "/products": stats?.products?.pending,
   };

   return (
      <aside className="relative flex h-full flex-col bg-white">
         {/* Brand Section */}
         <div className={twMerge(
            "flex shrink-0 items-center px-6 py-8 transition-all duration-500",
            isCollapsed ? "justify-center" : "justify-start"
         )}>
            <Link href="/dashboard" className="relative flex items-center gap-3">
               <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#da8cff] to-[#9a55ff] shadow-lg shadow-[#b66dff]/30">
                  <IconGridDots size={24} className="text-white" />
               </div>
               {!isCollapsed && (
                  <span className="text-2xl font-black tracking-tighter text-slate-900">Purple</span>
               )}
            </Link>
         </div>

         {/* Profile Section (Purple Style) */}
         {!isCollapsed && (
            <div className="px-6 py-6 border-b border-slate-50 flex items-center gap-4 group">
               <div className="relative">
                  <img
                     src={authUser?.clinic?.clinicLogo?.url || "https://i.pravatar.cc/150"}
                     alt=""
                     className="h-12 w-12 rounded-full ring-2 ring-[#b66dff]/20 shadow-xl"
                  />
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
               </div>
               <div className="min-w-0">
                  <h3 className="text-sm font-black text-slate-800 truncate leading-tight">{authUser?.name || "David Grey. H"}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{authUser?.roleName || "Management"}</p>
               </div>
               <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconChevronRight size={14} className="text-[#b66dff]" />
               </div>
            </div>
         )}

         {/* Navigation Section */}
         <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto no-scrollbar">
            {sidebarNav.map((item) => {
               const hasItems = isNavSection(item);
               const Icon = item.icon;
               const href = item.href;
               const titleKey = item.titleKey;

               if (!hasItems) {
                  const isActive = pathname === href;
                  const count = badgeCounts[href];
                  const pending = pendingBadge[href];

                  return (
                     <Link
                        key={href}
                        href={href}
                        className={twMerge(
                           "group relative flex items-center gap-4 rounded-xl px-5 py-3.5 text-[13px] font-bold transition-all duration-300",
                           isActive
                              ? "text-[#b66dff]"
                              : "text-slate-600 hover:text-[#b66dff]"
                        )}
                     >
                        {Icon && (
                           <Icon
                              className={twMerge(
                                 "h-5 w-5 shrink-0 transition-all",
                                 isActive ? "text-[#b66dff]" : "text-slate-400 group-hover:text-[#b66dff]"
                              )}
                           />
                        )}
                        {!isCollapsed && (
                           <span className="flex-1 animate-in fade-in slide-in-from-left-2 duration-500">{t(titleKey)}</span>
                        )}

                        {/* Live count badge */}
                        {!isCollapsed && count !== undefined && count > 0 && (
                           <span className="ml-auto min-w-[28px] text-center rounded-lg bg-[#b66dff]/10 px-2 py-0.5 text-[10px] font-black text-[#b66dff] tabular-nums">
                              {count}
                           </span>
                        )}

                        {/* Pending attention badge */}
                        {!isCollapsed && pending !== undefined && pending > 0 && (
                           <span className="min-w-[24px] text-center rounded-lg bg-amber-50 px-1.5 py-0.5 text-[9px] font-black text-amber-600 ring-1 ring-amber-200/50 tabular-nums">
                              {pending}
                           </span>
                        )}

                        {isActive && !isCollapsed && !count && (
                           <div className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-[#b66dff]" />
                              <IconChevronRight size={14} className="text-[#b66dff]/40" />
                           </div>
                        )}
                     </Link>
                  );
               }
               return null;
            })}
         </nav>

         {/* User Footer */}
         <div className="mt-auto border-t border-slate-50 p-4">
            <div className={twMerge(
               "flex items-center gap-3 rounded-2xl bg-slate-50 p-3 transition-all duration-500",
               isCollapsed ? "justify-center" : "justify-between"
            )}>
               {!isCollapsed && (
                  <div className="flex items-center gap-3">
                     <div className="h-9 w-9 shrink-0 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#b66dff]">
                        <IconUser size={18} />
                     </div>
                     <div className="min-w-0">
                        <p className="truncate text-[11px] font-black uppercase text-slate-800">
                           Account Settings
                        </p>
                     </div>
                  </div>
               )}
               <button
                  onClick={handleLogout}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
                  title={t("common.logOut")}
               >
                  <IconLogout size={18} />
               </button>
            </div>
         </div>
      </aside>
   );
}
