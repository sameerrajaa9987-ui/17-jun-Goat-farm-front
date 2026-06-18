import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useCreateUser } from "@modules/team/hooks/useTeam";
import { useAuthStore, Role } from "@shared/store/useAuthStore";
import { palette, radius } from "@shared/designSystem";
import { Text, VStack, Button, TextField, useBottomPadding } from "@shared/ui";

type ApiErr = { response?: { data?: { error?: { message?: string } } } };

export default function AddUserScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const actorRole = useAuthStore((s) => s.user?.role);
  const create = useCreateUser();
  const bottomPadding = useBottomPadding(40);

  // Managers can create workers, vets and clients; only owners can add managers.
  const ROLE_OPTIONS: Role[] =
    actorRole === "owner"
      ? ["manager", "worker", "vet", "client"]
      : ["worker", "vet", "client"];

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("worker");

  const submit = () => {
    if (!firstName || !email || !password) return;
    create.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        role,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  const errMsg =
    (create.error as ApiErr)?.response?.data?.error?.message ||
    "Could not create user.";

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.primary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Add team member
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: bottomPadding,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {create.isError && (
              <View style={styles.error}>
                <Text variant="body-sm" tone="danger">
                  {errMsg}
                </Text>
              </View>
            )}

            <Text variant="label" tone="secondary" style={{ marginBottom: 8 }}>
              Role
            </Text>
            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((r) => {
                const active = role === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => setRole(r)}
                    style={[styles.roleChip, active && styles.roleChipActive]}
                  >
                    <Text
                      variant="label"
                      style={{
                        color: active
                          ? palette.text.inverse
                          : palette.text.secondary,
                      }}
                    >
                      {t(`roles.${r}`)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <VStack gap={16} style={{ marginTop: 20 }}>
              <TextField
                label={t("auth.firstName")}
                placeholder="Ramesh"
                value={firstName}
                onChangeText={setFirstName}
              />
              <TextField
                label={t("auth.lastName")}
                placeholder="Kumar"
                value={lastName}
                onChangeText={setLastName}
              />
              <TextField
                label={t("auth.email")}
                placeholder="member@goatfarm.app"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <TextField
                label={t("auth.phone")}
                placeholder="+91..."
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TextField
                label="Temporary password"
                placeholder="At least 6 characters"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </VStack>

            <Button
              label="Create account"
              size="lg"
              loading={create.isPending}
              onPress={submit}
              style={{ marginTop: 28 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  error: {
    marginBottom: 16,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
  },
  roleRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  roleChipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
});
