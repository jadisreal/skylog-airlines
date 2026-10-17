import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import AirlineList from "./src/screens/AirlineList";
import AirlineDetail from "./src/screens/AirlineDetail";
import AirlineForm from "./src/screens/AirlineForm";
import { colors } from "./src/theme";
import type { RootStackParamList } from "./src/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.card, text: colors.text, primary: colors.accent, border: colors.border },
};

export default function App() {
  return (
    <NavigationContainer theme={theme}>
      <StatusBar style="light" />
      <Stack.Navigator>
        <Stack.Screen name="AirlineList" component={AirlineList} options={{ title: "SkyLog Airlines" }} />
        <Stack.Screen name="AirlineDetail" component={AirlineDetail} options={{ title: "Airline" }} />
        <Stack.Screen name="AirlineForm" component={AirlineForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
