import React from "react";
import {
  IconLayoutDashboard,
  IconCategory,
  IconHierarchy,
  IconPackage,
  IconUsers,
  IconSettings,
  IconMapPin,
  IconBuildingCommunity,
  IconWorld
} from "@tabler/icons-react";

export interface SidebarNavItem {
  titleKey: string;
  href: string;
  icon?: React.ElementType;
}

export interface SidebarNavSection {
  titleKey: string;
  items: SidebarNavItem[];
  icon?: React.ElementType;
}

export type SidebarNavItemType = SidebarNavItem | SidebarNavSection;

export function isNavSection(item: SidebarNavItemType): item is SidebarNavSection {
  return "items" in item;
}

export const sidebarNav: SidebarNavItemType[] = [
  { titleKey: "nav.dashboard", href: "/", icon: IconLayoutDashboard },
  { titleKey: "nav.categories", href: "/categories", icon: IconCategory },
  { titleKey: "nav.subcategories", href: "/subcategories", icon: IconHierarchy },
  { titleKey: "nav.products", href: "/products", icon: IconPackage },
  { titleKey: "nav.users", href: "/users", icon: IconUsers },
  {
    titleKey: "nav.locationManagement",
    icon: IconWorld,
    items: [
      { titleKey: "nav.countries", href: "/countries", icon: IconWorld },
      { titleKey: "nav.states", href: "/states", icon: IconMapPin },
      { titleKey: "nav.cities", href: "/cities", icon: IconBuildingCommunity },
    ],
  },
  { titleKey: "nav.settings", href: "/settings", icon: IconSettings },
];
