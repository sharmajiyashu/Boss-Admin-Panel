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
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconMail,
  IconPhone,
  IconMapPin
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import { userService, type IUser } from "@/lib/services/userService";
import { toast } from "react-toastify";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  // Form state for editing
  const [editData, setEditData] = useState<Partial<IUser>>({
    status: "active",
    userRole: "user",
  });

  // Queries
  const { data: usersData, isLoading, isRefetching } = useQuery({
    queryKey: ["users", page, limit, searchTerm, roleFilter, cityFilter],
    queryFn: () => userService.getUsers(page, limit, searchTerm, roleFilter, cityFilter),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IUser> }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      setIsEditOpen(false);
    },
    onError: (error: any) => toast.error(error.message || "Failed to update user"),
  });

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setEditData({
      status: user.status,
      userRole: user.userRole,
    });
    setIsEditOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateMutation.mutate({ id: selectedUser._id || selectedUser.id, data: editData });
  };

  const users = usersData?.data || [];
  const meta = usersData?.meta;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 font-sans">
      {/* Header section identical to categories */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#B5651D]/5 flex items-center justify-center text-[#B5651D]">
            <IconUsers size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Users</h1>
            <p className="text-[11px] font-medium text-muted-foreground/60">Manage platform users and account permissions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group w-[220px]">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-9 w-full rounded-xl border border-border bg-card/40 pl-9 pr-3 text-xs font-semibold focus:border-border focus:ring-0 outline-none"
            />
          </div>

          <div className="relative h-9 px-2 rounded-xl border border-border bg-card flex items-center">
             <select 
              value={roleFilter} 
              onChange={e => {setRoleFilter(e.target.value); setPage(1);}}
              className="bg-transparent text-[11px] font-bold outline-none cursor-pointer pr-4 appearance-none"
             >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
             </select>
             <div className="absolute right-2 pointer-events-none opacity-30">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
          </div>

          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted transition-all active:scale-95 shadow-none"
            title="Refresh"
          >
            <IconReload className={twMerge("h-3.5 w-3.5", (isLoading || isRefetching) && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main Table identical to categories */}
      <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3">
            <IconLoader2 className="h-6 w-6 animate-spin text-muted-foreground/20" />
            <p className="text-[10px] font-bold text-muted-foreground/30">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 p-8 text-center">
            <IconUsers size={32} className="text-muted-foreground/10" strokeWidth={1.5} />
            <p className="text-xs font-bold text-muted-foreground/50">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[360px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/5 border-b border-border/30">
                  <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">User</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-right text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {users.map((user) => (
                  <tr key={user.id} className="group transition-colors hover:bg-muted/[0.15]">
                    <td className="px-8 py-3.5">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-muted text-muted-foreground group-hover:bg-[#B5651D]/5 group-hover:text-[#B5651D] transition-colors font-bold text-[10px] border border-border/30 overflow-hidden relative uppercase">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-foreground leading-tight">{user.firstName} {user.lastName}</span>
                          <span className="text-[10px] font-medium text-muted-foreground/30 capitalize">{user.userRole}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5">
                          <IconMail size={10} className="text-muted-foreground/40" />
                          <span className="text-[11px] font-medium text-foreground">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <IconPhone size={10} className="text-muted-foreground/40" />
                          <span className="text-[11px] font-medium text-foreground">{user.mobile}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-xs font-medium text-muted-foreground">
                       <div className="flex items-center gap-1.5">
                         <IconMapPin size={12} className="text-[#B5651D]/30" />
                         <span className="text-[11px] font-medium text-foreground">{user.location?.city || "Unknown"}, {user.location?.state || "N/A"}</span>
                       </div>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={twMerge(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset uppercase",
                        user.status === "active" ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10" : "bg-red-50 text-red-600 ring-red-500/10"
                      )}>
                        <div className={twMerge("h-1 w-1 rounded-full bg-current", user.status === "active" && "animate-pulse")} />
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(user)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:bg-white hover:text-[#B5651D] border border-transparent hover:border-border transition-all active:scale-95 shadow-none hover:shadow-sm"
                          title="Edit"
                        >
                          <IconEdit size={14} />
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
              Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, meta.total)} of {meta.total} Users
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

      {/* Edit User Modal */}
      <Dialog.Root open={isEditOpen} onOpenChange={setIsEditOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl bg-card p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200 outline-none border border-border/50">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-sm font-bold flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#B5651D]/10 flex items-center justify-center text-[#B5651D]">
                  <IconEdit size={14} />
                </div>
                Update User Access
              </Dialog.Title>
              <Dialog.Close className="h-7 w-7 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-all">
                <IconX size={14} />
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/20 border border-border/30 mb-2">
                <div className="h-12 w-12 rounded-full bg-white border border-border flex items-center justify-center font-bold text-[#B5651D] text-lg uppercase shadow-sm">
                   {selectedUser?.firstName[0]}{selectedUser?.lastName[0]}
                </div>
                <div className="text-center">
                  <h3 className="text-xs font-bold text-foreground">{selectedUser?.firstName} {selectedUser?.lastName}</h3>
                  <p className="text-[10px] font-medium text-muted-foreground/50">{selectedUser?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground/50 ml-1">Access Status</label>
                <select 
                    value={editData.status} 
                    onChange={e => setEditData(p => ({ ...p, status: e.target.value as any }))}
                    className="h-9 w-full rounded-xl border border-border bg-card px-3 text-[11px] font-bold focus:border-[#B5651D] focus:ring-0 outline-none"
                >
                    <option value="active">Active Entry</option>
                    <option value="inactive">Suspended / Deactivated</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground/50 ml-1">Platform Role</label>
                <select 
                    value={editData.userRole} 
                    onChange={e => setEditData(p => ({ ...p, userRole: e.target.value }))}
                    className="h-9 w-full rounded-xl border border-border bg-card px-3 text-[11px] font-bold focus:border-[#B5651D] focus:ring-0 outline-none"
                >
                    <option value="user">Standard User Pool</option>
                    <option value="admin">Platform Administrator</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="h-10 w-full rounded-xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-[12px] font-bold text-white shadow-lg shadow-[#B5651D]/10 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <IconLoader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <IconDeviceFloppy size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
