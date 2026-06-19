import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShieldCheck } from "lucide-react-native";
import {
  useVerifyEmail,
  useResendVerification,
  useLogout,
} from "@modules/auth/hooks/useAuth";
import { palette, radius } from "@shared/designSystem";
import {
  Text,
  VStack,
  Button,
  TextField,
  Card,
  useBottomPadding,
} from "@shared/ui";

type Props = {
  navigation?: { navigate: (s: string) => void };
  route?: { params?: { email?: string } };
};
type ApiErr = { response?: { data?: { error?: { message?: string } } } };

export default function EmailVerificationScreen({ route }: Props) {
  const email = route?.params?.email;
  const [token, setToken] = useState("");
  const verify = useVerifyEmail();
  const resend = useResendVerification();
  const logout = useLogout();
  const bottomPadding = useBottomPadding(40);

  const submit = () => {
    if (!token) return;
    verify.mutate({ token: token.trim(), email });
  };

  const errMsg =
    (verify.error as ApiErr)?.response?.data?.error?.message ||
    "Invalid code. Please try again.";

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={["top", "left", "right", "bottom"]}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 32,
            paddingBottom: bottomPadding,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ alignItems: "flex-start", paddingHorizontal: 4 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: radius.full,
                backgroundColor: palette.success.bg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldCheck
                color={palette.success.text}
                size={34}
                strokeWidth={1.6}
              />
            </View>
          </View>

          <VStack gap={4} style={{ marginTop: 20, paddingHorizontal: 4 }}>
            <Text variant="overline" tone="tertiary">
              Verification
            </Text>
            <Text variant="h1" tone="primary">
              Verify your email
            </Text>
            <Text variant="body-sm" tone="tertiary">
              We sent a 6-digit code{email ? ` to ${email}` : ""}. Enter it
              below to continue.
            </Text>
          </VStack>

          {verify.isError && (
            <View
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: radius.md,
                backgroundColor: palette.danger.bg,
                borderWidth: 1,
                borderColor: palette.danger.border,
              }}
            >
              <Text variant="body-sm" tone="danger">
                {errMsg}
              </Text>
            </View>
          )}

          <Card elevation="raised" style={{ marginTop: 24 }}>
            <TextField
              label="Verification code"
              placeholder="6-digit code"
              keyboardType="number-pad"
              value={token}
              onChangeText={setToken}
            />
          </Card>

          <View style={{ marginTop: 24 }}>
            <Button
              label="Verify"
              onPress={submit}
              loading={verify.isPending}
              size="lg"
            />
          </View>

          <Pressable
            onPress={() => email && resend.mutate(email)}
            hitSlop={8}
            style={{ marginTop: 20 }}
          >
            <Text variant="label" tone="accent" align="center">
              {resend.isPending ? "Sending..." : "Resend code"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => logout.mutate()}
            hitSlop={8}
            style={{ marginTop: 28 }}
          >
            <Text variant="label" tone="tertiary" align="center">
              Use a different account
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
