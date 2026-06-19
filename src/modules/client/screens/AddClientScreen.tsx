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
import { useOnboardClient } from "@modules/client/hooks/useClients";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Button,
  TextField,
  Card,
  useBottomPadding,
} from "@shared/ui";

type ApiErr = { response?: { data?: { error?: { message?: string } } } };
const KYC = ["aadhaar", "pan", "other"] as const;

export default function AddClientScreen() {
  const navigation = useNavigation<any>();
  const onboard = useOnboardClient();
  const bottomPadding = useBottomPadding(40);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [kycType, setKycType] = useState<(typeof KYC)[number]>("aadhaar");
  const [kycNumber, setKycNumber] = useState("");
  const [city, setCity] = useState("");

  const submit = () => {
    if (!firstName.trim() || !email.trim() || !password) return;
    onboard.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        kycType,
        kycNumber: kycNumber.trim() || undefined,
        address: city.trim() ? { city: city.trim() } : undefined,
      },
      {
        onSuccess: (c) =>
          navigation.replace("ClientProfile", { userId: c.userId }),
      },
    );
  };

  const errMsg =
    (onboard.error as ApiErr)?.response?.data?.error?.message ||
    "Could not onboard client.";

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={8}
          >
            <ChevronLeft
              size={22}
              color={palette.text.primary}
              strokeWidth={2}
            />
          </Pressable>
          <VStack gap={2} flex={1}>
            <Text variant="overline" tone="tertiary">
              Billing
            </Text>
            <Text variant="h3" tone="primary">
              Onboard client
            </Text>
          </VStack>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: bottomPadding,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {onboard.isError && (
              <View style={styles.error}>
                <Text variant="body-sm" tone="danger">
                  {errMsg}
                </Text>
              </View>
            )}

            <Text
              variant="overline"
              tone="tertiary"
              style={styles.sectionLabel}
            >
              Details
            </Text>
            <Card elevation="raised">
              <VStack gap={16}>
                <HStack gap={12}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="First name"
                      placeholder="Adil"
                      value={firstName}
                      onChangeText={setFirstName}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="Last name"
                      placeholder="Pali"
                      value={lastName}
                      onChangeText={setLastName}
                    />
                  </View>
                </HStack>
                <TextField
                  label="Email"
                  placeholder="client@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextField
                  label="Phone"
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
                  hint="The client uses this to log in to their portal."
                />
              </VStack>
            </Card>

            <Text
              variant="overline"
              tone="tertiary"
              style={styles.sectionLabel}
            >
              KYC
            </Text>
            <Card elevation="raised">
              <HStack gap={8}>
                {KYC.map((k) => (
                  <Pressable
                    key={k}
                    onPress={() => setKycType(k)}
                    style={[styles.chip, kycType === k && styles.chipActive]}
                  >
                    <Text
                      variant="label"
                      style={{
                        color:
                          kycType === k
                            ? palette.text.inverse
                            : palette.text.secondary,
                      }}
                    >
                      {k.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
              <VStack gap={16} style={{ marginTop: 16 }}>
                <TextField
                  label="KYC number"
                  placeholder="ID number"
                  value={kycNumber}
                  onChangeText={setKycNumber}
                />
                <TextField
                  label="City"
                  placeholder="Optional"
                  value={city}
                  onChangeText={setCity}
                />
              </VStack>
            </Card>

            <Button
              label="Onboard client"
              size="lg"
              loading={onboard.isPending}
              disabled={!firstName.trim() || !email.trim() || !password}
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
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.xs,
  },
  sectionLabel: { marginTop: 24, marginBottom: 10, marginLeft: 4 },
  error: {
    marginBottom: 16,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.secondary,
  },
  chipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
});
