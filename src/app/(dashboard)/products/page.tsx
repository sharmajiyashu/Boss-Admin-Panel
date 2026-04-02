"use client";

import React, { useState } from "react";
import {
  IconPackage,
  IconSearch,
  IconReload,
  IconArrowRight,
  IconCheck,
  IconX,
  IconEye,
  IconUser,
  IconMapPin,
  IconHistory
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
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: string;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const products: Product[] = [
    { id: 1, title: "iPhone 15 Pro Max - 256GB Platinum", price: "₹1,24,900", category: "Electronics", subcategory: "Smartphones", seller: "Rajesh Kumar", location: "Mumbai, MH", status: "pending", createdAt: "2024-03-24 10:15" },
    { id: 2, title: "BMW 3 Series 2021 Luxury Line", price: "₹42,50,000", category: "Vehicles", subcategory: "Cars", seller: "Anjali Singh", location: "Bangalore, KA", status: "approved", createdAt: "2024-03-23 14:20" },
    { id: 3, title: "2 BHK Flat in Cyber City", price: "₹85,00,000", category: "Property", subcategory: "Apartments", seller: "Karan Johar", location: "Gurgaon, HR", status: "pending", createdAt: "2024-03-23 09:45" },
    { id: 4, title: "Sony PS5 with 2 Controllers", price: "₹45,000", category: "Electronics", subcategory: "Consoles", seller: "Vikram Sen", location: "Kolkata, WB", status: "rejected", createdAt: "2024-03-22 18:30" },
    { id: 5, title: "Royal Enfield Classic 350", price: "₹1,95,000", category: "Vehicles", subcategory: "Bikes", seller: "Sohan Singh", location: "Pune, MH", status: "sold", createdAt: "2024-03-21 11:10" },
  ];

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-50 text-amber-600 ring-amber-500/10";
      case "approved": return "bg-emerald-50 text-emerald-600 ring-emerald-500/10";
      case "rejected": return "bg-red-50 text-red-600 ring-red-500/10";
      case "sold": return "bg-blue-50 text-blue-600 ring-blue-500/10";
      default: return "bg-gray-50 text-gray-600 ring-gray-500/10";
    }
  };

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

        <div className="flex items-center gap-1.5 bg-card/40 p-1 rounded-xl border border-border/50">
          {["all", "pending", "approved", "rejected", "sold"].map((status) => (
            <button
              key={status}
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

      {/* Main Table identical to categories */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div className="overflow-x-auto min-h-[360px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/5 border-b border-border/30">
                <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Product Item</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Pricing</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Seller Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {products.map((item) => (
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
                      <button className="h-8 w-8 rounded-lg flex items-center justify-center text-emerald-500 hover:bg-white border border-transparent hover:border-emerald-100 transition-all active:scale-95 shadow-none hover:shadow-sm" title="Approve">
                        <IconCheck size={14} stroke={3} />
                      </button>
                      <button className="h-8 w-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-white border border-transparent hover:border-red-100 transition-all active:scale-95 shadow-none hover:shadow-sm" title="Reject">
                        <IconX size={14} stroke={3} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
