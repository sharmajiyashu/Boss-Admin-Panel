"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  IconPackage,
  IconSearch,
  IconReload,
  IconCheck,
  IconX,
  IconEye,
  IconUser,
  IconMapPin,
  IconLoader2,
  IconPackageOff,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService, Product } from "@/lib/services/productService";
import { toast } from "react-toastify";
import Image from "next/image";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["products", page, statusFilter, searchTerm],
    queryFn: () =>
      productService.listAllProducts({
        page,
        limit,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: searchTerm || undefined,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => productService.approveProduct(id),
    onSuccess: () => {
      toast.success("Product approved successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve product");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => productService.rejectProduct(id),
    onSuccess: () => {
      toast.success("Product rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reject product");
    },
  });

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-600 ring-amber-500/10";
      case "approved": return "bg-emerald-50 text-emerald-600 ring-emerald-500/10";
      case "rejected": return "bg-red-50 text-red-600 ring-red-500/10";
      case "sold": return "bg-blue-50 text-blue-600 ring-blue-500/10";
      case "inactive": return "bg-gray-50 text-gray-600 ring-gray-500/10";
      default: return "bg-gray-50 text-gray-600 ring-gray-500/10";
    }
  };

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 font-sans">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#B5651D]/5 flex items-center justify-center text-[#B5651D]">
            <IconPackage size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Product Moderation</h1>
            <p className="text-[11px] font-medium text-muted-foreground/60">Review and approve seller listings before they go live safely.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 sm:flex-none">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within:text-[#B5651D] transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full sm:w-64 rounded-xl border border-border/50 bg-card/40 pl-9 pr-4 text-[11px] font-medium transition-all focus:border-[#B5651D]/50 focus:ring-4 focus:ring-[#B5651D]/5 outline-none"
            />
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-border/50 bg-card/40 text-muted-foreground hover:text-[#B5651D] transition-all disabled:opacity-50 active:scale-95"
          >
            <IconReload size={16} className={twMerge((isLoading || isRefetching) && "animate-spin")} />
          </button>

          <div className="flex items-center gap-1.5 bg-card/40 p-1 rounded-xl border border-border/50 overflow-x-auto max-w-full no-scrollbar">
            {["all", "pending", "approved", "rejected", "sold"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={twMerge(
                  "h-7 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                  statusFilter === status
                    ? "bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white shadow-md shadow-[#B5651D]/10"
                    : "text-muted-foreground hover:bg-white hover:text-[#B5651D]"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
            <IconLoader2 className="h-8 w-8 animate-spin text-[#B5651D]/20" />
            <p className="text-[11px] font-bold text-muted-foreground/30">Syncing products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-8 text-center rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
            <IconPackageOff size={40} className="text-muted-foreground/10" strokeWidth={1} />
            <p className="text-xs font-bold text-muted-foreground/50">No products matching the selected criteria</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/5 border-b border-border/30">
                      <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Product Item</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Pricing & Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Seller Details</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-4 text-right text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {products.map((item) => (
                      <tr key={item._id} className="group transition-colors hover:bg-muted/[0.15]">
                        <td className="px-8 py-3.5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 shrink-0 flex items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-[#B5651D]/5 group-hover:text-[#B5651D] transition-colors font-bold text-[10px] border border-border/30 overflow-hidden relative">
                              {item.media && item.media[0] ? (
                                <Image
                                  src={item.media[0].url}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <IconPackage size={20} stroke={1.5} />
                              )}
                            </div>
                            <div className="flex flex-col max-w-[200px]">
                              <span className="text-[13px] font-bold text-foreground leading-tight truncate">{item.name}</span>
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/30 capitalize">
                                <span>{item.category?.name}</span>
                                {item.subcategory && (
                                  <>
                                    <span className="opacity-30">•</span>
                                    <span>{item.subcategory.name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-[#B5651D]">₹{item.price.toLocaleString()}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                               <span className="text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <IconUser size={10} className="text-muted-foreground/40" />
                              <span className="text-[11px] font-medium text-foreground">{item.seller?.firstName} {item.seller?.lastName}</span>
                            </div>
                            <div className="flex items-center gap-1.5 opacity-60">
                              <span className="text-[9px] font-medium text-muted-foreground">{item.seller?.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={twMerge(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset uppercase",
                            getStatusClasses(item.status)
                          )}>
                            <div className="h-1 w-1 rounded-full bg-current" />
                            {item.status}
                          </span>
                        </td>
                        <td className="px-8 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:bg-white hover:text-[#B5651D] border border-transparent hover:border-border transition-all active:scale-95 shadow-none hover:shadow-sm" title="View Details">
                              <IconEye size={14} />
                            </button>
                            {item.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => approveMutation.mutate(item._id)}
                                  disabled={approveMutation.isPending}
                                  className="h-8 w-8 rounded-lg flex items-center justify-center text-emerald-500 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all active:scale-95 shadow-none hover:shadow-sm disabled:opacity-50"
                                  title="Approve"
                                >
                                  <IconCheck size={14} stroke={3} />
                                </button>
                                <button
                                  onClick={() => rejectMutation.mutate(item._id)}
                                  disabled={rejectMutation.isPending}
                                  className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all active:scale-95 shadow-none hover:shadow-sm disabled:opacity-50"
                                  title="Reject"
                                >
                                  <IconX size={14} stroke={3} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Grid View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((item) => (
                <div 
                  key={item._id}
                  className="bg-card rounded-2xl p-5 shadow-sm ring-1 ring-black/[0.04] space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden border border-border/30 flex items-center justify-center relative">
                        {item.media && item.media[0] ? (
                          <Image
                            src={item.media[0].url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <IconPackage size={20} className="text-muted-foreground/20" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-1">{item.name}</h3>
                        <p className="text-[10px] font-bold text-[#B5651D] mt-0.5">₹{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={twMerge(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-bold ring-1 ring-inset uppercase",
                      getStatusClasses(item.status)
                    )}>
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-2 py-3 border-y border-black/[0.03]">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Seller</span>
                      <span className="text-[10px] font-bold text-foreground">{item.seller?.firstName} {item.seller?.lastName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Category</span>
                      <span className="text-[10px] font-medium text-muted-foreground">{item.category?.name}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 h-9 rounded-xl bg-muted/50 text-[10px] font-bold text-foreground flex items-center justify-center gap-2">
                      <IconEye size={14} />
                      View
                    </button>
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveMutation.mutate(item._id)}
                          disabled={approveMutation.isPending}
                          className="flex-1 h-9 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center justify-center gap-2 border border-emerald-100 active:scale-95 disabled:opacity-50"
                        >
                          <IconCheck size={14} stroke={3} />
                          Approve
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(item._id)}
                          disabled={rejectMutation.isPending}
                          className="h-9 w-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 active:scale-95 disabled:opacity-50"
                        >
                          <IconX size={14} stroke={3} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

        {/* Premium Floating Pagination Bar */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md shadow-[0_-1px_10px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04]">
            <div className="text-[10px] font-extrabold text-muted-foreground/40 uppercase tracking-widest">
              Records {((page - 1) * limit) + 1} — {Math.min(page * limit, total)} <span className="mx-2 opacity-50">/</span> TOTAL {total}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground ring-1 ring-black/[0.06] transition-all hover:bg-card disabled:opacity-20 active:scale-95"
              >
                <IconChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    if (totalPages <= 5) return true;
                    return Math.abs(p - page) <= 2 || p === 1 || p === totalPages;
                  })
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-muted-foreground/30 px-1">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={twMerge(
                          "h-8 min-w-[32px] rounded-xl px-2 text-[11px] font-bold transition-all",
                          page === p
                            ? "bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white shadow-lg shadow-[#B5651D]/20 animate-in zoom-in-90"
                            : "text-muted-foreground ring-1 ring-transparent hover:bg-card hover:text-[#B5651D] hover:ring-black/[0.06]"
                        )}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground ring-1 ring-black/[0.06] transition-all hover:bg-card disabled:opacity-20 active:scale-95"
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
  );
}
