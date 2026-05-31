"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  IconPhone,
  IconCalendar,
  IconSearch,
  IconReload,
  IconLoader2,
  IconChevronLeft,
  IconChevronRight,
  IconPhoneCall,
  IconClock,
  IconCalendarEvent,
  IconNotebook,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import { callApi } from "@/lib/api";
import Image from "next/image";

export default function CallsPage() {
  const [activeTab, setActiveTab] = useState<"scheduled" | "logs">("scheduled");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // ── Queries ──
  const {
    data: scheduledData,
    isLoading: isScheduledLoading,
    isRefetching: isScheduledRefetching,
    refetch: refetchScheduled,
  } = useQuery({
    queryKey: ["scheduledCalls", page, searchTerm, statusFilter],
    queryFn: () =>
      callApi.getScheduledCalls({
        page,
        limit,
        search: searchTerm,
        status: statusFilter,
      }),
    enabled: activeTab === "scheduled",
  });

  const {
    data: logsData,
    isLoading: isLogsLoading,
    isRefetching: isLogsRefetching,
    refetch: refetchLogs,
  } = useQuery({
    queryKey: ["callHistoryLogs", page, searchTerm, statusFilter],
    queryFn: () =>
      callApi.getCallHistory({
        page,
        limit,
        search: searchTerm,
        status: statusFilter,
      }),
    enabled: activeTab === "logs",
  });

  const isCurrentLoading = activeTab === "scheduled" ? isScheduledLoading : isLogsLoading;
  const isCurrentRefetching = activeTab === "scheduled" ? isScheduledRefetching : isLogsRefetching;
  const currentRefetch = activeTab === "scheduled" ? refetchScheduled : refetchLogs;

  const currentData = activeTab === "scheduled" ? scheduledData?.data || [] : logsData?.data || [];
  const meta = activeTab === "scheduled" ? scheduledData?.meta : logsData?.meta;
  const totalPages = meta?.totalPages || 1;

  // ── Helpers ──
  const UserAvatar = ({ user, className = "h-8 w-8" }: { user: any; className?: string }) => {
    const url = user?.profileImage?.url;
    return (
      <div
        className={twMerge(
          "shrink-0 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400 font-bold relative overflow-hidden",
          className
        )}
      >
        {url ? (
          <Image src={url} alt="" fill className="object-cover animate-in fade-in duration-200" />
        ) : (
          <span className="text-[10px] uppercase">
            {(user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")}
          </span>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-0.5 rounded-lg bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase">Pending</span>;
      case "accepted":
        return <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase">Accepted</span>;
      case "rejected":
        return <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 text-[10px] font-black uppercase">Rejected</span>;
      case "ongoing":
        return <span className="px-2 py-0.5 rounded-lg bg-sky-50 text-sky-600 text-[10px] font-black uppercase animate-pulse">Ongoing</span>;
      case "completed":
        return <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">Completed</span>;
      case "missed":
        return <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black uppercase">Missed</span>;
      case "declined":
        return <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-black uppercase">Declined</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-black uppercase">{status}</span>;
    }
  };

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Calls & History</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Manage and view all scheduled call requests and call logs.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative group w-[200px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-[#B5651D] transition-colors" />
            <input
              type="text"
              placeholder="Search caller/receiver..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-slate-100 bg-white pl-9 pr-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm cursor-pointer"
          >
            <option value="">All Statuses</option>
            {activeTab === "scheduled" ? (
              <>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
                <option value="declined">Declined</option>
              </>
            ) : (
              <>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
                <option value="declined">Declined</option>
              </>
            )}
          </select>

          <button
            onClick={() => currentRefetch()}
            disabled={isCurrentLoading || isCurrentRefetching}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-[#B5651D] transition-all disabled:opacity-50"
          >
            <IconReload size={14} className={twMerge((isCurrentLoading || isCurrentRefetching) && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button
          onClick={() => {
            setActiveTab("scheduled");
            setSearchTerm("");
            setStatusFilter("");
            setPage(1);
          }}
          className={twMerge(
            "px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all outline-none",
            activeTab === "scheduled"
              ? "border-[#B5651D] text-[#B5651D]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            <IconCalendar size={14} />
            Scheduled Calls
          </span>
        </button>
        <button
          onClick={() => {
            setActiveTab("logs");
            setSearchTerm("");
            setStatusFilter("");
            setPage(1);
          }}
          className={twMerge(
            "px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all outline-none",
            activeTab === "logs"
              ? "border-[#B5651D] text-[#B5651D]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <span className="flex items-center gap-2">
            <IconPhone size={14} />
            Call History logs
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="min-h-[400px]">
        {isCurrentLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-white shadow-sm border border-slate-100">
            <IconLoader2 className="h-8 w-8 animate-spin text-[#B5651D]/20" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading call records...</p>
          </div>
        ) : currentData.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white">
            <IconPhoneCall size={32} className="text-slate-200" />
            <p className="text-[11px] font-bold text-slate-400">No call records found</p>
          </div>
        ) : (
          <>
            {activeTab === "scheduled" ? (
              /* Scheduled Calls Table */
              <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/50">
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Caller</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Receiver</th>
                      <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Scheduled Time</th>
                      <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentData.map((call: any) => (
                      <tr key={call._id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar user={call.caller} />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-800 leading-tight">
                                {call.caller ? `${call.caller.firstName} ${call.caller.lastName}` : "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar user={call.receiver} />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-800 leading-tight">
                                {call.receiver ? `${call.receiver.firstName} ${call.receiver.lastName}` : "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                            <IconCalendarEvent size={12} className="text-slate-400" />
                            {new Date(call.scheduledTime).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-start gap-1.5 text-[11px] text-slate-500 max-w-[240px] truncate" title={call.notes}>
                            {call.notes ? (
                              <>
                                <IconNotebook size={12} className="text-slate-400 shrink-0 mt-0.5" />
                                <span>{call.notes}</span>
                              </>
                            ) : (
                              <span className="text-slate-300 italic">No notes</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(call.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Call History Logs Table */
              <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/50">
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Caller</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Receiver</th>
                      <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Start Time</th>
                      <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">End Time</th>
                      <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                      <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {currentData.map((log: any) => (
                      <tr key={log._id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar user={log.caller} />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-800 leading-tight">
                                {log.caller ? `${log.caller.firstName} ${log.caller.lastName}` : "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar user={log.receiver} />
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-800 leading-tight">
                                {log.receiver ? `${log.receiver.firstName} ${log.receiver.lastName}` : "Unknown"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-[11px] font-medium text-slate-600">
                            {new Date(log.startTime).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-[11px] font-medium text-slate-600">
                            {new Date(log.endTime).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                            <IconClock size={12} className="text-slate-400" />
                            {formatDuration(log.duration)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(log.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-[10px] font-bold text-muted-foreground/50">
                  Page {page} of {totalPages} · {meta?.total} total records
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
