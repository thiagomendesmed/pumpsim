import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useTheme } from "@/hooks/useThemeContext";
import { FONTS } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { DRUGS } from "@/constants/drugs";
import { Drug, DrugCategory } from "@/types";

const CATEGORY_ORDER: DrugCategory[] = [
  "vasopressor",
  "sedation",
  "analgesic",
  "neuromuscular_blocker",
  "vasodilator",
];

const CATEGORY_LABELS: Record<DrugCategory, string> = {
  vasopressor: "VASOPRESSORES",
  sedation: "SEDACAO",
  analgesic: "ANALGESICOS",
  neuromuscular_blocker: "BNM",
  vasodilator: "VASODILATADORES",
};

export default function SolutionsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const [hospitalModalVisible, setHospitalModalVisible] = useState(false);
  const [newHospitalName, setNewHospitalName] = useState("");

  const hospitals = useQuery(
    api.hospitals.listHospitals,
    isAuthenticated ? {} : "skip"
  );
  const activeHospital = useQuery(
    api.hospitals.getActiveHospital,
    isAuthenticated ? {} : "skip"
  );
  const hospitalSolutions = useQuery(
    api.hospitalSolutions.listByHospital,
    activeHospital ? { hospitalId: activeHospital._id } : "skip"
  );

  const createHospital = useMutation(api.hospitals.createHospital);
  const setActiveHospital = useMutation(api.hospitals.setActiveHospital);
  const deleteHospital = useMutation(api.hospitals.deleteHospital);

  const handleCreateHospital = async () => {
    if (!newHospitalName.trim()) return;
    try {
      await createHospital({ name: newHospitalName.trim() });
      setNewHospitalName("");
      setHospitalModalVisible(false);
    } catch {
      Alert.alert(t("alert.error"), t("solutions.createFailed"));
    }
  };

  const handleDeleteHospital = () => {
    if (!activeHospital) return;
    Alert.alert(
      t("solutions.confirmDeleteTitle"),
      t("solutions.confirmDeleteMsg"),
      [
        { text: t("alert.cancel"), style: "cancel" },
        {
          text: t("alert.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteHospital({ hospitalId: activeHospital._id });
            } catch {
              Alert.alert(t("alert.error"), t("alert.deleteFailed"));
            }
          },
        },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.lockedContainer}>
          <Text style={[styles.lockedTitle, { color: colors.textPrimary }]}>
            {t("solutions.title")}
          </Text>
          <Text
            style={[styles.lockedDescription, { color: colors.textSecondary }]}
          >
            {t("solutions.loginRequired")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Group drugs by category for display
  const sections = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    drugs: DRUGS.filter((d) => d.category === cat),
  })).filter((s) => s.drugs.length > 0);

  const customSolutionsByDrug = new Map<string, number>();
  if (hospitalSolutions) {
    for (const sol of hospitalSolutions) {
      customSolutionsByDrug.set(
        sol.drugId,
        (customSolutionsByDrug.get(sol.drugId) ?? 0) + 1
      );
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.accent }]}>
          {t("solutions.title")}
        </Text>
        <Pressable
          style={[styles.addButton, { backgroundColor: colors.accent }]}
          onPress={() => setHospitalModalVisible(true)}
        >
          <Text style={[styles.addButtonText, { color: colors.background }]}>
            + HOSPITAL
          </Text>
        </Pressable>
      </View>

      {/* Hospital selector */}
      {hospitals && hospitals.length > 0 && (
        <View style={styles.hospitalBar}>
          {hospitals.map((h) => (
            <Pressable
              key={h._id}
              style={[
                styles.hospitalChip,
                {
                  backgroundColor: h.isActive
                    ? colors.accent
                    : colors.cardBackground,
                  borderColor: h.isActive
                    ? colors.accent
                    : colors.inputBorder,
                },
              ]}
              onPress={() => setActiveHospital({ hospitalId: h._id })}
              onLongPress={
                h.isActive ? handleDeleteHospital : undefined
              }
            >
              <Text
                style={[
                  styles.hospitalChipText,
                  {
                    color: h.isActive
                      ? colors.background
                      : colors.textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {h.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {!activeHospital ? (
        <View style={styles.emptyContainer}>
          <Text
            style={[styles.emptyText, { color: colors.textSecondary }]}
          >
            {t("solutions.empty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.category}
          contentContainerStyle={styles.list}
          renderItem={({ item: section }) => (
            <View>
              <Text
                style={[
                  styles.sectionHeader,
                  { color: colors.textMuted },
                ]}
              >
                {section.label}
              </Text>
              {section.drugs.map((drug) => (
                <DrugSolutionRow
                  key={drug.id}
                  drug={drug}
                  customCount={customSolutionsByDrug.get(drug.id) ?? 0}
                  colors={colors}
                />
              ))}
            </View>
          )}
        />
      )}

      {/* Create Hospital Modal */}
      <Modal
        visible={hospitalModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHospitalModalVisible(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          onPress={() => setHospitalModalVisible(false)}
        >
          <View
            style={[
              styles.modal,
              {
                backgroundColor: colors.pumpPanel,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.accent }]}>
              {t("solutions.newHospital")}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.textPrimary,
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                },
              ]}
              placeholder={t("solutions.hospitalPlaceholder")}
              placeholderTextColor={colors.textMuted}
              value={newHospitalName}
              onChangeText={setNewHospitalName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: colors.inputBorder,
                  },
                ]}
                onPress={() => setHospitalModalVisible(false)}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.textMuted },
                  ]}
                >
                  {t("modal.cancel")}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.accent },
                ]}
                onPress={handleCreateHospital}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.background },
                  ]}
                >
                  {t("modal.create")}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function DrugSolutionRow({
  drug,
  customCount,
  colors,
}: {
  drug: Drug;
  customCount: number;
  colors: any;
}) {
  return (
    <View
      style={[
        styles.drugRow,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.inputBorder,
        },
      ]}
    >
      <View style={styles.drugRowLeft}>
        <Text style={[styles.drugName, { color: colors.textPrimary }]}>
          {drug.name}
        </Text>
        <Text style={[styles.drugInfo, { color: colors.textMuted }]}>
          {drug.ampPresentation} — {drug.solutions.length} diluicoes — {drug.doseUnit}
        </Text>
      </View>
      <View style={styles.drugRowRight}>
        {drug.solutions.map((sol) => (
          <Text
            key={sol.id}
            style={[styles.dilutionTag, { color: colors.textSecondary }]}
          >
            {sol.dilutionType}
          </Text>
        ))}
        {customCount > 0 && (
          <View
            style={[
              styles.customBadge,
              { backgroundColor: colors.accent },
            ]}
          >
            <Text style={[styles.customBadgeText, { color: colors.background }]}>
              +{customCount}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontFamily: FONTS.title, fontSize: 12, letterSpacing: 1 },
  addButton: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  addButtonText: { fontFamily: FONTS.labelBold, fontSize: 11 },
  hospitalBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  hospitalChip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  hospitalChipText: { fontFamily: FONTS.label, fontSize: 12 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionHeader: {
    fontFamily: FONTS.title,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  drugRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  drugRowLeft: { flex: 1 },
  drugName: { fontFamily: FONTS.lcd, fontSize: 16 },
  drugInfo: { fontFamily: FONTS.label, fontSize: 11, marginTop: 2 },
  drugRowRight: { flexDirection: "row", gap: 4, alignItems: "center" },
  dilutionTag: { fontFamily: FONTS.label, fontSize: 10 },
  customBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  customBadgeText: { fontFamily: FONTS.labelBold, fontSize: 10 },
  emptyContainer: { alignItems: "center", marginTop: 80 },
  emptyText: {
    fontFamily: FONTS.label,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  lockedTitle: { fontFamily: FONTS.title, fontSize: 16, marginBottom: 12 },
  lockedDescription: {
    fontFamily: FONTS.label,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modal: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    width: "100%",
    maxWidth: 380,
  },
  modalTitle: {
    fontFamily: FONTS.title,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
  },
  input: {
    fontFamily: FONTS.label,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  modalButtons: { flexDirection: "row", gap: 10 },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  modalButtonText: { fontFamily: FONTS.labelBold, fontSize: 12 },
});
