import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sprout } from "lucide-react-native";
import { Text, VStack, Button } from "@shared/ui";
import { palette, radius } from "@shared/designSystem";

type Props = { navigation: { navigate: (s: string) => void } };

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.dark }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.body}>
          <View style={styles.logoWrap}>
            <View style={styles.logoBadge}>
              <Sprout color={palette.amber[400]} size={40} strokeWidth={1.8} />
            </View>
          </View>

          <VStack gap={14} align="center" style={{ marginTop: 28 }}>
            <Text
              variant="display-sm"
              tone="inverse"
              align="center"
              style={{ letterSpacing: -0.5 }}
            >
              Goat Farm Manager
            </Text>
            <Text
              variant="body-lg"
              align="center"
              style={{ color: palette.ink[200], maxWidth: 300 }}
            >
              Rear, track, and care for every goat — and bill your Ad Pali
              clients automatically.
            </Text>
          </VStack>
        </View>

        <View style={styles.footer}>
          <Button
            label="Sign in"
            size="lg"
            variant="accent"
            onPress={() => navigation.navigate("Login")}
          />
          <Button
            label="Create an account"
            size="lg"
            variant="secondary"
            style={{ marginTop: 12 }}
            onPress={() => navigation.navigate("Register")}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  logoWrap: { alignItems: "center" },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: radius["2xl"],
    backgroundColor: palette.surface.darkRaised,
    borderWidth: 1,
    borderColor: palette.border.dark,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { paddingHorizontal: 24, paddingBottom: 16 },
});
