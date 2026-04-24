import type { Locale } from "@/lib/locale";

/** Nested key path like "nav.dashboard" or "common.save" */
export type MessageKey = string;

/** All static UI messages. Add keys here and use t(key) in components. */
export const messages: Record<Locale, Record<string, string>> = {
  en: {
    "app.name": "Bos Admin Panel",
    "app.tagline": "Admin panel",

    // Auth
    "auth.signIn": "Sign in",
    "auth.signInDescription": "Enter your email and password",
    "auth.email": "Email",
    "auth.emailPlaceholder": "you@example.com",
    "auth.password": "Password",
    "auth.passwordPlaceholder": "••••••••",
    "auth.signingIn": "Signing in…",
    "auth.hidePassword": "Hide password",
    "auth.showPassword": "Show password",
    "auth.redirectingToLogin": "Redirecting to login…",

    // Common
    "common.loading": "Loading…",
    "common.logOut": "Log out",
    "common.hideSidebar": "Hide sidebar",
    "common.showSidebar": "Show sidebar",
    "common.page": "Page",
    "common.previous": "Previous",
    "common.next": "Next",
    "common.showing": "Showing",
    "common.to": "to",
    "common.of": "of",
    "common.results": "results",
    "common.refresh": "Refresh",
    "common.close": "Close",
    "common.save": "Save",
    "common.saveFailed": "Save failed",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.cancel": "Cancel",


    "nav.dashboard": "Dashboard",
    "nav.categories": "Categories",
    "nav.subcategories": "Subcategories",
    "nav.products": "Listings",
    "nav.users": "Users",
    "nav.settings": "App Settings",


    "header.userMenu": "User menu",


    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Overview and quick actions for your admin workspace.",
    "dashboard.overview": "Overview",
    "dashboard.manageRoles": "Manage roles",
    "dashboard.quickActions": "Quick actions",
    "dashboard.recentActivity": "Recent activity",
    "dashboard.recentActivityHint": "You’ll see audit logs and important changes here.",
    "dashboard.emptyActivity": "No activity yet.",
    "dashboard.card.security": "Security",
    "dashboard.card.securityValue": "Protected",
    "dashboard.card.securityHelp": "Token-based authentication enabled.",
    "dashboard.card.roles": "Role permissions",
    "dashboard.card.rolesValue": "Configured",
    "dashboard.card.rolesHelp": "Create and manage admin roles.",
    "dashboard.card.settings": "Settings",
    "dashboard.card.settingsValue": "Ready",
    "dashboard.card.settingsHelp": "Panel preferences and configuration.",
    "dashboard.card.totalUsers": "Total Users",
    "dashboard.card.newRegistrations": "New Registrations",
    "dashboard.card.activeUsers": "Active Users",
    "dashboard.card.subscriptions": "Subscriptions",
    "dashboard.card.totalBookings": "Total Bookings",
    "dashboard.card.todayBookings": "Today’s Bookings",
    "dashboard.card.cancelledBookings": "Cancelled Bookings",
    "dashboard.card.totalRevenue": "Total Revenue",
    "dashboard.card.totalWalletBalance": "Wallet Pool",
    "dashboard.card.totalTemples": "Total Temples",
    "dashboard.card.totalTours": "Total Tours",
    "dashboard.recentUpcoming": "Recent Upcoming Bookings",
    "dashboard.action.rolesTitle": "Roles & permissions",
    "dashboard.action.rolesDesc": "Create roles, assign permissions, and control access.",

  },
  kh: {
    "app.name": "Bos Admin Panel",
    "app.tagline": "ផ្ទាំងគ្រប់គ្រង",
    "nav.users": "ការគ្រប់គ្រងអ្នកប្រើប្រាស់",
    "nav.packages": "កញ្ចប់",
    "packages.title": "កញ្ចប់បុព្វលាភ",
    "packages.subtitle": "គ្រប់គ្រងកញ្ចប់ជាវ និងលក្ខណៈពិសេសរបស់ពួកគេ។",
    "nav.userManagement": "ការគ្រប់គ្រងអ្នកប្រើប្រាស់",
    "nav.subscriptions": "ការជាវ",
    "nav.enquiries": "ការសាកសួរ",
    "nav.reports": "របាយការណ៍",
    "userDetails.location": "Location",
    "userDetails.searchingFor": "Searching for",
    "userDetails.connectionType": "Connection type",
    "userDetails.photos": "Profile photos",
  },
};

/** Get localized string for API payloads that have { en, kh }. */
export function getLocalizedText(
  obj: { en?: string; kh?: string } | string | null | undefined,
  locale: Locale
): string {
  if (obj == null) return "";
  if (typeof obj === "string") return obj;
  const value = obj[locale] ?? obj.en ?? obj.kh;
  return typeof value === "string" ? value : "";
}
