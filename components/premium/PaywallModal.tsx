import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { THEME, FONTS } from "@/constants/theme";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import RevenueCatUI from "react-native-purchases-ui";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { t } = useTranslation();
  const { restorePurchases, checkStatus } = useSubscriptionStore();
  const [showNativePaywall, setShowNativePaywall] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleNativePaywallDismiss = useCallback(() => {
    // Refresh subscription status after paywall closes
    checkStatus();
    onClose();
  }, [checkStatus, onClose]);

  // Try native RevenueCat paywall first
  if (visible && showNativePaywall) {
    return (
      <RevenueCatUI.Paywall
        onDismiss={handleNativePaywallDismiss}
        onRestoreCompleted={() => {
          checkStatus();
        }}
        onPurchaseCompleted={() => {
          checkStatus();
          onClose();
        }}
        onPurchaseError={() => {
          Alert.alert(t("alert.error"), t("alert.purchaseFailed"));
        }}
      />
    );
  }

  // Fallback paywall (if native paywall not available)
  return (
    <FallbackPaywall
      visible={visible}
      onClose={onClose}
      loading={loading}
      setLoading={setLoading}
    />
  );
}

function FallbackPaywall({
  visible,
  onClose,
  loading,
  setLoading,
}: {
  visible: boolean;
  onClose: () => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const { purchaseMonthly, purchaseAnnual, restorePurchases } =
    useSubscriptionStore();

  const handlePurchase = async (type: "monthly" | "annual") => {
    setLoading(true);
    try {
      if (type === "monthly") await purchaseMonthly();
      else await purchaseAnnual();
      onClose();
    } catch (error: any) {
      if (!error.userCancelled) {
        Alert.alert(t("alert.error"), t("alert.purchaseFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      await restorePurchases();
      Alert.alert(t("alert.success"), t("alert.restoreSuccess"));
      onClose();
    } catch {
      Alert.alert(t("alert.error"), t("alert.restoreFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.badge}>{t("paywall.badge")}</Text>
          <Text style={styles.title}>{t("paywall.title")}</Text>
          <Text style={styles.subtitle}>{t("paywall.subtitle")}</Text>
        </View>

        <View style={styles.features}>
          <FeatureItem text={t("paywall.feature1")} />
          <FeatureItem text={t("paywall.feature2")} />
          <FeatureItem text={t("paywall.feature3")} />
          <FeatureItem text={t("paywall.feature4")} />
        </View>

        <View style={styles.buttons}>
          {loading ? (
            <ActivityIndicator size="large" color={THEME.accent} />
          ) : (
            <>
              <Pressable
                style={styles.primaryButton}
                onPress={() => handlePurchase("annual")}
              >
                <Text style={styles.primaryButtonText}>
                  {t("paywall.annual")}
                </Text>
                <Text style={styles.priceText}>{t("paywall.bestValue")}</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => handlePurchase("monthly")}
              >
                <Text style={styles.secondaryButtonText}>
                  {t("paywall.monthly")}
                </Text>
              </Pressable>
              <Pressable style={styles.restoreButton} onPress={handleRestore}>
                <Text style={styles.restoreButtonText}>
                  {t("paywall.restore")}
                </Text>
              </Pressable>
            </>
          )}
        </View>

        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>{t("paywall.notNow")}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.featureCheck}>+</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: { alignItems: "center", marginBottom: 40 },
  badge: {
    fontFamily: FONTS.title,
    fontSize: 10,
    color: "#0f0f1e",
    backgroundColor: THEME.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.title,
    fontSize: 18,
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: FONTS.label,
    fontSize: 14,
    color: THEME.lcdTextDim,
    textAlign: "center",
    lineHeight: 20,
  },
  features: { gap: 16, marginBottom: 40 },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  featureCheck: {
    fontFamily: FONTS.lcd,
    fontSize: 20,
    color: THEME.accent,
    marginTop: -2,
  },
  featureText: {
    fontFamily: FONTS.label,
    fontSize: 13,
    color: "#ffffff",
    flex: 1,
    lineHeight: 18,
  },
  buttons: { gap: 12, marginBottom: 20 },
  primaryButton: {
    backgroundColor: THEME.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: FONTS.labelBold,
    fontSize: 16,
    color: "#0f0f1e",
  },
  priceText: {
    fontFamily: FONTS.label,
    fontSize: 11,
    color: "rgba(15,15,30,0.6)",
    marginTop: 4,
  },
  secondaryButton: {
    borderColor: THEME.accent,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontFamily: FONTS.label,
    fontSize: 14,
    color: THEME.accent,
  },
  restoreButton: { alignItems: "center", paddingVertical: 8 },
  restoreButtonText: {
    fontFamily: FONTS.label,
    fontSize: 12,
    color: THEME.lcdTextDim,
    textDecorationLine: "underline",
  },
  closeButton: { alignItems: "center", marginTop: "auto" },
  closeButtonText: {
    fontFamily: FONTS.label,
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
});
