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
  IconDotsVertical
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
  const [cityFilter, setCityFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("");
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
    queryKey: ["users", page, limit, searchTerm, roleFilter, cityFilter, stateFilter],
    queryFn: () => userService.getUsers(page, limit, searchTerm, roleFilter, cityFilter, stateFilter),
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

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={twMerge(
      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset uppercase tracking-tight",
      status === "active" ? "bg-emerald-50 text-emerald-600 ring-emerald-500/10" : "bg-red-50 text-red-600 ring-red-500/10"
    )}>
      <div className={twMerge("h-1 w-1 rounded-full bg-current", status === "active" && "animate-pulse")} />
      {status}
    </span>
  );

  const UserAvatar = ({ user, className = "h-10 w-10" }: { user: IUser, className?: string }) => {
    const profileImageUrl = (user as any).profileImage?.url;

    return (
      <div className={twMerge(
        "shrink-0 flex items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors font-bold overflow-hidden relative border border-border/30",
        className
      )}>
        {profileImageUrl ? (
          <Image
            src={profileImageUrl}
            alt={`${user.firstName} ${user.lastName}`}
            fill
            className="object-cover"
          />
        ) : (
          <span className="text-[10px] uppercase">{user.firstName[0]}{user.lastName[0]}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-4 sm:px-6 font-sans">
      {/* Header section with Responsive Layout */}
      <div className="flex flex-col gap-6 pt-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#B5651D]/10 flex items-center justify-center text-[#B5651D] shadow-sm">
              <IconUsers size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-foreground">User Management</h1>
              <p className="text-[11px] font-medium text-muted-foreground/60">Manage permissions and oversee platform activities</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
              className="flex h-9 w-9 items-center justify-center rounded-xl border-0 bg-card text-muted-foreground shadow-sm ring-1 ring-black/[0.05] transition-all hover:bg-muted/50 active:scale-95"
              title="Refresh"
            >
              <IconReload className={twMerge("h-4 w-4", (isLoading || isRefetching) && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-card/60 backdrop-blur-sm shadow-sm ring-1 ring-black/[0.04]">
          <div className="md:col-span-4 relative group">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-[#B5651D] transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border-0 bg-muted/40 pl-10 pr-3 text-xs font-semibold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none focus:ring-2 focus:ring-[#B5651D]/20 transition-all placeholder:text-muted-foreground/40"
            />
          </div>

          <div className="md:col-span-2">
            <NativeSelect
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 text-xs"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Administrator</option>
            </NativeSelect>
          </div>

          <div className="md:col-span-3">
            <div className="relative group">
              <IconMapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within:text-[#B5651D]" />
              <input
                type="text"
                placeholder="City..."
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-xl border-0 bg-muted/40 pl-9 pr-3 text-xs font-semibold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none focus:ring-2 focus:ring-[#B5651D]/20 transition-all placeholder:text-muted-foreground/40"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="relative group">
              <IconFilter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/30 group-focus-within:text-[#B5651D]" />
              <input
                type="text"
                placeholder="State..."
                value={stateFilter}
                onChange={(e) => {
                  setStateFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 w-full rounded-xl border-0 bg-muted/40 pl-9 pr-3 text-xs font-semibold text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] outline-none focus:ring-2 focus:ring-[#B5651D]/20 transition-all placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-2xl bg-card shadow-sm ring-1 ring-black/[0.04]">
            <IconLoader2 className="h-8 w-8 animate-spin text-[#B5651D]/20" />
            <p className="text-[11px] font-bold text-muted-foreground/40 text-center tracking-tight">Gathering user profiles...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl bg-card p-8 text-center shadow-sm ring-1 ring-black/[0.04]">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <IconUsers size={32} className="text-muted-foreground/10" strokeWidth={1} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No users matching those filters</p>
              <p className="text-xs text-muted-foreground/50">Try refining your search terms or filters</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl bg-card shadow-md shadow-black/[0.02] ring-1 ring-black/[0.05]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/10 border-b border-border/40">
                      <th className="px-8 py-5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Identity</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Communication</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Geography</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em] text-center">Status</th>
                      <th className="px-8 py-5 text-right text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.03]">
                    {users.map((user) => (
                      <tr key={user.id || user._id} className="group transition-all hover:bg-muted/[0.15] cursor-default">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-4">
                            <UserAvatar user={user} className="h-11 w-11 shadow-sm ring-2 ring-transparent group-hover:ring-[#B5651D]/10 group-hover:bg-[#B5651D]/5" />
                            <div className="flex flex-col">
                              <span className="text-[14px] font-bold text-foreground leading-tight group-hover:text-[#B5651D] transition-colors">
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground/40 flex items-center gap-1 mt-0.5 uppercase">
                                <span className={twMerge("px-1.5 py-0.5 rounded-md", user.userRole === 'admin' ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600")}>
                                  {user.userRole}
                                </span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-md bg-muted/40 flex items-center justify-center text-muted-foreground/50">
                                <IconMail size={11} />
                              </div>
                              <span className="text-[12px] font-medium text-foreground/80">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5 rounded-md bg-muted/40 flex items-center justify-center text-muted-foreground/50">
                                <IconPhone size={11} />
                              </div>
                              <span className="text-[11px] font-semibold text-foreground/60 tracking-tight">{user.mobile}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <IconMapPin size={12} className="text-[#B5651D]/40" />
                              <span className="text-[12px] font-bold text-foreground/70">{user.location?.city || "—"}</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground/30 ml-4 uppercase tracking-wider">{user.location?.state || "N/A"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-8 py-4 text-right">
                          <button
                            onClick={() => handleEdit(user)}
                            className="h-9 w-9 rounded-xl flex items-center justify-center text-muted-foreground/30 hover:bg-[#B5651D] hover:text-white border border-transparent shadow-none hover:shadow-lg hover:shadow-[#B5651D]/20 transition-all active:scale-95 group/btn"
                            title="Edit User"
                          >
                            <IconEdit size={16} className="group-hover/btn:rotate-12 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Grid View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map((user) => (
                <div
                  key={user.id || user._id}
                  className="bg-card rounded-2xl p-5 shadow-sm ring-1 ring-black/[0.04] space-y-4 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} className="h-12 w-12" />
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{user.firstName} {user.lastName}</h3>
                        <p className="text-[10px] font-bold text-[#B5651D] uppercase tracking-wider">{user.userRole}</p>
                      </div>
                    </div>
                    <StatusBadge status={user.status} />
                  </div>

                  <div className="space-y-2 py-2 border-y border-black/[0.03]">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground/60">
                        <IconMail size={14} />
                      </div>
                      <span className="text-xs font-medium text-foreground/80 truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground/60">
                        <IconPhone size={14} />
                      </div>
                      <span className="text-[11px] font-bold text-foreground/70">{user.mobile}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-[#B5651D]/5 flex items-center justify-center text-[#B5651D]/50">
                        <IconMapPin size={14} />
                      </div>
                      <span className="text-[11px] font-bold text-foreground/70">
                        {user.location?.city ? `${user.location.city}, ${user.location.state || ''}` : "City not specified"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEdit(user)}
                    className="w-full h-9 rounded-xl bg-muted/50 text-xs font-bold text-foreground hover:bg-[#B5651D] hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <IconEdit size={14} />
                    Manage Account
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Floating Pagination Bar */}
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
                    // Show first page, last page, and 1 page around current
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

      {/* Edit User Modal */}
      <Dialog.Root
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) closeEditDialog();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-[101] w-full max-w-sm translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-[24px] border-0 bg-card p-0 shadow-2xl outline-none ring-1 ring-black/[0.1] animate-in zoom-in-95 fade-in duration-200">
            <div className="relative h-24 bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] flex items-center justify-center">
              <div className="absolute top-4 right-4 group">
                <Dialog.Close className="h-8 w-8 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/30 transition-all">
                  <IconX size={16} />
                </Dialog.Close>
              </div>

              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className="relative group">
                  <div className="h-20 w-20 rounded-[22px] bg-card p-1 shadow-xl ring-1 ring-black/[0.05] overflow-hidden">
                    <UserAvatar user={selectedUser!} className="h-full w-full rounded-[18px]" />
                  </div>

                  {/* Upload Overlay */}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                  >
                    <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                      <IconEdit size={14} />
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const uploadPromise = userService.uploadUserProfileImage(file);
                      toast.promise(uploadPromise, {
                        pending: "Uploading image...",
                        success: "Image uploaded! Save changes to apply.",
                        error: "Upload failed"
                      });

                      try {
                        const { mediaId, url } = await uploadPromise;
                        setEditData(p => ({ ...p, profileImage: mediaId as any }));
                        // Temporary update to show the new image
                        if (selectedUser) {
                          setSelectedUser({
                            ...selectedUser,
                            profileImage: { id: mediaId, url, _id: mediaId } as any
                          });
                        }
                      } catch (err) { }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-14 pb-8 px-6 text-center">
              <h3 className="text-base font-extrabold text-foreground">{selectedUser?.firstName} {selectedUser?.lastName}</h3>
              <p className="text-[11px] font-bold text-muted-foreground/40 mt-0.5 tracking-tight">{selectedUser?.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-muted-foreground/40 uppercase tracking-widest ml-1">Access Status</label>
                <NativeSelect
                  value={editData.status}
                  onChange={(e) =>
                    setEditData((p) => ({
                      ...p,
                      status: e.target.value as IUser["status"],
                    }))
                  }
                  className="h-11 text-xs font-bold rounded-xl"
                >
                  <option value="active">Active Access</option>
                  <option value="inactive">Suspended Access</option>
                </NativeSelect>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-muted-foreground/40 uppercase tracking-widest ml-1">Administrative Role</label>
                <NativeSelect
                  value={editData.userRole}
                  onChange={(e) => setEditData((p) => ({ ...p, userRole: e.target.value }))}
                  className="h-11 text-xs font-bold rounded-xl"
                >
                  <option value="user">Standard User</option>
                  <option value="admin">System Administrator</option>
                </NativeSelect>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="h-12 w-full rounded-2xl bg-[linear-gradient(268.96deg,#B5651D_0.19%,#FE9738_99.72%)] text-[13px] font-bold text-white shadow-xl shadow-[#B5651D]/20 hover:opacity-95 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <IconLoader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <IconDeviceFloppy size={18} />
                      Commit Changes
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
