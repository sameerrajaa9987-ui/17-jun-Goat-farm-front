import React, { useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "lucide-react-native";
import { useCreateStaff } from "@modules/staff/hooks/useStaff";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Text,
  VStack,
  Button,
  TextField,
  Card,
  useBottomPadding,
} from "@shared/ui";

const DESIGNATIONS = ["worker", "helper", "vet", "manager", "guard", "driver"];

export default function AddStaffScreen() {
  const navigation = useNavigation<any>();
  const create = useCreateStaff();
  const bottomPadding = useBottomPadding(40);

  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("worker");
  const [phone, setPhone] = useState("");
  const [salaryAmount, setSalary] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    create.mutate(
      {
        name: name.trim(),
        designation,
        phone: phone.trim() || undefined,
        salaryAmount: salaryAmount ? Number(salaryAmount) : undefined,
      },
      { onSuccess: (s) => navigation.replace("StaffProfile", { id: s.id }) },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={styles.backBtn}
          >
            <ChevronLeft
              size={22}
              color={palette.text.primary}
              strokeWidth={2}
            />
          </Pressable>
          <VStack gap={3} flex={1}>
            <Text variant="overline" tone="tertiary">
              People
            </Text>
            <Text variant="h1" tone="primary">
              Add staff
            </Text>
            <Text variant="body-sm" tone="tertiary">
              Create a new team member
            </Text>
          </VStack>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: bottomPadding,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <Card elevation="raised">
              <TextField
                label="Full name"
                placeholder="e.g. Ravi Kumar"
                value={name}
                onChangeText={setName}
              />

              <Text
                variant="label"
                tone="secondary"
                style={{ marginTop: 20, marginBottom: 8 }}
              >
                Designation
              </Text>
              <View style={styles.wrapRow}>
                {DESIGNATIONS.map((d) => {
                  const active = designation === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setDesignation(d)}
                      style={[styles.chip, active && styles.chipActive]}
                    >
                      <Text
                        variant="label"
                        style={{
                          color: active
                            ? palette.text.inverse
                            : palette.text.secondary,
                        }}
                      >
                        {d[0].toUpperCase() + d.slice(1)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Card elevation="raised" style={{ marginTop: 16 }}>
              <VStack gap={16}>
                <TextField
                  label="Phone"
                  placeholder="+91..."
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <TextField
                  label="Monthly salary (₹)"
                  placeholder="12000"
                  keyboardType="number-pad"
                  value={salaryAmount}
                  onChangeText={setSalary}
                />
              </VStack>
            </Card>

            <Button
              label="Add staff"
              size="lg"
              loading={create.isPending}
              disabled={!name.trim()}
              onPress={submit}
              style={{ marginTop: 28 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.xs,
  },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  chipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
});
