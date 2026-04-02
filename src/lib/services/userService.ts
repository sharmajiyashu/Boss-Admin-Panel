import { get, put, deleteRequest } from "@/lib/api";

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
  createdAt: string;
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
};
