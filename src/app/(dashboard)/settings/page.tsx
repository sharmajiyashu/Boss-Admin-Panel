"use client";

import React, { useState, useEffect } from "react";
import {
  IconCoins,
  IconShieldExclamation,
  IconPlus,
  IconTrash,
  IconDeviceFloppy,
  IconReload,
  IconInfoCircle,
  IconMapPin
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingService } from "@/lib/services/settingService";
import { toast } from "sonner";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [platformFees, setPlatformFees] = useState<number | "">(0);
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
      platformFees: platformFees === "" ? 0 : platformFees,
      reportReasons,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">App Settings</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Configure platform fees and moderation guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-[#B5651D] transition-all disabled:opacity-50 shadow-sm"
            title="Reload Settings"
          >
            <IconReload size={16} className={twMerge((isLoading || isRefetching) && "animate-spin")} />
          </button>

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || isLoading}
            className="h-9 px-4 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-[11px] font-black uppercase tracking-widest shadow-md shadow-[#B5651D]/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <IconDeviceFloppy size={14} />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <IconCoins size={18} className="text-[#B5651D]" />
            <h2 className="text-xs font-black uppercase tracking-widest">Platform Fees</h2>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Set the standard flat platform fee amount applied to successful transactions within the BOSS platform.
          </p>

          <div className="space-y-1.5 pt-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Platform Fee (₹)</label>
            <div className="relative max-w-[200px]">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <span className="text-xs font-bold text-slate-400">₹</span>
              </div>
              <input
                type="number"
                value={platformFees}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setPlatformFees("");
                  } else {
                    setPlatformFees(Number(val));
                  }
                }}
                className="w-full h-10 rounded-xl border border-slate-100 bg-slate-50/30 pl-7 pr-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50 text-[10px] font-bold text-[#B5651D] max-w-sm">
            <IconInfoCircle size={14} className="shrink-0" />
            <span>Changes will apply to future transactions only.</span>
          </div>
        </div>

        {/* Informational Notes */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/20 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">Configuration Guide</h3>
            <ul className="text-[11px] text-slate-400 mt-3 leading-relaxed space-y-2 list-disc pl-4">
              <li>Platform fees configure standard billing rules across the BOSS market system.</li>
              <li>Report reasons define the guidelines users can choose when flagging posts.</li>
              <li>Click <strong>Save Changes</strong> in the top-right header to persist your updates.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Report Reasons Card */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-slate-800">
            <IconShieldExclamation size={18} className="text-rose-500" />
            <h2 className="text-xs font-black uppercase tracking-widest">Moderation Guidelines</h2>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Define the options users can select when reporting listings or accounts for review.
          </p>

          <div className="space-y-4">
            <div className="flex gap-2 max-w-lg">
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddReason()}
                className="flex-1 h-10 rounded-xl border border-slate-100 bg-slate-50/30 px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                placeholder="Define new report category..."
              />
              <button
                onClick={handleAddReason}
                className="h-10 px-4 flex items-center justify-center gap-1.5 rounded-xl bg-foreground text-background hover:bg-[#B5651D] hover:text-white transition-all shadow-sm active:scale-95 text-[10px] font-black uppercase tracking-widest"
              >
                <IconPlus size={14} />
                Add Guideline
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {reportReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/20 group hover:border-[#B5651D]/30 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-black/[0.02]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#B5651D]/40 group-hover:bg-[#B5651D] transition-colors shrink-0" />
                    <span className="text-[12px] font-bold text-slate-700 truncate">{reason}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveReason(reason)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                    title="Remove Guideline"
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
              {reportReasons.length === 0 && !isLoading && (
                <div className="col-span-full py-8 text-center text-[11px] text-slate-400 italic">
                  No report reasons defined.
                </div>
              )}
              {isLoading && (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 w-full rounded-xl bg-slate-50/50 border border-slate-100/50 animate-pulse" />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
