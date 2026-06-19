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
import { useNavigation, useRoute } from "@react-navigation/native";
import { ChevronLeft, Check } from "lucide-react-native";
import { useCreateHealthRecord } from "@modules/health/hooks/useHealth";
import {
  HealthType,
  AppliedHealthStatus,
  HEALTH_TYPE_LABEL,
  HEALTH_STATUS_LABEL,
} from "@modules/health/types";
import { useGoats } from "@modules/goat/hooks/useGoats";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Button,
  TextField,
  Card,
  useBottomPadding,
} from "@shared/ui";

const TYPES: HealthType[] = [
  "diagnosis",
  "treatment",
  "vaccination",
  "deworming",
  "checkup",
  "prescription",
  "note",
];
const SCHEDULABLE: HealthType[] = ["vaccination", "deworming"];
const STATUSES: AppliedHealthStatus[] = [
  "healthy",
  "under_treatment",
  "critical",
  "recovered",
];

type ApiErr = { response?: { data?: { error?: { message?: string } } } };

function dueInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}

export default function AddHealthRecordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const presetGoatId = route.params?.goatId as string | undefined;
  const create = useCreateHealthRecord();
  const bottomPadding = useBottomPadding(40);

  const [goatId, setGoatId] = useState<string | null>(presetGoatId ?? null);
  const [type, setType] = useState<HealthType>("vaccination");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [vetNotes, setVetNotes] = useState("");
  const [applyStatus, setApplyStatus] = useState<AppliedHealthStatus | null>(
    null,
  );
  const [scheduleMode, setScheduleMode] = useState(false); // schedule vs record-now
  const [dueIn, setDueIn] = useState<number>(7);

  const { data: goatsData } = useGoats();
  const goats = goatsData?.data ?? [];
  const isSchedulable = SCHEDULABLE.includes(type);

  const submit = () => {
    if (!goatId || !title.trim()) return;
    const payload: any = {
      goatId,
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      medicine: medicine.trim() || undefined,
      dosage: dosage.trim() || undefined,
      vetNotes: vetNotes.trim() || undefined,
    };
    if (isSchedulable && scheduleMode) {
      payload.dueDate = dueInDays(dueIn);
    } else {
      payload.performedAt = new Date().toISOString();
      if (applyStatus) payload.appliedHealthStatus = applyStatus;
    }
    create.mutate(payload, { onSuccess: () => navigation.goBack() });
  };

  const errMsg =
    (create.error as ApiErr)?.response?.data?.error?.message ||
    "Could not save record.";

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={palette.text.primary} />
          </Pressable>
          <VStack gap={3} flex={1} style={{ marginLeft: 12 }}>
            <Text variant="overline" tone="tertiary">
              Health
            </Text>
            <Text variant="h3" tone="primary">
              Health record
            </Text>
          </VStack>
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

            <Card elevation="raised">
              <Label text="Type" first />
              <View style={styles.wrapRow}>
                {TYPES.map((tp) => (
                  <Chip
                    key={tp}
                    active={type === tp}
                    label={HEALTH_TYPE_LABEL[tp]}
                    onPress={() => setType(tp)}
                  />
                ))}
              </View>

              {!presetGoatId && (
                <>
                  <Label text="Goat" />
                  <View style={styles.wrapRow}>
                    {goats.slice(0, 16).map((g) => (
                      <Chip
                        key={g.id}
                        active={goatId === g.id}
                        label={g.name || g.goatId}
                        onPress={() => setGoatId(g.id)}
                      />
                    ))}
                  </View>
                </>
              )}
            </Card>

            <Card elevation="raised" style={{ marginTop: 16 }}>
              <VStack gap={16}>
                <TextField
                  label="Title"
                  placeholder="e.g. PPR vaccine"
                  value={title}
                  onChangeText={setTitle}
                />
                {isSchedulable ? (
                  <View>
                    <HStack gap={10}>
                      <Chip
                        active={!scheduleMode}
                        label="Record now"
                        onPress={() => setScheduleMode(false)}
                      />
                      <Chip
                        active={scheduleMode}
                        label="Schedule"
                        onPress={() => setScheduleMode(true)}
                      />
                    </HStack>
                    {scheduleMode && (
                      <View style={{ marginTop: 12 }}>
                        <Label text="Due in" />
                        <HStack gap={8}>
                          {[7, 14, 30, 90].map((d) => (
                            <Chip
                              key={d}
                              active={dueIn === d}
                              label={`${d}d`}
                              onPress={() => setDueIn(d)}
                            />
                          ))}
                        </HStack>
                      </View>
                    )}
                  </View>
                ) : null}

                {(!isSchedulable || !scheduleMode) && (
                  <>
                    <HStack gap={12}>
                      <View style={{ flex: 1 }}>
                        <TextField
                          label="Medicine"
                          placeholder="e.g. Oxytetracycline"
                          value={medicine}
                          onChangeText={setMedicine}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <TextField
                          label="Dosage"
                          placeholder="5ml"
                          value={dosage}
                          onChangeText={setDosage}
                        />
                      </View>
                    </HStack>
                    <TextField
                      label="Description"
                      placeholder="Symptoms / findings"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                    />
                    <TextField
                      label="Vet notes (optional)"
                      placeholder="Notes"
                      value={vetNotes}
                      onChangeText={setVetNotes}
                    />

                    <View>
                      <Label text="Set goat health status (optional)" />
                      <View style={styles.wrapRow}>
                        <Chip
                          active={applyStatus === null}
                          label="No change"
                          onPress={() => setApplyStatus(null)}
                        />
                        {STATUSES.map((s) => (
                          <Chip
                            key={s}
                            active={applyStatus === s}
                            label={HEALTH_STATUS_LABEL[s]}
                            onPress={() => setApplyStatus(s)}
                          />
                        ))}
                      </View>
                    </View>
                  </>
                )}
              </VStack>
            </Card>

            <Button
              label={isSchedulable && scheduleMode ? "Schedule" : "Save record"}
              size="lg"
              loading={create.isPending}
              disabled={!goatId || !title.trim()}
              onPress={submit}
              icon={<Check size={18} color={palette.text.inverse} />}
              style={{ marginTop: 28 }}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function Label({ text, first }: { text: string; first?: boolean }) {
  return (
    <Text
      variant="label"
      tone="secondary"
      style={{ marginTop: first ? 0 : 20, marginBottom: 8 }}
    >
      {text}
    </Text>
  );
}

function Chip({
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
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text
        variant="label"
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
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: palette.surface.primary,
    borderWidth: 1,
    borderColor: palette.border.default,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.xs,
  },
  error: {
    marginBottom: 16,
    padding: 16,
    borderRadius: radius.md,
    backgroundColor: palette.danger.bg,
    borderWidth: 1,
    borderColor: palette.danger.border,
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
