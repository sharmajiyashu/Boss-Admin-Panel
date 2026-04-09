"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconCategory,
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
  IconChevronRight
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import { categoryService, type Category } from "@/lib/services/categoryService";
import { getErrorMessage } from "@/lib/errorMessage";
import { toast } from "react-toastify";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "inactive",
    media: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: categoryData, isLoading, isRefetching } = useQuery({
    queryKey: ["categories", page, limit, searchTerm],
    queryFn: () => categoryService.getCategories(page, limit, searchTerm),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully");
      closeAndReset();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create category"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully");
      closeAndReset();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update category"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully");
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete category"));
    },
  });

  const closeAndReset = () => {
    setIsAddOpen(false);
    setSelectedCategory(null);
    setFormData({ name: "", description: "", status: "active", media: null });
    setPreviewUrl(null);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      status: category.status,
      media: null,
    });
    setPreviewUrl(category.media?.url || null);
    setIsAddOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("status", formData.status);
    if (formData.media) {
      data.append("media", formData.media);
    }

    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory._id || selectedCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, media: file }));
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const categories = categoryData?.data || [];
  const meta = categoryData?.meta;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 font-sans">
      {/* Header section identical to subcategories */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#B5651D]/5 flex items-center justify-center text-[#B5651D]">
            <IconCategory size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Categories</h1>
            <p className="text-[11px] font-medium text-muted-foreground/60">Manage market categories and taxonomy</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group w-[220px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border-0 bg-muted/60 pl-9 pr-3 text-xs font-semibold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
            />
          </div>

          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["categories"] })}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-0 bg-muted/60 text-muted-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] transition-all hover:bg-muted/80 active:scale-95"
            title="Refresh"
          >
            <IconReload className={twMerge("h-3.5 w-3.5", (isLoading || isRefetching) && "animate-spin")} />
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-[12px] font-bold flex items-center gap-2 shadow-lg shadow-[#B5651D]/10 hover:opacity-90 active:scale-95 transition-all outline-none border-none"
          >
            <IconPlus size={16} stroke={3} />
            Add New
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
            <IconLoader2 className="h-8 w-8 animate-spin text-[#B5651D]/20" />
            <p className="text-[11px] font-bold text-muted-foreground/30">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-8 text-center rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
            <IconCategory size={32} className="text-muted-foreground/10" strokeWidth={1.5} />
            <p className="text-xs font-bold text-muted-foreground/50">No categories found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
              <div className="overflow-x-auto min-h-[360px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.05] bg-muted/20">
                      <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-4 text-right text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {categories.map((category) => (
                      <tr key={category.id || category._id} className="group transition-colors hover:bg-muted/[0.15]">
                        <td className="px-8 py-3.5">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-[#B5651D]/5 group-hover:text-[#B5651D] transition-colors font-bold text-[10px] border border-border/30 overflow-hidden relative">
                              {category.media?.url ? (
                                <img src={category.media.url} alt={category.name} className="h-full w-full object-cover" />
                              ) : (
                                <span className="opacity-30">ID-{String(category._id || category.id).slice(-2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-foreground leading-tight">{category.name}</span>
                              <span className="text-[10px] font-medium text-muted-foreground/30 capitalize truncate max-w-[280px]">{category.description || "No description provided"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className={twMerge(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset",
                            category.status === "active" ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10" : "bg-red-50 text-red-600 ring-red-500/10"
                          )}>
                            <div className={twMerge("h-1 w-1 rounded-full bg-current", category.status === "active" && "animate-pulse")} />
                            {category.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-8 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(category)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:bg-white hover:text-[#B5651D] border border-transparent hover:border-border transition-all active:scale-95 shadow-none hover:shadow-sm"
                              title="Edit"
                            >
                              <IconEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(category)}
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
            </div>

            {/* Mobile/Tablet Grid View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div 
                  key={category.id || category._id}
                  className="bg-card rounded-2xl p-5 shadow-sm ring-1 ring-black/[0.04] space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-muted overflow-hidden border border-border/30 flex items-center justify-center">
                        {category.media?.url ? (
                          <img src={category.media.url} alt={category.name} className="h-full w-full object-cover" />
                        ) : (
                          <IconCategory size={20} className="text-muted-foreground/20" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{category.name}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground/40 uppercase truncate max-w-[150px]">
                          ID-{String(category._id || category.id).slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className={twMerge(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-bold ring-1 ring-inset uppercase",
                      category.status === "active" ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10" : "bg-red-50 text-red-600 ring-red-500/10"
                    )}>
                      {category.status}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed line-clamp-2">
                    {category.description || "No description available for this category."}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 h-9 rounded-xl bg-muted/50 text-[10px] font-bold text-foreground hover:bg-[#B5651D] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <IconEdit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className="h-9 w-9 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Premium Floating Pagination Bar */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md shadow-[0_-1px_10px_rgba(0,0,0,0.02)] ring-1 ring-black/[0.04]">
            <div className="text-[10px] font-extrabold text-muted-foreground/40 uppercase tracking-widest">
              Records {((page - 1) * limit) + 1} — {Math.min(page * limit, meta.total)} <span className="mx-2 opacity-50">/</span> TOTAL {meta.total}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground ring-1 ring-black/[0.06] transition-all hover:bg-card disabled:opacity-20 active:scale-95"
              >
                <IconChevronLeft size={16} />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    if (meta.totalPages <= 5) return true;
                    return Math.abs(p - page) <= 2 || p === 1 || p === meta.totalPages;
                  })
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-muted-foreground/30 px-1">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={twMerge(
                          "h-8 min-w-[32px] rounded-xl px-2 text-[11px] font-bold transition-all",
                          page === p
                            ? "bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white shadow-lg shadow-[#B5651D]/20 animate-in zoom-in-90"
                            : "text-muted-foreground ring-1 ring-transparent hover:bg-card hover:text-[#B5651D] hover:ring-black/[0.06]"
                        )}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground ring-1 ring-black/[0.06] transition-all hover:bg-card disabled:opacity-20 active:scale-95"
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Simplified Modal Components */}
      <Dialog.Root open={isAddOpen} onOpenChange={(open) => !open && closeAndReset()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border-0 bg-card p-6 shadow-2xl outline-none ring-1 ring-black/[0.08] animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-sm font-bold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#B5651D]/10 flex items-center justify-center text-[#B5651D]">
                  {selectedCategory ? <IconEdit size={14} /> : <IconPlus size={14} />}
                </div>
                {selectedCategory ? "Update Category" : "New Category"}
              </Dialog.Title>
              <Dialog.Close className="h-7 w-7 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-all">
                <IconX size={14} />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-2 rounded-xl bg-muted/30 p-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
                <div className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card ring-1 ring-black/[0.06]">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <IconPhoto size={20} className="text-muted-foreground/10" strokeWidth={1} />
                  )}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <IconCloudUpload className="text-white" size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-[9px] font-bold text-muted-foreground/40 italic">Support PNG, JPG, WEBP. Max 2MB.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground/50 ml-1">Title</label>
                <input
                  required
                  type="text"
                  placeholder="Enter category name..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-9 w-full rounded-xl border-0 bg-muted/60 px-3 text-[11px] font-bold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground/50 ml-1">Summary</label>
                <textarea
                  placeholder="Tell us about this category..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[80px] w-full resize-none rounded-xl border-0 bg-muted/60 p-3 text-[11px] font-medium text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground/50 ml-1">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["active", "inactive"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, status: s }))}
                      className={twMerge(
                        "h-9 rounded-xl text-[10px] font-bold capitalize ring-1 ring-inset transition-all",
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="h-10 w-full rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-[12px] font-bold text-white shadow-lg shadow-[#B5651D]/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <IconDeviceFloppy size={16} />
                      {selectedCategory ? "Save Changes" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation */}
      <Dialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/10 backdrop-blur-[1px] animate-in fade-in duration-150" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-50 w-full max-w-[280px] translate-x-[-50%] translate-y-[-50%] rounded-2xl border-0 bg-card p-6 shadow-2xl ring-1 ring-black/[0.08]">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <IconAlertCircle size={20} />
              </div>
              <Dialog.Title className="text-sm font-bold">Delete Item?</Dialog.Title>
              <Dialog.Description className="text-[10px] font-medium text-muted-foreground">
                Remove <span className="text-foreground font-bold">"{selectedCategory?.name}"</span>?
              </Dialog.Description>

              <div className="flex gap-2 w-full pt-2">
                <Dialog.Close className="h-8 flex-1 rounded-xl bg-muted/50 text-[10px] font-bold text-muted-foreground ring-1 ring-black/[0.06] transition-all hover:bg-muted/80">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={() => selectedCategory && deleteMutation.mutate(selectedCategory._id || selectedCategory.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 h-8 rounded-xl bg-red-500 text-white text-[10px] font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-all active:scale-95"
                >
                  {deleteMutation.isPending ? <IconLoader2 size={14} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
