"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconQuestionMark,
  IconPlus,
  IconReload,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconX,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import { faqService, type FAQ } from "@/lib/services/faqService";
import { toast } from "sonner";

interface FAQFormData {
  question: string;
  answer: string;
  isPublish: boolean;
  sortOrder: number;
}

export default function FAQsPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

  // Form state
  const [formData, setFormData] = useState<FAQFormData>({
    question: "",
    answer: "",
    isPublish: true,
    sortOrder: 0,
  });

  // Queries
  const { data: faqs = [], isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => faqService.getFAQs(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: FAQFormData) => faqService.createFAQ(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ created successfully");
      closeAndReset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create FAQ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FAQFormData> }) =>
      faqService.updateFAQ(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ updated successfully");
      closeAndReset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update FAQ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqService.deleteFAQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("FAQ deleted successfully");
      setIsDeleteOpen(false);
      setSelectedFAQ(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete FAQ");
    },
  });

  const closeAndReset = () => {
    setIsAddOpen(false);
    setSelectedFAQ(null);
    setFormData({
      question: "",
      answer: "",
      isPublish: true,
      sortOrder: 0,
    });
  };

  const handleEdit = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      isPublish: faq.isPublish,
      sortOrder: faq.sortOrder,
    });
    setIsAddOpen(true);
  };

  const togglePublish = (faq: FAQ) => {
    updateMutation.mutate({
      id: faq._id,
      data: { isPublish: !faq.isPublish },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      return toast.warning("Please fill in all required fields");
    }

    if (selectedFAQ) {
      updateMutation.mutate({ id: selectedFAQ._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">FAQ Management</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Manage Frequently Asked Questions visible in the mobile app.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 hover:text-[#B5651D] transition-all disabled:opacity-50 shadow-sm"
            title="Reload FAQs"
          >
            <IconReload size={16} className={twMerge((isLoading || isRefetching) && "animate-spin")} />
          </button>

          <button
            onClick={() => {
              setSelectedFAQ(null);
              setFormData({ question: "", answer: "", isPublish: true, sortOrder: faqs.length });
              setIsAddOpen(true);
            }}
            className="h-9 px-4 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-[11px] font-black uppercase tracking-widest shadow-md shadow-[#B5651D]/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 border-none outline-none"
          >
            <IconPlus size={16} stroke={3} />
            Add FAQ
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
            <IconLoader2 className="h-8 w-8 animate-spin text-[#B5651D]/25" />
            <p className="text-[11px] font-bold text-muted-foreground/30">Loading FAQs...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-8 text-center rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
            <IconQuestionMark size={32} className="text-muted-foreground/10" strokeWidth={1.5} />
            <p className="text-xs font-bold text-muted-foreground/50">No FAQs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {faqs.map((faq) => (
              <div
                key={faq._id}
                className={twMerge(
                  "bg-card rounded-2xl p-5 shadow-sm ring-1 ring-black/[0.04] flex flex-col justify-between gap-4 border-l-4",
                  faq.isPublish ? "border-l-[#B5651D]" : "border-l-slate-300"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="text-[#B5651D] font-black">Q.</span>
                      {faq.question}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-500">
                        Order: {faq.sortOrder}
                      </span>
                      <button
                        onClick={() => togglePublish(faq)}
                        className={twMerge(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ring-1 ring-inset uppercase transition-all",
                          faq.isPublish
                            ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10 hover:bg-emerald-100"
                            : "bg-slate-50 text-slate-600 ring-slate-500/10 hover:bg-slate-100"
                        )}
                        title={faq.isPublish ? "Unpublish" : "Publish"}
                      >
                        {faq.isPublish ? <IconEye size={10} /> : <IconEyeOff size={10} />}
                        {faq.isPublish ? "Published" : "Draft"}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-500 pl-5 whitespace-pre-line leading-relaxed">
                    <span className="text-slate-400 font-bold mr-1">A.</span>
                    {faq.answer}
                  </p>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-50 pt-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(faq)}
                    className="h-8 px-3 rounded-lg border border-slate-100 bg-white text-muted-foreground/60 hover:text-[#B5651D] hover:border-[#B5651D]/20 transition-all flex items-center gap-1.5 text-[10px] font-bold"
                  >
                    <IconEdit size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFAQ(faq);
                      setIsDeleteOpen(true);
                    }}
                    className="h-8 w-8 rounded-lg border border-slate-100 bg-white text-muted-foreground/60 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all flex items-center justify-center"
                  >
                    <IconTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog.Root open={isAddOpen} onOpenChange={(o) => !o && closeAndReset()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 flex w-[calc(100%-1.5rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col rounded-2xl border-0 bg-card p-6 shadow-2xl outline-none ring-1 ring-black/[0.08] animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 mb-4">
              <Dialog.Title className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B5651D]/10 text-[#B5651D]">
                  <IconQuestionMark size={14} />
                </span>
                {selectedFAQ ? "Edit FAQ" : "Add FAQ"}
              </Dialog.Title>
              <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80">
                <IconX size={14} />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Question</label>
                <input
                  required
                  value={formData.question}
                  onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/30 px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                  placeholder="Enter the question..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Answer</label>
                <textarea
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData((p) => ({ ...p, answer: e.target.value }))}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50/30 p-3 text-xs font-medium text-foreground outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                  placeholder="Enter the answer..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Display Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                    className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50/30 px-3 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-[#B5651D]/25 focus:border-[#B5651D]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground/70 uppercase block">Status</label>
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, isPublish: !p.isPublish }))}
                    className={twMerge(
                      "h-10 w-full rounded-xl text-xs font-bold capitalize ring-1 ring-inset transition-colors",
                      formData.isPublish
                        ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10"
                        : "bg-slate-100 text-slate-600 ring-slate-500/10"
                    )}
                  >
                    {formData.isPublish ? "Published" : "Draft"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-black/[0.06] pt-4 mt-6">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="h-10 px-4 rounded-xl border border-slate-100 text-slate-500 text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="h-10 px-4 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-xs font-bold shadow-md shadow-[#B5651D]/20 hover:opacity-90 flex items-center gap-2 border-none outline-none"
                >
                  <IconDeviceFloppy size={14} />
                  Save FAQ
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-1.5rem)] max-w-sm translate-x-[-50%] translate-y-[-50%] rounded-2xl border-0 bg-card p-6 shadow-2xl outline-none ring-1 ring-black/[0.08] animate-in zoom-in-95 fade-in duration-200">
            <Dialog.Title className="text-sm font-bold text-foreground">
              Delete FAQ
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-xs text-muted-foreground">
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </Dialog.Description>
            <div className="flex justify-end gap-2 mt-6">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="h-9 px-4 rounded-xl border border-slate-100 text-slate-500 text-xs font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={() => selectedFAQ && deleteMutation.mutate(selectedFAQ._id)}
                disabled={deleteMutation.isPending}
                className="h-9 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-600/20 hover:bg-rose-700 border-none outline-none flex items-center justify-center"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
