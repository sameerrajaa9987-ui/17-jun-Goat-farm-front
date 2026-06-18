import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sprout } from "lucide-react-native";
import { Text, VStack, Button, GradientHero } from "@shared/ui";
import { palette, radius, glass } from "@shared/designSystem";

type Props = { navigation: { navigate: (s: string) => void } };

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.body}>
          <GradientHero variant="hero" style={styles.hero}>
            <VStack gap={20} align="center">
              <View style={[styles.logoBadge, glass.light]}>
                <Sprout
                  color={palette.amber[300]}
                  size={40}
                  strokeWidth={1.8}
                />
              </View>
              <VStack gap={12} align="center">
                <Text
                  variant="overline"
                  align="center"
                  style={{ color: "rgba(255,255,255,0.66)" }}
                >
                  Goat Farm Manager
                </Text>
                <Text
                  variant="display-sm"
                  tone="inverse"
                  align="center"
                  style={{ letterSpacing: -0.5 }}
                >
                  Manage your herd
                </Text>
                <Text
                  variant="body-lg"
                  align="center"
                  style={{ color: "rgba(255,255,255,0.78)", maxWidth: 300 }}
                >
                  Rear, track, and care for every goat — and bill your Ad Pali
                  clients automatically.
                </Text>
              </VStack>
            </VStack>
          </GradientHero>
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
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  hero: { paddingVertical: 24 },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  footer: { paddingHorizontal: 20, paddingBottom: 16 },
});
