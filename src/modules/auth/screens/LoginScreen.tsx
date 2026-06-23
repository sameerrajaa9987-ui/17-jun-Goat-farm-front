import React, { useState } from "react";
import {
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useLogin } from "@modules/auth/hooks/useAuth";
import { palette, radius } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Button,
  TextField,
  Card,
  GradientHero,
  useBottomPadding,
} from "@shared/ui";

type Props = { navigation: { navigate: (s: string) => void } };
type ApiErr = { response?: { data?: { error?: { message?: string } } } };

export default function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const mut = useLogin();
  const bottomPadding = useBottomPadding(40);

  const submit = () => {
    if (!email || !password) return;
    mut.mutate({ email: email.trim(), password });
  };

  const errMsg =
    (mut.error as ApiErr)?.response?.data?.error?.message ||
    t("auth.invalidCredentials");

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
              paddingTop: 20,
              paddingBottom: bottomPadding,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <GradientHero variant="hero">
              <View style={styles.logoBadge}>
                <Image
                  source={require("../../../../assets/brand/logo.png")}
                  style={styles.logoImg}
                  resizeMode="contain"
                />
              </View>
              <VStack gap={6} style={{ marginTop: 24 }}>
                <Text
                  variant="overline"
                  style={{ color: "rgba(255,255,255,0.66)" }}
                >
                  {t("common.appName")}
                </Text>
                <Text variant="h1" tone="inverse">
                  {t("auth.welcomeBack")}
                </Text>
                <Text
                  variant="body-sm"
                  style={{ color: "rgba(255,255,255,0.74)" }}
                >
                  {t("auth.signInSubtitle")}
                </Text>
              </VStack>
            </GradientHero>

            {mut.isError && (
              <View style={styles.error}>
                <Text variant="body-sm" tone="danger">
                  {errMsg}
                </Text>
              </View>
            )}

            <Card elevation="raised" style={{ marginTop: 16 }}>
              <VStack gap={16}>
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
                  label={t("auth.password")}
                  leading={
                    <Lock
                      size={18}
                      color={palette.text.tertiary}
                      strokeWidth={1.6}
                    />
                  }
                  placeholder="••••••••"
                  secureTextEntry={!show}
                  value={password}
                  onChangeText={setPassword}
                  trailing={
                    <Pressable hitSlop={10} onPress={() => setShow((s) => !s)}>
                      {show ? (
                        <EyeOff
                          size={18}
                          color={palette.text.tertiary}
                          strokeWidth={1.6}
                        />
                      ) : (
                        <Eye
                          size={18}
                          color={palette.text.tertiary}
                          strokeWidth={1.6}
                        />
                      )}
                    </Pressable>
                  }
                />
                <Pressable
                  onPress={() => navigation.navigate("ForgotPassword")}
                  hitSlop={8}
                >
                  <Text variant="label" tone="accent" align="right">
                    {t("auth.forgotPassword")}
                  </Text>
                </Pressable>
              </VStack>
            </Card>

            <View style={{ marginTop: 24 }}>
              <Button
                label={t("auth.signIn")}
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
                {t("auth.newHere")}
              </Text>
              <Pressable
                onPress={() => navigation.navigate("Register")}
                hitSlop={8}
              >
                <Text variant="label" tone="accent">
                  {t("auth.createAccount")}
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
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: radius.lg,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logoImg: { width: 58, height: 58 },
  error: {
    marginTop: 20,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
  },
});
