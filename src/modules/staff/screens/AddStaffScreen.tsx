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
import { palette, radius } from "@shared/designSystem";
import { Text, VStack, Button, TextField, useBottomPadding } from "@shared/ui";

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
    <View style={{ flex: 1, backgroundColor: palette.surface.primary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Add staff
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

            <VStack gap={16} style={{ marginTop: 20 }}>
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
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  wrapRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
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
