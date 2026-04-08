import { View, Text, Pressable, StyleSheet } from "react-native";
import { THEME, FONTS } from "@/constants/theme";
import { getDrugById, getSolutionById } from "@/constants/drugs";
import { calculateDoseInUnit } from "@/constants/calculations";

interface PumpCardProps {
  pump: {
    _id: string;
    drugId: string;
    dilutionId: string;
    flowRate: number;
    weight?: number;
    isRunning: boolean;
  };
  onPress: () => void;
}

export function PumpCard({ pump, onPress }: PumpCardProps) {
  const drug = getDrugById(pump.drugId);
  const solution = getSolutionById(pump.dilutionId);
  const dose = calculateDoseInUnit(
    pump.flowRate,
    solution.concentration_mcg_per_mL,
    pump.weight ?? 70,
    drug.doseUnit
  );

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.drugName}>{drug.name}</Text>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: pump.isRunning ? THEME.ledActive : THEME.ledInactive },
          ]}
        />
      </View>
      <Text style={styles.solution}>{solution.label}</Text>
      <View style={styles.row}>
        <Text style={styles.value}>
          {pump.flowRate.toFixed(1)} mL/h
        </Text>
        <Text style={styles.dose}>
          {dose.toFixed(2)} {drug.doseUnit}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: THEME.inputBorder,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  drugName: {
    fontFamily: FONTS.lcd,
    fontSize: 18,
    color: THEME.lcdTextAccent,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  solution: {
    fontFamily: FONTS.label,
    fontSize: 11,
    color: THEME.lcdTextDim,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  value: {
    fontFamily: FONTS.lcd,
    fontSize: 16,
    color: "#ffffff",
  },
  dose: {
    fontFamily: FONTS.lcd,
    fontSize: 16,
    color: THEME.accent,
  },
});
