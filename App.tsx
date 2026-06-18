import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { StatusBar } from "expo-status-bar";
import { View, ActivityIndicator } from "react-native";

import RootNavigator from "@navigation/RootNavigator";
import { setupI18n } from "@modules/localization/i18n";
import { palette } from "@shared/designSystem";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

export default function App() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    setupI18n().finally(() => setI18nReady(true));
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <StatusBar style="dark" />
            {i18nReady ? (
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            ) : (
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
            )}
          </KeyboardProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
