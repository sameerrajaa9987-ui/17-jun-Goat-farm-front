import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Text, Button } from "@shared/ui";
import { palette } from "@shared/designSystem";

type Props = { navigation: { navigate: (s: string) => void } };

// Full-bleed real goat photography (bundled locally → instant, works offline).
const SLIDES = [
  {
    img: require("../../../../assets/onboarding/slide1.jpg"),
    titleKey: "onboarding.slide1Title",
    bodyKey: "onboarding.slide1Body",
  },
  {
    img: require("../../../../assets/onboarding/slide2.jpg"),
    titleKey: "onboarding.slide2Title",
    bodyKey: "onboarding.slide2Body",
  },
  {
    img: require("../../../../assets/onboarding/slide3.jpg"),
    titleKey: "onboarding.slide3Title",
    bodyKey: "onboarding.slide3Body",
  },
];

// Forest scrim: slight darkening at the top (for the Skip row) and a strong
// gradient at the bottom so white headlines stay legible over any photo.
const SCRIM = [
  "rgba(10,30,16,0.38)",
  "rgba(10,30,16,0.05)",
  "rgba(10,30,16,0.55)",
  "rgba(6,16,11,0.96)",
] as const;

export default function OnboardingScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
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
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
      >
        {SLIDES.map((s) => (
          <View key={s.titleKey} style={{ width }}>
            <Image
              source={s.img}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <LinearGradient
              colors={SCRIM}
              locations={[0, 0.35, 0.72, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View
              style={[
                styles.content,
                { paddingBottom: insets.bottom + 210, paddingTop: insets.top },
              ]}
            >
              <Text variant="display-md" tone="inverse" style={styles.title}>
                {t(s.titleKey)}
              </Text>
              <Text
                variant="body-lg"
                style={{ color: "rgba(255,255,255,0.86)", marginTop: 12 }}
              >
                {t(s.bodyKey)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* top bar */}
      <View style={[styles.topbar, { paddingTop: insets.top + 8 }]}>
        <Text variant="overline" style={{ color: "rgba(255,255,255,0.9)" }}>
          {t("common.appName")}
        </Text>
        {!last ? (
          <Pressable onPress={() => navigation.navigate("Login")} hitSlop={10}>
            <Text variant="label" style={{ color: "rgba(255,255,255,0.9)" }}>
              {t("onboarding.skip")}
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 1 }} />
        )}
      </View>

      {/* footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={s.titleKey}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <Button
          label={last ? t("auth.signIn") : t("onboarding.next")}
          size="lg"
          variant="accent"
          onPress={onPrimary}
        />
        <Pressable onPress={onSecondary} hitSlop={10} style={styles.secondary}>
          <Text variant="label-lg" style={{ color: "rgba(255,255,255,0.92)" }}>
            {last ? t("auth.createAccount") : t("onboarding.skip")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink[900] },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 28,
  },
  title: { letterSpacing: -0.5 },
  topbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: { width: 22, backgroundColor: palette.amber[400] },
  secondary: { alignSelf: "center", paddingVertical: 14 },
});
