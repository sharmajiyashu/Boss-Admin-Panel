"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconUsers,
  IconReload,
  IconArrowRight,
  IconUser,
  IconCalendarStats,
  IconCategory,
  IconPackage,
  IconWallet,
  IconTrendingUp,
  IconShoppingBag,
  IconClock,
  IconCircleCheck,
  IconAlertCircle,
  IconBan,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardService, DashboardResponse } from "@/lib/services/dashboardService";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery<DashboardResponse>({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
  });

  const stats = response?.data;

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users.total || 0,
      icon: IconUsers,
      color: "text-[#B5651D]",
      bg: "bg-[#B5651D]/5",
      border: "border-[#B5651D]/10",
      trend: "+12.5% vs last month",
    },
    {
      title: "Active Products",
      value: stats?.products.approved || 0,
      icon: IconPackage,
      color: "text-emerald-600",
      bg: "bg-emerald-500/5",
      border: "border-emerald-500/10",
      trend: "+8.2% vs last month",
    },
    {
      title: "Global Categories",
      value: stats?.categories.total || 0,
      icon: IconCategory,
      color: "text-blue-600",
      bg: "bg-blue-500/5",
      border: "border-blue-500/10",
      trend: "+4.1% vs last month",
    },
    {
      title: "Today's Revenue",
      value: `₹${(stats?.revenue.today || 0).toLocaleString()}`,
      icon: IconWallet,
      color: "text-amber-600",
      bg: "bg-amber-500/5",
      border: "border-amber-500/10",
      trend: "+15.4% vs yesterday",
    },
  ];

  const productStatusStats = [
    { label: "Approved", value: stats?.products.approved || 0, icon: IconCircleCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Pending", value: stats?.products.pending || 0, icon: IconClock, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Rejected", value: stats?.products.rejected || 0, icon: IconAlertCircle, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Inactive", value: stats?.products.inactive || 0, icon: IconBan, color: "text-gray-500", bg: "bg-gray-50" },
  ];

  const recentProducts = stats?.recentProducts || [];
  const revenueData = stats?.revenue.analysis || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 font-sans max-w-[1600px] mx-auto">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#B5651D]/5 flex items-center justify-center text-[#B5651D]">
            <IconCalendarStats size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">{t("dashboard.title")}</h1>
            <p className="text-[11px] font-medium text-muted-foreground/60">Real-time platform metrics and analysis from BOSS ecosystem.</p>
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
      <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter text-foreground tabular-nums">
                  {stat.value}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-0.5">
                  <IconTrendingUp size={10} /> {stat.trend.split(' ')[0]}
                </span>
                <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest leading-none">
                  {stat.trend?.split(' ').slice(1).join(' ')}
                </p>
              </div>
            </div>

            <div className={twMerge(
              "absolute -right-8 -bottom-8 h-32 w-32 rounded-full opacity-[0.05] blur-2xl transition-all duration-500 group-hover:scale-150",
              stat.bg
            )} />
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Analysis Chart */}
        <section className="lg:col-span-2 rounded-[2.5rem] border border-border bg-card p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">Revenue Analysis</h2>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">Last 7 days performance</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700">Live Intake</span>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  dy={10}
                  tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { weekday: 'short' })}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc', radius: 12 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 border border-border rounded-2xl shadow-xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                            {payload[0]?.payload?.date ? new Date(payload[0].payload.date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '---'}
                          </p>
                          <p className="text-lg font-black text-foreground text-emerald-600">
                            ₹{payload[0]?.value?.toLocaleString() || '0'}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#B5651D"
                  radius={[10, 10, 10, 10]}
                  barSize={40}
                >
                  {revenueData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === revenueData.length - 1 ? '#B5651D' : '#B5651D40'}
                      className="transition-all duration-300 hover:opacity-100"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Product Status Breakdown */}
        <section className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm h-full">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tight text-foreground">Status Breakdown</h2>
          </div>
          <div className="space-y-4">
            {productStatusStats.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-border/40 hover:border-border transition-all group">
                <div className="flex items-center gap-4">
                  <div className={twMerge("h-10 w-10 rounded-xl flex items-center justify-center transition-all", item.bg, item.color)}>
                    <item.icon size={20} stroke={2.5} />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-foreground">{item.label}</span>
                    <p className="text-[9px] font-bold text-muted-foreground/50">Total inventory volume</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black tracking-tight text-foreground tabular-nums">{item.value}</span>
                  <div className="h-1 w-12 bg-muted rounded-full overflow-hidden mt-1">
                    <div
                      className={twMerge("h-full", item.bg.replace('/5', ''), item.color.replace('text-', 'bg-'))}
                      style={{ width: `${stats?.products.total ? (item.value / stats.products.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border/40">
            <div className="p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-widest text-[#B5651D] mb-1">Catalog Insight</p>
                <p className="text-[11px] font-bold text-[#B5651D]/80 leading-relaxed">
                  Overall catalog is <span className="font-black">{(stats?.products.total ? (stats.products.approved / stats.products.total) * 100 : 0).toFixed(1)}%</span> healthy and approved.
                </p>
              </div>
              <IconShoppingBag className="absolute -right-2 -bottom-2 h-12 w-12 opacity-[0.05] group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 px-2">
        {/* Recent Product Catalog Activity */}
        <section className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black tracking-tight text-foreground">Recent Catalog Activity</h2>
              <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1">Latest items submitted for review</p>
            </div>
            <Link href="/products" className="h-8 px-4 rounded-xl bg-muted/50 border border-border text-[9px] font-black uppercase tracking-widest text-foreground hover:bg-muted transition-all flex items-center gap-2">
              Review Board <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                  <th className="px-4 py-2">Item Details</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Seller</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold">
                {recentProducts.map((product) => (
                  <tr key={product._id} className="group hover:bg-muted/30 transition-all rounded-2xl overflow-hidden">
                    <td className="px-4 py-4 rounded-l-2xl border-y border-l border-border/30 group-hover:border-border/60 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden shrink-0 border border-border/40">
                          {product.media?.[0]?.url ? (
                            <img src={product.media[0].url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground/30">
                              <IconPackage size={18} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground truncate font-black">{product.name}</p>
                          <p className="text-[8px] uppercase tracking-widest text-muted-foreground/60">{product.subcategory?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-y border-border/30 group-hover:border-border/60 transition-all">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-[8px] font-black uppercase tracking-widest">
                        {product.category?.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 border-y border-border/30 group-hover:border-border/60 transition-all">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-[8px] font-black uppercase">
                          {product.seller?.firstName?.[0]}{product.seller?.lastName?.[0]}
                        </div>
                        <span className="text-muted-foreground truncate">{product.seller?.firstName} {product.seller?.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-y border-border/30 group-hover:border-border/60 transition-all text-right tabular-nums">
                      <span className="font-black text-foreground">₹{product.price?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4 border-y border-border/30 group-hover:border-border/60 transition-all text-center">
                      <div className={twMerge(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider ring-1 ring-inset",
                        product.status === "approved" ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10" :
                          product.status === "pending" ? "bg-amber-50 text-amber-600 ring-amber-500/10" :
                            "bg-rose-50 text-rose-600 ring-rose-500/10"
                      )}>
                        <div className={twMerge("h-1 w-1 rounded-full bg-current", product.status === "approved" && "animate-pulse")} />
                        {product.status}
                      </div>
                    </td>
                    <td className="px-4 py-4 rounded-r-2xl border-y border-r border-border/30 group-hover:border-border/60 transition-all text-muted-foreground/40 tabular-nums">
                      {new Date(product.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

