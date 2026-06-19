"use client";

import React, { useState } from "react";
import {
  IconBell,
  IconSend,
  IconCheck,
  IconReload,
  IconMessageCircle,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/lib/services/notificationService";
import { toast } from "sonner";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"list" | "send">("list");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Broadcast Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["notifications", page],
    queryFn: () => notificationService.getNotifications(page, limit),
    placeholderData: (previousData) => previousData,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: { title: string; message: string }) =>
      notificationService.sendBroadcast(payload.title, payload.message),
    onSuccess: () => {
      toast.success("Broadcast notification sent successfully!");
      setTitle("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setActiveTab("list");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send broadcast");
    },
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      toast.success("Notification marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to mark as read");
    },
  });

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    sendMutation.mutate({ title, message });
  };

  const handleMarkAsRead = (id: string) => {
    readMutation.mutate(id);
  };

  const paginatedData = data;
  const notifications = paginatedData?.notifications || [];
  const total = paginatedData?.total || 0;
  const totalPages = paginatedData?.totalPages || 0;
  const unreadCount = paginatedData?.unreadCount || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <IconBell className="text-[#B5651D]" />
            Notifications Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Manage admin alerts and broadcast system notifications to all users.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "list" && (
            <button
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-[#B5651D] transition-all disabled:opacity-50 shadow-sm"
              title="Refresh Alerts"
            >
              <IconReload size={16} className={twMerge((isLoading || isRefetching) && "animate-spin")} />
            </button>
          )}

          <button
            onClick={() => setActiveTab(activeTab === "list" ? "send" : "list")}
            className="h-9 px-4 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-[11px] font-black uppercase tracking-widest shadow-md shadow-[#B5651D]/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 border-none outline-none"
          >
            {activeTab === "list" ? (
              <>
                <IconSend size={14} />
                Send Broadcast
              </>
            ) : (
              <>
                <IconBell size={14} />
                View Alerts
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs / Submenu */}
      <div className="flex gap-2 border-b border-slate-100 pb-px">
        <button
          onClick={() => setActiveTab("list")}
          className={twMerge(
            "pb-3 text-xs font-bold uppercase tracking-wider relative transition-all border-none bg-transparent outline-none cursor-pointer",
            activeTab === "list" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Alerts Inbox
          {unreadCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black shrink-0">
              {unreadCount}
            </span>
          )}
          {activeTab === "list" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B5651D] rounded-full animate-in slide-in-from-left duration-200" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("send")}
          className={twMerge(
            "pb-3 text-xs font-bold uppercase tracking-wider relative transition-all border-none bg-transparent outline-none cursor-pointer ml-4",
            activeTab === "send" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Send System BroadCast
          {activeTab === "send" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#B5651D] rounded-full animate-in slide-in-from-left duration-200" />
          )}
        </button>
      </div>

      {activeTab === "list" ? (
        <div className="space-y-4">
          {/* Notifications List */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-50">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={twMerge(
                    "flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-5 hover:bg-slate-50/40 transition-colors",
                    !notif.isRead && "bg-[#B5651D]/[0.02]"
                  )}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={twMerge(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        notif.isRead
                          ? "bg-slate-100 text-slate-400"
                          : "bg-amber-100 text-[#B5651D]"
                      )}
                    >
                      <IconBell size={16} />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-slate-800">
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {notif.type}
                        </span>
                        <span className="text-slate-200 text-xs">•</span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(notif.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="h-8 px-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-white text-slate-500 hover:text-emerald-600 transition-all font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shrink-0 self-end sm:self-start"
                    >
                      <IconCheck size={12} />
                      Mark Read
                    </button>
                  )}
                </div>
              ))}

              {notifications.length === 0 && !isLoading && (
                <div className="py-12 text-center text-[12px] font-bold text-slate-400 italic">
                  No notifications found.
                </div>
              )}

              {isLoading && (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 w-full bg-slate-50/30 animate-pulse border-b border-slate-50" />
                ))
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Showing <span className="text-slate-600">{(page - 1) * limit + 1}</span> to{" "}
                <span className="text-slate-600">
                  {Math.min(page * limit, total)}
                </span>{" "}
                of <span className="text-slate-600">{total}</span> results
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="h-8 px-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="h-8 px-3 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-wider transition-all disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Send Broadcast Page Form */
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm max-w-xl">
          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 pb-2 border-b border-slate-50">
              <IconSend size={18} className="text-[#B5651D]" />
              <h2 className="text-xs font-black uppercase tracking-widest">
                Draft System Broadcast
              </h2>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Broadcasting a notification creates a live alert in all mobile and web user notification screens.
            </p>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Notification Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Scheduled Maintenance"
                className="w-full h-10 rounded-xl border border-slate-100 bg-slate-50/30 px-3.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Notification Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Draft detail text here..."
                rows={4}
                className="w-full rounded-xl border border-slate-100 bg-slate-50/30 p-3.5 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="h-10 px-5 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-[11px] font-black uppercase tracking-widest shadow-md shadow-[#B5651D]/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2 border-none outline-none cursor-pointer"
              >
                <IconSend size={14} />
                {sendMutation.isPending ? "Sending..." : "Publish Broadcast"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
