import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import zh from './locales/zh.json';
import hi from './locales/hi.json';
import ar from './locales/ar.json';
import pt from './locales/pt.json';
import fr from './locales/fr.json';
import ru from './locales/ru.json';
import de from './locales/de.json';
import ja from './locales/ja.json';

const extensionResources = {
  en: {
    dashboard: {
      systemCalibration: "System Calibration",
      preferencesAndDiagnostics: "Preferences & Diagnostics",
      cloudSync: "Cloud Sync:",
      toneProfile: "Tone Profile:",
      nativeLang: "Native Lang:",
      experience: "Experience:",
      configureSystem: "Configure System",
      tweakAiModel: "Tweak Your AI Model Deliverables",
      tweakAiModelDesc: "Instantly adjust response formats, set translation overrides, review billing receipts, and secure offline databases in the Configuration hub.",
      accessConfiguration: "Access Configuration",
      tone: "TONE",
      lang: "LANG",
      level: "LEVEL"
    },
    common: {
      overviewDashboard: "Overview Dashboard",
      intelligenceCommand: "Intelligence Command",
      systemSettings: "System Settings",
      coreSectors: "Core Sectors"
    }
  },
  es: {
    dashboard: {
      systemCalibration: "Calibración del Sistema",
      preferencesAndDiagnostics: "Preferencias y Diagnósticos",
      cloudSync: "Sincronización:",
      toneProfile: "Perfil de Tono:",
      nativeLang: "Idioma Nativo:",
      experience: "Experiencia:",
      configureSystem: "Configurar Sistema",
      tweakAiModel: "Ajustar Entregables de IA",
      tweakAiModelDesc: "Ajuste formatos de respuesta, anule traducciones, revise recibos y proteja bases de datos en la Configuración.",
      accessConfiguration: "Acceder a Configuración",
      tone: "TONO",
      lang: "IDIOMA",
      level: "NIVEL"
    },
    common: {
      overviewDashboard: "Tablero de Visión General",
      intelligenceCommand: "Comando de Inteligencia",
      systemSettings: "Configuración del Sistema",
      coreSectors: "Sectores Principales"
    }
  },
  zh: {
    dashboard: {
      systemCalibration: "系统校准",
      preferencesAndDiagnostics: "首选项和诊断",
      cloudSync: "云端同步：",
      toneProfile: "语气配制：",
      nativeLang: "原生语言：",
      experience: "经验水平：",
      configureSystem: "配置系统",
      tweakAiModel: "微调 AI 模型输出物",
      tweakAiModelDesc: "在配置中心即时调整响应格式、设置翻译覆盖、查看账单收据并保护离线数据库安全。",
      accessConfiguration: "访问配置",
      tone: "语气",
      lang: "语言",
      level: "级别"
    },
    common: {
      overviewDashboard: "仪表板概述",
      intelligenceCommand: "智能控制",
      systemSettings: "系统设置",
      coreSectors: "核心模块"
    }
  },
  hi: {
    dashboard: {
      systemCalibration: "सिस्टम अंशांकन",
      preferencesAndDiagnostics: "प्राथमिकताएं और नैदानिक",
      cloudSync: "क्लाउड सिंक:",
      toneProfile: "टोन प्रोफाइल:",
      nativeLang: "मूल भाषा:",
      experience: "अनुभव:",
      configureSystem: "सिस्टम कॉन्फ़िगर करें",
      tweakAiModel: "अपने एआई मॉडल डिलिवरेबल्स को अनुकूलित करें",
      tweakAiModelDesc: "कॉन्फ़िगरेशन हब में तुरंत प्रतिक्रिया प्रारूपों को समायोजित करें, अनुवाद ओवरराइड सेट करें और सुरक्षित करें।",
      accessConfiguration: "प्रवेश विन्यास",
      tone: "टोन",
      lang: "भाषा",
      level: "स्तर"
    },
    common: {
      overviewDashboard: "अवलोकन डैशबोर्ड",
      intelligenceCommand: "इंटेलिजेंस कमांड",
      systemSettings: "सिस्टम सेटिंग्स",
      coreSectors: "प्रमुख क्षेत्र"
    }
  },
  ar: {
    dashboard: {
      systemCalibration: "معايرة النظام",
      preferencesAndDiagnostics: "التفضيلات والتشخيصات",
      cloudSync: "مزامنة السحابة:",
      toneProfile: "ملف النبرة:",
      nativeLang: "اللغة الأصلية:",
      experience: "الخبرة:",
      configureSystem: "تكوين النظام",
      tweakAiModel: "ضبط مخرجات نموذج الذكاء الاصطناعي",
      tweakAiModelDesc: "اضبط تنسيقات الاستجابة فورًا، وعين تجاوزات الترجمة، وراجع الفواتير في مركز التكوين.",
      accessConfiguration: "الوصول للتكوين",
      tone: "النبرة",
      lang: "اللغة",
      level: "المستوى"
    },
    common: {
      overviewDashboard: "لوحة التحكم العامة",
      intelligenceCommand: "قيادة الاستخبارات",
      systemSettings: "إعدادات النظام",
      coreSectors: "القطاعات الرئيسية"
    }
  },
  pt: {
    dashboard: {
      systemCalibration: "Calibração do Sistema",
      preferencesAndDiagnostics: "Preferências e Diagnósticos",
      cloudSync: "Sincronização Nuvem:",
      toneProfile: "Perfil de Tom:",
      nativeLang: "Idioma Nativo:",
      experience: "Experiência:",
      configureSystem: "Configurar Sistema",
      tweakAiModel: "Ajustar Resultados de IA",
      tweakAiModelDesc: "Ajuste formatos de resposta, substituições de tradução, faturas e bancos de dados no hub de Configuração.",
      accessConfiguration: "Acessar Configuração",
      tone: "TOM",
      lang: "IDIOMA",
      level: "NÍVEL"
    },
    common: {
      overviewDashboard: "Painel Geral",
      intelligenceCommand: "Comando de Inteligência",
      systemSettings: "Configurações do Sistema",
      coreSectors: "Setores Principais"
    }
  },
  fr: {
    dashboard: {
      systemCalibration: "Étalonnage du Système",
      preferencesAndDiagnostics: "Préférences & Diagnostics",
      cloudSync: "Synchro Cloud :",
      toneProfile: "Profil de Ton :",
      nativeLang: "Langue Maternelle :",
      experience: "Expérience :",
      configureSystem: "Configurer le Système",
      tweakAiModel: "Ajuster les Résultats de l'IA",
      tweakAiModelDesc: "Ajustez instantanément les formats de réponse, définissez des substitutions, examinez les factures et sécurisez les bases de données.",
      accessConfiguration: "Accéder à la Configuration",
      tone: "TON",
      lang: "LANGUE",
      level: "NIVEAU"
    },
    common: {
      overviewDashboard: "Tableau de Bord",
      intelligenceCommand: "Commande d'Intelligence",
      systemSettings: "Paramètres Système",
      coreSectors: "Secteurs Clés"
    }
  },
  ru: {
    dashboard: {
      systemCalibration: "Калибровка Системы",
      preferencesAndDiagnostics: "Настройки и Диагностика",
      cloudSync: "Облачная Синхронизация:",
      toneProfile: "Профиль Тона:",
      nativeLang: "Родной Язык:",
      experience: "Опыт:",
      configureSystem: "Настроить Систему",
      tweakAiModel: "Настроить Выдачу Модели ИИ",
      tweakAiModelDesc: "Мгновенно настраивайте форматы ответов, параметры перевода, просматривайте платежи и защищайте базы данных.",
      accessConfiguration: "Панель Управления",
      tone: "ТОН",
      lang: "ЯЗЫК",
      level: "УРОВЕНЬ"
    },
    common: {
      overviewDashboard: "Обзорная Панель",
      intelligenceCommand: "Интерфейс Команд",
      systemSettings: "Системные Настройки",
      coreSectors: "Основные Сектора"
    }
  },
  de: {
    dashboard: {
      systemCalibration: "Systemkalibrierung",
      preferencesAndDiagnostics: "Einstellungen & Diagnose",
      cloudSync: "Cloud-Synchronisierung:",
      toneProfile: "Tonprofil:",
      nativeLang: "Muttersprache:",
      experience: "Erfahrung:",
      configureSystem: "System Konfigurieren",
      tweakAiModel: "Feinabstimmung KI-Ausgaben",
      tweakAiModelDesc: "Passen Sie Antwortformate direkt an, überschreiben Sie Übersetzungen, prüfen Sie Rechnungen und sichern Sie Datenbanken.",
      accessConfiguration: "Konfiguration Aufrufen",
      tone: "TON",
      lang: "SPRACHE",
      level: "STUFE"
    },
    common: {
      overviewDashboard: "Übersicht Dashboard",
      intelligenceCommand: "Intelligenz-Kommando",
      systemSettings: "Systemeinstellungen",
      coreSectors: "Kernsektoren"
    }
  },
  ja: {
    dashboard: {
      systemCalibration: "システムキャリブレーション",
      preferencesAndDiagnostics: "設定と診断",
      cloudSync: "クラウド同期:",
      toneProfile: "トーンプロフィール:",
      nativeLang: "母国語:",
      experience: "経験値:",
      configureSystem: "システム構成",
      tweakAiModel: "AI出力の微調整",
      tweakAiModelDesc: "構成ハブで、応答フォーマットの調整、翻訳オーバーライドの設定、請求書の確認、データベースの保護を瞬時に行えます。",
      accessConfiguration: "構成にアクセス",
      tone: "トーン",
      lang: "言語",
      level: "レベル"
    },
    common: {
      overviewDashboard: "概要ダッシュボード",
      intelligenceCommand: "インテリジェンスコマンド",
      systemSettings: "システム設定",
      coreSectors: "コアセクター"
    }
  }
};

const mergeLocale = (base: any, extensions: any) => {
  return {
    ...base,
    dashboard: {
      ...base.dashboard,
      ...extensions?.dashboard
    },
    common: {
      ...base.common,
      ...extensions?.common
    }
  };
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: mergeLocale(en, extensionResources.en) },
      es: { translation: mergeLocale(es, extensionResources.es) },
      zh: { translation: mergeLocale(zh, extensionResources.zh) },
      hi: { translation: mergeLocale(hi, extensionResources.hi) },
      ar: { translation: mergeLocale(ar, extensionResources.ar) },
      pt: { translation: mergeLocale(pt, extensionResources.pt) },
      fr: { translation: mergeLocale(fr, extensionResources.fr) },
      ru: { translation: mergeLocale(ru, extensionResources.ru) },
      de: { translation: mergeLocale(de, extensionResources.de) },
      ja: { translation: mergeLocale(ja, extensionResources.ja) }
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // not needed for react as it escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
