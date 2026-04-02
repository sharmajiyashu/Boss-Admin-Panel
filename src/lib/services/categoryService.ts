import { get, postFormData, putFormData, deleteRequest } from "../api";

export interface Category {
  id: string;
  _id?: string; // Some backends use _id
  name: string;
  description?: string;
  media?: {
    id: string;
    url: string;
    mimetype: string;
  };
  slug: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCategoryResponse {
  data: Category[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const categoryService = {
  /**
   * Get paginated categories.
   */
  getCategories: async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<PaginatedCategoryResponse> => {
    return get<PaginatedCategoryResponse>("/categories", {
      params: { page, limit, search, status },
    });
  },

  /**
   * Create a new category with media.
   */
  createCategory: async (formData: FormData): Promise<Category> => {
    return postFormData<Category>("/categories", formData);
  },

  /**
   * Update an existing category with media.
   */
  updateCategory: async (id: string, formData: FormData): Promise<Category> => {
    return putFormData<Category>(`/categories/${id}`, formData);
  },

  /**
   * Delete a category.
   */
  deleteCategory: async (id: string): Promise<void> => {
    return deleteRequest<void>(`/categories/${id}`);
  },
};
