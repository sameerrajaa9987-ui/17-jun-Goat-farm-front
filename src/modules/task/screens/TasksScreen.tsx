import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Plus, ClipboardList, ChevronRight } from "lucide-react-native";
import { format } from "date-fns";
import { useTasks } from "@modules/task/hooks/useTasks";
import { Task, TaskStatus, TASK_TYPE_LABEL } from "@modules/task/types";
import { STATUS_LABEL, STATUS_TONE } from "@modules/task/taskMeta";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip } from "@shared/ui";

type FilterKey = "active" | TaskStatus;

const WORKER_FILTERS: { key: FilterKey; label: string }[] = [
  { key: "active", label: "To do" },
  { key: "submitted", label: "Submitted" },
  { key: "approved", label: "Done" },
  { key: "rejected", label: "Rejected" },
];

const MANAGER_FILTERS: { key: FilterKey; label: string }[] = [
  { key: "submitted", label: "To approve" },
  { key: "active", label: "Active" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function TasksScreen() {
  const navigation = useNavigation<any>();
  const role = useAuthStore((s) => s.user?.role);
  const isManager = role === "owner" || role === "manager";
  const filters = isManager ? MANAGER_FILTERS : WORKER_FILTERS;
  const [filter, setFilter] = useState<FilterKey>(
    isManager ? "submitted" : "active",
  );

  // "active" = pending + in_progress; the API filters one status, so for
  // active we fetch pending and in_progress is included by not filtering when
  // active means we request status=pending and also in_progress via 2 calls?
  // Simpler: request without status for "active" then filter client-side.
  const apiParams = filter === "active" ? undefined : { status: filter };
  const { data, isLoading, refetch, isRefetching } = useTasks(apiParams);

  let tasks: Task[] = data?.data ?? [];
  if (filter === "active") {
    tasks = tasks.filter(
      (t) => t.status === "pending" || t.status === "in_progress",
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <VStack gap={2} flex={1}>
            <Text variant="h1" tone="primary">
              Tasks
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {isManager ? "Assign and approve daily work" : "Your daily work"}
            </Text>
          </VStack>
        </View>

        <View style={styles.filters}>
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
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
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          data={tasks}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{
            padding: 20,
            paddingTop: 8,
            paddingBottom: 100,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <VStack align="center" gap={8} style={{ marginTop: 60 }}>
              <ClipboardList
                size={40}
                color={palette.text.disabled}
                strokeWidth={1.5}
              />
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "Nothing here."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              isManager={isManager}
              onPress={() => navigation.navigate("TaskDetail", { id: item.id })}
            />
          )}
        />

        {isManager && (
          <Pressable
            style={styles.fab}
            onPress={() => navigation.navigate("AssignTask")}
          >
            <Plus size={24} color={palette.text.inverse} strokeWidth={2.2} />
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
}

function TaskCard({
  task,
  isManager,
  onPress,
}: {
  task: Task;
  isManager: boolean;
  onPress: () => void;
}) {
  let due = task.dueDate;
  try {
    due = format(new Date(task.dueDate), "dd MMM, HH:mm");
  } catch {
    // raw
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <HStack gap={12} align="center">
        <VStack gap={6} flex={1}>
          <HStack gap={8} align="center">
            <Text variant="label-lg" tone="primary" numberOfLines={1}>
              {task.title}
            </Text>
            {task.priority === "high" ? (
              <StatusChip label="High" tone="danger" />
            ) : null}
          </HStack>
          <Text variant="body-sm" tone="tertiary">
            {TASK_TYPE_LABEL[task.type]}
            {task.goat ? `  ·  ${task.goat.name || task.goat.goatId}` : ""}
            {`  ·  ${due}`}
          </Text>
          <HStack gap={6} align="center">
            <StatusChip
              label={STATUS_LABEL[task.status]}
              tone={STATUS_TONE[task.status]}
            />
            {isManager && task.assignedTo ? (
              <Text variant="caption" tone="tertiary">
                {task.assignedTo.name}
              </Text>
            ) : null}
          </HStack>
        </VStack>
        <ChevronRight size={18} color={palette.text.tertiary} />
      </HStack>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.primary,
  },
  chipActive: {
    backgroundColor: palette.ink[900],
    borderColor: palette.ink[900],
  },
  card: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 16,
    ...shadows.xs,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: palette.ink[900],
    alignItems: "center",
    justifyContent: "center",
    ...shadows.lg,
  },
});
