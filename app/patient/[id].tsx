import { View, Text, StyleSheet, Pressable, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { THEME, FONTS } from "@/constants/theme";
import { PumpCard } from "@/components/patients/PumpCard";
import { AddPumpModal } from "@/components/patients/AddPumpModal";
import { useState } from "react";

export default function PatientDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [addPumpVisible, setAddPumpVisible] = useState(false);

  const patientId = id as Id<"patients">;
  const pumps = useQuery(api.pumps.listPumpsByPatient, { patientId });
  const deletePatient = useMutation(api.patients.deletePatient);
  const deletePump = useMutation(api.pumps.deletePump);

  const handleDeletePatient = () => {
    Alert.alert(t("patient.confirmDeleteTitle"), t("patient.confirmDeleteMsg"), [
      { text: t("alert.cancel"), style: "cancel" },
      {
        text: t("alert.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deletePatient({ patientId });
            router.back();
          } catch {
            Alert.alert(t("alert.error"), t("alert.deleteFailed"));
          }
        },
      },
    ]);
  };

  const handleDeletePump = (pumpId: Id<"pumps">) => {
    Alert.alert(t("patient.confirmDeletePumpTitle"), t("patient.confirmDeletePumpMsg"), [
      { text: t("alert.cancel"), style: "cancel" },
      {
        text: t("alert.remove"),
        style: "destructive",
        onPress: async () => {
          try {
            await deletePump({ pumpId });
          } catch {
            Alert.alert(t("alert.error"), t("alert.removeFailed"));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backButton}>{t("patient.back")}</Text>
        </Pressable>
        <Pressable onPress={handleDeletePatient}>
          <Text style={styles.deleteButton}>{t("patient.delete")}</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.addPumpButton} onPress={() => setAddPumpVisible(true)}>
          <Text style={styles.addPumpText}>{t("patient.newPump")}</Text>
        </Pressable>
      </View>

      <FlatList
        data={pumps ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PumpCard pump={item} onPress={() => handleDeletePump(item._id as Id<"pumps">)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t("patient.emptyPumps")}</Text>
          </View>
        }
      />

      <AddPumpModal visible={addPumpVisible} patientId={patientId} onClose={() => setAddPumpVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8,
  },
  backButton: { fontFamily: FONTS.label, fontSize: 14, color: THEME.lcdTextAccent },
  deleteButton: { fontFamily: FONTS.label, fontSize: 13, color: THEME.doseVeryHigh },
  actions: { paddingHorizontal: 20, paddingBottom: 12 },
  addPumpButton: { backgroundColor: THEME.accent, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  addPumpText: { fontFamily: FONTS.labelBold, fontSize: 12, color: "#0f0f1e" },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyContainer: { alignItems: "center", marginTop: 60 },
  emptyText: { fontFamily: FONTS.label, fontSize: 13, color: THEME.lcdTextDim, textAlign: "center", lineHeight: 20 },
});
