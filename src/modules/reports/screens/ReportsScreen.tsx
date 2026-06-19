import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Rect, Line } from "react-native-svg";
import {
  ChevronLeft,
  Download,
  FileSpreadsheet,
  Coins,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import { useOverview } from "@modules/reports/hooks/useReports";
import { reportsApi } from "@modules/reports/api/reportsApi";
import { MonthlyPoint } from "@modules/reports/types";
import { palette, radius, shadows } from "@shared/designSystem";
import {
  Text,
  VStack,
  HStack,
  Card,
  StatusChip,
  StatTile,
  GradientHero,
} from "@shared/ui";

export default function ReportsScreen() {
  const navigation = useNavigation<any>();
  const { data, isLoading } = useOverview();
  const [exporting, setExporting] = useState<string | null>(null);

  const doExport = async (type: "goats" | "sales" | "transactions") => {
    setExporting(type);
    try {
      await reportsApi.export(type);
    } finally {
      setExporting(null);
    }
  };

  if (isLoading || !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.ink[700]} />
      </View>
    );
  }

  const { farm, financial, operational } = data;

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
              Insights
            </Text>
            <Text variant="h1" tone="primary">
              Reports
            </Text>
          </VStack>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Financial headline — premium money surface */}
          <GradientHero variant={financial.net >= 0 ? "hero" : "clay"}>
            <Text
              variant="overline"
              style={{ color: "rgba(255,255,255,0.66)" }}
            >
              Net (all time)
            </Text>
            <Text variant="display-md" tone="inverse" style={{ marginTop: 4 }}>
              ₹{financial.net.toLocaleString("en-IN")}
            </Text>
            <HStack gap={16} style={{ marginTop: 6 }}>
              <Text
                variant="body-sm"
                style={{ color: "rgba(255,255,255,0.74)" }}
              >
                ₹{financial.income.toLocaleString("en-IN")} income
              </Text>
              <Text
                variant="body-sm"
                style={{ color: "rgba(255,255,255,0.74)" }}
              >
                ₹{financial.expense.toLocaleString("en-IN")} expense
              </Text>
            </HStack>
            <MonthlyChart data={financial.monthly} />
          </GradientHero>

          {/* Revenue mix */}
          <HStack gap={12} style={{ marginTop: 16 }}>
            <StatTile
              label="Ad Pali fees"
              value={`₹${(financial.adPaliIncome / 1000).toFixed(1)}k`}
              icon={Coins}
            />
            <StatTile
              label="Sales revenue"
              value={`₹${(financial.salesRevenue / 1000).toFixed(1)}k`}
              icon={TrendingUp}
            />
            <StatTile
              label="Outstanding"
              value={`₹${(financial.outstanding / 1000).toFixed(1)}k`}
              icon={Wallet}
            />
          </HStack>

          {/* Farm */}
          <Card elevation="raised" style={{ marginTop: 16 }}>
            <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
              Herd
            </Text>
            <View style={styles.grid}>
              <GridStat label="Total" value={farm.total} />
              <GridStat label="Active" value={farm.active} />
              <GridStat
                label="Sick"
                value={farm.sick}
                tone={farm.sick ? "danger" : undefined}
              />
              <GridStat label="Sold" value={farm.sold} />
              <GridStat label="Farm-owned" value={farm.farmOwned} />
              <GridStat label="Ad Pali" value={farm.adPali} />
              <GridStat label="Male" value={farm.male} />
              <GridStat label="Female" value={farm.female} />
            </View>
            {farm.byBreed.length > 0 && (
              <HStack gap={6} wrap style={{ marginTop: 12 }}>
                {farm.byBreed.map((b) => (
                  <StatusChip
                    key={b.breed}
                    label={`${b.breed}: ${b.count}`}
                    tone="neutral"
                  />
                ))}
              </HStack>
            )}
          </Card>

          {/* Operational */}
          <Card elevation="raised" style={{ marginTop: 16 }}>
            <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
              Operations
            </Text>
            <View style={styles.grid}>
              <GridStat label="Tasks today" value={operational.tasksToday} />
              <GridStat
                label="To approve"
                value={operational.awaitingApproval}
              />
              <GridStat label="Vaccinations" value={operational.vaccinations} />
              <GridStat label="Dewormings" value={operational.dewormings} />
              <GridStat
                label="Overdue health"
                value={operational.overdueHealth}
                tone={operational.overdueHealth ? "danger" : undefined}
              />
              <GridStat label="Active staff" value={operational.activeStaff} />
            </View>
          </Card>

          {/* Export */}
          <Card elevation="raised" style={{ marginTop: 16 }}>
            <Text variant="h4" tone="primary" style={{ marginBottom: 12 }}>
              Export (Excel / CSV)
            </Text>
            <VStack gap={10}>
              {(["goats", "sales", "transactions"] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => doExport(t)}
                  style={styles.exportRow}
                  disabled={!!exporting}
                >
                  <FileSpreadsheet size={18} color={palette.ink[700]} />
                  <Text variant="label-lg" tone="primary" style={{ flex: 1 }}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </Text>
                  {exporting === t ? (
                    <ActivityIndicator size="small" color={palette.ink[700]} />
                  ) : (
                    <Download size={18} color={palette.text.tertiary} />
                  )}
                </Pressable>
              ))}
            </VStack>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function MonthlyChart({ data }: { data: MonthlyPoint[] }) {
  if (!data || data.length === 0) return null;
  const width = Dimensions.get("window").width - 80;
  const height = 110;
  const pad = 6;
  const max = Math.max(1, ...data.map((d) => Math.max(d.income, d.expense)));
  const groupW = width / data.length;
  const barW = Math.min(14, groupW / 3);

  return (
    <View style={{ marginTop: 16 }}>
      <Svg width={width} height={height}>
        <Line
          x1={0}
          y1={height - pad}
          x2={width}
          y2={height - pad}
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1}
        />
        {data.map((d, i) => {
          const x = i * groupW + groupW / 2;
          const incH = ((height - pad * 2) * d.income) / max;
          const expH = ((height - pad * 2) * d.expense) / max;
          return (
            <React.Fragment key={d.month}>
              <Rect
                x={x - barW - 2}
                y={height - pad - incH}
                width={barW}
                height={incH}
                rx={3}
                fill={palette.ink[200]}
              />
              <Rect
                x={x + 2}
                y={height - pad - expH}
                width={barW}
                height={expH}
                rx={3}
                fill={palette.amber[300]}
              />
            </React.Fragment>
          );
        })}
      </Svg>
      <HStack gap={14} justify="center" style={{ marginTop: 6 }}>
        <Legend color={palette.ink[200]} label="Income" />
        <Legend color={palette.amber[300]} label="Expense" />
      </HStack>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <HStack gap={6} align="center">
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          backgroundColor: color,
        }}
      />
      <Text variant="caption" style={{ color: "rgba(255,255,255,0.74)" }}>
        {label}
      </Text>
    </HStack>
  );
}

function GridStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "danger";
}) {
  return (
    <View style={styles.gridStat}>
      <Text
        variant="h2"
        style={{
          color:
            tone === "danger" && value > 0
              ? palette.danger.text
              : palette.text.primary,
        }}
      >
        {value}
      </Text>
      <Text variant="caption" tone="tertiary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface.secondary,
  },
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
  grid: { flexDirection: "row", flexWrap: "wrap" },
  gridStat: { width: "25%", paddingVertical: 8 },
  exportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border.default,
    backgroundColor: palette.surface.secondary,
  },
});
