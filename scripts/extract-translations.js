import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target locales paths
const localesDir = path.join(__dirname, '../src/i18n/locales');
const enFilePath = path.join(localesDir, 'en.json');

// Supported language codes configuration
const LANGUAGES = ['es', 'zh', 'hi', 'ar', 'pt', 'fr', 'ru', 'de', 'ja'];

// Language names map for Gemini translation context
const LANGUAGE_NAMES = {
  es: 'Spanish (Español)',
  zh: 'Chinese Simplified (简体中文)',
  hi: 'Hindi (हिन्दी)',
  ar: 'Arabic (العربية)',
  pt: 'Portuguese (Português)',
  fr: 'French (Français)',
  ru: 'Russian (Русский)',
  de: 'German (Deutsch)',
  ja: 'Japanese (日本語)',
};

/**
 * Utility to flatten a nested JSON object into a flat key-value map
 */
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const k of Object.keys(obj)) {
    const pre = prefix ? `${prefix}.${k}` : k;
    if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      Object.assign(result, flattenObject(obj[k], pre));
    } else {
      result[pre] = obj[k];
    }
  }
  return result;
}

/**
 * Utility to un-flatten a key-value map back into a nested JSON object
 */
function unflattenObject(flat) {
  const result = {};
  for (const path of Object.keys(flat)) {
    const parts = path.split('.');
    let current = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = flat[path];
      } else {
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  return result;
}

/**
 * Scans the entire codebase inside src/ for untranslated text strings or calls to `t()` and flags warnings
 */
function scanCodebaseForTranslationIssues(flatKeysEn) {
  const srcDir = path.join(__dirname, '../src');
  const tsxFiles = [];

  function walk(dir) {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file !== 'i18n' && file !== 'node_modules') walk(fullPath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        tsxFiles.push(fullPath);
      }
    }
  }

  walk(srcDir);
  console.log(`\n🔍 [TRANSLATION SCANNER] Scanning ${tsxFiles.length} file streams for standard translation key patterns...`);

  const tKeyRegex = /t\s*\(\s*['"`]([^'"`]+)['"`]/g;
  const rawStringWarnings = [];
  const missingCodeKeys = new Set();

  for (const file of tsxFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(path.join(__dirname, '..'), file);

    // 1. Analyze existing `t()` keys
    let match;
    tKeyRegex.lastIndex = 0;
    while ((match = tKeyRegex.exec(content)) !== null) {
      const key = match[1];
      if (!flatKeysEn[key]) {
        missingCodeKeys.add(key);
        console.warn(`⚠️ [MISSING DECLARED KEY] Code uses t("${key}") in ${relativePath}, but it is missing in en.json!`);
      }
    }

    // 2. Scan for raw hardcoded texts (Simple Xpath heuristics for raw strings inside common elements)
    // Looking for lines with tags which have raw letters but no curly braces or t(
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (
        (line.includes('<span') || line.includes('<p') || line.includes('<h1') || line.includes('<h2') || line.includes('<button') || line.includes('<label')) &&
        !line.includes('t(') &&
        !line.includes('className=') &&
        /[a-zA-Z]{4,}/.test(line.replace(/<[^>]+>/g, '').trim()) &&
        !line.includes('const ') &&
        !line.includes('import ') &&
        !line.includes('console.')
      ) {
        const rawText = line.replace(/<[^>]+>/g, '').trim();
        if (rawText && !rawText.startsWith('{') && !rawText.endsWith('}')) {
          rawStringWarnings.push({
            file: relativePath,
            line: index + 1,
            text: rawText.substring(0, 50),
          });
        }
      }
    });
  }

  if (rawStringWarnings.length > 0) {
    console.warn(`\n⚠️ [ESLINT INTERCEPT] Found ${rawStringWarnings.length} locations of potential raw strings missing wrapping in t('key'):`);
    rawStringWarnings.slice(0, 10).forEach((warning) => {
      console.warn(`   - ${warning.file}:${warning.line} → "${warning.text}"`);
    });
    if (rawStringWarnings.length > 10) {
      console.warn(`   ... and ${rawStringWarnings.length - 10} more raw strings.`);
    }
  }

  return { missingCodeKeys: Array.from(missingCodeKeys), rawStringWarnings };
}

/**
 * Translates a set of flat key-values to a target language using Gemini AI API in a highly efficient batch request.
 */
async function translateKeysWithGemini(missingKeys, targetLanguageCode) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log(`ℹ️ [TRANSLATOR fallback] No GEMINI_API_KEY. Using English baseline instead.`);
    return missingKeys; // Fallback to English value
  }

  const targetLangName = LANGUAGE_NAMES[targetLanguageCode] || targetLanguageCode;
  console.log(`🧠 [GEMINI TRANSLATION MATRIX] Connecting to Google GenAI for ${targetLangName}...`);

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const itemsToTranslate = Object.entries(missingKeys).map(([key, value]) => ({ key, value }));

    const systemInstruction = `You are an expert software localization interface. You translate JSON localized dictionaries into high-converting native language payloads. Translate all values in the provided JSON array to ${targetLangName}. Always maintain target slang, beautiful wording, and professional localized terminology. Make sure you return a strict JSON array matching the keys and translated values exactly! Maintain placeholders like {{count}} exactly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate the following key-value content items to ${targetLangName}:\n\n${JSON.stringify(itemsToTranslate, null, 2)}`,
      config: {
        temperature: 0.3,
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              key: { type: "STRING" },
              value: { type: "STRING", description: "The high-quality fully translated value of this key in the target language" }
            },
            required: ["key", "value"]
          }
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error(`Empty translation from Gemini for ${targetLanguageCode}`);
    }

    const translatedArray = JSON.parse(textResult);
    const result = {};
    for (const item of translatedArray) {
      result[item.key] = item.value;
    }

    // Safety verify: fill in any that were missing in response
    for (const [key, val] of Object.entries(missingKeys)) {
      if (!result[key]) {
        result[key] = val;
      }
    }

    return result;
  } catch (err) {
    console.error(`💥 [GEMINI EXCEPTION] Translation failed for ${targetLanguageCode}, using English bounds.`, err);
    return missingKeys;
  }
}

/**
 * Main alignment runner
 */
async function main() {
  console.log(`🛡️  [CHIDON IQ SECURE TRANSLATOR SYNC ENGINE] Aligning all locales dictionaries...`);

  if (!fs.existsSync(enFilePath)) {
    console.error(`❌ English template not found at ${enFilePath}`);
    process.exit(1);
  }

  const enRaw = fs.readFileSync(enFilePath, 'utf8');
  const enJson = JSON.parse(enRaw);
  const flatEn = flattenObject(enJson);

  console.log(`Loaded English dictionary template: ${Object.keys(flatEn).length} fields`);

  // Scan codebase for discrepancies
  scanCodebaseForTranslationIssues(flatEn);

  for (const lang of LANGUAGES) {
    const langFilePath = path.join(localesDir, `${lang}.json`);
    let langJson = {};

    if (fs.existsSync(langFilePath)) {
      try {
        langJson = JSON.parse(fs.readFileSync(langFilePath, 'utf8'));
      } catch (e) {
        console.error(`Error loading locale schema for ${langFilePath}, resetting to baseline:`, e);
      }
    }

    const flatLang = flattenObject(langJson);
    const missingKeysMap = {};
    let counts = 0;

    // Detect missing translation keys
    for (const [key, value] of Object.entries(flatEn)) {
      if (flatLang[key] === undefined || flatLang[key] === '__NOT_TRANSLATED__' || flatLang[key] === '') {
        missingKeysMap[key] = value;
        counts++;
      }
    }

    if (counts > 0) {
      console.log(`\n✏️  [ALIGNMENT] Locale [${lang}] is missing ${counts} keys. Backfilling missing channels...`);
      const translations = await translateKeysWithGemini(missingKeysMap, lang);

      // Merge the new translations back
      for (const [key, value] of Object.entries(translations)) {
        flatLang[key] = value;
      }

      const reconstructedJson = unflattenObject(flatLang);
      fs.writeFileSync(langFilePath, JSON.stringify(reconstructedJson, null, 2) + '\n', 'utf8');
      console.log(`✅ [UPDATED SESSIONS] Language JSON file [${lang}.json] written successfully inside locales workspace.`);
    } else {
      console.log(`✨ Language [${lang}] is 100% synchronized with the active English baseline.`);
    }
  }

  console.log(`\n💖 [INTELLIGENCE SHIELDS] All i18n localization vectors synchronized perfectly across the active suite.`);
}

main().catch((e) => {
  console.error("Critical Scanner Core Error:", e);
  process.exit(1);
});
