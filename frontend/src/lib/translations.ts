interface LanguageTranslations {
  [key: string]: string;
}

interface Translations {
  [locale: string]: LanguageTranslations;
}

const translations: Translations = {
  en: {
    "homepage.title": "inet-ip.info",
    "homepage.description": "Check your current IP address",
    "homepage.welcome": `This website is a web service that allows you to check your current IP address. It is a web service written in the Go language, and
        its source code is publicly available on <a href="https://github.com/inet-ip-info/website/" class="link-underline-primary">GitHub</a
        >. This service is particularly useful for individuals and developers who need to quickly determine their public IP address for
        various network tasks, troubleshooting, or development purposes.`,
    "homepage.time": "The current time is: {{time}}",
  },
  ja: {
    "homepage.title": "inet-ip.info",
    "homepage.welcome": `This website is a web service that allows you to check your current IP address. It is a web service written in the Go language, and
        its source code is publicly available on <a href="https://github.com/inet-ip-info/website/" class="link-underline-primary">GitHub</a
        >. This service is particularly useful for individuals and developers who need to quickly determine their public IP address for
        various network tasks, troubleshooting, or development purposes.`,
    "homepage.time": "The current time is: {{time}}",
  },
};

export default translations;
