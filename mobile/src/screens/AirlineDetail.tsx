import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Airline, deleteAirline, getAirline } from "../api/airlines";
import { getHubWeather, HubWeather } from "../api/weather";
import { colors, StatusBadgeStyle, ui } from "../theme";
import type { ScreenProps } from "../navigation";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, gap: 12 }}>
      <Text style={ui.muted}>{label}</Text>
      <Text style={[ui.text, { flexShrink: 1, textAlign: "right" }]}>{value}</Text>
    </View>
  );
}

function WeatherCard({ city }: { city: string }) {
  const [weather, setWeather] = useState<HubWeather | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setWeather(null);
    setError(null);
    getHubWeather(city)
      .then((w) => alive && setWeather(w))
      .catch((e) => alive && setError(e instanceof Error ? e.message : "Weather unavailable"));
    return () => { alive = false; };
  }, [city]);

  return (
    <View style={[ui.card, { marginTop: 16 }]}>
      <Text style={[ui.title, { marginBottom: 8 }]}>Hub Weather</Text>
      {error ? (
        <Text style={ui.error}>{error}</Text>
      ) : !weather ? (
        <ActivityIndicator color={colors.accent} accessibilityLabel="Loading weather" />
      ) : (
        <>
          <Row label="Location" value={`${weather.city}, ${weather.country}`} />
          <Row label="Condition" value={weather.condition} />
          <Row label="Temperature" value={`${weather.temperature} °C`} />
          <Row label="Humidity" value={`${weather.humidity} %`} />
          <Row label="Wind" value={`${weather.wind} km/h`} />
        </>
      )}
    </View>
  );
}

export default function AirlineDetail({ navigation, route }: ScreenProps<"AirlineDetail">) {
  const { id } = route.params;
  const [airline, setAirline] = useState<Airline | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reload on focus so edits show up after returning from the form.
  useFocusEffect(useCallback(() => {
    getAirline(id).then(setAirline).catch((e) => setError(e instanceof Error ? e.message : "Could not load airline"));
  }, [id]));

  const confirmDelete = () =>
    Alert.alert("Delete airline", `Delete ${airline?.name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAirline(id);
            navigation.popToTop();
          } catch (e) {
            Alert.alert("Delete failed", e instanceof Error ? e.message : "Please try again");
          }
        },
      },
    ]);

  if (error) return <View style={ui.center}><Text style={ui.error}>{error}</Text></View>;
  if (!airline) return <View style={ui.center}><ActivityIndicator size="large" color={colors.accent} /></View>;

  return (
    <ScrollView style={ui.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={ui.card}>
        <Text style={[ui.title, { fontSize: 22, marginBottom: 8 }]}>{airline.name}</Text>
        <Text style={StatusBadgeStyle(airline.status === "Active")}>{airline.status}</Text>
        <View style={{ marginTop: 8 }}>
          <Row label="IATA code" value={airline.iata_code} />
          <Row label="ICAO code" value={airline.icao_code} />
          <Row label="Country" value={airline.country} />
          <Row label="Hub airport" value={airline.hub_airport} />
          <Row label="Hub city" value={airline.hub_city} />
          <Row label="Founded" value={String(airline.founded_year)} />
          <Row label="Website" value={airline.website || "—"} />
          <Row label="Created" value={airline.created_at} />
          <Row label="Updated" value={airline.updated_at} />
        </View>
      </View>

      <WeatherCard city={airline.hub_city} />

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        <Pressable style={[ui.button, { flex: 1, backgroundColor: colors.accent }]} onPress={() => navigation.navigate("AirlineForm", { airline })} accessibilityRole="button">
          <Text style={ui.buttonText}>Edit</Text>
        </Pressable>
        <Pressable style={[ui.button, { flex: 1, backgroundColor: colors.danger }]} onPress={confirmDelete} accessibilityRole="button">
          <Text style={ui.buttonText}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
