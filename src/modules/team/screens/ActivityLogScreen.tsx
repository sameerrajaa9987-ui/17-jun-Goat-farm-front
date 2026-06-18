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
import { ChevronLeft } from "lucide-react-native";
import { format } from "date-fns";
import { useActivityLogs } from "@modules/team/hooks/useTeam";
import { ActivityLog } from "@modules/team/types";
import { palette } from "@shared/designSystem";
import { Text, VStack, HStack, Card } from "@shared/ui";

export default function ActivityLogScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch, isRefetching } = useActivityLogs();
  const logs = data?.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Activity log
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <FlatList
          data={logs}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <Text
              variant="body"
              tone="tertiary"
              align="center"
              style={{ marginTop: 40 }}
            >
              {isLoading ? "Loading..." : "No activity yet."}
            </Text>
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
    <Card>
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
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
