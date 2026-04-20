import { get, put, postFormData, deleteRequest } from "@/lib/api";

export interface IUser {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  userRole: string;
  status: "active" | "inactive";
  location?: {
    city?: string;
    state?: string;
    address?: string;
  };
  profileImage?: {
    id: string;
    _id?: string;
    url: string;
  };
  createdAt: string;
  isVerified?: boolean;
  isPremium?: boolean;
}

export interface PaginatedUserResponse {
  data: IUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const userService = {
  getUsers: async (
    page = 1,
    limit = 10,
    search = "",
    role = "",
    city = "",
    state = ""
  ): Promise<PaginatedUserResponse> => {
    return get<PaginatedUserResponse>("/users", {
      params: { page, limit, search, role, city, state },
    });
  },

  getUserById: async (id: string): Promise<IUser> => {
    return get<IUser>(`/users/${id}`);
  },

  updateUser: async (id: string, data: Partial<IUser>): Promise<IUser> => {
    return put<IUser>(`/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<any> => {
    return deleteRequest<any>(`/users/${id}`);
  },

  uploadUserProfileImage: async (file: File): Promise<{ mediaId: string; url: string }> => {
    const formData = new FormData();
    formData.append("image", file);
    return postFormData<{ mediaId: string; url: string }>("/users/upload", formData);
  },
};
