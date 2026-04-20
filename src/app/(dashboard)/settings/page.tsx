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
  IconCoins,
  IconListCheck,
  IconInfoCircle,
  IconArrowRight
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
        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm space-y-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 text-black/[0.03] -rotate-12 transition-transform group-hover:scale-110">
             <IconCoins size={80} stroke={1.5} />
           </div>
           
           <div className="flex items-center gap-3 text-[#B5651D] relative z-10">
             <div className="h-10 w-10 rounded-xl bg-[#B5651D]/10 flex items-center justify-center">
               <IconReceipt2 size={24} stroke={1.5} />
             </div>
             <div>
               <h2 className="font-black text-sm uppercase tracking-widest">Processing Fees</h2>
               <p className="text-[9px] font-bold text-muted-foreground/40 uppercase">Global Platform Commission</p>
             </div>
           </div>

           <div className="space-y-4 relative z-10">
             <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed max-w-[280px]">
               Configure the standard commission percentage applied to all successful transactions within the BOSS ecosystem.
             </p>
             
             <div className="relative pt-2">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <span className="text-sm font-black text-[#B5651D]/40">MOD</span>
                </div>
                <input
                  type="number"
                  value={platformFees}
                  onChange={(e) => setPlatformFees(Number(e.target.value))}
                  className="w-full h-14 rounded-2xl border border-border/50 bg-muted/20 pl-14 pr-12 text-lg font-black transition-all focus:border-[#B5651D]/50 focus:ring-8 focus:ring-[#B5651D]/5 outline-none tracking-tight"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-4 flex items-center">
                  <span className="h-6 w-6 rounded-lg bg-[#B5651D] flex items-center justify-center text-[10px] font-black text-white">%</span>
                </div>
             </div>
             
             <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 border border-orange-100 text-[10px] font-bold text-orange-700">
               <IconInfoCircle size={14} />
               Changes apply to future transactions only.
             </div>
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
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
         <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3 text-red-500">
                 <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                   <IconShieldExclamation size={24} stroke={1.5} />
                 </div>
                 <div>
                    <h2 className="font-black text-sm uppercase tracking-widest">Moderation Guidelines</h2>
                    <p className="text-[9px] font-bold text-muted-foreground/40 uppercase">Report Reasons & Flags</p>
                 </div>
               </div>
            </div>
            
            <div className="space-y-4">
               <div className="flex gap-3">
                 <div className="relative flex-1">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30">
                     <IconListCheck size={16} />
                   </div>
                   <input
                     type="text"
                     value={newReason}
                     onChange={(e) => setNewReason(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleAddReason()}
                     className="w-full h-12 rounded-xl border border-border/50 bg-muted/20 pl-12 pr-4 text-sm font-medium transition-all focus:border-[#B5651D]/50 focus:ring-4 focus:ring-[#B5651D]/5 outline-none"
                     placeholder="Define new report category..."
                   />
                 </div>
                 <button
                   onClick={handleAddReason}
                   className="h-12 px-6 flex items-center justify-center gap-2 rounded-xl bg-foreground text-background hover:bg-[#B5651D] hover:text-white transition-all shadow-sm active:scale-95 text-[10px] font-black uppercase tracking-widest"
                 >
                   <IconPlus size={16} />
                   Add Guideline
                 </button>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                 {reportReasons.map((reason, idx) => (
                   <div
                     key={idx}
                     className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-muted/5 group hover:border-[#B5651D]/30 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-black/[0.02]"
                   >
                     <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-[#B5651D]/20 group-hover:bg-[#B5651D] transition-colors" />
                        <span className="text-[12px] font-bold text-foreground/80 leading-snug">{reason}</span>
                     </div>
                     <button
                       onClick={() => handleRemoveReason(reason)}
                       className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground/20 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
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
    </div>
  );
}
