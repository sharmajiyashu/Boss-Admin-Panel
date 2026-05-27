"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconLogout, IconUser, IconChevronRight, IconChevronDown } from "@tabler/icons-react";
import { sidebarNav, isNavSection } from "@/lib/sidebar-nav";
import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthUser, clearToken, type AuthUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import * as Collapsible from "@radix-ui/react-collapsible";

export function DashboardSidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
   const pathname = usePathname();
   const router = useRouter();
   const { t } = useLanguage();
   const [authUser, setAuthUser] = useState<AuthUser | null>(null);
   const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

   useEffect(() => {
      setAuthUser(getAuthUser());
   }, []);

   useEffect(() => {
      sidebarNav.forEach((item) => {
         if (isNavSection(item)) {
            const href = item.href;
            if (pathname.startsWith(href)) {
               setOpenSections((prev) => ({ ...prev, [href]: true }));
            }
         }
      });
   }, [pathname]);

   const handleLogout = () => {
      clearToken();
      router.push("/login");
   };

   return (
      <aside className="relative flex h-full flex-col bg-sidebar text-sidebar-foreground">
         {/* Brand Section */}
         <div className="flex shrink-0 items-center px-6 py-5">
            <Link href="/dashboard" className="block transition-transform hover:opacity-90 active:scale-[0.98]">
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
         <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto no-scrollbar">
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
                           "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                           isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/15"
                              : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                        )}
                     >
                        {Icon && (
                           <Icon
                              className={twMerge(
                                 "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                                 isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                              )}
                           />
                        )}
                        {!isCollapsed && (
                           <span className="flex-1 animate-in fade-in slide-in-from-left-2 duration-500">{t(titleKey)}</span>
                        )}
                     </Link>
                  );
               } else {
                  const href = item.href;
                  const isOpen = openSections[href] ?? pathname.startsWith(href);

                  return (
                     <Collapsible.Root
                        key={titleKey}
                        open={isOpen}
                        onOpenChange={(open) =>
                           setOpenSections((prev) => ({ ...prev, [href]: open }))
                        }
                        className="space-y-1"
                     >
                        <Collapsible.Trigger
                           className={twMerge(
                              "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 outline-none border-none",
                              "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                              isOpen && "bg-sidebar-accent/50 text-foreground"
                           )}
                        >
                           <div className="flex items-center gap-3">
                              {Icon && (
                                 <Icon
                                    className={twMerge(
                                       "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                                       isOpen ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )}
                                 />
                              )}
                              {!isCollapsed && (
                                 <span className="flex-1 animate-in fade-in slide-in-from-left-2 duration-500">{t(titleKey)}</span>
                              )}
                           </div>
                           {!isCollapsed && (
                              <IconChevronDown
                                 size={16}
                                 className={twMerge(
                                    "text-muted-foreground/50 transition-transform duration-300",
                                    isOpen && "rotate-180 text-primary opacity-100"
                                 )}
                              />
                           )}
                        </Collapsible.Trigger>
                        <Collapsible.Content className="CollapsibleContent overflow-hidden">
                           <div className={twMerge("space-y-1 mt-1", !isCollapsed && "ml-5 border-l-2 border-primary/10 pl-4")}>
                              {item.items.map((subItem) => {
                                 const SubIcon = subItem.icon;
                                 const isActive = pathname === subItem.href;
                                 return (
                                    <Link
                                       key={subItem.href}
                                       href={subItem.href}
                                       className={twMerge(
                                          "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                          isActive
                                             ? "font-semibold text-primary bg-primary/5"
                                             : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                                       )}
                                    >
                                       {SubIcon && (
                                          <SubIcon
                                             className={twMerge(
                                                "h-4 w-4 shrink-0 transition-all",
                                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                             )}
                                          />
                                       )}
                                       {!isCollapsed && (
                                          <span className="flex-1 animate-in fade-in slide-in-from-left-2 duration-500">{t(subItem.titleKey)}</span>
                                       )}
                                    </Link>
                                 );
                              })}
                           </div>
                        </Collapsible.Content>
                     </Collapsible.Root>
                  );
               }
            })}
         </nav>

         {/* User Footer */}
         <div className="mt-auto border-t border-sidebar-border/50 p-4">
            <div className={twMerge(
               "flex items-center gap-3 rounded-2xl bg-sidebar-accent/50 p-3 transition-all duration-500",
               isCollapsed ? "justify-center" : "justify-between"
            )}>
               {!isCollapsed && (
                  <div className="flex items-center gap-3">
                     <div className="h-9 w-9 shrink-0 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                        <IconUser size={18} />
                     </div>
                     <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800">
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
