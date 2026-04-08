import { get, patch } from "../api";

export interface ProductMedia {
  id: string;
  url: string;
  mimetype: string;
}

export interface ProductSeller {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProductCategory {
  _id: string;
  name: string;
  media?: ProductMedia;
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  category: ProductCategory;
  subcategory?: ProductCategory;
  seller: ProductSeller;
  media: ProductMedia[];
  price: number;
  stock?: number;
  customFields?: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'sold' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
  subcategoryId?: string;
  search?: string;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productService = {
  /**
   * Get all products (all statuses) with filters and pagination
   */
  listAllProducts: async (filters: ProductFilters = {}): Promise<PaginatedProducts> => {
    return get<PaginatedProducts>("/admin/products", {
      params: filters,
    });
  },

  /**
   * Approve a product
   */
  approveProduct: async (productId: string): Promise<Product> => {
    return patch<Product>(`/admin/products/${productId}/approve`);
  },

  /**
   * Reject a product
   */
  rejectProduct: async (productId: string): Promise<Product> => {
    return patch<Product>(`/admin/products/${productId}/reject`);
  },
};
