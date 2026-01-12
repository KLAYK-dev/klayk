export type LanguageCode =
  | "uk"
  | "en"
  | "pl"
  | "de"
  | "fr"
  | "it"
  | "es"
  | "pt"
  | "ro"
  | "cs"
  | "sk"
  | "bg"
  | "hu"
  | "lt"
  | "lv"
  | "et";

export interface Language {
  code: LanguageCode;
  label: string; // Назва мовою інтерфейсу
  nativeLabel: string; // Назва мовою оригіналу (як бачить носій)
}

export const languages: Language[] = [
  { code: "uk", label: "Ukrainian", nativeLabel: "Українська" },
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "pl", label: "Polish", nativeLabel: "Polski" },
  { code: "de", label: "German", nativeLabel: "Deutsch" },
  { code: "fr", label: "French", nativeLabel: "Français" },
  { code: "it", label: "Italian", nativeLabel: "Italiano" },
  { code: "es", label: "Spanish", nativeLabel: "Español" },
  { code: "pt", label: "Portuguese", nativeLabel: "Português" },
  { code: "ro", label: "Romanian", nativeLabel: "Română" },
  { code: "cs", label: "Czech", nativeLabel: "Čeština" },
  { code: "sk", label: "Slovak", nativeLabel: "Slovenčina" },
  { code: "bg", label: "Bulgarian", nativeLabel: "Български" },
  { code: "hu", label: "Hungarian", nativeLabel: "Magyar" },
  { code: "lt", label: "Lithuanian", nativeLabel: "Lietuvių" },
  { code: "lv", label: "Latvian", nativeLabel: "Latviešu" },
  { code: "et", label: "Estonian", nativeLabel: "Eesti" },
];

export const defaultLanguage: LanguageCode = "uk";
