"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconUsers,
  IconCalendarEvent,
  IconCalendarCheck,
  IconArrowRight,
  IconReload,
  IconReceipt2,
  IconCircleCheck,
  IconCircleX,
  IconLoader2,
  IconUser,
  IconMapPin,
  IconPhone,
  IconCalendarStats,
  IconCategory,
  IconPackage,
  IconHierarchy,
  IconShoppingCart,
  IconWallet,
  IconTrendingUp,
  IconShoppingBag,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardService, DashboardResponse } from "@/lib/services/dashboardService";
import Link from "next/link";

export default function DashboardPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<DashboardResponse>({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
  });

  const stats = data?.stats;
  const recentBookings = data?.recentUpcomingBookings || [];

  const statCards = [
    {
      title: "Active Sellers",
      value: "842",
      icon: IconUsers,
      color: "text-[#B5651D]",
      bg: "bg-[#B5651D]/5",
      border: "border-[#B5651D]/10",
      trend: "+12.5% vs last month",
    },
    {
      title: "Total Buyers",
      value: "12,402",
      icon: IconShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-500/5",
      border: "border-blue-500/10",
      trend: "+8.2% vs last month",
    },
    {
      title: "Live Products",
      value: "45,280",
      icon: IconPackage,
      color: "text-emerald-600",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/10",
      trend: "+15.4% vs last month",
    },
    {
      title: "Marketplace Revenue",
      value: "$1.2M",
      icon: IconWallet,
      color: "text-amber-600",
      bg: "bg-amber-500/5",
      border: "border-amber-500/10",
      trend: "+5.1% vs last month",
    },
  ];

  const recentUsers = [
    { id: "1", name: "Alex Johnson", email: "alex@example.com", role: "Seller", status: "Active", location: "New York, USA", date: "2 mins ago" },
    { id: "2", name: "Sarah Smith", email: "sarah@example.com", role: "Buyer", status: "Active", location: "London, UK", date: "15 mins ago" },
    { id: "3", name: "Mike Ross", email: "mike@example.com", role: "Seller", status: "Pending", location: "Toronto, CA", date: "45 mins ago" },
    { id: "4", name: "Emily Davis", email: "emily@example.com", role: "Buyer", status: "Active", location: "Berlin, DE", date: "1 hour ago" },
    { id: "5", name: "Robert Chen", email: "robert@example.com", role: "Seller", status: "Active", location: "Singapore", date: "3 hours ago" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 font-sans">
      {/* Header section identical to categories */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#B5651D]/5 flex items-center justify-center text-[#B5651D]">
            <IconCalendarStats size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">{t("dashboard.title")}</h1>
            <p className="text-[11px] font-medium text-muted-foreground/60">Welcome back! Here's what's happening today in BOSS.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] })}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted transition-all active:scale-95 shadow-none"
            title="Refresh dashboard metrics"
          >
            <IconReload className={twMerge("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-2">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className={twMerge(
              "group relative overflow-hidden rounded-[2.5rem] border bg-card p-6 transition-all duration-300",
              "hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] hover:-translate-y-1",
              stat.border
            )}
          >
            <div className="flex items-center justify-between">
              <div className={twMerge("rounded-2xl p-3 shadow-inner", stat.bg, stat.color)}>
                <stat.icon size={26} stroke={2} />
              </div>
              <div className={twMerge(
                "h-2 w-2 rounded-full",
                isLoading ? "bg-muted animate-pulse" : "bg-emerald-400"
              )} />
            </div>

            <div className="mt-6 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none">
                  {stat.title}
                </h3>
                {stat.trend && (
                  <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5">
                    <IconTrendingUp size={10} /> {stat.trend.split(' ')[0]}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter text-foreground tabular-nums">
                  {stat.value}
                </span>
              </div>
              <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">{stat.trend?.split(' ').slice(1).join(' ')}</p>
            </div>

            {/* Subtle background glow */}
            <div className={twMerge(
              "absolute -right-8 -bottom-8 h-32 w-32 rounded-full opacity-[0.05] blur-2xl transition-all duration-500 group-hover:scale-150",
              stat.bg
            )} />
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3 px-2">
        {/* Recent Marketplace Activity */}
        <section className="lg:col-span-2 rounded-[2.5rem] border border-border bg-card p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Marketplace Activity
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">Real-time user & transaction flow</p>
            </div>
            <Link href="/users" className="h-8 px-4 rounded-xl bg-muted/50 border border-border text-[9px] font-black uppercase tracking-widest text-foreground hover:bg-muted transition-all flex items-center gap-2">
              Management Portal <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="divide-y divide-border/30">
              {recentUsers.map((user) => (
                <div key={user.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group transition-all">
                  <div className="flex items-center gap-4">
                    <div className={twMerge(
                      "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all",
                      user.role === "Seller"
                        ? "bg-[#B5651D]/5 border-[#B5651D]/10 text-[#B5651D]"
                        : "bg-blue-500/5 border-blue-500/10 text-blue-600"
                    )}>
                      {user.role === "Seller" ? <IconShoppingBag size={22} stroke={1.5} /> : <IconUser size={22} stroke={1.5} />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-black text-foreground">{user.name}</p>
                        <span className={twMerge(
                          "px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border",
                          user.role === "Seller" ? "bg-[#B5651D]/10 border-[#B5651D]/20 text-[#B5651D]" : "bg-blue-500/10 border-blue-500/20 text-blue-600"
                        )}>
                          {user.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground opacity-60">
                        <span className="flex items-center gap-1"><IconMapPin size={10} /> {user.location}</span>
                        <span className="flex items-center gap-1">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={twMerge(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ring-1 ring-inset",
                      user.status === "Active" ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10" : "bg-amber-50 text-amber-600 ring-amber-500/10"
                    )}>
                      <div className={twMerge("h-1 w-1 rounded-full bg-current", user.status === "Active" && "animate-pulse")} />
                      {user.status}
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/30 mt-1 uppercase tracking-widest tabular-nums">
                      {user.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <section className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none">Administrative Shortcuts</h3>
            </div>
            <div className="grid gap-3">
              <Link href="/users" className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50 text-indigo-900 group transition-all hover:bg-indigo-100/80 active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-indigo-600">
                    <IconUsers size={18} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">User Governance</span>
                </div>
                <IconArrowRight size={14} className="opacity-30 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/categories" className="flex items-center justify-between p-4 rounded-2xl bg-[#B5651D]/5 border border-[#B5651D]/10 text-[#B5651D] group transition-all hover:bg-[#B5651D]/10 active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#B5651D]">
                    <IconCategory size={18} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Global Categories</span>
                </div>
                <IconArrowRight size={14} className="opacity-30 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products" className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 text-emerald-900 group transition-all hover:bg-emerald-100/80 active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-emerald-600">
                    <IconPackage size={18} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Catalog Review</span>
                </div>
                <IconArrowRight size={14} className="opacity-30 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-border/40">
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] text-center leading-relaxed">
                BOSS Admin Protocol<br />v2.4.0 — Secure Access
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
