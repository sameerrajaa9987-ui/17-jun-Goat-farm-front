/**
 * RootNavigator — gates between the auth stack and the role-aware app stack.
 * The only post-login gate is email verification (skipped for staff accounts
 * created by an Owner/Manager, which are pre-verified).
 */
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "@shared/store/useAuthStore";
import { palette } from "@shared/designSystem";
import AuthNavigator from "@navigation/AuthNavigator";
import AppNavigator from "@navigation/AppNavigator";
import EmailVerificationScreen from "@modules/auth/screens/EmailVerificationScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, isHydrated, isAuthChecked, user } = useAuthStore();

  useEffect(() => {
    if (isHydrated) useAuthStore.getState().initializeAuth();
  }, [isHydrated]);

  if (!isHydrated || !isAuthChecked) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: palette.surface.secondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={palette.ink[900]} />
      </View>
    );
  }

  const requiresEmailVerification =
    isAuthenticated && Boolean(user) && !user?.emailVerified;

  return (
    <Stack.Navigator
      key={
        !isAuthenticated
          ? "auth-root"
          : requiresEmailVerification
            ? "verify-gate"
            : "app-root"
      }
      screenOptions={{ headerShown: false }}
    >
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : requiresEmailVerification ? (
        <Stack.Screen
          name="EmailVerificationGate"
          component={EmailVerificationScreen}
          initialParams={{ email: user?.email }}
        />
      ) : (
        <Stack.Screen name="App" component={AppNavigator} />
      )}
    </Stack.Navigator>
  );
}
