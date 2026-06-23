import { Linking, Alert } from "react-native";

/**
 * Opens WhatsApp (app or web) with a pre-filled message to `phone`.
 * No Business API needed — the user just taps Send. ToS-safe + free.
 */
export async function openWhatsApp(phone: string | undefined, message = "") {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) {
    Alert.alert("No phone number", "This contact has no phone number saved.");
    return;
  }
  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert("Couldn't open WhatsApp", "Make sure WhatsApp is installed.");
  }
}
