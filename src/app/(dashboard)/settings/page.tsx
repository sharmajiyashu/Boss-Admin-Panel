"use client";

import React, { useState, useEffect } from "react";
import {
  IconSettings,
  IconReceipt2,
  IconShieldExclamation,
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconReload,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingService } from "@/lib/services/settingService";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [platformFees, setPlatformFees] = useState<number>(0);
  const [reportReasons, setReportReasons] = useState<string[]>([]);
  const [newReason, setNewReason] = useState("");

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingService.getSettings(),
  });

  useEffect(() => {
    if (data) {
      setPlatformFees(data.platformFees);
      setReportReasons(data.reportReasons || []);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: { platformFees?: number; reportReasons?: string[] }) =>
      settingService.updateSettings(payload),
    onSuccess: () => {
      toast.success("Settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update settings");
    },
  });

  const handleAddReason = () => {
    if (newReason.trim() && !reportReasons.includes(newReason.trim())) {
      setReportReasons([...reportReasons, newReason.trim()]);
      setNewReason("");
    }
  };

  const handleRemoveReason = (reason: string) => {
    setReportReasons(reportReasons.filter((r) => r !== reason));
  };

  const handleSave = () => {
    updateMutation.mutate({
      platformFees,
      reportReasons,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 font-sans max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#B5651D]/5 flex items-center justify-center text-[#B5651D]">
            <IconSettings size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">App Settings</h1>
            <p className="text-[11px] font-medium text-muted-foreground/60">Configure platform fees and moderation guidelines.</p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-border/50 bg-card/40 text-muted-foreground hover:text-[#B5651D] transition-all disabled:opacity-50"
        >
          <IconReload size={16} className={twMerge((isLoading || isRefetching) && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Platform Fees Card */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm space-y-4">
           <div className="flex items-center gap-3 text-[#B5651D]">
             <IconReceipt2 size={24} stroke={1.5} />
             <h2 className="font-bold text-sm uppercase tracking-wider">Platform Fees</h2>
           </div>
           <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
             Set the percentage fee charged on every successful sale through the platform.
           </p>
           <div className="relative pt-2">
              <input
                type="number"
                value={platformFees}
                onChange={(e) => setPlatformFees(Number(e.target.value))}
                className="w-full h-11 rounded-xl border border-border/50 bg-muted/20 px-4 text-sm font-bold transition-all focus:border-[#B5651D]/50 focus:ring-4 focus:ring-[#B5651D]/5 outline-none"
                placeholder="0.00"
              />
              <span className="absolute right-4 top-[24px] text-sm font-bold text-muted-foreground/40">%</span>
           </div>
        </div>

        {/* Support/Info Card */}
        <div className="rounded-2xl border border-[#B5651D]/10 bg-[linear-gradient(268.96deg,#B5651D05_0.19%,#FE973805_99.72%)] p-6 shadow-sm flex flex-col justify-between">
           <div>
             <h3 className="text-sm font-bold text-foreground">Configuration Note</h3>
             <p className="text-[11px] text-muted-foreground/60 mt-2 leading-relaxed">
               Platform fees are applied globally to all product categories. Report reasons define what users can select when flagging a listing for review.
             </p>
           </div>
           <button
             onClick={handleSave}
             disabled={updateMutation.isPending || isLoading}
             className="mt-6 flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-sm font-bold shadow-lg shadow-[#B5651D]/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
           >
             <IconDeviceFloppy size={18} />
             {updateMutation.isPending ? "Saving..." : "Save Changes"}
           </button>
        </div>
      </div>

      {/* Report Reasons Card */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-500">
              <IconShieldExclamation size={24} stroke={1.5} />
              <h2 className="font-bold text-sm uppercase tracking-wider">Report Reasons</h2>
            </div>
         </div>
         
         <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddReason()}
                className="flex-1 h-11 rounded-xl border border-border/50 bg-muted/20 px-4 text-sm font-medium transition-all focus:border-[#B5651D]/50 focus:ring-4 focus:ring-[#B5651D]/5 outline-none"
                placeholder="Add a new reason (e.g. Counterfeit)"
              />
              <button
                onClick={handleAddReason}
                className="h-11 w-11 flex items-center justify-center rounded-xl bg-muted text-foreground hover:bg-[#B5651D] hover:text-white transition-all shadow-sm active:scale-95"
              >
                <IconPlus size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {reportReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-border/30 bg-muted/5 group hover:border-[#B5651D]/20 transition-all"
                >
                  <span className="text-[12px] font-medium text-foreground/80">{reason}</span>
                  <button
                    onClick={() => handleRemoveReason(reason)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-muted-foreground/30 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
              {reportReasons.length === 0 && !isLoading && (
                <div className="col-span-full py-8 text-center text-[11px] text-muted-foreground/40 italic">
                  No report reasons defined.
                </div>
              )}
              {isLoading && (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 w-full rounded-xl bg-muted animate-pulse" />
                ))
              )}
            </div>
         </div>
      </div>
    </div>
  );
}
