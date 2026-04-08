import { get, patch } from "../api";

export interface AppSettings {
  _id: string;
  platformFees: number;
  reportReasons: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsData {
  platformFees?: number;
  reportReasons?: string[];
}

export const settingService = {
  /**
   * Get application settings
   */
  getSettings: async (): Promise<AppSettings> => {
    return get<AppSettings>("/admin/settings");
  },

  /**
   * Update application settings
   */
  updateSettings: async (data: UpdateSettingsData): Promise<AppSettings> => {
    return patch<AppSettings>("/admin/settings", data);
  },
};
