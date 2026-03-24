import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations from their new, central location
import translationEN from './locales/en/common.json';
import translationDE from './locales/de/common.json';
import translationNL from './locales/nl/common.json';

i18n
  .use(LanguageDetector) // Detects user's browser language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: { common: translationEN },
      de: { common: translationDE },
      nl: { common: translationNL },
    },
    fallbackLng: 'en', // Use 'en' if detected language is not available
    debug: true, // Logs info to console, helpful for development
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    ns: ['common'], // The namespaces (files) to load
    defaultNS: 'common', // The default namespace to use
  });

export default i18n;