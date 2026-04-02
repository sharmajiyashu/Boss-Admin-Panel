"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconHierarchy,
  IconPlus,
  IconSearch,
  IconReload,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconPhoto,
  IconX,
  IconCloudUpload,
  IconDeviceFloppy,
  IconAlertCircle,
  IconSettings,
  IconLayout2,
  IconForms,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import { subcategoryService, type Subcategory, type FieldDefinition } from "@/lib/services/subcategoryService";
import { categoryService } from "@/lib/services/categoryService";
import { toast } from "react-toastify";

interface SubcategoryFormData {
  name: string;
  categoryId: string;
  description: string;
  status: "active" | "inactive";
  media: File | null;
  customFieldDefinitions: FieldDefinition[];
}

export default function SubcategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Form state
  const [formData, setFormData] = useState<SubcategoryFormData>({
    name: "",
    categoryId: "",
    description: "",
    status: "active",
    media: null,
    customFieldDefinitions: [],
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Queries
  const { data: subData, isLoading, isRefetching } = useQuery({
    queryKey: ["subcategories", page, limit, searchTerm],
    queryFn: () => subcategoryService.getSubcategories(page, limit, searchTerm),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories-all"],
    queryFn: () => categoryService.getCategories(1, 100),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: FormData) => subcategoryService.createSubcategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      toast.success("Subcategory created successfully");
      closeAndReset();
    },
    onError: (error: any) => toast.error(error.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => subcategoryService.updateSubcategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      toast.success("Subcategory updated successfully");
      closeAndReset();
    },
    onError: (error: any) => toast.error(error.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subcategoryService.deleteSubcategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      toast.success("Subcategory deleted successfully");
      setIsDeleteOpen(false);
      setSelectedSubcategory(null);
    },
    onError: (error: any) => toast.error(error.message || "Failed to delete"),
  });

  const closeAndReset = () => {
    setIsAddOpen(false);
    setSelectedSubcategory(null);
    setFormData({
      name: "", categoryId: "", description: "",
      status: "active", media: null,
      customFieldDefinitions: []
    });
    setPreviewUrl(null);
  };

  const handleEdit = (sub: Subcategory) => {
    setSelectedSubcategory(sub);
    setFormData({
      name: sub.name,
      categoryId: (sub.category as any)?._id || (sub.category as any)?.id || sub.category,
      description: sub.description || "",
      status: sub.status,
      media: null,
      customFieldDefinitions: sub.customFieldDefinitions || [],
    });
    setPreviewUrl(sub.media?.url || null);
    setIsAddOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, media: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return toast.warning("Please select a parent category");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.categoryId);
    data.append("description", formData.description);
    data.append("status", formData.status);
    if (formData.media) data.append("media", formData.media);

    formData.customFieldDefinitions.forEach((def, index) => {
      data.append(`customFieldDefinitions[${index}][label]`, def.label);
      data.append(`customFieldDefinitions[${index}][key]`, def.key);
      data.append(`customFieldDefinitions[${index}][fieldType]`, def.fieldType);
      data.append(`customFieldDefinitions[${index}][isFilterable]`, String(def.isFilterable));
      data.append(`customFieldDefinitions[${index}][isRequired]`, String(def.isRequired));

      if (['select', 'switch', 'checkbox'].includes(def.fieldType) && def.options) {
        def.options.forEach((opt, optIdx) => {
          data.append(`customFieldDefinitions[${index}][options][${optIdx}]`, opt);
        });
      }
    });

    if (selectedSubcategory) {
      updateMutation.mutate({ id: selectedSubcategory._id || selectedSubcategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      customFieldDefinitions: [
        ...prev.customFieldDefinitions,
        { label: "", key: "", fieldType: "text", isFilterable: false, isRequired: false, options: [] }
      ]
    }));
  };

  const removeField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customFieldDefinitions: prev.customFieldDefinitions.filter((_, i) => i !== index)
    }));
  };

  const updateField = (index: number, updates: Partial<FieldDefinition>) => {
    setFormData(prev => ({
      ...prev,
      customFieldDefinitions: prev.customFieldDefinitions.map((f, i) =>
        i === index ? { ...f, ...updates } : f
      )
    }));
  };

  const addOption = (fieldIdx: number) => {
    setFormData(prev => ({
      ...prev,
      customFieldDefinitions: prev.customFieldDefinitions.map((f, i) =>
        i === fieldIdx ? { ...f, options: [...(f.options || []), ""] } : f
      )
    }));
  };

  const removeOption = (fieldIdx: number, optIdx: number) => {
    setFormData(prev => ({
      ...prev,
      customFieldDefinitions: prev.customFieldDefinitions.map((f, i) =>
        i === fieldIdx ? { ...f, options: (f.options || []).filter((_, oi) => oi !== optIdx) } : f
      )
    }));
  };

  const updateOption = (fieldIdx: number, optIdx: number, val: string) => {
    setFormData(prev => ({
      ...prev,
      customFieldDefinitions: prev.customFieldDefinitions.map((f, i) =>
        i === fieldIdx ? { ...f, options: (f.options || []).map((o, oi) => oi === optIdx ? val : o) } : f
      )
    }));
  };

  const subs = subData?.data || [];
  const meta = subData?.meta;
  const cats = categoriesData?.data || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 font-sans">
      {/* Header section identical to categories */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#B5651D]/5 flex items-center justify-center text-[#B5651D]">
            <IconHierarchy size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Subcategories</h1>
            <p className="text-[11px] font-medium text-muted-foreground/60">Manage your product categorization levels</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group w-[220px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-border bg-card/40 pl-9 pr-3 text-xs font-semibold focus:border-border focus:ring-0 outline-none"
            />
          </div>

          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["subcategories"] })}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted transition-all active:scale-95 shadow-none"
            title="Refresh"
          >
            <IconReload className={twMerge("h-3.5 w-3.5", (isLoading || isRefetching) && "animate-spin")} />
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-[12px] font-bold flex items-center gap-2 shadow-lg shadow-[#B5651D]/10 hover:opacity-90 active:scale-95 transition-all outline-none border-none"
          >
            <IconPlus size={16} stroke={3} />
            Add New
          </button>
        </div>
      </div>

      {/* Main Table identical to categories */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground/20" />
            <p className="text-[10px] font-bold text-muted-foreground/30">Loading subcategories...</p>
          </div>
        ) : subs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <IconHierarchy size={32} className="text-muted-foreground/10" strokeWidth={1.5} />
            <p className="text-xs font-bold text-muted-foreground/50">No subcategories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[360px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/5 border-b border-border/30">
                  <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Subcategory</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Parent Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">Fields</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {subs.map((sub) => (
                  <tr key={sub.id} className="group transition-colors hover:bg-muted/[0.15]">
                    <td className="px-8 py-3.5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-[#B5651D]/5 group-hover:text-[#B5651D] transition-colors font-bold text-[10px] border border-border/30 overflow-hidden relative">
                          {sub.media?.url ? (
                            <img src={sub.media.url} alt={sub.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="opacity-30">ID-{String(sub._id || sub.id).slice(-2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-foreground leading-tight">{sub.name}</span>
                          <span className="text-[10px] font-medium text-muted-foreground/30 capitalize truncate max-w-[280px]">{sub.description || "No description provided"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-muted text-muted-foreground border border-border/40 uppercase tracking-tight">
                        {(sub.category as any)?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                       <span className="text-[11px] font-bold text-[#B5651D] px-2 py-0.5 rounded-md bg-[#B5651D]/5 border border-[#B5651D]/10">
                        {sub.customFieldDefinitions?.length || 0}
                       </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={twMerge(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset uppercase",
                        sub.status === "active" ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10" : "bg-red-50 text-red-600 ring-red-500/10"
                      )}>
                        <div className={twMerge("h-1 w-1 rounded-full bg-current", sub.status === "active" && "animate-pulse")} />
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-8 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(sub)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:bg-white hover:text-[#B5651D] border border-transparent hover:border-border transition-all active:scale-95 shadow-none hover:shadow-sm"
                          title="Edit"
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          onClick={() => { setSelectedSubcategory(sub); setIsDeleteOpen(true); }}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:bg-white hover:text-red-500 border border-transparent hover:border-border transition-all active:scale-95 shadow-none hover:shadow-sm"
                          title="Delete"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Floating Pagination Bar */}
        {meta && meta.totalPages > 1 && (
          <div className="px-8 py-3 border-t border-border/20 flex items-center justify-between bg-muted/[0.04]">
            <div className="text-[10px] font-bold text-muted-foreground/30">
              Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, meta.total)} of {meta.total} Subcategories
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-white disabled:opacity-20 transition-all active:scale-95"
              >
                <IconChevronLeft size={14} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={twMerge(
                      "h-7 min-w-[28px] px-1.5 rounded-lg text-[10px] font-bold transition-all",
                      page === p
                        ? "bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white shadow-md shadow-[#B5651D]/10"
                        : "text-muted-foreground hover:bg-white hover:text-[#B5651D]"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-white disabled:opacity-20 transition-all active:scale-95"
              >
                <IconChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Modal */}
      <Dialog.Root open={isAddOpen} onOpenChange={o => !o && closeAndReset()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-[calc(100%-2rem)] max-w-6xl translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-[24px] bg-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-300 border border-border max-h-[94vh] outline-none">

            <form onSubmit={handleSubmit} className="flex h-full max-h-[94vh]">
              {/* Left Side: General Context */}
              <div className="w-[320px] bg-muted/5 p-6 border-r border-border overflow-y-auto scrollbar-none flex flex-col">
                <div className="flex flex-col items-center mb-6 shrink-0">
                  <div className="h-32 w-32 rounded-2xl bg-white border border-border p-1 relative overflow-hidden group shadow-sm mb-4 transition-all hover:border-[#B5651D]">
                    {previewUrl ? <img src={previewUrl} className="h-full w-full object-cover rounded-[14px]" /> : <IconPhoto size={32} className="text-muted-foreground opacity-10" />}
                    <label className="absolute inset-0 bg-[#B5651D] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-500">
                      <IconCloudUpload className="text-white mb-0.5" size={24} />
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Update</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                  <div className="text-center">
                    <Dialog.Title className="text-xl font-black text-foreground uppercase italic leading-none">{selectedSubcategory ? "Modify Record" : "Create Entry"}</Dialog.Title>
                    <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-[0.2em] opacity-40">Sub-Categorization Engine</p>
                  </div>
                </div>

                <div className="space-y-6 flex-1">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-widest flex items-center gap-2">
                      <IconForms size={14} className="text-[#B5651D]" /> Identity Name
                    </label>
                    <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="h-12 w-full rounded-xl border border-border bg-white px-5 text-sm font-bold focus:border-[#B5651D] focus:ring-4 focus:ring-[#B5651D]/5 transition-all outline-none" placeholder="e.g. CASUAL WEAR" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-widest flex items-center gap-2">
                      <IconHierarchy size={14} className="text-[#B5651D]" /> Global Context
                    </label>
                    <select required value={formData.categoryId} onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value }))} className="h-12 w-full rounded-xl border border-border bg-white px-5 text-sm font-bold focus:border-[#B5651D] outline-none">
                      <option value="">Choose Parent Category...</option>
                      {cats.map(c => <option key={c.id} value={c._id || c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground ml-1 uppercase tracking-widest flex items-center gap-2">
                      <IconLayout2 size={14} className="text-[#B5651D]" /> Descriptions
                    </label>
                    <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="h-32 w-full rounded-xl border border-border bg-white p-5 text-sm font-medium focus:border-[#B5651D] outline-none transition-all resize-none shadow-inner" placeholder="Brief outline of this sub-category range..." />
                  </div>
                </div>

                <div className="mt-6 space-y-2.5 pt-4 border-t border-border shrink-0">
                  <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="h-12 w-full rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-[11px] font-black uppercase tracking-[0.15em] shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                    {createMutation.isPending || updateMutation.isPending ? <IconLoader2 size={20} className="animate-spin" /> : <><IconDeviceFloppy size={20} /> Commit Changes</>}
                  </button>
                  <button type="button" onClick={closeAndReset} className="h-10 w-full rounded-lg text-[9px] font-bold text-muted-foreground hover:bg-white hover:border-border border border-transparent transition-all uppercase tracking-widest italic">Abort Operation</button>
                </div>
              </div>

              {/* Right Side: Attribute Definition Engine */}
              <div className="flex-1 p-8 bg-white overflow-y-auto scrollbar-none">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                  <div>
                    <h3 className="text-base font-black text-foreground uppercase tracking-wider italic leading-none">Attribute Architect</h3>
                    <p className="text-[9px] font-bold text-muted-foreground mt-1.5 uppercase tracking-widest opacity-40">Technical Specs Engine</p>
                  </div>
                  <button type="button" onClick={addField} className="h-10 px-5 rounded-lg bg-white border-2 border-border text-[10px] font-black text-foreground hover:border-[#B5651D] hover:text-[#B5651D] transition-all uppercase tracking-widest flex items-center gap-2">
                    <IconPlus size={16} strokeWidth={3} /> Define Attribute
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.customFieldDefinitions.map((field, idx) => (
                    <div key={idx} className="p-6 rounded-2xl bg-white border border-border space-y-6 relative group transition-all hover:bg-muted/[0.02] hover:border-border/80 shadow-sm">
                      <button type="button" onClick={() => removeField(idx)} className="absolute top-5 right-5 h-8 w-8 rounded-lg bg-muted/10 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center border border-transparent hover:border-red-100"><IconX size={16} strokeWidth={2.5} /></button>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-muted-foreground ml-1 uppercase tracking-widest italic opacity-60">Visual Label</label>
                          <input value={field.label} onChange={e => updateField(idx, { label: e.target.value })} className="h-10 w-full bg-white border border-border rounded-lg px-4 text-xs font-bold focus:border-[#B5651D] outline-none" placeholder="e.g. Dimensions" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-muted-foreground ml-1 uppercase tracking-widest italic opacity-60">System Registry Key</label>
                          <input value={field.key} onChange={e => updateField(idx, { key: e.target.value })} className="h-10 w-full bg-white border border-border rounded-lg px-4 text-xs font-mono focus:border-[#B5651D] outline-none" placeholder="e.g. dim_technical" />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-10 pt-4">
                        <div className="space-y-2 w-[240px]">
                          <label className="text-[9px] font-black text-muted-foreground ml-1 uppercase tracking-widest italic opacity-60">Data Logic Processor</label>
                          <select value={field.fieldType} onChange={e => updateField(idx, { fieldType: e.target.value as any })} className="h-11 w-full bg-white border-2 border-border rounded-xl px-4 text-[11px] font-black text-[#B5651D] uppercase tracking-widest outline-none cursor-pointer hover:border-[#B5651D]">
                            <option value="text">String Input</option>
                            <option value="number">Numeric Integer</option>
                            <option value="boolean">Boolean Switch</option>
                            <option value="select">Selection Range</option>
                            <option value="textarea">Extended Text</option>
                            <option value="checkbox">Registry Flag</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-10 pt-6">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={field.isRequired} onChange={e => updateField(idx, { isRequired: e.target.checked })} className="h-6 w-6 rounded-lg border-border text-[#B5651D] focus:ring-4 focus:ring-[#B5651D]/5 cursor-pointer" />
                            <span className="text-[11px] font-black text-foreground uppercase tracking-widest opacity-60">Required</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={field.isFilterable} onChange={e => updateField(idx, { isFilterable: e.target.checked })} className="h-6 w-6 rounded-lg border-border text-[#B5651D] focus:ring-4 focus:ring-[#B5651D]/5 cursor-pointer" />
                            <span className="text-[11px] font-black text-foreground uppercase tracking-widest opacity-60">Filter Tool</span>
                          </label>
                        </div>
                      </div>

                      {['select', 'switch', 'checkbox'].includes(field.fieldType) && (
                        <div className="space-y-6 pt-8 border-t border-border/80">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] italic">Option Pool Registry</label>
                            <button type="button" onClick={() => addOption(idx)} className="text-[10px] font-black text-[#B5651D] hover:underline uppercase tracking-widest leading-none">+ Add Entry</button>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {field.options?.map((opt, optIdx) => (
                              <div key={optIdx} className="flex gap-2 group/val items-center">
                                <input value={opt} onChange={e => updateOption(idx, optIdx, e.target.value)} className="h-9 flex-1 bg-white border border-border rounded-xl px-4 text-[11px] font-bold focus:border-[#B5651D] outline-none shadow-sm" placeholder={`Option ${optIdx + 1}`} />
                                <button type="button" onClick={() => removeOption(idx, optIdx)} className="h-6 w-6 text-red-500 opacity-0 group-hover/val:opacity-100 transition-all flex items-center justify-center shrink-0"><IconX size={16} strokeWidth={3} /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {formData.customFieldDefinitions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 bg-muted/5 rounded-[32px] border-2 border-dashed border-border opacity-60">
                      <IconSettings size={48} className="text-muted-foreground opacity-20 mb-4" />
                      <p className="text-[12px] font-black text-muted-foreground uppercase tracking-[0.4em] italic opacity-30">Zero Attributes Defined</p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 animate-in fade-in" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-50 w-full max-w-[340px] translate-x-[-50%] translate-y-[-50%] rounded-3xl bg-white p-10 shadow-2xl border border-border text-center space-y-8 animate-in zoom-in-95">
            <div className="h-20 w-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto border border-red-100"><IconAlertCircle size={40} strokeWidth={2.5} /></div>
            <div>
              <p className="text-xl font-black text-foreground uppercase italic tracking-tighter leading-none mb-3">Confirm Purge</p>
              <p className="text-[11px] font-bold text-muted-foreground px-4 leading-relaxed opacity-60 italic uppercase tracking-wider">Are you sure you want to permanently remove <span className="text-foreground font-black">"{selectedSubcategory?.name}"</span>?</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => selectedSubcategory && deleteMutation.mutate(selectedSubcategory._id || selectedSubcategory.id)} className="h-14 w-full rounded-2xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">Purge Record Now</button>
              <Dialog.Close className="h-12 w-full rounded-2xl text-[10px] font-bold text-muted-foreground hover:bg-muted transition-all uppercase tracking-widest italic outline-none">Cancel Request</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
