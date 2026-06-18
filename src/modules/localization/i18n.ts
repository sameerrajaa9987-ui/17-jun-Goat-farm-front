import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "./locales/en.json";
import hi from "./locales/hi.json";

const LANG_KEY = "goat-farm-language";
export const SUPPORTED_LANGUAGES = ["en", "hi"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function resolveDeviceLanguage(): AppLanguage {
  const locales = Localization.getLocales();
  const code = locales?.[0]?.languageCode ?? "en";
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code)
    ? (code as AppLanguage)
    : "en";
}

export async function setupI18n() {
  let lng: AppLanguage = resolveDeviceLanguage();
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
      lng = stored as AppLanguage;
    }
  } catch {
    // ignore — fall back to device language
  }

  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      resources: {
        en: { translation: en },
        hi: { translation: hi },
      },
      lng,
      fallbackLng: "en",
      interpolation: { escapeValue: false },
    });
  } else {
    await i18n.changeLanguage(lng);
  }
  return i18n;
}

export async function changeLanguage(lng: AppLanguage) {
  await i18n.changeLanguage(lng);
  try {
    await AsyncStorage.setItem(LANG_KEY, lng);
  } catch {
    // ignore
  }
}

export default i18n;
