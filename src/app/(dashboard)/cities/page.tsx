"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconBuildingCommunity,
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
  IconChevronRight,
  IconMapPin,
  IconWorld
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import { locationApi, countryApi, type City, type State, type Country } from "@/lib/api";
import { toast } from "react-toastify";

export default function CitiesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    stateId: "",
    countryId: "",
    latitude: 0,
    longitude: 0,
    isActive: true,
  });

  const { data: cityData, isLoading, isRefetching } = useQuery({
    queryKey: ["cities", page, limit, searchTerm, stateFilter, countryFilter],
    queryFn: () => locationApi.getCities({ 
      page, 
      limit, 
      search: searchTerm, 
      stateId: stateFilter || undefined,
      countryId: countryFilter || undefined 
    }),
  });

  const { data: countries = [] } = useQuery({
    queryKey: ["all-countries"],
    queryFn: () => countryApi.getCountries(),
  });

  const { data: states = [] } = useQuery({
    queryKey: ["all-states", countryFilter || formData.countryId],
    queryFn: () => locationApi.getStates({ countryId: countryFilter || formData.countryId || undefined }),
    enabled: !!(countryFilter || formData.countryId)
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => locationApi.createCity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("City created successfully");
      closeAndReset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create city");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => locationApi.updateCity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("City updated successfully");
      closeAndReset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update city");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationApi.deleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("City deleted successfully");
      setIsDeleteOpen(false);
      setSelectedCity(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete city");
    },
  });

  const closeAndReset = () => {
    setIsAddOpen(false);
    setSelectedCity(null);
    setFormData({ name: "", stateId: "", countryId: "", latitude: 0, longitude: 0, isActive: true });
  };

  const handleEdit = (city: City) => {
    setSelectedCity(city);
    setFormData({
      name: city.name,
      stateId: typeof city.stateId === 'object' ? city.stateId._id : city.stateId,
      countryId: typeof city.countryId === 'object' ? city.countryId._id : city.countryId,
      latitude: city.latitude,
      longitude: city.longitude,
      isActive: city.isActive,
    });
    setIsAddOpen(true);
  };

  const handleDeleteClick = (city: City) => {
    setSelectedCity(city);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCity) {
      updateMutation.mutate({ id: selectedCity._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const cities = cityData?.data || [];
  const meta = cityData?.meta;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 font-sans max-w-[1600px] mx-auto select-none px-4">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#B5651D]/10 flex items-center justify-center text-[#B5651D]">
            <IconBuildingCommunity size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Cities</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Urban Centers</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative group w-[150px]">
             <select
              value={countryFilter}
              onChange={(e) => {
                setCountryFilter(e.target.value);
                setStateFilter("");
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

          <div className="relative group w-[150px]">
             <select
              value={stateFilter}
              disabled={!countryFilter}
              onChange={(e) => {
                setStateFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm appearance-none disabled:opacity-50"
            >
              <option value="">All States</option>
              {states.map((s: State) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="relative group w-[150px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 group-focus-within:text-[#B5651D] transition-colors" />
            <input
              type="text"
              placeholder="Search city..."
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
            onClick={() => queryClient.invalidateQueries({ queryKey: ["cities"] })}
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
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loading cities...</p>
          </div>
        ) : cities.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-8 text-center rounded-2xl bg-white shadow-sm border border-slate-100">
            <IconBuildingCommunity size={32} className="text-slate-100" strokeWidth={1.5} />
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">No cities found</p>
          </div>
        ) : (
          <>
            <div className="hidden lg:block overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50 bg-slate-50/30">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">City Name</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">State / Country</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Coordinates</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {cities.map((city: City) => (
                      <tr key={city._id} className="group transition-colors hover:bg-slate-50/50">
                        <td className="px-8 py-4">
                          <span className="text-[13px] font-bold text-slate-700 leading-tight">{city.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <IconMapPin size={12} className="text-[#B5651D]" />
                              <span className="text-[11px] font-bold text-slate-500">
                                {typeof city.stateId === 'object' ? city.stateId.name : 'Unknown'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <IconWorld size={12} className="text-slate-300" />
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {typeof city.countryId === 'object' ? city.countryId.name : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[10px] font-mono text-slate-400">
                            {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={twMerge(
                            "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider",
                            city.isActive ? "bg-emerald-400 text-white shadow-lg shadow-emerald-400/20" : "bg-slate-200 text-slate-500"
                          )}>
                            {city.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(city)}
                              className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white hover:text-[#B5651D] border border-transparent hover:border-slate-100 transition-all shadow-none hover:shadow-sm"
                            >
                              <IconEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(city)}
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
              {cities.map((city: City) => (
                <div key={city._id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-700">{city.name}</h3>
                      <p className="text-[10px] font-bold text-[#B5651D] uppercase tracking-widest mt-0.5">
                        {typeof city.stateId === 'object' ? city.stateId.name : ''} | {typeof city.countryId === 'object' ? city.countryId.name : ''}
                      </p>
                    </div>
                    <span className={twMerge(
                      "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider",
                      city.isActive ? "bg-emerald-400 text-white" : "bg-slate-200 text-slate-500"
                    )}>
                      {city.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleEdit(city)}
                      className="flex-1 h-9 rounded-xl bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-[#B5651D] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <IconEdit size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(city)}
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

      {/* City Dialog */}
      <Dialog.Root open={isAddOpen} onOpenChange={(open) => !open && closeAndReset()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-50 w-full max-sm:max-w-[90%] sm:max-w-sm translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border-0 bg-white p-6 shadow-2xl outline-none ring-1 ring-slate-100 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-sm font-bold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#B5651D]/10 flex items-center justify-center text-[#B5651D]">
                  {selectedCity ? <IconEdit size={14} /> : <IconPlus size={14} />}
                </div>
                {selectedCity ? "Update City" : "New City"}
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
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, countryId: e.target.value, stateId: "" }));
                  }}
                  className="h-10 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm appearance-none"
                >
                  <option value="">Select Country</option>
                  {countries.map((c: Country) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                <select
                  required
                  disabled={!formData.countryId}
                  value={formData.stateId}
                  onChange={(e) => setFormData(prev => ({ ...prev, stateId: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm appearance-none disabled:opacity-50"
                >
                  <option value="">Select State</option>
                  {states.map((s: State) => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Los Angeles"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
                  <input
                    required
                    type="number"
                    step="0.0001"
                    placeholder="34.0522"
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                    className="h-10 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Longitude</label>
                  <input
                    required
                    type="number"
                    step="0.0001"
                    placeholder="-118.2437"
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                    className="h-10 w-full rounded-xl border border-slate-100 bg-white px-3 text-[11px] font-bold text-slate-600 outline-none focus:ring-2 focus:ring-[#B5651D]/20 shadow-sm"
                  />
                </div>
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
                      {selectedCity ? "Save Changes" : "Create City"}
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
                <Dialog.Title className="text-sm font-bold text-slate-800">Delete City?</Dialog.Title>
                <Dialog.Description className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Remove "{selectedCity?.name}"?
                </Dialog.Description>
              </div>
              <div className="flex gap-2 w-full pt-2">
                <Dialog.Close className="h-9 flex-1 rounded-xl bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 ring-1 ring-slate-100 transition-all hover:bg-slate-100">
                  Cancel
                </Dialog.Close>
                <button
                  onClick={() => selectedCity && deleteMutation.mutate(selectedCity._id)}
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
