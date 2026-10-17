import { useCallback, useLayoutEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Airline, listAirlines } from "../api/airlines";
import { colors, StatusBadgeStyle, ui } from "../theme";
import type { ScreenProps } from "../navigation";

export default function AirlineList({ navigation }: ScreenProps<"AirlineList">) {
  const [items, setItems] = useState<Airline[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await listAirlines());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load airlines");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate("AirlineForm", {})}
          accessibilityRole="button"
          accessibilityLabel="Add airline"
          hitSlop={8}
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: colors.accent, fontSize: 30, lineHeight: 32 }}>+</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  if (loading) {
    return <View style={ui.center}><ActivityIndicator size="large" color={colors.accent} /></View>;
  }

  if (error && items.length === 0) {
    return (
      <View style={ui.center}>
        <Text style={[ui.error, { textAlign: "center", marginBottom: 16 }]}>{error}</Text>
        <Pressable style={[ui.button, { backgroundColor: colors.accent }]} onPress={() => { setLoading(true); load(); }} accessibilityRole="button">
          <Text style={ui.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={ui.screen}
      contentContainerStyle={{ padding: 16, gap: 12, flexGrow: 1 }}
      data={items}
      keyExtractor={(a) => String(a.id)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} colors={[colors.accent]} />
      }
      ListHeaderComponent={error ? <Text style={ui.error}>{error}</Text> : undefined}
      ListEmptyComponent={
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={ui.muted}>No airlines yet. Tap + to add one.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate("AirlineDetail", { id: item.id })}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${item.status}`}
          style={({ pressed }) => [ui.card, { opacity: pressed ? 0.7 : 1, gap: 6 }]}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <Text style={[ui.title, { flex: 1 }]} numberOfLines={1}>{item.name}</Text>
            <Text style={StatusBadgeStyle(item.status === "Active")}>{item.status}</Text>
          </View>
          <Text style={[ui.text, { color: colors.accent, fontWeight: "600" }]}>{item.iata_code} / {item.icao_code}</Text>
          <Text style={ui.muted}>{item.country} · Hub {item.hub_airport}, {item.hub_city}</Text>
        </Pressable>
      )}
    />
  );
}
