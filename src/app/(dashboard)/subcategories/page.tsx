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
  IconChevronLeft,
  IconChevronRight,
  IconForms,
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import {
  subcategoryService,
  type Subcategory,
  type FieldDefinition,
  subcategoryCategoryId,
  subcategoryCategoryName,
} from "@/lib/services/subcategoryService";
import { categoryService } from "@/lib/services/categoryService";
import { getErrorMessage } from "@/lib/errorMessage";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { toast } from "react-toastify";

const FIELD_TYPES = [
  "text",
  "number",
  "boolean",
  "date",
  "select",
  "textarea",
  "switch",
  "checkbox",
] as const satisfies readonly FieldDefinition["fieldType"][];

function isFieldType(value: string): value is FieldDefinition["fieldType"] {
  return (FIELD_TYPES as readonly string[]).includes(value);
}

interface SubcategoryFormData {
  name: string;
  categoryId: string;
  description: string;
  status: "active" | "inactive";
  media: File | null;
  customFieldDefinitions: FieldDefinition[];
}

type DialogTab = "details" | "fields";

export default function SubcategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
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
  const [dialogTab, setDialogTab] = useState<DialogTab>("details");

  // Queries
  const { data: subData, isLoading, isRefetching } = useQuery({
    queryKey: ["subcategories", page, limit, searchTerm, categoryFilter],
    queryFn: () =>
      subcategoryService.getSubcategories(page, limit, searchTerm, "", categoryFilter),
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
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, "Failed to create")),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => subcategoryService.updateSubcategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      toast.success("Subcategory updated successfully");
      closeAndReset();
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, "Failed to update")),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subcategoryService.deleteSubcategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      toast.success("Subcategory deleted successfully");
      setIsDeleteOpen(false);
      setSelectedSubcategory(null);
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, "Failed to delete")),
  });

  const closeAndReset = () => {
    setIsAddOpen(false);
    setSelectedSubcategory(null);
    setDialogTab("details");
    setFormData({
      name: "", categoryId: "", description: "",
      status: "active", media: null,
      customFieldDefinitions: []
    });
    setPreviewUrl(null);
  };

  const loadSubIntoForm = (sub: Subcategory) => {
    setFormData({
      name: sub.name,
      categoryId: subcategoryCategoryId(sub.category),
      description: sub.description || "",
      status: sub.status,
      media: null,
      customFieldDefinitions: sub.customFieldDefinitions || [],
    });
    setPreviewUrl(sub.media?.url || null);
  };

  const openNewDialog = () => {
    setSelectedSubcategory(null);
    setFormData({
      name: "",
      categoryId: "",
      description: "",
      status: "active",
      media: null,
      customFieldDefinitions: [],
    });
    setPreviewUrl(null);
    setDialogTab("details");
    setIsAddOpen(true);
  };

  const handleEdit = (sub: Subcategory) => {
    setSelectedSubcategory(sub);
    loadSubIntoForm(sub);
    setDialogTab("details");
    setIsAddOpen(true);
  };

  const handleOpenManageFields = (sub: Subcategory) => {
    setSelectedSubcategory(sub);
    loadSubIntoForm(sub);
    setDialogTab("fields");
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group w-[220px] min-w-[180px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border-0 bg-muted/60 pl-9 pr-3 text-xs font-semibold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
            />
          </div>

          <div className="min-w-[160px] max-w-[240px] flex-1 sm:flex-none">
            <NativeSelect
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by category"
              className="text-[11px] font-bold"
            >
              <option value="">All categories</option>
              {cats.map((c) => (
                <option key={c.id} value={c._id || c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["subcategories"] })}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-0 bg-muted/60 text-muted-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] transition-all hover:bg-muted/80 active:scale-95"
            title="Refresh"
          >
            <IconReload className={twMerge("h-3.5 w-3.5", (isLoading || isRefetching) && "animate-spin")} />
          </button>

          <button
            type="button"
            onClick={openNewDialog}
            className="h-9 px-4 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-[12px] font-bold flex items-center gap-2 shadow-lg shadow-[#B5651D]/10 hover:opacity-90 active:scale-95 transition-all outline-none border-none"
          >
            <IconPlus size={16} stroke={3} />
            Add New
          </button>
        </div>
      </div>

      {/* Main Table identical to categories */}
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
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
                <tr className="border-b border-black/[0.05] bg-muted/20">
                  <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Subcategory</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Parent Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">Fields</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
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
                        {subcategoryCategoryName(sub.category)}
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
                          type="button"
                          onClick={() => handleEdit(sub)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:bg-white hover:text-[#B5651D] border border-transparent hover:border-border transition-all active:scale-95 shadow-none hover:shadow-sm"
                          title="Edit details"
                        >
                          <IconEdit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenManageFields(sub)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:bg-white hover:text-[#B5651D] border border-transparent hover:border-border transition-all active:scale-95 shadow-none hover:shadow-sm"
                          title="Manage fields"
                        >
                          <IconForms size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubcategory(sub);
                            setIsDeleteOpen(true);
                          }}
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
          <div className="flex items-center justify-between border-t border-black/[0.06] bg-muted/15 px-8 py-3">
            <div className="text-[10px] font-bold text-muted-foreground/30">
              Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, meta.total)} of {meta.total} Subcategories
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground ring-1 ring-black/[0.06] transition-all hover:bg-card disabled:opacity-20 active:scale-95"
              >
                <IconChevronLeft size={14} />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={twMerge(
                      "h-7 min-w-[28px] rounded-lg px-1.5 text-[10px] font-bold transition-all",
                      page === p
                        ? "bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white shadow-md shadow-[#B5651D]/10"
                        : "text-muted-foreground ring-1 ring-transparent hover:bg-card hover:text-[#B5651D] hover:ring-black/[0.06]"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground ring-1 ring-black/[0.06] transition-all hover:bg-card disabled:opacity-20 active:scale-95"
              >
                <IconChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / edit — single column, matches categories (readable, light overlay) */}
      <Dialog.Root open={isAddOpen} onOpenChange={(o) => !o && closeAndReset()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px] animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[48%] z-50 flex max-h-[min(90vh,680px)] w-[calc(100%-1.5rem)] max-w-lg translate-x-[-50%] translate-y-[-50%] flex-col overflow-hidden rounded-2xl border-0 bg-card shadow-2xl outline-none ring-1 ring-black/[0.08] animate-in zoom-in-95 fade-in duration-200">
            <div className="flex shrink-0 items-center justify-between border-b border-black/[0.06] px-5 py-3">
              <Dialog.Title className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#B5651D]/10 text-[#B5651D]">
                  {selectedSubcategory ? <IconEdit size={14} /> : <IconPlus size={14} />}
                </span>
                {selectedSubcategory ? "Edit subcategory" : "New subcategory"}
              </Dialog.Title>
              <Dialog.Close className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80">
                <IconX size={14} />
              </Dialog.Close>
            </div>

            <div
              className="flex shrink-0 gap-1 border-b border-black/[0.06] px-3 py-2"
              role="tablist"
              aria-label="Subcategory form sections"
            >
              <button
                type="button"
                role="tab"
                id="subcat-tab-details"
                aria-selected={dialogTab === "details"}
                aria-controls="subcat-panel-details"
                tabIndex={dialogTab === "details" ? 0 : -1}
                onClick={() => setDialogTab("details")}
                className={twMerge(
                  "flex-1 rounded-lg px-3 py-2 text-center text-[11px] font-bold transition-colors",
                  dialogTab === "details"
                    ? "bg-[#B5651D]/10 text-[#B5651D] ring-1 ring-[#B5651D]/20"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                Details
              </button>
              <button
                type="button"
                role="tab"
                id="subcat-tab-fields"
                aria-selected={dialogTab === "fields"}
                aria-controls="subcat-panel-fields"
                tabIndex={dialogTab === "fields" ? 0 : -1}
                onClick={() => setDialogTab("fields")}
                className={twMerge(
                  "flex-1 rounded-lg px-3 py-2 text-center text-[11px] font-bold transition-colors",
                  dialogTab === "fields"
                    ? "bg-[#B5651D]/10 text-[#B5651D] ring-1 ring-[#B5651D]/20"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                Custom fields
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div
                id="subcat-panel-details"
                role="tabpanel"
                aria-labelledby="subcat-tab-details"
                hidden={dialogTab !== "details"}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"
              >
                <div className="flex flex-col gap-2 rounded-xl bg-muted/30 p-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card ring-1 ring-black/[0.06]">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Subcategory image preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <IconPhoto size={20} className="text-muted-foreground/35" strokeWidth={1} />
                    )}
                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/45 opacity-0 transition-opacity hover:opacity-100">
                      <IconCloudUpload className="text-white" size={14} />
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                  </div>
                  <p className="text-[10px] font-medium text-muted-foreground">PNG, JPG, WEBP · max 2MB</p>
                </div>

                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-bold text-muted-foreground/70">Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="h-9 w-full rounded-xl border-0 bg-muted/60 px-3 text-xs font-semibold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
                    placeholder="Subcategory name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-bold text-muted-foreground/70">Parent category</label>
                  <NativeSelect
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData((p) => ({ ...p, categoryId: e.target.value }))}
                    className="text-xs font-semibold"
                  >
                    <option value="">Select category…</option>
                    {cats.map((c) => (
                      <option key={c.id} value={c._id || c.id}>
                        {c.name}
                      </option>
                    ))}
                  </NativeSelect>
                </div>

                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-bold text-muted-foreground/70">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="min-h-[72px] w-full resize-none rounded-xl border-0 bg-muted/60 p-3 text-xs font-medium text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-bold text-muted-foreground/70">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["active", "inactive"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, status: s }))}
                        className={twMerge(
                          "h-9 rounded-xl text-[10px] font-bold capitalize ring-1 ring-inset transition-colors",
                          formData.status === s
                            ? "bg-[#B5651D]/12 text-[#B5651D] ring-[#B5651D]/35"
                            : "text-muted-foreground ring-black/[0.06] hover:bg-muted/50"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDialogTab("fields")}
                  className="flex w-full items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5 text-left ring-1 ring-black/[0.06] transition-colors hover:bg-[#B5651D]/8 hover:ring-[#B5651D]/20"
                >
                  <span className="text-[10px] font-bold text-muted-foreground">
                    Custom fields
                  </span>
                  <span className="text-[10px] font-bold text-[#B5651D]">
                    {formData.customFieldDefinitions.length} field
                    {formData.customFieldDefinitions.length === 1 ? "" : "s"} →
                  </span>
                </button>
              </div>

              <div
                id="subcat-panel-fields"
                role="tabpanel"
                aria-labelledby="subcat-tab-fields"
                hidden={dialogTab !== "fields"}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4"
              >
                <p className="text-[10px] font-medium leading-snug text-muted-foreground">
                  Extra attributes for product listings in this subcategory. Switch to{" "}
                  <button
                    type="button"
                    className="font-bold text-[#B5651D] underline-offset-2 hover:underline"
                    onClick={() => setDialogTab("details")}
                  >
                    Details
                  </button>{" "}
                  to edit name, category, and status.
                </p>

                <div className="flex items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">
                    Field list
                  </span>
                  <button
                    type="button"
                    onClick={addField}
                    className="flex h-8 items-center gap-1 rounded-lg bg-muted/50 px-2.5 text-[10px] font-bold text-foreground ring-1 ring-black/[0.06] transition-colors hover:bg-[#B5651D]/10 hover:text-[#B5651D] hover:ring-[#B5651D]/25"
                  >
                    <IconPlus size={14} strokeWidth={2.5} />
                    Add field
                  </button>
                </div>

                {formData.customFieldDefinitions.length === 0 ? (
                  <p className="rounded-xl bg-muted/25 py-6 text-center text-[11px] font-medium leading-snug text-muted-foreground ring-1 ring-dashed ring-black/[0.08]">
                    No custom fields yet. Add fields only if listings need extra attributes.
                  </p>
                ) : (
                    <ul className="space-y-3">
                      {formData.customFieldDefinitions.map((field, idx) => (
                        <li
                          key={idx}
                          className="space-y-3 rounded-xl bg-card p-3 shadow-sm ring-1 ring-black/[0.05]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-bold text-muted-foreground/60">Field {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeField(idx)}
                              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove field"
                            >
                              <IconX size={14} />
                            </button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-bold text-muted-foreground/60">Label</label>
                              <input
                                value={field.label}
                                onChange={(e) => updateField(idx, { label: e.target.value })}
                                className="h-8 w-full rounded-lg border-0 bg-muted/50 px-2.5 text-[11px] font-semibold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
                                placeholder="Shown to users"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <label className="text-[9px] font-bold text-muted-foreground/60">Key</label>
                              <input
                                value={field.key}
                                onChange={(e) => updateField(idx, { key: e.target.value })}
                                className="h-8 w-full rounded-lg border-0 bg-muted/50 px-2.5 font-mono text-[11px] text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
                                placeholder="internal_key"
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap items-end gap-3">
                            <div className="min-w-[140px] flex-1 space-y-0.5">
                              <label className="text-[9px] font-bold text-muted-foreground/60">Type</label>
                              <NativeSelect
                                value={field.fieldType}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  if (isFieldType(v)) updateField(idx, { fieldType: v });
                                }}
                                className="h-8 min-h-8 py-1.5 pr-8 text-[11px] font-semibold"
                              >
                                {FIELD_TYPES.map((ft) => (
                                  <option key={ft} value={ft}>
                                    {ft}
                                  </option>
                                ))}
                              </NativeSelect>
                            </div>
                            <label className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-foreground">
                              <input
                                type="checkbox"
                                checked={field.isRequired}
                                onChange={(e) => updateField(idx, { isRequired: e.target.checked })}
                                className="h-4 w-4 rounded border-border"
                              />
                              Required
                            </label>
                            <label className="flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-foreground">
                              <input
                                type="checkbox"
                                checked={field.isFilterable}
                                onChange={(e) => updateField(idx, { isFilterable: e.target.checked })}
                                className="h-4 w-4 rounded border-border"
                              />
                              Filterable
                            </label>
                          </div>
                          {["select", "switch", "checkbox"].includes(field.fieldType) && (
                            <div className="space-y-2 border-t border-black/[0.06] pt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-bold text-muted-foreground/60">Options</span>
                                <button
                                  type="button"
                                  onClick={() => addOption(idx)}
                                  className="text-[10px] font-bold text-[#B5651D] hover:underline"
                                >
                                  Add option
                                </button>
                              </div>
                              <div className="flex flex-col gap-2">
                                {field.options?.map((opt, optIdx) => (
                                  <div key={optIdx} className="flex gap-1">
                                    <input
                                      value={opt}
                                      onChange={(e) => updateOption(idx, optIdx, e.target.value)}
                                      className="h-8 min-w-0 flex-1 rounded-lg border-0 bg-muted/50 px-2 text-[11px] text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
                                      placeholder={`Option ${optIdx + 1}`}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeOption(idx, optIdx)}
                                      className="rounded-lg px-2 text-red-500 hover:bg-red-50"
                                      aria-label="Remove option"
                                    >
                                      <IconX size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                )}
              </div>

              <div className="shrink-0 border-t border-black/[0.06] bg-card px-5 py-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-xs font-bold text-white shadow-lg shadow-[#B5651D]/10 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <IconDeviceFloppy size={16} />
                      {selectedSubcategory ? "Save changes" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirmation — same pattern as categories */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-150" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-50 w-full max-w-[280px] translate-x-[-50%] translate-y-[-50%] rounded-2xl border-0 bg-card p-6 shadow-2xl outline-none ring-1 ring-black/[0.08] animate-in zoom-in-95 fade-in">
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                <IconAlertCircle size={20} />
              </div>
              <Dialog.Title className="text-sm font-bold text-foreground">Delete subcategory?</Dialog.Title>
              <Dialog.Description className="text-[10px] font-medium leading-relaxed text-muted-foreground">
                This will remove{" "}
                <span className="font-bold text-foreground">{selectedSubcategory?.name ?? "this item"}</span>
                .
              </Dialog.Description>
              <div className="flex w-full gap-2 pt-2">
                <Dialog.Close className="h-8 flex-1 rounded-xl bg-muted/50 text-[10px] font-bold text-muted-foreground ring-1 ring-black/[0.06] transition-colors hover:bg-muted/80">
                  Cancel
                </Dialog.Close>
                <button
                  type="button"
                  onClick={() =>
                    selectedSubcategory &&
                    deleteMutation.mutate(selectedSubcategory._id || selectedSubcategory.id)
                  }
                  disabled={deleteMutation.isPending}
                  className="flex h-8 flex-1 items-center justify-center gap-1 rounded-xl bg-red-500 text-[10px] font-bold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
