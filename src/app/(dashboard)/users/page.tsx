"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconUsers,
  IconSearch,
  IconReload,
  IconEdit,
  IconLoader2,
  IconX,
  IconDeviceFloppy,
  IconChevronLeft,
  IconChevronRight,
  IconMail,
  IconPhone,
  IconMapPin,
  IconFilter,
  IconDotsVertical,
  IconCircleCheckFilled,
  IconRosetteFilled,
  IconCircleCheck,
  IconRosette,
  IconEye,
  IconTrash,
  IconLock,
  IconLockOpen,
  IconCalendar,
  IconShieldCheck,
  IconUserCircle
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { userService, type IUser } from "@/lib/services/userService";
import { getErrorMessage } from "@/lib/errorMessage";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { toast } from "react-toastify";
import Image from "next/image";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // Form state for editing
  const [editData, setEditData] = useState<Partial<IUser>>({});

  const closeDossier = () => setIsDossierOpen(false);
  const closeEdit = () => {
    setIsEditOpen(false);
    setEditData({});
  };

  // Queries
  const { data: usersData, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ["users", page, limit, searchTerm, roleFilter],
    queryFn: () => userService.getUsers(page, limit, searchTerm, roleFilter),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IUser> }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User configuration updated");
      closeEdit();
      if (selectedUser) {
        // Refresh selected user data in dossier if open
        const updated = usersData?.data.find(u => (u._id || u.id) === (selectedUser._id || selectedUser.id));
        if (updated) setSelectedUser(updated);
      }
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Update failed")),
  });

  // Since delete is not in userService, we'll mock the behavior or you can add it to service
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.error("User account archived");
      closeDossier();
    },
    onError: (error: unknown) => toast.error(getErrorMessage(error, "Archival failed")),
  });

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setEditData({
      status: user.status,
      userRole: user.userRole,
      isVerified: user.isVerified,
      isPremium: user.isPremium
    });
    setIsEditOpen(true);
  };

  const handleToggleStatus = (user: IUser) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    updateMutation.mutate({ 
        id: user._id || user.id, 
        data: { status: newStatus } 
    });
  };

  const users = usersData?.data || [];
  const meta = usersData?.meta;
  const totalPages = meta?.totalPages || 1;

  const StatusBadge = ({ status }: { status: string }) => (
    <div className={twMerge(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset",
      status === "active" ? "bg-emerald-50 text-emerald-600 ring-emerald-500/20" : "bg-rose-50 text-rose-600 ring-rose-500/20"
    )}>
      <div className={twMerge("h-1.5 w-1.5 rounded-full bg-current", status === "active" && "animate-pulse")} />
      {status}
    </div>
  );

  const UserAvatar = ({ user, className = "h-12 w-12" }: { user: IUser, className?: string }) => {
    const profileImageUrl = (user as any).profileImage?.url;
    return (
      <div className={twMerge(
        "shrink-0 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 font-black relative border border-slate-200/50 shadow-inner overflow-hidden",
        className
      )}>
        {profileImageUrl ? (
          <Image src={profileImageUrl} alt="" fill className="object-cover" />
        ) : (
          <span className="text-[12px] uppercase">{(user.firstName?.[0] || "")+(user.lastName?.[0] || "")}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 font-sans overflow-hidden">
      {/* Premium Header Container */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between p-8 rounded-[32px] bg-white border border-slate-200/60 shadow-sm relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 group-hover:rotate-6 transition-transform">
            <IconUsers size={200} stroke={2} />
         </div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
               <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#b66dff]/10 text-[#b66dff] shadow-sm">
                  <IconShieldCheck size={22} />
               </div>
               <h1 className="text-3xl font-black tracking-tighter text-slate-900">Users</h1>
            </div>
            <p className="text-slate-500 font-medium max-w-md">Overview and management of platform identities and authentication states.</p>
         </div>

         <div className="flex flex-wrap items-center gap-4 relative z-10">
            <div className="relative group">
              <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#b66dff] transition-colors" />
              <input
                type="text"
                placeholder="Search by identity or mail..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="h-12 w-full sm:w-80 rounded-2xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 text-sm font-bold transition-all focus:bg-white focus:border-[#b66dff]/40 focus:ring-4 focus:ring-[#b66dff]/5 outline-none placeholder:text-slate-400"
              />
            </div>

            <button
               onClick={() => refetch()}
               disabled={isLoading || isRefetching}
               className="h-12 w-12 flex items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-[#b66dff] hover:border-[#b66dff]/30 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
               <IconReload size={20} className={twMerge((isLoading || isRefetching) && "animate-spin")} />
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4 bg-white rounded-[32px] border border-slate-200/60 transition-all shadow-sm">
             <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-[#B5651D] animate-spin" />
             </div>
             <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Aggregating User Data...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4 bg-white rounded-[32px] border-dashed border-2 border-slate-200 text-center animate-in zoom-in-95 duration-500">
             <IconUserCircle size={48} className="text-slate-200" />
             <div>
                <p className="text-slate-900 font-bold">No Users Detected</p>
                <p className="text-xs text-slate-400 mt-1">Refine your search parameters or check the synchronization logs.</p>
             </div>
          </div>
        ) : (
          <>
            {/* High-Fidelity Table View (Desktop) */}
            <div className="hidden lg:block overflow-hidden rounded-[32px] border border-slate-200/60 bg-white shadow-sm ring-1 ring-slate-100/50">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile & Identity</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Metadata</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Role</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {users.map((user) => (
                    <tr key={user._id || user.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-4">
                          <UserAvatar user={user} className="h-11 w-11 shadow-sm ring-1 ring-slate-200/20" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-slate-900 truncate tracking-tight">{user.firstName} {user.lastName}</span>
                            <div className="flex items-center gap-2 mt-1">
                               {user.isVerified && <IconCircleCheckFilled size={14} className="text-blue-500" />}
                               {user.isPremium && <IconRosetteFilled size={14} className="text-amber-500" />}
                               <span className="text-[10px] font-bold text-slate-400 tracking-tight">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-slate-600">
                            <IconMail size={12} className="opacity-40" />
                            <span className="text-xs font-bold truncate max-w-[180px]">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400">
                            <IconPhone size={12} className="opacity-40" />
                            <span className="text-[10px] font-medium">{user.mobile || "Unregistered"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-200">
                           {user.userRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-8 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                            <button 
                               onClick={() => { setSelectedUser(user); setIsDossierOpen(true); }}
                               className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95"
                               title="View Dossier"
                            >
                               <IconEye size={18} />
                            </button>
                            <button 
                               onClick={() => handleEdit(user)}
                               className="h-10 w-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white hover:text-blue-600 hover:ring-1 hover:ring-blue-100 transition-all shadow-sm active:scale-95"
                               title="Modify Credentials"
                            >
                               <IconEdit size={18} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Adaptive Card View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
               {users.map((user) => (
                 <div key={user._id || user.id} className="bg-white rounded-[28px] p-6 border border-slate-200/60 shadow-sm space-y-5 animate-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-start justify-between">
                       <div className="flex items-center gap-3">
                          <UserAvatar user={user} className="h-14 w-14 shadow-md shadow-slate-100" />
                          <div>
                             <h3 className="text-sm font-black text-slate-900 leading-tight">{user.firstName} {user.lastName}</h3>
                             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{user.userRole}</p>
                          </div>
                       </div>
                       <StatusBadge status={user.status} />
                    </div>

                    <div className="space-y-2.5 py-4 border-y border-slate-100">
                       <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Identity</span>
                          <span className="font-bold text-slate-800">{user.email}</span>
                       </div>
                       <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Contact</span>
                          <span className="font-bold text-slate-500">{user.mobile || "NA"}</span>
                       </div>
                    </div>

                    <div className="flex gap-2">
                       <button 
                          onClick={() => { setSelectedUser(user); setIsDossierOpen(true); }}
                          className="flex-1 h-12 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95"
                       >
                          <IconEye size={16} /> View Dossier
                       </button>
                       <button 
                          onClick={() => handleEdit(user)}
                          className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center active:scale-95 transition-all"
                       >
                          <IconEdit size={18} />
                       </button>
                    </div>
                 </div>
               ))}
            </div>

            {/* Premium Pagination Bar */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-[28px] bg-white border border-slate-200/60 shadow-sm animate-in fade-in duration-700">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Total Managed — {meta?.total} Accounts <span className="mx-2 opacity-30">|</span> PAGE {page} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-20 active:scale-95"
                  >
                    <IconChevronLeft size={18} />
                  </button>

                  <div className="flex items-center gap-1.5 px-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                      .map((p, idx, arr) => (
                        <React.Fragment key={p}>
                          {idx > 0 && arr[idx-1] !== p - 1 && <span className="px-1 text-slate-300">...</span>}
                          <button
                            onClick={() => setPage(p)}
                            className={twMerge(
                              "h-10 min-w-[40px] rounded-xl text-[11px] font-black transition-all",
                              p === page ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:bg-slate-50"
                            )}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 disabled:opacity-20 active:scale-95"
                  >
                    <IconChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Dossier Modal (View Mode) */}
      <Dialog.Root open={isDossierOpen} onOpenChange={setIsDossierOpen}>
        <Dialog.Portal>
           <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" />
           <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[40px] border-0 bg-white p-0 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              {selectedUser && (
                <>
                  <Dialog.Title className="sr-only">User Dossier: {selectedUser.firstName}</Dialog.Title>
                  <Dialog.Description className="sr-only">Full administrative overview and identity metadata for this user account.</Dialog.Description>
                  
                  {/* Dossier Header */}
                  <div className="relative h-48 shrink-0 bg-slate-900 overflow-hidden">
                     <div className="absolute inset-0 bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] opacity-80" />
                     <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
                     
                     <div className="absolute top-6 left-8 right-8 flex items-start justify-between z-10">
                        <div className="flex items-center gap-1.5">
                           <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-black text-white uppercase tracking-widest">
                              ID: {selectedUser._id?.slice(-8) || selectedUser.id.slice(-8)}
                           </div>
                           <StatusBadge status={selectedUser.status} />
                        </div>
                        <Dialog.Close className="h-10 w-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-all z-20">
                           <IconX size={20} />
                        </Dialog.Close>
                     </div>

                     <div className="absolute -bottom-8 left-10 flex items-end gap-6 z-10">
                        <UserAvatar user={selectedUser} className="h-32 w-32 rounded-[40px] ring-[6px] ring-white shadow-2xl" />
                        <div className="pb-10">
                           <h2 className="text-2xl font-black text-white tracking-tighter shadow-sm">{selectedUser.firstName} {selectedUser.lastName}</h2>
                           <div className="flex items-center gap-3 mt-1 text-white/70">
                              <span className="text-xs font-bold tracking-tight uppercase">{selectedUser.userRole}</span>
                              <div className="h-1 w-1 rounded-full bg-white/30" />
                              <span className="text-[10px] font-bold uppercase tracking-widest">Global Account</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Dossier Body */}
                  <div className="flex-1 overflow-y-auto p-10 pt-16 scrollbar-none space-y-10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Primary Metadata */}
                        <div className="space-y-8">
                           <section>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                 <IconMail size={12} className="text-[#B5651D]" /> Identity Access
                              </h4>
                              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                                 <p className="text-sm font-black text-slate-900">{selectedUser.email}</p>
                                 <p className="text-[10px] font-bold text-slate-400">Primary Authentication Email</p>
                              </div>
                           </section>

                           <section>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                 <IconPhone size={12} className="text-[#B5651D]" /> Contact Vector
                              </h4>
                              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                                 <p className="text-sm font-black text-slate-900">{selectedUser.mobile || "N/A"}</p>
                                 <p className="text-[10px] font-bold text-slate-400">Mobile Verification Number</p>
                              </div>
                           </section>
                        </div>

                        {/* Additional Context */}
                        <div className="space-y-8">
                           <section>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                 <IconMapPin size={12} className="text-[#B5651D]" /> Operational Origin
                              </h4>
                              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                 <p className="text-sm font-black text-slate-900">
                                    {(selectedUser.location?.city || "Unmapped")}
                                    {selectedUser.location?.state && `, ${selectedUser.location.state}`}
                                 </p>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1 line-clamp-1">{selectedUser.location?.address || "Address details not disclosed."}</p>
                              </div>
                           </section>

                           <section>
                              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                 <IconCalendar size={12} className="text-[#B5651D]" /> System Lifecycle
                              </h4>
                              <div className="grid grid-cols-2 gap-3">
                                 <div className="p-4 rounded-[22px] bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Born On</p>
                                    <p className="text-xs font-black text-slate-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                 </div>
                                 <div className="p-4 rounded-[22px] bg-slate-50 border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">State</p>
                                    <p className="text-xs font-black text-emerald-600">Active</p>
                                 </div>
                              </div>
                           </section>
                        </div>
                     </div>
                  </div>

                  {/* Dossier Intelligence Footer (Actions) */}
                  <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                     <div className="flex gap-2">
                        <button 
                           onClick={() => { closeDossier(); handleEdit(selectedUser); }}
                           className="h-12 px-6 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                        >
                           <IconEdit size={16} /> Modify Profile
                        </button>
                        <button 
                           onClick={() => handleToggleStatus(selectedUser)}
                           disabled={updateMutation.isPending}
                           className={twMerge(
                              "h-12 px-6 rounded-2xl border text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95",
                              selectedUser.status === "active" 
                                ? "bg-white text-rose-600 border-rose-200 hover:bg-rose-50" 
                                : "bg-emerald-600 text-white border-transparent hover:bg-emerald-700"
                           )}
                        >
                           {selectedUser.status === "active" ? (
                              <><IconLock size={16} /> Disable Access</>
                           ) : (
                              <><IconLockOpen size={16} /> Restore Access</>
                           )}
                        </button>
                     </div>

                     <div className="flex gap-2">
                        <button 
                           onClick={() => {
                               if (window.confirm("Archive this identity? This cannot be undone.")) {
                                   deleteMutation.mutate(selectedUser._id || selectedUser.id);
                               }
                           }}
                           disabled={deleteMutation.isPending}
                           className="h-12 w-12 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all active:scale-95"
                           title="Purge Identity"
                        >
                           <IconTrash size={20} />
                        </button>
                     </div>
                  </div>
                </>
              )}
           </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Edit User Modal (Existing structure with refined CSS) */}
      <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px] border-0 bg-white p-0 shadow-2xl animate-in zoom-in-95 duration-200">
            {selectedUser && (
              <div className="flex flex-col">
                 <Dialog.Title className="sr-only">Edit Identity: {selectedUser.firstName}</Dialog.Title>
                 <Dialog.Description className="sr-only">Override administrative flags and system permissions.</Dialog.Description>
                 
                <div className="relative h-24 bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] flex items-center justify-center">
                   <Dialog.Close className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/30 transition-all">
                      <IconX size={16} />
                   </Dialog.Close>
                   <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                      <UserAvatar user={selectedUser} className="h-20 w-20 rounded-[28px] ring-8 ring-white shadow-xl shadow-slate-100" />
                   </div>
                </div>

                <div className="pt-14 pb-8 px-8 text-center bg-white">
                  <h3 className="text-lg font-black text-slate-900 leading-none">{selectedUser.firstName} {selectedUser.lastName}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{selectedUser.email}</p>
                </div>

                <form 
                   onSubmit={(e) => {
                       e.preventDefault();
                       updateMutation.mutate({ id: selectedUser._id || selectedUser.id, data: editData });
                   }} 
                   className="px-8 pb-10 space-y-6 bg-white"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Control</label>
                    <NativeSelect
                      value={editData.status}
                      onChange={(e) => setEditData(p => ({ ...p, status: e.target.value as any }))}
                      className="h-12 text-xs font-bold rounded-2xl bg-slate-50 border-slate-100"
                    >
                      <option value="active">Permit Access</option>
                      <option value="inactive">Deny Access</option>
                    </NativeSelect>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permission Flags</label>
                    <div className="grid grid-cols-2 gap-3">
                       <button
                         type="button"
                         onClick={() => setEditData(p => ({ ...p, isVerified: !p.isVerified }))}
                         className={twMerge(
                           "h-12 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                           editData.isVerified ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-slate-50 text-slate-400 border-slate-100"
                         )}
                       >
                         {editData.isVerified ? "Verified" : "Pending"}
                       </button>
                       <button
                         type="button"
                         onClick={() => setEditData(p => ({ ...p, isPremium: !p.isPremium }))}
                         className={twMerge(
                           "h-12 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                           editData.isPremium ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-400 border-slate-100"
                         )}
                       >
                         {editData.isPremium ? "Premium" : "Standard"}
                       </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="h-12 w-full rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-slate-200 active:scale-95 disabled:opacity-50 transition-all mt-4"
                  >
                    {updateMutation.isPending ? <IconLoader2 size={16} className="animate-spin" /> : <><IconDeviceFloppy size={16} /> Synchronize Access</>}
                  </button>
                </form>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
