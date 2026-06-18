import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft, ScrollText } from "lucide-react-native";
import { format } from "date-fns";
import { useActivityLogs } from "@modules/team/hooks/useTeam";
import { ActivityLog } from "@modules/team/types";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, Card } from "@shared/ui";

export default function ActivityLogScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch, isRefetching } = useActivityLogs();
  const logs = data?.data ?? [];

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
              Audit
            </Text>
            <Text variant="h1" tone="primary">
              Activity log
            </Text>
            <Text variant="body-sm" tone="tertiary">
              Recent account activity
            </Text>
          </VStack>
        </View>

        <FlatList
          data={logs}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{
            padding: 20,
            paddingTop: 12,
            paddingBottom: 40,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <VStack align="center" gap={10} style={{ marginTop: 60 }}>
              <View style={styles.emptyIcon}>
                <ScrollText
                  size={34}
                  color={palette.ink[300]}
                  strokeWidth={1.5}
                />
              </View>
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No activity yet."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => <LogRow log={item} />}
        />
      </SafeAreaView>
    </View>
  );
}

function LogRow({ log }: { log: ActivityLog }) {
  let when = log.createdAt;
  try {
    when = format(new Date(log.createdAt), "dd MMM, HH:mm");
  } catch {
    // keep raw
  }
  return (
    <Card elevation="raised">
      <VStack gap={4}>
        <HStack justify="space-between" align="center">
          <Text variant="label-lg" tone="primary">
            {log.action}
          </Text>
          <Text variant="caption" tone="tertiary">
            {when}
          </Text>
        </HStack>
        {log.description ? (
          <Text variant="body-sm" tone="secondary">
            {log.description}
          </Text>
        ) : null}
        <Text variant="caption" tone="tertiary">
          {log.user ? `${log.user.name} (${log.user.role})` : "System"}
          {log.ipAddress ? ` • ${log.ipAddress}` : ""}
        </Text>
      </VStack>
    </Card>
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
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
});
