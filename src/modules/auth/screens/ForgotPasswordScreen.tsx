import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail } from "lucide-react-native";
import { useForgotPassword } from "@modules/auth/hooks/useAuth";
import { palette } from "@shared/designSystem";
import { Text, VStack, Button, TextField, useBottomPadding } from "@shared/ui";

type Props = {
  navigation: { navigate: (s: string, p?: object) => void; goBack: () => void };
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const mut = useForgotPassword();
  const bottomPadding = useBottomPadding(40);

  const submit = () => {
    if (!email) return;
    mut.mutate(
      { email: email.trim() },
      {
        onSuccess: () =>
          navigation.navigate("ResetPassword", { email: email.trim() }),
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.primary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 40,
            paddingBottom: bottomPadding,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <VStack gap={10}>
            <Text variant="display-sm" tone="primary">
              Forgot password
            </Text>
            <Text variant="body-lg" tone="secondary">
              Enter your email and we&apos;ll send a 6-digit reset code.
            </Text>
          </VStack>

          <VStack gap={16} style={{ marginTop: 28 }}>
            <TextField
              label="Email"
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
          </VStack>

          <View style={{ marginTop: 28 }}>
            <Button
              label="Send reset code"
              onPress={submit}
              loading={mut.isPending}
              size="lg"
            />
          </View>

          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={{ marginTop: 24 }}
          >
            <Text variant="label" tone="accent" align="center">
              Back to sign in
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
