import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAction } from "convex/react";
import { THEME, FONTS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

const MONTHLY_PRICE_ID = process.env.EXPO_PUBLIC_STRIPE_PRICE_MONTHLY ?? "";
const ANNUAL_PRICE_ID = process.env.EXPO_PUBLIC_STRIPE_PRICE_ANNUAL ?? "";

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { t } = useTranslation();
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const [loading, setLoading] = useState<"monthly" | "annual" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = useCallback(
    async (plan: "monthly" | "annual") => {
      setError(null);
      setLoading(plan);
      try {
        const priceId = plan === "monthly" ? MONTHLY_PRICE_ID : ANNUAL_PRICE_ID;
        if (!priceId) {
          throw new Error("Stripe price ID não configurado");
        }
        const origin = window.location.origin;
        const { url } = await createCheckoutSession({
          priceId,
          successUrl: `${origin}/?checkout=success`,
          cancelUrl: `${origin}/?checkout=cancelled`,
        });
        window.location.assign(url);
      } catch (e: any) {
        setError(e?.message ?? "Falha ao iniciar checkout");
        setLoading(null);
      }
    },
    [createCheckoutSession]
  );

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
                  {t("paywall.annual")} — R$ 97,00/ano
                </Text>
                <Text style={styles.priceText}>
                  {t("paywall.bestValue")} · 7 dias grátis
                </Text>
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => handlePurchase("monthly")}
              >
                <Text style={styles.secondaryButtonText}>
                  {t("paywall.monthly")} — R$ 19,70/mês
                </Text>
                <Text style={styles.trialText}>7 dias grátis</Text>
              </Pressable>
            </>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}
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
    fontSize: 15,
    color: "#0f0f1e",
  },
  priceText: {
    fontFamily: FONTS.label,
    fontSize: 11,
    color: "rgba(15,15,30,0.7)",
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
  trialText: {
    fontFamily: FONTS.label,
    fontSize: 10,
    color: THEME.lcdTextDim,
    marginTop: 2,
  },
  errorText: {
    fontFamily: FONTS.label,
    fontSize: 12,
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 8,
  },
  closeButton: { alignItems: "center", marginTop: "auto" },
  closeButtonText: {
    fontFamily: FONTS.label,
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
});
