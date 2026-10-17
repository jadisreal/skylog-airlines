import { StyleSheet } from "react-native";

export const colors = {
  bg: "#0B1220",
  card: "#162032",
  border: "#24324A",
  text: "#E5E7EB",
  muted: "#94A3B8",
  accent: "#38BDF8",
  danger: "#F87171",
  success: "#34D399",
};

export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 24 },
  card: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 16 },
  title: { color: colors.text, fontSize: 18, fontWeight: "700" },
  text: { color: colors.text, fontSize: 16 },
  muted: { color: colors.muted, fontSize: 14 },
  error: { color: colors.danger, fontSize: 14 },
  button: { minHeight: 48, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  buttonText: { color: colors.bg, fontSize: 16, fontWeight: "700" },
});

export function StatusBadgeStyle(active: boolean) {
  return {
    alignSelf: "flex-start" as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: active ? "#064E3B" : "#3F1D1D",
    color: active ? colors.success : colors.danger,
    fontSize: 13,
    fontWeight: "700" as const,
    overflow: "hidden" as const,
  };
}
