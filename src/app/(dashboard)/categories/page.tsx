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
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 font-sans max-w-[1600px] mx-auto select-none">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#b66dff]/10 flex items-center justify-center text-[#b66dff]">
            <IconCategory size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Categories</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Market Classification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group w-[220px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-[#b66dff] transition-colors" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-slate-100 bg-white pl-9 pr-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#b66dff]/20 shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["categories"] })}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            title="Refresh"
          >
            <IconReload className={twMerge("h-3.5 w-3.5", (isLoading || isRefetching) && "animate-spin")} />
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#da8cff] to-[#9a55ff] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#b66dff]/20 hover:opacity-90 active:scale-95 transition-all outline-none border-none"
          >
            <IconPlus size={16} stroke={3} />
            Add New
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-white shadow-sm border border-slate-100">
            <IconLoader2 className="h-8 w-8 animate-spin text-[#b66dff]/20" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-8 text-center rounded-2xl bg-white shadow-sm border border-slate-100">
            <IconCategory size={32} className="text-slate-100" strokeWidth={1.5} />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No categories found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="overflow-x-auto min-h-[360px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/30">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {categories.map((category) => (
                      <tr key={category._id || category.id} className="group transition-colors hover:bg-slate-50/50">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 overflow-hidden ring-1 ring-slate-100">
                              {category.media?.url ? (
                                <img src={category.media.url} alt={category.name} className="h-full w-full object-cover" />
                              ) : (
                                <IconCategory size={18} className="text-slate-200" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-slate-700 leading-tight">{category.name}</span>
                              <span className="text-[10px] font-medium text-slate-400 truncate max-w-[280px]">{category.description || "No description provided"}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={twMerge(
                            "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider",
                            category.status === "active" ? "bg-emerald-400 text-white shadow-lg shadow-emerald-400/20" : "bg-slate-200 text-slate-500"
                          )}>
                            {category.status}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(category)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-[#b66dff] border border-transparent hover:border-slate-100 transition-all shadow-none hover:shadow-sm"
                              title="Edit"
                            >
                              <IconEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(category)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-red-500 border border-transparent hover:border-slate-100 transition-all shadow-none hover:shadow-sm"
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
                  key={category._id || category.id}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 overflow-hidden ring-1 ring-slate-100 flex items-center justify-center">
                        {category.media?.url ? (
                          <img src={category.media.url} alt={category.name} className="h-full w-full object-cover" />
                        ) : (
                          <IconCategory size={20} className="text-slate-200" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-700">{category.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          ID-{String(category._id || category.id).slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className={twMerge(
                      "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider",
                      category.status === "active" ? "bg-emerald-400 text-white" : "bg-slate-200 text-slate-500"
                    )}>
                      {category.status}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-slate-400 line-clamp-2">
                    {category.description || "No description available for this category."}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="flex-1 h-9 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-[#b66dff] hover:text-white transition-all flex items-center justify-center gap-2"
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

        {/* Pagination Bar */}
        {meta && meta.totalPages > 1 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white shadow-sm border border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Records {((page - 1) * limit) + 1} — {Math.min(page * limit, meta.total)} <span className="mx-2 opacity-50">/</span> TOTAL {meta.total}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-100 transition-all hover:bg-white disabled:opacity-20 active:scale-95"
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
                        <span className="text-slate-300 px-1">...</span>
                      )}
                      <button
                        onClick={() => setPage(p)}
                        className={twMerge(
                          "h-8 min-w-[32px] rounded-xl px-2 text-[11px] font-bold transition-all",
                          page === p
                            ? "bg-gradient-to-r from-[#da8cff] to-[#9a55ff] text-white shadow-lg shadow-[#b66dff]/20"
                            : "text-slate-400 ring-1 ring-transparent hover:bg-white hover:text-[#b66dff] hover:ring-slate-100"
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
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-100 transition-all hover:bg-white disabled:opacity-20 active:scale-95"
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog.Root open={isAddOpen} onOpenChange={(open) => !open && closeAndReset()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border-0 bg-white p-6 shadow-2xl outline-none ring-1 ring-slate-100 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-sm font-bold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#b66dff]/10 flex items-center justify-center text-[#b66dff]">
                  {selectedCategory ? <IconEdit size={14} /> : <IconPlus size={14} />}
                </div>
                {selectedCategory ? "Update Category" : "New Category"}
              </Dialog.Title>
              <Dialog.Close className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">
                <IconX size={14} />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                <div className="group relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-100 shadow-sm">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <IconPhoto size={24} className="text-slate-100" strokeWidth={1} />
                  )}
                  <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <IconCloudUpload className="text-white" size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Logo / Cover</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                <input
                  required
                  type="text"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#b66dff]/20 shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Summary</label>
                <textarea
                  placeholder="Classification details..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[90px] w-full resize-none rounded-xl border border-slate-100 bg-white p-3 text-[11px] font-medium text-slate-600 outline-none focus:ring-2 focus:ring-[#b66dff]/20 shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["active", "inactive"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, status: s }))}
                      className={twMerge(
                        "h-10 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset transition-all",
                        formData.status === s
                          ? "bg-[#b66dff] text-white shadow-lg shadow-[#b66dff]/20 ring-transparent"
                          : "text-slate-400 bg-white ring-slate-100 hover:bg-slate-50"
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
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-[#da8cff] to-[#9a55ff] text-[11px] font-black uppercase tracking-widest text-white shadow-lg shadow-[#b66dff]/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <IconDeviceFloppy size={18} />
                      {selectedCategory ? "Save Changes" : "Create Category"}
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
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-sm animate-in fade-in duration-150" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-50 w-full max-w-[300px] translate-x-[-50%] translate-y-[-50%] rounded-2xl border-0 bg-white p-6 shadow-2xl ring-1 ring-slate-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center shadow-inner">
                <IconAlertCircle size={24} />
              </div>
              <div>
                <Dialog.Title className="text-sm font-bold text-slate-800">Purge Classification?</Dialog.Title>
                <Dialog.Description className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Remove category "{selectedCategory?.name}"?
                </Dialog.Description>
              </div>

              <div className="flex gap-2 w-full pt-2">
                <Dialog.Close className="h-9 flex-1 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 ring-1 ring-slate-100 transition-all hover:bg-slate-100">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={() => selectedCategory && deleteMutation.mutate(selectedCategory._id || selectedCategory.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 h-9 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95"
                >
                  {deleteMutation.isPending ? <IconLoader2 size={16} className="animate-spin" /> : "Purge"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
