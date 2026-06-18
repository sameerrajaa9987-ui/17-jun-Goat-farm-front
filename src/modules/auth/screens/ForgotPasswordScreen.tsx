import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mail } from "lucide-react-native";
import { useForgotPassword } from "@modules/auth/hooks/useAuth";
import { palette } from "@shared/designSystem";
import {
  Text,
  VStack,
  Button,
  TextField,
  Card,
  useBottomPadding,
} from "@shared/ui";

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
              Forgot password
            </Text>
            <Text variant="body-sm" tone="tertiary">
              Enter your email and we&apos;ll send a 6-digit reset code.
            </Text>
          </VStack>

          <Card elevation="raised" style={{ marginTop: 24 }}>
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
          </Card>

          <View style={{ marginTop: 24 }}>
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
