import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ptCommon from "@/locales/pt/common.json";
import ptDrugs from "@/locales/pt/drugs.json";
import enCommon from "@/locales/en/common.json";
import enDrugs from "@/locales/en/drugs.json";
import esCommon from "@/locales/es/common.json";
import esDrugs from "@/locales/es/drugs.json";

const LANG_KEY = "pumpsim_language";

const resources = {
  pt: { common: ptCommon, drugs: ptDrugs },
  en: { common: enCommon, drugs: enDrugs },
  es: { common: esCommon, drugs: esDrugs },
} as const;

const supportedLangs = Object.keys(resources);

async function getInitialLanguage(): Promise<string> {
  const stored = await AsyncStorage.getItem(LANG_KEY);
  if (stored && supportedLangs.includes(stored)) return stored;

  const deviceLang = Localization.getLocales()[0]?.languageCode ?? "pt";
  return supportedLangs.includes(deviceLang) ? deviceLang : "pt";
}

export async function initI18n() {
  const lng = await getInitialLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: "pt",
    defaultNS: "common",
    ns: ["common", "drugs"],
    interpolation: { escapeValue: false },
  });
}

export async function changeLanguage(lang: string) {
  await AsyncStorage.setItem(LANG_KEY, lang);
  await i18n.changeLanguage(lang);
}

export default i18n;
