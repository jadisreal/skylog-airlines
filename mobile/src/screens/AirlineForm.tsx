import { useLayoutEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { ApiError, AirlineInput, createAirline, FieldErrors, Status, updateAirline } from "../api/airlines";
import { colors, ui } from "../theme";
import type { ScreenProps } from "../navigation";

type Form = Record<"name" | "iata_code" | "icao_code" | "country" | "hub_airport" | "hub_city" | "founded_year" | "website", string> & { status: Status };

// Mirrors validate() in backend/api/airlines.php.
function validate(f: Form): FieldErrors {
  const e: FieldErrors = {};
  const year = new Date().getFullYear();
  (["name", "iata_code", "icao_code", "country", "hub_airport", "hub_city", "founded_year"] as const).forEach((k) => {
    if (!f[k].trim()) e[k] = "Required";
  });
  if (f.name.trim().length > 100) e.name = "Max 100 characters";
  if (f.country.trim().length > 60) e.country = "Max 60 characters";
  if (f.hub_city.trim().length > 60) e.hub_city = "Max 60 characters";
  if (!e.iata_code && !/^[A-Z0-9]{2}$/.test(f.iata_code.trim())) e.iata_code = "Must be 2 letters or digits";
  if (!e.icao_code && !/^[A-Z]{3}$/.test(f.icao_code.trim())) e.icao_code = "Must be 3 letters";
  if (!e.hub_airport && !/^[A-Z]{3}$/.test(f.hub_airport.trim())) e.hub_airport = "Must be 3 letters";
  const y = Number(f.founded_year.trim());
  if (!e.founded_year && (!/^\d{4}$/.test(f.founded_year.trim()) || y < 1900 || y > year)) e.founded_year = `Must be between 1900 and ${year}`;
  const w = f.website.trim();
  if (w && (w.length > 200 || !/^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]+$/i.test(w))) e.website = "Must be a valid http(s) URL";
  return e;
}

const FIELDS: { key: keyof Omit<Form, "status">; label: string; upper?: boolean; max?: number; numeric?: boolean; url?: boolean }[] = [
  { key: "name", label: "Name", max: 100 },
  { key: "iata_code", label: "IATA code (2)", upper: true, max: 2 },
  { key: "icao_code", label: "ICAO code (3)", upper: true, max: 3 },
  { key: "country", label: "Country", max: 60 },
  { key: "hub_airport", label: "Hub airport (3)", upper: true, max: 3 },
  { key: "hub_city", label: "Hub city", max: 60 },
  { key: "founded_year", label: "Founded year", numeric: true, max: 4 },
  { key: "website", label: "Website (optional)", url: true, max: 200 },
];

export default function AirlineForm({ navigation, route }: ScreenProps<"AirlineForm">) {
  const editing = route.params?.airline;
  const [form, setForm] = useState<Form>({
    name: editing?.name ?? "",
    iata_code: editing?.iata_code ?? "",
    icao_code: editing?.icao_code ?? "",
    country: editing?.country ?? "",
    hub_airport: editing?.hub_airport ?? "",
    hub_city: editing?.hub_city ?? "",
    founded_year: editing ? String(editing.founded_year) : "",
    status: editing?.status ?? "Active",
    website: editing?.website ?? "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: editing ? "Edit Airline" : "New Airline" });
  }, [navigation, editing]);

  const set = (k: keyof Form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;
    const body: AirlineInput = {
      name: form.name.trim(),
      iata_code: form.iata_code.trim(),
      icao_code: form.icao_code.trim(),
      country: form.country.trim(),
      hub_airport: form.hub_airport.trim(),
      hub_city: form.hub_city.trim(),
      founded_year: Number(form.founded_year),
      status: form.status,
      website: form.website.trim() || null,
    };
    setSaving(true);
    try {
      if (editing) await updateAirline(editing.id, body);
      else await createAirline(body);
      navigation.goBack();
    } catch (err) {
      setErrors(err instanceof ApiError && Object.keys(err.errors).length ? err.errors : { form: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  // Server errors keyed to fields we don't render (e.g. "body", "error") show at the bottom.
  const otherErrors = Object.entries(errors).filter(([k]) => !FIELDS.some((f) => f.key === k) && k !== "status");

  return (
    <KeyboardAvoidingView style={ui.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }} keyboardShouldPersistTaps="handled">
        {FIELDS.map((f) => (
          <View key={f.key}>
            <Text style={[ui.muted, { marginBottom: 6 }]}>{f.label}</Text>
            <TextInput
              value={form[f.key]}
              onChangeText={(v) => set(f.key, f.upper ? v.toUpperCase() : v)}
              autoCapitalize={f.upper ? "characters" : f.url ? "none" : "words"}
              autoCorrect={false}
              keyboardType={f.numeric ? "number-pad" : f.url ? "url" : "default"}
              maxLength={f.max}
              accessibilityLabel={f.label}
              placeholderTextColor={colors.muted}
              style={{
                minHeight: 48,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: errors[f.key] ? colors.danger : colors.border,
                borderRadius: 10,
                paddingHorizontal: 12,
                color: colors.text,
                fontSize: 16,
              }}
            />
            {errors[f.key] ? <Text style={[ui.error, { marginTop: 4 }]}>{errors[f.key]}</Text> : null}
          </View>
        ))}

        <View>
          <Text style={[ui.muted, { marginBottom: 6 }]}>Status</Text>
          <View style={{ flexDirection: "row", gap: 12 }} accessibilityRole="radiogroup">
            {(["Active", "Inactive"] as const).map((s) => {
              const on = form.status === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => set("status", s)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  style={[ui.button, { flex: 1, borderWidth: 1, borderColor: on ? colors.accent : colors.border, backgroundColor: on ? "#0C4A6E" : colors.card }]}
                >
                  <Text style={{ color: on ? colors.text : colors.muted, fontSize: 16, fontWeight: "600" }}>{s}</Text>
                </Pressable>
              );
            })}
          </View>
          {errors.status ? <Text style={[ui.error, { marginTop: 4 }]}>{errors.status}</Text> : null}
        </View>

        {otherErrors.map(([k, msg]) => <Text key={k} style={ui.error}>{msg}</Text>)}

        <Pressable
          onPress={submit}
          disabled={saving}
          accessibilityRole="button"
          style={[ui.button, { backgroundColor: colors.accent, opacity: saving ? 0.6 : 1, marginTop: 8 }]}
        >
          {saving ? <ActivityIndicator color={colors.bg} /> : <Text style={ui.buttonText}>{editing ? "Save Changes" : "Create Airline"}</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
