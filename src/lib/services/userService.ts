import { get, put, postFormData, deleteRequest } from "@/lib/api";

export interface IUser {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  userRole: string;
  bio?: string;
  walletBalance?: number;
  referralCode?: string;
  isBlocked?: boolean;
  isVerified?: boolean;
  isPremium?: boolean;
  isPlatformPaid?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  location?: {
    lat?: number;
    lng?: number;
    city?: string;
    state?: string;
    address?: string;
    zipcode?: string;
  };
  profileImage?: {
    id: string;
    _id?: string;
    url: string;
  };
  aadhaarVerification?: {
    status: "pending" | "verified" | "failed";
    aadhaarNumber?: string;
    referenceId?: string;
    verifiedAt?: string;
  };
  createdAt: string;
  updatedAt?: string;
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

export interface UserListing {
  _id: string;
  name: string;
  description?: string;
  price: number;
  status: "pending" | "approved" | "rejected" | "sold" | "inactive";
  category?: { _id: string; name: string; media?: { url: string } };
  subcategory?: { _id: string; name: string };
  media?: { _id: string; url: string; mimetype: string }[];
  customFields?: Record<string, any>;
  createdAt: string;
}

export interface UserInterest {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile?: string;
    profileImage?: { url: string };
  };
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
}

export interface UserPayment {
  _id: string;
  amount: number;
  currency: string;
  receipt?: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: "pending" | "captured" | "failed";
  paymentType: "platform_fee" | "wallet_topup" | "other";
  createdAt: string;
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

  getUserListings: async (id: string, status?: string): Promise<UserListing[]> => {
    return get<UserListing[]>(`/users/${id}/listings`, {
      params: status ? { status } : {},
    });
  },

  getUserInterests: async (id: string): Promise<UserInterest[]> => {
    return get<UserInterest[]>(`/users/${id}/interests`);
  },

  getUserPayments: async (id: string): Promise<UserPayment[]> => {
    return get<UserPayment[]>(`/users/${id}/payments`);
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
