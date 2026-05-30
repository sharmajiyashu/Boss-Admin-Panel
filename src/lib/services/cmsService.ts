import { get, put } from "../api";

export interface CMSPage {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export const cmsService = {
  /**
   * Get all CMS pages
   */
  getPages: async (): Promise<CMSPage[]> => {
    return get<CMSPage[]>("/cms");
  },

  /**
   * Get details of a single CMS page by slug
   */
  getPageBySlug: async (slug: string): Promise<CMSPage> => {
    return get<CMSPage>(`/cms/${slug}`);
  },

  /**
   * Update or create CMS page content by slug
   */
  upsertPage: async (slug: string, data: { title: string; content: string }): Promise<CMSPage> => {
    return put<CMSPage>(`/cms/${slug}`, data);
  },
};
