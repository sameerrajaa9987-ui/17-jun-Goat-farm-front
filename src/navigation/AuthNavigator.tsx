import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import OnboardingScreen from "@modules/auth/screens/OnboardingScreen";
import LoginScreen from "@modules/auth/screens/LoginScreen";
import RegisterScreen from "@modules/auth/screens/RegisterScreen";
import ForgotPasswordScreen from "@modules/auth/screens/ForgotPasswordScreen";
import ResetPasswordScreen from "@modules/auth/screens/ResetPasswordScreen";
import EmailVerificationScreen from "@modules/auth/screens/EmailVerificationScreen";

export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string } | undefined;
  EmailVerification: { email?: string } | undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Onboarding"
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen
        name="EmailVerification"
        component={EmailVerificationScreen}
      />
    </Stack.Navigator>
  );
}
