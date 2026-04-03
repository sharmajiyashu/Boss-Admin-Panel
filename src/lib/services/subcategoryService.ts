import { get, postFormData, putFormData, deleteRequest } from '../api';

export interface FieldDefinition {
  label: string;
  key: string;
  fieldType: "text" | "number" | "boolean" | "date" | "select" | "textarea" | "switch" | "checkbox";
  options?: string[];
  isFilterable: boolean;
  isRequired: boolean;
}

/** API may return a Mongo id string or a populated category object. */
export type SubcategoryCategoryRef =
  | string
  | {
      _id?: string;
      id?: string;
      name?: string;
    };

export function subcategoryCategoryId(ref: SubcategoryCategoryRef): string {
  if (typeof ref === "string") return ref;
  const id = ref._id ?? ref.id;
  return typeof id === "string" ? id : "";
}

export function subcategoryCategoryName(ref: SubcategoryCategoryRef): string {
  if (typeof ref === "object" && ref !== null && typeof ref.name === "string" && ref.name.trim()) {
    return ref.name;
  }
  return "N/A";
}

export interface Subcategory {
  id: string;
  _id?: string;
  name: string;
  category: SubcategoryCategoryRef;
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

