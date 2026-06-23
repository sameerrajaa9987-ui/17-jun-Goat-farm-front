import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Modal,
  Linking,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  ChevronLeft,
  Plus,
  FileText,
  X,
  Upload,
  ExternalLink,
} from "lucide-react-native";
import {
  useDocuments,
  useCreateDocument,
} from "@modules/document/hooks/useDocuments";
import {
  FarmDocument,
  DocumentType,
  DOC_TYPE_LABEL,
} from "@modules/document/types";
import { uploadImage } from "@modules/goat/api/goatApi";
import { mediaUrl } from "@modules/goat/screens/GoatListScreen";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  StatusChip,
  Button,
  TextField,
  Card,
  Fab,
} from "@shared/ui";

const TYPES: DocumentType[] = [
  "agreement",
  "ownership_certificate",
  "vaccination_certificate",
  "medical_report",
  "purchase_bill",
  "kyc",
  "other",
];

export default function DocumentsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const relatedGoat = route.params?.goatId as string | undefined;
  const relatedClient = route.params?.clientUserId as string | undefined;
  const title = route.params?.title as string | undefined;

  const hasPermission = useAuthStore((s) => s.hasPermission);
  const canManage = hasPermission("manage_documents");

  const { data, isLoading, refetch, isRefetching } = useDocuments({
    relatedGoat,
    relatedClient,
  });
  const [adding, setAdding] = useState(false);
  const docs = data?.data ?? [];

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
          <VStack gap={2} flex={1} style={{ marginLeft: 12 }}>
            <Text variant="overline" tone="tertiary">
              Records
            </Text>
            <Text variant="h1" tone="primary">
              {title || "Documents"}
            </Text>
          </VStack>
          <View style={{ width: 44 }} />
        </View>

        <FlatList
          data={docs}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
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
                <FileText
                  size={32}
                  color={palette.ink[300]}
                  strokeWidth={1.5}
                />
              </View>
              <Text variant="body" tone="tertiary">
                {isLoading ? "Loading..." : "No documents yet."}
              </Text>
            </VStack>
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => <DocRow doc={item} />}
        />

        {canManage && (
          <Fab
            onPress={() => setAdding(true)}
            icon={
              <Plus size={24} color={palette.text.inverse} strokeWidth={2.4} />
            }
          />
        )}
      </SafeAreaView>

      <AddDocModal
        visible={adding}
        onClose={() => setAdding(false)}
        relatedGoat={relatedGoat}
        relatedClient={relatedClient}
      />
    </View>
  );
}

function DocRow({ doc }: { doc: FarmDocument }) {
  return (
    <Card
      onPress={() => Linking.openURL(mediaUrl(doc.url))}
      elevation="raised"
      padded={false}
      style={styles.card}
    >
      <HStack gap={12} align="center">
        <View style={styles.icon}>
          <FileText size={20} color={palette.ink[700]} strokeWidth={1.8} />
        </View>
        <VStack gap={4} flex={1}>
          <Text variant="label-lg" tone="primary">
            {doc.title}
          </Text>
          <HStack gap={6} align="center">
            <StatusChip label={DOC_TYPE_LABEL[doc.type]} tone="neutral" />
            {doc.relatedGoat ? (
              <Text variant="caption" tone="tertiary">
                {doc.relatedGoat.name || doc.relatedGoat.goatId}
              </Text>
            ) : null}
          </HStack>
        </VStack>
        <ExternalLink size={18} color={palette.text.tertiary} />
      </HStack>
    </Card>
  );
}

function AddDocModal({
  visible,
  onClose,
  relatedGoat,
  relatedClient,
}: {
  visible: boolean;
  onClose: () => void;
  relatedGoat?: string;
  relatedClient?: string;
}) {
  const create = useCreateDocument();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("agreement");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (res.canceled || !res.assets?.[0]) return;
    setUploading(true);
    try {
      const u = await uploadImage(res.assets[0].uri);
      setUrl(u);
    } catch {
      // ignore
    } finally {
      setUploading(false);
    }
  };

  const submit = () => {
    if (!title.trim() || !url) return;
    create.mutate(
      {
        title: title.trim(),
        type,
        url,
        relatedGoat: relatedGoat || null,
        relatedClient: relatedClient || null,
      },
      {
        onSuccess: () => {
          setTitle("");
          setUrl("");
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.sheetBackdrop}>
        <View style={styles.sheet}>
          <HStack justify="space-between" align="center">
            <Text variant="h3" tone="primary">
              Upload document
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <X size={22} color={palette.text.tertiary} />
            </Pressable>
          </HStack>

          <Text
            variant="label"
            tone="secondary"
            style={{ marginTop: 16, marginBottom: 8 }}
          >
            Type
          </Text>
          <View style={styles.wrapRow}>
            {TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[styles.chip, type === t && styles.chipActive]}
              >
                <Text
                  variant="label"
                  style={{
                    color:
                      type === t
                        ? palette.text.inverse
                        : palette.text.secondary,
                  }}
                >
                  {DOC_TYPE_LABEL[t]}
                </Text>
              </Pressable>
            ))}
          </View>

          <VStack gap={14} style={{ marginTop: 16 }}>
            <TextField
              label="Title"
              placeholder="e.g. Signed agreement"
              value={title}
              onChangeText={setTitle}
            />
            <Pressable style={styles.uploadBtn} onPress={pick}>
              {uploading ? (
                <ActivityIndicator size="small" color={palette.ink[700]} />
              ) : (
                <Upload size={18} color={palette.ink[700]} />
              )}
              <Text variant="label-lg" tone="primary">
                {url ? "File attached ✓" : "Attach file / photo"}
              </Text>
            </Pressable>
            <Button
              label="Save document"
              size="lg"
              loading={create.isPending}
              disabled={!title.trim() || !url}
              onPress={submit}
            />
          </VStack>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
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
  card: { padding: 16 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: palette.ink[50],
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(10,30,16,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: palette.surface.primary,
    borderTopLeftRadius: radius["2xl"],
    borderTopRightRadius: radius["2xl"],
    padding: 24,
    paddingBottom: 40,
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
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: palette.border.strong,
    backgroundColor: palette.surface.secondary,
  },
});
