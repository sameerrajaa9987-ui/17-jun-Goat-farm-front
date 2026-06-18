import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyRound, Lock } from "lucide-react-native";
import { useResetPassword } from "@modules/auth/hooks/useAuth";
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
  navigation: { navigate: (s: string) => void };
  route: { params?: { email?: string } };
};
type ApiErr = { response?: { data?: { error?: { message?: string } } } };

export default function ResetPasswordScreen({ navigation }: Props) {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const mut = useResetPassword();
  const bottomPadding = useBottomPadding(40);

  const submit = () => {
    if (!token || !password) return;
    mut.mutate(
      { token: token.trim(), password },
      { onSuccess: () => setDone(true) },
    );
  };

  const errMsg =
    (mut.error as ApiErr)?.response?.data?.error?.message ||
    "Could not reset password.";

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: 32,
            paddingBottom: bottomPadding,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <VStack gap={4} style={{ paddingHorizontal: 4 }}>
            <Text variant="overline" tone="tertiary">
              Account recovery
            </Text>
            <Text variant="h1" tone="primary">
              Reset password
            </Text>
            <Text variant="body-sm" tone="tertiary">
              Enter the code from your email and a new password.
            </Text>
          </VStack>

          {mut.isError && (
            <View
              style={{
                marginTop: 20,
                padding: 14,
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

          {done ? (
            <View style={{ marginTop: 24 }}>
              <Card elevation="raised">
                <Text variant="body-lg" tone="primary">
                  Password updated. You can now sign in.
                </Text>
              </Card>
              <Button
                label="Back to sign in"
                size="lg"
                style={{ marginTop: 20 }}
                onPress={() => navigation.navigate("Login")}
              />
            </View>
          ) : (
            <>
              <Card elevation="raised" style={{ marginTop: 24 }}>
                <VStack gap={16}>
                  <TextField
                    label="Reset code"
                    leading={
                      <KeyRound
                        size={18}
                        color={palette.text.tertiary}
                        strokeWidth={1.6}
                      />
                    }
                    placeholder="6-digit code"
                    keyboardType="number-pad"
                    value={token}
                    onChangeText={setToken}
                  />
                  <TextField
                    label="New password"
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
                  label="Reset password"
                  onPress={submit}
                  loading={mut.isPending}
                  size="lg"
                />
              </View>
              <Pressable
                onPress={() => navigation.navigate("Login")}
                hitSlop={8}
                style={{ marginTop: 24 }}
              >
                <Text variant="label" tone="accent" align="center">
                  Back to sign in
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
