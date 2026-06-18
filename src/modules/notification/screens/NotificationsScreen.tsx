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
import {
  ChevronLeft,
  Bell,
  ReceiptIndianRupee,
  Syringe,
  Boxes,
  ClipboardCheck,
  PawPrint,
  CheckCheck,
} from "lucide-react-native";
import { format } from "date-fns";
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "@modules/notification/hooks/useNotifications";
import { AppNotification, NotificationType } from "@modules/notification/types";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, Card } from "@shared/ui";

const ICONS: Record<NotificationType, React.ComponentType<any>> = {
  payment_reminder: ReceiptIndianRupee,
  health_reminder: Syringe,
  low_stock: Boxes,
  task_update: ClipboardCheck,
  goat_update: PawPrint,
  report: Bell,
  system: Bell,
};

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch, isRefetching } = useNotifications();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const items = data?.data ?? [];

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
              Activity
            </Text>
            <Text variant="h3" tone="primary">
              Notifications
            </Text>
          </VStack>
          <Pressable
            onPress={() => markAll.mutate()}
            hitSlop={10}
            style={styles.backBtn}
          >
            <CheckCheck size={20} color={palette.ink[800]} />
          </Pressable>
        </View>

        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
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
                <Bell size={34} color={palette.ink[300]} strokeWidth={1.5} />
              </View>
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No notifications."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => (
            <Row
              n={item}
              onPress={() => !item.isRead && markRead.mutate(item.id)}
            />
          )}
        />
      </SafeAreaView>
    </View>
  );
}

function Row({ n, onPress }: { n: AppNotification; onPress: () => void }) {
  const Icon = ICONS[n.type] || Bell;
  let when = n.createdAt;
  try {
    when = format(new Date(n.createdAt), "dd MMM, HH:mm");
  } catch {
    /* raw */
  }
  return (
    <Card
      onPress={onPress}
      elevation="raised"
      style={[styles.card, !n.isRead && styles.unread]}
    >
      <HStack gap={12} align="flex-start">
        <View
          style={[
            styles.icon,
            n.priority === "high" && { backgroundColor: palette.danger.bg },
          ]}
        >
          <Icon
            size={18}
            color={
              n.priority === "high" ? palette.danger.text : palette.ink[700]
            }
            strokeWidth={1.8}
          />
        </View>
        <VStack gap={3} flex={1}>
          <Text variant="label-lg" tone="primary">
            {n.title}
          </Text>
          <Text variant="body-sm" tone="secondary">
            {n.message}
          </Text>
          <Text variant="caption" tone="tertiary">
            {when}
          </Text>
        </VStack>
        {!n.isRead && <View style={styles.dot} />}
      </HStack>
    </Card>
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
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
  card: { padding: 14 },
  unread: { borderColor: palette.ink[300], backgroundColor: palette.ink[50] },
  icon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.amber[500],
    marginTop: 6,
  },
});
