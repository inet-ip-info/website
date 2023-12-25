import { derived, writable } from "svelte/store";
import translations from "./translations";

export const locale = writable("en");
export const locales = Object.keys(translations);

// Define the type for the translations
interface Translations {
  [key: string]: string;
}

// Define the type for the variables that can be used in translations
interface Vars {
  [key: string]: string;
}

function translate(locale: string, key: string, vars: Vars): string {
  if (!key) throw new Error("no key provided to $t()");
  if (!locale) throw new Error(`no translation for key "${key}"`);

  let text = translations[locale][key];

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
    (key: string, vars: Vars = {}) =>
      translate($locale, key, vars),
);
