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
      title: "Total Categories",
      value: "12",
      icon: IconCategory,
      color: "text-[#5A2A13]",
      bg: "bg-[#5A2A13]/5",
      border: "border-[#5A2A13]/10",
    },
    {
      title: "Total Products",
      value: "1,248",
      icon: IconPackage,
      color: "text-emerald-600",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/10",
    },
    {
      title: "Active Sellers",
      value: "452",
      icon: IconUsers,
      color: "text-blue-600",
      bg: "bg-blue-500/5",
      border: "border-blue-500/10",
    },
    {
      title: "Pending Approvals",
      value: "28",
      icon: IconLoader2,
      color: "text-amber-600",
      bg: "bg-amber-500/5",
      border: "border-amber-500/10",
    },
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
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none">
                {stat.title}
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter text-foreground tabular-nums">
                  {stat.value}
                </span>
              </div>
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
        {/* Recent Upcoming Bookings */}
        <section className="lg:col-span-2 rounded-[2.5rem] border border-border bg-card p-8 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tight text-foreground">
              {t("dashboard.recentUpcoming")}
            </h2>
            <Link href="/bookings" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1.5 leading-none">
              View All <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3">
                <IconLoader2 size={32} className="animate-spin text-primary/30" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Fetching schedules...</p>
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
                <div className="h-16 w-16 rounded-3xl bg-muted/30 flex items-center justify-center text-muted-foreground">
                  <IconReceipt2 size={32} stroke={1.5} />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">No upcoming itineraries<br />found for this week.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-border/40 flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        <IconCalendarEvent size={24} stroke={1.5} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-foreground line-clamp-1">{booking.tour.titleEn}</p>
                        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground opacity-60">
                          <span className="flex items-center gap-1 text-primary"><IconUser size={10} /> {booking.user.name}</span>
                          <span className="flex items-center gap-1"><IconPhone size={10} /> {booking.user.mobile}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-600 ring-1 ring-inset ring-emerald-500/10">
                        <IconCircleCheck size={10} />
                        {booking.status}
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-widest tabular-nums">
                        {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <section className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 leading-none">Administrative Shortcuts</h3>
            </div>
            <div className="grid gap-3">
              <Link href="/categories" className="flex items-center justify-between p-4 rounded-2xl bg-[#5A2A13]/5 border border-[#5A2A13]/10 text-[#5A2A13] group transition-all hover:bg-[#5A2A13]/10 active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#5A2A13]">
                    <IconCategory size={18} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Marketplace Categories</span>
                </div>
                <IconArrowRight size={14} className="opacity-30 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/subcategories" className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 border border-purple-100/50 text-purple-900 group transition-all hover:bg-purple-100/80 active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-purple-600">
                    <IconHierarchy size={18} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Field Definitions</span>
                </div>
                <IconArrowRight size={14} className="opacity-30 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/products" className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 text-blue-900 group transition-all hover:bg-blue-100/80 active:scale-[0.98]">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-600">
                    <IconPackage size={18} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Product Catalog</span>
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
