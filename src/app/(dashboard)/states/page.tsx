"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconMapPin,
  IconPlus,
  IconSearch,
  IconReload,
  IconEdit,
  IconTrash,
  IconLoader2,
  IconX,
  IconDeviceFloppy,
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import { locationApi, countryApi, type State, type Country } from "@/lib/api";
import { toast } from "react-toastify";

export default function StatesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    countryId: "",
    isActive: true,
  });

  const { data: stateData, isLoading, isRefetching } = useQuery({
    queryKey: ["states", page, limit, searchTerm, countryFilter],
    queryFn: () => locationApi.getStates({ page, limit, search: searchTerm, countryId: countryFilter || undefined }),
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["all-countries"],
    queryFn: () => countryApi.getCountries(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => locationApi.createState(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      toast.success("State created successfully");
      closeAndReset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create state");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => locationApi.updateState(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      toast.success("State updated successfully");
      closeAndReset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update state");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationApi.deleteState(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["states"] });
      toast.success("State deleted successfully");
      setIsDeleteOpen(false);
      setSelectedState(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete state");
    },
  });

  const closeAndReset = () => {
    setIsAddOpen(false);
    setSelectedState(null);
    setFormData({ name: "", code: "", countryId: "", isActive: true });
  };

  const handleEdit = (state: State) => {
    setSelectedState(state);
    setFormData({
      name: state.name,
      code: state.code,
      countryId: typeof state.countryId === 'object' ? state.countryId._id : state.countryId,
      isActive: state.isActive,
    });
    setIsAddOpen(true);
  };

  const handleDeleteClick = (state: State) => {
    setSelectedState(state);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedState) {
      updateMutation.mutate({ id: selectedState._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const states = stateData?.data || [];
  const meta = stateData?.meta;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 font-sans max-w-[1600px] mx-auto select-none px-4">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#B5651D]/10 flex items-center justify-center text-[#B5651D]">
            <IconMapPin size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">States</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Geographic Regions</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group w-[180px]">
             <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm appearance-none"
            >
              <option value="">All Countries</option>
              {countries.map((c: Country) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="relative group w-[180px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-[#B5651D] transition-colors" />
            <input
              type="text"
              placeholder="Search state..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-slate-100 bg-white pl-9 pr-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["states"] })}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
            title="Refresh"
          >
            <IconReload className={twMerge("h-3.5 w-3.5", (isLoading || isRefetching) && "animate-spin")} />
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="h-9 px-4 rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#B5651D]/20 hover:opacity-90 active:scale-95 transition-all outline-none border-none"
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
            <IconLoader2 className="h-8 w-8 animate-spin text-[#B5651D]/20" />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading states...</p>
          </div>
        ) : states.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-8 text-center rounded-2xl bg-white shadow-sm border border-slate-100">
            <IconMapPin size={32} className="text-slate-100" strokeWidth={1.5} />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No states found</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/30">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">State Name</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Country</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Code</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {states.map((state: State) => (
                      <tr key={state._id} className="group transition-colors hover:bg-slate-50/50">
                        <td className="px-8 py-4">
                          <span className="text-[13px] font-bold text-slate-700 leading-tight">{state.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[11px] font-bold text-slate-500">
                            {typeof state.countryId === 'object' ? state.countryId.name : 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[11px] font-mono font-bold text-[#B5651D]">{state.code}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={twMerge(
                            "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider",
                            state.isActive ? "bg-emerald-400 text-white shadow-lg shadow-emerald-400/20" : "bg-slate-200 text-slate-500"
                          )}>
                            {state.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(state)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-[#B5651D] border border-transparent hover:border-slate-100 transition-all shadow-none hover:shadow-sm"
                            >
                              <IconEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(state)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-red-500 border border-transparent hover:border-slate-100 transition-all shadow-none hover:shadow-sm"
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

            {/* Mobile View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {states.map((state: State) => (
                <div key={state._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-700">{state.name}</h3>
                      <p className="text-[10px] font-bold text-[#B5651D] uppercase tracking-widest mt-0.5">
                        {typeof state.countryId === 'object' ? state.countryId.name : ''} | Code: {state.code}
                      </p>
                    </div>
                    <span className={twMerge(
                      "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider",
                      state.isActive ? "bg-emerald-400 text-white" : "bg-slate-200 text-slate-500"
                    )}>
                      {state.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEdit(state)}
                      className="flex-1 h-9 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-[#B5651D] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <IconEdit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(state)}
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

        {/* Pagination */}
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
                  .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === meta.totalPages)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-slate-300 px-1">...</span>}
                      <button
                        onClick={() => setPage(p)}
                        className={twMerge(
                          "h-8 min-w-[32px] rounded-xl px-2 text-[11px] font-bold transition-all",
                          page === p ? "bg-[#B5651D] text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
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

      {/* State Dialog */}
      <Dialog.Root open={isAddOpen} onOpenChange={(open) => !open && closeAndReset()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-50 w-full max-sm:max-w-[90%] sm:max-w-sm translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border-0 bg-white p-6 shadow-2xl outline-none ring-1 ring-slate-100 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-sm font-bold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#B5651D]/10 flex items-center justify-center text-[#B5651D]">
                  {selectedState ? <IconEdit size={14} /> : <IconPlus size={14} />}
                </div>
                {selectedState ? "Update State" : "New State"}
              </Dialog.Title>
              <Dialog.Close className="h-7 w-7 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all">
                <IconX size={14} />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                <select
                  required
                  value={formData.countryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, countryId: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm appearance-none"
                >
                  <option value="">Select Country</option>
                  {countries.map((c: Country) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. California"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State Code</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. CA"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="h-10 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[true, false].map((s) => (
                    <button
                      key={String(s)}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, isActive: s }))}
                      className={twMerge(
                        "h-10 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset transition-all",
                        formData.isActive === s
                          ? "bg-[#B5651D] text-white shadow-lg ring-transparent"
                          : "text-slate-400 bg-white ring-slate-100 hover:bg-slate-50"
                      )}
                    >
                      {s ? "Active" : "Inactive"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="h-11 w-full rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-[11px] font-black uppercase tracking-widest text-white shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <IconDeviceFloppy size={18} />
                      {selectedState ? "Save Changes" : "Create State"}
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
                <Dialog.Title className="text-sm font-bold text-slate-800">Delete State?</Dialog.Title>
                <Dialog.Description className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Remove "{selectedState?.name}"?
                </Dialog.Description>
              </div>
              <div className="flex gap-2 w-full pt-2">
                <Dialog.Close className="h-9 flex-1 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 ring-1 ring-slate-100 transition-all hover:bg-slate-100">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={() => selectedState && deleteMutation.mutate(selectedState._id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 h-9 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 shadow-lg transition-all active:scale-95"
                >
                  {deleteMutation.isPending ? <IconLoader2 size={16} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
