import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail, Lock, UserRound, Phone } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useRegister } from "@modules/auth/hooks/useAuth";
import { palette, radius } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Button,
  TextField,
  Card,
  useBottomPadding,
} from "@shared/ui";

type Props = {
  navigation: { navigate: (s: string) => void; goBack: () => void };
};
type ApiErr = { response?: { data?: { error?: { message?: string } } } };

export default function RegisterScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const mut = useRegister();
  const bottomPadding = useBottomPadding(40);

  const submit = () => {
    if (!firstName || !email || !password) return;
    mut.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim() || undefined,
      email: email.trim(),
      phone: phone.trim() || undefined,
      password,
    });
  };

  const errMsg =
    (mut.error as ApiErr)?.response?.data?.error?.message ||
    "Could not create account. Please try again.";

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: 20,
              paddingTop: 32,
              paddingBottom: bottomPadding,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <VStack gap={4} style={{ paddingHorizontal: 4 }}>
              <Text variant="overline" tone="tertiary">
                {t("common.appName")}
              </Text>
              <Text variant="h1" tone="primary">
                {t("auth.register")}
              </Text>
              <Text variant="body-sm" tone="tertiary">
                {t("auth.registerSubtitle")}
              </Text>
            </VStack>

            {mut.isError && (
              <View style={styles.error}>
                <Text variant="body-sm" tone="danger">
                  {errMsg}
                </Text>
              </View>
            )}

            <Card elevation="raised" style={{ marginTop: 24 }}>
              <VStack gap={16}>
                <TextField
                  label={t("auth.firstName")}
                  leading={
                    <UserRound
                      size={18}
                      color={palette.text.tertiary}
                      strokeWidth={1.6}
                    />
                  }
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
                  leading={
                    <Mail
                      size={18}
                      color={palette.text.tertiary}
                      strokeWidth={1.6}
                    />
                  }
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                <TextField
                  label={t("auth.phone")}
                  leading={
                    <Phone
                      size={18}
                      color={palette.text.tertiary}
                      strokeWidth={1.6}
                    />
                  }
                  placeholder="+91..."
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <TextField
                  label={t("auth.password")}
                  leading={
                    <Lock
                      size={18}
                      color={palette.text.tertiary}
                      strokeWidth={1.6}
                    />
                  }
                  placeholder="At least 6 characters"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </VStack>
            </Card>

            <View style={{ marginTop: 24 }}>
              <Button
                label={t("auth.createAccount")}
                onPress={submit}
                loading={mut.isPending}
                size="lg"
              />
            </View>

            <HStack
              justify="center"
              align="center"
              gap={4}
              style={{ marginTop: 24 }}
            >
              <Text variant="body-sm" tone="tertiary">
                {t("auth.haveAccount")}
              </Text>
              <Pressable
                onPress={() => navigation.navigate("Login")}
                hitSlop={8}
              >
                <Text variant="label" tone="accent">
                  {t("auth.signIn")}
                </Text>
              </Pressable>
            </HStack>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    marginTop: 20,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
  },
});
