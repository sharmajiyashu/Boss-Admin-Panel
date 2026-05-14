"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLogout, IconUser, IconChevronRight } from "@tabler/icons-react";
import { sidebarNav, isNavSection } from "@/lib/sidebar-nav";
import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthUser, clearToken, type AuthUser } from "@/lib/api";
import { useRouter } from "next/navigation";

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

   return (
      <aside className="relative flex h-full flex-col bg-white">
         {/* Brand Section */}
         <div className="flex shrink-0 items-center justify-center px-5 py-6">
            <Link href="/dashboard" className="block">
               <img
                  src="/logo.svg"
                  alt="Bos"
                  className={twMerge(
                     "object-contain transition-all duration-500",
                     isCollapsed ? "h-8 w-8" : "h-12 w-auto max-w-[140px]"
                  )}
               />
            </Link>
         </div>




         {/* Navigation Section */}
         <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto no-scrollbar">
            {sidebarNav.map((item, index) => {
               const hasItems = isNavSection(item);
               const Icon = item.icon;
               const titleKey = item.titleKey;

               if (!hasItems) {
                  const href = item.href;
                  const isActive = pathname === href;

                  return (
                     <Link
                        key={href}
                        href={href}
                        className={twMerge(
                           "group relative flex items-center gap-4 rounded-xl px-5 py-3.5 text-[13px] font-bold transition-all duration-300",
                           isActive
                              ? "text-[#B5651D]"
                              : "text-slate-600 hover:text-[#B5651D]"
                        )}
                     >
                        {Icon && (
                           <Icon
                              className={twMerge(
                                 "h-5 w-5 shrink-0 transition-all",
                                 isActive ? "text-[#B5651D]" : "text-slate-400 group-hover:text-[#B5651D]"
                              )}
                           />
                        )}
                        {!isCollapsed && (
                           <span className="flex-1 animate-in fade-in slide-in-from-left-2 duration-500">{t(titleKey)}</span>
                        )}

                        {isActive && !isCollapsed && (
                           <div className="flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-[#B5651D]" />
                              <IconChevronRight size={14} className="text-[#B5651D]/40" />
                           </div>
                        )}
                     </Link>
                  );
               } else {
                  return (
                    <div key={titleKey} className="space-y-1">
                      {!isCollapsed && (
                        <div className="px-5 pt-4 pb-2">
                          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400/80">
                            {t(titleKey)}
                          </p>
                        </div>
                      )}
                      {item.items.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={twMerge(
                              "group relative flex items-center gap-4 rounded-xl px-5 py-3 text-[13px] font-bold transition-all duration-300",
                              isActive
                                ? "text-[#B5651D]"
                                : "text-slate-600 hover:text-[#B5651D]"
                            )}
                          >
                            {SubIcon && (
                              <SubIcon
                                className={twMerge(
                                  "h-4 w-4 shrink-0 transition-all",
                                  isActive ? "text-[#B5651D]" : "text-slate-400 group-hover:text-[#B5651D]"
                                )}
                              />
                            )}
                            {!isCollapsed && (
                              <span className="flex-1 animate-in fade-in slide-in-from-left-2 duration-500">{t(subItem.titleKey)}</span>
                            )}
                            {isActive && !isCollapsed && (
                               <div className="h-1 w-1 rounded-full bg-[#B5651D]" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  );
               }
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
                     <div className="h-9 w-9 shrink-0 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#B5651D]">
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
