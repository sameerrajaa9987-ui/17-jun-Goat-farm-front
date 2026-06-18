import React from "react";
import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  Mail,
  Phone,
  ShieldCheck,
  Languages,
  LogOut,
  ScrollText,
  ChevronRight,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@shared/store/useAuthStore";
import { useLogout } from "@modules/auth/hooks/useAuth";
import { changeLanguage } from "@modules/localization/i18n";
import { palette, radius } from "@shared/designSystem";
import { Text, VStack, HStack, Card, StatusChip } from "@shared/ui";

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  if (!user) return null;

  const isStaff = user.role === "owner" || user.role === "manager";

  const toggleLang = () => changeLanguage(i18n.language === "en" ? "hi" : "en");

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <Text variant="h1" tone="primary">
            Profile
          </Text>

          {/* Identity card */}
          <Card style={{ marginTop: 16 }}>
            <HStack gap={14} align="center">
              <View style={styles.avatar}>
                <Text variant="display-sm" tone="inverse">
                  {user.firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <VStack gap={4} flex={1}>
                <Text variant="h3" tone="primary">
                  {user.fullName || user.firstName}
                </Text>
                <StatusChip label={t(`roles.${user.role}`)} tone="success" />
              </VStack>
            </HStack>

            <View style={styles.divider} />

            <VStack gap={12}>
              <Row
                icon={<Mail size={16} color={palette.text.tertiary} />}
                label={user.email}
              />
              {user.phone ? (
                <Row
                  icon={<Phone size={16} color={palette.text.tertiary} />}
                  label={user.phone}
                />
              ) : null}
              <Row
                icon={<ShieldCheck size={16} color={palette.text.tertiary} />}
                label={
                  user.emailVerified ? "Email verified" : "Email not verified"
                }
              />
            </VStack>
          </Card>

          {/* Owner/Manager shortcuts */}
          {isStaff && (
            <Card style={{ marginTop: 16, padding: 0 }} padded={false}>
              <MenuItem
                icon={<ScrollText size={18} color={palette.ink[700]} />}
                label="Activity log"
                onPress={() => navigation.navigate("ActivityLog")}
              />
            </Card>
          )}

          {/* Settings */}
          <Card style={{ marginTop: 16, padding: 0 }} padded={false}>
            <MenuItem
              icon={<Languages size={18} color={palette.ink[700]} />}
              label={`Language: ${i18n.language === "hi" ? "हिन्दी" : "English"}`}
              onPress={toggleLang}
            />
          </Card>

          <Pressable onPress={() => logout.mutate()} style={styles.logout}>
            <LogOut size={18} color={palette.danger.text} strokeWidth={1.8} />
            <Text variant="label-lg" style={{ color: palette.danger.text }}>
              {t("common.logout")}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <HStack gap={10} align="center">
      {icon}
      <Text variant="body-sm" tone="secondary">
        {label}
      </Text>
    </HStack>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
    >
      <HStack gap={12} align="center" flex={1}>
        {icon}
        <Text variant="label-lg" tone="primary">
          {label}
        </Text>
      </HStack>
      <ChevronRight size={18} color={palette.text.tertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: palette.ink[900],
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: palette.border.subtle,
    marginVertical: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.danger.border,
    backgroundColor: palette.danger.bg,
  },
});
