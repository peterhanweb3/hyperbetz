#!/usr/bin/env node

/**
 * Translation Sync Script
 *
 * This script synchronizes translation keys from en.json to all other language files.
 * It uses Google Translate API to translate missing keys automatically.
 *
 * Usage:
 *   node scripts/sync-translations.js
 *
 * Requirements:
 *   npm install @google-cloud/translate
 */

const fs = require('fs').promises;
const path = require('path');

// Language code mapping (file name to Google Translate language code)
const LANGUAGE_MAP = {
  'ar.json': 'ar',    // Arabic
  'de.json': 'de',    // German
  'es.json': 'es',    // Spanish
  'fa.json': 'fa',    // Persian/Farsi
  'fr.json': 'fr',    // French
  'hi.json': 'hi',    // Hindi
  'it.json': 'it',    // Italian
  'ja.json': 'ja',    // Japanese
  'ko.json': 'ko',    // Korean
  'ms.json': 'ms',    // Malay
  'nl.json': 'nl',    // Dutch
  'pl.json': 'pl',    // Polish
  'pt.json': 'pt',    // Portuguese
  'ru.json': 'ru',    // Russian
  'sv.json': 'sv',    // Swedish
  'th.json': 'th',    // Thai
  'tr.json': 'tr',    // Turkish
  'vi.json': 'vi',    // Vietnamese
  'zh.json': 'zh-CN', // Chinese Simplified
};

const DICTIONARY_PATH = path.join(__dirname, '../Dictionary');
const EN_JSON_PATH = path.join(DICTIONARY_PATH, 'en.json');

// Simple translation function using free translation (you can replace this with Google Translate API)
async function translateText(text, targetLang) {
  try {
    // Using a free translation API (MyMemory Translation API)
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200 || data.responseData) {
      return data.responseData.translatedText;
    }

    // Fallback: return original text if translation fails
    console.warn(`⚠️  Translation failed for "${text}" to ${targetLang}, keeping original`);
    return text;
  } catch (error) {
    console.error(`❌ Error translating "${text}":`, error.message);
    return text;
  }
}

// Add delay to avoid rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get all keys from a nested object
function getAllKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push({ path: fullKey, value });
    }
  }

  return keys;
}

// Set value in nested object using dot notation path
function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();

  let current = obj;
  for (const key of keys) {
    if (!(key in current)) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

// Get value from nested object using dot notation path
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (!(key in current)) {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

// Main function
async function syncTranslations() {
  console.log('🚀 Starting translation sync...\n');

  try {
    // Read en.json
    console.log('📖 Reading en.json...');
    const enContent = await fs.readFile(EN_JSON_PATH, 'utf-8');
    const enData = JSON.parse(enContent);
    const enKeys = getAllKeys(enData);

    console.log(`✅ Found ${enKeys.length} keys in en.json\n`);

    // Process each language file
    for (const [fileName, langCode] of Object.entries(LANGUAGE_MAP)) {
      const langFilePath = path.join(DICTIONARY_PATH, fileName);

      console.log(`\n${'='.repeat(50)}`);
      console.log(`🌍 Processing ${fileName} (${langCode})`);
      console.log('='.repeat(50));

      try {
        // Read existing language file
        const langContent = await fs.readFile(langFilePath, 'utf-8');
        const langData = JSON.parse(langContent);

        // Find missing keys
        const missingKeys = [];
        for (const { path, value } of enKeys) {
          const existingValue = getNestedValue(langData, path);
          if (existingValue === undefined) {
            missingKeys.push({ path, value });
          }
        }

        if (missingKeys.length === 0) {
          console.log(`✅ No missing keys! ${fileName} is up to date.`);
          continue;
        }

        console.log(`📝 Found ${missingKeys.length} missing keys`);
        console.log(`🔄 Translating keys to ${langCode}...\n`);

        // Translate and update missing keys
        let translatedCount = 0;
        for (const { path, value } of missingKeys) {
          // Skip if value contains variables like {name}, {amount}, etc.
          const hasVariables = /\{[^}]+\}/.test(value);

          let translatedValue;
          if (hasVariables) {
            console.log(`⏭️  Skipping translation for "${path}" (contains variables)`);
            translatedValue = value; // Keep original if it has variables
          } else {
            console.log(`  Translating: ${path}`);
            translatedValue = await translateText(value, langCode);
            await delay(500); // Delay to avoid rate limiting
          }

          setNestedValue(langData, path, translatedValue);
          translatedCount++;

          // Show progress every 10 translations
          if (translatedCount % 10 === 0) {
            console.log(`  Progress: ${translatedCount}/${missingKeys.length}`);
          }
        }

        // Write updated file
        const updatedContent = JSON.stringify(langData, null, '\t');
        await fs.writeFile(langFilePath, updatedContent, 'utf-8');

        console.log(`\n✅ Successfully updated ${fileName}`);
        console.log(`   Added ${missingKeys.length} keys`);

      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error.message);
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log('🎉 Translation sync completed!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
syncTranslations().catch(console.error);
