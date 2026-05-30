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
  IconInfoCircle,
  IconEdit,
  IconTrash,
  IconAlertCircle
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
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  const [selectedEditProduct, setSelectedEditProduct] = useState<Product | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected' | 'sold' | 'inactive'>("pending");

  const openDetails = (product: Product) => {
    setSelectedProduct(product);
    setActiveImageUrl(product.media?.[0]?.url || null);
    setIsDetailsOpen(true);
  };

  const openEdit = (product: Product) => {
    setSelectedEditProduct(product);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditDescription(product.description || "");
    setEditStatus(product.status);
    setIsEditOpen(true);
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => productService.deleteAllProducts(),
    onSuccess: () => {
      toast.success("All products deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDeleteAllOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete all products");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      toast.success("Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsEditOpen(false);
      setSelectedEditProduct(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product");
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
      <div className="space-y-6 animate-in fade-in duration-300 pb-8 font-sans">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Listings</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Review and approve seller listings before they go live safely.
            </p>
          </div>

          {products.length > 0 && (
            <button
              onClick={() => setIsDeleteAllOpen(true)}
              className="h-9 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-500/10 hover:opacity-95 active:scale-95 transition-all outline-none border-none sm:self-end"
            >
              <IconTrash size={14} />
              Delete All
            </button>
          )}
        </div>

        {/* Filter Panel */}
        <div className="flex flex-col gap-4 p-4 rounded-2xl border border-border bg-white shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border border-border bg-muted/10 pl-9 pr-4 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-muted/20 p-1.5 rounded-xl border border-border/50 overflow-x-auto max-w-full no-scrollbar shadow-inner">
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
                    "h-8 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-1.5",
                    statusFilter === tab.id
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <tab.icon size={12} stroke={2.5} />
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-white text-muted-foreground hover:text-[#B5651D] transition-all disabled:opacity-50 active:scale-95 shadow-sm"
            >
              <IconReload size={16} className={twMerge((isLoading || isRefetching) && "animate-spin")} />
            </button>
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
                                <IconUser size={15} className="text-muted-foreground/60" />
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
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openDetails(item)}
                                className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground/40 hover:bg-foreground hover:text-background border border-transparent transition-all active:scale-95 shadow-none hover:shadow-lg"
                                title="View Product Dossier"
                              >
                                <IconEye size={18} stroke={2} />
                              </button>

                              <button
                                onClick={() => openEdit(item)}
                                className="h-10 w-10 rounded-xl flex items-center justify-center text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all active:scale-95 shadow-none hover:shadow-sm"
                                title="Edit Product"
                              >
                                <IconEdit size={18} stroke={2} />
                              </button>

                              <button
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this listing?")) {
                                    deleteMutation.mutate(item._id);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                className="h-10 w-10 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all active:scale-95 shadow-none hover:shadow-sm disabled:opacity-50"
                                title="Delete Product"
                              >
                                <IconTrash size={18} stroke={2} />
                              </button>

                              {item.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => approveMutation.mutate(item._id)}
                                    disabled={approveMutation.isPending}
                                    className="h-10 w-10 rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all active:scale-95 shadow-none hover:shadow-sm disabled:opacity-50"
                                    title="Approve"
                                  >
                                    <IconCheck size={18} stroke={3} />
                                  </button>
                                  <button
                                    onClick={() => rejectMutation.mutate(item._id)}
                                    disabled={rejectMutation.isPending}
                                    className="h-10 w-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all active:scale-95 shadow-none hover:shadow-sm disabled:opacity-50"
                                    title="Reject"
                                  >
                                    <IconX size={18} stroke={3} />
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

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openDetails(item)}
                        className="flex-1 h-10 rounded-xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                      >
                        <IconEye size={16} stroke={3} />
                        View
                      </button>

                      <button
                        onClick={() => openEdit(item)}
                        className="h-10 px-3.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <IconEdit size={16} stroke={3} />
                        Edit
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this listing?")) {
                            deleteMutation.mutate(item._id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 active:scale-95 transition-all disabled:opacity-50"
                        title="Delete Product"
                      >
                        <IconTrash size={16} stroke={3} />
                      </button>

                      {item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => approveMutation.mutate(item._id)}
                            disabled={approveMutation.isPending}
                            className="flex-1 h-10 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-bold flex items-center justify-center gap-2 border border-emerald-100 active:scale-95 disabled:opacity-50"
                          >
                            <IconCheck size={16} stroke={3} />
                            Approve
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(item._id)}
                            disabled={rejectMutation.isPending}
                            className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center border border-red-100 active:scale-95 disabled:opacity-50"
                          >
                            <IconX size={16} stroke={3} />
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
          <div className="pagination-container">
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
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-lg outline-none animate-in zoom-in-95 fade-in duration-200">
            {selectedProduct && (
              <div className="flex flex-col md:flex-row h-[80vh] max-h-[700px] w-full">
                <Dialog.Title className="sr-only">Product Details: {selectedProduct.name}</Dialog.Title>
                <Dialog.Description className="sr-only">Detailed dossier for product moderation, including merchant information and listing evidence.</Dialog.Description>

                {/* Left Side: Images */}
                <div className="w-full md:w-[45%] bg-slate-50 p-6 flex flex-col h-full border-b md:border-b-0 md:border-r border-slate-200">
                  <div className="flex-1 min-h-0 relative w-full rounded-xl overflow-hidden bg-white border border-slate-200/80 flex items-center justify-center">
                    {activeImageUrl ? (
                      <Image
                        src={activeImageUrl}
                        alt={selectedProduct.name}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <IconPackage size={64} stroke={1.5} />
                        <p className="text-xs font-semibold text-slate-500 mt-2">No Image Provided</p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Evidence Gallery */}
                  {selectedProduct.media && selectedProduct.media.length > 0 && (
                    <div className="mt-5 shrink-0">
                      <label className="text-xs font-semibold text-slate-500 block mb-2">Evidence Gallery ({selectedProduct.media.length})</label>
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {selectedProduct.media.map((m, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setActiveImageUrl(m.url)}
                            className={twMerge(
                              "h-12 w-12 rounded-lg bg-white shrink-0 border overflow-hidden relative transition-all",
                              activeImageUrl === m.url
                                ? "border-amber-600 ring-2 ring-amber-600/20 scale-95"
                                : "border-slate-200 opacity-60 hover:opacity-100"
                            )}
                          >
                            <Image src={m.url} alt="" fill className="object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Details */}
                <div className="w-full md:w-[55%] flex flex-col h-full bg-white">
                  {/* Header */}
                  <div className="p-6 pb-4 border-b border-slate-100 flex shrink-0 justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={twMerge(
                          "px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider text-white",
                          (getStatusClasses(selectedProduct.status).split(' ')[1] || "bg-slate-500").replace('text-', 'bg-')
                        )}>
                          {selectedProduct.status}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase tracking-wider border border-slate-200/50">
                          ID: {selectedProduct._id.slice(-8)}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{selectedProduct.name}</h2>
                    </div>
                    <Dialog.Close className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0">
                      <IconX size={18} />
                    </Dialog.Close>
                  </div>

                  {/* Scrollable details */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar font-sans">
                    {/* Valuation & Inventory */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                          <IconTag size={15} className="text-amber-600" />
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Valuation</p>
                        </div>
                        <p className="text-base font-bold text-slate-900">₹{selectedProduct.price.toLocaleString()}</p>
                      </div>
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                          <IconPackage size={15} className="text-blue-500" />
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Inventory</p>
                        </div>
                        <p className="text-base font-bold text-slate-900">{selectedProduct.stock || 1} Units</p>
                      </div>
                    </div>

                    {/* Classification */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Classification</label>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold uppercase tracking-wider border border-blue-100">
                          {selectedProduct.category.name}
                        </span>
                        {selectedProduct.subcategory && (
                          <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold uppercase tracking-wider border border-amber-100">
                            {selectedProduct.subcategory.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Technical Description</label>
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                        {selectedProduct.description || "No description provided by seller."}
                      </p>
                    </div>

                    {/* Seller Origin */}
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">Merchant Origin</label>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {(selectedProduct.seller.firstName || "U")[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{selectedProduct.seller.firstName} {selectedProduct.seller.lastName}</p>
                          <p className="text-[10px] text-slate-500 truncate">{selectedProduct.seller.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    {selectedProduct.location && (
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">Listing Location</label>
                        <div className="space-y-1 text-xs text-slate-600">
                          {selectedProduct.location.address && (
                            <p className="truncate"><span className="text-slate-400 font-medium">Address:</span> {selectedProduct.location.address}</p>
                          )}
                          {(selectedProduct.location.city || selectedProduct.location.state) && (
                            <p><span className="text-slate-400 font-medium">City/State:</span> {selectedProduct.location.city || "—"}{selectedProduct.location.state ? `, ${selectedProduct.location.state}` : ""}</p>
                          )}
                          {selectedProduct.location.zipcode && (
                            <p><span className="text-slate-400 font-medium">Zipcode:</span> {selectedProduct.location.zipcode}</p>
                          )}
                          {selectedProduct.location.lat !== undefined && selectedProduct.location.lng !== undefined && (
                            <p><span className="text-slate-400 font-medium">Coordinates:</span> {selectedProduct.location.lat}, {selectedProduct.location.lng}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0 rounded-b-2xl">
                    <div className="flex gap-2">
                      {selectedProduct.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              approveMutation.mutate(selectedProduct._id);
                              setIsDetailsOpen(false);
                            }}
                            disabled={approveMutation.isPending}
                            className="h-9 px-4 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <IconCheck size={14} stroke={2.5} />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              rejectMutation.mutate(selectedProduct._id);
                              setIsDetailsOpen(false);
                            }}
                            disabled={rejectMutation.isPending}
                            className="h-9 px-4 rounded-lg bg-white text-rose-600 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-50 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <IconX size={14} stroke={2.5} />
                            Reject
                          </button>
                        </>
                      )}
                      {selectedProduct.status !== 'pending' && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                          <IconInfoCircle size={14} />
                          Status is final
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-colors">
                        <IconExternalLink size={16} />
                      </button>
                      <button className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-white hover:text-slate-600 transition-colors">
                        <IconMessageCircle size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Product Edit Modal */}
      <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-full max-w-md translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-[32px] border-0 bg-card p-0 shadow-2xl outline-none ring-1 ring-black/[0.1] animate-in zoom-in-95 fade-in duration-200">
            {selectedEditProduct && (
              <div className="flex flex-col p-6 font-sans space-y-6">
                <div className="flex items-center justify-between border-b border-border/30 pb-4">
                  <Dialog.Title className="text-lg font-black text-foreground">Edit Listing Details</Dialog.Title>
                  <Dialog.Close className="h-8 w-8 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 transition-all">
                    <IconX size={16} />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="sr-only">Form to update listing name, price, description and status.</Dialog.Description>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateMutation.mutate({
                    id: selectedEditProduct._id,
                    data: {
                      name: editName,
                      price: editPrice,
                      description: editDescription,
                      status: editStatus
                    }
                  });
                }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block">Listing Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-muted/10 px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border border-border bg-muted/10 px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block">Description</label>
                    <textarea
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/10 p-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40 resize-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest block">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="sold">Sold</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/30">
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="h-10 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white shadow-lg shadow-[#B5651D]/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                    >
                      {updateMutation.isPending ? (
                        <IconLoader2 size={14} className="animate-spin" />
                      ) : (
                        <IconDeviceFloppy size={14} />
                      )}
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete All Confirmation Modal */}
      <Dialog.Root open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-[101] w-full max-w-[300px] translate-x-[-50%] translate-y-[-50%] rounded-2xl border-0 bg-white p-6 shadow-2xl ring-1 ring-slate-100 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shadow-inner animate-pulse">
                <IconAlertCircle size={24} className="text-red-500" />
              </div>
              <div>
                <Dialog.Title className="text-sm font-bold text-slate-800">Purge ALL Products?</Dialog.Title>
                <Dialog.Description className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-1">
                  WARNING: This will permanently delete all listing data. This action is irreversible.
                </Dialog.Description>
              </div>

              <div className="flex gap-2 w-full pt-2">
                <Dialog.Close className="h-9 flex-1 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 ring-1 ring-slate-100 transition-all hover:bg-slate-100">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={() => deleteAllMutation.mutate()}
                  disabled={deleteAllMutation.isPending}
                  className="flex-1 h-9 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {deleteAllMutation.isPending ? <IconLoader2 size={16} className="animate-spin" /> : "Purge All"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
