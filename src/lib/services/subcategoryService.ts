import { get, postFormData, putFormData, deleteRequest } from '../api';

export interface FieldDefinition {
  label: string;
  key: string;
  fieldType: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'textarea' | 'switch' | 'checkbox';
  options?: string[];
  isFilterable: boolean;
  isRequired: boolean;
}

export interface Subcategory {
  id: string;
  _id?: string;
  name: string;
  category: any; // Can be ID or populated object
  media?: {
    url: string;
    mimetype: string;
  };
  description?: string;
  customFieldDefinitions?: FieldDefinition[];
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface PaginatedSubcategoryResponse {
  data: Subcategory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const subcategoryService = {
  getSubcategories: async (
    page = 1,
    limit = 10,
    search = "",
    status = "",
    category = ""
  ): Promise<PaginatedSubcategoryResponse> => {
    return get<PaginatedSubcategoryResponse>("/subcategories", {
      params: { page, limit, search, status, category },
    });
  },

  createSubcategory: async (formData: FormData): Promise<Subcategory> => {
    return postFormData<Subcategory>("/subcategories", formData);
  },

  updateSubcategory: async (id: string, formData: FormData): Promise<Subcategory> => {
    return putFormData<Subcategory>(`/subcategories/${id}`, formData);
  },

  deleteSubcategory: async (id: string): Promise<void> => {
    return deleteRequest<void>(`/subcategories/${id}`);
  }
};

