import {
  IconLayoutDashboard,
  IconCategory,
  IconHierarchy,
  IconPackage,
  IconUsers,
  IconSettings,
} from "@tabler/icons-react";

export interface SidebarNavItem {
  titleKey: string;
  href: string;
  icon?: React.ElementType;
}

export interface SidebarNavSection {
  titleKey: string;
  href: string;
  items: SidebarNavItem[];
  icon?: React.ElementType;
}

export type SidebarNavEntry = SidebarNavItem | SidebarNavSection;

export function isNavSection(
  item: SidebarNavEntry
): item is SidebarNavSection {
  return "items" in item && Array.isArray((item as SidebarNavSection).items);
}

/** Sidebar navigation config for BOSS Admin Panel. titleKey matches i18n messages. */
export const sidebarNav: SidebarNavEntry[] = [
  { titleKey: "nav.dashboard", href: "/dashboard", icon: IconLayoutDashboard },
  { titleKey: "nav.categories", href: "/categories", icon: IconCategory },
  { titleKey: "nav.subcategories", href: "/subcategories", icon: IconHierarchy },
  { titleKey: "nav.products", href: "/products", icon: IconPackage },
  { titleKey: "nav.users", href: "/users", icon: IconUsers },
  { titleKey: "nav.settings", href: "/settings", icon: IconSettings },
];
