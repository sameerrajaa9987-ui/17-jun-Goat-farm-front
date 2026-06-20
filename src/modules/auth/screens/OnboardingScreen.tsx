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
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { Text, Button } from "@shared/ui";
import { palette, radius, elevation } from "@shared/designSystem";

type Props = { navigation: { navigate: (s: string) => void } };

// Real goat photography in a fixed-aspect card → identical, controlled framing
// on every device (full-bleed crops unpredictably on tall screens).
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
    <View style={styles.root}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* top bar */}
        <View style={styles.topbar}>
          <Text variant="overline" tone="tertiary">
            {t("common.appName")}
          </Text>
          {!last ? (
            <Pressable
              onPress={() => navigation.navigate("Login")}
              hitSlop={10}
            >
              <Text variant="label" tone="tertiary">
                {t("onboarding.skip")}
              </Text>
            </Pressable>
          ) : (
            <View style={{ width: 1 }} />
          )}
        </View>

        <ScrollView
          ref={scroller}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
        >
          {SLIDES.map((s) => (
            <View key={s.titleKey} style={[styles.slide, { width }]}>
              <View style={styles.card}>
                <Image
                  source={s.img}
                  style={styles.cardImg}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={["transparent", "rgba(6,16,11,0.28)"]}
                  style={styles.cardShade}
                />
              </View>
              <Text
                variant="display-sm"
                tone="primary"
                style={{ marginTop: 28 }}
              >
                {t(s.titleKey)}
              </Text>
              <Text
                variant="body-lg"
                tone="secondary"
                style={{ marginTop: 10 }}
              >
                {t(s.bodyKey)}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* footer */}
        <View style={styles.footer}>
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
          <Pressable
            onPress={onSecondary}
            hitSlop={10}
            style={styles.secondary}
          >
            <Text variant="label-lg" tone={last ? "accent" : "tertiary"}>
              {last ? t("auth.createAccount") : t("onboarding.skip")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.surface.secondary },
  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    aspectRatio: 4 / 5,
    borderRadius: radius["3xl"],
    backgroundColor: palette.ink[50],
    overflow: "hidden",
    ...elevation.floating,
  },
  cardImg: { width: "100%", height: "100%" },
  cardShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
  },
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 },
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
    backgroundColor: palette.border.strong,
  },
  dotActive: { width: 22, backgroundColor: palette.amber[500] },
  secondary: { alignSelf: "center", paddingVertical: 14 },
});
