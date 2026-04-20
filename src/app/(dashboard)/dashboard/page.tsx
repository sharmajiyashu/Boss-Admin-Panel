"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  IconUsers,
  IconReload,
  IconCategory,
  IconPackage,
  IconTrendingUp,
  IconShoppingBag,
  IconChartBar,
  IconInfoCircle,
  IconCurrencyDollar,
  IconListDetails,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import { useLanguage } from "@/contexts/LanguageContext";
import { dashboardService, type DashboardStats } from "@/lib/services/dashboardService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";

export default function DashboardPage() {
  const { t } = useLanguage();

  const { data: stats, isLoading, refetch, isRefetching } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
  });

  // --------------- Derived data from API ---------------

  // Revenue trend: compare last two days from revenue.analysis (7-day array)
  const revenueTrend = React.useMemo(() => {
    const analysis = stats?.revenue?.analysis;
    if (!analysis || analysis.length < 2) return "Stable";
    const last = analysis[analysis.length - 1]?.revenue ?? 0;
    const prev = analysis[analysis.length - 2]?.revenue ?? 0;
    if (prev === 0) return last > 0 ? "+100%" : "No change";
    const diff = ((last - prev) / prev) * 100;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}% vs yesterday`;
  }, [stats]);

  // Total revenue across 7-day analysis window
  const weeklyRevenue = React.useMemo(() => {
    return stats?.revenue?.analysis?.reduce((sum, d) => sum + d.revenue, 0) ?? 0;
  }, [stats]);

  // Stat cards — mapped 1:1 to backend fields
  const statCards = [
    {
      title: "Today's Revenue",
      value: `₹ ${(stats?.revenue?.today ?? 0).toLocaleString()}`,
      icon: IconCurrencyDollar,
      gradient: "var(--purple-gradient-pink)",
      trend: revenueTrend,
    },
    {
      title: "Total Products",
      value: (stats?.products?.total ?? 0).toLocaleString(),
      icon: IconShoppingBag,
      gradient: "var(--purple-gradient-blue)",
      trend: `${stats?.products?.pending ?? 0} pending review`,
    },
    {
      title: "Total Users",
      value: (stats?.users?.total ?? 0).toLocaleString(),
      icon: IconUsers,
      gradient: "var(--purple-gradient-green)",
      trend: "Registered platform users",
    },
    {
      title: "Categories",
      value: `${stats?.categories?.total ?? 0} + ${stats?.subcategories?.total ?? 0}`,
      icon: IconCategory,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      trend: `${(stats?.categories?.total ?? 0) + (stats?.subcategories?.total ?? 0)} total taxonomy items`,
    },
  ];

  // Product status distribution for Pie chart
  const productDistribution = [
    { name: "Approved", value: stats?.products?.approved ?? 0, color: "#07cdae" },
    { name: "Pending", value: stats?.products?.pending ?? 0, color: "#fe7096" },
    { name: "Rejected", value: stats?.products?.rejected ?? 0, color: "#90caf9" },
    { name: "Sold", value: stats?.products?.sold ?? 0, color: "#da8cff" },
    { name: "Inactive", value: stats?.products?.inactive ?? 0, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  // Revenue bar chart from revenue.analysis (7 days)
  const revenueBarData =
    stats?.revenue?.analysis?.map((item) => ({
      name: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Revenue: item.revenue,
    })) ?? [];

  // Recent products table
  const recentProducts = stats?.recentProducts?.slice(0, 5) ?? [];

  // --------------- Loading skeleton ---------------
  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 font-sans max-w-[1600px] mx-auto animate-pulse select-none">
        <div className="h-10 w-48 rounded-xl bg-slate-100" />
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 rounded-[16px] bg-slate-100" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-[430px] rounded-[16px] bg-slate-100" />
          <div className="h-[430px] rounded-[16px] bg-slate-100" />
        </div>
        <div className="h-[320px] rounded-[16px] bg-slate-100" />
      </div>
    );
  }

  // --------------- Render ---------------
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 font-sans max-w-[1600px] mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#b66dff] flex items-center justify-center text-white shadow-lg shadow-[#b66dff]/25">
            <IconChartBar size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Dashboard</h1>
            <p className="text-[11px] font-medium text-slate-400">
              Weekly revenue: ₹ {weeklyRevenue.toLocaleString()}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all text-[11px] font-bold text-slate-500 active:scale-95 disabled:opacity-50"
        >
          <IconReload size={14} className={twMerge("text-[#b66dff]", isRefetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {/* Stat Cards Grid */}
      <section className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-[16px] p-7 text-white shadow-xl transition-all duration-500 hover:-translate-y-1"
            style={{ background: stat.gradient }}
          >
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[12px] font-bold opacity-90 uppercase tracking-wide mb-2">{stat.title}</h3>
                  <p className="text-3xl font-black tracking-tight mb-4">{stat.value}</p>
                </div>
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <stat.icon size={24} />
                </div>
              </div>
              <p className="text-[10px] font-bold opacity-75">{stat.trend}</p>
            </div>
            <div className="absolute -right-8 -bottom-8 h-44 w-44 rounded-full bg-white/10 blur-2xl group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -left-12 -top-12 h-44 w-44 rounded-full bg-black/5 blur-2xl" />
          </div>
        ))}
      </section>

      {/* Product Status Detail Cards */}
      <section className="grid gap-4 grid-cols-2 md:grid-cols-5">
        {[
          { label: "Approved", value: stats?.products?.approved ?? 0, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200/50" },
          { label: "Pending", value: stats?.products?.pending ?? 0, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200/50" },
          { label: "Rejected", value: stats?.products?.rejected ?? 0, color: "text-rose-600", bg: "bg-rose-50", ring: "ring-rose-200/50" },
          { label: "Sold", value: stats?.products?.sold ?? 0, color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-200/50" },
          { label: "Inactive", value: stats?.products?.inactive ?? 0, color: "text-slate-600", bg: "bg-slate-50", ring: "ring-slate-200/50" },
        ].map((item) => (
          <div
            key={item.label}
            className={twMerge("rounded-2xl p-5 ring-1", item.bg, item.ring, "transition-all hover:shadow-md")}
          >
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{item.label}</p>
            <p className={twMerge("text-2xl font-black tabular-nums", item.color)}>{item.value}</p>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Bar Chart — revenue.analysis (7 days) */}
        <section className="lg:col-span-2 rounded-[16px] bg-white p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-800">Revenue Analysis (7 Days)</h2>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#da8cff]" />
              <span className="text-[10px] font-bold text-slate-400">Daily Revenue</span>
            </div>
          </div>

          <div className="h-[350px] w-full">
            {revenueBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueBarData} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#cbd5e1" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 700, fill: "#cbd5e1" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
                    formatter={(value) => [`₹ ${Number(value).toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="Revenue" fill="#da8cff" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm font-bold">
                No revenue data available
              </div>
            )}
          </div>
        </section>

        {/* Product Distribution Pie — products.{approved,pending,rejected,sold,inactive} */}
        <section className="rounded-[16px] bg-white p-8 shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Product Distribution</h2>
          <div className="flex-1 h-[250px] w-full relative">
            {productDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={productDistribution} innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                    {productDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm font-bold">
                No products yet
              </div>
            )}
          </div>
          <div className="space-y-3 pt-4">
            {productDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-[12px] font-medium text-slate-500">{item.name}</span>
                </div>
                <span className="text-[12px] font-black text-slate-600 tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Recent Products Table — recentProducts (last 5, populated seller/category/subcategory) */}
      <section className="rounded-[16px] bg-white p-8 shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-slate-800">Recent Products</h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Last {recentProducts.length} entries
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <th className="pb-4 pr-4">Seller</th>
                <th className="pb-4 pr-4">Product</th>
                <th className="pb-4 pr-4">Category</th>
                <th className="pb-4 text-center">Status</th>
                <th className="pb-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-slate-300 font-bold">
                    No recent products
                  </td>
                </tr>
              ) : (
                recentProducts.map((product: any) => (
                  <tr key={product._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="text-[13px] font-bold text-slate-700">
                        {product.seller?.firstName ?? "Unknown"} {product.seller?.lastName ?? ""}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="text-[13px] font-medium text-slate-600">{product.name ?? "Untitled"}</span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-500">{product.category?.name ?? "—"}</span>
                        {product.subcategory?.name && (
                          <span className="text-[9px] font-medium text-slate-400">{product.subcategory.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={twMerge(
                          "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider",
                          product.status === "approved"
                            ? "bg-emerald-400 text-white shadow-lg shadow-emerald-400/20"
                            : product.status === "pending"
                              ? "bg-amber-400 text-white shadow-lg shadow-amber-400/20"
                              : product.status === "sold"
                                ? "bg-purple-400 text-white shadow-lg shadow-purple-400/20"
                                : "bg-rose-400 text-white shadow-lg shadow-rose-400/20"
                        )}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-[11px] font-bold text-slate-400">
                        {new Date(product.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
