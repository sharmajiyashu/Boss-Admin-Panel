"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCircleCheckFilled,
  IconRosetteFilled,
  IconShieldCheck,
  IconCoin,
  IconLock,
  IconLockOpen,
  IconId,
  IconPackage,
  IconCash,
  IconLoader2,
  IconMessageCircle,
  IconUser,
  IconClock,
  IconWallet,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import {
  userService,
  type IUser,
  type UserListing,
  type UserInterest,
  type UserPayment,
} from "@/lib/services/userService";
import { getErrorMessage } from "@/lib/errorMessage";
import { toast } from "react-toastify";
import Image from "next/image";

type Tab = "detail" | "listings" | "interests" | "payments";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("detail");
  const [listingStatusFilter, setListingStatusFilter] = useState<string>("");

  // ── Queries ──
  const { data: user, isLoading: isUserLoading } = useQuery<IUser>({
    queryKey: ["user-detail", userId],
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });

  const { data: listings, isLoading: isListingsLoading } = useQuery<UserListing[]>({
    queryKey: ["user-listings", userId, listingStatusFilter],
    queryFn: () => userService.getUserListings(userId, listingStatusFilter || undefined),
    enabled: !!userId && activeTab === "listings",
  });

  const { data: interests, isLoading: isInterestsLoading } = useQuery<UserInterest[]>({
    queryKey: ["user-interests", userId],
    queryFn: () => userService.getUserInterests(userId),
    enabled: !!userId && activeTab === "interests",
  });

  const { data: payments, isLoading: isPaymentsLoading } = useQuery<UserPayment[]>({
    queryKey: ["user-payments", userId],
    queryFn: () => userService.getUserPayments(userId),
    enabled: !!userId && activeTab === "payments",
  });

  // ── Mutations ──
  const toggleBlockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      userService.updateUser(id, { isBlocked } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-detail", userId] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User status updated");
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Action failed")),
  });

  // ── Helpers ──
  const UserAvatar = ({ u, size = "h-10 w-10" }: { u: IUser; size?: string }) => {
    const url = (u as any).profileImage?.url;
    return (
      <div className={twMerge("shrink-0 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 font-black relative overflow-hidden", size)}>
        {url ? (
          <Image src={url} alt="" fill className="object-cover" />
        ) : (
          <span className="text-xs uppercase">{(u.firstName?.[0] || "") + (u.lastName?.[0] || "")}</span>
        )}
      </div>
    );
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { bg: string; text: string; label: string }> = {
      approved: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Approved" },
      pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending Review" },
      rejected: { bg: "bg-rose-50", text: "text-rose-700", label: "Rejected" },
      sold: { bg: "bg-blue-50", text: "text-blue-700", label: "Sold" },
      inactive: { bg: "bg-slate-100", text: "text-slate-500", label: "Inactive" },
      captured: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Success" },
      failed: { bg: "bg-rose-50", text: "text-rose-700", label: "Failed" },
    };
    const s = map[status] || { bg: "bg-slate-100", text: "text-slate-500", label: status };
    return (
      <span className={twMerge("inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide", s.bg, s.text)}>
        <span className={twMerge("h-1.5 w-1.5 rounded-full bg-current", status === "pending" && "animate-pulse")} />
        {s.label}
      </span>
    );
  };

  // ── Loading ──
  if (isUserLoading || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-[#B5651D]/30" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "detail", label: "Detail", icon: IconUser },
    { key: "listings", label: "Listings", icon: IconPackage },
    { key: "interests", label: "Interests", icon: IconMessageCircle },
    { key: "payments", label: "Payments", icon: IconCash },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 font-sans">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 py-2">
        <button
          onClick={() => router.push("/users")}
          className="h-9 w-9 rounded-xl border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:text-[#B5651D] transition-all shadow-sm"
        >
          <IconArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <UserAvatar u={user} size="h-11 w-11" />
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-slate-900 truncate">
              {user.firstName} {user.lastName}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-400 truncate">{user.email}</span>
              {user.isVerified && <IconCircleCheckFilled size={12} className="text-blue-500 shrink-0" />}
              {user.isPremium && <IconRosetteFilled size={12} className="text-amber-500 shrink-0" />}
            </div>
          </div>
        </div>
        <button
          onClick={() => toggleBlockMutation.mutate({ id: user._id || user.id, isBlocked: !user.isBlocked })}
          disabled={toggleBlockMutation.isPending}
          className={twMerge(
            "h-9 px-4 rounded-xl text-[11px] font-bold flex items-center gap-2 transition-all disabled:opacity-50 shrink-0",
            user.isBlocked
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
          )}
        >
          {toggleBlockMutation.isPending ? (
            <IconLoader2 size={14} className="animate-spin" />
          ) : user.isBlocked ? (
            <><IconLockOpen size={14} /> Unblock</>
          ) : (
            <><IconLock size={14} /> Block</>
          )}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-slate-100">
        <div className="flex gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={twMerge(
                  "relative flex items-center gap-1.5 px-5 py-3 text-[12px] font-bold transition-colors",
                  isActive ? "text-[#B5651D]" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon size={15} />
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#B5651D] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── DETAIL TAB ─── */}
      {activeTab === "detail" && (
        <div className="grid gap-5 md:grid-cols-2 animate-in fade-in duration-300">
          {/* Quick Stats Row */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Wallet", value: `₹${(user.walletBalance ?? 0).toLocaleString()}`, icon: IconWallet, color: "text-slate-800" },
              { label: "Platform Fee", value: user.isPlatformPaid ? "Paid" : "Unpaid", icon: IconCoin, color: user.isPlatformPaid ? "text-emerald-600" : "text-rose-500" },
              { label: "Status", value: user.isBlocked ? "Blocked" : "Active", icon: IconShieldCheck, color: user.isBlocked ? "text-rose-500" : "text-emerald-600" },
              { label: "Joined", value: new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }), icon: IconClock, color: "text-slate-800" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon size={13} className="text-slate-400" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
                <p className={twMerge("text-sm font-bold", stat.color)}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</h3>
            </div>
            <div className="divide-y divide-slate-50">
              <div className="flex items-center gap-3 px-5 py-3">
                <IconMail size={14} className="text-[#B5651D]/40 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-slate-700 truncate">{user.email}</p>
                  <p className="text-[9px] text-slate-400">{user.isEmailVerified ? "Verified" : "Not verified"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-5 py-3">
                <IconPhone size={14} className="text-[#B5651D]/40 shrink-0" />
                <p className="text-[12px] font-bold text-slate-700">{user.mobile || "Not provided"}</p>
              </div>
              <div className="flex items-center gap-3 px-5 py-3">
                <IconMapPin size={14} className="text-[#B5651D]/40 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-slate-700">
                    {user.location?.city || "—"}{user.location?.state ? `, ${user.location.state}` : ""}
                  </p>
                  {user.location?.address && <p className="text-[9px] text-slate-400 truncate">{user.location.address}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { label: "Identity", icon: IconShieldCheck, status: user.isVerified, trueLabel: "Verified", falseLabel: "Pending", trueClass: "bg-blue-50 text-blue-600", falseClass: "bg-slate-50 text-slate-400" },
                {
                  label: "Aadhaar KYC", icon: IconId, status: user.aadhaarVerification?.status === "verified", trueLabel: user.aadhaarVerification?.status || "Pending", falseLabel: user.aadhaarVerification?.status || "Pending",
                  trueClass: "bg-emerald-50 text-emerald-600",
                  falseClass: user.aadhaarVerification?.status === "failed" ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"
                },
                { label: "Platform Fee", icon: IconCash, status: user.isPlatformPaid, trueLabel: "Paid", falseLabel: "Unpaid", trueClass: "bg-emerald-50 text-emerald-600", falseClass: "bg-rose-50 text-rose-500" },
                { label: "Premium", icon: IconRosetteFilled, status: user.isPremium, trueLabel: "Active", falseLabel: "No", trueClass: "bg-amber-50 text-amber-600", falseClass: "bg-slate-50 text-slate-400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <item.icon size={14} className="text-slate-300" />
                    <span className="text-[12px] font-bold text-slate-700">{item.label}</span>
                  </div>
                  <span className={twMerge("px-2 py-0.5 rounded-md text-[9px] font-black uppercase", item.status ? item.trueClass : item.falseClass)}>
                    {item.status ? item.trueLabel : item.falseLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Meta */}
          <div className="md:col-span-2 rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</h3>
            </div>
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-50">
              <div className="divide-y divide-slate-50">
                <div className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-[11px] text-slate-400">User ID</span>
                  <span className="text-[10px] font-mono text-slate-500">{(user._id || user.id).slice(-12)}</span>
                </div>
                {user.lastLoginAt && (
                  <div className="flex items-center justify-between px-5 py-2.5">
                    <span className="text-[11px] text-slate-400">Last Login</span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {new Date(user.lastLoginAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                )}
                {user.referralCode && (
                  <div className="flex items-center justify-between px-5 py-2.5">
                    <span className="text-[11px] text-slate-400">Referral Code</span>
                    <span className="text-[11px] font-mono font-bold text-[#B5651D]">{user.referralCode}</span>
                  </div>
                )}
              </div>
              <div className="px-5 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Bio</p>
                <p className="text-[12px] text-slate-600 leading-relaxed">{user.bio || "No bio provided"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── LISTINGS TAB ─── */}
      {activeTab === "listings" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "", label: "All" },
              { value: "approved", label: "Approved" },
              { value: "pending", label: "Pending Review" },
              { value: "rejected", label: "Rejected" },
              { value: "sold", label: "Sold" },
              { value: "inactive", label: "Inactive" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setListingStatusFilter(f.value)}
                className={twMerge(
                  "h-8 px-3.5 rounded-lg text-[10px] font-bold transition-all border",
                  listingStatusFilter === f.value
                    ? "bg-[#B5651D] text-white border-[#B5651D] shadow-sm"
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-200"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isListingsLoading ? (
            <div className="flex h-40 items-center justify-center rounded-xl bg-white border border-slate-100">
              <IconLoader2 className="h-6 w-6 animate-spin text-[#B5651D]/30" />
            </div>
          ) : !listings || listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 rounded-xl bg-white border border-slate-100 shadow-sm">
              <IconPackage size={28} className="text-slate-200 mb-2" />
              <p className="text-[11px] font-bold text-slate-400">No listings found</p>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Price</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {listings.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-slate-100 overflow-hidden shrink-0 relative">
                              {item.media?.[0]?.url ? (
                                <Image src={item.media[0].url} alt="" fill className="object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center"><IconPackage size={14} className="text-slate-300" /></div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12px] font-bold text-slate-700 truncate">{item.name}</p>
                              {item.description && <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{item.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-bold text-slate-600">{item.category?.name || "—"}</span>
                          {item.subcategory && <p className="text-[10px] text-slate-400">{item.subcategory.name}</p>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[12px] font-black text-slate-800">₹{item.price?.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-slate-50">
                {listings.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-4">
                    <div className="h-11 w-11 rounded-lg bg-slate-100 overflow-hidden shrink-0 relative">
                      {item.media?.[0]?.url ? (
                        <Image src={item.media[0].url} alt="" fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center"><IconPackage size={16} className="text-slate-300" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-slate-700 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">₹{item.price?.toLocaleString()} · {item.category?.name || "—"}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── INTERESTS TAB ─── */}
      {activeTab === "interests" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <p className="text-[11px] text-slate-400">Users who have interacted with this account via chat.</p>
          {isInterestsLoading ? (
            <div className="flex h-40 items-center justify-center rounded-xl bg-white border border-slate-100">
              <IconLoader2 className="h-6 w-6 animate-spin text-[#B5651D]/30" />
            </div>
          ) : !interests || interests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 rounded-xl bg-white border border-slate-100 shadow-sm">
              <IconMessageCircle size={28} className="text-slate-200 mb-2" />
              <p className="text-[11px] font-bold text-slate-400">No interactions yet</p>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {interests.map((item) => (
                <div key={item._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                    {item.user?.profileImage?.url ? (
                      <Image src={item.user.profileImage.url} alt="" fill className="object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-slate-400 uppercase">
                        {(item.user?.firstName?.[0] || "") + (item.user?.lastName?.[0] || "")}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-slate-700 truncate">
                      {item.user?.firstName} {item.user?.lastName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{item.user?.email}</p>
                  </div>
                  <div className="text-right shrink-0 max-w-[140px]">
                    {item.lastMessage && (
                      <p className="text-[10px] text-slate-500 truncate">&ldquo;{item.lastMessage}&rdquo;</p>
                    )}
                    {item.lastMessageAt && (
                      <p className="text-[9px] text-slate-300 flex items-center gap-1 justify-end mt-0.5">
                        <IconClock size={9} />
                        {new Date(item.lastMessageAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── PAYMENTS TAB ─── */}
      {activeTab === "payments" && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {isPaymentsLoading ? (
            <div className="flex h-40 items-center justify-center rounded-xl bg-white border border-slate-100">
              <IconLoader2 className="h-6 w-6 animate-spin text-[#B5651D]/30" />
            </div>
          ) : !payments || payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 rounded-xl bg-white border border-slate-100 shadow-sm">
              <IconWallet size={28} className="text-slate-200 mb-2" />
              <p className="text-[11px] font-bold text-slate-400">No payments recorded</p>
            </div>
          ) : (
            <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
              <div className="hidden sm:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Amount</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
                      <th className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3">
                          <span className={twMerge(
                            "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase",
                            p.paymentType === "platform_fee" ? "bg-[#B5651D]/10 text-[#B5651D]"
                              : p.paymentType === "wallet_topup" ? "bg-blue-50 text-blue-600"
                                : "bg-slate-50 text-slate-500"
                          )}>
                            {p.paymentType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-[12px] font-black text-slate-800">₹{p.amount?.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-mono text-slate-400">{p.razorpayOrderId}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-[10px] text-slate-400">
                            {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-slate-50">
                {payments.map((p) => (
                  <div key={p._id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={twMerge(
                        "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase",
                        p.paymentType === "platform_fee" ? "bg-[#B5651D]/10 text-[#B5651D]" : "bg-blue-50 text-blue-600"
                      )}>
                        {p.paymentType.replace(/_/g, " ")}
                      </span>
                      <span className="text-[13px] font-black text-slate-800">₹{p.amount?.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <StatusBadge status={p.status} />
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
