"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  IconUsers,
  IconSearch,
  IconReload,
  IconLoader2,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheckFilled,
  IconRosetteFilled,
  IconEye,
  IconCoin,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import { userService, type IUser } from "@/lib/services/userService";
import Image from "next/image";

export default function UsersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // ── Queries ──
  const { data: usersData, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["users", page, limit, searchTerm],
    queryFn: () => userService.getUsers(page, limit, searchTerm),
  });

  const users = usersData?.data || [];
  const meta = usersData?.meta;
  const totalPages = meta?.totalPages || 1;

  // ── Helpers ──
  const UserAvatar = ({ user, className = "h-9 w-9" }: { user: IUser; className?: string }) => {
    const url = (user as any).profileImage?.url;
    return (
      <div
        className={twMerge(
          "shrink-0 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 font-black relative overflow-hidden",
          className
        )}
      >
        {url ? (
          <Image src={url} alt="" fill className="object-cover" />
        ) : (
          <span className="text-[10px] uppercase">
            {(user.firstName?.[0] || "") + (user.lastName?.[0] || "")}
          </span>
        )}
      </div>
    );
  };

  const StatusDot = ({ active }: { active: boolean }) => (
    <div
      className={twMerge(
        "h-2 w-2 rounded-full",
        active ? "bg-emerald-500 shadow-sm shadow-emerald-300" : "bg-slate-300"
      )}
    />
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 font-sans max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#B5651D]/10 flex items-center justify-center text-[#B5651D]">
            <IconUsers size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Users</h1>
            <p className="text-[11px] font-medium text-muted-foreground/60">
              {meta?.total ?? 0} registered accounts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group w-[220px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-[#B5651D] transition-colors" />
            <input
              type="text"
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-slate-100 bg-white pl-9 pr-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm"
            />
          </div>

          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-[#B5651D] transition-all disabled:opacity-50"
          >
            <IconReload size={14} className={twMerge((isLoading || isRefetching) && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-white shadow-sm border border-slate-100">
            <IconLoader2 className="h-8 w-8 animate-spin text-[#B5651D]/20" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
            <IconUsers size={32} className="text-slate-200" />
            <p className="text-[11px] font-bold text-slate-400">No users found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">User</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Verified</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Platform Fee</th>
                    <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr
                      key={user._id || user.id}
                      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/users/${user._id || user.id}`)}
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} className="h-9 w-9 rounded-xl shadow-sm" />
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-slate-800 truncate leading-tight">
                              {user.firstName} {user.lastName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {user.isVerified && <IconCircleCheckFilled size={11} className="text-blue-500" />}
                              {user.isPremium && <IconRosetteFilled size={11} className="text-amber-500" />}
                              <span className="text-[9px] font-medium text-slate-400">
                                {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-bold text-slate-600 truncate max-w-[160px]">{user.email}</span>
                          <span className="text-[10px] text-slate-400">{user.mobile || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-medium text-slate-500">
                          {user.location?.city || "—"}{user.location?.state ? `, ${user.location.state}` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {user.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase">
                            <IconCircleCheckFilled size={10} /> Yes
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-300 uppercase">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {user.isPlatformPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">
                            <IconCoin size={10} /> Paid
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-300 uppercase">Unpaid</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <StatusDot active={!user.isBlocked} />
                          <span className="text-[10px] font-bold text-slate-500">
                            {user.isBlocked ? "Blocked" : "Active"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/users/${user._id || user.id}`);
                          }}
                          className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-slate-400 hover:bg-white hover:text-[#B5651D] border border-transparent hover:border-slate-100 transition-all shadow-none hover:shadow-sm text-[10px] font-bold"
                        >
                          <IconEye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {users.map((user) => (
                <div
                  key={user._id || user.id}
                  onClick={() => router.push(`/users/${user._id || user.id}`)}
                  className="rounded-2xl bg-white border border-slate-100 p-4 shadow-sm space-y-3 cursor-pointer hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} className="h-10 w-10 rounded-xl" />
                      <div>
                        <p className="text-[12px] font-bold text-slate-800">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-[10px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <StatusDot active={!user.isBlocked} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {user.isVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase">
                        Verified
                      </span>
                    )}
                    {user.isPlatformPaid && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">
                        Fee Paid
                      </span>
                    )}
                    {user.isPremium && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 text-[9px] font-black uppercase">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[10px] font-bold text-muted-foreground/50">
                  Page {page} of {totalPages} · {meta?.total} total
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/[0.06] bg-card text-muted-foreground transition-all hover:bg-muted/30 disabled:opacity-20"
                  >
                    <IconChevronLeft size={14} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-muted-foreground/30 text-xs">…</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={twMerge(
                            "h-8 min-w-[32px] rounded-xl px-2 text-[11px] font-bold transition-all",
                            page === p
                              ? "bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white shadow-lg shadow-[#B5651D]/20"
                              : "text-muted-foreground ring-1 ring-transparent hover:bg-card hover:text-[#B5651D] hover:ring-black/[0.06]"
                          )}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/[0.06] bg-card text-muted-foreground transition-all hover:bg-muted/30 disabled:opacity-20"
                  >
                    <IconChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
