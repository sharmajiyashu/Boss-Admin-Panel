import { get, post, put, deleteRequest } from '../api';

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
  isPublish: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const faqService = {
  getFAQs: async (): Promise<FAQ[]> => {
    return get<FAQ[]>("/faqs");
  },

  createFAQ: async (data: { question: string; answer: string; isPublish: boolean; sortOrder: number }): Promise<FAQ> => {
    return post<FAQ>("/faqs", data);
  },

  updateFAQ: async (id: string, data: { question?: string; answer?: string; isPublish?: boolean; sortOrder?: number }): Promise<FAQ> => {
    return put<FAQ>(`/faqs/${id}`, data);
  },

  deleteFAQ: async (id: string): Promise<void> => {
    return deleteRequest<void>(`/faqs/${id}`);
  }
};
