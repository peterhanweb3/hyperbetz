import fs from "fs";
import path from "path";

// 1. Setup Folders & Locales
const DICT_DIR = path.resolve("./Dictionary");
const EN_FILE = path.join(DICT_DIR, "en.json");

const LOCALES = [
  "ar",
  "de",
  "es",
  "fa",
  "fr",
  "hi",
  "it",
  "ja",
  "ko",
  "ms",
  "nl",
  "pl",
  "pt",
  "ru",
  "sv",
  "th",
  "tr",
  "vi",
  "zh",
];

// 2. Safest Flatten Function
function flatten(obj, parent = "", res = {}) {
  for (let key in obj) {
    let propName = parent ? parent + "." + key : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      flatten(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
}

// 3. Safest Unflatten Function
function unflatten(obj) {
  let res = {};
  for (let key in obj) {
    let keys = key.split(".");
    let current = res;
    for (let i = 0; i < keys.length; i++) {
      let k = keys[i];
      if (i === keys.length - 1) {
        current[k] = obj[key];
      } else {
        current[k] = current[k] || {};
        current = current[k];
      }
    }
  }
  return res;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 4. Native Google Web Translator
async function translate(text, target) {
  // Agar English text khali hai toh sidha wapis bhej do
  if (!text || typeof text !== "string" || text.trim() === "") return text;

  // Variables protect karna (jaise {name})
  let vars = [];
  let safeText = text.replace(/\{[^}]+\}/g, (match) => {
    vars.push(match);
    return `__${vars.length - 1}__`;
  });

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${target}&dt=t&q=${encodeURIComponent(safeText)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    let translated = data[0].map((x) => x[0]).join("");

    // Variables wapas lagana
    vars.forEach((v, i) => {
      const regex = new RegExp(`_\\s*_\\s*${i}\\s*_\\s*_`, "g");
      translated = translated.replace(regex, v);
    });

    return translated.trim();
  } catch (e) {
    return null;
  }
}

// 5. Main Execution
async function run() {
  console.clear();
  console.log("=========================================");
  console.log("🚀 STARTING TRANSLATOR SCRIPT");
  console.log("=========================================\n");

  if (!fs.existsSync(EN_FILE)) {
    console.log("❌ ERROR: en.json not found!");
    return;
  }

  // Load Base English File
  const enData = JSON.parse(fs.readFileSync(EN_FILE, "utf8"));
  const flatEn = flatten(enData);
  const totalEnKeys = Object.keys(flatEn).length;

  console.log(`✅ Loaded en.json (${totalEnKeys} total keys found)`);

  for (const loc of LOCALES) {
    const locFile = path.join(DICT_DIR, `${loc}.json`);
    let flatLoc = {};

    if (fs.existsSync(locFile)) {
      try {
        flatLoc = flatten(JSON.parse(fs.readFileSync(locFile, "utf8")));
      } catch (e) {}
    }

    // Find Missing Keys (Ignore empty english keys)
    let missing = [];
    for (let [key, val] of Object.entries(flatEn)) {
      // BUG FIX: Ignore keys where English value itself is empty
      if (typeof val !== "string" || val.trim() === "") continue;

      if (
        !flatLoc.hasOwnProperty(key) ||
        flatLoc[key] === "" ||
        flatLoc[key] === null
      ) {
        missing.push({ key, val });
      }
    }

    if (missing.length === 0) {
      console.log(`\n✅ [${loc}] is fully synced. Skipping.`);
      continue;
    }

    console.log(`\n⏳ [${loc}]: Translating ${missing.length} missing keys...`);
    let updated = false;

    for (let i = 0; i < missing.length; i++) {
      let { key, val } = missing[i];
      process.stdout.write(`   [${i + 1}/${missing.length}] "${val}" `);

      let trans = await translate(val, loc);

      if (trans) {
        flatLoc[key] = trans;
        updated = true;
        console.log(`-> ✅ "${trans}"`);
      } else {
        flatLoc[key] = val; // Fallback to English
        updated = true;
        console.log(`-> ⚠️ FAILED (Kept English)`);
      }

      await sleep(1000); // 1 sec delay to prevent Google Ban
    }

    if (updated) {
      fs.writeFileSync(locFile, JSON.stringify(unflatten(flatLoc), null, 2));
      console.log(`💾 Saved ${loc}.json`);
    }
  }

  console.log("\n🎉 ALL DONE!");
}

run();
