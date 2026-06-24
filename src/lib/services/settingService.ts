import { get, patch } from "../api";

export interface LocationRange {
  id: string;
  min: number;
  max: number;
  label: string;
}

export interface AppSettings {
  _id: string;
  platformFees: number;
  reportReasons: string[];
  locationRanges: LocationRange[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsData {
  platformFees?: number;
  reportReasons?: string[];
  locationRanges?: LocationRange[];
}

export const settingService = {
  /**
   * Get application settings
   */
  getSettings: async (): Promise<AppSettings> => {
    return get<AppSettings>("/settings");
  },

  /**
   * Update application settings
   */
  updateSettings: async (data: UpdateSettingsData): Promise<AppSettings> => {
    return patch<AppSettings>("/settings", data);
  },
};
