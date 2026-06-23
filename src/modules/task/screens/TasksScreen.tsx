import React, { useState } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Plus, ClipboardList, ChevronRight } from "lucide-react-native";
import { format } from "date-fns";
import { useTasks } from "@modules/task/hooks/useTasks";
import { Task, TaskStatus, TASK_TYPE_LABEL } from "@modules/task/types";
import { STATUS_LABEL, STATUS_TONE } from "@modules/task/taskMeta";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  StatusChip,
  Card,
  ChipsRow,
  Fab,
} from "@shared/ui";

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

// Left-rail accent colour per status — lets the eye scan a long list fast.
const RAIL: Record<string, string> = {
  pending: palette.amber[400],
  in_progress: palette.info.text,
  submitted: palette.amber[500],
  approved: palette.ink[500],
  rejected: palette.danger.text,
};

export default function TasksScreen() {
  const navigation = useNavigation<any>();
  const role = useAuthStore((s) => s.user?.role);
  const isManager = role === "owner" || role === "manager";
  const filters = isManager ? MANAGER_FILTERS : WORKER_FILTERS;
  const [filter, setFilter] = useState<FilterKey>(
    isManager ? "submitted" : "active",
  );

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
          <VStack gap={3} flex={1}>
            <Text variant="overline" tone="tertiary">
              Operations
            </Text>
            <Text variant="h1" tone="primary">
              Tasks
            </Text>
            <Text variant="body-sm" tone="tertiary">
              {isManager ? "Assign and approve daily work" : "Your daily work"}
            </Text>
          </VStack>
        </View>

        <ChipsRow
          chips={[...filters]}
          active={filter}
          onChange={(k) => setFilter(k as FilterKey)}
        />

        <FlatList
          data={tasks}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{
            padding: 16,
            paddingTop: 12,
            paddingBottom: 110,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <VStack align="center" gap={10} style={{ marginTop: 70 }}>
              <View style={styles.emptyIcon}>
                <ClipboardList
                  size={34}
                  color={palette.ink[300]}
                  strokeWidth={1.5}
                />
              </View>
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
          <Fab
            onPress={() => navigation.navigate("AssignTask")}
            icon={
              <Plus size={24} color={palette.text.inverse} strokeWidth={2.4} />
            }
          />
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
    <Card
      onPress={onPress}
      elevation="raised"
      padded={false}
      style={styles.card}
    >
      <HStack gap={0} align="stretch">
        <View
          style={[
            styles.rail,
            { backgroundColor: RAIL[task.status] || palette.ink[300] },
          ]}
        />
        <View style={styles.cardBody}>
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
        </View>
      </HStack>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  card: { overflow: "hidden" },
  rail: { width: 4 },
  cardBody: { flex: 1, padding: 16 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
});
