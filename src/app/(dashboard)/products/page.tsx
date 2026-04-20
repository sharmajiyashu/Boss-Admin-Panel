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
  IconClockHour4,
  IconStack2,
  IconHistory,
  IconArrowRight,
  IconDeviceFloppy,
  IconMessageCircle,
  IconExternalLink,
  IconTag,
  IconInfoCircle
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
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

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const openDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

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
    <>
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

            <div className="flex items-center gap-1.5 bg-card/40 p-1.5 rounded-2xl border border-border/50 overflow-x-auto max-w-full no-scrollbar shadow-inner">
              {[
                { id: "all", label: "All Items", icon: IconStack2 },
                { id: "pending", label: "Moderation", icon: IconClockHour4 },
                { id: "approved", label: "Live", icon: IconCheck },
                { id: "rejected", label: "Rejected", icon: IconX },
                { id: "sold", label: "Archive", icon: IconHistory }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={twMerge(
                    "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                    statusFilter === tab.id
                      ? "bg-foreground text-background shadow-lg"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <tab.icon size={14} stroke={2.5} />
                  {tab.label}
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
                              <button
                                onClick={() => openDetails(item)}
                                className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground/40 hover:bg-foreground hover:text-background border border-transparent transition-all active:scale-95 shadow-none hover:shadow-lg"
                                title="View Product Dossier"
                              >
                                <IconEye size={16} stroke={2} />
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
                      <button
                        onClick={() => openDetails(item)}
                        className="flex-1 h-10 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                      >
                        <IconEye size={14} stroke={3} />
                        View Dossier
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

      {/* Product Details Modal */}
      <Dialog.Root open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-[32px] border-0 bg-card p-0 shadow-2xl outline-none ring-1 ring-black/[0.1] animate-in zoom-in-95 fade-in duration-200">
            {selectedProduct && (
              <div className="flex flex-col h-[85vh] md:h-auto max-h-[90vh]">
                <Dialog.Title className="sr-only">Product Details: {selectedProduct.name}</Dialog.Title>
                <Dialog.Description className="sr-only">Detailed dossier for product moderation, including merchant information and listing evidence.</Dialog.Description>

                {/* Hero Image Section */}
                <div className="relative h-64 md:h-80 bg-muted shrink-0">
                  {selectedProduct.media?.[0]?.url ? (
                    <Image
                      src={selectedProduct.media[0].url}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground/20 bg-muted/40">
                      <IconPackage size={80} stroke={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <Dialog.Close className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xl hover:bg-black/40 transition-all z-20">
                    <IconX size={20} />
                  </Dialog.Close>

                  <div className="absolute bottom-6 left-8 right-8 z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={twMerge(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white ring-1 ring-white/20",
                        (getStatusClasses(selectedProduct.status).split(' ')[1] || "bg-muted").replace('text-', 'bg-')
                      )}>
                        {selectedProduct.status}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white ring-1 ring-white/10">
                        ID: {selectedProduct._id.slice(-8)}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">{selectedProduct.name}</h2>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Core Info */}
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest block mb-2">Technical Description</label>
                        <p className="text-sm font-medium text-foreground/80 leading-relaxed bg-muted/30 p-4 rounded-2xl border border-border/30">
                          {selectedProduct.description || "No description provided by seller."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-border/50 bg-card shadow-sm">
                          <IconTag size={16} className="text-[#B5651D] mb-2" />
                          <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Valuation</p>
                          <p className="text-lg font-black text-foreground">₹{selectedProduct.price.toLocaleString()}</p>
                        </div>
                        <div className="p-4 rounded-2xl border border-border/50 bg-card shadow-sm">
                          <IconPackage size={16} className="text-blue-500 mb-2" />
                          <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Inventory</p>
                          <p className="text-lg font-black text-foreground">{selectedProduct.stock || 1} Units</p>
                        </div>
                      </div>
                    </div>

                    {/* Side Panel: Seller & Origin */}
                    <div className="space-y-6">
                      <div className="p-6 rounded-[24px] bg-muted/20 border border-border/50 relative overflow-hidden group">
                        <IconUser className="absolute -right-2 -top-2 h-16 w-16 text-black/[0.03] group-hover:scale-110 transition-transform" />
                        <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest block mb-4">Merchant Origin</label>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-[#B5651D] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-[#B5651D]/20">
                            {(selectedProduct.seller.firstName || "U")[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-foreground truncate">{selectedProduct.seller.firstName} {selectedProduct.seller.lastName}</p>
                            <p className="text-[10px] font-bold text-muted-foreground/60 truncate">{selectedProduct.seller.email}</p>
                          </div>
                        </div>
                        <button className="w-full mt-4 h-9 rounded-xl bg-card border border-border text-[9px] font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center justify-center gap-2">
                          Inspector Merchant Profile <IconArrowRight size={14} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest block px-1">Classification</label>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest ring-1 ring-blue-100">
                            {selectedProduct.category.name}
                          </span>
                          {selectedProduct.subcategory && (
                            <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-widest ring-1 ring-purple-100">
                              {selectedProduct.subcategory.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Preview */}
                  {selectedProduct.media.length > 1 && (
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest block">Evidence Gallery ({selectedProduct.media.length} items)</label>
                      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {selectedProduct.media.map((m, i) => (
                          <div key={i} className="h-24 w-24 rounded-2xl bg-muted shrink-0 border border-border/50 overflow-hidden relative group cursor-zoom-in">
                            <Image src={m.url} alt="" fill className="object-cover group-hover:scale-110 transition-transform" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="p-8 bg-muted/30 border-t border-border flex items-center justify-between gap-4 shrink-0 rounded-b-[32px]">
                  <div className="flex gap-3">
                    {selectedProduct.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            approveMutation.mutate(selectedProduct._id);
                            setIsDetailsOpen(false);
                          }}
                          disabled={approveMutation.isPending}
                          className="h-12 px-8 rounded-2xl bg-emerald-600 text-white text-[12px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-600/10 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <IconCheck size={18} stroke={3} />
                          Authorize Listing
                        </button>
                        <button
                          onClick={() => {
                            rejectMutation.mutate(selectedProduct._id);
                            setIsDetailsOpen(false);
                          }}
                          disabled={rejectMutation.isPending}
                          className="h-12 px-8 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 text-[12px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-100 active:scale-95 transition-all disabled:opacity-50"
                        >
                          <IconX size={18} stroke={3} />
                          Decline Submission
                        </button>
                      </>
                    )}
                    {selectedProduct.status !== 'pending' && (
                      <div className="flex items-center gap-2 text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest">
                        <IconInfoCircle size={16} />
                        Listing status is final. No further direct moderation available.
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button className="h-12 w-12 rounded-2xl border border-border flex items-center justify-center text-muted-foreground hover:bg-white hover:border-[#B5651D] hover:text-[#B5651D] transition-all">
                      <IconExternalLink size={20} />
                    </button>
                    <button className="h-12 w-12 rounded-2xl border border-border flex items-center justify-center text-muted-foreground hover:bg-white hover:text-[#B5651D] hover:text-[#B5651D] transition-all">
                      <IconMessageCircle size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
