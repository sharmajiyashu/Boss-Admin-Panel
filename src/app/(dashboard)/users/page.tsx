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
  IconMapPin
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import { userService, type IUser } from "@/lib/services/userService";
import { getErrorMessage } from "@/lib/errorMessage";
import { NativeSelect } from "@/components/ui/NativeSelect";
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

  const closeEditDialog = () => {
    setIsEditOpen(false);
    setSelectedUser(null);
  };

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
      closeEditDialog();
    },
    onError: (error: unknown) =>
      toast.error(getErrorMessage(error, "Failed to update user")),
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
              className="h-9 w-full rounded-xl border-0 bg-muted/60 pl-9 pr-3 text-xs font-semibold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
            />
          </div>

          <div className="w-[148px] min-w-[130px]">
            <NativeSelect
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by role"
            >
              <option value="">All roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </NativeSelect>
          </div>

          <input
            type="text"
            placeholder="City..."
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 w-[140px] rounded-xl border-0 bg-muted/60 px-3 text-xs font-semibold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] outline-none focus:ring-2 focus:ring-[#B5651D]/20"
          />

          <button
            type="button"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
            className="flex h-9 w-9 items-center justify-center rounded-xl border-0 bg-muted/60 text-muted-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05] transition-all hover:bg-muted/80 active:scale-95"
            title="Refresh"
          >
            <IconReload className={twMerge("h-3.5 w-3.5", (isLoading || isRefetching) && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Main Table identical to categories */}
      <div className="overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
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
              <tbody className="divide-y divide-black/[0.04]">
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
          <div className="flex items-center justify-between border-t border-black/[0.06] bg-muted/15 px-8 py-3">
            <div className="text-[10px] font-bold text-muted-foreground/30">
              Showing {((page - 1) * limit) + 1} - {Math.min(page * limit, meta.total)} of {meta.total} Users
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

      {/* Edit User Modal */}
      <Dialog.Root
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] animate-in fade-in duration-200" />
          <Dialog.Content className="fixed left-[50%] top-[45%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl border-0 bg-card p-6 shadow-2xl outline-none ring-1 ring-black/[0.08] animate-in zoom-in-95 fade-in duration-200">
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
              <div className="mb-2 flex flex-col items-center gap-2 rounded-xl bg-muted/30 p-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-card font-bold text-[#B5651D] text-lg uppercase shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.05]">
                   {selectedUser?.firstName[0]}{selectedUser?.lastName[0]}
                </div>
                <div className="text-center">
                  <h3 className="text-xs font-bold text-foreground">{selectedUser?.firstName} {selectedUser?.lastName}</h3>
                  <p className="text-[10px] font-medium text-muted-foreground/50">{selectedUser?.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground/50 ml-1">Access Status</label>
                <NativeSelect
                  value={editData.status}
                  onChange={(e) =>
                    setEditData((p) => ({
                      ...p,
                      status: e.target.value as IUser["status"],
                    }))
                  }
                  className="text-[11px] font-bold"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </NativeSelect>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground/50 ml-1">Platform Role</label>
                <NativeSelect
                  value={editData.userRole}
                  onChange={(e) => setEditData((p) => ({ ...p, userRole: e.target.value }))}
                  className="text-[11px] font-bold"
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </NativeSelect>
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
