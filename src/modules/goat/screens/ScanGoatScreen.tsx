import React, { useState } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ChevronLeft, QrCode, ScanLine } from "lucide-react-native";
import { useScanGoat } from "@modules/goat/hooks/useGoats";
import { palette, radius } from "@shared/designSystem";
import { Text, VStack, Button, TextField } from "@shared/ui";

/** Extracts the qrToken from a scanned payload (goatfarm://goat/<token>) or raw token. */
function parseToken(data: string): string {
  const m = /goat\/([\w-]+)/.exec(data);
  return m ? m[1] : data.trim();
}

export default function ScanGoatScreen() {
  const navigation = useNavigation<any>();
  const [permission, requestPermission] = useCameraPermissions();
  const scan = useScanGoat();
  const [manual, setManual] = useState("");
  const [locked, setLocked] = useState(false);
  const [error, setError] = useState("");

  const resolve = (token: string) => {
    if (!token || locked) return;
    setLocked(true);
    setError("");
    scan.mutate(token, {
      onSuccess: (g) => navigation.replace("GoatProfile", { id: g.id }),
      onError: () => {
        setError("No goat found for that code.");
        setLocked(false);
      },
    });
  };

  const webOrNoCamera = Platform.OS === "web";

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.dark }}>
      <SafeAreaView
        style={{ flex: 1 }}
        edges={["top", "left", "right", "bottom"]}
      >
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.inverse} />
          </Pressable>
          <Text variant="h3" tone="inverse">
            Scan goat tag
          </Text>
          <View style={{ width: 26 }} />
        </View>

        {!webOrNoCamera && permission?.granted ? (
          <View style={styles.cameraWrap}>
            <CameraView
              style={StyleSheet.absoluteFill}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={({ data }: { data: string }) =>
                resolve(parseToken(data))
              }
            />
            <View style={styles.reticleWrap} pointerEvents="none">
              <View style={styles.reticle} />
              <Text variant="body-sm" tone="inverse" style={{ marginTop: 16 }}>
                Point at the goat&apos;s QR tag
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.permWrap}>
            <ScanLine size={48} color={palette.amber[400]} strokeWidth={1.4} />
            <Text
              variant="body-lg"
              tone="inverse"
              align="center"
              style={{ marginTop: 16 }}
            >
              {webOrNoCamera
                ? "Camera scanning isn't available here. Enter the Goat ID or code below."
                : "Allow camera access to scan goat QR tags."}
            </Text>
            {!webOrNoCamera && !permission?.granted && (
              <Button
                label="Allow camera"
                variant="accent"
                style={{ marginTop: 20, width: 220 }}
                onPress={requestPermission}
              />
            )}
          </View>
        )}

        {/* Manual fallback */}
        <View style={styles.manual}>
          <VStack gap={12}>
            <Text variant="label" style={{ color: palette.ink[200] }}>
              Or enter code manually
            </Text>
            <TextField
              placeholder="QR token"
              autoCapitalize="none"
              value={manual}
              onChangeText={setManual}
              leading={
                <QrCode
                  size={18}
                  color={palette.text.tertiary}
                  strokeWidth={1.6}
                />
              }
            />
            {error ? (
              <Text variant="body-sm" tone="danger">
                {error}
              </Text>
            ) : null}
            <Button
              label="Open passport"
              size="lg"
              loading={scan.isPending}
              onPress={() => resolve(parseToken(manual))}
            />
          </VStack>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cameraWrap: { flex: 1, overflow: "hidden" },
  reticleWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  reticle: {
    width: 220,
    height: 220,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: palette.amber[400],
  },
  permWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  manual: {
    backgroundColor: palette.surface.primary,
    borderTopLeftRadius: radius["2xl"],
    borderTopRightRadius: radius["2xl"],
    padding: 24,
    paddingBottom: 28,
  },
});
