import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target locales paths
const localesDir = path.join(__dirname, '../src/i18n/locales');
const enFilePath = path.join(localesDir, 'en.json');

// Supported languages configuration
const LANGUAGES = ['es', 'zh', 'hi', 'ar', 'pt', 'fr', 'ru', 'de', 'ja'];

const LANGUAGE_NAMES: Record<string, string> = {
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
function flattenObject(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
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
function unflattenObject(flat: Record<string, string>): any {
  const result: any = {};
  for (const pathKey of Object.keys(flat)) {
    const parts = pathKey.split('.');
    let current = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = flat[pathKey];
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
 * Recursively find all tsx/ts files in src/
 */
function getSourceFiles(dir: string): string[] {
  const files: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'i18n' && file !== 'node_modules' && file !== 'dist') {
        files.push(...getSourceFiles(fullPath));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Parse JSX/TSX files and automatically extract key/default translation value pairs
 */
function extractTranslationKeysFromCode(): Record<string, string> {
  const srcDir = path.join(__dirname, '../src');
  const files = getSourceFiles(srcDir);
  const foundKeys: Record<string, string> = {};

  // Matches t("key", "default") or t('key') patterns
  // Pattern captures single/double quotes or backticks
  const tRegex = /t\s*\(\s*(['"`])(.*?)\1\s*(?:,\s*(['"`])(.*?)\3)?/g;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    tRegex.lastIndex = 0;
    while ((match = tRegex.exec(content)) !== null) {
      const key = match[2];
      const defaultValue = match[4] || key; // Default fallback to key itself if not specified
      
      // Dynamic variables shouldn't contain JS expressions/pluses/dollar signs unless literally a key path
      if (key && !key.includes('${') && !key.includes(' + ')) {
        // Humanize key path tail if no default is declared and it is a dotted slug path
        let val = defaultValue;
        if (!match[4] && key.includes('.')) {
          const parts = key.split('.');
          const last = parts[parts.length - 1];
          // Simple humanize: replace underscores/dashes with space and capitalize
          val = last.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }
        foundKeys[key] = val;
      }
    }
  }

  return foundKeys;
}

/**
 * Translate missing keys with the Gemini 3.5 API
 */
async function translateWithGemini(missingKeys: Record<string, string>, targetLangCode: string): Promise<Record<string, string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log(`ℹ️ [FALLBACK] No GEMINI_API_KEY detected. Using English values as fallback.`);
    return missingKeys;
  }

  const targetLangName = LANGUAGE_NAMES[targetLangCode] || targetLangCode;
  console.log(`🧠 [GEMINI MATRIX] Translating ${Object.keys(missingKeys).length} keys to ${targetLangName}...`);

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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Translate the following custom key-value content items to ${targetLangName}:\n\n${JSON.stringify(itemsToTranslate, null, 2)}`,
      config: {
        temperature: 0.2,
        systemInstruction: `You are an expert software localization interface. You translate JSON localized dictionaries into high-converting native language payloads. Translate all values in the provided JSON array to ${targetLangName}. Always maintain target slang, beautiful wording, and professional localized terminology. Make sure you return a strict JSON array matching the keys and translated values exactly! Maintain placeholders like {{count}} exactly. Do not wrap code in markdown delimiters.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              key: { type: "STRING" },
              value: { type: "STRING" }
            },
            required: ["key", "value"]
          }
        }
      }
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error(`Empty translation response for language ${targetLangCode}`);
    }

    const parsedArray = JSON.parse(textResult);
    const result: Record<string, string> = {};
    for (const item of parsedArray) {
      result[item.key] = item.value;
    }

    // Safety fallback
    for (const [k, v] of Object.entries(missingKeys)) {
      if (!result[k]) {
        result[k] = v;
      }
    }

    return result;
  } catch (error) {
    console.error(`💥 [GEMINI ERROR] Translation failed for ${targetLangCode}. Falling back to baseline.`, error);
    return missingKeys;
  }
}

async function main() {
  console.log(`🛡️  [CHIDON IQ AUTOMATED SYNC ENGINE] Resolving real-time translation dictionaries...`);

  // Ensure locales directory exists
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }

  // 1. Read existing en.json, or create default
  let existingEn: Record<string, string> = {};
  if (fs.existsSync(enFilePath)) {
    try {
      existingEn = flattenObject(JSON.parse(fs.readFileSync(enFilePath, 'utf8')));
    } catch (e) {
      console.warn("Could not read current en.json, creating fallback template.", e);
    }
  }

  // 2. Scan JSX/TSX codebase to AUTO-EXTRACT any missing translations!
  console.log(`🔍 Scanning codebase for t() calls...`);
  const codeKeys = extractTranslationKeysFromCode();
  console.log(`✨ Found ${Object.keys(codeKeys).length} unique translation entries from the JSX/TSX files.`);

  // 3. Merged Code Keys into en.json
  let hasChanges = false;
  for (const [key, val] of Object.entries(codeKeys)) {
    if (existingEn[key] === undefined) {
      console.log(`➕ [AUTO-ADD] Automatically registered key "${key}" into en.json with default: "${val}"`);
      existingEn[key] = val;
      hasChanges = true;
    }
  }

  if (hasChanges || !fs.existsSync(enFilePath)) {
    const nestedEn = unflattenObject(existingEn);
    fs.writeFileSync(enFilePath, JSON.stringify(nestedEn, null, 2) + '\n', 'utf8');
    console.log(`💾 Base English dictionary template synced to ${enFilePath}`);
  }

  // 4. Align and Translate all other supported locales
  for (const lang of LANGUAGES) {
    const langFilePath = path.join(localesDir, `${lang}.json`);
    let langJson: Record<string, string> = {};

    if (fs.existsSync(langFilePath)) {
      try {
        langJson = flattenObject(JSON.parse(fs.readFileSync(langFilePath, 'utf8')));
      } catch (e) {
        console.error(`Failed to parse current ${lang}.json file:`, e);
      }
    }

    const missingKeysMap: Record<string, string> = {};
    let missingCount = 0;

    for (const [key, value] of Object.entries(existingEn)) {
      if (langJson[key] === undefined || langJson[key] === '__NOT_TRANSLATED__' || langJson[key] === '') {
        missingKeysMap[key] = value;
        missingCount++;
      }
    }

    if (missingCount > 0) {
      console.log(`✏️ [ALIGNMENT] Locale [${lang}] has ${missingCount} missing keys. Initiating translations...`);
      const translations = await translateWithGemini(missingKeysMap, lang);

      for (const [key, val] of Object.entries(translations)) {
        langJson[key] = val;
      }

      const nestedLang = unflattenObject(langJson);
      fs.writeFileSync(langFilePath, JSON.stringify(nestedLang, null, 2) + '\n', 'utf8');
      console.log(`✅ [UPDATED] Language JSON file [${lang}.json] written successfully.`);
    } else {
      console.log(`✨ Language [${lang}] is 100% synchronized with the English baseline.`);
    }
  }

  console.log(`\n💖 [INTELLIGENCE SHIELDS] Complete localization suite synchronized perfectly without manual JSON edits.`);
}

main().catch((e) => {
  console.error("Critical Scanner Core Error:", e);
  process.exit(1);
});
