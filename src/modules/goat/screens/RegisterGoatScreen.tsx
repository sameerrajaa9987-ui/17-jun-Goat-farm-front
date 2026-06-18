import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { ChevronLeft, Camera, Check } from "lucide-react-native";
import { useRegisterGoat } from "@modules/goat/hooks/useGoats";
import { uploadImage } from "@modules/goat/api/goatApi";
import { mediaUrl } from "@modules/goat/screens/GoatListScreen";
import { useUsers } from "@modules/team/hooks/useTeam";
import { palette, radius } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Button,
  TextField,
  useBottomPadding,
} from "@shared/ui";

type ApiErr = { response?: { data?: { error?: { message?: string } } } };

export default function RegisterGoatScreen() {
  const navigation = useNavigation<any>();
  const create = useRegisterGoat();
  const bottomPadding = useBottomPadding(40);

  const [photo, setPhoto] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [earTagNo, setEarTag] = useState("");
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [gender, setGender] = useState<"male" | "female">("female");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [weightKg, setWeight] = useState("");
  const [ownership, setOwnership] = useState<"farm" | "client">("farm");
  const [clientUserId, setClientUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const { data: clientsData } = useUsers({ role: "client" });
  const clients = clientsData?.data ?? [];

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (res.canceled || !res.assets?.[0]) return;
    setUploading(true);
    try {
      const url = await uploadImage(res.assets[0].uri);
      setPhoto(url);
    } catch {
      // ignore upload failure; user can retry
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    if (ownership === "client" && !clientUserId) return;
    create.mutate(
      {
        name: name.trim() || undefined,
        earTagNo: earTagNo.trim() || undefined,
        breed: breed.trim() || undefined,
        color: color.trim() || undefined,
        gender,
        photo: photo || undefined,
        purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        ownership:
          ownership === "client"
            ? { type: "client", clientUserId }
            : { type: "farm" },
        notes: notes.trim() || undefined,
      },
      { onSuccess: (g) => navigation.replace("GoatProfile", { id: g.id }) },
    );
  };

  const errMsg =
    (create.error as ApiErr)?.response?.data?.error?.message ||
    "Could not register goat.";
  const canSubmit = ownership === "farm" || !!clientUserId;

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.primary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Register goat
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 8,
              paddingBottom: bottomPadding,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {create.isError && (
              <View style={styles.error}>
                <Text variant="body-sm" tone="danger">
                  {errMsg}
                </Text>
              </View>
            )}

            {/* Photo */}
            <Pressable onPress={pickPhoto} style={styles.photoPicker}>
              {uploading ? (
                <ActivityIndicator color={palette.ink[700]} />
              ) : photo ? (
                <Image source={{ uri: mediaUrl(photo) }} style={styles.photo} />
              ) : (
                <VStack align="center" gap={6}>
                  <Camera
                    size={26}
                    color={palette.text.tertiary}
                    strokeWidth={1.6}
                  />
                  <Text variant="caption" tone="tertiary">
                    Add photo
                  </Text>
                </VStack>
              )}
            </Pressable>

            {/* Gender */}
            <Text variant="label" tone="secondary" style={{ marginBottom: 8 }}>
              Gender
            </Text>
            <HStack gap={10}>
              {(["female", "male"] as const).map((g) => (
                <Toggle
                  key={g}
                  active={gender === g}
                  label={g === "male" ? "Male ♂" : "Female ♀"}
                  onPress={() => setGender(g)}
                />
              ))}
            </HStack>

            <VStack gap={16} style={{ marginTop: 20 }}>
              <TextField
                label="Name"
                placeholder="e.g. Bijli"
                value={name}
                onChangeText={setName}
              />
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Ear tag no."
                    placeholder="ET-101"
                    value={earTagNo}
                    onChangeText={setEarTag}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Breed"
                    placeholder="Sirohi"
                    value={breed}
                    onChangeText={setBreed}
                  />
                </View>
              </HStack>
              <HStack gap={12}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Colour"
                    placeholder="Brown"
                    value={color}
                    onChangeText={setColor}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="Weight (kg)"
                    placeholder="22"
                    keyboardType="decimal-pad"
                    value={weightKg}
                    onChangeText={setWeight}
                  />
                </View>
              </HStack>
              <TextField
                label="Purchase price (₹)"
                placeholder="8000"
                keyboardType="number-pad"
                value={purchasePrice}
                onChangeText={setPurchasePrice}
              />
            </VStack>

            {/* Ownership */}
            <Text
              variant="label"
              tone="secondary"
              style={{ marginTop: 20, marginBottom: 8 }}
            >
              Ownership
            </Text>
            <HStack gap={10}>
              <Toggle
                active={ownership === "farm"}
                label="Farm-owned"
                onPress={() => setOwnership("farm")}
              />
              <Toggle
                active={ownership === "client"}
                label="Ad Pali client"
                onPress={() => setOwnership("client")}
              />
            </HStack>

            {ownership === "client" && (
              <VStack gap={8} style={{ marginTop: 14 }}>
                <Text variant="label" tone="secondary">
                  Select client
                </Text>
                {clients.length === 0 ? (
                  <Text variant="body-sm" tone="tertiary">
                    No Ad Pali clients yet. Add one from Team first.
                  </Text>
                ) : (
                  clients.map((c) => {
                    const active = clientUserId === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => setClientUserId(c.id)}
                        style={[
                          styles.clientRow,
                          active && styles.clientRowActive,
                        ]}
                      >
                        <VStack gap={2} flex={1}>
                          <Text variant="label-lg" tone="primary">
                            {c.fullName || c.firstName}
                          </Text>
                          <Text variant="caption" tone="tertiary">
                            {c.email}
                          </Text>
                        </VStack>
                        {active && (
                          <Check
                            size={20}
                            color={palette.ink[800]}
                            strokeWidth={2.2}
                          />
                        )}
                      </Pressable>
                    );
                  })
                )}
              </VStack>
            )}

            <View style={{ marginTop: 20 }}>
              <TextField
                label="Notes"
                placeholder="Optional"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            <Button
              label="Register goat"
              size="lg"
              loading={create.isPending}
              disabled={!canSubmit}
              onPress={submit}
              style={{ marginTop: 28 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Toggle({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.toggle, active && styles.toggleActive]}
    >
      <Text
        variant="label-lg"
        style={{
          color: active ? palette.text.inverse : palette.text.secondary,
        }}
      >
        {label}
      </Text>
    </Pressable>
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
  error: {
    marginBottom: 16,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
  },
  photoPicker: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.strong,
    borderStyle: "dashed",
    backgroundColor: palette.surface.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    overflow: "hidden",
  },
  photo: { width: "100%", height: "100%" },
  toggle: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 13,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  toggleActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  clientRowActive: {
    borderColor: palette.ink[800],
    backgroundColor: palette.ink[50],
  },
});
