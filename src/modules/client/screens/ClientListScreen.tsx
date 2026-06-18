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
  Plus,
  UsersRound,
  ChevronRight,
  ReceiptIndianRupee,
} from "lucide-react-native";
import { useClients } from "@modules/client/hooks/useClients";
import { ClientListItem } from "@modules/client/types";
import { palette, radius, shadows } from "@shared/designSystem";
import { Text, VStack, HStack, StatusChip } from "@shared/ui";

export default function ClientListScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading, refetch, isRefetching } = useClients();
  const clients = data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: palette.surface.secondary }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <View style={styles.topbar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <ChevronLeft size={26} color={palette.text.primary} />
          </Pressable>
          <Text variant="h3" tone="primary">
            Ad Pali clients
          </Text>
          <Pressable
            onPress={() => navigation.navigate("Invoices")}
            hitSlop={10}
          >
            <ReceiptIndianRupee size={22} color={palette.ink[800]} />
          </Pressable>
        </View>

        <FlatList
          data={clients}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={palette.ink[700]}
            />
          }
          ListEmptyComponent={
            <VStack align="center" gap={8} style={{ marginTop: 50 }}>
              <UsersRound
                size={40}
                color={palette.text.disabled}
                strokeWidth={1.5}
              />
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No clients yet."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <ClientRow
              client={item}
              onPress={() =>
                navigation.navigate("ClientProfile", { userId: item.userId })
              }
            />
          )}
        />

        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate("AddClient")}
        >
          <Plus size={24} color={palette.text.inverse} strokeWidth={2.2} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function ClientRow({
  client,
  onPress,
}: {
  client: ClientListItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
    >
      <HStack gap={12} align="center">
        <View style={styles.avatar}>
          <Text variant="label-lg" tone="inverse">
            {(client.user?.name || "C").charAt(0).toUpperCase()}
          </Text>
        </View>
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary">
            {client.user?.name || "Client"}
          </Text>
          <Text variant="caption" tone="tertiary">
            {client.user?.email}
          </Text>
          <HStack gap={6}>
            <StatusChip
              label={`${client.goatCount} goat${client.goatCount === 1 ? "" : "s"}`}
              tone="info"
            />
            {client.status === "inactive" ? (
              <StatusChip label="Inactive" tone="neutral" />
            ) : null}
          </HStack>
        </VStack>
        <ChevronRight size={18} color={palette.text.tertiary} />
      </HStack>
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
  card: {
    backgroundColor: palette.surface.primary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: palette.border.default,
    padding: 14,
    ...shadows.xs,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    backgroundColor: palette.amber[600],
    alignItems: "center",
    justifyContent: "center",
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
