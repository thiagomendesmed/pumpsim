import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";
import { usePremium } from "@/hooks/usePremium";
import { PaywallModal } from "@/components/premium/PaywallModal";
import { PatientCard } from "@/components/patients/PatientCard";
import { AddPatientModal } from "@/components/patients/AddPatientModal";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function PatientsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const { isPremium, paywallVisible, showPaywall, hidePaywall } = usePremium();
  const { isAuthenticated } = useAuthStore();
  const [addModalVisible, setAddModalVisible] = useState(false);

  const patients = useQuery(api.patients.listPatients, isAuthenticated ? {} : "skip");

  if (!isAuthenticated || !isPremium) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.lockedContainer}>
          <Text style={[styles.lockEmoji, { color: colors.accent, backgroundColor: colors.cardBackground }]}>PRO</Text>
          <Text style={[styles.lockedTitle, { color: colors.textPrimary }]}>{t("patients.lockedTitle")}</Text>
          <Text style={[styles.lockedDescription, { color: colors.textSecondary }]}>{t("patients.lockedDescription")}</Text>
          <Pressable style={[styles.unlockButton, { backgroundColor: colors.accent }]} onPress={showPaywall}>
            <Text style={[styles.unlockButtonText, { color: colors.background }]}>{t("patients.unlockPremium")}</Text>
          </Pressable>
        </View>
        <PaywallModal visible={paywallVisible} onClose={hidePaywall} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.accent }]}>{t("patients.title")}</Text>
        <Pressable style={[styles.addButton, { backgroundColor: colors.accent }]} onPress={() => setAddModalVisible(true)}>
          <Text style={[styles.addButtonText, { color: colors.background }]}>{t("patients.newBed")}</Text>
        </Pressable>
      </View>

      <FlatList
        data={patients ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <PatientCard patient={item} onPress={() => router.push(`/patient/${item._id}`)} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t("patients.empty")}</Text>
          </View>
        }
      />

      <AddPatientModal visible={addModalVisible} onClose={() => setAddModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontFamily: FONTS.title, fontSize: 12, letterSpacing: 1 },
  addButton: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  addButtonText: { fontFamily: FONTS.labelBold, fontSize: 11 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: { fontFamily: FONTS.label, fontSize: 13, textAlign: "center", lineHeight: 20 },
  lockedContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  lockEmoji: { fontFamily: FONTS.title, fontSize: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, overflow: "hidden", marginBottom: 20 },
  lockedTitle: { fontFamily: FONTS.title, fontSize: 16, marginBottom: 12 },
  lockedDescription: { fontFamily: FONTS.label, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 32 },
  unlockButton: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  unlockButtonText: { fontFamily: FONTS.labelBold, fontSize: 14 },
});
