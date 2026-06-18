import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  LayoutDashboard,
  Users,
  UserRound,
  PawPrint,
  ClipboardList,
  HeartPulse,
  ReceiptIndianRupee,
} from "lucide-react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@shared/store/useAuthStore";
import { palette } from "@shared/designSystem";

import DashboardScreen from "@modules/dashboard/screens/DashboardScreen";
import ProfileScreen from "@modules/profile/screens/ProfileScreen";
import TeamScreen from "@modules/team/screens/TeamScreen";
import AddUserScreen from "@modules/team/screens/AddUserScreen";
import ActivityLogScreen from "@modules/team/screens/ActivityLogScreen";
import GoatListScreen from "@modules/goat/screens/GoatListScreen";
import GoatProfileScreen from "@modules/goat/screens/GoatProfileScreen";
import RegisterGoatScreen from "@modules/goat/screens/RegisterGoatScreen";
import ScanGoatScreen from "@modules/goat/screens/ScanGoatScreen";
import TasksScreen from "@modules/task/screens/TasksScreen";
import AssignTaskScreen from "@modules/task/screens/AssignTaskScreen";
import TaskDetailScreen from "@modules/task/screens/TaskDetailScreen";
import HealthScreen from "@modules/health/screens/HealthScreen";
import GoatHealthScreen from "@modules/health/screens/GoatHealthScreen";
import AddHealthRecordScreen from "@modules/health/screens/AddHealthRecordScreen";
import InventoryListScreen from "@modules/inventory/screens/InventoryListScreen";
import InventoryItemScreen from "@modules/inventory/screens/InventoryItemScreen";
import AddInventoryItemScreen from "@modules/inventory/screens/AddInventoryItemScreen";
import StaffListScreen from "@modules/staff/screens/StaffListScreen";
import StaffProfileScreen from "@modules/staff/screens/StaffProfileScreen";
import AddStaffScreen from "@modules/staff/screens/AddStaffScreen";
import ClientListScreen from "@modules/client/screens/ClientListScreen";
import AddClientScreen from "@modules/client/screens/AddClientScreen";
import ClientProfileScreen from "@modules/client/screens/ClientProfileScreen";
import InvoicesScreen from "@modules/billing/screens/InvoicesScreen";
import PackagesScreen from "@modules/billing/screens/PackagesScreen";
import InvoiceDetailScreen from "@modules/billing/screens/InvoiceDetailScreen";
import MyBillsScreen from "@modules/billing/screens/MyBillsScreen";
import FinanceScreen from "@modules/finance/screens/FinanceScreen";
import SalesScreen from "@modules/sales/screens/SalesScreen";
import SellGoatScreen from "@modules/sales/screens/SellGoatScreen";
import NotificationsScreen from "@modules/notification/screens/NotificationsScreen";
import ReportsScreen from "@modules/reports/screens/ReportsScreen";
import DocumentsScreen from "@modules/document/screens/DocumentsScreen";

export type AppStackParamList = {
  MainTabs: undefined;
  AddUser: undefined;
  ActivityLog: undefined;
  GoatProfile: { id: string };
  RegisterGoat: undefined;
  ScanGoat: undefined;
  AssignTask: undefined;
  TaskDetail: { id: string };
  Health: undefined;
  GoatHealth: { id: string };
  AddHealthRecord: { goatId?: string } | undefined;
  Inventory: undefined;
  InventoryItem: { id: string };
  AddInventoryItem: undefined;
  Staff: undefined;
  StaffProfile: { id: string };
  AddStaff: undefined;
  ClientList: undefined;
  AddClient: undefined;
  ClientProfile: { userId: string };
  Invoices: undefined;
  Packages: undefined;
  InvoiceDetail: { id: string };
  Finance: undefined;
  Sales: undefined;
  SellGoat: { goatId?: string } | undefined;
  Notifications: undefined;
  Reports: undefined;
  Documents:
    | { goatId?: string; clientUserId?: string; title?: string }
    | undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<AppStackParamList>();

function MainTabs() {
  const role = useAuthStore((s) => s.user?.role);
  const canManageTeam = role === "owner" || role === "manager";
  const canSeeTasks = role !== "client"; // owner, manager, worker, vet
  const isVet = role === "vet";
  const isClient = role === "client";

  // Clear the Android/iOS system navigation bar so tab labels aren't
  // overlapped by it (same approach as the Doctor app's tab bar).
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.ink[900],
        tabBarInactiveTintColor: palette.text.tertiary,
        tabBarStyle: {
          backgroundColor: palette.surface.primary,
          borderTopColor: palette.border.default,
          height: 64 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tab.Screen
        name="Goats"
        component={GoatListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <PawPrint color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      {canSeeTasks && (
        <Tab.Screen
          name="Tasks"
          component={TasksScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <ClipboardList color={color} size={size} strokeWidth={2} />
            ),
          }}
        />
      )}
      {isVet && (
        <Tab.Screen
          name="HealthTab"
          component={HealthScreen}
          options={{
            title: "Health",
            tabBarIcon: ({ color, size }) => (
              <HeartPulse color={color} size={size} strokeWidth={2} />
            ),
          }}
        />
      )}
      {isClient && (
        <Tab.Screen
          name="Bills"
          component={MyBillsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <ReceiptIndianRupee color={color} size={size} strokeWidth={2} />
            ),
          }}
        />
      )}
      {canManageTeam && (
        <Tab.Screen
          name="Team"
          component={TeamScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Users color={color} size={size} strokeWidth={2} />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserRound color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddUser" component={AddUserScreen} />
      <Stack.Screen name="ActivityLog" component={ActivityLogScreen} />
      <Stack.Screen name="GoatProfile" component={GoatProfileScreen} />
      <Stack.Screen name="RegisterGoat" component={RegisterGoatScreen} />
      <Stack.Screen name="ScanGoat" component={ScanGoatScreen} />
      <Stack.Screen name="AssignTask" component={AssignTaskScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="Health" component={HealthScreen} />
      <Stack.Screen name="GoatHealth" component={GoatHealthScreen} />
      <Stack.Screen name="AddHealthRecord" component={AddHealthRecordScreen} />
      <Stack.Screen name="Inventory" component={InventoryListScreen} />
      <Stack.Screen name="InventoryItem" component={InventoryItemScreen} />
      <Stack.Screen
        name="AddInventoryItem"
        component={AddInventoryItemScreen}
      />
      <Stack.Screen name="Staff" component={StaffListScreen} />
      <Stack.Screen name="StaffProfile" component={StaffProfileScreen} />
      <Stack.Screen name="AddStaff" component={AddStaffScreen} />
      <Stack.Screen name="ClientList" component={ClientListScreen} />
      <Stack.Screen name="AddClient" component={AddClientScreen} />
      <Stack.Screen name="ClientProfile" component={ClientProfileScreen} />
      <Stack.Screen name="Invoices" component={InvoicesScreen} />
      <Stack.Screen name="Packages" component={PackagesScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
      <Stack.Screen name="Finance" component={FinanceScreen} />
      <Stack.Screen name="Sales" component={SalesScreen} />
      <Stack.Screen name="SellGoat" component={SellGoatScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
    </Stack.Navigator>
  );
}
