import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Sprout, ScanLine, Users, type LucideIcon } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, Button } from "@shared/ui";
import { palette, radius, gradients, glass } from "@shared/designSystem";

type Props = { navigation: { navigate: (s: string) => void } };

type Slide = { icon: LucideIcon; titleKey: string; bodyKey: string };

const SLIDES: Slide[] = [
  {
    icon: Sprout,
    titleKey: "onboarding.slide1Title",
    bodyKey: "onboarding.slide1Body",
  },
  {
    icon: ScanLine,
    titleKey: "onboarding.slide2Title",
    bodyKey: "onboarding.slide2Body",
  },
  {
    icon: Users,
    titleKey: "onboarding.slide3Title",
    bodyKey: "onboarding.slide3Body",
  },
];

export default function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const last = index === SLIDES.length - 1;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const onPrimary = () => {
    if (last) navigation.navigate("Login");
    else scroller.current?.scrollTo({ x: width * (index + 1), animated: true });
  };
  const onSecondary = () => navigation.navigate(last ? "Register" : "Login");

  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
        >
          {SLIDES.map((s) => {
            const Icon = s.icon;
            return (
              <View key={s.titleKey} style={[styles.slide, { width }]}>
                <View style={[styles.badge, glass.light]}>
                  <Icon
                    color={palette.amber[300]}
                    size={44}
                    strokeWidth={1.6}
                  />
                </View>
                <Text
                  variant="display-sm"
                  tone="inverse"
                  align="center"
                  style={{ marginTop: 32 }}
                >
                  {t(s.titleKey)}
                </Text>
                <Text
                  variant="body-lg"
                  align="center"
                  style={{
                    color: "rgba(255,255,255,0.78)",
                    marginTop: 12,
                    maxWidth: 320,
                  }}
                >
                  {t(s.bodyKey)}
                </Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.titleKey}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        {/* Controls */}
        <View style={styles.footer}>
          <Button
            label={last ? t("auth.signIn") : t("onboarding.next")}
            size="lg"
            variant="accent"
            onPress={onPrimary}
          />
          <Pressable
            onPress={onSecondary}
            hitSlop={10}
            style={styles.secondary}
          >
            <Text
              variant="label-lg"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {last ? t("auth.createAccount") : t("onboarding.skip")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  badge: {
    width: 104,
    height: 104,
    borderRadius: radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  dotActive: {
    width: 22,
    backgroundColor: palette.amber[400],
  },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 16 },
  secondary: { alignSelf: "center", paddingVertical: 14 },
});
