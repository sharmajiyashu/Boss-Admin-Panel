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
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

interface Product {
  id: number;
  title: string;
  price: string;
  category: string;
  subcategory: string;
  seller: string;
  location: string;
  status: "pending" | "approved" | "rejected" | "sold";
  createdAt: string;
}

const MOCK_PRODUCTS: Product[] = [
  { id: 1, title: "iPhone 15 Pro Max - 256GB Platinum", price: "₹1,24,900", category: "Electronics", subcategory: "Smartphones", seller: "Rajesh Kumar", location: "Mumbai, MH", status: "pending", createdAt: "2024-03-24 10:15" },
  { id: 2, title: "BMW 3 Series 2021 Luxury Line", price: "₹42,50,000", category: "Vehicles", subcategory: "Cars", seller: "Anjali Singh", location: "Bangalore, KA", status: "approved", createdAt: "2024-03-23 14:20" },
  { id: 3, title: "2 BHK Flat in Cyber City", price: "₹85,00,000", category: "Property", subcategory: "Apartments", seller: "Karan Johar", location: "Gurgaon, HR", status: "pending", createdAt: "2024-03-23 09:45" },
  { id: 4, title: "Sony PS5 with 2 Controllers", price: "₹45,000", category: "Electronics", subcategory: "Consoles", seller: "Vikram Sen", location: "Kolkata, WB", status: "rejected", createdAt: "2024-03-22 18:30" },
  { id: 5, title: "Royal Enfield Classic 350", price: "₹1,95,000", category: "Vehicles", subcategory: "Bikes", seller: "Sohan Singh", location: "Pune, MH", status: "sold", createdAt: "2024-03-21 11:10" },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-600 ring-amber-500/10";
      case "approved": return "bg-emerald-50 text-emerald-600 ring-emerald-500/10";
      case "rejected": return "bg-red-50 text-red-600 ring-red-500/10";
      case "sold": return "bg-blue-50 text-blue-600 ring-blue-500/10";
      default: return "bg-gray-50 text-gray-600 ring-gray-500/10";
    }
  };

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return MOCK_PRODUCTS.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.seller.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    window.setTimeout(() => setIsRefreshing(false), 600);
  }, []);

  const rowActionClass =
    "h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 border border-transparent transition-all active:scale-95 shadow-none hover:shadow-sm hover:bg-white hover:border-border";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 font-sans">
      {/* Header section identical to categories */}
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group w-[220px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-xl border-0 bg-muted/60 pl-9 pr-3 text-xs font-semibold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
            />
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-0 bg-muted/60 text-muted-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] transition-all hover:bg-muted/80 active:scale-95"
            title="Refresh"
          >
            <IconReload className={twMerge("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
          </button>

          <div className="flex items-center gap-1.5 rounded-xl bg-muted/50 p-1 ring-1 ring-black/[0.06]">
            {["all", "pending", "approved", "rejected", "sold"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={twMerge(
                  "h-7 px-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
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

      {/* Main Table identical to categories */}
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
        {isRefreshing ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground/20" />
            <p className="text-[10px] font-bold text-muted-foreground/30">Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <IconPackage size={32} className="text-muted-foreground/10" strokeWidth={1.5} />
            <p className="text-xs font-bold text-muted-foreground/50">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[360px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/[0.05] bg-muted/20">
                  <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Product Item</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Pricing</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Seller Details</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredProducts.map((item) => (
                  <tr key={item.id} className="group transition-colors hover:bg-muted/[0.15]">
                    <td className="px-8 py-3.5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-[#B5651D]/5 group-hover:text-[#B5651D] transition-colors font-bold text-[10px] border border-border/30 overflow-hidden relative">
                          <IconPackage size={18} stroke={1.5} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-foreground leading-tight">{item.title}</span>
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground/30 capitalize">
                            <span>{item.category}</span>
                            <span className="opacity-30">•</span>
                            <span>{item.subcategory}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#B5651D]">{item.price}</span>
                        <span className="text-[9px] font-medium text-muted-foreground/30 uppercase tracking-wider">{item.createdAt}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <IconUser size={10} className="text-muted-foreground/40" />
                          <span className="text-[11px] font-medium text-foreground">{item.seller}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <IconMapPin size={10} className="text-muted-foreground/40" />
                          <span className="text-[11px] font-medium text-foreground">{item.location}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span
                        className={twMerge(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset uppercase",
                          getStatusClasses(item.status)
                        )}
                      >
                        <div className="h-1 w-1 rounded-full bg-current" />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          className={twMerge(rowActionClass, "hover:text-[#B5651D]")}
                          title="View Details"
                        >
                          <IconEye size={14} />
                        </button>
                        <button
                          type="button"
                          className={twMerge(rowActionClass, "text-emerald-600/80 hover:text-emerald-600")}
                          title="Approve"
                        >
                          <IconCheck size={14} stroke={3} />
                        </button>
                        <button
                          type="button"
                          className={twMerge(rowActionClass, "text-red-500/80 hover:text-red-500")}
                          title="Reject"
                        >
                          <IconX size={14} stroke={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
