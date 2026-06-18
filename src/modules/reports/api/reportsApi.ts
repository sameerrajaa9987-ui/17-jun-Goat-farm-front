import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { apiClient } from "@api/apiClient";
import { environment } from "@config/env";
import { useAuthStore } from "@shared/store/useAuthStore";
import { Overview } from "@modules/reports/types";

export const reportsApi = {
  overview: async () => {
    const res = await apiClient.get<{ success: boolean; data: Overview }>(
      "/reports/overview",
    );
    return res.data.data;
  },
  /** Downloads a CSV export and opens the OS share sheet (native) / download (web). */
  export: async (type: "goats" | "sales" | "transactions") => {
    const token = useAuthStore.getState().token;
    const url = `${environment.apiUrl}/reports/export?type=${type}`;

    if (Platform.OS === "web") {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `${type}-export.csv`;
      a.click();
      URL.revokeObjectURL(href);
      return;
    }

    const fileUri = `${FileSystem.cacheDirectory}${type}-export.csv`;
    const { uri } = await FileSystem.downloadAsync(url, fileUri, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: "text/csv",
        dialogTitle: `${type} export`,
      });
    }
  },
};
