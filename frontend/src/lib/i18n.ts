import { derived, writable } from "svelte/store";
import translations from "./translations";
import type { TranslationKey } from "./translations";

const defaltLocale = "en";
export const locale = writable(defaltLocale);
export const locales = Object.keys(translations);

// Define the type for the translations
interface Translations {
  [key: string]: string;
}

// Define the type for the variables that can be used in translations
interface Vars {
  [key: string]: string;
}

const localStorageLocaleKey = "locale";
export const initLocate = () => {
  const storedLocale = localStorage.getItem(localStorageLocaleKey);
  if (storedLocale) {
    locale.set(storedLocale);
  } else {
    let loc = window.navigator.language.substring(0, 2);
    if (!translations.hasOwnProperty(loc)) {
      loc = defaltLocale;
    }
    locale.set(loc);
    localStorage.setItem(localStorageLocaleKey, loc);
  }
};

function translate(locale: string, key: TranslationKey, vars: Vars): string {
  if (!key) throw new Error("no key provided to $t()");
  if (!locale) throw new Error(`no translation for key "${key}"`);

  let text = translations[locale][key];
  if (!text) {
    text = translations[defaltLocale][key];
  }
  if (!text) throw new Error(`no translation found for ${locale}.${key}`);

  Object.keys(vars).map((k) => {
    const regex = new RegExp(`{{${k}}}`, "g");
    text = text.replace(regex, vars[k]);
  });

  return text;
}

export const t = derived(
  locale,
  ($locale) =>
    (key: TranslationKey, vars: Vars = {}) =>
      translate($locale, key, vars),
);
