#!/usr/bin/env node

/**
 * Translation Sync Script (Manual Mode)
 *
 * This script synchronizes translation keys from en.json to all other language files
 * WITHOUT automatic translation. Missing keys are copied with English values for
 * manual translation later.
 *
 * Usage:
 *   node scripts/sync-translations-manual.js [--dry-run]
 *
 * Options:
 *   --dry-run    Show what would be updated without making changes
 */

const fs = require('fs').promises;
const path = require('path');

// Language files to process
const LANGUAGE_FILES = [
  'ar.json', 'de.json', 'es.json', 'fa.json', 'fr.json',
  'hi.json', 'it.json', 'ja.json', 'ko.json', 'ms.json',
  'nl.json', 'pl.json', 'pt.json', 'ru.json', 'sv.json',
  'th.json', 'tr.json', 'vi.json', 'zh.json',
];

const DICTIONARY_PATH = path.join(__dirname, '../Dictionary');
const EN_JSON_PATH = path.join(DICTIONARY_PATH, 'en.json');
const DRY_RUN = process.argv.includes('--dry-run');

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

// Remove keys that don't exist in en.json
function removeExtraKeys(targetObj, sourceKeys) {
  const targetKeys = getAllKeys(targetObj);
  const sourceKeyPaths = new Set(sourceKeys.map(k => k.path));
  const keysToRemove = targetKeys.filter(k => !sourceKeyPaths.has(k.path));

  return keysToRemove;
}

// Main function
async function syncTranslations() {
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }

  console.log('🚀 Starting translation sync (Manual Mode)...\n');

  try {
    // Read en.json
    console.log('📖 Reading en.json...');
    const enContent = await fs.readFile(EN_JSON_PATH, 'utf-8');
    const enData = JSON.parse(enContent);
    const enKeys = getAllKeys(enData);

    console.log(`✅ Found ${enKeys.length} keys in en.json\n`);

    // Summary statistics
    const summary = {
      total: 0,
      updated: 0,
      upToDate: 0,
      errors: 0,
    };

    // Process each language file
    for (const fileName of LANGUAGE_FILES) {
      const langFilePath = path.join(DICTIONARY_PATH, fileName);
      summary.total++;

      console.log(`\n${'='.repeat(50)}`);
      console.log(`🌍 Processing ${fileName}`);
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

        // Find extra keys (not in en.json)
        const extraKeys = removeExtraKeys(langData, enKeys);

        if (missingKeys.length === 0 && extraKeys.length === 0) {
          console.log(`✅ No changes needed! ${fileName} is up to date.`);
          summary.upToDate++;
          continue;
        }

        // Show what will be changed
        if (missingKeys.length > 0) {
          console.log(`\n📝 Found ${missingKeys.length} missing keys:`);
          missingKeys.slice(0, 10).forEach(({ path }) => {
            console.log(`   + ${path}`);
          });
          if (missingKeys.length > 10) {
            console.log(`   ... and ${missingKeys.length - 10} more`);
          }
        }

        if (extraKeys.length > 0) {
          console.log(`\n🗑️  Found ${extraKeys.length} extra keys (will be kept):`);
          extraKeys.slice(0, 5).forEach(({ path }) => {
            console.log(`   • ${path}`);
          });
          if (extraKeys.length > 5) {
            console.log(`   ... and ${extraKeys.length - 5} more`);
          }
        }

        if (!DRY_RUN) {
          // Add missing keys with English values
          for (const { path, value } of missingKeys) {
            setNestedValue(langData, path, value);
          }

          // Write updated file (preserving order from en.json structure)
          const updatedContent = JSON.stringify(langData, null, '\t');
          await fs.writeFile(langFilePath, updatedContent, 'utf-8');

          console.log(`\n✅ Successfully updated ${fileName}`);
          summary.updated++;
        } else {
          console.log(`\n🔍 Would update ${fileName} (DRY RUN)`);
        }

      } catch (error) {
        console.error(`❌ Error processing ${fileName}:`, error.message);
        summary.errors++;
      }
    }

    // Print summary
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total files processed: ${summary.total}`);
    console.log(`Files updated: ${summary.updated}`);
    console.log(`Files already up to date: ${summary.upToDate}`);
    console.log(`Errors: ${summary.errors}`);

    if (DRY_RUN) {
      console.log(`\n💡 Run without --dry-run to apply changes`);
    } else {
      console.log(`\n🎉 Translation sync completed!`);
      console.log(`\n⚠️  Note: Missing keys have been filled with English values.`);
      console.log(`   Please translate them manually in each language file.`);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
syncTranslations().catch(console.error);
