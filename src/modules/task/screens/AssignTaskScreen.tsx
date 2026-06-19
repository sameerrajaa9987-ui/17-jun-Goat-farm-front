import React, { useMemo, useState } from "react";
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
import { ChevronLeft, Check } from "lucide-react-native";
import { useAssignTask } from "@modules/task/hooks/useTasks";
import { TaskType, Priority, TASK_TYPE_LABEL } from "@modules/task/types";
import { useUsers } from "@modules/team/hooks/useTeam";
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

const TYPES: TaskType[] = [
  "feed_am",
  "feed_pm",
  "water",
  "clean",
  "weigh",
  "medicate",
  "health_check",
  "other",
];

type ApiErr = { response?: { data?: { error?: { message?: string } } } };

function buildDue(
  day: "today" | "tomorrow",
  slot: "morning" | "evening",
): string {
  const d = new Date();
  if (day === "tomorrow") d.setDate(d.getDate() + 1);
  d.setHours(slot === "morning" ? 7 : 17, 0, 0, 0);
  return d.toISOString();
}

export default function AssignTaskScreen() {
  const navigation = useNavigation<any>();
  const assign = useAssignTask();
  const bottomPadding = useBottomPadding(40);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("feed_am");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [goatId, setGoatId] = useState<string | null>(null);
  const [day, setDay] = useState<"today" | "tomorrow">("today");
  const [slot, setSlot] = useState<"morning" | "evening">("morning");
  const [priority, setPriority] = useState<Priority>("normal");

  const { data: workersData } = useUsers({ role: "worker" });
  const { data: vetsData } = useUsers({ role: "vet" });
  const assignees = useMemo(
    () => [...(workersData?.data ?? []), ...(vetsData?.data ?? [])],
    [workersData, vetsData],
  );
  const { data: goatsData } = useGoats();
  const goats = goatsData?.data ?? [];

  const submit = () => {
    if (!title.trim() || !assignedTo) return;
    assign.mutate(
      {
        title: title.trim(),
        type,
        assignedTo,
        goatId: goatId || undefined,
        dueDate: buildDue(day, slot),
        priority,
      },
      { onSuccess: () => navigation.goBack() },
    );
  };

  const errMsg =
    (assign.error as ApiErr)?.response?.data?.error?.message ||
    "Could not assign task.";

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            hitSlop={8}
          >
            <ChevronLeft
              size={22}
              color={palette.text.primary}
              strokeWidth={2}
            />
          </Pressable>
          <VStack gap={2} flex={1}>
            <Text variant="overline" tone="tertiary">
              Operations
            </Text>
            <Text variant="h3" tone="primary">
              Assign task
            </Text>
          </VStack>
          <View style={{ width: 44 }} />
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
            {assign.isError && (
              <View style={styles.error}>
                <Text variant="body-sm" tone="danger">
                  {errMsg}
                </Text>
              </View>
            )}

            <Card elevation="raised">
              <TextField
                label="Title"
                placeholder="e.g. Morning feed - Pen A"
                value={title}
                onChangeText={setTitle}
              />

              <Label text="Task type" />
              <View style={styles.wrapRow}>
                {TYPES.map((tp) => (
                  <Chip
                    key={tp}
                    active={type === tp}
                    label={TASK_TYPE_LABEL[tp]}
                    onPress={() => setType(tp)}
                  />
                ))}
              </View>
            </Card>

            <Card style={{ marginTop: 16 }} elevation="raised">
              <Label text="Assign to" first />
              {assignees.length === 0 ? (
                <Text variant="body-sm" tone="tertiary">
                  No workers yet — add one from Team.
                </Text>
              ) : (
                <VStack gap={8}>
                  {assignees.map((u) => {
                    const active = assignedTo === u.id;
                    return (
                      <Pressable
                        key={u.id}
                        onPress={() => setAssignedTo(u.id)}
                        style={[styles.row, active && styles.rowActive]}
                      >
                        <VStack gap={2} flex={1}>
                          <Text variant="label-lg" tone="primary">
                            {u.fullName || u.firstName}
                          </Text>
                          <Text variant="caption" tone="tertiary">
                            {u.role} · {u.email}
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
                  })}
                </VStack>
              )}

              <Label text="Goat (optional)" />
              <View style={styles.wrapRow}>
                <Chip
                  active={!goatId}
                  label="No specific goat"
                  onPress={() => setGoatId(null)}
                />
                {goats.slice(0, 12).map((g) => (
                  <Chip
                    key={g.id}
                    active={goatId === g.id}
                    label={g.name || g.goatId}
                    onPress={() => setGoatId(g.id)}
                  />
                ))}
              </View>
            </Card>

            <Card style={{ marginTop: 16 }} elevation="raised">
              <Label text="Due" first />
              <HStack gap={8}>
                <Chip
                  active={day === "today"}
                  label="Today"
                  onPress={() => setDay("today")}
                />
                <Chip
                  active={day === "tomorrow"}
                  label="Tomorrow"
                  onPress={() => setDay("tomorrow")}
                />
              </HStack>
              <HStack gap={8} style={{ marginTop: 8 }}>
                <Chip
                  active={slot === "morning"}
                  label="Morning (7:00)"
                  onPress={() => setSlot("morning")}
                />
                <Chip
                  active={slot === "evening"}
                  label="Evening (17:00)"
                  onPress={() => setSlot("evening")}
                />
              </HStack>

              <Label text="Priority" />
              <HStack gap={8}>
                {(["low", "normal", "high"] as Priority[]).map((p) => (
                  <Chip
                    key={p}
                    active={priority === p}
                    label={p[0].toUpperCase() + p.slice(1)}
                    onPress={() => setPriority(p)}
                  />
                ))}
              </HStack>
            </Card>

            <Button
              label="Assign task"
              size="lg"
              loading={assign.isPending}
              disabled={!title.trim() || !assignedTo}
              onPress={submit}
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
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    backgroundColor: palette.surface.secondary,
  },
  chipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.secondary,
  },
  rowActive: {
    borderColor: palette.ink[800],
    backgroundColor: palette.ink[50],
  },
});
